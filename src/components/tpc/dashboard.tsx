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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  Clock, ChevronRight, DollarSign, BarChart3, ShieldCheck, Loader2,
} from 'lucide-react';

interface WalletData {
  demo: { balance: number; availableBalance: number; lockedBalance: number } | null;
  live: { balance: number; availableBalance: number; lockedBalance: number } | null;
}

interface Transaction {
  id: string; type: string; amount: number; status: string; description: string; createdAt: string;
}

interface ActiveInvestment {
  id: string; planName: string; planTier: string; amount: number; dailyReturn: number;
  totalReturn: number; expectedTotalReturn: number; startDate: string; endDate: string;
  daysElapsed: number; totalDays: number;
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
    case 'deposit': return 'border-green-500/20 bg-green-500/5 text-green-400';
    case 'withdrawal': return 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400';
    case 'investment': return 'border-blue-500/20 bg-blue-500/5 text-blue-400';
    case 'return': case 'earning': return 'border-red-500/20 bg-red-500/5 text-red-400';
    case 'referral': return 'border-purple-500/20 bg-purple-500/5 text-purple-400';
    default: return 'border-neutral-500/20 bg-neutral-500/5 text-neutral-400';
  }
}

function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'completed': case 'approved': case 'active': return 'border-green-500/20 bg-green-500/5 text-green-400';
    case 'pending': return 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400';
    case 'failed': case 'rejected': case 'cancelled': return 'border-red-500/20 bg-red-500/5 text-red-400';
    default: return 'border-neutral-500/20 bg-neutral-500/5 text-neutral-400';
  }
}

function kycColor(level: string) {
  switch (level?.toLowerCase()) {
    case 'verified': case 'level2': case 'level_2': return 'border-green-500/20 bg-green-500/5 text-green-400';
    default: return 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400';
  }
}

interface DashboardProps { navigate: (page: string) => void; }

