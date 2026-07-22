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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  ShieldCheck,
  Save,
  Loader2,
  Globe,
  Building2,
  Hash,
} from 'lucide-react';

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'South Korea',
  'Singapore',
  'United Arab Emirates',
  'Switzerland',
  'Netherlands',
  'Brazil',
  'India',
  'Nigeria',
  'South Africa',
  'Mexico',
  'Argentina',
  'Turkey',
  'Saudi Arabia',
  'Other',
];

function kycBadge(level: string) {
  const l = level?.toLowerCase() || '';
  if (l === '3' || l === 'premium' || l === 'verified')
    return 'border-green-600/30 bg-green-600/10 text-green-400';
  if (l === '2' || l === 'standard' || l === 'level_2')
    return 'border-purple-600/30 bg-purple-600/10 text-purple-400';
  if (l === '1' || l === 'basic')
    return 'border-blue-600/30 bg-blue-600/10 text-blue-400';
  return 'border-neutral-600/30 bg-neutral-600/10 text-neutral-400';
}

function kycLabel(level: string) {
  const l = level?.toLowerCase() || '';
  if (l === '3' || l === 'premium') return 'Premium';
  if (l === '2' || l === 'standard' || l === 'level_2') return 'Standard';
  if (l === '1' || l === 'basic') return 'Basic';
  if (l === '0') return 'Unverified';
  return level || 'Unverified';
}

interface ProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  country?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  email?: string;
  kycLevel?: string;
  createdAt?: string;
}

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({});
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.user.profile();
      const data = res.profile || res.data || res;
      setProfile(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateField = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.user.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        country: profile.country,
        streetAddress: profile.streetAddress,
        city: profile.city,
        state: profile.state,
        postalCode: profile.postalCode,
      });
      toast.success('Profile updated successfully!');
      if (res.user) setUser({ ...user!, ...res.user } as any);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setChangingPw(true);
    try {
      await api.auth.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  const email = profile.email || user?.email || '';
  const kycLevel = profile.kycLevel || user?.kycLevel || '0';
  const createdAt = (profile as any).createdAt || (user as any)?.createdAt;
  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <div className="space-y-6 p-4 lg:p-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="h-6 w-6 text-red-500" />
          Profile Settings
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your personal information, security, and account settings.
        </p>
      </div>

      {/* Personal Information */}
      <Card className="border-white/[0.04] bg-white/[0.01]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <User className="h-4 w-4 text-red-500" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24 bg-white/[0.03]" />
                  <Skeleton className="h-10 w-full bg-white/[0.03]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <User className="h-3 w-3" /> First Name
                </Label>
                <Input
                  value={profile.firstName || ''}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  placeholder="Enter first name"
                  className="bg-[#0a0a0a] border-white/[0.08] text-white placeholder:text-neutral-600 focus:border-red-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <User className="h-3 w-3" /> Last Name
                </Label>
                <Input
                  value={profile.lastName || ''}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  placeholder="Enter last name"
                  className="bg-[#0a0a0a] border-white/[0.08] text-white placeholder:text-neutral-600 focus:border-red-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> Phone Number
                </Label>
                <Input
                  value={profile.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="bg-[#0a0a0a] border-white/[0.08] text-white placeholder:text-neutral-600 focus:border-red-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> Date of Birth
                </Label>
                <Input
                  type="date"
                  value={profile.dateOfBirth || ''}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className="bg-[#0a0a0a] border-white/[0.08] text-white placeholder:text-neutral-600 focus:border-red-500/50"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <Globe className="h-3 w-3" /> Country
                </Label>
                <Select
                  value={profile.country || ''}
                  onValueChange={(val) => updateField('country', val)}
                >
                  <SelectTrigger className="bg-[#0a0a0a] border-white/[0.08] text-white focus:border-red-500/50">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/[0.02] border-white/[0.08]">
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c} className="text-neutral-300 focus:text-white focus:bg-white/[0.03]">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Address */}
      <Card className="border-white/[0.04] bg-white/[0.01]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-500" />
            Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24 bg-white/[0.03]" />
                  <Skeleton className="h-10 w-full bg-white/[0.03]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <Building2 className="h-3 w-3" /> Street Address
                </Label>
                <Input
                  value={profile.streetAddress || ''}
                  onChange={(e) => updateField('streetAddress', e.target.value)}
                  placeholder="123 Main Street, Apt 4B"
                  className="bg-[#0a0a0a] border-white/[0.08] text-white placeholder:text-neutral-600 focus:border-red-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> City
                </Label>
                <Input
                  value={profile.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="City"
                  className="bg-[#0a0a0a] border-white/[0.08] text-white placeholder:text-neutral-600 focus:border-red-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> State / Province
                </Label>
                <Input
                  value={profile.state || ''}
                  onChange={(e) => updateField('state', e.target.value)}
                  placeholder="State"
                  className="bg-[#0a0a0a] border-white/[0.08] text-white placeholder:text-neutral-600 focus:border-red-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <Hash className="h-3 w-3" /> Postal Code
                </Label>
                <Input
                  value={profile.postalCode || ''}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  placeholder="10001"
                  className="bg-[#0a0a0a] border-white/[0.08] text-white placeholder:text-neutral-600 focus:border-red-500/50"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="border-white/[0.04] bg-white/[0.01]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-red-500" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24 bg-white/[0.03]" />
                  <Skeleton className="h-5 w-32 bg-white/[0.03]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-neutral-500 flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> Email
                </span>
                <span className="text-sm text-neutral-300 font-medium">{email}</span>
              </div>
              <Separator className="bg-[#262626]" />
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-neutral-500 flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3" /> KYC Level
                </span>
                <Badge className={`${kycBadge(kycLevel)} border text-[10px]`}>
                  {kycLabel(kycLevel)}
                </Badge>
              </div>
              <Separator className="bg-[#262626]" />
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-neutral-500 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> Member Since
                </span>
                <span className="text-sm text-neutral-300">{memberSince}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-white/[0.04] bg-white/[0.01]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-red-500" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-neutral-400">Current Password</Label>
              <Input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
                }
                placeholder="••••••••"
                className="bg-[#0a0a0a] border-white/[0.08] text-white placeholder:text-neutral-600 focus:border-red-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-neutral-400">New Password</Label>
              <Input
                type="password"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, newPassword: e.target.value }))
                }
                placeholder="••••••••"
                className="bg-[#0a0a0a] border-white/[0.08] text-white placeholder:text-neutral-600 focus:border-red-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-neutral-400">Confirm New Password</Label>
              <Input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                placeholder="••••••••"
                className="bg-[#0a0a0a] border-white/[0.08] text-white placeholder:text-neutral-600 focus:border-red-500/50"
              />
            </div>
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={changingPw}
            variant="outline"
            className="border-white/[0.08] text-neutral-300 hover:text-white hover:bg-white/[0.03] gap-2"
          >
            {changingPw ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Auth */}
      <Card className="border-white/[0.04] bg-white/[0.01]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-red-500" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-300">Enable 2FA</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Add an extra layer of security to your account.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="border-yellow-600/30 bg-yellow-600/10 text-yellow-400 text-[10px]">
                Coming Soon
              </Badge>
              <Switch disabled checked={false} className="opacity-50" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-red-600 hover:bg-red-700 text-white gap-2 h-11 px-8"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}