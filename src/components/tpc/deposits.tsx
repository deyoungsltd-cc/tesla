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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ArrowDownCircle,
  Copy,
  Check,
  Wallet,
  Clock,
  Gift,
  Info,
  Loader2,
  ImageIcon,
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
    case 'confirmed':
    case 'completed':
    case 'approved':
      return 'border-green-600/30 bg-green-600/10 text-green-400';
    case 'pending':
      return 'border-yellow-600/30 bg-yellow-600/10 text-yellow-400';
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

function methodBadge(method: string) {
  if (method === 'crypto') return 'border-orange-600/30 bg-orange-600/10 text-orange-400';
  if (method === 'gift_card') return 'border-purple-600/30 bg-purple-600/10 text-purple-400';
  return 'border-neutral-600/30 bg-neutral-600/10 text-neutral-400';
}

// ─── Mock Wallet Addresses ───────────────────────────────────────────────────

const MOCK_ADDRESSES: Record<string, string> = {
  BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ETH: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
  USDT: 'TXkRc3XHQF8bC7vZLF8EVb1vP3cNH9FqWZ',
};

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface DepositRecord {
  id: string;
  amount: number;
  method: string;
  cryptoCurrency?: string;
  giftCardType?: string;
  status: string;
  mode: string;
  createdAt: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Deposits() {
  const { user } = useAuthStore();
  const activeMode = user?.activeMode || 'demo';

  // Crypto deposit form
  const [cryptoCurrency, setCryptoCurrency] = useState('BTC');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [cryptoMode, setCryptoMode] = useState<'demo' | 'live'>(activeMode);
  const [cryptoSubmitting, setCryptoSubmitting] = useState(false);

  // Gift card deposit form
  const [giftCardType, setGiftCardType] = useState('Amazon');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardPin, setGiftCardPin] = useState('');
  const [giftCardAmount, setGiftCardAmount] = useState('');
  const [giftCardImageUrl, setGiftCardImageUrl] = useState('');
  const [giftCardMode, setGiftCardMode] = useState<'demo' | 'live'>(activeMode);
  const [giftCardSubmitting, setGiftCardSubmitting] = useState(false);

  // Copy state
  const [copied, setCopied] = useState(false);

  // History
  const [history, setHistory] = useState<DepositRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // ─── Wallet balance from store ──────────────────────────────────────────

  const getWalletBalance = (mode: 'demo' | 'live') => {
    const wallet = user?.wallets?.find((w) => w.type === mode);
    return wallet?.balance ?? 0;
  };

  // ─── Fetch History ──────────────────────────────────────────────────────

  const fetchHistory = useCallback(async (status: string) => {
    setHistoryLoading(true);
    try {
      const params = status !== 'all' ? `status=${status}` : '';
      const res = await api.deposits.history(params);
      const data = res.deposits || res.data || res;
      if (Array.isArray(data)) {
        setHistory(data);
      } else if (data && typeof data === 'object') {
        setHistory(data.items || data.deposits || data.data || []);
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

  // ─── Copy Address ───────────────────────────────────────────────────────

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_ADDRESSES[cryptoCurrency]);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy address');
    }
  };

  // ─── Submit Crypto Deposit ──────────────────────────────────────────────

  const handleCryptoSubmit = async () => {
    const amount = parseFloat(cryptoAmount);
    if (!amount || amount < 10) {
      toast.error('Minimum deposit amount is $10.00');
      return;
    }

    setCryptoSubmitting(true);
    try {
      await api.deposits.create({
        amount,
        method: 'crypto',
        cryptoCurrency,
        mode: cryptoMode,
        txHash: 'pending',
      });
      toast.success(cryptoMode === 'demo' ? 'Demo deposit credited instantly!' : 'Deposit submitted for confirmation.');
      setCryptoAmount('');
      fetchHistory(statusFilter);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit deposit');
    } finally {
      setCryptoSubmitting(false);
    }
  };

  // ─── Submit Gift Card Deposit ───────────────────────────────────────────

  const handleGiftCardSubmit = async () => {
    const amount = parseFloat(giftCardAmount);
    if (!amount || amount < 10) {
      toast.error('Minimum deposit amount is $10.00');
      return;
    }
    if (!giftCardCode.trim()) {
      toast.error('Card code is required');
      return;
    }

    setGiftCardSubmitting(true);
    try {
      await api.deposits.create({
        amount,
        method: 'gift_card',
        giftCardType,
        giftCardCode: giftCardCode.trim(),
        giftCardPin: giftCardPin.trim() || undefined,
        giftCardImageUrl: giftCardImageUrl.trim() || undefined,
        mode: giftCardMode,
      });
      toast.success('Gift card deposit submitted successfully!');
      setGiftCardCode('');
      setGiftCardPin('');
      setGiftCardAmount('');
      setGiftCardImageUrl('');
      fetchHistory(statusFilter);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit gift card deposit');
    } finally {
      setGiftCardSubmitting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-4 lg:p-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ArrowDownCircle className="h-6 w-6 text-green-400" />
          Deposits
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Fund your wallet via cryptocurrency or gift cards.
        </p>
      </div>

      {/* Create Deposit Card */}
      <Card className="border-[#262626] bg-gradient-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-white">Create Deposit</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="crypto" className="space-y-4">
            <TabsList className="bg-[#141414] border border-[#262626]">
              <TabsTrigger
                value="crypto"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-neutral-400 transition-colors"
              >
                <Wallet className="h-4 w-4 mr-1.5" />
                Crypto Deposit
              </TabsTrigger>
              <TabsTrigger
                value="gift_card"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-neutral-400 transition-colors"
              >
                <Gift className="h-4 w-4 mr-1.5" />
                Gift Card Deposit
              </TabsTrigger>
            </TabsList>

            {/* ─── Crypto Deposit Tab ─────────────────────────────────────── */}
            <TabsContent value="crypto" className="mt-4 space-y-5">
              {/* Mode Toggle */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-neutral-400">Mode:</span>
                <div className="flex items-center gap-2">
                  {(['demo', 'live'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setCryptoMode(m)}
                      className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                        cryptoMode === m
                          ? m === 'live'
                            ? 'bg-red-600/20 border-red-600/50 text-red-400'
                            : 'bg-neutral-700/50 border-neutral-600/50 text-neutral-300'
                          : 'border-[#262626] text-neutral-500 hover:text-neutral-300 hover:border-[#333]'
                      }`}
                    >
                      {m === 'live' ? '🔴 Live' : '⚪ Demo'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallet Balance */}
              <div className="bg-[#0f0f0f] rounded-lg p-3 border border-[#1e1e1e]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-neutral-500" />
                    <span className="text-xs text-neutral-500">
                      {cryptoMode === 'live' ? 'Live' : 'Demo'} Wallet Balance
                    </span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    ${fmt(getWalletBalance(cryptoMode))}
                  </span>
                </div>
              </div>

              {/* Crypto Select */}
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

              {/* Amount */}
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400">Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
                  <Input
                    type="number"
                    min={10}
                    step="0.01"
                    placeholder="0.00"
                    value={cryptoAmount}
                    onChange={(e) => setCryptoAmount(e.target.value)}
                    className="pl-7 bg-[#0f0f0f] border-[#262626] text-white h-10 placeholder:text-neutral-600"
                  />
                </div>
                <p className="text-[11px] text-neutral-600">Minimum deposit: $10.00</p>
              </div>

              {/* Wallet Address (Live mode only) */}
              {cryptoMode === 'live' && (
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400 flex items-center gap-1.5">
                    <Info className="h-3 w-3 text-yellow-500" />
                    Send {cryptoCurrency} to this address
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#0f0f0f] border border-[#262626] rounded-md px-3 py-2.5 text-xs text-neutral-300 font-mono truncate select-all">
                      {MOCK_ADDRESSES[cryptoCurrency]}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 h-10 w-10 p-0 border-[#262626] text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
                      onClick={handleCopy}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-[11px] text-yellow-500/70">
                    Live deposits require admin confirmation after blockchain verification.
                  </p>
                </div>
              )}

              {/* Demo Notice */}
              {cryptoMode === 'demo' && (
                <div className="flex items-start gap-2 bg-green-600/5 border border-green-600/20 rounded-lg p-3">
                  <Info className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-400/80">
                    Demo deposits are credited instantly. No real cryptocurrency is required.
                  </p>
                </div>
              )}

              {/* Submit */}
              <Button
                onClick={handleCryptoSubmit}
                disabled={cryptoSubmitting || !cryptoAmount || parseFloat(cryptoAmount) < 10}
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cryptoSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Deposit'
                )}
              </Button>
            </TabsContent>

            {/* ─── Gift Card Deposit Tab ──────────────────────────────────── */}
            <TabsContent value="gift_card" className="mt-4 space-y-5">
              {/* Mode Toggle */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-neutral-400">Mode:</span>
                <div className="flex items-center gap-2">
                  {(['demo', 'live'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setGiftCardMode(m)}
                      className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                        giftCardMode === m
                          ? m === 'live'
                            ? 'bg-red-600/20 border-red-600/50 text-red-400'
                            : 'bg-neutral-700/50 border-neutral-600/50 text-neutral-300'
                          : 'border-[#262626] text-neutral-500 hover:text-neutral-300 hover:border-[#333]'
                      }`}
                    >
                      {m === 'live' ? '🔴 Live' : '⚪ Demo'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallet Balance */}
              <div className="bg-[#0f0f0f] rounded-lg p-3 border border-[#1e1e1e]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-neutral-500" />
                    <span className="text-xs text-neutral-500">
                      {giftCardMode === 'live' ? 'Live' : 'Demo'} Wallet Balance
                    </span>
                  </div>
                  <span className="text-lg font-bold text-white">
                    ${fmt(getWalletBalance(giftCardMode))}
                  </span>
                </div>
              </div>

              {/* Card Type */}
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400">Card Type</Label>
                <Select value={giftCardType} onValueChange={setGiftCardType}>
                  <SelectTrigger className="bg-[#0f0f0f] border-[#262626] text-neutral-300 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#262626]">
                    <SelectItem value="Amazon">Amazon</SelectItem>
                    <SelectItem value="Google Play">Google Play</SelectItem>
                    <SelectItem value="iTunes">iTunes</SelectItem>
                    <SelectItem value="Visa">Visa</SelectItem>
                    <SelectItem value="Mastercard">Mastercard</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Card Code */}
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400">Card Code</Label>
                <Input
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={giftCardCode}
                  onChange={(e) => setGiftCardCode(e.target.value)}
                  className="bg-[#0f0f0f] border-[#262626] text-white h-10 placeholder:text-neutral-600"
                />
              </div>

              {/* PIN Code */}
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400">
                  PIN Code <span className="text-neutral-600">(optional)</span>
                </Label>
                <Input
                  placeholder="Enter PIN if applicable"
                  value={giftCardPin}
                  onChange={(e) => setGiftCardPin(e.target.value)}
                  className="bg-[#0f0f0f] border-[#262626] text-white h-10 placeholder:text-neutral-600"
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400">Card Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">$</span>
                  <Input
                    type="number"
                    min={10}
                    step="0.01"
                    placeholder="0.00"
                    value={giftCardAmount}
                    onChange={(e) => setGiftCardAmount(e.target.value)}
                    className="pl-7 bg-[#0f0f0f] border-[#262626] text-white h-10 placeholder:text-neutral-600"
                  />
                </div>
              </div>

              {/* Image URL (simulated file upload) */}
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <ImageIcon className="h-3 w-3" />
                  Card Image URL
                </Label>
                <Input
                  placeholder="https://example.com/gift-card.jpg"
                  value={giftCardImageUrl}
                  onChange={(e) => setGiftCardImageUrl(e.target.value)}
                  className="bg-[#0f0f0f] border-[#262626] text-white h-10 placeholder:text-neutral-600"
                />
                <p className="text-[11px] text-neutral-600">
                  Paste a URL to an image of the gift card (file upload coming soon).
                </p>
              </div>

              {/* Mode-specific notice */}
              {giftCardMode === 'demo' ? (
                <div className="flex items-start gap-2 bg-green-600/5 border border-green-600/20 rounded-lg p-3">
                  <Info className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-400/80">
                    Demo deposits are credited instantly. No real gift card is required.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2 bg-yellow-600/5 border border-yellow-600/20 rounded-lg p-3">
                  <Info className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-yellow-400/80">
                    Live gift card deposits require admin verification after review.
                  </p>
                </div>
              )}

              {/* Submit */}
              <Button
                onClick={handleGiftCardSubmit}
                disabled={
                  giftCardSubmitting ||
                  !giftCardAmount ||
                  parseFloat(giftCardAmount) < 10 ||
                  !giftCardCode.trim()
                }
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {giftCardSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Gift Card'
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Deposit History Card */}
      <Card className="border-[#262626] bg-gradient-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-500" />
              Deposit History
            </CardTitle>
            {/* Status Filter */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="bg-[#141414] border border-[#262626] h-8">
                {['all', 'pending', 'confirmed', 'rejected'].map((s) => (
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
              <ArrowDownCircle className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">No deposits found</p>
              <p className="text-xs text-neutral-600 mt-1">Your deposit history will appear here.</p>
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#262626] hover:bg-transparent">
                      <TableHead className="text-[11px] text-neutral-500 font-medium">Date</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 font-medium text-center">Method</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 font-medium text-right">Amount</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 font-medium">Crypto / Type</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 font-medium text-center">Status</TableHead>
                      <TableHead className="text-[11px] text-neutral-500 font-medium text-center">Mode</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((dep) => (
                      <TableRow key={dep.id} className="border-[#1e1e1e] hover:bg-[#1a1a1a]/50">
                        <TableCell className="text-xs text-neutral-400 py-2.5">
                          {fmtDate(dep.createdAt)}
                        </TableCell>
                        <TableCell className="py-2.5 text-center">
                          <Badge className={`${methodBadge(dep.method)} border text-[10px] capitalize`}>
                            {dep.method === 'gift_card' ? 'Gift Card' : 'Crypto'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-white font-medium text-right py-2.5">
                          ${fmt(dep.amount)}
                        </TableCell>
                        <TableCell className="text-xs text-neutral-300 py-2.5">
                          {dep.method === 'crypto'
                            ? dep.cryptoCurrency || '—'
                            : dep.giftCardType || '—'}
                        </TableCell>
                        <TableCell className="py-2.5 text-center">
                          <Badge className={`${statusColor(dep.status)} border text-[10px] capitalize`}>
                            {dep.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2.5 text-center">
                          <Badge className={`${modeBadge(dep.mode)} border text-[10px] capitalize`}>
                            {dep.mode}
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