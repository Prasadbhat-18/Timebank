import { UserLevel, LevelPerk, LevelProgress } from '../types';

// Define all levels and their requirements
export const LEVEL_SYSTEM: UserLevel[] = [
  {
    level: 1,
    title: 'Time Novice',
    minExperience: 0,
    maxExperience: 100,
    servicesRequired: 0,
    badge: '🌱',
    color: '#86efac', // green-300
    perks: [
      {
        id: 'l1_p1',
        name: 'Welcome Bonus',
        description: '10 free time credits to get started',
        icon: '🎁',
        type: 'credits',
        value: 10
      },
      {
        id: 'l1_p2',
        name: 'Basic Profile',
        description: 'Access to basic profile features',
        icon: '👤',
        type: 'visibility'
      }
    ]
  },
  {
    level: 2,
    title: 'Time Apprentice',
    minExperience: 100,
    maxExperience: 300,
    servicesRequired: 3,
    badge: '⭐',
    color: '#7dd3fc', // sky-300
    perks: [
      {
        id: 'l2_p1',
        name: 'Enhanced Visibility',
        description: '+20% visibility in search results',
        icon: '👁️',
        type: 'visibility',
        value: 20
      },
      {
        id: 'l2_p2',
        name: 'Profile Badge',
        description: 'Display "Apprentice" badge on profile',
        icon: '🏅',
        type: 'badge'
      },
      {
        id: 'l2_p3',
        name: 'Bonus Credits',
        description: '+5% bonus on services completed',
        icon: '💰',
        type: 'credits',
        value: 5
      }
    ]
  },
  {
    level: 3,
    title: 'Time Professional',
    minExperience: 300,
    maxExperience: 600,
    servicesRequired: 8,
    badge: '💫',
    color: '#a78bfa', // violet-400
    perks: [
      {
        id: 'l3_p1',
        name: 'Priority Listing',
        description: 'Services appear higher in search',
        icon: '🔝',
        type: 'priority'
      },
      {
        id: 'l3_p2',
        name: 'Enhanced Profile',
        description: 'Unlock additional profile customization',
        icon: '✨',
        type: 'visibility'
      },
      {
        id: 'l3_p3',
        name: 'Bonus Credits',
        description: '+10% bonus on services completed',
        icon: '💎',
        type: 'credits',
        value: 10
      },
      {
        id: 'l3_p4',
        name: 'Service Discount',
        description: '5% discount when requesting services',
        icon: '🎫',
        type: 'discount',
        value: 5
      }
    ]
  },
  {
    level: 4,
    title: 'Time Expert',
    minExperience: 600,
    maxExperience: 1000,
    servicesRequired: 15,
    badge: '🌟',
    color: '#fbbf24', // amber-400
    perks: [
      {
        id: 'l4_p1',
        name: 'Expert Badge',
        description: 'Display prestigious "Expert" badge',
        icon: '👑',
        type: 'badge'
      },
      {
        id: 'l4_p2',
        name: 'Priority Support',
        description: 'Get priority customer support',
        icon: '🚀',
        type: 'priority'
      },
      {
        id: 'l4_p3',
        name: 'Bonus Credits',
        description: '+15% bonus on services completed',
        icon: '💰',
        type: 'credits',
        value: 15
      },
      {
        id: 'l4_p4',
        name: 'Service Discount',
        description: '10% discount when requesting services',
        icon: '🎟️',
        type: 'discount',
        value: 10
      },
      {
        id: 'l4_p5',
        name: 'Featured Profile',
        description: 'Profile featured in homepage rotation',
        icon: '⭐',
        type: 'visibility'
      }
    ]
  },
  {
    level: 5,
    title: 'Time Master',
    minExperience: 1000,
    maxExperience: 2000,
    servicesRequired: 25,
    badge: '🏆',
    color: '#f59e0b', // amber-500
    perks: [
      {
        id: 'l5_p1',
        name: 'Custom Pricing',
        description: 'Set your own credit rates (unlocked!)',
        icon: '💵',
        type: 'custom_pricing'
      },
      {
        id: 'l5_p2',
        name: 'Master Badge',
        description: 'Display exclusive "Master" badge',
        icon: '🎖️',
        type: 'badge'
      },
      {
        id: 'l5_p3',
        name: 'Bonus Credits',
        description: '+20% bonus on services completed',
        icon: '💎',
        type: 'credits',
        value: 20
      },
      {
        id: 'l5_p4',
        name: 'Service Discount',
        description: '15% discount when requesting services',
        icon: '🎁',
        type: 'discount',
        value: 15
      },
      {
        id: 'l5_p5',
        name: 'Premium Visibility',
        description: 'Maximum visibility in all searches',
        icon: '🌟',
        type: 'visibility',
        value: 100
      }
    ]
  },
  {
    level: 6,
    title: 'Time Legend',
    minExperience: 2000,
    maxExperience: 5000,
    servicesRequired: 40,
    badge: '👑',
    color: '#ec4899', // pink-500
    perks: [
      {
        id: 'l6_p1',
        name: 'Legend Status',
        description: 'Display legendary badge & profile border',
        icon: '💫',
        type: 'badge'
      },
      {
        id: 'l6_p2',
        name: 'Bonus Credits',
        description: '+25% bonus on services completed',
        icon: '💰',
        type: 'credits',
        value: 25
      },
      {
        id: 'l6_p3',
        name: 'Service Discount',
        description: '20% discount when requesting services',
        icon: '🎊',
        type: 'discount',
        value: 20
      },
      {
        id: 'l6_p4',
        name: 'VIP Features',
        description: 'Access to exclusive VIP features',
        icon: '🎯',
        type: 'priority'
      },
      {
        id: 'l6_p5',
        name: 'Custom Badge',
        description: 'Create your own custom profile badge',
        icon: '🎨',
        type: 'badge'
      }
    ]
  },
  {
    level: 7,
    title: 'Time Immortal',
    minExperience: 5000,
    maxExperience: Infinity,
    servicesRequired: 75,
    badge: '✨',
    color: '#8b5cf6', // violet-500
    perks: [
      {
        id: 'l7_p1',
        name: 'Immortal Status',
        description: 'Ultimate prestige and recognition',
        icon: '🌌',
        type: 'badge'
      },
      {
        id: 'l7_p2',
        name: 'Maximum Bonus',
        description: '+30% bonus on services completed',
        icon: '💎',
        type: 'credits',
        value: 30
      },
      {
        id: 'l7_p3',
        name: 'Maximum Discount',
        description: '25% discount when requesting services',
        icon: '🎁',
        type: 'discount',
        value: 25
      },
      {
        id: 'l7_p4',
        name: 'Hall of Fame',
        description: 'Permanent spot in Hall of Fame',
        icon: '🏛️',
        type: 'visibility'
      },
      {
        id: 'l7_p5',
        name: 'Mentor Status',
        description: 'Mentor new users and earn extra credits',
        icon: '🎓',
        type: 'credits',
        value: 50
      },
      {
        id: 'l7_p6',
        name: 'Exclusive Avatar',
        description: 'Unlock exclusive animated avatar borders',
        icon: '🖼️',
        type: 'badge'
      }
    ]
  }
];

