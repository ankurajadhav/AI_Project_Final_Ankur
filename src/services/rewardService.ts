/**
 * Gamification, Credits & Coupon Reward Marketplace Service
 */

import { StudentRewardProfile, RewardCoupon, Achievement } from '../types';
import { storageService } from './storageService';

export class RewardService {
  /**
   * Awards credits to student and checks for unlocked achievements
   */
  static awardCredits(
    studentId: string,
    amount: number,
    reason: string
  ): { profile: StudentRewardProfile; newlyUnlocked: Achievement[] } {
    const profile = storageService.getRewardProfile(studentId);
    
    profile.totalCredits += amount;
    profile.availableCredits += amount;
    profile.lifetimeEarnedCredits += amount;

    const newlyUnlocked: Achievement[] = [];

    // Check achievement rules
    profile.achievements.forEach(ach => {
      if (!ach.isUnlocked) {
        if (ach.id === 'ach_first_exam' && profile.lifetimeEarnedCredits >= 50) {
          ach.isUnlocked = true;
          ach.unlockedAt = new Date().toISOString();
          ach.progress = ach.maxProgress;
          profile.availableCredits += ach.creditsReward;
          newlyUnlocked.push(ach);
        } else if (ach.id === 'ach_concept_master' && reason.includes('Mastery')) {
          ach.progress = Math.min(ach.maxProgress, ach.progress + 1);
          if (ach.progress >= ach.maxProgress) {
            ach.isUnlocked = true;
            ach.unlockedAt = new Date().toISOString();
            profile.availableCredits += ach.creditsReward;
            newlyUnlocked.push(ach);
          }
        }
      }
    });

    storageService.updateRewardProfile(profile);
    storageService.addAuditLog(
      studentId,
      'student',
      'CREDITS_AWARDED',
      `+${amount} Credits earned for ${reason}. New balance: ${profile.availableCredits} Credits.`
    );

    return { profile, newlyUnlocked };
  }

  /**
   * Redeems a partner gift voucher using available credits
   */
  static redeemCoupon(
    studentId: string,
    couponId: string
  ): { success: boolean; message: string; coupon?: RewardCoupon } {
    const profile = storageService.getRewardProfile(studentId);
    const coupons = storageService.getCoupons();
    const coupon = coupons.find(c => c.id === couponId);

    if (!coupon) {
      return { success: false, message: 'Voucher not found in catalog.' };
    }

    if (profile.availableCredits < coupon.costCredits) {
      return {
        success: false,
        message: `Insufficient credits. You need ${coupon.costCredits} credits (you have ${profile.availableCredits}).`,
      };
    }

    // Generate unique verifiable coupon code
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const activeCouponCode = `${coupon.partner.substring(0, 3).toUpperCase()}-${coupon.valueINR}-${randomSuffix}-${Date.now().toString().slice(-4)}`;

    const redeemedCopy: RewardCoupon = {
      ...coupon,
      id: `redeemed_${Date.now()}_${coupon.id}`,
      code: activeCouponCode,
      isRedeemed: true,
      redeemedBy: studentId,
      redeemedAt: new Date().toISOString(),
    };

    profile.availableCredits -= coupon.costCredits;
    profile.redeemedCoupons.unshift(redeemedCopy);

    storageService.updateRewardProfile(profile);
    storageService.addAuditLog(
      studentId,
      'student',
      'COUPON_REDEEMED',
      `Redeemed ${coupon.title} for ${coupon.costCredits} credits. Voucher code: ${activeCouponCode}`
    );

    return {
      success: true,
      message: `🎉 Successfully redeemed ${coupon.title}! Your voucher code is ${activeCouponCode}`,
      coupon: redeemedCopy,
    };
  }
}
