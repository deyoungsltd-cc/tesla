'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Ban,
  UserCheck,
  AlertTriangle,
  DollarSign,
  Clock,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusBadge(status: string) {
  const s = status?.toLowerCase();
  switch (s) {
    case 'completed':
    case 'approved':
    case 'active':
      return 'border-green-600/30 bg-green-600/10 text-green-400';
    case 'pending':
      return 'border-yellow-600/30 bg-yellow-600/10 text-yellow-400';
    case 'failed':
    case 'rejected':
    case 'banned':
    case 'suspended':
      return 'border-red-600/30 bg-red-600/10 text-red-400';
    default:
      return 'border-neutral-600/30 bg-neutral-600/10 text-neutral-400';
  }
}

interface AdminStats {
  totalUsers?: number;
  totalDeposits?: number;
  totalDepositsAmount?: number;
  activeInvestments?: number;
  pendingKyc?: number;
  pendingDeposits?: number;
  pendingWithdrawals?: number;
}

interface AdminUser {
  id: string;
  email: string;
  status: string;
  kycLevel: string;
  createdAt: string;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
  wallets?: Array<{ balance: number; type: string }>;
}

interface AdminDeposit {
  id: string;
  userId?: string;
  user?: { email?: string } | string;
  email?: string;
  amount: number;
  method?: string;
  status: string;
  createdAt: string;
  transactionHash?: string;
}

interface AdminWithdrawal {
  id: string;
  userId?: string;
  user?: { email?: string } | string;
  email?: string;
  amount: number;
  fee: number;
  netAmount?: number;
  destination?: string;
  walletAddress?: string;
  status: string;
  createdAt: string;
}

interface AdminKyc {
  id: string;
  userId?: string;
  user?: { email?: string } | string;
  email?: string;
  level: number;
  status: string;
  createdAt: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  proofOfAddressUrl?: string;
  selfieUrl?: string;
}

function getUserEmail(item: any): string {
  return item.email || item.user?.email || item.user || 'N/A';
}

