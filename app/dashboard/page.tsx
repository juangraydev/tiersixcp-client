'use client';

import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Fingerprint,
  Calendar,
  Globe,
  LogOut,
  MapPin,
  Wallet,
  Coins,
  Star,
  Clock,
  Loader2,
} from 'lucide-react';

interface AccountInfo {
  username: string;
  email: string;
  pin: string;
  createDate: string;
  lastOnline: string;
  lastOffline: string;
  lastConnectIp: string;
}

interface BillingInfo {
  cashPoints: number;
  premiumStatus: string;
  premiumEndDate: string | null;
}

interface DashboardData {
  username: string;
  role: string;
  accountInfo: AccountInfo;
  billingInfo: BillingInfo;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/dashboard');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to load dashboard data');
        }

        setData(result.data);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Ticking Countdown Effect
  useEffect(() => {
    if (!data?.billingInfo?.premiumEndDate) return;

    const targetTime = new Date(data.billingInfo.premiumEndDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateTimer(); // Initial call immediately
    const interval = setInterval(updateTimer, 1000); // Ticks every 1 second

    return () => clearInterval(interval);
  }, [data]);

  const renderRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="rounded border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-xs font-semibold uppercase text-red-500">
          Admin
        </span>
      );
    }
    if (role === 'super_admin') {
      return (
        <span className="rounded border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-xs font-semibold uppercase text-red-500">
          Super Admin
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        <p className="text-xs text-neutral-400">Loading account information...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto my-12 max-w-xl rounded-xl border border-red-900/50 bg-red-950/20 p-6 text-center text-red-400">
        <p className="text-sm font-semibold">{error || 'Failed to load user account details.'}</p>
      </div>
    );
  }

  const isPremiumActive = !timeLeft.isExpired;

  return (
    <main className="flex-1 py-6">
      <div className="mx-auto max-w-6xl rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
        
        {/* Header Row: Greeting & Role Badge */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Welcome, {data.username}!
            </h1>
            {renderRoleBadge(data.role)}
          </div>
        </div>

        {/* Two-Column Card Grid Layout */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          {/* Account Information Card */}
          <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60">
            <div className="flex items-center gap-2 bg-red-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white">
              <User className="h-4 w-4" />
              <span>Account Information</span>
            </div>

            <div className="space-y-3 p-4 text-xs">
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-neutral-400" />
                <span className="font-semibold text-neutral-400">Username:</span>
                <span className="font-medium text-white">{data.accountInfo.username}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-neutral-400" />
                <span className="font-semibold text-neutral-400">Email:</span>
                <span className="font-medium text-white">{data.accountInfo.email}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Fingerprint className="h-4 w-4 text-amber-500" />
                <span className="font-semibold text-neutral-400">Pin:</span>
                <span className="font-medium text-white">{data.accountInfo.pin}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-emerald-500" />
                <span className="font-semibold text-neutral-400">Create Date:</span>
                <span className="font-medium text-white">{data.accountInfo.createDate}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-neutral-400">Last Online:</span>
                <span className="font-medium text-white">{data.accountInfo.lastOnline}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <LogOut className="h-4 w-4 text-red-500" />
                <span className="font-semibold text-neutral-400">Last Offline:</span>
                <span className="font-medium text-white">{data.accountInfo.lastOffline}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-red-500" />
                <span className="font-semibold text-neutral-400">Last Connect IP Address:</span>
                <span className="font-medium text-white">{data.accountInfo.lastConnectIp}</span>
              </div>
            </div>
          </div>

          {/* Billing Information Card */}
          <div className="h-fit overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60">
            <div className="flex items-center gap-2 bg-red-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white">
              <Wallet className="h-4 w-4" />
              <span>Billing Information</span>
            </div>

            <div className="space-y-3 p-4 text-xs">
              <div className="flex items-center gap-2.5">
                <Coins className="h-4 w-4 text-amber-400" />
                <span className="font-semibold text-neutral-400">Cash Points:</span>
                <span className="font-medium text-white">{data.billingInfo.cashPoints}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Star className="h-4 w-4 fill-red-500 text-red-500" />
                <span className="font-semibold text-neutral-400">Premium Status:</span>
                <span
                  className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${
                    isPremiumActive
                      ? 'border-emerald-500/50 bg-emerald-600/20 text-emerald-400'
                      : 'border-red-500/50 bg-red-600/20 text-red-500'
                  }`}
                >
                  {isPremiumActive ? 'ACTIVE' : 'EXPIRED'}
                </span>
              </div>

              {/* Ticking Premium Time Counter */}
              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="mt-0.5 h-4 w-4 text-sky-400" />
                <div>
                  <span className="font-semibold text-neutral-400">Premium Time Remaining:</span>
                  {isPremiumActive ? (
                    <div className="mt-1.5 flex items-center gap-1.5 font-mono text-xs font-bold text-sky-400">
                      <span className="rounded bg-neutral-950 px-2 py-1 border border-neutral-800">
                        {timeLeft.days}d
                      </span>
                      <span>:</span>
                      <span className="rounded bg-neutral-950 px-2 py-1 border border-neutral-800">
                        {String(timeLeft.hours).padStart(2, '0')}h
                      </span>
                      <span>:</span>
                      <span className="rounded bg-neutral-950 px-2 py-1 border border-neutral-800">
                        {String(timeLeft.minutes).padStart(2, '0')}m
                      </span>
                      <span>:</span>
                      <span className="rounded bg-neutral-950 px-2 py-1 border border-neutral-800">
                        {String(timeLeft.seconds).padStart(2, '0')}s
                      </span>
                    </div>
                  ) : (
                    <p className="mt-1 font-medium text-neutral-500">No active premium service</p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}