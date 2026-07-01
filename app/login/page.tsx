// 'use client';
// import { useState, useEffect, Suspense } from 'react'; // Added Suspense
// import { useAuthStore } from '@/store/authStore';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { Brain, Eye, EyeOff, Zap } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { userAPI } from '@/lib/api';
// import Link from 'next/link';

// const INDIAN_STATES_AND_UT = [
//   'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
// ];

// // --- LOGIC COMPONENT ---
// function LoginForm() {
//   const [isLogin, setIsLogin] = useState(true);
//   const [showPassword, setShowPassword] = useState(false);
//   const [form, setForm] = useState({ name: '', email: '', password: '', state: '' });
//   const { login, register, isLoading, user, init, setUser } = useAuthStore();
//   const router = useRouter();
//   const searchParams = useSearchParams(); // This hook requires Suspense

//   useEffect(() => {
//     init();
//   }, [init]);

//   useEffect(() => {
//     if (user) router.push('/dashboard');
//   }, [user, router]);

//   useEffect(() => {
//     if (searchParams.get('verified') === '1') {
//       toast.success('Email verified successfully. You can login now.');
//     }
//   }, [searchParams]);

//   useEffect(() => {
//     const tokenFromVerify = searchParams.get('token');
//     if (!tokenFromVerify) return;

//     const autoLoginAfterVerify = async () => {
//       try {
//         if (typeof window !== 'undefined') {
//           localStorage.setItem('upsc_token', tokenFromVerify);
//         }
//         const { data } = await userAPI.getProfile();
//         if (typeof window !== 'undefined') {
//           localStorage.setItem('upsc_user', JSON.stringify(data));
//         }
//         setUser(data);
//         router.replace('/dashboard');
//       } catch (err) {
//         if (typeof window !== 'undefined') {
//           localStorage.removeItem('upsc_token');
//         }
//         toast.error('Verification completed, but auto-login failed. Please login manually.');
//       }
//     };

//     autoLoginAfterVerify();
//   }, [searchParams, router, setUser]);

//   const handleSubmit = async () => {
//     try {
//       if (isLogin) {
//         await login(form.email, form.password);
//       } else {
//         if (!form.name) { toast.error('Name is required'); return; }
//         if (!form.state) { toast.error('State is required'); return; }
//         const result = await register(form.name, form.email, form.password, form.state);
//         toast.success(result?.message || 'Verification link sent. Please check your email.');
//         setIsLogin(true);
//         setForm((p) => ({ ...p, password: '' }));
//       }
//     } catch (err: any) {
//       const errorMessage = err.response?.data?.error || err.message || 'Something went wrong';
//       toast.error(errorMessage);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-ink-800 flex">
//       {/* Sidebar Content */}
//       <div className="hidden lg:flex flex-col w-1/2 bg-linear-to-br from-ink-800 via-ink-700 to-ink-800 p-12 relative overflow-hidden">
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//           <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
//           <div className="absolute top-24 right-24 w-56 h-56 bg-teal-500/5 rounded-full blur-3xl" />
//           <div className="absolute bottom-20 right-20 w-48 h-48 bg-deep-500/5 rounded-full blur-3xl" />
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-jade-500/3 rounded-full blur-3xl" />
//         </div>

//         <div className="relative z-10">
//           <Link href="/" className="inline-flex items-center gap-3 mb-16">
//             <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-500 to-teal-500 flex items-center justify-center">
//               <Brain className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <div className="font-display text-xl font-bold text-ink-100">UPSC-POS</div>
//               <div className="text-[10px] font-mono text-ink-500 uppercase tracking-widest">Personal Operating System</div>
//             </div>
//           </Link>

//           <h1 className="font-display text-5xl font-bold text-ink-100 leading-tight mb-6">
//             Your AI<br />
//             <span className="text-gradient-pink">UPSC Mentor</span><br />
//             Never Sleeps.
//           </h1>

//           <p className="text-ink-400 text-lg leading-relaxed mb-12">
//             Not just a planner. A decision-making system that manages your preparation.
//           </p>

