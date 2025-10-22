import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

// Basic configuration
const PORT = Number(process.env.OTP_SERVER_PORT) || 4000;
const app: any = express();
app.use(cors());
app.use(express.json());

// OTP store (in-memory) and optional persistence file
interface OtpRecord { hash: string; expiresAt: number; attempts: number; }
const otpStore: Record<string, OtpRecord> = {};
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

// Email transporter (lazy init)
let transporter: any = null;
async function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT) {
    console.warn('[OTP] No SMTP configuration present - OTP codes will be logged to server console');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return transporter;
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

function cleanupExpired() {
  const now = Date.now();
  for (const key of Object.keys(otpStore)) {
    if (otpStore[key].expiresAt < now) delete otpStore[key];
  }
}
setInterval(cleanupExpired, 60 * 1000).unref();

app.get('/health', (_req: any, res: any) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.post('/auth/request-otp', async (req: any, res: any) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email required' });
    }

    const otp = generateOtp();
    const hash = hashOtp(otp);
    otpStore[email.toLowerCase()] = { hash, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 };

    // Attempt to send email
    try {
      const tx = await getTransporter();
      if (tx) {
        await tx.sendMail({
          from: process.env.OTP_EMAIL_FROM || 'no-reply@timebank.local',
          to: email,
          subject: 'Your TimeBank OTP Code',
          text: `Your OTP code is ${otp}. It expires in 5 minutes. If you did not request this, ignore this email.`,
        });
        console.log(`[OTP] Sent OTP to ${email}`);
      } else {
        console.log(`[OTP] Generated for ${email}: ${otp}`);
      }
    } catch (mailErr) {
      console.warn('[OTP] Failed to send email, logging instead');
      console.log(`[OTP] Generated for ${email}: ${otp}`);
    }

    res.json({ ok: true, expiresInSeconds: OTP_TTL_MS / 1000 });
  } catch (err: any) {
    console.error('request-otp error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/auth/verify-otp', async (req: any, res: any) => {
  try {
    const { email, otp, newPassword } = req.body || {};
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'email, otp, newPassword required' });
    }

    const entry = otpStore[email.toLowerCase()];
    if (!entry) return res.status(400).json({ error: 'OTP not requested or expired' });
    if (entry.expiresAt < Date.now()) {
      delete otpStore[email.toLowerCase()];
      return res.status(400).json({ error: 'OTP expired' });
    }
    if (entry.attempts >= MAX_ATTEMPTS) {
      delete otpStore[email.toLowerCase()];
      return res.status(400).json({ error: 'Too many attempts' });
    }
    entry.attempts++;

    const providedHash = hashOtp(otp);
    if (providedHash !== entry.hash) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP valid - consume it
    delete otpStore[email.toLowerCase()];

    // Update password depending on environment.
    // For now we'll just respond success; the frontend will call a separate endpoint / adapt to update via Firebase or mock store.
    // (Could integrate Firebase Admin SDK here if desired.)

    res.json({ ok: true });
  } catch (err: any) {
    console.error('verify-otp error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// AI mediator proxy (keeps API key on the server)
app.post('/api/ai/mediate', async (req: any, res: any) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY not configured on server' });
    }

    const { messages, serviceTitle, participants } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages (array of strings) required' });
    }

    const systemPrompt = `You are an assistant helping two people agree on clear, fair service terms before booking.
Respond concisely with a proposed summary including: scope, time estimate, credits/hour, total credits, location/online, and any prerequisites.
Be neutral and polite. Output only the proposal, no meta commentary.`;

    const userPrompt = `Context: ${serviceTitle ? `Service: ${serviceTitle}. ` : ''}${participants ? `Participants: ${participants.join(' & ')}. ` : ''}
Recent messages:
${messages.map((m: string, i: number) => `${i + 1}. ${m}`).join('\n')}

Please propose clear terms both can accept.`;

    // Call Groq Chat Completions API (OpenAI-compatible)
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 400,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('Groq API error:', resp.status, text);
      return res.status(500).json({ error: 'AI service error', status: resp.status });
    }
    const data = await resp.json() as any;
    const reply = data?.choices?.[0]?.message?.content || '';
    return res.json({ reply });
  } catch (err) {
    console.error('AI mediate error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`[OTP Server] Listening on port ${PORT}`);
});