// Experience points awarded for different actions
export const EXPERIENCE_REWARDS = {
  SERVICE_COMPLETED: 50,
  HIGH_RATING: 20, // Bonus for 5-star rating
  FIRST_SERVICE: 30,
  CONSECUTIVE_SERVICES: 10, // Bonus for completing services on consecutive days
  PERFECT_WEEK: 100 // Bonus for completing 5+ services in a week with 5-star ratings
};

/**
 * Get level information for a specific level number
 */
export function getLevelInfo(level: number): UserLevel | undefined {
  return LEVEL_SYSTEM.find(l => l.level === level);
}

/**
 * Calculate level based on experience points
 */
export function calculateLevel(experience: number): number {
  for (let i = LEVEL_SYSTEM.length - 1; i >= 0; i--) {
    if (experience >= LEVEL_SYSTEM[i].minExperience) {
      return LEVEL_SYSTEM[i].level;
    }
  }
  return 1;
}

/**
 * Get progress information for a user
 */
export function getLevelProgress(
  currentExperience: number,
  servicesCompleted: number
): LevelProgress {
  const currentLevel = calculateLevel(currentExperience);
  const currentLevelInfo = getLevelInfo(currentLevel);
  const nextLevelInfo = getLevelInfo(currentLevel + 1);

  if (!currentLevelInfo) {
    throw new Error('Invalid level');
  }

  const experienceToNextLevel = nextLevelInfo
    ? nextLevelInfo.minExperience - currentExperience
    : 0;

  const experienceInCurrentLevel = currentExperience - currentLevelInfo.minExperience;
  const experienceNeededForLevel = nextLevelInfo
    ? nextLevelInfo.minExperience - currentLevelInfo.minExperience
    : 1;

  const progressPercentage = nextLevelInfo
    ? (experienceInCurrentLevel / experienceNeededForLevel) * 100
    : 100;

  // Collect all perks from current and previous levels
  const unlockedPerks: LevelPerk[] = [];
  for (let i = 1; i <= currentLevel; i++) {
    const levelInfo = getLevelInfo(i);
    if (levelInfo) {
      unlockedPerks.push(...levelInfo.perks);
    }
  }

  return {
    currentLevel,
    currentExperience,
    experienceToNextLevel,
    progressPercentage: Math.min(progressPercentage, 100),
    servicesCompleted,
    nextLevel: nextLevelInfo,
    unlockedPerks
  };
}

/**
 * Calculate experience reward for completing a service
 */