export default function Dashboard({ navigate }: DashboardProps) {
  const { user, isAdmin, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<WalletData>({ demo: null, live: null });
  const [activeInvestments, setActiveInvestments] = useState<ActiveInvestment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, investRes] = await Promise.allSettled([
        api.wallet.get(), api.investments.active(),
      ]);

      if (walletRes.status === 'fulfilled') {
        const wData = walletRes.value;
        const demo = wData.demo || wData.wallets?.find((w: any) => w.type === 'demo') || null;
        const live = wData.live || wData.wallets?.find((w: any) => w.type === 'live') || null;
        const norm = (w: any) => w ? { balance: w.balance ?? 0, availableBalance: w.availableBalance ?? 0, lockedBalance: w.lockedBalance ?? 0 } : null;
        setWalletData({ demo: norm(demo), live: norm(live) });
        if (wData.user) setUser(wData.user);
      }

      if (investRes.status === 'fulfilled') {
        const invData = investRes.value;
        const list = invData.investments || invData.data || invData || [];
        setActiveInvestments(Array.isArray(list) ? list : []);
      }

      try {
        const txRes = await api.wallet.transactions('all', 'limit=5');
        const txList = txRes.transactions || txRes.data || txRes || [];
        setTransactions(Array.isArray(txList) ? txList : []);
      } catch { setTransactions([]); }
    } catch {} finally { setLoading(false); }
  }, [isAdmin, setUser]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeMode = user?.activeMode || 'demo';

  return (
    <div className="space-y-5 p-4 lg:p-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
              Welcome back, {user?.profile?.firstName || user?.email?.split('@')[0] || 'Investor'}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">Here&apos;s an overview of your investment portfolio.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${kycColor(user?.kycLevel || '')} border text-[10px]`}>
              <ShieldCheck className="w-3 h-3 mr-1" />KYC: {user?.kycLevel || 'Not Submitted'}
            </Badge>
            <Badge variant="outline" className="border-white/[0.06] text-[10px] text-neutral-500">
              {activeMode === 'live' ? '🔴 Live' : '⚪ Demo'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { key: 'live', label: 'Live Wallet', wallet: walletData.live, active: activeMode === 'live' },
          { key: 'demo', label: 'Demo Wallet', wallet: walletData.demo, active: activeMode === 'demo' },
        ].map(({ key, label, wallet, active }) => (
          <Card key={key} className={`border rounded-2xl transition-all duration-300 ${
            active ? 'border-red-500/20 bg-red-500/[0.02]' : 'border-white/[0.04] bg-white/[0.01]'
          }`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-neutral-500 flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5" /> {label}
                </CardTitle>
                {active && <Badge className="bg-red-500/10 text-red-400 border-red-500/15 border text-[9px]">ACTIVE</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <><Skeleton className="h-8 w-36 bg-neutral-800" /><Skeleton className="h-3 w-24 bg-neutral-800" /><Skeleton className="h-3 w-28 bg-neutral-800" /></>
              ) : (
                <>
                  <p className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                    ${fmt(wallet?.balance ?? 0)}
                  </p>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-600">Available</span>
                    <span className="text-green-400">${fmt(wallet?.availableBalance ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-600">Locked</span>
                    <span className="text-yellow-400">${fmt(wallet?.lockedBalance ?? 0)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: ArrowDownCircle, label: 'Deposit Funds', desc: 'Add money to your wallet', color: 'text-green-400', bg: 'bg-green-500/[0.07]', border: 'hover:border-green-500/20', page: 'deposits' },
          { icon: TrendingUp, label: 'Invest Now', desc: 'Choose a plan and earn', color: 'text-red-400', bg: 'bg-red-500/[0.07]', border: 'hover:border-red-500/20', page: 'plans' },
          { icon: ArrowUpCircle, label: 'Withdraw', desc: 'Cash out your earnings', color: 'text-yellow-400', bg: 'bg-yellow-500/[0.07]', border: 'hover:border-yellow-500/20', page: 'withdrawals' },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.label} className={`tesla-card rounded-2xl cursor-pointer group ${action.border}`}>
              <CardContent className="flex items-center gap-4 p-4" onClick={() => navigate(action.page)}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{action.label}</p>
                  <p className="text-xs text-neutral-600 truncate">{action.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transactions + Active Investments */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        <Card className="border-white/[0.04] rounded-2xl bg-white/[0.01]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white">Recent Transactions</CardTitle>
              <Badge variant="outline" className="border-white/[0.04] text-[9px] text-neutral-600">Last 5</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full bg-neutral-800" />)}</div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-600">
                <Clock className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No transactions yet</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.03] hover:bg-transparent">
                      <TableHead className="text-[10px] text-neutral-600 font-medium">Date</TableHead>
                      <TableHead className="text-[10px] text-neutral-600 font-medium">Type</TableHead>
                      <TableHead className="text-[10px] text-neutral-600 font-medium text-right">Amount</TableHead>
                      <TableHead className="text-[10px] text-neutral-600 font-medium text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="border-white/[0.02] hover:bg-white/[0.01]">
                        <TableCell className="text-[11px] text-neutral-500 py-2">{fmtDate(tx.createdAt)}</TableCell>
                        <TableCell className="py-2">
                          <Badge className={`${txTypeColor(tx.type)} border text-[9px] capitalize px-1.5`}>{tx.type}</Badge>
                        </TableCell>
                        <TableCell className="text-[11px] font-medium text-white text-right py-2">${fmt(tx.amount)}</TableCell>
                        <TableCell className="py-2 text-center">
                          <Badge className={`${statusColor(tx.status)} border text-[9px] capitalize px-1.5`}>{tx.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Investments */}
        <Card className="border-white/[0.04] rounded-2xl bg-white/[0.01]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white">Active Investments</CardTitle>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/5 text-xs h-7" onClick={() => navigate('investments')}>
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">{[...Array(3)].map((_, i) => (<div key={i} className="space-y-2"><Skeleton className="h-4 w-28 bg-neutral-800" /><Skeleton className="h-1.5 w-full bg-neutral-800" /></div>))}</div>
            ) : activeInvestments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-600">
                <TrendingUp className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No active investments</p>
                <Button variant="link" className="text-red-500 text-xs mt-2 h-auto p-0" onClick={() => navigate('plans')}>Browse Plans</Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {activeInvestments.map((inv) => {
                  const progress = inv.totalDays > 0 ? Math.min(100, (inv.daysElapsed / inv.totalDays) * 100) : 0;
                  return (
                    <div key={inv.id} className="p-3 rounded-xl border border-white/[0.03] bg-black/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{inv.planName}</span>
                          <Badge variant="outline" className="border-white/[0.06] text-[9px] text-neutral-600 capitalize">{inv.planTier}</Badge>
                        </div>
                        <span className="text-sm font-semibold text-white">${fmt(inv.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <span>Daily: <span className="text-green-400">+${fmt(inv.dailyReturn)}</span></span>
                        <span>{inv.daysElapsed}/{inv.totalDays} days</span>
                      </div>
                      <Progress value={progress} className="h-1 bg-neutral-800" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}