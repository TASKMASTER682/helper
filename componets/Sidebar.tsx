
'use client';
import { useState, useEffect } from 'react'; // Toggle state ke liye
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Target, BarChart3, MessageCircle,
  FlaskConical, User, LogOut, Flame, Trophy, Zap, Brain, FileSearch, 
  ChevronRight, Menu, X // Mobile icons add kiye
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/library', icon: BookOpen, label: 'Library Shelf' },
  { href: '/dashboard/missions', icon: Target, label: 'Missions' },
  { href: '/dashboard/tracker', icon: BarChart3, label: 'Daily Tracker' },
  {
    href: '/dashboard/tests',
    icon: FlaskConical,
    label: 'Test Series',
    children: [
      { href: '/dashboard/tests', icon: FlaskConical, label: 'Manual Tests' },
      { href: '/dashboard/mock-test', icon: FileSearch, label: 'Mock Test Engine' },
    ]
  },
  { href: '/dashboard/mentor', icon: MessageCircle, label: 'AI Mentor' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle state
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const streak = user?.stats?.studyStreak || 0;
  const confidence = user?.stats?.confidenceScore || 50;

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <>
<div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-ink-950 border-b border-ink-800/40 px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-yellow-500" />
          <span className="font-display font-bold text-ink-100">UPSC-POS</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-ink-900 border border-ink-800 text-yellow-500 active:scale-95 transition-all"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
{isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
<aside className={clsx(
        "w-64 min-h-screen bg-ink-950 border-r border-ink-800/40 flex flex-col fixed left-0 top-0 bottom-0 z-[51] transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full" // Mobile slide logic
      )}>
<div className="p-6 hidden lg:block">
          <Link href="/" className="group flex items-center gap-3 transition-transform active:scale-95">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center shadow-lg shadow-yellow-900/20 group-hover:shadow-yellow-500/40 transition-all">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-ink-100 leading-none tracking-tight">
                UPSC-POS
              </div>
              <div className="text-[10px] font-mono text-yellow-500/80 uppercase tracking-[0.2em] mt-1">
                v1.0.2
              </div>
            </div>
          </Link>
        </div>
<div className="h-20 lg:hidden" />
<div className="px-4 mb-4">
          <div className="bg-ink-900/40 border border-ink-800/50 rounded-2xl p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center text-xs font-bold text-yellow-400 uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-100 truncate">{user?.name || 'Aspirant'}</p>
                <p className="text-[10px] text-ink-500 font-mono">Rank: Commander</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <StatBox icon={Flame} value={`${streak}d`} color="text-yellow-400" />
              <StatBox icon={Trophy} value={confidence} color="text-jade-400" />
              <StatBox icon={Zap} value={user?.profile?.attemptYear || '2026'} color="text-deep-400" />
            </div>
          </div>
        </div>
<nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map(item => {
            if (item.children) {
              const groupActive = item.children.some(c => isActive(c.href));
              return (
                <div key={item.href} className="py-2">
                  <div className={clsx(
                    "flex items-center gap-3 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-1",
                    groupActive ? "text-yellow-400" : "text-ink-600"
                  )}>
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </div>
                  <div className="ml-3 pl-2 border-l border-ink-800/50 space-y-1">
                    {item.children.map(child => (
                      <NavItem 
                        key={child.href} 
                        href={child.href} 
                        icon={child.icon} 
                        label={child.label} 
                        active={isActive(child.href)}
                        isAI={child.href.includes('mock-test')}
                      />
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <NavItem 
                key={item.href} 
                href={item.href} 
                icon={item.icon} 
                label={item.label} 
                active={isActive(item.href)}
                hasPulse={item.href === '/dashboard/missions'}
              />
            );
          })}
        </nav>
<div className="p-4 bg-ink-950/80 backdrop-blur-sm border-t border-ink-800/40 mt-auto">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center gap-3 px-4 py-3 text-ink-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-300"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">System Shutdown</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function NavItem({ href, icon: Icon, label, active, isAI, hasPulse }: any) {
  return (
    <Link href={href}>
      <div className={clsx(
        "group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden",
        active 
          ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" 
          : "text-ink-400 hover:text-ink-100 hover:bg-ink-900/60"
      )}>
        {active && (
          <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
        )}
        
        <Icon className={clsx("w-5 h-5 shrink-0", active ? "text-yellow-400" : "text-ink-500 group-hover:text-ink-300")} />
        
        <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
          {label}
        </span>

        {isAI && (
          <span className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
            AI
          </span>
        )}

        {hasPulse && !active && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
        )}
        
        {active && <ChevronRight className="ml-auto w-3.5 h-3.5 opacity-50" />}
      </div>
    </Link>
  );
}

function StatBox({ icon: Icon, value, color }: any) {
  return (
    <div className="bg-ink-950/50 rounded-lg p-1.5 flex flex-col items-center justify-center border border-ink-800/30">
      <Icon className={clsx("w-3 h-3 mb-1", color)} />
      <span className="text-[10px] font-mono font-bold text-ink-200">{value}</span>
    </div>
  );
}
