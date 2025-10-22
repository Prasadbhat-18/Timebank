import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Mail, Lock, Send } from 'lucide-react';
import { isFirebaseConfigured } from '../../firebase';
import { otpService } from '../../services/otpService';

interface ResetPasswordModalProps {
  onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ onClose }) => {
  const { resetPassword } = useAuth();
  const [step, setStep] = useState<'request' | 'otp' | 'set-new' | 'done'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpAvailable, setOtpAvailable] = useState<boolean | null>(null);
  // store expiry value only if needed for future UX; currently countdown handles display
  // const [otpExpiresIn, setOtpExpiresIn] = useState<number>(0);
  const [otpCountdown, setOtpCountdown] = useState<number>(0);

  const firebase = isFirebaseConfigured();

  useEffect(() => {
    let mounted = true;
    // Only check OTP backend if Firebase not configured
    if (!firebase) {
      otpService.isAvailable().then(av => { if (mounted) setOtpAvailable(av); });
    } else {
      setOtpAvailable(false); // force Firebase path
    }
    return () => { mounted = false; };
  }, [firebase]);

  useEffect(() => {
    if (otpCountdown <= 0) return; 
    const id = setInterval(() => setOtpCountdown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [otpCountdown]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!email.trim()) { setError('Email required'); return; }
    try {
      setLoading(true);
      if (firebase) {
        // Firebase email link reset has priority
        await resetPassword(email);
        setMessage('If this email is registered, a reset link has been sent.');
        setStep('done');
      } else if (otpAvailable) {
        // Use custom OTP backend two-step flow only when Firebase not configured
        const resp = await otpService.requestOtp(email);
        setMessage('OTP sent to your email (or logged on server).');
        setOtpCountdown(resp.expiresInSeconds);
        setStep('otp');
      } else {
        // Pure mock local reset
        setStep('set-new');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start reset');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!otp || otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    try {
      setLoading(true);
      await otpService.verifyOtp(email, otp, newPassword);
      setMessage('Password updated. You can now login.');
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally { setLoading(false); }
  };

  const handleSetNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    try {
      setLoading(true);
      await resetPassword(email, newPassword);
      setMessage('Password updated. You can now login.');
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-emerald-500 to-teal-600">
          <h3 className="text-white font-semibold text-lg">Reset Password</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">{error}</div>}
          {message && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded border border-emerald-200">{message}</div>}

          {step === 'request' && (
            <form onSubmit={handleRequest} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-11 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="you@example.com" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {firebase && 'We will send a reset link if the email exists.'}
                  {!firebase && otpAvailable === null && 'Checking OTP service...'}
                  {!firebase && otpAvailable === true && 'We will email an OTP code (or log it on the server if email not configured).'}
                  {!firebase && otpAvailable === false && 'Mock mode: you will set a new password directly.'}
                </p>
              </div>
              <button disabled={loading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                {firebase ? 'Send Reset Link' : otpAvailable ? 'Send OTP' : 'Continue'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/[^0-9]/g,''))} maxLength={6} required className="w-full pl-11 pr-4 py-2.5 tracking-widest text-center border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="123456" />
                  </div>
                  {otpCountdown > 0 && <p className="text-xs text-gray-500 mt-1">Expires in {otpCountdown}s</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full pl-11 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="••••••••" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full pl-11 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Repeat password" />
                  </div>
                </div>
              </div>
              <button disabled={loading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-5 h-5" />}
                Verify & Reset Password
              </button>
            </form>
          )}

          {step === 'set-new' && (
            <form onSubmit={handleSetNew} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full pl-11 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="••••••••" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full pl-11 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Repeat password" />
                </div>
              </div>
              <button disabled={loading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-5 h-5" />}
                Set New Password
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center space-y-4">
              <div className="text-emerald-600 font-medium">Done!</div>
              <p className="text-sm text-gray-600">You can now close this window and log in.</p>
              <button onClick={onClose} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