function RejectionDialog({
  open,
  onClose,
  onConfirm,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
}) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    onConfirm(reason.trim());
    setReason('');
    onClose();
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setReason('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#141414] border-[#333] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-4 w-4" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-400">Rejection Reason</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="bg-[#0a0a0a] border-[#333] text-white placeholder:text-neutral-600 focus:border-red-500/50"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#333] text-neutral-300 hover:bg-[#1a1a1a]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Admin() {
  const { isAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Stats
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Users
  const [usersLoading, setUsersLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState<string | null>(null);

  // Deposits
  const [depositsLoading, setDepositsLoading] = useState(true);
  const [deposits, setDeposits] = useState<AdminDeposit[]>([]);
  const [depositFilter, setDepositFilter] = useState('pending');
  const [depositActionLoading, setDepositActionLoading] = useState<string | null>(null);
  const [rejectDepositOpen, setRejectDepositOpen] = useState(false);
  const [rejectDepositId, setRejectDepositId] = useState<string | null>(null);

  // Withdrawals
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [withdrawalFilter, setWithdrawalFilter] = useState('pending');
  const [withdrawalActionLoading, setWithdrawalActionLoading] = useState<string | null>(null);
  const [rejectWithdrawalOpen, setRejectWithdrawalOpen] = useState(false);
  const [rejectWithdrawalId, setRejectWithdrawalId] = useState<string | null>(null);

  // KYC
  const [kycLoading, setKycLoading] = useState(true);
  const [kycList, setKycList] = useState<AdminKyc[]>([]);
  const [kycActionLoading, setKycActionLoading] = useState<string | null>(null);
  const [rejectKycOpen, setRejectKycOpen] = useState(false);
  const [rejectKycId, setRejectKycId] = useState<string | null>(null);

  const PAGE_SIZE = 10;

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.admin.stats();
      setStats(res.stats || res.data || res);
    } catch {
      // silent
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (page: number) => {
    setUsersLoading(true);
    try {
      const res = await api.admin.users(`page=${page}&limit=${PAGE_SIZE}`);
      const data = res.users || res.data || res;
      if (Array.isArray(data)) {
        setUsers(data);
        setUserTotal(data.length);
      } else if (data?.items || data?.data) {
        const items = data.items || data.data;
        setUsers(items);
        setUserTotal(data.total || items.length);
      } else {
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch {
      // silent
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchDeposits = useCallback(async (status: string) => {
    setDepositsLoading(true);
    try {
      const res = await api.admin.deposits(`status=${status}`);
      const data = res.deposits || res.data || res;
      setDeposits(Array.isArray(data) ? data : []);
    } catch {
      // silent
    } finally {
      setDepositsLoading(false);
    }
  }, []);

  const fetchWithdrawals = useCallback(async (status: string) => {
    setWithdrawalsLoading(true);
    try {
      const res = await api.admin.withdrawals(`status=${status}`);
      const data = res.withdrawals || res.data || res;
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch {
      // silent
    } finally {
      setWithdrawalsLoading(false);
    }
  }, []);

  const fetchKyc = useCallback(async () => {
    setKycLoading(true);
    try {
      const res = await api.admin.kycPending();
      const data = res.kyc || res.data || res;
      setKycList(Array.isArray(data) ? data : []);
    } catch {
      // silent
    } finally {
      setKycLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin()) return;
    fetchStats();
    fetchUsers(1);
    fetchDeposits('pending');
    fetchWithdrawals('pending');
    fetchKyc();
  }, [isAdmin, fetchStats, fetchUsers, fetchDeposits, fetchWithdrawals, fetchKyc]);

  // Handlers
  const handleViewUser = async (id: string) => {
    setUserDetailOpen(true);
    setUserDetailLoading(true);
    try {
      const res = await api.admin.userDetail(id);
      setUserDetail(res.user || res.data || res);
    } catch {
      toast.error('Failed to load user details');
    } finally {
      setUserDetailLoading(false);
    }
  };

  const handleUpdateUser = async (id: string, action: string) => {
    setUserActionLoading(id);
    try {
      await api.admin.updateUser(id, { action });
      toast.success(`User ${action}d successfully`);
      fetchUsers(userPage);
      fetchStats();
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${action} user`);
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleApproveDeposit = async (id: string) => {
    setDepositActionLoading(id);
    try {
      await api.admin.approveDeposit(id);
      toast.success('Deposit approved');
      fetchDeposits(depositFilter);
      fetchStats();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve deposit');
    } finally {
      setDepositActionLoading(null);
    }
  };

  const handleRejectDeposit = async (id: string, reason: string) => {
    setDepositActionLoading(id);
    try {
      await api.admin.rejectDeposit(id, reason);
      toast.success('Deposit rejected');
      fetchDeposits(depositFilter);
      fetchStats();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject deposit');
    } finally {
      setDepositActionLoading(null);
    }
  };

  const handleApproveWithdrawal = async (id: string) => {
    setWithdrawalActionLoading(id);
    try {
      await api.admin.approveWithdrawal(id);
      toast.success('Withdrawal approved');
      fetchWithdrawals(withdrawalFilter);
      fetchStats();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve withdrawal');
    } finally {
      setWithdrawalActionLoading(null);
    }
  };

  const handleRejectWithdrawal = async (id: string, reason: string) => {
    setWithdrawalActionLoading(id);
    try {
      await api.admin.rejectWithdrawal(id, reason);
      toast.success('Withdrawal rejected');
      fetchWithdrawals(withdrawalFilter);
      fetchStats();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject withdrawal');
    } finally {
      setWithdrawalActionLoading(null);
    }
  };

  const handleApproveKyc = async (id: string) => {
    setKycActionLoading(id);
    try {
      await api.admin.approveKyc(id);
      toast.success('KYC approved');
      fetchKyc();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve KYC');
    } finally {
      setKycActionLoading(null);
    }
  };

  const handleRejectKyc = async (id: string, reason: string) => {
    setKycActionLoading(id);
    try {
      await api.admin.rejectKyc(id, reason);
      toast.success('KYC rejected');
      fetchKyc();
      fetchStats();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reject KYC');
    } finally {
      setKycActionLoading(null);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto opacity-50" />
          <p className="text-neutral-400">Access Denied</p>
          <p className="text-xs text-neutral-600">You do not have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-red-500" />
          Admin Panel
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage users, deposits, withdrawals, and KYC verifications.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#141414] border border-[#262626] flex-wrap h-auto gap-1 p-1">
          <TabsTrigger
            value="dashboard"
            className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-red-400 text-neutral-500 text-xs gap-1.5"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-red-400 text-neutral-500 text-xs gap-1.5"
          >
            <Users className="h-3.5 w-3.5" />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="deposits"
            className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-red-400 text-neutral-500 text-xs gap-1.5"
          >
            <ArrowDownCircle className="h-3.5 w-3.5" />
            Deposits
          </TabsTrigger>
          <TabsTrigger
            value="withdrawals"
            className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-red-400 text-neutral-500 text-xs gap-1.5"
          >
            <ArrowUpCircle className="h-3.5 w-3.5" />
            Withdrawals
          </TabsTrigger>
          <TabsTrigger
            value="kyc"
            className="data-[state=active]:bg-[#1a1a1a] data-[state=active]:text-red-400 text-neutral-500 text-xs gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            KYC
          </TabsTrigger>
        </TabsList>

        {/* ====== DASHBOARD TAB ====== */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              icon={<Users className="h-5 w-5 text-red-400" />}
              label="Total Users"
              value={stats?.totalUsers}
              format="number"
              loading={statsLoading}
            />
            <StatCard
              icon={<DollarSign className="h-5 w-5 text-green-400" />}
              label="Total Deposits"
              value={stats?.totalDepositsAmount ?? stats?.totalDeposits}
              format="money"
              loading={statsLoading}
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-blue-400" />}
              label="Active Investments"
              value={stats?.activeInvestments}
              format="number"
              loading={statsLoading}
            />
            <StatCard
              icon={<ShieldCheck className="h-5 w-5 text-yellow-400" />}
              label="Pending KYC"
              value={stats?.pendingKyc}
              format="number"
              loading={statsLoading}
              onClick={() => setActiveTab('kyc')}
            />
            <StatCard
              icon={<ArrowDownCircle className="h-5 w-5 text-yellow-400" />}
              label="Pending Deposits"
              value={stats?.pendingDeposits}
              format="number"
              loading={statsLoading}
              onClick={() => setActiveTab('deposits')}
            />
            <StatCard
              icon={<ArrowUpCircle className="h-5 w-5 text-yellow-400" />}
              label="Pending Withdrawals"
              value={stats?.pendingWithdrawals}
              format="number"
              loading={statsLoading}
              onClick={() => setActiveTab('withdrawals')}
            />
          </div>
        </TabsContent>

        {/* ====== USERS TAB ====== */}
        <TabsContent value="users">
          <Card className="border-[#262626] bg-gradient-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-red-500" />
                  User Management
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUsers(userPage)}
                    className="border-[#333] text-neutral-400 text-xs h-8 gap-1"
                  >
                    <Search className="h-3 w-3" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full bg-[#1a1a1a]" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                  <Users className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#262626] hover:bg-transparent">
                        <TableHead className="text-[11px] text-neutral-500 font-medium">Email</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium text-center hidden sm:table-cell">Status</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium text-center hidden md:table-cell">KYC</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium hidden lg:table-cell">Joined</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id} className="border-[#1e1e1e] hover:bg-[#1a1a1a]/50">
                          <TableCell className="text-xs text-neutral-300 py-2.5 font-medium max-w-[200px] truncate">
                            {u.email}
                            {(u.profile?.firstName || u.profile?.lastName) && (
                              <span className="text-neutral-500 ml-1">
                                ({u.profile?.firstName} {u.profile?.lastName})
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5 text-center hidden sm:table-cell">
                            <Badge className={`${statusBadge(u.status)} border text-[10px] capitalize`}>
                              {u.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5 text-center hidden md:table-cell">
                            <Badge className="border-neutral-600/30 bg-neutral-600/10 text-neutral-400 text-[10px]">
                              Level {u.kycLevel || 0}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-neutral-500 py-2.5 hidden lg:table-cell">
                            {fmtDate(u.createdAt)}
                          </TableCell>
                          <TableCell className="py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-neutral-400 hover:text-white hover:bg-[#1a1a1a]"
                                onClick={() => handleViewUser(u.id)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              {u.status !== 'active' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-green-400 hover:text-green-300 hover:bg-green-600/10"
                                  onClick={() => handleUpdateUser(u.id, 'activate')}
                                  disabled={userActionLoading === u.id}
                                >
                                  {userActionLoading === u.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <UserCheck className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              )}
                              {u.status !== 'suspended' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-600/10"
                                  onClick={() => handleUpdateUser(u.id, 'suspend')}
                                  disabled={userActionLoading === u.id}
                                >
                                  {userActionLoading === u.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              )}
                              {u.status !== 'banned' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-600/10"
                                  onClick={() => handleUpdateUser(u.id, 'ban')}
                                  disabled={userActionLoading === u.id}
                                >
                                  {userActionLoading === u.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Ban className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#262626]">
                    <span className="text-[11px] text-neutral-600">Page {userPage}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 border-[#333] text-neutral-400 text-xs"
                        onClick={() => {
                          const p = Math.max(1, userPage - 1);
                          setUserPage(p);
                          fetchUsers(p);
                        }}
                        disabled={userPage <= 1}
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 border-[#333] text-neutral-400 text-xs"
                        onClick={() => {
                          const p = userPage + 1;
                          setUserPage(p);
                          fetchUsers(p);
                        }}
                        disabled={users.length < PAGE_SIZE}
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== DEPOSITS TAB ====== */}
        <TabsContent value="deposits">
          <Card className="border-[#262626] bg-gradient-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <ArrowDownCircle className="h-4 w-4 text-red-500" />
                  Deposit Management
                </CardTitle>
                <Select value={depositFilter} onValueChange={(v) => { setDepositFilter(v); fetchDeposits(v); }}>
                  <SelectTrigger className="w-36 bg-[#0a0a0a] border-[#333] text-white text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#333]">
                    <SelectItem value="pending" className="text-neutral-300 focus:text-white focus:bg-[#1a1a1a]">Pending</SelectItem>
                    <SelectItem value="approved" className="text-neutral-300 focus:text-white focus:bg-[#1a1a1a]">Approved</SelectItem>
                    <SelectItem value="rejected" className="text-neutral-300 focus:text-white focus:bg-[#1a1a1a]">Rejected</SelectItem>
                    <SelectItem value="all" className="text-neutral-300 focus:text-white focus:bg-[#1a1a1a]">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {depositsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full bg-[#1a1a1a]" />
                  ))}
                </div>
              ) : deposits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                  <ArrowDownCircle className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No deposits found</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#262626] hover:bg-transparent">
                        <TableHead className="text-[11px] text-neutral-500 font-medium">User</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium text-right">Amount</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium hidden sm:table-cell">Method</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium text-center">Status</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium hidden md:table-cell">Date</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deposits.map((d) => (
                        <TableRow key={d.id} className="border-[#1e1e1e] hover:bg-[#1a1a1a]/50">
                          <TableCell className="text-xs text-neutral-300 py-2.5 max-w-[180px] truncate">
                            {getUserEmail(d)}
                          </TableCell>
                          <TableCell className="text-xs text-white font-medium text-right py-2.5">
                            ${fmt(d.amount)}
                          </TableCell>
                          <TableCell className="text-xs text-neutral-400 py-2.5 hidden sm:table-cell capitalize">
                            {d.method || 'N/A'}
                          </TableCell>
                          <TableCell className="py-2.5 text-center">
                            <Badge className={`${statusBadge(d.status)} border text-[10px] capitalize`}>
                              {d.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-neutral-500 py-2.5 hidden md:table-cell">
                            {fmtDate(d.createdAt)}
                          </TableCell>
                          <TableCell className="py-2.5 text-right">
                            {d.status?.toLowerCase() === 'pending' && (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  className="h-7 px-2.5 bg-green-600 hover:bg-green-700 text-white text-[10px] gap-1"
                                  onClick={() => handleApproveDeposit(d.id)}
                                  disabled={depositActionLoading === d.id}
                                >
                                  {depositActionLoading === d.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3 w-3" />
                                  )}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-7 px-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] gap-1"
                                  onClick={() => {
                                    setRejectDepositId(d.id);
                                    setRejectDepositOpen(true);
                                  }}
                                  disabled={depositActionLoading === d.id}
                                >
                                  <XCircle className="h-3 w-3" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== WITHDRAWALS TAB ====== */}
        <TabsContent value="withdrawals">
          <Card className="border-[#262626] bg-gradient-card">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <ArrowUpCircle className="h-4 w-4 text-red-500" />
                  Withdrawal Management
                </CardTitle>
                <Select value={withdrawalFilter} onValueChange={(v) => { setWithdrawalFilter(v); fetchWithdrawals(v); }}>
                  <SelectTrigger className="w-36 bg-[#0a0a0a] border-[#333] text-white text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-[#333]">
                    <SelectItem value="pending" className="text-neutral-300 focus:text-white focus:bg-[#1a1a1a]">Pending</SelectItem>
                    <SelectItem value="approved" className="text-neutral-300 focus:text-white focus:bg-[#1a1a1a]">Approved</SelectItem>
                    <SelectItem value="rejected" className="text-neutral-300 focus:text-white focus:bg-[#1a1a1a]">Rejected</SelectItem>
                    <SelectItem value="all" className="text-neutral-300 focus:text-white focus:bg-[#1a1a1a]">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {withdrawalsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full bg-[#1a1a1a]" />
                  ))}
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                  <ArrowUpCircle className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No withdrawals found</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#262626] hover:bg-transparent">
                        <TableHead className="text-[11px] text-neutral-500 font-medium">User</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium text-right">Amount</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium text-right hidden sm:table-cell">Fee</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium text-right hidden md:table-cell">Net</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium hidden lg:table-cell">Destination</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium text-center">Status</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((w) => (
                        <TableRow key={w.id} className="border-[#1e1e1e] hover:bg-[#1a1a1a]/50">
                          <TableCell className="text-xs text-neutral-300 py-2.5 max-w-[160px] truncate">
                            {getUserEmail(w)}
                          </TableCell>
                          <TableCell className="text-xs text-white font-medium text-right py-2.5">
                            ${fmt(w.amount)}
                          </TableCell>
                          <TableCell className="text-xs text-neutral-500 text-right py-2.5 hidden sm:table-cell">
                            ${fmt(w.fee || 0)}
                          </TableCell>
                          <TableCell className="text-xs text-green-400 text-right py-2.5 hidden md:table-cell">
                            ${fmt(w.netAmount || (w.amount - (w.fee || 0)))}
                          </TableCell>
                          <TableCell className="text-xs text-neutral-400 py-2.5 max-w-[140px] truncate hidden lg:table-cell">
                            {w.destination || w.walletAddress || 'N/A'}
                          </TableCell>
                          <TableCell className="py-2.5 text-center">
                            <Badge className={`${statusBadge(w.status)} border text-[10px] capitalize`}>
                              {w.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5 text-right">
                            {w.status?.toLowerCase() === 'pending' && (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="sm"
                                  className="h-7 px-2.5 bg-green-600 hover:bg-green-700 text-white text-[10px] gap-1"
                                  onClick={() => handleApproveWithdrawal(w.id)}
                                  disabled={withdrawalActionLoading === w.id}
                                >
                                  {withdrawalActionLoading === w.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3 w-3" />
                                  )}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-7 px-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] gap-1"
                                  onClick={() => {
                                    setRejectWithdrawalId(w.id);
                                    setRejectWithdrawalOpen(true);
                                  }}
                                  disabled={withdrawalActionLoading === w.id}
                                >
                                  <XCircle className="h-3 w-3" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== KYC TAB ====== */}
        <TabsContent value="kyc">
          <Card className="border-[#262626] bg-gradient-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-red-500" />
                  KYC Verifications
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchKyc}
                  className="border-[#333] text-neutral-400 text-xs h-8 gap-1"
                >
                  <Search className="h-3 w-3" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {kycLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full bg-[#1a1a1a]" />
                  ))}
                </div>
              ) : kycList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                  <ShieldCheck className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No pending KYC verifications</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#262626] hover:bg-transparent">
                        <TableHead className="text-[11px] text-neutral-500 font-medium">User</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium text-center">Level</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium hidden sm:table-cell">Submitted</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium hidden md:table-cell">Documents</TableHead>
                        <TableHead className="text-[11px] text-neutral-500 font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kycList.map((k) => (
                        <TableRow key={k.id} className="border-[#1e1e1e] hover:bg-[#1a1a1a]/50">
                          <TableCell className="text-xs text-neutral-300 py-2.5 max-w-[200px] truncate">
                            {getUserEmail(k)}
                          </TableCell>
                          <TableCell className="py-2.5 text-center">
                            <Badge className="border-blue-600/30 bg-blue-600/10 text-blue-400 text-[10px]">
                              Level {k.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-neutral-500 py-2.5 hidden sm:table-cell">
                            {fmtDate(k.createdAt)}
                          </TableCell>
                          <TableCell className="py-2.5 hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {k.idFrontUrl && (
                                <Badge className="border-neutral-600/30 bg-neutral-600/10 text-neutral-400 text-[9px]">ID Front</Badge>
                              )}
                              {k.idBackUrl && (
                                <Badge className="border-neutral-600/30 bg-neutral-600/10 text-neutral-400 text-[9px]">ID Back</Badge>
                              )}
                              {k.proofOfAddressUrl && (
                                <Badge className="border-neutral-600/30 bg-neutral-600/10 text-neutral-400 text-[9px]">Address</Badge>
                              )}
                              {k.selfieUrl && (
                                <Badge className="border-neutral-600/30 bg-neutral-600/10 text-neutral-400 text-[9px]">Selfie</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                className="h-7 px-2.5 bg-green-600 hover:bg-green-700 text-white text-[10px] gap-1"
                                onClick={() => handleApproveKyc(k.id)}
                                disabled={kycActionLoading === k.id}
                              >
                                {kycActionLoading === k.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3" />
                                )}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 px-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] gap-1"
                                onClick={() => {
                                  setRejectKycId(k.id);
                                  setRejectKycOpen(true);
                                }}
                                disabled={kycActionLoading === k.id}
                              >
                                <XCircle className="h-3 w-3" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialogs */}
      <RejectionDialog
        open={rejectDepositOpen}
        onClose={() => setRejectDepositOpen(false)}
        onConfirm={(reason) => {
          if (rejectDepositId) handleRejectDeposit(rejectDepositId, reason);
        }}
        title="Reject Deposit"
      />
      <RejectionDialog
        open={rejectWithdrawalOpen}
        onClose={() => setRejectWithdrawalOpen(false)}
        onConfirm={(reason) => {
          if (rejectWithdrawalId) handleRejectWithdrawal(rejectWithdrawalId, reason);
        }}
        title="Reject Withdrawal"
      />
      <RejectionDialog
        open={rejectKycOpen}
        onClose={() => setRejectKycOpen(false)}
        onConfirm={(reason) => {
          if (rejectKycId) handleRejectKyc(rejectKycId, reason);
        }}
        title="Reject KYC"
      />

      {/* User Detail Dialog */}
      <Dialog open={userDetailOpen} onOpenChange={setUserDetailOpen}>
        <DialogContent className="bg-[#141414] border-[#333] text-white sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-red-500" />
              User Details
            </DialogTitle>
          </DialogHeader>
          {userDetailLoading ? (
            <div className="space-y-3 py-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full bg-[#1a1a1a]" />
              ))}
            </div>
          ) : userDetail ? (
            <div className="space-y-3 py-2">
              <DetailRow label="Email" value={userDetail.email} />
              <DetailRow label="Name" value={`${userDetail.profile?.firstName || ''} ${userDetail.profile?.lastName || ''}`.trim() || 'N/A'} />
              <DetailRow label="Status">
                <Badge className={`${statusBadge(userDetail.status)} border text-[10px] capitalize`}>
                  {userDetail.status}
                </Badge>
              </DetailRow>
              <DetailRow label="KYC Level" value={`Level ${userDetail.kycLevel || 0}`} />
              <DetailRow label="Joined" value={fmtDate(userDetail.createdAt)} />
              <DetailRow label="Referral Code" value={userDetail.referralCode || 'N/A'} />
              {userDetail.wallets && userDetail.wallets.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-[#262626]">
                  <p className="text-xs text-neutral-500 font-medium">Wallets</p>
                  {userDetail.wallets.map((w: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-[#0f0f0f]">
                      <span className="text-neutral-400 capitalize">{w.type} Wallet</span>
                      <span className="text-white font-medium">${fmt(w.balance || 0)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 py-4 text-center">No data available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ===== Sub-components ===== */

function StatCard({
  icon,
  label,
  value,
  format,
  loading,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  format: 'money' | 'number';
  loading: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`border-[#262626] bg-gradient-card ${onClick ? 'cursor-pointer hover:border-red-500/30 transition-colors' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-xs text-neutral-500">{label}</span>
        </div>
        {loading ? (
          <Skeleton className="h-7 w-28 bg-[#1a1a1a]" />
        ) : (
          <p className="text-xl font-bold text-white">
            {format === 'money'
              ? `$${fmt(value ?? 0)}`
              : String(value ?? 0)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function DetailRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-neutral-500">{label}</span>
      {children ? children : <span className="text-sm text-neutral-300">{value}</span>}
    </div>
  );
}