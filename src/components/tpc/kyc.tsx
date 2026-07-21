'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  ShieldCheck,
  ShieldX,
  Upload,
  Loader2,
  FileText,
  User,
  MapPin,
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

const KYC_LEVELS = [
  {
    level: 0,
    name: 'Unverified',
    color: 'bg-neutral-600/20 border-neutral-600/30 text-neutral-400',
    dotColor: 'bg-neutral-500',
    icon: <ShieldX className="h-5 w-5" />,
    description: 'No verification completed',
  },
  {
    level: 1,
    name: 'Basic',
    color: 'bg-blue-600/20 border-blue-600/30 text-blue-400',
    dotColor: 'bg-blue-500',
    icon: <User className="h-5 w-5" />,
    description: 'Government ID verified',
  },
  {
    level: 2,
    name: 'Standard',
    color: 'bg-purple-600/20 border-purple-600/30 text-purple-400',
    dotColor: 'bg-purple-500',
    icon: <MapPin className="h-5 w-5" />,
    description: 'ID + Proof of Address verified',
  },
  {
    level: 3,
    name: 'Premium',
    color: 'bg-yellow-600/20 border-yellow-600/30 text-yellow-400',
    dotColor: 'bg-yellow-500',
    icon: <Camera className="h-5 w-5" />,
    description: 'ID + Address + Selfie verified',
  },
];