//           <div className="space-y-4">
//             {[
//              { icon: '🎯', title: 'Mission Mode', desc: 'LIFO-priority engine ensures deadlines are never missed' },
//               { icon: '🧠', title: 'AI Mentor ARJUN', desc: 'Real-time coaching based on your actual performance data' },
//               { icon: '📊', title: 'Behavioral Analysis', desc: 'Detects procrastination and avoidance patterns automatically' },
//               { icon: '⚡', title: 'Zero Decision Fatigue', desc: 'Your daily schedule is generated automatically every night' },
//             ].map(feature => (
//               <div key={feature.title} className="flex items-start gap-3 p-3 bg-ink-900/40 border border-ink-600/50 rounded-xl">
//                 <span className="text-2xl">{feature.icon}</span>
//                 <div>
//                   <div className="font-semibold text-ink-200 text-sm">{feature.title}</div>
//                   <div className="text-ink-500 text-xs">{feature.desc}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Form Content */}
//       <div className="flex-1 flex items-center justify-center p-8">
//         <div className="w-full max-w-md">
//           <div className="glass-card p-8 border border-red-500/30 shadow-[0_0_28px_rgba(20,184,166,0.08)]">
//             <div className="text-center mb-8">
//               <Link href="/" className="w-12 h-12 rounded-xl bg-linear-to-br from-red-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
//                 <Zap className="w-6 h-6 text-white" />
//               </Link>
//               <h2 className="font-display text-2xl font-bold text-ink-100">
//                 {isLogin ? 'Welcome back' : 'Begin your journey'}
//               </h2>
//             </div>

//             <div className="space-y-4">
//               {!isLogin && (
//                 <>
//                   <div>
//                     <label className="label-text text-white">Full Name</label>
//                     <input
//                       value={form.name}
//                       onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
//                       placeholder="e.g. Rahul Sharma"
//                       className="input-field w-full mt-1 bg-ink-900 text-white p-2 rounded"
//                     />
//                   </div>
//                   <div>
//                     <label className="label-text text-white">State (India)</label>
//                     <select
//                       value={form.state}
//                       onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
//                       className="input-field w-full mt-1 bg-ink-900 text-white p-2 rounded"
//                     >
//                       <option value="">Select your state / UT</option>
//                       {INDIAN_STATES_AND_UT.map((state) => (
//                         <option key={state} value={state}>{state}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </>
//               )}

//               <div>
//                 <label className="label-text text-white">Email</label>
//                 <input
//                   type="email"
//                   value={form.email}
//                   onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
//                   placeholder="you@example.com"
//                   className="input-field w-full mt-1 bg-ink-900 text-white p-2 rounded"
//                   onKeyDown={e => e.key === 'Enter' && handleSubmit()}
//                 />
//               </div>

//               <div>
//                 <label className="label-text text-white">Password</label>
//                 <div className="relative mt-1">
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={form.password}
//                     onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
//                     placeholder="Min 8 characters"
//                     className="input-field w-full pr-10 bg-ink-900 text-white p-2 rounded"
//                     onKeyDown={e => e.key === 'Enter' && handleSubmit()}
//                   />
//                   <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500">
//                     {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </button>
//                 </div>
//               </div>

//               <button
//                 onClick={handleSubmit}
//                 disabled={isLoading}
//                 className="w-full bg-red-500 hover:bg-pink-200 text-ink-900 py-3 font-semibold rounded-xl mt-2 disabled:opacity-50"
//               >
//                 {isLoading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create Account')}
//               </button>
//             </div>

//             <div className="text-center mt-6 pt-6 border-t border-ink-500/50">
//               <button onClick={() => setIsLogin(!isLogin)} className="text-red-400 hover:text-pink-400 text-sm font-semibold">
//                 {isLogin ? "Don't have an account? Create one" : "Already registered? Sign in"}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // --- MAIN PAGE EXPORT WITH SUSPENSE ---
// export default function LoginPage() {
//   return (
//     <Suspense fallback={<div className="min-h-screen bg-ink-800 flex items-center justify-center text-white font-mono">Loading Operating System...</div>}>
//       <LoginForm />
//     </Suspense>
//   );
// }

'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain, Eye, EyeOff, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI } from '@/lib/api';
import Link from 'next/link';

