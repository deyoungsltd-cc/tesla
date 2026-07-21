'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Clock,
  PackageOpen,
  Filter,
} from 'lucide-react';

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
  status: string;
  mode: string;
}

interface HistoryInvestment {
  id: string;
  planName: string;
  planTier: string;
  amount: number;
  returnRate: number;
  totalReturn: number;
  status: string;
  mode: string;
  createdAt: string;
  completedAt?: string;
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function tierColor(tier: string) {
  const t = tier?.toLowerCase() || '';
  if (t.includes('platinum')) return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
  if (t.includes('gold')) return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
  if (t.includes('silver')) return 'border-slate-400/30 bg-slate-400/10 text-slate-300';
  return 'border-neutral-500/30 bg-neutral-500/10 text-neutral-400';
}

function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'approved':
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

function modeBadge(mode: string) {
  if (mode === 'live') return 'border-red-600/30 bg-red-600/10 text-red-400';
  return 'border-neutral-600/30 bg-neutral-600/10 text-neutral-400';
}

const PAGE_SIZE = 10;

export default function Investments() {
  const [loading, setLoading] = useState(true);
  const [activeInvestments, setActiveInvestments] = useState<ActiveInvestment[]>([]);
  const [history, setHistory] = useState<HistoryInvestment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchActive = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.investments.active();
      const list = res.investments || res.data || res || [];
      setActiveInvestments(Array.isArray(list) ? list : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (p: number, status: string) => {
    setHistoryLoading(true);
    try {
      const params = [`page=${p}`, `limit=${PAGE_SIZE}`];
      if (status !== 'all') params.push(`status=${status}`);
      const res = await api.investments.history(params.join('&'));
      const data = res.investments || res.data || res;

      if (Array.isArray(data)) {
        setHistory(data);
        setTotalPages(Math.max(1, Math.ceil(data.length / PAGE_SIZE)));
      } else if (data && typeof data === 'object') {
        setHistory(data.items || data.investments || data.data || []);
        setTotalPages(data.totalPages || Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE)));
      }
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActive();
  }, [fetchActive]);

  useEffect(() => {
    setPage(1);
    fetchHistory(1, statusFilter);
  }, [statusFilter, fetchHistory]);

  useEffect(() => {
    fetchHistory(page, statusFilter);
  }, [page]);

