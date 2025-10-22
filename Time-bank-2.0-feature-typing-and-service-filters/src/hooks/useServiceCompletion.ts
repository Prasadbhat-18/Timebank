import { useMemo } from 'react';
import {
  calculateServiceExperience,
  EXPERIENCE_REWARDS,
  getCreditBonus
} from '../services/levelService';

export interface CompletionRewards {
  baseXP: number;
  baseCredits: number;
  bonuses: {
    highRatingBonus: number;
    consecutiveBonus: number;
    perfectWeekBonus: number;
  };
  totalXP: number;
  totalCredits: number;
  effectiveCredits: number;
}

export const useServiceCompletion = (
  rating: number = 5,
  baseCredits: number = 10,
  isFirstService: boolean = false,
  consecutiveDays: number = 1,
  currentUserLevel: number = 1,
  servicesCompletedThisWeek: number = 0,
  ratingThisWeek: number = 5
) => {
  const rewards = useMemo<CompletionRewards>(() => {
    // Calculate base XP
    const baseXP = calculateServiceExperience(
      rating,
      isFirstService,
      consecutiveDays
    );

    // Calculate bonuses
    const highRatingBonus = rating === 5 ? EXPERIENCE_REWARDS.HIGH_RATING : 0;
    const consecutiveBonus =
      consecutiveDays > 1
        ? EXPERIENCE_REWARDS.CONSECUTIVE_SERVICES * (consecutiveDays - 1)
        : 0;

    // Perfect week bonus: 5+ services with 5-star ratings
    const perfectWeekBonus =
      servicesCompletedThisWeek >= 4 && ratingThisWeek >= 5
        ? EXPERIENCE_REWARDS.PERFECT_WEEK
        : 0;

    const totalXP =
      baseXP + highRatingBonus + consecutiveBonus + perfectWeekBonus;

    // Calculate credits with level bonus
    const creditBonus = getCreditBonus(currentUserLevel);
    const bonusMultiplier = 1 + creditBonus / 100;
    const totalCredits = Math.round(baseCredits * bonusMultiplier);
    const effectiveCredits = Math.round(baseCredits * creditBonus / 100);

    return {
      baseXP,
      baseCredits,
      bonuses: {
        highRatingBonus,
        consecutiveBonus,
        perfectWeekBonus
      },
      totalXP,
      totalCredits,
      effectiveCredits
    };
  }, [
    rating,
    baseCredits,
    isFirstService,
    consecutiveDays,
    currentUserLevel,
    servicesCompletedThisWeek,
    ratingThisWeek
  ]);

  return rewards;
};

// Pure, non-hook version for use in event handlers
export function computeServiceCompletion(
  rating: number = 5,
  baseCredits: number = 10,
  isFirstService: boolean = false,
  consecutiveDays: number = 1,
  currentUserLevel: number = 1,
  servicesCompletedThisWeek: number = 0,
  ratingThisWeek: number = 5
): CompletionRewards {
  const baseXP = calculateServiceExperience(rating, isFirstService, consecutiveDays);
  const highRatingBonus = rating === 5 ? EXPERIENCE_REWARDS.HIGH_RATING : 0;
  const consecutiveBonus = consecutiveDays > 1 ? EXPERIENCE_REWARDS.CONSECUTIVE_SERVICES * (consecutiveDays - 1) : 0;
  const perfectWeekBonus = servicesCompletedThisWeek >= 4 && ratingThisWeek >= 5 ? EXPERIENCE_REWARDS.PERFECT_WEEK : 0;
  const totalXP = baseXP + highRatingBonus + consecutiveBonus + perfectWeekBonus;
  const creditBonus = getCreditBonus(currentUserLevel);
  const bonusMultiplier = 1 + creditBonus / 100;
  const totalCredits = Math.round(baseCredits * bonusMultiplier);
  const effectiveCredits = Math.round((baseCredits * creditBonus) / 100);
  return {
    baseXP,
    baseCredits,
    bonuses: { highRatingBonus, consecutiveBonus, perfectWeekBonus },
    totalXP,
    totalCredits,
    effectiveCredits,
  };
}

/**
 * Format reward display
 */
export const formatReward = (amount: number, type: 'xp' | 'credits' = 'xp'): string => {
  const icon = type === 'xp' ? '⚡' : '💰';
  return `${icon} +${amount}`;
};

/**
 * Get reward message based on achievements
 */
export const getRewardMessage = (rewards: CompletionRewards): string => {
  const parts: string[] = [];

  if (rewards.bonuses.highRatingBonus > 0) {
    parts.push('Perfect 5-star rating! ⭐');
  }

  if (rewards.bonuses.consecutiveBonus > 0) {
    parts.push(`Streak bonus! 🔥`);
  }

  if (rewards.bonuses.perfectWeekBonus > 0) {
    parts.push('Perfect week bonus! 🏆');
  }

  return parts.length > 0 ? parts.join(' • ') : 'Great job! 👍';
};
