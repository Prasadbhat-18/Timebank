import React, { useState } from 'react';
import { Trophy, Star, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getLevelProgress, getLevelInfo } from '../../services/levelService';
import LevelSystemModal from './LevelSystemModal';

interface LevelWidgetProps {
  onViewProfile?: () => void;
}

export const LevelWidget: React.FC<LevelWidgetProps> = ({ onViewProfile }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (!user) return null;

  const currentExperience = user.experience_points || 0;
  const servicesCompleted = user.services_completed || 0;
  const progress = getLevelProgress(currentExperience, servicesCompleted);
  const levelInfo = getLevelInfo(progress.currentLevel);

  if (!levelInfo) return null;

  return (
    <div
      onClick={onViewProfile}
      className="w-full bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-xl p-4 border-2 transition-all hover:scale-[1.02] cursor-pointer group"
      style={{
        borderColor: `${levelInfo.color}60`,
        boxShadow: `0 0 20px ${levelInfo.color}20`
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center border-2 relative"
          style={{
            borderColor: levelInfo.color,
            background: `linear-gradient(135deg, ${levelInfo.color}30 0%, ${levelInfo.color}10 100%)`,
            boxShadow: `0 0 15px ${levelInfo.color}40`
          }}
        >
          <span className="text-2xl animate-pulse" style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}>
            {levelInfo.badge}
          </span>
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">Level {progress.currentLevel}</span>
            <Star className="w-4 h-4" style={{ color: levelInfo.color }} />
          </div>
          <p className="text-sm font-semibold text-white/80">{levelInfo.title}</p>
        </div>
        <Trophy className="w-5 h-5 text-white/50 group-hover:text-white/80 transition" />
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-white/70">{currentExperience} XP</span>
          {progress.nextLevel && (
            <span className="text-xs text-white/70">{progress.nextLevel.minExperience} XP</span>
          )}
        </div>
        <div className="relative h-2 bg-black/30 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{
              width: `${progress.progressPercentage}%`,
              background: `linear-gradient(90deg, ${levelInfo.color} 0%, ${levelInfo.color}cc 100%)`,
              boxShadow: `0 0 10px ${levelInfo.color}`
            }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-white">{servicesCompleted}</div>
          <div className="text-xs text-white/60">Services</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2 text-center">
          <div className="text-lg font-bold" style={{ color: levelInfo.color }}>
            {progress.unlockedPerks.length}
          </div>
          <div className="text-xs text-white/60">Perks</div>
        </div>
      </div>

      {/* Next Level Teaser */}
      {progress.nextLevel && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-white/70">
          <TrendingUp className="w-3 h-3" />
          <span>
            {progress.experienceToNextLevel} XP to {progress.nextLevel.title}
          </span>
        </div>
      )}

      {/* Level 5 Badge */}
      {progress.currentLevel >= 5 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 font-bold">Custom Pricing Unlocked!</span>
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-white/50 text-center group-hover:text-white/70 transition">
        Click to view full progress →
      </div>

      {/* Help Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        className="mt-3 w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold text-white/80 hover:text-white transition-all flex items-center justify-center gap-2"
      >
        <Zap size={14} />
        Learn Level System
      </button>

      <LevelSystemModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};
