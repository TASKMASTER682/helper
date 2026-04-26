'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { subscriptionAPI } from '@/lib/api';
import { 
  CreditCard, Check, Crown, Sparkles, Shield, 
  Clock, Calendar, AlertTriangle, Loader2,
  Zap, Star, ShieldCheck, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface Plan {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  durationUnit: string;
  features: string[];
  isActive: boolean;
}

interface SubscriptionStatus {
  hasSubscription: boolean;
  status: string;
  planName: string;
  endDate: string | null;
  daysRemaining: number;
}

export default function SubscriptionPage() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansRes, statusRes] = await Promise.all([
        subscriptionAPI.getPlans(),
        subscriptionAPI.getStatus()
      ]);
      setPlans(plansRes.data);
      setStatus(statusRes.data);
    } catch (err) {
      console.error('Failed to load subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId: string) => {
    setPurchasing(planId);
    try {
      const { data } = await subscriptionAPI.purchase({ planId, paymentId: 'demo_payment' });
      toast.success(data.message);
      loadData();
      
      // Refresh user to get updated subscription status
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-ink-800 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-ink-400" />
        </Link>
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Premium Subscription
          </h1>
          <p className="text-ink-500 text-sm mt-1">Unlock all courses and features</p>
        </div>
      </div>

      {status?.hasSubscription && status?.status === 'active' && (
        <div className="glass-card p-6 border border-jade-500/30 bg-gradient-to-r from-jade-500/10 to-transparent">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-jade-500/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-jade-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-jade-400">Active Subscription</h3>
                <span className="px-2 py-0.5 bg-jade-500/20 text-jade-400 text-xs font-bold rounded">
                  {status.planName}
                </span>
              </div>
              <p className="text-ink-400 text-sm">
                Your subscription is active. Enjoy unlimited access to all courses!
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-ink-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {status.daysRemaining} days remaining
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Expires: {new Date(status.endDate!).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const isPopular = plan.name === 'Yearly';
          const isPurchasing = purchasing === plan._id;
          const isCurrentPlan = status?.planName === plan.name && status?.hasSubscription;

          return (
            <div
              key={plan._id}
              className={clsx(
                'relative rounded-2xl transition-all duration-300 hover:scale-[1.02]',
                isPopular 
                  ? 'glass-card p-6 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/10' 
                  : 'glass-card p-6'
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-ink-950 px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    BEST VALUE
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div className={clsx(
                  'w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center',
                  isPopular 
                    ? 'bg-gradient-to-br from-yellow-500/30 to-yellow-600/20' 
                    : 'bg-ink-800/50'
                )}>
                  {index === 0 ? (
                    <Star className="w-7 h-7 text-yellow-400" />
                  ) : index === 1 ? (
                    <Zap className="w-7 h-7 text-yellow-400" />
                  ) : (
                    <Crown className="w-7 h-7 text-yellow-400" />
                  )}
                </div>
                <h3 className="font-display text-xl font-bold text-ink-100 mb-1">
                  {plan.name}
                </h3>
                <p className="text-ink-500 text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-ink-100">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-ink-500 text-sm">/ {plan.duration} {plan.durationUnit}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className={clsx(
                      'w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                      isPopular ? 'bg-yellow-500/20' : 'bg-ink-800'
                    )}>
                      <Check className={clsx(
                        'w-3 h-3',
                        isPopular ? 'text-yellow-400' : 'text-jade-400'
                      )} />
                    </div>
                    <span className="text-ink-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(plan._id)}
                disabled={isPurchasing || isCurrentPlan}
                className={clsx(
                  'w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
                  isCurrentPlan 
                    ? 'bg-jade-500/20 text-jade-400 cursor-not-allowed'
                    : isPopular
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-ink-950 hover:shadow-lg hover:shadow-yellow-500/30'
                    : 'bg-ink-800 text-ink-200 hover:bg-ink-700 border border-ink-700'
                )}
              >
                {isPurchasing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCurrentPlan ? (
                  <>
                    <Check className="w-4 h-4" />
                    Current Plan
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Subscribe Now
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display text-lg font-semibold text-ink-100 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-yellow-400" />
          Secure Learning Environment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-ink-900/50 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-deep-500/20 flex items-center justify-center mb-3">
              <span className="text-deep-400 text-xl font-bold">1</span>
            </div>
            <h4 className="font-semibold text-ink-200 mb-1">Single Device Access</h4>
            <p className="text-xs text-ink-500">Your account is linked to one device at a time for security</p>
          </div>
          <div className="p-4 bg-ink-900/50 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-jade-500/20 flex items-center justify-center mb-3">
              <span className="text-jade-400 text-xl font-bold">2</span>
            </div>
            <h4 className="font-semibold text-ink-200 mb-1">Dynamic Watermarks</h4>
            <p className="text-xs text-ink-500">Your session info is visible on videos to prevent sharing</p>
          </div>
          <div className="p-4 bg-ink-900/50 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-saffron-500/20 flex items-center justify-center mb-3">
              <span className="text-saffron-400 text-xl font-bold">3</span>
            </div>
            <h4 className="font-semibold text-ink-200 mb-1">Secure Playback</h4>
            <p className="text-xs text-ink-500">Videos play only on our platform with content protection</p>
          </div>
        </div>
      </div>
    </div>
  );
}