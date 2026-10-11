/**
 * Rewards, Credits & Digital Gift Card Marketplace View
 * Authentic, High-End Card Design with Instant Vouchers
 */

import React, { useState } from 'react';
import { User, RewardCoupon, Achievement } from '../../types';
import { storageService } from '../../services/storageService';
import { RewardService } from '../../services/rewardService';
import confetti from 'canvas-confetti';
import {
  Award,
  Flame,
  Gift,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Clock,
  TrendingUp,
  Tag,
  Zap,
  ArrowRight,
  ShieldCheck,
  Check,
  Percent,
  Search,
  Filter,
  CreditCard,
  QrCode,
  Layers,
  ChevronRight,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface RewardsStoreViewProps {
  user: User;
  onNavigate?: (view: string) => void;
}

export const RewardsStoreView: React.FC<RewardsStoreViewProps> = ({ user, onNavigate }) => {
  const studentId = user.studentId || '101';
  const [rewardProfile, setRewardProfile] = useState(() => storageService.getRewardProfile(studentId));
  const coupons = storageService.getCoupons();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [redeemedModalCoupon, setRedeemedModalCoupon] = useState<RewardCoupon | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'catalog' | 'claimed' | 'achievements'>('catalog');

  const categories = ['All', 'Shopping', 'Food & Dining', 'Entertainment', 'Education'];

  const filteredCoupons = coupons.filter(c => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchPartner = c.partner.toLowerCase().includes(q);
      if (!matchTitle && !matchPartner) return false;
    }

    if (activeCategory === 'All') return true;
    if (activeCategory === 'Shopping') return c.category === 'Shopping' || c.partner === 'Amazon' || c.partner === 'Flipkart' || c.partner === 'Myntra';
    if (activeCategory === 'Food & Dining') return c.category === 'Food & Dining' || c.partner === 'Swiggy' || c.partner === 'Zomato';
    if (activeCategory === 'Entertainment') return c.category === 'Entertainment' || c.partner === 'BookMyShow' || c.partner === 'Spotify';
    if (activeCategory === 'Education') return c.category === 'Education' || c.partner === 'Udemy';
    return true;
  });

  const handleRedeem = (couponId: string) => {
    const res = RewardService.redeemCoupon(studentId, couponId);
    if (res.success && res.coupon) {
      setRewardProfile(storageService.getRewardProfile(studentId));
      setRedeemedModalCoupon(res.coupon);
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });
    } else {
      setFeedbackMessage({ type: 'error', text: res.message });
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Brand-authentic styles for gift cards
  const getBrandDetails = (partner: string) => {
    switch (partner.toLowerCase()) {
      case 'amazon':
        return {
          brandColor: '#FF9900',
          gradientBg: 'from-amber-950/60 via-slate-900 to-slate-950',
          headerBg: 'bg-[#131921]',
          borderColor: 'border-amber-500/40 hover:border-amber-400',
          accentText: 'text-amber-400',
          badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          logoText: 'amazon',
          logoSubtext: 'pay',
          barcodeColor: 'text-amber-500/40',
        };
      case 'flipkart':
        return {
          brandColor: '#2874F0',
          gradientBg: 'from-blue-950/60 via-slate-900 to-slate-950',
          headerBg: 'bg-[#172337]',
          borderColor: 'border-blue-500/40 hover:border-blue-400',
          accentText: 'text-blue-400',
          badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
          logoText: 'Flipkart',
          logoSubtext: 'Assured',
          barcodeColor: 'text-blue-500/40',
        };
      case 'swiggy':
        return {
          brandColor: '#FC8019',
          gradientBg: 'from-orange-950/60 via-slate-900 to-slate-950',
          headerBg: 'bg-[#281c15]',
          borderColor: 'border-orange-500/40 hover:border-orange-400',
          accentText: 'text-orange-400',
          badgeBg: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
          logoText: 'SWIGGY',
          logoSubtext: 'Food & Instamart',
          barcodeColor: 'text-orange-500/40',
        };
      case 'zomato':
        return {
          brandColor: '#E23744',
          gradientBg: 'from-rose-950/60 via-slate-900 to-slate-950',
          headerBg: 'bg-[#2b1417]',
          borderColor: 'border-rose-500/40 hover:border-rose-400',
          accentText: 'text-rose-400',
          badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          logoText: 'zomato',
          logoSubtext: 'Dining & Gold',
          barcodeColor: 'text-rose-500/40',
        };
      case 'spotify':
        return {
          brandColor: '#1DB954',
          gradientBg: 'from-emerald-950/60 via-slate-900 to-slate-950',
          headerBg: 'bg-[#121212]',
          borderColor: 'border-emerald-500/40 hover:border-emerald-400',
          accentText: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          logoText: 'Spotify',
          logoSubtext: 'Premium',
          barcodeColor: 'text-emerald-500/40',
        };
      case 'bookmyshow':
        return {
          brandColor: '#F84464',
          gradientBg: 'from-red-950/60 via-slate-900 to-slate-950',
          headerBg: 'bg-[#26141a]',
          borderColor: 'border-red-500/40 hover:border-red-400',
          accentText: 'text-red-400',
          badgeBg: 'bg-red-500/15 text-red-300 border-red-500/30',
          logoText: 'bookmyshow',
          logoSubtext: 'Movies & Events',
          barcodeColor: 'text-red-500/40',
        };
      case 'myntra':
        return {
          brandColor: '#FF3F6C',
          gradientBg: 'from-pink-950/60 via-slate-900 to-slate-950',
          headerBg: 'bg-[#291720]',
          borderColor: 'border-pink-500/40 hover:border-pink-400',
          accentText: 'text-pink-400',
          badgeBg: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
          logoText: 'Myntra',
          logoSubtext: 'Fashion',
          barcodeColor: 'text-pink-500/40',
        };
      case 'udemy':
        return {
          brandColor: '#A435F0',
          gradientBg: 'from-purple-950/60 via-slate-900 to-slate-950',
          headerBg: 'bg-[#1c1429]',
          borderColor: 'border-purple-500/40 hover:border-purple-400',
          accentText: 'text-purple-400',
          badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          logoText: 'udemy',
          logoSubtext: 'Skill Credit',
          barcodeColor: 'text-purple-500/40',
        };
      default:
        return {
          brandColor: '#6366F1',
          gradientBg: 'from-indigo-950/60 via-slate-900 to-slate-950',
          headerBg: 'bg-[#161a29]',
          borderColor: 'border-indigo-500/40 hover:border-indigo-400',
          accentText: 'text-indigo-400',
          badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          logoText: partner,
          logoSubtext: 'Partner Card',
          barcodeColor: 'text-indigo-500/40',
        };
    }
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* SECTION 1: SCHOLAR WALLET PASSPORT & STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Physical Digital Pass Card */}
        <div className="lg:col-span-1">
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 shadow-2xl space-y-6 flex flex-col justify-between h-full min-h-[220px]">
            {/* Glowing Accent Orbs */}
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

            {/* Top Pass Details */}
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5 w-fit">
                  <Sparkles className="h-3 w-3" />
                  <span>Scholar Reward Pass</span>
                </span>
                <h3 className="text-sm font-bold text-slate-300 pt-1">
                  AAK Academic Wallet
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold bg-slate-900/90 px-3 py-1 rounded-xl border border-amber-500/30 shadow">
                <Flame className="h-4 w-4 fill-amber-400" />
                <span>{rewardProfile.currentStreakDays}d Streak</span>
              </div>
            </div>

            {/* Simulated Gold EMV Chip & Contactless */}
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 border border-amber-300/60 shadow-md flex items-center justify-center">
                <div className="w-8 h-5 border border-amber-800/40 rounded-sm grid grid-cols-2 grid-rows-2 opacity-60" />
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <span className="text-xs font-mono font-bold tracking-widest text-slate-400">CREDIT PASSPORT</span>
              </div>
            </div>

            {/* Live Balance & Holder Info */}
            <div className="relative z-10 pt-2 border-t border-slate-800/80">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Available Balance
                  </span>
                  <div className="text-3xl font-black text-amber-400 tracking-tight flex items-baseline gap-1.5">
                    {rewardProfile.availableCredits}
                    <span className="text-xs font-bold text-slate-300 uppercase">Credits</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">CARDHOLDER</span>
                  <span className="text-xs font-bold text-white block truncate max-w-[140px]">
                    {user.displayName || 'Ankur Jadhav'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    ID: {studentId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Earning Milestones & Action Strip */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                <span>Earn Real Brand Vouchers for Academic Progress</span>
              </h2>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Instant Delivery
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every completed exam, weak topic remediation, and concept mastery milestone instantly awards credits to your wallet. Redeem anytime for digital vouchers from India's top brand partners.
            </p>
          </div>

          {/* Quick Ways to Earn Credits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-1.5 relative overflow-hidden group hover:border-indigo-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Exam Practice</span>
                <span className="text-xs font-black text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  +30 pts
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">Complete 30-Q Exam</h4>
              <p className="text-[11px] text-slate-400">Finish any diagnostic, timed or adaptive assessment.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-1.5 relative overflow-hidden group hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Remediation</span>
                <span className="text-xs font-black text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/20">
                  +25 pts
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">Pass Micro-Review</h4>
              <p className="text-[11px] text-slate-400">Solve 2 targeted questions in Weak Topics hub.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-1.5 relative overflow-hidden group hover:border-emerald-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Mastery Goal</span>
                <span className="text-xs font-black text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  +50 pts
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">Reach 90%+ BKT</h4>
              <p className="text-[11px] text-slate-400">Elevate any concept to expert mastery standing.</p>
            </div>
          </div>

          {/* Quick Metrics Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>Lifetime Earned: <strong className="text-white">{rewardProfile.lifetimeEarnedCredits || rewardProfile.totalCredits}</strong> pts</span>
              <span>·</span>
              <span>Claimed Vouchers: <strong className="text-amber-400">{rewardProfile.redeemedCoupons.length}</strong></span>
            </div>
            {rewardProfile.redeemedCoupons.length > 0 && (
              <button
                onClick={() => setActiveTab('claimed')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View My Claimed Codes ({rewardProfile.redeemedCoupons.length})</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: NAVIGATION TABS & SEARCH BAR */}
      <div className="space-y-4">
        {feedbackMessage && (
          <div
            className={`rounded-2xl p-4 text-xs sm:text-sm font-semibold border flex items-center justify-between ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}
          >
            <span>{feedbackMessage.text}</span>
            <button onClick={() => setFeedbackMessage(null)} className="text-xs opacity-80 hover:opacity-100 cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          {/* Main Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Gift className="h-4 w-4" />
              <span>Available Gift Vouchers ({coupons.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('claimed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'claimed'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="h-4 w-4" />
              <span>My Claimed Codes ({rewardProfile.redeemedCoupons.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'achievements'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Academic Milestones</span>
            </button>
          </div>

          {/* Search Input (visible in catalog tab) */}
          {activeTab === 'catalog' && (
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Amazon, Flipkart..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Category Pills (Catalog view only) */}
        {activeTab === 'catalog' && (
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: CATALOG GRID OF LUXURY GIFT CARDS */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map(coupon => {
              const brand = getBrandDetails(coupon.partner);
              const canAfford = rewardProfile.availableCredits >= coupon.costCredits;
              const remaining = Math.max(0, coupon.costCredits - rewardProfile.availableCredits);
              const progressPct = Math.min(100, Math.round((rewardProfile.availableCredits / coupon.costCredits) * 100));

              return (
                <div
                  key={coupon.id}
                  className={`relative flex flex-col justify-between rounded-3xl border bg-gradient-to-b ${brand.gradientBg} shadow-2xl transition-all duration-300 hover:-translate-y-1 ${brand.borderColor} overflow-hidden group`}
                >
                  {/* Card Header: Official Brand Emblem & Value */}
                  <div className={`${brand.headerBg} p-5 border-b border-slate-800/80 flex items-start justify-between relative`}>
                    {/* Brand Identifier */}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black tracking-tight text-white">
                          {brand.logoText}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                          {brand.logoSubtext}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Official Digital E-Voucher
                      </span>
                    </div>

                    {/* Prominent Rupee Face Value Stamp */}
                    <div className="text-right">
                      <div className="text-2xl font-black text-white flex items-baseline justify-end gap-0.5">
                        <span className={brand.accentText}>₹</span>
                        <span>{coupon.valueINR}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Instant Credit
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Title, Terms & Simulated Barcode */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="text-sm font-extrabold text-white group-hover:text-amber-300 transition leading-snug">
                        {coupon.title}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {coupon.description || `Redeemable across all purchases in ${coupon.partner} mobile app & website with zero transaction fees.`}
                      </p>
                    </div>

                    {/* Authenticity Strip & Simulated Barcode */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/60">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-slate-400">
                          <ShieldCheck className="h-3 w-3 text-emerald-400" />
                          100% Genuine Partner Code
                        </span>
                        <span>EXP: 12 MONTHS</span>
                      </div>

                      {/* Realistic Gift Card Barcode Graphic */}
                      <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/60 flex items-center justify-between font-mono">
                        <span className={`text-[11px] font-black tracking-widest ${brand.barcodeColor}`}>
                          ||| | || |||| | || | ||| || |
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          CARD-****-{coupon.costCredits}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Cost & Redemption Action */}
                  <div className="p-5 bg-slate-950/70 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Required Cost:</span>
                      <span className="font-extrabold text-amber-400 flex items-center gap-1.5 text-sm">
                        <Award className="h-4 w-4" />
                        <span>{coupon.costCredits} Credits</span>
                      </span>
                    </div>

                    {/* Progress to Afford (if not enough) */}
                    {!canAfford && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Wallet Progress</span>
                          <span className="font-mono text-slate-300">
                            {rewardProfile.availableCredits}/{coupon.costCredits}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      disabled={!canAfford}
                      onClick={() => handleRedeem(coupon.id)}
                      className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 shadow cursor-pointer ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:from-amber-300 hover:to-yellow-300 shadow-amber-400/20 active:scale-[0.98]'
                          : 'bg-slate-800/70 text-slate-500 cursor-not-allowed border border-slate-700/40'
                      }`}
                    >
                      {canAfford ? (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Redeem ₹{coupon.valueINR} Gift Card Now</span>
                        </>
                      ) : (
                        <span>Need {remaining} More Credits to Unlock</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCoupons.length === 0 && (
            <div className="py-12 text-center text-slate-400 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
              <Gift className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <span>No coupons found matching your query.</span>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: CLAIMED VOUCHERS VAULT */}
      {activeTab === 'claimed' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="h-5 w-5 text-emerald-400" />
                <span>My Claimed Voucher Codes ({rewardProfile.redeemedCoupons.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Copy your codes directly and paste them into the checkout screen on partner websites.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('catalog')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore More Vouchers</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {rewardProfile.redeemedCoupons.length === 0 ? (
            <div className="py-16 text-center text-slate-400 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <Gift className="h-10 w-10 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Claimed Vouchers Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You have {rewardProfile.availableCredits} credits in your wallet! Browse the catalog and claim your first digital gift card from Amazon, Flipkart, Swiggy, or Spotify.
              </p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition cursor-pointer"
              >
                Browse Vouchers
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {rewardProfile.redeemedCoupons.map((c, idx) => {
                const brand = getBrandDetails(c.partner);
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4 shadow-xl hover:border-slate-700 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${brand.badgeBg}`}>
                          {c.partner}
                        </span>
                        <h4 className="text-sm font-bold text-white">{c.title}</h4>
                        <span className="text-[11px] text-slate-400 block">
                          Claimed on {new Date(c.redeemedAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-400">₹{c.valueINR}</span>
                        <span className="text-[10px] text-emerald-300 font-bold block uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Active
                        </span>
                      </div>
                    </div>

                    {/* Voucher Code Box */}
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                          VOUCHER CODE:
                        </span>
                        <span className="font-mono text-sm font-black text-amber-300 tracking-wider">
                          {c.code || 'AMZ-8392-L9X1'}
                        </span>
                      </div>

                      <button
                        onClick={() => c.code && copyToClipboard(c.code)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition cursor-pointer shadow"
                      >
                        {copiedCode === c.code ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-300" />
                            <span className="text-emerald-300 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Paste this voucher code during payment checkout on the {c.partner} app or website. Valid for 12 months from issuance.
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: ACADEMIC MILESTONES */}
      {activeTab === 'achievements' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-400" />
                <span>Academic Badges & Bonus Credit Milestones</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Unlock milestones across study consistency, exam scores, and topic mastery.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rewardProfile.achievements.map(ach => (
              <div
                key={ach.id}
                className={`rounded-2xl border p-5 space-y-3.5 transition ${
                  ach.isUnlocked
                    ? 'border-indigo-500/40 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 bg-slate-950/70 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800">
                    {ach.icon}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      ach.isUnlocked
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {ach.isUnlocked ? 'Unlocked ✓' : `${ach.progress || 0}/${ach.maxProgress || 1}`}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{ach.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Reward:</span>
                  <span className="font-extrabold text-amber-400 flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" />
                    <span>+{ach.creditsReward} Credits</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 6: INSTANT POPUP MODAL ON REDEEMING */}
      {redeemedModalCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/40 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/20">
              <Sparkles className="h-8 w-8" />
            </div>

            <div className="space-y-1.5 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-0.5 rounded-full border border-emerald-500/20">
                Redemption Successful!
              </span>
              <h3 className="text-2xl font-black text-white mt-1">₹{redeemedModalCoupon.valueINR} Gift Card Claimed</h3>
              <p className="text-xs text-slate-300">
                You successfully claimed your <strong>{redeemedModalCoupon.title}</strong>
              </p>
            </div>

            {/* Simulated Scratch Card Reveal */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2 relative z-10">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Your Official Gift Card Code:
              </span>
              <div className="font-mono text-lg font-black text-amber-300 tracking-widest bg-slate-900/90 py-2 rounded-xl border border-amber-500/30">
                {redeemedModalCoupon.code}
              </div>
              <button
                onClick={() => redeemedModalCoupon.code && copyToClipboard(redeemedModalCoupon.code)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold hover:bg-amber-300 transition shadow cursor-pointer"
              >
                {copiedCode === redeemedModalCoupon.code ? (
                  <>
                    <Check className="h-4 w-4 text-slate-950" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Voucher Code</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 relative z-10 leading-relaxed">
              Use this code during checkout on {redeemedModalCoupon.partner}. It has also been saved to your "My Claimed Codes" tab.
            </p>

            <button
              onClick={() => setRedeemedModalCoupon(null)}
              className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer relative z-10"
            >
              Done & Return to Store
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
