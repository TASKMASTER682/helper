'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Target, BarChart3, MessageCircle,
  FlaskConical, User, LogOut, Flame, Trophy, Zap, Brain, FileSearch, 
  ChevronRight, Menu, X, Shield, Youtube, File, Play, Calendar, Activity,
  Newspaper
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/plans', icon: Calendar, label: 'Daily Plans' },
  { href: '/dashboard/missions', icon: Trophy, label: 'Missions' },
  { href: '/dashboard/youtube', icon: Youtube, label: 'YouTube Courses' },
  { href: '/dashboard/courses', icon: Play, label: 'Premium Courses' },
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
  { href: '/dashboard/quiz', icon: Activity, label: 'Rapid Quiz' },
  { href: '/dashboard/editorial-engine', icon: Brain, label: 'Editorial Engine' },
  { href: '/dashboard/prelims-news', icon: Newspaper, label: 'Prelims News' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
];

const adminNavItems = [
  { href: '/dashboard/admin', icon: Shield, label: 'Admin Panel' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

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
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#5C2536] border-b border-[#FFB6C1]/20 px-4 flex items-center justify-between z-[100]">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-[#FAF7EE]" />
          <span className="font-display font-bold text-[#FAF7EE]">UPSC-POS</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => { if (e.key === 'Escape') setIsOpen(false); }}
          aria-expanded={isOpen}
          aria-controls="sidebar-menu"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="p-2 rounded-lg bg-[#7A3045] border border-[#FFB6C1]/30 text-[#FAF7EE] active:scale-95 transition-all"
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
      <aside
        id="sidebar-menu"
        role="dialog"
        aria-modal={isOpen}
        aria-label="Navigation sidebar"
        className={clsx(
        "min-h-screen bg-[#5C2536] border-r border-[#FFB6C1]/15 flex flex-col fixed left-0 top-0 bottom-0 z-[51] transition-all duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <div className="p-3 flex items-center justify-between overflow-hidden">
          <Link href="/" className={clsx("flex items-center gap-3 transition-transform active:scale-95 shrink-0", isCollapsed && "justify-center w-full")}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#D14545] flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="font-display text-lg font-bold text-[#FAF7EE] leading-none tracking-tight">
                  UPSC-POS
                </div>
                <div className="text-[10px] font-mono text-[#FAF7EE]/80 uppercase tracking-[0.2em] mt-1">
                  v1.0.2
                </div>
              </div>
            )}
          </Link>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={clsx("p-1.5 rounded-lg bg-[#7A3045]/50 border border-[#FFB6C1]/20 text-[#FAF7EE]/70 hover:text-[#FAF7EE] hover:border-[#FFB6C1]/40 transition-all shrink-0", isCollapsed && "absolute right-1")}
          >
            <ChevronRight className={clsx("w-4 h-4 transition-transform", isCollapsed ? "rotate-0" : "rotate-180")} />
          </button>
        </div>
        <div className="h-16 lg:hidden" />
        
        {!isCollapsed ? (
          <div className="px-4 mb-4">
            <div className="bg-[#7A3045]/50 border border-[#FFB6C1]/20 rounded-2xl p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#914A5C] border border-[#FFB6C1]/30 flex items-center justify-center text-xs font-bold text-[#FAF7EE] uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#FAF7EE] truncate">{user?.name || 'Aspirant'}</p>
                  <p className="text-[10px] text-[#FAF7EE]/70 font-mono">{user?.role === 'admin' ? 'Admin' : 'Rank: Commander'}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <StatBox icon={Flame} value={`${streak}d`} color="text-[#FAF7EE]" />
                <StatBox icon={Trophy} value={confidence} color="text-[#FAF7EE]" />
                <StatBox icon={Zap} value={user?.profile?.attemptYear || '2026'} color="text-[#FAF7EE]" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 px-1 mb-2 overflow-y-auto max-h-32">
            <StatBox icon={Flame} value={`${streak}d`} color="text-[#FAF7EE]" collapsed />
            <StatBox icon={Trophy} value={confidence} color="text-[#FAF7EE]" collapsed />
            <StatBox icon={Zap} value={user?.profile?.attemptYear || '2026'} color="text-[#FAF7EE]" collapsed />
          </div>
        )}
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto custom-scrollbar">
          {user?.role === 'admin' && (
            <div className="py-2">
              {!isCollapsed && (
                <div className="flex items-center gap-3 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-1 text-[#FAF7EE]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </div>
              )}
              <div className={clsx("space-y-1", isCollapsed ? "flex flex-col items-center" : "ml-3 pl-2 border-l border-[#FFB6C1]/30")}>
                {adminNavItems.map(item => (
                  <NavItem 
                    key={item.href} 
                    href={item.href} 
                    icon={item.icon} 
                    label={item.label} 
                    active={isActive(item.href)}
                    collapsed={isCollapsed}
                  />
                ))}
              </div>
            </div>
          )}
          {navItems.map(item => {
            if (item.children) {
              const groupActive = item.children.some(c => isActive(c.href));
              return (
                <div key={item.href} className="py-2">
                  {!isCollapsed && (
                    <div className={clsx(
                      "flex items-center gap-3 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] mb-1",
                      groupActive ? "text-[#FAF7EE]" : "text-[#FAF7EE]/50"
                    )}>
                      <item.icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </div>
                  )}
                  <div className={clsx("space-y-1", isCollapsed ? "flex flex-col items-center" : "ml-3 pl-2 border-l border-[#FFB6C1]/20")}>
                    {item.children.map(child => (
                      <NavItem 
                        key={child.href} 
                        href={child.href} 
                        icon={child.icon} 
                        label={child.label} 
                        active={isActive(child.href)}
                        isAI={child.href.includes('mock-test')}
                        collapsed={isCollapsed}
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
                collapsed={isCollapsed}
              />
            );
          })}
        </nav>
        <div className={clsx("bg-[#5C2536] border-t border-[#FFB6C1]/15 mt-auto", isCollapsed ? "p-2" : "p-4")}>
          <button
            onClick={handleLogout}
            className={clsx("group flex items-center gap-3 text-[#FAF7EE]/70 hover:text-[#FAF7EE] hover:bg-[#7A3045]/50 rounded-xl transition-all duration-300", isCollapsed ? "justify-center p-2" : "px-4 py-3 w-full")}
          >
            <LogOut className={clsx("w-4 h-4", isCollapsed ? "" : "group-hover:-translate-x-1 transition-transform")} />
            {!isCollapsed && <span className="text-sm font-medium">System Shutdown</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

function NavItem({ href, icon: Icon, label, active, isAI, hasPulse, collapsed }: any) {
  return (
    <Link href={href} title={collapsed ? label : undefined}>
      <div className={clsx(
        "group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden",
        collapsed ? "justify-center px-2" : "",
        active 
          ? "bg-[#FFB6C1] text-[#2B2219] shadow-md font-bold" 
          : "text-[#FAF7EE]/70 hover:text-[#FAF7EE] hover:bg-[#7A3045]/60"
      )}>
        {active && !collapsed && (
          <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#D14545] rounded-full" />
        )}
        
        <Icon className={clsx("w-5 h-5 shrink-0", active ? "text-[#5C2536]" : "text-[#FAF7EE]/60 group-hover:text-[#FAF7EE]")} />
        
        {!collapsed && (
          <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            {label}
          </span>
        )}

        {isAI && !collapsed && (
          <span className={clsx(
            "ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded border",
            active 
              ? "bg-[#D14545]/10 text-[#5C2536] border-[#5C2536]/20" 
              : "bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20"
          )}>
            AI
          </span>
        )}

        {hasPulse && !active && !collapsed && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-pulse" />
        )}
        
        {active && !collapsed && <ChevronRight className="ml-auto w-3.5 h-3.5 opacity-50" />}
      </div>
    </Link>
  );
}

function StatBox({ icon: Icon, value, color, collapsed }: any) {
  return (
    <div className={clsx("bg-[#5C2536]/60 rounded-lg p-1.5 flex flex-col items-center justify-center border border-[#FFB6C1]/15", collapsed ? "w-8 h-8" : "")}>
      <Icon className={clsx("w-3 h-3 mb-1", color)} />
      {!collapsed && <span className="text-[10px] font-mono font-bold text-[#FAF7EE]">{value}</span>}
    </div>
  );
}