interface KycSubmission {
  id: string;
  level: number;
  status: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  proofOfAddressUrl?: string;
  selfieUrl?: string;
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

interface KycStatus {
  currentLevel: number;
  submissions: KycSubmission[];
}

function statusBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === 'approved' || s === 'verified')
    return 'border-green-600/30 bg-green-600/10 text-green-400';
  if (s === 'pending' || s === 'submitted')
    return 'border-yellow-600/30 bg-yellow-600/10 text-yellow-400';
  if (s === 'rejected')
    return 'border-red-600/30 bg-red-600/10 text-red-400';
  return 'border-neutral-600/30 bg-neutral-600/10 text-neutral-400';
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Kyc() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [form, setForm] = useState({
    idFrontUrl: '',
    idBackUrl: '',
    proofOfAddressUrl: '',
    selfieUrl: '',
  });

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.kyc.status();
      setKycStatus(res.kyc || res.data || res);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const currentLevel = kycStatus?.currentLevel ?? 0;
  const nextLevel = currentLevel < 3 ? currentLevel + 1 : null;
  const submissions = kycStatus?.submissions || [];
  const hasPending = submissions.some(
    (s) => s.status?.toLowerCase() === 'pending' || s.status?.toLowerCase() === 'submitted'
  );

  const handleSubmit = async () => {
    if (!nextLevel) return;

    if (nextLevel >= 1 && !form.idFrontUrl.trim()) {
      toast.error('Please enter the ID Front URL');
      return;
    }
    if (nextLevel >= 1 && !form.idBackUrl.trim()) {
      toast.error('Please enter the ID Back URL');
      return;
    }
    if (nextLevel >= 2 && !form.proofOfAddressUrl.trim()) {
      toast.error('Please enter the Proof of Address URL');
      return;
    }
    if (nextLevel >= 3 && !form.selfieUrl.trim()) {
      toast.error('Please enter the Selfie URL');
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, string | number> = {
        level: nextLevel,
        idFrontUrl: form.idFrontUrl.trim(),
        idBackUrl: form.idBackUrl.trim(),
      };
      if (nextLevel >= 2) body.proofOfAddressUrl = form.proofOfAddressUrl.trim();
      if (nextLevel >= 3) body.selfieUrl = form.selfieUrl.trim();

      await api.kyc.submit(body);
      toast.success('KYC documents submitted successfully!');
      setForm({ idFrontUrl: '', idBackUrl: '', proofOfAddressUrl: '', selfieUrl: '' });
      fetchStatus();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-red-500" />
          KYC Verification
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Complete verification to unlock higher limits and full platform access.
        </p>
      </div>

      {/* Level Progress */}
      <Card className="border-white/[0.04] bg-white/[0.01]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-white">Verification Level</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-40 bg-white/[0.03]" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 flex-1 bg-white/[0.03]" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <Badge className={`${KYC_LEVELS[currentLevel].color} border text-sm px-3 py-1`}>
                  {KYC_LEVELS[currentLevel].icon}
                  <span className="ml-1.5">{KYC_LEVELS[currentLevel].name}</span>
                </Badge>
                {currentLevel < 3 && (
                  <span className="text-xs text-neutral-500">
                    Next: {KYC_LEVELS[currentLevel + 1].name}
                  </span>
                )}
                {currentLevel >= 3 && (
                  <span className="text-xs text-green-400">Fully Verified</span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {KYC_LEVELS.map((lvl) => {
                  const isCompleted = lvl.level <= currentLevel;
                  const isCurrent = lvl.level === currentLevel;
                  return (
                    <div
                      key={lvl.level}
                      className={`relative p-3 rounded-xl border transition-all ${
                        isCurrent
                          ? `${lvl.color} border`
                          : isCompleted
                          ? 'border-green-600/30 bg-green-600/5'
                          : 'border-white/[0.02] bg-black/30/50 opacity-50'
                      }`}
                    >
                      {isCompleted && !isCurrent && (
                        <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-green-400" />
                      )}
                      <div className="flex flex-col items-center text-center gap-1.5">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                            isCurrent
                              ? `${lvl.color} border`
                              : isCompleted
                              ? 'border-green-600/30 bg-green-600/10 text-green-400'
                              : 'border-white/[0.04] text-neutral-600'
                          }`}
                        >
                          {isCompleted && !isCurrent ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <span className={`text-xs font-bold ${lvl.dotColor.replace('bg-', 'text-')}`}>
                              L{lvl.level}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-white">{lvl.name}</span>
                        <span className="text-[10px] text-neutral-500 leading-tight">{lvl.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Submit KYC Form */}
      {nextLevel && !hasPending && (
        <Card className="border-white/[0.04] bg-white/[0.01]">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Upload className="h-4 w-4 text-red-500" />
              Submit for Level {nextLevel} — {KYC_LEVELS[nextLevel].name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-yellow-600/5 border border-yellow-600/20 p-3">
              <p className="text-xs text-yellow-400 flex items-center gap-2">
                <FileText className="h-4 w-4 shrink-0" />
                Upload your documents to Cloudinary and paste the URL below.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <User className="h-3 w-3" /> ID Front URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.idFrontUrl}
                  onChange={(e) => setForm((f) => ({ ...f, idFrontUrl: e.target.value }))}
                  placeholder="https://res.cloudinary.com/..."
                  className="bg-[#0a0a0a] border-white/[0.08] text-white placeholder:text-neutral-600 focus:border-red-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <User className="h-3 w-3" /> ID Back URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.idBackUrl}
                  onChange={(e) => setForm((f) => ({ ...f, idBackUrl: e.target.value }))}
                  placeholder="https://res.cloudinary.com/..."
                  className="bg-[#0a0a0a] border-white/[0.08] text-white placeholder:text-neutral-600 focus:border-red-500/50"
                />
              </div>
              {nextLevel >= 2 && (
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> Proof of Address URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.proofOfAddressUrl}
                    onChange={(e) => setForm((f) => ({ ...f, proofOfAddressUrl: e.target.value }))}
                    placeholder="https://res.cloudinary.com/..."
                    className="bg-[#0a0a0a] border-white/[0.08] text-white placeholder:text-neutral-600 focus:border-red-500/50"
                  />
                </div>
              )}
              {nextLevel >= 3 && (
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-400 flex items-center gap-1.5">
                    <Camera className="h-3 w-3" /> Selfie URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.selfieUrl}
                    onChange={(e) => setForm((f) => ({ ...f, selfieUrl: e.target.value }))}
                    placeholder="https://res.cloudinary.com/..."
                    className="bg-[#0a0a0a] border-white/[0.08] text-white placeholder:text-neutral-600 focus:border-red-500/50"
                  />
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white gap-2 w-full sm:w-auto"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Submit Documents
            </Button>
          </CardContent>
        </Card>
      )}

      {hasPending && (
        <Card className="border-yellow-600/20 bg-yellow-600/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-yellow-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-400">Verification Pending</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Your KYC documents are under review. You&apos;ll be notified once approved.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {currentLevel >= 3 && (
        <Card className="border-green-600/20 bg-green-600/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-400">Fully Verified</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Your account has been verified at the highest level. You have full platform access.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submitted Documents Table */}
      <Card className="border-white/[0.04] bg-white/[0.01]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white">Submission History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-white/[0.03]" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
              <FileText className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No submissions yet</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.04] hover:bg-transparent">
                    <TableHead className="text-[11px] text-neutral-500 font-medium">Level</TableHead>
                    <TableHead className="text-[11px] text-neutral-500 font-medium">Date</TableHead>
                    <TableHead className="text-[11px] text-neutral-500 font-medium text-center">Status</TableHead>
                    <TableHead className="text-[11px] text-neutral-500 font-medium hidden sm:table-cell">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow key={sub.id} className="border-white/[0.02] hover:bg-white/[0.03]/50">
                      <TableCell className="py-2.5">
                        <Badge
                          className={`${KYC_LEVELS[sub.level || 0]?.color || ''} border text-[10px]`}
                        >
                          Level {sub.level || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-neutral-400 py-2.5">
                        {fmtDate(sub.createdAt)}
                      </TableCell>
                      <TableCell className="py-2.5 text-center">
                        <Badge className={`${statusBadge(sub.status)} border text-[10px] capitalize`}>
                          {sub.status === 'submitted' ? 'pending' : sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-neutral-500 py-2.5 hidden sm:table-cell max-w-[200px] truncate">
                        {sub.rejectionReason || sub.status?.toLowerCase() === 'approved' ? (
                          <span className="flex items-center gap-1 text-green-400">
                            <CheckCircle2 className="h-3 w-3" /> Approved
                          </span>
                        ) : sub.rejectionReason ? (
                          <span className="flex items-center gap-1 text-red-400">
                            <XCircle className="h-3 w-3" /> {sub.rejectionReason}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-400">
                            <Clock className="h-3 w-3" /> Under review
                          </span>
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
    </div>
  );
}