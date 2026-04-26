'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function DevToolsGuard() {
  const { logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    let devtoolsOpen = false;

    const detect = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      // Detection using console.log + getter (still works in some browsers/versions)
      const devtools = {
        isOpen: false,
        orientation: undefined
      };
      
      const threshold = 160;
      const emitEvent = (isOpen: boolean) => {
        if (isOpen && !devtoolsOpen) {
          devtoolsOpen = true;
          handleViolation();
        }
      };

      const handleViolation = () => {
        toast.error('Security Violation: Developer Tools detected.', {
          duration: 5000,
          icon: '🚫'
        });
        setTimeout(() => {
          logout();
          router.push('/login');
        }, 1500);
      };

      // Check window dimensions
      if (widthThreshold || heightThreshold) {
        emitEvent(true);
      }

      // Check using debugger timing
      const start = performance.now();
      (function() {}.constructor('debugger')());
      const end = performance.now();
      if (end - start > 100) {
        emitEvent(true);
      }
    };

    // Run detection periodically
    const interval = setInterval(detect, 2000);

    // Also detect on window resize
    window.addEventListener('resize', detect);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', detect);
    };
  }, [logout, router]);

  return null;
}
