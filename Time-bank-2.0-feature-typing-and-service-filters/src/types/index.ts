export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary?: boolean;
}

export interface User {
  id: string;
  email: string;
  username: string;
  bio: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  skills?: string[];
  emergency_contacts?: EmergencyContact[];
  reputation_score: number;
  total_reviews: number;
  created_at: string;
  // Level system fields
  level?: number;
  experience_points?: number;
  services_completed?: number;
  services_requested?: number; // Track service requests for 3:1 balance
  custom_credits_enabled?: boolean; // Unlocked at level 5
}

export interface TimeCredit {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  skill?: Skill;
  type: 'offered' | 'needed';
  proficiency_level: 'beginner' | 'intermediate' | 'expert';
}

export interface Service {
  id: string;
  provider_id: string;
  provider?: User;
  skill_id: string;
  skill?: Skill;
  title: string;
  description: string;
  credits_per_hour: number;
  status: 'active' | 'inactive' | 'completed';
  type: 'offer' | 'request';
  created_at: string;
  imageUrls?: string[];
}

export interface Booking {
  id: string;
  service_id: string;
  service?: Service;
  provider_id: string;
  provider?: User;
  requester_id: string;
  requester?: User;
  scheduled_start: string;
  scheduled_end: string;
  duration_hours: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  confirmation_status: 'pending' | 'awaiting_provider' | 'provider_confirmed' | 'both_confirmed' | 'confirmed' | 'declined';
  credits_held?: number; // Credits reserved but not yet transferred
  credits_transferred?: boolean; // Whether credits have been moved
  provider_notes?: string; // Notes from provider when confirming/declining
  confirmed_at?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  from_user_id?: string;
  from_user?: User;
  to_user_id?: string;
  to_user?: User;
  booking_id?: string;
  amount: number;
  transaction_type: 'service_completed' | 'signup_bonus' | 'adjustment';
  description: string;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewer?: User;
  reviewee_id: string;
  reviewee?: User;
  rating: number;
  comment: string;
  created_at: string;
}

// E2EE Chat types
export interface Chat {
  id: string;
  participants: string[]; // exactly two user IDs
  participantsPublicKeys?: Record<string, JsonWebKey>; // userId -> public JWK (ECDH)
  service_id?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string; // user id (or 'ai-mediator')
  // Encrypted payload (AES-GCM)
  ciphertext: string; // base64
  iv: string; // base64
  created_at: string;
  type?: 'text' | 'system';
}

// Level System Types
export interface UserLevel {
  level: number;
  title: string;
  minExperience: number;
  maxExperience: number;
  servicesRequired: number;
  perks: LevelPerk[];
  badge: string;
  color: string;
}

export interface LevelPerk {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'visibility' | 'credits' | 'custom_pricing' | 'priority' | 'badge' | 'discount';
  value?: number | string;
}

export interface LevelProgress {
  currentLevel: number;
  currentExperience: number;
  experienceToNextLevel: number;
  progressPercentage: number;
  servicesCompleted: number;
  nextLevel?: UserLevel;
  unlockedPerks: LevelPerk[];
}