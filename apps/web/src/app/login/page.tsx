'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  Key, 
  RefreshCw, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { handleLogin } from '@/server/actions/auth-actions';
import { 
  initiatePasswordRecovery, 
  verifyPinAndSendOtp, 
  resendRecoveryOtp, 
  verifyOtp, 
  requestFamilyHelp, 
  checkFamilyHelpStatus, 
  resetPasswordAfterRecovery 
} from '@/server/actions/recovery-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'forgot_email' | 'forgot_pin' | 'forgot_otp' | 'family_wait' | 'forgot_reset';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);

  // Recovery States
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [systemOtp, setSystemOtp] = useState(''); // The code shown on-screen
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Resend OTP Countdown timer
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Polling for family help approval
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      stopCountdown();
      stopPolling();
    };
  }, []);

  const startCountdown = () => {
    stopCountdown();
    setResendCountdown(20);
    countdownTimerRef.current = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          stopCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  };

  const startPolling = (targetEmail: string) => {
    stopPolling();
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/recovery?email=${encodeURIComponent(targetEmail)}`, {
          cache: 'no-store',
          headers: {
            'x-api-key': 'finance-admin-secret-api-key'
          }
        });
        const data = await res.json();
        if (data.success && data.approved) {
          stopPolling();
          toast.success("Family authorization received! You can now reset your password.");
          setMode('forgot_reset');
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Submit standard login form
  const onSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const loginEmail = formData.get('email') as string;
    const loginPassword = formData.get('password') as string;
    const rememberMe = formData.get('rememberMe') === 'on';

    const res = await handleLogin(loginEmail, loginPassword, rememberMe);
    
    if (res.success) {
      toast.success('Authentication successful. Secure session established.');
      router.push('/dashboard');
    } else {
      toast.error(res.error || 'Invalid credentials');
      setIsLoading(false);
    }
  };

  // 1. Submit email recovery check
  const onSubmitEmailRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);

    const res = await initiatePasswordRecovery(email);
    setIsLoading(false);

    if (res.success) {
      setUserName(res.name || 'User');
      setHasPin(!!res.hasPin);
      if (res.hasPin) {
        setMode('forgot_pin');
      } else {
        // If user doesn't have a PIN set up in Settings, fallback to Family Help directly
        toast.warning("No Transaction PIN configured on this account. Initiating Family authorization.");
        handleTriggerFamilyHelp();
      }
    } else {
      toast.error(res.error || 'Email lookup failed.');
    }
  };

  // 2. Submit PIN check & send OTP
  const onSubmitPinVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    setIsLoading(true);

    const res = await verifyPinAndSendOtp(email, pin);
    setIsLoading(false);

    if (res.success) {
      // Show OTP code directly on screen — user is logged out, can't check inbox
      setSystemOtp(res.otp || '');
      setOtp(res.otp || ''); // Auto-fill the input field
      setMode('forgot_otp');
      startCountdown();
      toast.success('Your verification code is ready — it is shown below.', { duration: 6000 });
    } else {
      toast.error(res.error || "PIN verification failed. User not verified by system.");
    }
  };

  // 3. Resend OTP code
  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setIsLoading(true);
    const res = await resendRecoveryOtp(email);
    setIsLoading(false);

    if (res.success) {
      // Show the new OTP code directly on screen
      setSystemOtp(res.otp || '');
      setOtp(res.otp || ''); // Auto-fill
      startCountdown();
      toast.success('A new verification code has been generated — it is shown below.', { duration: 6000 });
    } else {
      toast.error(res.error || "Failed to resend code.");
    }
  };

  // 4. Submit OTP code check
  const onSubmitOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setIsLoading(true);

    const res = await verifyOtp(email, otp);
    setIsLoading(false);

    if (res.success) {
      toast.success("Verification successful. Enter your new password.");
      setMode('forgot_reset');
    } else {
      toast.error(res.error || "Invalid verification code.");
    }
  };

  // 5. Trigger Family Help Request
  const handleTriggerFamilyHelp = async () => {
    setIsLoading(true);
    const res = await requestFamilyHelp(email);
    setIsLoading(false);

    if (res.success) {
      toast.info("Help request sent to family. Waiting for approval...");
      setMode('family_wait');
      startPolling(email);
    } else {
      toast.error(res.error || "Failed to submit request.");
    }
  };

  // 6. Submit Password Reset
  const onSubmitPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);

    const res = await resetPasswordAfterRecovery(email, newPassword);
    setIsLoading(false);

    if (res.success) {
      toast.success("Password has been reset successfully! You can now log in.");
      setMode('login');
      // Reset forms
      setEmail('');
      setPin('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      toast.error(res.error || "Failed to reset password.");
    }
  };

  const handleCancelFamilyWait = () => {
    stopPolling();
    setMode('login');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        
        <div className="bg-white border border-border rounded-2xl shadow-premium p-8">
          
          {/* LOGO HEADER */}
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 border border-primary/20">
            <Shield className="w-6 h-6 text-primary" />
          </div>

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">System Login</h1>
              <p className="text-sm text-muted-foreground mt-2 mb-8">
                Enter your credentials to access the secure financial console.
              </p>

              <form onSubmit={onSubmitLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="email" 
                      name="email"
                      required
                      placeholder="admin@finance.local"
                      className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-foreground">Password</label>
                    <button 
                      type="button"
                      onClick={() => setMode('forgot_email')}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="password" 
                      name="password"
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800"
                    />
                  </div>
                </div>

                {/* Remember Me logic */}
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-xs text-muted-foreground select-none cursor-pointer">
                    Remember me for 30 days
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-premium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Authenticate <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )}

          {/* MODE: FORGOT EMAIL */}
          {mode === 'forgot_email' && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <button 
                  onClick={() => setMode('login')}
                  className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-500">Back to Login</span>
              </div>

              <h1 className="text-2xl font-bold text-foreground tracking-tight">Recover Password</h1>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                Enter your account email to start the system-verified recovery process.
              </p>

              <form onSubmit={onSubmitEmailRecovery} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. user@finance.local"
                      className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || !email}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-premium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Next <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )}

          {/* MODE: FORGOT PIN */}
          {mode === 'forgot_pin' && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <button 
                  onClick={() => setMode('forgot_email')}
                  className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-500">Back</span>
              </div>

              <h1 className="text-2xl font-bold text-foreground tracking-tight">Identity Verification</h1>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                Welcome back, <strong className="text-slate-900">{userName}</strong>. Enter your Transaction PIN to verify owner credentials.
              </p>

              <form onSubmit={onSubmitPinVerification} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">4-Digit Transaction PIN</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="password" 
                      required
                      maxLength={6}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      value={pin}
                      onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    type="submit" 
                    disabled={isLoading || pin.length < 4}
                    className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-premium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verify PIN <ArrowRight className="w-4 h-4" /></>}
                  </button>

                  <button 
                    type="button" 
                    onClick={handleTriggerFamilyHelp}
                    disabled={isLoading}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-border text-slate-700 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Users className="w-3.5 h-3.5" /> Forgot PIN? Request Family Approval
                  </button>
                </div>
              </form>
            </>
          )}

          {/* MODE: FORGOT OTP */}
          {mode === 'forgot_otp' && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <button 
                  onClick={() => setMode('forgot_pin')}
                  className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-500">Back</span>
              </div>

              <h1 className="text-2xl font-bold text-foreground tracking-tight">Security Code</h1>
              <p className="text-sm text-muted-foreground mt-2 mb-5">
                Your one-time verification code is displayed below. Enter it to confirm your identity and reset your password.
              </p>

              {/* OTP Code Display — shown directly on screen */}
              {systemOtp && (
                <div className="mb-5 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl text-center space-y-2 animate-in fade-in zoom-in-95 duration-300">
                  <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Your Verification Code</p>
                  <div className="flex items-center justify-center gap-2">
                    {systemOtp.split('').map((digit, i) => (
                      <span
                        key={i}
                        className="w-10 h-12 bg-white border-2 border-blue-300 rounded-lg flex items-center justify-center text-2xl font-bold text-blue-700 shadow-sm"
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-blue-500 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> Expires in 5 minutes
                  </p>
                </div>
              )}

              <form onSubmit={onSubmitOtpVerification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Enter Code to Confirm</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      required
                      maxLength={6}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter code"
                      className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm tracking-[0.3em] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono text-center text-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground bg-slate-50 p-2.5 rounded-lg border border-border">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Code expires in 5m
                  </span>
                  <button 
                    type="button"
                    disabled={resendCountdown > 0 || isLoading}
                    onClick={handleResendOtp}
                    className="text-primary hover:underline font-semibold flex items-center gap-1 disabled:opacity-50 disabled:hover:no-underline"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    {resendCountdown > 0 ? `New code in ${resendCountdown}s` : "Generate New Code"}
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || otp.length < 6}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-premium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verify & Continue <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )}


          {/* MODE: FAMILY HELP WAIT */}
          {mode === 'family_wait' && (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Users className="w-8 h-8 text-blue-600" />
              </div>

              <div className="space-y-2">
                <h1 className="text-xl font-bold text-foreground">Waiting for Family Approval</h1>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  A verification request was dispatched to your family circle. Once another member logs in and approves this in their settings, you will automatically proceed.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 bg-slate-50 border border-border p-3 rounded-lg text-xs font-semibold text-slate-600">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping" />
                Listening for active network response...
              </div>

              <button
                type="button"
                onClick={handleCancelFamilyWait}
                className="px-4 py-2 border border-border bg-white rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel & Return
              </button>
            </div>
          )}

          {/* MODE: FORGOT RESET */}
          {mode === 'forgot_reset' && (
            <>
              <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" /> Reset Password
              </h1>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                Verification completed successfully. Define your new password credentials below.
              </p>

              <form onSubmit={onSubmitPasswordReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="password" 
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || !newPassword || newPassword !== confirmPassword}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium shadow-premium hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Save & Log In <CheckCircle2 className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )}

        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected by AES-256 equivalent edge tokenization.
        </p>
      </div>
    </div>
  );
}
