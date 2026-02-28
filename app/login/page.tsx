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
//           <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl" />
//           <div className="absolute top-24 right-24 w-56 h-56 bg-teal-500/5 rounded-full blur-3xl" />
//           <div className="absolute bottom-20 right-20 w-48 h-48 bg-deep-500/5 rounded-full blur-3xl" />
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-jade-500/3 rounded-full blur-3xl" />
//         </div>

//         <div className="relative z-10">
//           <Link href="/" className="inline-flex items-center gap-3 mb-16">
//             <div className="w-10 h-10 rounded-xl bg-linear-to-br from-yellow-500 to-teal-500 flex items-center justify-center">
//               <Brain className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <div className="font-display text-xl font-bold text-ink-100">UPSC-POS</div>
//               <div className="text-[10px] font-mono text-ink-500 uppercase tracking-widest">Personal Operating System</div>
//             </div>
//           </Link>

//           <h1 className="font-display text-5xl font-bold text-ink-100 leading-tight mb-6">
//             Your AI<br />
//             <span className="text-gradient-saffron">UPSC Mentor</span><br />
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
//               <div key={feature.title} className="flex items-start gap-3 p-3 bg-ink-900/40 border border-ink-800/50 rounded-xl">
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
//           <div className="glass-card p-8 border border-yellow-500/30 shadow-[0_0_28px_rgba(20,184,166,0.08)]">
//             <div className="text-center mb-8">
//               <Link href="/" className="w-12 h-12 rounded-xl bg-linear-to-br from-yellow-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
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
//                 className="w-full bg-yellow-500 hover:bg-yellow-600 text-ink-900 py-3 font-semibold rounded-xl mt-2 disabled:opacity-50"
//               >
//                 {isLoading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create Account')}
//               </button>
//             </div>

//             <div className="text-center mt-6 pt-6 border-t border-ink-700/50">
//               <button onClick={() => setIsLogin(!isLogin)} className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold">
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

  // 3. Handle Email Verification Toast
  useEffect(() => {
    if (searchParams.get('verified') === '1') {
      toast.success('Email verified successfully. You can login now.');
    }
  }, [searchParams]);

  // 4. Auto-login logic (Memoized to prevent effect re-runs)
  const autoLoginAfterVerify = useCallback(async (token: string) => {
    try {
      localStorage.setItem('upsc_token', token);
      const { data } = await userAPI.getProfile();
      localStorage.setItem('upsc_user', JSON.stringify(data));
      setUser(data);
      router.replace('/dashboard');
    } catch (err: any) {
      localStorage.removeItem('upsc_token');
      toast.error('Verification completed, but auto-login failed.');
    }
  }, [router, setUser]);

  useEffect(() => {
    const tokenFromVerify = searchParams.get('token');
    if (tokenFromVerify) {
      autoLoginAfterVerify(tokenFromVerify);
    }
  }, [searchParams, autoLoginAfterVerify]);

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
        toast.success(result?.message || 'Verification link sent. Check email.');
        setIsLogin(true);
        setForm(p => ({ ...p, password: '' }));
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Something went wrong';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar - Left Side */}
      <div className="hidden lg:flex flex-col w-1/2 bg-linear-to-br from-slate-900 via-slate-800 to-slate-950 p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-100 tracking-tight">UPSC-POS</div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">Personal Operating System</div>
            </div>
          </Link>

          <h1 className="text-5xl font-bold text-slate-100 leading-tight mb-6">
            Your AI<br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-600">UPSC Mentor</span><br />
            Never Sleeps.
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed mb-12 max-w-md">
            Not just a planner. A decision-making system that manages your entire preparation journey.
          </p>

          <div className="space-y-4">
            {[
              { icon: '🎯', title: 'Mission Mode', desc: 'LIFO-priority engine ensures deadlines are never missed' },
              { icon: '🧠', title: 'AI Mentor ARJUN', desc: 'Real-time coaching based on your actual performance data' },
              { icon: '⚡', title: 'Zero Decision Fatigue', desc: 'Your daily schedule is generated automatically' },
            ].map(feature => (
              <div key={feature.title} className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <div className="font-semibold text-slate-200 text-sm">{feature.title}</div>
                  <div className="text-slate-500 text-xs">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Section - Right Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md">
          <div className="bg-slate-900/50 p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {isLogin ? 'Welcome back' : 'Begin your journey'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">State (India)</label>
                    <select
                      required
                      value={form.state}
                      onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
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
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full bg-slate-800 border border-slate-700 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white py-3 font-bold rounded-xl mt-4 transition-all shadow-lg shadow-orange-500/20"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (isLogin ? 'Sign in' : 'Create Account')}
              </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-slate-800">
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
              >
                {isLogin ? "Don't have an account? Create one" : "Already registered? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-mono gap-4">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <div className="animate-pulse">Initializing OS...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}










