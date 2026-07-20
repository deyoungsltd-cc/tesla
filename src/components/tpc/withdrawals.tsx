'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  ArrowUpCircle,
  Wallet,
  Clock,
  AlertTriangle,
  Loader2,
  Building2,
  Bitcoin,
  Calculator,
} from 'lucide-react';

// ─── Utilities ────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'border-green-600/30 bg-green-600/10 text-green-400';
    case 'pending':
      return 'border-yellow-600/30 bg-yellow-600/10 text-yellow-400';
    case 'processing':
      return 'border-blue-600/30 bg-blue-600/10 text-blue-400';
    case 'rejected':
    case 'failed':
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

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface WithdrawalRecord {
  id: string;
  amount: number;
  fee: number;
  netAmount: number;
  destinationType: string;
  destinationInfo?: string;
  status: string;
  mode: string;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FEE_RATE = 0.21;
const NET_MULTIPLIER = 0.79;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Withdrawals() {
  const { user } = useAuthStore();
  const activeMode = user?.activeMode || 'demo';

  // Form state
  const [amount, setAmount] = useState('');
  const [destinationType, setDestinationType] = useState<'crypto' | 'bank'>('crypto');
  const [cryptoCurrency, setCryptoCurrency] = useState('BTC');
  const [walletAddress, setWalletAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // History
  const [history, setHistory] = useState<WithdrawalRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // ─── Wallet balance ─────────────────────────────────────────────────────

  const getWalletBalance = () => {
    const wallet = user?.wallets?.find((w) => w.type === activeMode);
    return wallet?.availableBalance ?? wallet?.balance ?? 0;
  };

  const availableBalance = getWalletBalance();
  const parsedAmount = parseFloat(amount) || 0;
  const fee = parsedAmount * FEE_RATE;
  const netAmount = parsedAmount * NET_MULTIPLIER;
  const hasValidAmount = parsedAmount > 0 && parsedAmount <= availableBalance;

  // ─── Fetch History ──────────────────────────────────────────────────────

  const fetchHistory = useCallback(async (status: string) => {
    setHistoryLoading(true);
    try {
      const params = status !== 'all' ? `status=${status}` : '';
      const res = await api.withdrawals.history(params);
      const data = res.withdrawals || res.data || res;
      if (Array.isArray(data)) {
        setHistory(data);
      } else if (data && typeof data === 'object') {
        setHistory(data.items || data.withdrawals || data.data || []);
      }
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(statusFilter);
  }, [statusFilter, fetchHistory]);

  // ─── Validation ─────────────────────────────────────────────────────────

  const getValidationMessage = (): string | null => {
    if (!amount || parsedAmount <= 0) return 'Enter a withdrawal amount greater than $0.00';
    if (parsedAmount > availableBalance) return 'Insufficient balance for this withdrawal';
    if (destinationType === 'crypto' && !walletAddress.trim()) return 'Wallet address is required';
    if (destinationType === 'bank') {
      if (!bankName.trim()) return 'Bank name is required';
      if (!accountName.trim()) return 'Account name is required';
      if (!accountNumber.trim()) return 'Account number is required';
    }
    return null;
  };

  // ─── Submit Withdrawal ──────────────────────────────────────────────────

  const handleSubmit = async () => {
    const validationError = getValidationMessage();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, any> = {
        amount: parsedAmount,
        destinationType,
        mode: activeMode,
      };

      if (destinationType === 'crypto') {
        body.cryptoCurrency = cryptoCurrency;
        body.walletAddress = walletAddress.trim();
      } else {
        body.bankName = bankName.trim();
        body.accountName = accountName.trim();
        body.accountNumber = accountNumber.trim();
      }

      await api.withdrawals.create(body);
      toast.success('Withdrawal submitted successfully!');
      setAmount('');
      setWalletAddress('');
      setBankName('');
      setAccountName('');
      setAccountNumber('');
      fetchHistory(statusFilter);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-4 lg:p-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ArrowUpCircle className="h-6 w-6 text-yellow-400" />
          Withdrawals
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Withdraw funds to your crypto wallet or bank account.
        </p>
      </div>

      {/* Create Withdrawal Card */}
      <Card className="border-[#262626] bg-gradient-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-white">Create Withdrawal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Fee Warning Banner */}
          <Alert className="border-red-600/40 bg-red-600/5">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-sm text-red-400/90">
              <span className="font-semibold">Note:</span> A <span className="font-bold text-red-300">21% withdrawal fee</span> applies to all withdrawals.{' '}
              Net amount = Withdrawal Amount × 0.79
            </AlertDescription>
          </Alert>

          {/* Mode indicator */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-400">Active Mode:</span>
            <Badge
              className={
                activeMode === 'live'
                  ? 'border-red-600/30 bg-red-600/10 text-red-400 border text-xs'
                  : 'border-neutral-600/30 bg-neutral-600/10 text-neutral-400 border text-xs'
              }
            >
              {activeMode === 'live' ? '🔴 Live' : '⚪ Demo'}
            </Badge>
          </div>

          {/* Available Balance */}
          <div className="bg-[#0f0f0f] rounded-lg p-3 border border-[#1e1e1e]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-neutral-500" />
                <span className="text-xs text-neutral-500">
                  {activeMode === 'live' ? 'Live' : 'Demo'} Available Balance
                </span>
              </div>
              <span className="text-lg font-bold text-white">
                ${fmt(availableBalance)}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label className="text-xs text-neutral-400">Withdrawal Amount (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`pl-7 bg-[#0f0f0f] border h-10 placeholder:text-neutral-600 text-white ${
                  amount && (parsedAmount > availableBalance || parsedAmount <= 0)
                    ? 'border-red-600/50'
                    : 'border-[#262626]'
                }`}
              />
            </div>
            {amount && parsedAmount > availableBalance && (
              <p className="text-[11px] text-red-400">Amount exceeds available balance</p>
            )}
            {amount && parsedAmount > 0 && parsedAmount <= availableBalance && (
              <p className="text-[11px] text-green-400/70">Amount is within your available balance</p>
            )}
          </div>

          {/* Live Fee Calculation Breakdown */}
          {parsedAmount > 0 && (
            <div className="bg-[#0f0f0f] rounded-lg border border-[#1e1e1e] p-4 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-neutral-300">Fee Breakdown</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Withdrawal Amount</span>
                  <span className="text-sm font-medium text-white">${fmt(parsedAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Fee (21%)</span>
                  <span className="text-sm font-medium text-red-400">-${fmt(fee)}</span>
                </div>
                <div className="h-px bg-[#262626] my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-300">You Receive</span>
                  <span className="text-base font-bold text-green-400">${fmt(netAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Destination Type */}
          <div className="space-y-2">
            <Label className="text-xs text-neutral-400">Destination Type</Label>
            <Tabs value={destinationType} onValueChange={(v) => setDestinationType(v as 'crypto' | 'bank')}>
              <TabsList className="bg-[#141414] border border-[#262626] w-full">
                <TabsTrigger
                  value="crypto"
                  className="flex-1 data-[state=active]:bg-red-600 data-[state=active]:text-white text-neutral-400 transition-colors"
                >
                  <Bitcoin className="h-4 w-4 mr-1.5" />
                  Crypto
                </TabsTrigger>
                <TabsTrigger
                  value="bank"
                  className="flex-1 data-[state=active]:bg-red-600 data-[state=active]:text-white text-neutral-400 transition-colors"
                >
                  <Building2 className="h-4 w-4 mr-1.5" />
                  Bank
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Crypto Destination Fields */}
          {destinationType === 'crypto' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400">Select Cryptocurrency</Label>
                <Select value={cryptoCurrency} onValueChange={setCryptoCurrency}>
                  <SelectTrigger className="bg-[#0f0f0f] border-[#262626] text-neutral-300 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#262626]">
                    <SelectItem value="BTC">BTC — Bitcoin</SelectItem>
                    <SelectItem value="ETH">ETH — Ethereum</SelectItem>
                    <SelectItem value="USDT">USDT — Tether</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400">Wallet Address</Label>
                <Input
                  placeholder="Enter your wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="bg-[#0f0f0f] border-[#262626] text-white h-10 placeholder:text-neutral-600 font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Bank Destination Fields */}
          {destinationType === 'bank' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400">Bank Name</Label>
                <Input
                  placeholder="e.g., Chase, Bank of America"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="bg-[#0f0f0f] border-[#262626] text-white h-10 placeholder:text-neutral-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400">Account Name</Label>
                <Input
                  placeholder="Name on the bank account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="bg-[#0f0f0f] border-[#262626] text-white h-10 placeholder:text-neutral-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400">Account Number</Label>
                <Input
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="bg-[#0f0f0f] border-[#262626] text-white h-10 placeholder:text-neutral-600 font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || !hasValidAmount || !!getValidationMessage()}
            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Submit Withdrawal'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Withdrawal History Card */}
      <Card className="border-[#262626] bg-gradient-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-500" />
              Withdrawal History
            </CardTitle>
            {/* Status Filter */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="bg-[#141414] border border-[#262626] h-8">
                {['all', 'pending', 'processing', 'completed', 'rejected'].map((s) => (
                  <TabsTrigger
                    key={s}
                    value={s}
                    className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-neutral-400 text-xs px-3 h-6 transition-colors capitalize"
                  >
                    {s}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-[#1a1a1a]" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
              <ArrowUpCircle className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">No withdrawals found</p>
              <p className="text-xs text-neutral-600 mt-1">Your withdrawal history will appear here.</p>
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#262626] hover:bg-transparent">
                      <TableHead className="text-[11px] text-neutral-500 font-medium">Date</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 font-medium text-right">Amount</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 font-medium text-right">Fee</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 font-medium text-right">Net Amount</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 font-medium">Destination</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 font-medium text-center">Status</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 font-medium text-center">Mode</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((wd) => (
                      <TableRow key={wd.id} className="border-[#1e1e1e] hover:bg-[#1a1a1a]/50">
                        <TableCell className="text-xs text-neutral-400 py-2.5">
                          {fmtDate(wd.createdAt)}
                        </TableCell>
                        <TableCell className="text-xs text-white font-medium text-right py-2.5">
                          ${fmt(wd.amount)}
                        </TableCell>
                        <TableCell className="text-xs text-red-400 text-right py-2.5">
                          -${fmt(wd.fee)}
                        </TableCell>
                        <TableCell className="text-xs text-green-400 font-medium text-right py-2.5">
                          ${fmt(wd.netAmount)}
                        </TableCell>
                        <TableCell className="text-xs text-neutral-300 py-2.5 max-w-[140px] truncate">
                          {wd.destinationInfo || wd.destinationType === 'crypto' ? 'Crypto' : 'Bank'}
                        </TableCell>
                        <TableCell className="py-2.5 text-center">
                          <Badge className={`${statusColor(wd.status)} border text-[10px] capitalize`}>
                            {wd.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2.5 text-center">
                          <Badge className={`${modeBadge(wd.mode)} border text-[10px] capitalize`}>
                            {wd.mode}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}