const INDIAN_STATES_AND_UT = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', state: '' });
  
  const { login, register, isLoading, user, init, setUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Initialize Auth
  useEffect(() => {
    init();
  }, [init]);

  // 2. Redirect if already logged in
  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  // Auto-login logic for any token in URL
  useEffect(() => {
    const tokenFromVerify = searchParams.get('token');
    if (tokenFromVerify) {
      try {
        localStorage.setItem('upsc_token', tokenFromVerify);
        const storedUser = localStorage.getItem('upsc_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          router.replace('/dashboard');
        }
      } catch (err: any) {
        localStorage.removeItem('upsc_token');
      }
    }
  }, [searchParams, router, setUser]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Form reload prevent karega
    
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (!form.name || !form.state) {
          toast.error('Please fill all fields');
          return;
        }
        const result = await register(form.name, form.email, form.password, form.state);
        toast.success(result?.message || 'Account created successfully! Please login.');
        setIsLogin(true);
        setForm(p => ({ ...p, password: '' }));
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Something went wrong';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="relative paper-bg grain-fixed min-h-screen text-ink selection:bg-crimson/20 flex">
      {/* Decorative bg elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[5%] w-[40rem] h-[40rem] bg-crimson/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[35rem] h-[35rem] bg-teal/5 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[20rem] h-[20rem] bg-gold/5 rounded-full blur-[100px]" />
      </div>

      {/* Sidebar - Left Panel */}
      <div className="hidden lg:flex flex-col w-1/2 p-12 relative">
        <Link href="/" className="inline-flex items-center gap-3 mb-20">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-crimson to-crimson-deep flex items-center justify-center shadow-lg shadow-crimson-deep/30">
            <Brain className="w-6 h-6 text-cream" />
          </div>
          <div>
            <div className="text-xl font-bold text-ink tracking-tight">UPSC-POS</div>
            <div className="text-[10px] font-mono text-ink-mute uppercase tracking-[0.2em]">Personal Operating System</div>
          </div>
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-crimson/20 bg-crimson/5 text-crimson text-[10px] font-mono tracking-[0.2em] uppercase mb-8">
            <Zap className="w-3 h-3" /> AI-Powered Preparation OS
          </div>

          <h1 className="display-hero text-5xl md:text-6xl text-ink leading-[0.98] mb-6">
            Your AI<br />
            <span className="italic text-crimson">UPSC Mentor</span><br />
            Never Sleeps.
          </h1>

          <p className="text-ink-mute text-lg leading-relaxed mb-14 max-w-md">
            Not just a planner. A decision-making system that manages your entire preparation journey.
          </p>

          <div className="space-y-4">
            {[
              { icon: '🎯', title: 'Mission Mode', desc: 'LIFO-priority engine ensures deadlines are never missed' },
              { icon: '🧠', title: 'AI Mentor ARJUN', desc: 'Real-time coaching based on your actual performance data' },
              { icon: '⚡', title: 'Zero Decision Fatigue', desc: 'Your daily schedule is generated automatically' },
            ].map(feature => (
              <div key={feature.title} className="flex items-start gap-4 p-4 rounded-2xl parchment transition-colors">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <div className="font-bold text-ink text-sm">{feature.title}</div>
                  <div className="text-ink-mute text-xs mt-0.5">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-[10px] text-ink-mute font-mono uppercase tracking-[0.2em]">
          &copy; 2026 UPSC-POS v2.0
        </div>
      </div>

      {/* Form Section - Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md">
          <div className="parchment rounded-3xl p-8 shadow-xl shadow-black/5">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-crimson to-crimson-deep flex items-center justify-center mx-auto mb-5 shadow-lg shadow-crimson-deep/20">
                <Zap className="w-7 h-7 text-cream" />
              </div>
              <h2 className="text-2xl font-bold text-ink">
                {isLogin ? 'Welcome back' : 'Begin your journey'}
              </h2>
              <p className="text-ink-mute text-sm mt-1">
                {isLogin ? 'Sign in to your command center' : 'Create your command center'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="label-text">Full Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Rahul Sharma"
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="label-text">State (India)</label>
                    <select
                      required
                      value={form.state}
                      onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                      className="input-field w-full"
                    >
                      <option value="">Select your state</option>
                      {INDIAN_STATES_AND_UT.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="label-text">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="label-text">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    className="input-field w-full pr-10"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3.5 rounded-2xl mt-4 text-center text-sm active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (isLogin ? 'Sign in' : 'Create Account')}
              </button>
            </form>

            <div className="text-center mt-8 pt-6 border-t border-[rgba(168,138,78,0.25)]">
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-crimson hover:text-crimson-deep text-sm font-bold transition-colors"
              >
                {isLogin ? "Don't have an account? Create one" : "Already registered? Sign in"}
              </button>
            </div>
          </div>

          <p className="text-center mt-6 text-[10px] text-ink-mute font-mono uppercase tracking-[0.2em]">
            Secure Encryption Active &bull; Zero Knowledge Architecture
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen paper-bg grain-fixed flex flex-col items-center justify-center text-ink font-mono gap-4">
        <div className="w-12 h-12 border-4 border-crimson/20 border-t-crimson rounded-full animate-spin" />
        <div className="animate-pulse">Initializing OS...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
