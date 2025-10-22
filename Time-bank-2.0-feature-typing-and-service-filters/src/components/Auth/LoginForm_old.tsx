import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Clock, Lock, Mail, Phone, Timer } from 'lucide-react';
import { ResetPasswordModal } from './ResetPasswordModal';

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const { login, loginWithPhone, loginWithGoogle } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Parallax card tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = ((y - centerY) / centerY) * -5; // Max 5deg tilt
    const tiltY = ((x - centerX) / centerX) * 5;
    setCardTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setCardTilt({ x: 0, y: 0 });
  };

  const sendOTP = async (phoneNumber: string) => {
    if (!phoneNumber.trim()) return;
    
    setOtpLoading(true);
    setError('');
    
    // Simulate API delay
    setTimeout(() => {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOTP(otp);
      setOtpSent(true);
      setOtpLoading(false);
      
      // For demo purposes, we'll also set the verification code automatically after 2 seconds
      setTimeout(() => {
        setVerificationCode(otp);
      }, 2000);
    }, 1500);
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setOtpSent(false);
    setGeneratedOTP('');
    setVerificationCode('');
    setError('');
    
    // Auto-send OTP when phone number looks complete
    if (value.length >= 10) {
      sendOTP(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (loginMethod === 'email') {
        await login(email, password);
      } else {
        await loginWithPhone(phone, verificationCode);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => setShowReset(true);

  // --- Modern TimeBank Login: Simplified & Aesthetic ---
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" />
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 25% 25%, #00d4ff 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)',
        backgroundSize: '400px 400px'
      }} />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-bounce" />

      {/* Digital Clock - Clean & Compact */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-black/30 backdrop-blur-md px-6 py-3 rounded-2xl border border-cyan-400/30">
          <div className="text-center">
            <div className="text-2xl font-mono font-bold text-cyan-300 tracking-wider">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-xs text-cyan-400/70 mt-1">
              {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-20 w-full max-w-lg mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl mb-6 shadow-2xl">
            <Clock className="w-10 h-10 text-white" />
          </div>
          
          {/* Brand */}
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-3">
            TimeBank
          </h1>
          <p className="text-cyan-300 text-lg font-medium mb-2">Exchange Time, Not Money</p>
          <p className="text-slate-400 text-sm">Secure • Simple • Fair</p>
        </div>

        {/* Login Card */}
        <div 
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
          style={{
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 80px rgba(34, 211, 238, 0.1)'
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Animated Corner Lights */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        
          {/* Timebank Logo & Branding */}
          <div className="flex flex-col items-center mb-7 md:mb-9 relative z-10">
            {/* 3D Metallic Clock Logo */}
            <div className="relative mb-4">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-cyan-300 via-blue-500 to-indigo-700 rounded-full flex items-center justify-center shadow-2xl mb-3 relative border-4 border-cyan-400/60 transition-all hover:scale-110 duration-500 animate-float group"
                style={{
                  boxShadow: `
                    0 0 80px rgba(34, 211, 238, 0.7),
                    0 25px 50px rgba(0, 0, 0, 0.6),
                    inset 0 0 40px rgba(255, 255, 255, 0.25),
                    inset 0 -10px 30px rgba(0, 0, 0, 0.3)
                  `
                }}
              >
                <Clock className="w-12 h-12 md:w-14 md:h-14 text-white drop-shadow-2xl group-hover:animate-spin" style={{ animationDuration: '3s' }} />
                {/* Glowing pulse ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 animate-ping opacity-20" />
              </div>
              {/* Time Exchange Badge */}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 rounded-full flex items-center justify-center animate-pulse shadow-2xl border-3 border-white"
                style={{
                  boxShadow: '0 0 40px rgba(251, 146, 60, 0.9), 0 5px 20px rgba(0, 0, 0, 0.5)'
                }}
              >
                <Timer className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-lg" />
              </div>
            </div>

            {/* Brand Name - Metallic Text Effect */}
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-200 via-blue-300 to-cyan-400 bg-clip-text text-transparent mt-2 mb-3 tracking-tight text-center relative"
              style={{
                textShadow: '0 0 60px rgba(34, 211, 238, 0.6)',
                WebkitTextStroke: '1px rgba(34, 211, 238, 0.3)'
              }}
            >
              TIMEBANK
            </h1>

            {/* Tagline with Cyan Glow */}
            <div className="relative mb-3">
              <p className="text-cyan-300 text-base md:text-lg font-bold tracking-widest text-center relative z-10"
                style={{
                  textShadow: '0 0 20px rgba(34, 211, 238, 0.8), 0 0 40px rgba(34, 211, 238, 0.4)'
                }}
              >
                Exchange Time. Not Money.
              </p>
              {/* Underline Accent */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"
                style={{ boxShadow: '0 0 10px rgba(34, 211, 238, 0.6)' }}
              />
            </div>

            {/* Subtitle */}
            <p className="text-slate-300/70 text-xs md:text-sm text-center px-4">
              Barter your skills • Value through time ⏰
            </p>
          </div>

          {/* Error Message - 3D Enhanced */}
          {error && !error.includes('auth/api-key-not-valid') && (
            <div className="mb-5 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-red-900/40 to-orange-900/40 backdrop-blur-md border-2 border-red-400/60 rounded-2xl text-red-200 text-xs md:text-sm animate-shake flex items-start gap-2 md:gap-3 relative overflow-hidden"
              style={{
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.3), inset 0 0 20px rgba(239, 68, 68, 0.1)'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-600/10 to-transparent animate-pulse" />
              <div className="mt-0.5 flex-shrink-0 relative z-10">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-glow">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
              </div>
              <span className="flex-1 relative z-10 font-medium">{error}</span>
            </div>
          )}

          {/* Quick Demo Login Section - 3D Style */}
          <div className="mb-6 md:mb-8 p-5 md:p-6 bg-gradient-to-br from-cyan-900/30 via-blue-900/30 to-purple-900/30 border-2 border-cyan-400/40 rounded-2xl backdrop-blur-md relative overflow-hidden"
            style={{
              boxShadow: '0 0 40px rgba(34, 211, 238, 0.2), inset 0 0 30px rgba(34, 211, 238, 0.05)'
            }}
          >
            {/* Animated Corners */}
            <div className="absolute top-0 left-0 w-16 h-16 bg-cyan-400/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-purple-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
            
            <div className="text-center mb-5 md:mb-6 relative z-10">
              <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
                <div className="relative">
                  <Clock className="w-5 md:w-6 h-5 md:h-6 text-cyan-400 animate-spin" style={{animationDuration: '3s'}} />
                  <div className="absolute inset-0 animate-ping">
                    <Clock className="w-5 md:w-6 h-5 md:h-6 text-cyan-400/30" />
                  </div>
                </div>
                Quick Access
              </h3>
              <p className="text-sm md:text-base text-cyan-200/90 mt-2 font-semibold tracking-wide">Instant • Secure • Simple</p>
            </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 relative z-10">
            {/* Google Sign-In - 3D Enhanced */}
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                try {
                  await loginWithGoogle();
                } catch (err: any) {
                  setError(err.message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="relative overflow-hidden p-5 md:p-6 bg-gradient-to-br from-red-500/30 via-pink-500/30 to-rose-500/30 border-2 border-red-400/50 rounded-2xl hover:border-red-300 transition-all duration-300 group disabled:opacity-50 transform hover:scale-[1.02] active:scale-95 backdrop-blur-md min-h-[120px] touch-manipulation"
              style={{
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.2), 0 8px 20px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 50px rgba(239, 68, 68, 0.4), 0 12px 30px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.2), 0 8px 20px rgba(0, 0, 0, 0.3)';
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col items-center space-y-3 relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-400/30 to-pink-500/30 border-2 border-red-300/50 rounded-2xl flex items-center justify-center relative backdrop-blur-sm"
                  style={{
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {loading ? (
                    <div className="w-6 h-6 md:w-7 md:h-7 border-3 border-red-400/30 border-t-red-300 rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-red-100 font-black text-2xl md:text-3xl drop-shadow-glow">G</span>
                      <div className="absolute -top-1 -right-1 w-3 md:w-3.5 h-3 md:h-3.5 bg-gradient-to-br from-orange-400 to-red-500 rounded-full animate-pulse border border-white/50"
                        style={{ boxShadow: '0 0 10px rgba(251, 146, 60, 0.6)' }}
                      />
                    </>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-bold text-red-200 text-lg md:text-xl tracking-wide">Google OAuth</p>
                  <p className="text-xs md:text-sm text-red-300/90 mt-1 font-medium">Instant access</p>
                </div>
              </div>
            </button>
            {/* Demo User - 3D Enhanced */}
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                try {
                  await login('demo@timebank.com', 'demo123');
                } catch (err: any) {
                  setError(err.message);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="relative overflow-hidden p-5 md:p-6 bg-gradient-to-br from-cyan-500/30 via-blue-500/30 to-indigo-500/30 border-2 border-cyan-400/50 rounded-2xl hover:border-cyan-300 transition-all duration-300 group disabled:opacity-50 transform hover:scale-[1.02] active:scale-95 backdrop-blur-md min-h-[120px] touch-manipulation"
              style={{
                boxShadow: '0 0 30px rgba(34, 211, 238, 0.2), 0 8px 20px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 50px rgba(34, 211, 238, 0.4), 0 12px 30px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(34, 211, 238, 0.2), 0 8px 20px rgba(0, 0, 0, 0.3)';
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col items-center space-y-3 relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 border-2 border-cyan-300/50 rounded-2xl flex items-center justify-center relative backdrop-blur-sm"
                  style={{
                    boxShadow: '0 0 20px rgba(34, 211, 238, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {loading ? (
                    <div className="w-6 h-6 md:w-7 md:h-7 border-3 border-cyan-400/30 border-t-cyan-300 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Timer className="w-8 h-8 md:w-9 md:h-9 text-cyan-200 drop-shadow-glow" />
                      <div className="absolute -top-1 -right-1 w-3 md:w-3.5 h-3 md:h-3.5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full animate-pulse border border-white/50"
                        style={{ boxShadow: '0 0 10px rgba(74, 222, 128, 0.6)' }}
                      />
                    </>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-bold text-cyan-200 text-lg md:text-xl tracking-wide">Demo Mode</p>
                  <p className="text-xs md:text-sm text-cyan-300/90 mt-1 font-medium">Try it now</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Divider with Time - 3D Enhanced */}
        <div className="relative mb-6 md:mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
              style={{ boxShadow: '0 0 10px rgba(34, 211, 238, 0.3)' }}
            ></div>
          </div>
          <div className="relative flex justify-center text-sm md:text-base">
            <span className="px-4 md:px-5 py-1.5 bg-gradient-to-r from-slate-900/90 to-indigo-900/90 text-cyan-300 flex items-center gap-2 rounded-full border border-cyan-500/30 backdrop-blur-md font-semibold"
              style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)' }}
            >
              <Clock className="w-4 h-4 animate-pulse" />
              Or take your time
            </span>
          </div>
        </div>

        {/* Gmail Support Info - 3D Enhanced */}
        <div className="mb-6 md:mb-8 p-4 md:p-5 bg-gradient-to-br from-cyan-900/30 via-blue-900/30 to-slate-900/30 border-2 border-cyan-400/40 rounded-2xl backdrop-blur-md relative overflow-hidden"
          style={{
            boxShadow: '0 0 30px rgba(34, 211, 238, 0.15), inset 0 0 20px rgba(34, 211, 238, 0.05)'
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-2.5 text-cyan-300 relative z-10">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-400/30"
              style={{ boxShadow: '0 0 15px rgba(34, 211, 238, 0.3)' }}
            >
              <Mail className="w-4 md:w-4.5 h-4 md:h-4.5 animate-pulse" />
            </div>
            <span className="text-sm md:text-base font-bold tracking-wide">Gmail Integration</span>
            <div className="ml-auto text-xs md:text-sm text-cyan-400/80 font-mono px-2 py-1 bg-black/30 rounded border border-cyan-500/20">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </div>
          </div>
          <p className="text-xs md:text-sm text-cyan-200/90 mt-3 font-medium relative z-10">
            Any Gmail account • 6+ character password • Instant access
          </p>
        </div>

        {/* Login Form - 3D Enhanced */}
        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          <div className="flex bg-gradient-to-r from-slate-900/50 to-indigo-900/50 backdrop-blur-md rounded-xl p-1.5 mb-6 md:mb-7 border-2 border-cyan-500/30 relative overflow-hidden"
            style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.15), inset 0 0 15px rgba(34, 211, 238, 0.05)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5" />
            <button type="button" className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all text-sm md:text-base touch-manipulation font-semibold ${loginMethod === 'email' ? 'bg-gradient-to-br from-cyan-500/30 to-blue-600/30 text-cyan-200 border-2 border-cyan-400/50' : 'text-cyan-400/60 hover:text-cyan-300'}`}
              onClick={() => setLoginMethod('email')}
              style={loginMethod === 'email' ? { boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)' } : {}}
            >
              <Mail className="w-4 md:w-4.5 h-4 md:h-4.5" />Email
            </button>
            <button type="button" className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all text-sm md:text-base touch-manipulation font-semibold ${loginMethod === 'phone' ? 'bg-gradient-to-br from-cyan-500/30 to-blue-600/30 text-cyan-200 border-2 border-cyan-400/50' : 'text-cyan-400/60 hover:text-cyan-300'}`}
              onClick={() => setLoginMethod('phone')}
              style={loginMethod === 'phone' ? { boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)' } : {}}
            >
              <Phone className="w-4 md:w-4.5 h-4 md:h-4.5" />Phone
            </button>
          </div>
          {loginMethod === 'email' && (
            <>
              <div className="relative">
                <label htmlFor="email" className={`block text-sm md:text-base font-bold mb-2 md:mb-2.5 transition-colors tracking-wide ${focusedField === 'email' ? 'text-cyan-300' : 'text-cyan-400/80'}`}>Email Address</label>
                <div className="relative group">
                  <Mail className={`absolute left-4 md:left-4.5 top-1/2 -translate-y-1/2 w-5 md:w-5.5 h-5 md:h-5.5 transition-colors ${focusedField === 'email' ? 'text-cyan-400' : 'text-cyan-500/50'}`} />
                  <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} placeholder="Enter your Gmail or demo account" className="w-full pl-12 md:pl-13 pr-4 md:pr-5 py-3.5 md:py-4 bg-slate-900/50 border-2 border-cyan-500/30 rounded-xl focus:border-cyan-400 outline-none transition-all duration-300 hover:border-cyan-400/60 text-white placeholder-cyan-400/40 backdrop-blur-md text-sm md:text-base touch-manipulation font-medium" style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.1), inset 0 2px 10px rgba(0, 0, 0, 0.3)' }} required />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity ${focusedField === 'email' ? 'opacity-100' : 'opacity-0'}`} style={{ boxShadow: '0 0 30px rgba(34, 211, 238, 0.4), inset 0 0 20px rgba(34, 211, 238, 0.1)' }} />
                </div>
              </div>
              <div className="relative">
                <label htmlFor="password" className={`block text-sm md:text-base font-bold mb-2 md:mb-2.5 transition-colors tracking-wide ${focusedField === 'password' ? 'text-cyan-300' : 'text-cyan-400/80'}`}>Password</label>
                <div className="relative group">
                  <Lock className={`absolute left-4 md:left-4.5 top-1/2 -translate-y-1/2 w-5 md:w-5.5 h-5 md:h-5.5 transition-colors ${focusedField === 'password' ? 'text-cyan-400' : 'text-cyan-500/50'}`} />
                  <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} placeholder="Enter your password" className="w-full pl-12 md:pl-13 pr-12 md:pr-13 py-3.5 md:py-4 bg-slate-900/50 border-2 border-cyan-500/30 rounded-xl focus:border-cyan-400 outline-none transition-all duration-300 hover:border-cyan-400/60 text-white placeholder-cyan-400/40 backdrop-blur-md text-sm md:text-base touch-manipulation font-medium" style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.1), inset 0 2px 10px rgba(0, 0, 0, 0.3)' }} required />
                  <button type="button" className="absolute right-4 md:right-4.5 top-1/2 -translate-y-1/2 text-cyan-500/50 hover:text-cyan-400 transition-colors p-1.5 touch-manipulation" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff className="w-5 md:w-5.5 h-5 md:h-5.5" /> : <Eye className="w-5 md:w-5.5 h-5 md:h-5.5" />}
                  </button>
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity ${focusedField === 'password' ? 'opacity-100' : 'opacity-0'}`} style={{ boxShadow: '0 0 30px rgba(34, 211, 238, 0.4), inset 0 0 20px rgba(34, 211, 238, 0.1)' }} />
                </div>
              </div>
            </>
          )}
          {loginMethod === 'phone' && (
            <>
              <div className="relative">
                <label htmlFor="phone" className={`block text-sm md:text-base font-bold mb-2 md:mb-2.5 transition-colors tracking-wide ${focusedField === 'phone' ? 'text-cyan-300' : 'text-cyan-400/80'}`}>Phone Number</label>
                <div className="relative group">
                  <Phone className={`absolute left-4 md:left-4.5 top-1/2 -translate-y-1/2 w-5 md:w-5.5 h-5 md:h-5.5 transition-colors ${focusedField === 'phone' ? 'text-cyan-400' : 'text-cyan-500/50'}`} />
                  <input id="phone" type="tel" value={phone} onChange={e => handlePhoneChange(e.target.value)} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)} placeholder="+1-555-DEMO" className="w-full pl-12 md:pl-13 pr-4 md:pr-5 py-3.5 md:py-4 bg-slate-900/50 border-2 border-cyan-500/30 rounded-xl focus:border-cyan-400 outline-none transition-all duration-300 hover:border-cyan-400/60 text-white placeholder-cyan-400/40 backdrop-blur-md text-sm md:text-base touch-manipulation font-medium" style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.1), inset 0 2px 10px rgba(0, 0, 0, 0.3)' }} required />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity ${focusedField === 'phone' ? 'opacity-100' : 'opacity-0'}`} style={{ boxShadow: '0 0 30px rgba(34, 211, 238, 0.4), inset 0 0 20px rgba(34, 211, 238, 0.1)' }} />
                </div>
                {/* OTP Status Display - Responsive */}
                {phone.length >= 10 && (
                  <div className="mt-2 text-xs md:text-sm">
                    {otpLoading && (
                      <div className="flex items-center gap-2 text-blue-300">
                        <div className="w-3.5 md:w-4 h-3.5 md:h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                        <span>Sending OTP...</span>
                        <div className="ml-auto text-[10px] md:text-xs text-white/50 font-mono">
                          {currentTime.getSeconds()}s
                        </div>
                      </div>
                    )}
                    {otpSent && !otpLoading && (
                      <div className="flex flex-wrap items-center gap-2 text-green-300">
                        <Timer className="w-3.5 md:w-4 h-3.5 md:h-4 animate-pulse" />
                        <span className="text-xs md:text-sm">OTP sent to {phone}</span>
                        {generatedOTP && (
                          <span className="px-2 py-0.5 md:py-1 bg-green-500/20 text-green-300 rounded font-mono text-[10px] md:text-xs border border-green-400/30">
                            {generatedOTP}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="relative">
                <label htmlFor="verificationCode" className={`block text-sm md:text-base font-bold mb-2 md:mb-2.5 transition-colors tracking-wide ${focusedField === 'verificationCode' ? 'text-cyan-300' : 'text-cyan-400/80'}`}>Verification Code</label>
                <div className="relative group">
                  <Lock className={`absolute left-4 md:left-4.5 top-1/2 -translate-y-1/2 w-5 md:w-5.5 h-5 md:h-5.5 transition-colors ${focusedField === 'verificationCode' ? 'text-cyan-400' : 'text-cyan-500/50'}`} />
                  <input id="verificationCode" type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} onFocus={() => setFocusedField('verificationCode')} onBlur={() => setFocusedField(null)} placeholder={otpSent ? "Enter OTP or wait for auto-fill..." : "Enter OTP"} className={`w-full pl-12 md:pl-13 pr-4 md:pr-5 py-3.5 md:py-4 bg-slate-900/50 border-2 rounded-xl focus:border-cyan-400 outline-none transition-all duration-300 hover:border-cyan-400/60 text-white placeholder-cyan-400/40 backdrop-blur-md text-sm md:text-base touch-manipulation font-medium ${verificationCode === generatedOTP && generatedOTP ? 'border-green-400 bg-green-500/10' : 'border-cyan-500/30'}`} style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.1), inset 0 2px 10px rgba(0, 0, 0, 0.3)' }} required />
                  <div className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity ${focusedField === 'verificationCode' ? 'opacity-100' : 'opacity-0'}`} style={{ boxShadow: '0 0 30px rgba(34, 211, 238, 0.4), inset 0 0 20px rgba(34, 211, 238, 0.1)' }} />
                </div>
                {/* OTP Auto-fill Status - Responsive */}
                {verificationCode === generatedOTP && generatedOTP && (
                  <div className="mt-2 text-xs md:text-sm text-green-300 flex items-center gap-2">
                    <Clock className="w-3.5 md:w-4 h-3.5 md:h-4 text-green-400 animate-pulse" />
                    <span>Code verified • Ready to proceed</span>
                  </div>
                )}
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={loading}
            className="relative w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white py-4 md:py-4.5 rounded-2xl font-bold overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mt-3 border-2 border-cyan-400/50 touch-manipulation min-h-[56px] text-base md:text-lg tracking-wide"
            style={{
              boxShadow: '0 0 40px rgba(34, 211, 238, 0.3), 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 2px 10px rgba(255, 255, 255, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 60px rgba(34, 211, 238, 0.5), 0 15px 40px rgba(0, 0, 0, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 40px rgba(34, 211, 238, 0.3), 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 2px 10px rgba(255, 255, 255, 0.2)';
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            {/* Animated shine effect - Enhanced */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            {/* Animated glow corners */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-purple-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
            {/* Clock ticking indicator */}
            <div className="absolute top-2 right-3 text-xs md:text-sm text-cyan-200/80 font-mono bg-black/30 px-2 py-0.5 rounded border border-cyan-400/30">
              {currentTime.getSeconds().toString().padStart(2, '0')}
            </div>
            <span className="relative flex items-center justify-center gap-2.5">
              {loading ? (
                <>
                  <div className="w-5 md:w-6 h-5 md:h-6 border-3 border-cyan-300/30 border-t-cyan-200 rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Clock className="w-5 md:w-6 h-5 md:h-6 group-hover:animate-spin" style={{ animationDuration: '2s' }} />
                  Enter TimeBank
                </>
              )}
            </span>
          </button>
        </form>
        {/* Account Actions */}
        <div className="mt-7 md:mt-9 text-center space-y-4">
          {/* Create Account - Glassmorphic Panel */}
          <div className="relative overflow-hidden rounded-2xl p-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-lg"
            style={{ boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)' }}
          >
            <button 
              type="button" 
              onClick={onToggleMode} 
              className="w-full relative text-cyan-200 hover:text-white font-bold transition-all flex items-center justify-center gap-2.5 text-sm md:text-base touch-manipulation py-3.5 px-6 rounded-2xl bg-gradient-to-br from-slate-900/95 via-indigo-900/95 to-purple-900/95 backdrop-blur-xl group overflow-hidden"
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content */}
              <Timer className="w-5 md:w-5.5 h-5 md:h-5.5 relative z-10 group-hover:rotate-360 transition-transform duration-700" />
              <span className="relative z-10 tracking-wide">Create Account</span>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 px-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            <span className="text-cyan-400/60 text-xs font-medium">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          </div>

          {/* Forgot Password */}
          <button 
            type="button" 
            onClick={handleForgotPassword} 
            className="text-sm md:text-base text-cyan-400/70 hover:text-cyan-300 font-semibold transition-all touch-manipulation py-2 hover:underline decoration-cyan-400/50 underline-offset-4 inline-flex items-center gap-2 group"
          >
            <Lock className="w-4 h-4 group-hover:animate-pulse" />
            Forgot / Reset Password
          </button>
        </div>

          {showReset && <ResetPasswordModal onClose={() => setShowReset(false)} />}
        </div>
      </div>
      
      {/* 3D Clock Animations & Effects */}
      <style>{`
        /* 3D Float Animation */}
        @keyframes float-3d {
          0%, 100% { 
            transform: translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg); 
          }
          25% { 
            transform: translateY(-20px) translateZ(50px) rotateX(10deg) rotateY(10deg); 
          }
          50% { 
            transform: translateY(-10px) translateZ(100px) rotateX(-5deg) rotateY(20deg); 
          }
          75% { 
            transform: translateY(-20px) translateZ(50px) rotateX(5deg) rotateY(-10deg); 
          }
        }
        .animate-float-3d { 
          animation: float-3d 10s ease-in-out infinite; 
          will-change: transform;
          transform-style: preserve-3d;
        }
        
        /* 3D Rotation */}
        @keyframes rotate3d {
          0% { 
            transform: rotateX(20deg) rotateY(0deg) rotateZ(0deg); 
          }
          100% { 
            transform: rotateX(20deg) rotateY(360deg) rotateZ(0deg); 
          }
        }
        
        /* Particle Animation */
        @keyframes particle {
          0% { 
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% { 
            transform: translateY(-100vh) scale(1);
            opacity: 0;
          }
        }
        .animate-particle {
          animation: particle 7s linear infinite;
        }
        
        /* Grid Flow Animation */
        @keyframes gridFlow {
          0% {
            transform: translateY(0) translateX(0);
          }
          100% {
            transform: translateY(40px) translateX(20px);
          }
        }
        
        /* Time Vortex Pulse */
        @keyframes vortexPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.6;
          }
        }
        
        /* Clockwise Rotation */
        @keyframes rotateClockwise {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.05);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }
        
        /* Glow Effect */
        .shadow-glow {
          filter: drop-shadow(0 0 10px currentColor);
        }
        
        /* Perspective */
        .perspective-1000 {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        
        /* Gradient Radial */
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-10px); 
          }
        }
        .animate-float { 
          animation: float 3s ease-in-out infinite; 
        }
        
        @keyframes clock-tick {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(6deg); }
        }
        .animate-clock-tick { 
          animation: clock-tick 1s ease-in-out infinite; 
          will-change: transform;
        }
        
        @keyframes time-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(79, 70, 229, 0.4); }
        }
        .animate-time-glow { 
          animation: time-glow 2s ease-in-out infinite; 
          will-change: box-shadow;
        }
        
        @keyframes digital-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-digital-flicker { 
          animation: digital-flicker 0.1s ease-in-out infinite; 
        }
        
        /* Smooth gradient text animation */
        @keyframes gradient-text {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        /* Add smooth touch feedback */
        @media (hover: none) and (pointer: coarse) {
          button:active {
            transform: scale(0.97);
            transition: transform 0.1s ease-out;
          }
        }
        
        /* Optimize animations for reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-spin,
          .animate-pulse,
          .animate-bounce,
          .animate-ping {
            animation: none;
          }
        }
        
        /* Shimmer effect for premium feel */
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        /* Smooth focus ring */
        input:focus-visible {
          outline: none;
        }
        
        /* Better mobile tap highlight */
        * {
          -webkit-tap-highlight-color: rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  );
};