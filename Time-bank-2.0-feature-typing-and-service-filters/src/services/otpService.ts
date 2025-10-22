const DEFAULT_BASE = (import.meta.env.VITE_OTP_SERVER_URL as string) || 'http://localhost:4000';

interface RequestOtpResponse { ok: boolean; expiresInSeconds: number; }
interface VerifyOtpResponse { ok: boolean; }

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${DEFAULT_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let msg = 'Request failed';
    try { const data = await res.json(); msg = data.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export const otpService = {
  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${DEFAULT_BASE}/health`, { method: 'GET' });
      if (!res.ok) return false;
      const data = await res.json();
      return data.status === 'ok';
    } catch { return false; }
  },
  async requestOtp(email: string): Promise<RequestOtpResponse> {
    return request<RequestOtpResponse>('/auth/request-otp', { body: JSON.stringify({ email }) });
  },
  async verifyOtp(email: string, otp: string, newPassword: string): Promise<VerifyOtpResponse> {
    return request<VerifyOtpResponse>('/auth/verify-otp', { body: JSON.stringify({ email, otp, newPassword }) });
  }
};
