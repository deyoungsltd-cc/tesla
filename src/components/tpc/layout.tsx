'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Users,
  Shield,
  User,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  Bell,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

type PageKey =
  | 'dashboard'
  | 'plans'
  | 'deposits'
  | 'withdrawals'
  | 'investments'
  | 'referral'
  | 'kyc'
  | 'profile'
  | 'support'
  | 'admin';

interface LayoutProps {
  children: React.ReactNode;
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  pageTitle: string;
}

const navItems: { key: PageKey; label: string; icon: React.ElementType; adminOnly?: boolean }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'plans', label: 'Plans', icon: TrendingUp },
  { key: 'deposits', label: 'Deposits', icon: ArrowDownCircle },
  { key: 'withdrawals', label: 'Withdrawals', icon: ArrowUpCircle },
  { key: 'investments', label: 'Investments', icon: BarChart3 },
  { key: 'referral', label: 'Referral', icon: Users },
  { key: 'kyc', label: 'KYC', icon: Shield },
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'support', label: 'Support', icon: HelpCircle },
  { key: 'admin', label: 'Admin Panel', icon: Settings, adminOnly: true },
];

function TeslaLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-red glow-red-sm">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6L12 2z" fill="white" opacity="0.15"/>
          <path d="M12 4L6 7v5c0 4.42 3.13 8.55 6 9.5 2.87-.95 6-5.08 6-9.5V7L12 4z" stroke="white" strokeWidth="1.5" fill="none"/>
          <text x="12" y="15" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">T</text>
        </svg>
      </div>
      <div className="flex items-baseline">
        <span className="text-base font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
          TPC
        </span>
        <span className="text-base font-bold tracking-tight text-red-500" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
          .
        </span>
      </div>
    </div>
  );
}

function SidebarContent({
  activePage,
  onNavigate,
  onLogout,
  isAdminUser,
}: {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  onLogout: () => void;
  isAdminUser: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center px-5 border-b border-white/[0.04]">
        <TeslaLogo />
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdminUser) return null;
            const isActive = activePage === item.key;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`
                  group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                  transition-all duration-200 outline-none
                  ${
                    isActive
                      ? 'bg-red-600/10 text-red-400'
                      : 'text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-300'
                  }
                `}
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-red-500' : 'text-neutral-600 group-hover:text-neutral-400'}`} />
                <span>{item.label}</span>
                {item.key === 'admin' && (
                  <Badge variant="outline" className="ml-auto border-red-600/20 text-[9px] text-red-400 px-1.5 py-0">
                    Admin
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom: Logout */}
      <div className="border-t border-white/[0.04] p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-500 transition-all duration-200 hover:bg-red-600/5 hover:text-red-400 outline-none"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default function Layout({ children, activePage, onNavigate, pageTitle }: LayoutProps) {
  const { user, logout, setUser, isAdmin } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [modeLoading, setModeLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdminUser = isAdmin();

  useEffect(() => {
    if (user) setIsLive(user.activeMode === 'live');
  }, [user]);

  useEffect(() => {
    api.notifications
      .unreadCount()
      .then((data: any) => setUnreadCount(data.count || 0))
      .catch(() => {});
  }, []);

  const handleModeToggle = async (checked: boolean) => {
    const newMode = checked ? 'live' : 'demo';
    setModeLoading(true);
    try {
      const updatedUser = await api.user.setMode(newMode);
      if (updatedUser.user) setUser(updatedUser.user);
      else if (updatedUser) setUser(updatedUser as any);
      setIsLive(checked);
    } catch {} finally { setModeLoading(false); }
  };

  const handleLogout = () => logout();
  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-[#050505] border-r border-white/[0.04]">
        <SidebarContent activePage={activePage} onNavigate={onNavigate} onLogout={handleLogout} isAdminUser={isAdminUser} />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.04] bg-black/80 backdrop-blur-xl px-4 lg:px-5">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-neutral-400 hover:text-white hover:bg-white/5">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 bg-[#050505] border-white/[0.04] p-0">
                <SidebarContent
                  activePage={activePage}
                  onNavigate={(page) => { onNavigate(page); setSidebarOpen(false); }}
                  onLogout={() => { handleLogout(); setSidebarOpen(false); }}
                  isAdminUser={isAdminUser}
                />
              </SheetContent>
            </Sheet>

            <TeslaLogo className="lg:hidden" />

            {/* Breadcrumb-style title */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs text-neutral-600">Dashboard</span>
              <ChevronRight className="w-3 h-3 text-neutral-700" />
              <span className="text-sm font-medium text-white">{pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Demo/Live Toggle */}
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-1.5">
              {modeLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500" />
              ) : (
                <>
                  <span className={`text-[11px] font-medium ${!isLive ? 'text-white' : 'text-neutral-600'}`}>Demo</span>
                  <Switch
                    checked={isLive}
                    onCheckedChange={handleModeToggle}
                    className="data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-neutral-700"
                  />
                  <span className={`text-[11px] font-medium ${isLive ? 'text-red-500' : 'text-neutral-600'}`}>Live</span>
                </>
              )}
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-neutral-500 hover:text-white hover:bg-white/5 h-8 w-8">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            <Separator orientation="vertical" className="mx-0.5 h-5 bg-white/[0.04]" />

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center gap-2 px-1.5 hover:bg-white/5 h-8">
                  <Avatar className="size-7 border border-white/[0.06]">
                    {user?.profile?.avatarUrl && <AvatarImage src={user.profile.avatarUrl} alt={user.email} />}
                    <AvatarFallback className="bg-red-600/15 text-red-400 text-[10px] font-semibold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block max-w-[100px] truncate text-xs text-neutral-400">
                    {user?.profile?.firstName || user?.email?.split('@')[0] || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 bg-[#111] border-white/[0.06]">
                <DropdownMenuLabel className="text-neutral-400">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-white">
                      {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}` : user?.email?.split('@')[0]}
                    </span>
                    <span className="text-[11px] text-neutral-500">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/[0.04]" />
                <DropdownMenuItem onClick={() => onNavigate('profile')} className="text-neutral-300 hover:text-white cursor-pointer focus:bg-white/[0.03]">
                  <User className="mr-2 w-4 h-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('kyc')} className="text-neutral-300 hover:text-white cursor-pointer focus:bg-white/[0.03]">
                  <Shield className="mr-2 w-4 h-4" /> KYC Verification
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('support')} className="text-neutral-300 hover:text-white cursor-pointer focus:bg-white/[0.03]">
                  <HelpCircle className="mr-2 w-4 h-4" /> Support
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/[0.04]" />
                <DropdownMenuItem onClick={handleLogout} variant="destructive" className="text-red-400 hover:text-red-300 cursor-pointer focus:bg-red-600/5">
                  <LogOut className="mr-2 w-4 h-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-black">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}