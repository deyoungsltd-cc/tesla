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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
      <div className="flex h-16 items-center gap-3 border-b border-[#262626] px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-red">
          <span className="text-sm font-bold text-white">T</span>
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-white">
            TPC
          </span>
          <span className="text-lg font-bold tracking-tight text-red-500">
            .
          </span>
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdminUser) return null;
            const isActive = activePage === item.key;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`
                  group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                  transition-all duration-200 outline-none
                  ${
                    isActive
                      ? 'bg-red-600/10 text-red-500 border-l-2 border-red-600'
                      : 'text-neutral-400 hover:bg-[#1a1a1a] hover:text-neutral-200 border-l-2 border-transparent'
                  }
                `}
              >
                <Icon className={`size-5 shrink-0 ${isActive ? 'text-red-500' : 'text-neutral-500 group-hover:text-neutral-300'}`} />
                <span>{item.label}</span>
                {item.key === 'admin' && (
                  <Badge variant="outline" className="ml-auto border-red-600/30 text-[10px] text-red-400">
                    Admin
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom: Logout */}
      <div className="border-t border-[#262626] p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-400 transition-all duration-200 hover:bg-red-600/10 hover:text-red-500 border-l-2 border-transparent outline-none"
        >
          <LogOut className="size-5 text-neutral-500" />
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
    if (user) {
      setIsLive(user.activeMode === 'live');
    }
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
      if (updatedUser.user) {
        setUser(updatedUser.user);
      } else if (updatedUser) {
        setUser(updatedUser as any);
      }
      setIsLive(checked);
    } catch {
      // silently fail
    } finally {
      setModeLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0a]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#0f0f0f] border-r border-[#262626]">
        <SidebarContent
          activePage={activePage}
          onNavigate={onNavigate}
          onLogout={handleLogout}
          isAdminUser={isAdminUser}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#262626] bg-[#0a0a0a] px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-neutral-400 hover:text-white">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-[#0f0f0f] border-[#262626] p-0">
                <SidebarContent
                  activePage={activePage}
                  onNavigate={(page) => {
                    onNavigate(page);
                    setSidebarOpen(false);
                  }}
                  onLogout={() => {
                    handleLogout();
                    setSidebarOpen(false);
                  }}
                  isAdminUser={isAdminUser}
                />
              </SheetContent>
            </Sheet>

            {/* Mobile brand */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-red">
                <span className="text-xs font-bold text-white">T</span>
              </div>
              <span className="text-sm font-bold text-white">TPC<span className="text-red-500">.</span></span>
            </div>

            <h1 className="hidden lg:block text-lg font-semibold text-white">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Demo/Live Toggle */}
            <div className="flex items-center gap-2 rounded-lg bg-[#141414] border border-[#262626] px-3 py-1.5">
              {modeLoading ? (
                <Loader2 className="size-3.5 animate-spin text-neutral-400" />
              ) : (
                <>
                  <span className={`text-xs font-medium ${!isLive ? 'text-white' : 'text-neutral-500'}`}>Demo</span>
                  <Switch
                    checked={isLive}
                    onCheckedChange={handleModeToggle}
                    className="data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-[#333]"
                  />
                  <span className={`text-xs font-medium ${isLive ? 'text-red-500' : 'text-neutral-500'}`}>Live</span>
                </>
              )}
            </div>

            {/* Notifications */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-neutral-400 hover:text-white"
                  onClick={() => {}}
                >
                  <Bell className="size-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-6 bg-[#262626]" />

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center gap-2 px-2 hover:bg-[#1a1a1a]">
                  <Avatar className="size-8 border border-[#262626]">
                    {user?.profile?.avatarUrl && (
                      <AvatarImage src={user.profile.avatarUrl} alt={user.email} />
                    )}
                    <AvatarFallback className="bg-red-600/20 text-red-400 text-xs font-semibold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block max-w-[120px] truncate text-sm text-neutral-300">
                    {user?.profile?.firstName || user?.email?.split('@')[0] || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#141414] border-[#262626]">
                <DropdownMenuLabel className="text-neutral-400">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-white">
                      {user?.profile?.firstName
                        ? `${user.profile.firstName} ${user.profile.lastName || ''}`
                        : user?.email?.split('@')[0]}
                    </span>
                    <span className="text-xs">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#262626]" />
                <DropdownMenuItem
                  onClick={() => onNavigate('profile')}
                  className="text-neutral-300 hover:text-white cursor-pointer focus:bg-[#1a1a1a] focus:text-white"
                >
                  <User className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onNavigate('kyc')}
                  className="text-neutral-300 hover:text-white cursor-pointer focus:bg-[#1a1a1a] focus:text-white"
                >
                  <Shield className="mr-2 size-4" />
                  KYC Verification
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onNavigate('support')}
                  className="text-neutral-300 hover:text-white cursor-pointer focus:bg-[#1a1a1a] focus:text-white"
                >
                  <HelpCircle className="mr-2 size-4" />
                  Support
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#262626]" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  variant="destructive"
                  className="text-red-400 hover:text-red-300 cursor-pointer focus:bg-red-600/10 focus:text-red-400"
                >
                  <LogOut className="mr-2 size-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}