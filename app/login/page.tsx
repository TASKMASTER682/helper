'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain, Eye, EyeOff, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI } from '@/lib/api';
import Link from 'next/link';

const INDIAN_STATES_AND_UT = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', state: '' });
  const { login, register, isLoading, user, init, setUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  useEffect(() => {
    if (searchParams.get('verified') === '1') {
      toast.success('Email verified successfully. You can login now.');
    }
  }, [searchParams]);

  useEffect(() => {
    const tokenFromVerify = searchParams.get('token');
    if (!tokenFromVerify) return;

    const autoLoginAfterVerify = async () => {
      try {
        localStorage.setItem('upsc_token', tokenFromVerify);
        const { data } = await userAPI.getProfile();
        localStorage.setItem('upsc_user', JSON.stringify(data));
        setUser(data);
        router.replace('/dashboard');
      } catch (err) {
        localStorage.removeItem('upsc_token');
        toast.error('Verification completed, but auto-login failed. Please login manually.');
      }
    };

    autoLoginAfterVerify();
  }, [searchParams, router, setUser]);

  const handleSubmit = async () => {
    try {
      console.log('Submit handler called, isLogin:', isLogin);
      if (isLogin) {
        console.log('Attempting login with:', form.email);
        await login(form.email, form.password);
      } else {
        if (!form.name) { toast.error('Name is required'); return; }
        if (!form.state) { toast.error('State is required'); return; }
        console.log('Attempting register with:', { name: form.name, email: form.email });
        const result = await register(form.name, form.email, form.password, form.state);
        toast.success(result?.message || 'Verification link sent. Please check your email.');
        setIsLogin(true);
        setForm((p) => ({ ...p, password: '' }));
      }
      console.log('Auth successful');
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Something went wrong';
      console.error('Error message:', errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-ink-800 flex">
<div className="hidden lg:flex flex-col w-1/2 bg-linear-to-br from-ink-800 via-ink-700 to-ink-800 p-12 relative overflow-hidden">
<div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl" />
          <div className="absolute top-24 right-24 w-56 h-56 bg-teal-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-deep-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-jade-500/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-yellow-500 to-teal-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-display text-xl font-bold text-ink-100">UPSC-POS</div>
              <div className="text-[10px] font-mono text-ink-500 uppercase tracking-widest">Personal Operating System</div>
            </div>
          </Link>

          <h1 className="font-display text-5xl font-bold text-ink-100 leading-tight mb-6">
            Your AI<br />
            <span className="text-gradient-saffron">UPSC Mentor</span><br />
            Never Sleeps.
          </h1>

          <p className="text-ink-400 text-lg leading-relaxed mb-12">
            Not just a planner. A decision-making system that manages your preparation, detects weaknesses, and optimizes your path to becoming an IAS officer.
          </p>

          <div className="space-y-4">
            {[
              { icon: '🎯', title: 'Mission Mode', desc: 'LIFO-priority engine ensures deadlines are never missed' },
              { icon: '🧠', title: 'AI Mentor ARJUN', desc: 'Real-time coaching based on your actual performance data' },
              { icon: '📊', title: 'Behavioral Analysis', desc: 'Detects procrastination and avoidance patterns automatically' },
              { icon: '⚡', title: 'Zero Decision Fatigue', desc: 'Your daily schedule is generated automatically every night' },
            ].map(feature => (
              <div key={feature.title} className="flex items-start gap-3 p-3 bg-ink-900/40 border border-ink-800/50 rounded-xl">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <div className="font-semibold text-ink-200 text-sm">{feature.title}</div>
                  <div className="text-ink-500 text-xs">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
<div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 border border-yellow-500/30 shadow-[0_0_28px_rgba(20,184,166,0.08)]">
            <div className="text-center mb-8">
              <Link href="/" className="w-12 h-12 rounded-xl bg-linear-to-br from-yellow-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </Link>
              <h2 className="font-display text-2xl font-bold text-ink-100">
                {isLogin ? 'Welcome back' : 'Begin your journey'}
              </h2>
              <p className="text-ink-500 text-sm mt-1">
                {isLogin ? 'Continue your UPSC preparation' : 'Create your UPSC-POS account'}
              </p>
            </div>

            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="label-text">Full Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Rahul Sharma"
                    className="input-field w-full mt-1"
                  />
                </div>
              )}
              {!isLogin && (
                <div>
                  <label className="label-text">State (India)</label>
                  <select
                    value={form.state}
                    onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                    className="input-field w-full mt-1"
                  >
                    <option value="">Select your state / UT</option>
                    {INDIAN_STATES_AND_UT.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="label-text">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="input-field w-full mt-1"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              <div>
                <label className="label-text">Password</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min 8 characters"
                    className="input-field w-full pr-10"
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading || !form.email || !form.password || (!isLogin && (!form.name || !form.state))}
                className="w-full btn-primary py-3 font-semibold text-base disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  isLogin ? 'Sign in to UPSC-POS' : 'Create Account'
                )}
              </button>
            </div>

            <div className="text-center mt-6 pt-6 border-t border-ink-700/50">
              <span className="text-ink-500 text-sm">
                {isLogin ? "Don't have an account? " : "Already registered? "}
              </span>
              <button onClick={() => setIsLogin(!isLogin)} className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold transition-colors">
                {isLogin ? 'Create one' : 'Sign in'}
              </button>
            </div>
          </div>

          <p className="text-center text-ink-600 text-xs mt-6 font-mono">
            UPSC CSE 2025–2028 · Powered by AI
          </p>
        </div>
      </div>
    </div>
  );
}


