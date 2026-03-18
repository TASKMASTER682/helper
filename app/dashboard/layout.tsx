'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Sidebar from '../../componets/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, init, isInitializing } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!isInitializing && !token && !user) {
      router.push('/login');
    }
  }, [token, user, isInitializing, router]);

  if (isInitializing || !user) return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-saffron-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar />
      <main className="flex-1 ml-0 lg:ml-64 p-4 pt-20 lg:pt-6 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