export function calculateServiceExperience(
  rating: number,
  isFirstService: boolean,
  consecutiveDays: number
): number {
  let experience = EXPERIENCE_REWARDS.SERVICE_COMPLETED;

  // Bonus for high rating
  if (rating === 5) {
    experience += EXPERIENCE_REWARDS.HIGH_RATING;
  }

  // Bonus for first service
  if (isFirstService) {
    experience += EXPERIENCE_REWARDS.FIRST_SERVICE;
  }

  // Bonus for consecutive services
  if (consecutiveDays > 1) {
    experience += EXPERIENCE_REWARDS.CONSECUTIVE_SERVICES * (consecutiveDays - 1);
  }

  return experience;
}

/**
 * Check if user can use custom pricing (Level 5+)
 */
export function canUseCustomPricing(level: number): boolean {
  return level >= 5;
}

/**
 * Get credit bonus percentage for a level
 */
export function getCreditBonus(level: number): number {
  const levelInfo = getLevelInfo(level);
  if (!levelInfo) return 0;

  const creditPerk = levelInfo.perks.find(p => p.type === 'credits' && p.name.includes('Bonus'));
  return creditPerk?.value ? Number(creditPerk.value) : 0;
}

/**
 * Get discount percentage for a level
 */
export function getDiscountPercentage(level: number): number {
  const levelInfo = getLevelInfo(level);
  if (!levelInfo) return 0;

  const discountPerk = levelInfo.perks.find(p => p.type === 'discount');
  return discountPerk?.value ? Number(discountPerk.value) : 0;
}

/**
 * One-time credits granted when a user levels up.
 * This replaces per-service bonus credits so providers only get pre-agreed
 * credits on each service, and receive a small bonus on level up instead.
 */
export function getLevelUpBonusCredits(level: number): number {
  switch (level) {
    case 2: return 1;   // small nudge for early progression
    case 3: return 2;
    case 4: return 3;
    case 5: return 5;   // milestone: custom pricing
    case 6: return 7;
    case 7: return 10;  // pinnacle reward
    default: return 0;  // no bonus at level 1 or beyond defined caps
  }
}

/**
 * Apply level bonuses to credit amount
 */
export function applyLevelBonus(baseCredits: number, level: number): number {
  const bonusPercentage = getCreditBonus(level);
  return Math.round(baseCredits * (1 + bonusPercentage / 100));
}

/**
 * Apply level discount to credit cost
 */
export function applyLevelDiscount(baseCredits: number, level: number): number {
  const discountPercentage = getDiscountPercentage(level);
  return Math.round(baseCredits * (1 - discountPercentage / 100));
}

/**
 * Get all unlocked perks for a user
 */
export function getUnlockedPerks(level: number): LevelPerk[] {
  const perks: LevelPerk[] = [];
  for (let i = 1; i <= level; i++) {
    const levelInfo = getLevelInfo(i);
    if (levelInfo) {
      perks.push(...levelInfo.perks);
    }
  }
  return perks;
}

/**
 * Service Balance System: Users must maintain a 3:1 ratio
 * They can request up to 3 services, but must provide 1 service
 * Example: If they've completed 2 services, they can request up to 6
 */
export interface ServiceBalance {
  servicesCompleted: number;
  servicesRequested: number;
  maxServicesAllowed: number;
  canRequestMore: boolean;
  servicesUntilRequired: number;
  ratio: string;
}

/**
 * Calculate service balance for a user
 * Rule: servicesRequested <= (servicesCompleted * 3)
 * Meaning: For every 1 service provided, user can request up to 3
 */
export function calculateServiceBalance(
  servicesCompleted: number,
  servicesRequested: number
): ServiceBalance {
  const maxServicesAllowed = servicesCompleted * 3;
  const canRequestMore = servicesRequested < maxServicesAllowed;
  const servicesUntilRequired = maxServicesAllowed - servicesRequested;

  return {
    servicesCompleted,
    servicesRequested,
    maxServicesAllowed,
    canRequestMore,
    servicesUntilRequired,
    ratio: `${servicesRequested}/${maxServicesAllowed}`
  };
}

/**
 * Check if user can request a new service
 */
export function canRequestService(
  servicesCompleted: number,
  servicesRequested: number
): boolean {
  return servicesRequested < servicesCompleted * 3;
}

/**
 * Get service balance message
 */
export function getServiceBalanceMessage(balance: ServiceBalance): string {
  if (balance.canRequestMore) {
    return `You can request ${balance.servicesUntilRequired} more service${balance.servicesUntilRequired !== 1 ? 's' : ''} before needing to provide one.`;
  } else {
    const servicesNeeded = Math.ceil((balance.servicesRequested - balance.maxServicesAllowed) / 3) + 1;
    return `You need to provide ${servicesNeeded} service${servicesNeeded !== 1 ? 's' : ''} to request more. Current ratio: ${balance.servicesRequested} requested / ${balance.servicesCompleted} provided`;
  }
}