  return (
    <div className="space-y-6 p-4 lg:p-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white">Investments</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Track your active investments and review past performance.
        </p>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="bg-white/[0.02] border border-white/[0.04]">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-neutral-400 transition-colors"
          >
            Active Investments
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-neutral-400 transition-colors"
          >
            Investment History
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Active Investments */}
        <TabsContent value="active" className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-white/[0.04] bg-white/[0.01]">
                  <CardContent className="p-5 space-y-4">
                    <Skeleton className="h-5 w-36 bg-white/[0.03]" />
                    <Skeleton className="h-8 w-28 bg-white/[0.03]" />
                    <Skeleton className="h-2 w-full bg-white/[0.03]" />
                    <div className="grid grid-cols-2 gap-3">
                      <Skeleton className="h-4 w-20 bg-white/[0.03]" />
                      <Skeleton className="h-4 w-20 bg-white/[0.03]" />
                      <Skeleton className="h-4 w-20 bg-white/[0.03]" />
                      <Skeleton className="h-4 w-20 bg-white/[0.03]" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeInvestments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
              <PackageOpen className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-base">No active investments</p>
              <p className="text-sm mt-1">Start investing to see your active positions here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeInvestments.map((inv) => {
                const progress = inv.totalDays > 0
                  ? Math.min(100, (inv.daysElapsed / inv.totalDays) * 100)
                  : 0;
                const remainingDays = Math.max(0, inv.totalDays - inv.daysElapsed);

                return (
                  <Card
                    key={inv.id}
                    className="border-white/[0.04] bg-white/[0.01] border-white/[0.08] transition-colors"
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-red-400" />
                          <h3 className="text-sm font-semibold text-white">{inv.planName}</h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge className={`${tierColor(inv.planTier)} border text-[10px] capitalize`}>
                            {inv.planTier}
                          </Badge>
                          <Badge className={`${statusColor(inv.status)} border text-[10px] capitalize`}>
                            {inv.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Invested Amount */}
                      <div className="bg-black/30 rounded-xl p-3">
                        <p className="text-xs text-neutral-500 mb-1">Invested Amount</p>
                        <p className="text-xl font-bold text-white">${fmt(inv.amount)}</p>
                      </div>

                      {/* Return Details */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[11px] text-neutral-500">Daily Return</p>
                          <p className="text-sm font-semibold text-green-400">+${fmt(inv.dailyReturn)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-neutral-500">Earned So Far</p>
                          <p className="text-sm font-semibold text-green-400">+${fmt(inv.totalReturn)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-neutral-500">Expected Total</p>
                          <p className="text-sm font-medium text-neutral-300">${fmt(inv.expectedTotalReturn)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-neutral-500">Remaining</p>
                          <p className="text-sm font-medium text-neutral-300">{remainingDays} days</p>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{fmtDate(inv.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{fmtDate(inv.endDate)}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-500">Progress</span>
                          <span className="text-neutral-300">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-white/[0.03]" />
                      </div>

                      {/* Mode Badge */}
                      <div className="flex justify-end">
                        <Badge className={`${modeBadge(inv.mode)} border text-[10px] capitalize`}>
                          {inv.mode} Mode
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Investment History */}
        <TabsContent value="history" className="mt-4">
          <Card className="border-white/[0.04] bg-white/[0.01]">
            <CardContent className="p-4 lg:p-5">
              {/* Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-400">Filter by status:</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] bg-black/30 border-white/[0.04] text-neutral-300 text-sm h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/[0.02] border-white/[0.04]">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              {historyLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full bg-white/[0.03]" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                  <Clock className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">No investment history found</p>
                </div>
              ) : (
                <>
                  <div className="max-h-[480px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/[0.04] hover:bg-transparent">
                          <TableHead className="text-[11px] text-neutral-500 font-medium">Date</TableHead>
                          <TableHead className="text-[11px] text-neutral-500 font-medium">Plan</TableHead>
                          <TableHead className="text-[11px] text-neutral-500 font-medium text-right">Amount</TableHead>
                          <TableHead className="text-[11px] text-neutral-500 font-medium text-right">Return Rate</TableHead>
                          <TableHead className="text-[11px] text-neutral-500 font-medium text-right">Total Return</TableHead>
                          <TableHead className="text-[11px] text-neutral-500 font-medium text-center">Status</TableHead>
                          <TableHead className="text-[11px] text-neutral-500 font-medium text-center">Mode</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.map((inv) => (
                          <TableRow key={inv.id} className="border-white/[0.02] hover:bg-white/[0.03]/50">
                            <TableCell className="text-xs text-neutral-400 py-2.5">
                              {fmtDate(inv.createdAt)}
                            </TableCell>
                            <TableCell className="py-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-white font-medium">{inv.planName}</span>
                                <Badge className={`${tierColor(inv.planTier)} border text-[9px] capitalize`}>
                                  {inv.planTier}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-white font-medium text-right py-2.5">
                              ${fmt(inv.amount)}
                            </TableCell>
                            <TableCell className="text-xs text-red-400 text-right py-2.5">
                              {inv.returnRate}%
                            </TableCell>
                            <TableCell className="text-xs text-green-400 font-medium text-right py-2.5">
                              +${fmt(inv.totalReturn)}
                            </TableCell>
                            <TableCell className="py-2.5 text-center">
                              <Badge className={`${statusColor(inv.status)} border text-[10px] capitalize`}>
                                {inv.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2.5 text-center">
                              <Badge className={`${modeBadge(inv.mode)} border text-[10px] capitalize`}>
                                {inv.mode}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.02]">
                      <p className="text-xs text-neutral-500">
                        Page {page} of {totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 border-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page <= 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Prev
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 border-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page >= totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}