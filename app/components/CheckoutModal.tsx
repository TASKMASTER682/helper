'use client';
import { useState, useEffect } from 'react';
import { X, CreditCard, Send, CheckCircle2, Loader2, ShieldCheck, MessageSquare, AlertCircle, Lock as LockIcon, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { paymentsAPI, settingsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface CheckoutModalProps {
  course: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ course, onClose, onSuccess }: CheckoutModalProps) {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'info' | 'processing' | 'success'>('info');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data } = await settingsAPI.getConfig();
      setConfig(data);
    } catch (err) {
      toast.error('Failed to initialize payment systems');
    } finally {
      setLoading(false);
    }
  };

  const calculateEffectivePrice = () => {
    if (!course) return 0;
    let price = course.price;
    
    // Course specific discount
    if (course.discountPrice && (!course.discountExpiry || new Date(course.discountExpiry) > new Date())) {
      price = course.discountPrice;
    }

    // Global discount
    if (config?.globalDiscount?.isActive) {
      const reduction = (price * config.globalDiscount.percentage) / 100;
      price = price - reduction;
    }

    return Math.max(0, Math.round(price));
  };

  const effectivePrice = calculateEffectivePrice();

  const handleRazorpay = async () => {
    try {
      setProcessing(true);
      const { data: order } = await paymentsAPI.createOrder(course._id);

      if (order.success && order.message) {
        // Free course bypass
        setStep('success');
        onSuccess();
        return;
      }

      const options = {
        key: config.razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: "UPSC-POS Academy",
        description: `Enrollment for ${course.title}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            setStep('processing');
            await paymentsAPI.verifyPayment({
              ...response,
              courseId: course._id
            });
            setStep('success');
            onSuccess();
          } catch (err: any) {
            toast.error(err.response?.data?.error || 'Verification failed');
            setStep('info');
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        theme: {
          color: "#eab308"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to initiate order');
    } finally {
      setProcessing(false);
    }
  };

  const { user } = useAuthStore();

  const handleManualPayment = () => {
    if (!config?.telegramLink) return;
    
    const message = encodeURIComponent(
      `🚀 *NEW ENROLLMENT REQUEST*\n\n` +
      `📌 *Module:* ${course.title}\n` +
      `💰 *Amount:* ₹${effectivePrice}\n\n` +
      `👤 *User Details:*\n` +
      `- Name: ${user?.name || 'N/A'}\n` +
      `- Email: ${user?.email || 'N/A'}\n` +
      `- ID: ${user?._id || 'N/A'}\n\n` +
      `Please share the scan code so I can make the payment. I want to buy this course.`
    );

    window.open(`${config.telegramLink}?text=${message}`, '_blank');
    toast.success('Directing to Admin Telegram with enrollment data');
  };

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-card overflow-hidden border-ink-800 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 blur-[100px] rounded-full -ml-32 -mb-32" />

        <div className="relative z-10 p-8">
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-yellow-500" />
                </div>
                <span className="text-[10px] font-black text-ink-500 uppercase tracking-[0.2em]">Secure Checkout Gateway</span>
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Access Protocol</h2>
            </div>
            <button onClick={onClose} className="p-2 bg-ink-900 rounded-xl hover:bg-ink-800 transition-colors">
              <X className="w-5 h-5 text-ink-400" />
            </button>
          </div>

          {step === 'info' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              {/* Course Brief */}
              <div className="flex gap-4 p-4 bg-ink-950/50 rounded-2xl border border-ink-800/50">
                <img src={course.thumbnail} className="w-20 h-20 rounded-xl object-cover border border-ink-800" />
                <div className="flex-1">
                  <h3 className="text-sm font-black text-white leading-tight mb-1">{course.title}</h3>
                  <p className="text-[10px] text-ink-500 font-bold uppercase tracking-widest">{course.instructor || 'Academy Expert'}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div>
                      <p className="text-[8px] font-black text-ink-600 uppercase tracking-widest mb-0.5">Price</p>
                      <p className="text-lg font-black text-white leading-none">₹{effectivePrice}</p>
                    </div>
                    {course.price > effectivePrice && (
                      <div className="line-through text-ink-700 text-sm font-bold mt-2">
                        ₹{course.price}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-4">
                {config.paymentMethod === 'razorpay' ? (
                  <button 
                    disabled={processing}
                    onClick={handleRazorpay}
                    className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-ink-950 font-black rounded-2xl transition-all shadow-xl shadow-yellow-500/10 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]"
                  >
                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                    Initialize Automated Payment
                  </button>
                ) : (
                  <div className="space-y-4">
                    <button 
                      onClick={handleManualPayment}
                      className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/10 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Contact Admin via Telegram
                    </button>
                    <div className="p-4 bg-ink-900/50 border border-ink-800 rounded-xl flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
                      <p className="text-[9px] text-ink-400 font-bold leading-relaxed uppercase tracking-widest">
                        Automated payments are currently offline. Please coordinate with the administrator for manual enrollment and verification.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Trust Markers */}
              <div className="flex items-center justify-center gap-6 pt-6 border-t border-ink-800/30">
                <div className="flex items-center gap-2 text-[8px] font-black text-ink-600 uppercase tracking-[0.2em]">
                  <LockIcon className="w-3 h-3" /> Encrypted Socket
                </div>
                <div className="flex items-center gap-2 text-[8px] font-black text-ink-600 uppercase tracking-[0.2em]">
                  <CheckCircle2 className="w-3 h-3" /> PCI Compliant
                </div>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-20 text-center animate-pulse">
              <RefreshCw className="w-16 h-16 text-yellow-500 mx-auto mb-8 animate-spin-slow" />
              <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Syncing Transaction</h3>
              <p className="text-xs text-ink-500 font-bold uppercase tracking-widest">Verifying block integrity. Do not close terminal.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-10 text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-teal-500/20">
                <CheckCircle2 className="w-12 h-12 text-teal-500" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Clearance Granted</h3>
              <p className="text-xs text-ink-500 font-bold uppercase tracking-widest mb-10 max-w-xs mx-auto leading-relaxed">
                Your credentials have been verified. Access to the module has been permanently synchronized to your profile.
              </p>
              <button 
                onClick={onClose}
                className="px-12 py-4 bg-teal-500 hover:bg-teal-400 text-ink-950 font-black rounded-2xl transition-all shadow-xl shadow-teal-500/10 uppercase text-xs tracking-[0.2em]"
              >
                Access Module
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
