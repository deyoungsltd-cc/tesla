'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Wallet,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Plus,
  DollarSign,
  BarChart3,
  ShieldCheck,
  Loader2,
  ChevronRight,
} from 'lucide-react';

interface WalletData {
  demo: { balance: number; availableBalance: number; lockedBalance: number } | null;
  live: { balance: number; availableBalance: number; lockedBalance: number } | null;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
}

interface ActiveInvestment {
  id: string;
  planName: string;
  planTier: string;
  amount: number;
  dailyReturn: number;
  totalReturn: number;
  expectedTotalReturn: number;
  startDate: string;
  endDate: string;
  daysElapsed: number;
  totalDays: number;
}

interface AdminStats {
  totalDeposits: number;
  totalInvestments: number;
  activeInvestments: number;
  pendingWithdrawals: number;
  totalUsers: number;
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function txTypeColor(type: string) {
  switch (type?.toLowerCase()) {
    case 'deposit':
      return 'border-green-600/30 bg-green-600/10 text-green-400';
    case 'withdrawal':
      return 'border-yellow-600/30 bg-yellow-600/10 text-yellow-400';
    case 'investment':
      return 'border-blue-600/30 bg-blue-600/10 text-blue-400';
    case 'return':
    case 'earning':
      return 'border-red-600/30 bg-red-600/10 text-red-400';
    case 'referral':
      return 'border-purple-600/30 bg-purple-600/10 text-purple-400';
    default:
      return 'border-neutral-600/30 bg-neutral-600/10 text-neutral-400';
  }
}

function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'approved':
    case 'active':
      return 'border-green-600/30 bg-green-600/10 text-green-400';
    case 'pending':
      return 'border-yellow-600/30 bg-yellow-600/10 text-yellow-400';
    case 'failed':
    case 'rejected':
    case 'cancelled':
      return 'border-red-600/30 bg-red-600/10 text-red-400';
    default:
      return 'border-neutral-600/30 bg-neutral-600/10 text-neutral-400';
  }
}

function kycColor(level: string) {
  switch (level?.toLowerCase()) {
    case 'verified':
      return 'border-green-600/30 bg-green-600/10 text-green-400';
    case 'level2':
    case 'level_2':
      return 'border-blue-600/30 bg-blue-600/10 text-blue-400';
    default:
      return 'border-yellow-600/30 bg-yellow-600/10 text-yellow-400';
  }
}

function kycLabel(level: string) {
  switch (level?.toLowerCase()) {
    case 'verified':
    case 'level2':
    case 'level_2':
      return level;
    default:
      return level || 'Not Submitted';
  }
}

interface DashboardProps {
  navigate: (page: string) => void;
}

export default function Dashboard({ navigate }: DashboardProps) {
  const { user, isAdmin, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<WalletData>({ demo: null, live: null });
  const [activeInvestments, setActiveInvestments] = useState<ActiveInvestment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, investRes] = await Promise.allSettled([
        api.wallet.get(),
        api.investments.active(),
      ]);

      if (walletRes.status === 'fulfilled') {
        const wData = walletRes.value;
        const demo = wData.demo || wData.wallets?.find((w: any) => w.type === 'demo') || null;
        const live = wData.live || wData.wallets?.find((w: any) => w.type === 'live') || null;

        const normalizeWallet = (w: any) => {
          if (!w) return null;
          return {
            balance: w.balance ?? 0,
            availableBalance: w.availableBalance ?? 0,
            lockedBalance: w.lockedBalance ?? 0,
          };
        };

        setWalletData({
          demo: normalizeWallet(demo),
          live: normalizeWallet(live),
        });

        // Update user wallets in store if returned
        if (wData.user) setUser(wData.user);
      }

      if (investRes.status === 'fulfilled') {
        const invData = investRes.value;
        const list = invData.investments || invData.data || invData || [];
        setActiveInvestments(Array.isArray(list) ? list : []);
      }

      // Fetch recent transactions
      try {
        const txRes = await api.wallet.transactions('all', 'limit=5');
        const txList = txRes.transactions || txRes.data || txRes || [];
        setTransactions(Array.isArray(txList) ? txList : []);
      } catch {
        setTransactions([]);
      }

      // Admin stats
      if (isAdmin()) {
        try {
          const adminStats = await api.admin.stats();
          setStats(adminStats);
        } catch {
          // silent
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isAdmin, setUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeMode = user?.activeMode || 'demo';
  const activeWallet = activeMode === 'live' ? walletData.live : walletData.demo;
  const otherWallet = activeMode === 'live' ? walletData.demo : walletData.live;

  const handleSwitchMode = async (mode: 'demo' | 'live') => {
    if (mode === activeMode) return;
    try {
      const res = await api.user.setMode(mode);
      if (res.user) {
        setUser({ ...user!, activeMode: mode, wallets: user!.wallets } as any);
      }
    } catch {
      // silent
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-card border border-[#262626] rounded-xl p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white">
              Welcome back, {user?.profile?.firstName || user?.email?.split('@')[0] || 'Investor'}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Here&apos;s an overview of your investment portfolio.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${kycColor(user?.kycLevel || '')} border`}>
              <ShieldCheck className="h-3 w-3 mr-1" />
              KYC: {kycLabel(user?.kycLevel || '')}
            </Badge>
            <Badge
              variant="outline"
              className="border-[#333] text-xs text-neutral-400"
            >
              {activeMode === 'live' ? '🔴 Live Mode' : '⚪ Demo Mode'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Active Wallet */}
        <Card
          className={`border-2 cursor-pointer transition-all hover:scale-[1.01] ${
            activeMode === 'live'
              ? 'border-red-500/50 glow-red bg-gradient-card'
              : 'border-neutral-600/30 bg-gradient-card'
          }`}
          onClick={() => handleSwitchMode('live')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Live Wallet
              </CardTitle>
              {activeMode === 'live' && (
                <Badge className="bg-red-600/20 text-red-400 border-red-600/30 border text-[10px]">
                  ACTIVE
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-8 w-40 bg-[#1a1a1a]" />
                <Skeleton className="h-4 w-32 bg-[#1a1a1a]" />
                <Skeleton className="h-4 w-28 bg-[#1a1a1a]" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-white">
                  ${fmt(walletData.live?.balance ?? 0)}
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Available:</span>
                  <span className="text-green-400">${fmt(walletData.live?.availableBalance ?? 0)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Locked:</span>
                  <span className="text-yellow-400">${fmt(walletData.live?.lockedBalance ?? 0)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Demo/Other Wallet */}
        <Card
          className={`border-2 cursor-pointer transition-all hover:scale-[1.01] ${
            activeMode === 'demo'
              ? 'border-red-500/50 glow-red bg-gradient-card'
              : 'border-neutral-600/30 bg-gradient-card'
          }`}
          onClick={() => handleSwitchMode('demo')}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-neutral-400 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Demo Wallet
              </CardTitle>
              {activeMode === 'demo' && (
                <Badge className="bg-red-600/20 text-red-400 border-red-600/30 border text-[10px]">
                  ACTIVE
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-8 w-40 bg-[#1a1a1a]" />
                <Skeleton className="h-4 w-32 bg-[#1a1a1a]" />
                <Skeleton className="h-4 w-28 bg-[#1a1a1a]" />
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-white">
                  ${fmt(walletData.demo?.balance ?? 0)}
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Available:</span>
                  <span className="text-green-400">${fmt(walletData.demo?.availableBalance ?? 0)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Locked:</span>
                  <span className="text-yellow-400">${fmt(walletData.demo?.lockedBalance ?? 0)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="h-4 w-4 text-green-400" />}
          label="Total Deposits"
          value={stats ? `$${fmt(stats.totalDeposits)}` : '--'}
          loading={loading}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4 text-red-400" />}
          label="Total Investments"
          value={stats ? `$${fmt(stats.totalInvestments)}` : '--'}
          loading={loading}
        />
        <StatCard
          icon={<BarChart3 className="h-4 w-4 text-yellow-400" />}
          label="Active Investments"
          value={stats ? String(stats.activeInvestments) : '--'}
          loading={loading}
        />
        <StatCard
          icon={<Clock className="h-4 w-4 text-blue-400" />}
          label="Pending Withdrawals"
          value={stats ? String(stats.pendingWithdrawals) : '--'}
          loading={loading}
        />
      </div>

      {/* Recent Transactions + Active Investments */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        <Card className="border-[#262626] bg-gradient-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white">Recent Transactions</CardTitle>
              <Badge variant="outline" className="border-[#333] text-[10px] text-neutral-500">
                Last 5
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full bg-[#1a1a1a]" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
                <Clock className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No recent transactions</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#262626] hover:bg-transparent">
                      <TableHead className="text-[11px] text-neutral-500 font-medium">Date</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 font-medium">Type</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 font-medium text-right">Amount</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 font-medium text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="border-[#1e1e1e] hover:bg-[#1a1a1a]/50">
                        <TableCell className="text-xs text-neutral-400 py-2.5">
                          {fmtDate(tx.createdAt)}
                        </TableCell>
                        <TableCell className="py-2.5">
                          <Badge className={`${txTypeColor(tx.type)} border text-[10px] capitalize`}>
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-white text-right py-2.5">
                          ${fmt(tx.amount)}
                        </TableCell>
                        <TableCell className="py-2.5 text-center">
                          <Badge className={`${statusColor(tx.status)} border text-[10px] capitalize`}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Investments Summary */}
        <Card className="border-[#262626] bg-gradient-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white">Active Investments</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 text-xs h-7"
                onClick={() => navigate('investments')}
              >
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32 bg-[#1a1a1a]" />
                    <Skeleton className="h-2 w-full bg-[#1a1a1a]" />
                  </div>
                ))}
              </div>
            ) : activeInvestments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
                <TrendingUp className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No active investments</p>
                <Button
                  variant="link"
                  className="text-red-500 text-xs mt-2 h-auto p-0"
                  onClick={() => navigate('plans')}
                >
                  Browse Plans
                </Button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activeInvestments.map((inv) => {
                  const progress = inv.totalDays > 0
                    ? Math.min(100, (inv.daysElapsed / inv.totalDays) * 100)
                    : 0;
                  return (
                    <div key={inv.id} className="p-3 rounded-lg border border-[#1e1e1e] bg-[#0f0f0f]/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{inv.planName}</span>
                          <Badge variant="outline" className="border-[#333] text-[10px] text-neutral-500 capitalize">
                            {inv.planTier}
                          </Badge>
                        </div>
                        <span className="text-sm font-semibold text-white">${fmt(inv.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>Daily Return: <span className="text-green-400">${fmt(inv.dailyReturn)}</span></span>
                        <span>Elapsed: <span className="text-neutral-300">{inv.daysElapsed}/{inv.totalDays} days</span></span>
                      </div>
                      <Progress value={progress} className="h-1.5 bg-[#1a1a1a]" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className="border-[#262626] bg-gradient-card transition-all hover:border-green-600/30 hover:shadow-lg hover:shadow-green-600/5 cursor-pointer group"
          onClick={() => navigate('deposits')}
        >
          <CardContent className="flex items-center gap-4 p-4 lg:p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-600/10 group-hover:bg-green-600/20 transition-colors">
              <ArrowDownCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Deposit Funds</p>
              <p className="text-xs text-neutral-500 truncate">Add money to your wallet</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-[#262626] bg-gradient-card transition-all hover:border-red-600/30 hover:shadow-lg hover:shadow-red-600/5 cursor-pointer group"
          onClick={() => navigate('plans')}
        >
          <CardContent className="flex items-center gap-4 p-4 lg:p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600/10 group-hover:bg-red-600/20 transition-colors">
              <TrendingUp className="h-5 w-5 text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Invest Now</p>
              <p className="text-xs text-neutral-500 truncate">Choose a plan and earn</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-[#262626] bg-gradient-card transition-all hover:border-yellow-600/30 hover:shadow-lg hover:shadow-yellow-600/5 cursor-pointer group"
          onClick={() => navigate('withdrawals')}
        >
          <CardContent className="flex items-center gap-4 p-4 lg:p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-600/10 group-hover:bg-yellow-600/20 transition-colors">
              <ArrowUpCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Withdraw</p>
              <p className="text-xs text-neutral-500 truncate">Cash out your earnings</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <Card className="border-[#262626] bg-gradient-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-xs text-neutral-500">{label}</span>
        </div>
        {loading ? (
          <Skeleton className="h-6 w-24 bg-[#1a1a1a]" />
        ) : (
          <p className="text-lg font-bold text-white">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}