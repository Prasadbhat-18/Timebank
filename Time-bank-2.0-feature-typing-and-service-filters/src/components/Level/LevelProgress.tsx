import React from 'react';
import { LevelProgress, UserLevel } from '../../types';
import { Trophy, Star, Award, TrendingUp, Lock, Unlock } from 'lucide-react';

interface LevelProgressCardProps {
  progress: LevelProgress;
  currentLevelInfo: UserLevel;
}

export const LevelProgressCard: React.FC<LevelProgressCardProps> = ({
  progress,
  currentLevelInfo
}) => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-md border-2 transition-all hover:scale-[1.02]"
      style={{
        background: `linear-gradient(135deg, ${currentLevelInfo.color}20 0%, ${currentLevelInfo.color}10 100%)`,
        borderColor: `${currentLevelInfo.color}60`,
        boxShadow: `0 0 30px ${currentLevelInfo.color}20`
      }}
    >
      {/* Animated Background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${currentLevelInfo.color} 0%, transparent 70%)`
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="text-4xl animate-bounce"
            style={{ filter: 'drop-shadow(0 0 10px currentColor)' }}
          >
            {currentLevelInfo.badge}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-2xl font-bold"
                style={{ color: currentLevelInfo.color }}
              >
                Level {progress.currentLevel}
              </span>
              <Award className="w-5 h-5" style={{ color: currentLevelInfo.color }} />
            </div>
            <p className="text-sm font-semibold text-white/80">
              {currentLevelInfo.title}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {progress.servicesCompleted}
          </div>
          <p className="text-xs text-white/70">Services</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white/90">
            {progress.currentExperience} XP
          </span>
          {progress.nextLevel && (
            <span className="text-sm font-medium text-white/90">
              {progress.nextLevel.minExperience} XP
            </span>
          )}
        </div>
        <div className="relative h-3 bg-black/30 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress.progressPercentage}%`,
              background: `linear-gradient(90deg, ${currentLevelInfo.color} 0%, ${currentLevelInfo.color}cc 100%)`,
              boxShadow: `0 0 10px ${currentLevelInfo.color}`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
          </div>
        </div>
        {progress.nextLevel && (
          <p className="text-xs text-white/70 mt-2 text-center">
            {progress.experienceToNextLevel} XP to {progress.nextLevel.title}
          </p>
        )}
      </div>

      {/* Current Perks */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-yellow-400" />
          <h4 className="text-sm font-bold text-white">Active Perks</h4>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {currentLevelInfo.perks.slice(0, 4).map((perk, idx) => (
            <div
              key={perk.id}
              className="flex items-center gap-2 p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <span className="text-lg">{perk.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {perk.name}
                </p>
                {perk.value && (
                  <p className="text-xs text-white/70">
                    {perk.type === 'credits' || perk.type === 'discount'
                      ? `+${perk.value}%`
                      : perk.value}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Level Preview */}
      {progress.nextLevel && (
        <div className="relative z-10 mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">Next Level</h4>
          </div>
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{progress.nextLevel.badge}</span>
              <div>
                <p className="text-sm font-bold text-white">
                  {progress.nextLevel.title}
                </p>
                <p className="text-xs text-white/70">
                  {progress.nextLevel.servicesRequired} services required
                </p>
              </div>
            </div>
            <Lock className="w-5 h-5 text-white/50" />
          </div>
        </div>
      )}
    </div>
  );
};

interface LevelPerkListProps {
  perks: LevelProgress['unlockedPerks'];
}

export const LevelPerkList: React.FC<LevelPerkListProps> = ({ perks }) => {
  const [showAll, setShowAll] = React.useState(false);
  const displayLimit = 6;
  const hasMore = perks.length > displayLimit;
  const displayedPerks = showAll ? perks : perks.slice(0, displayLimit);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-bold text-white">All Unlocked Perks</h3>
        <span className="ml-auto text-sm text-white/70">{perks.length} perks</span>
      </div>

      <div className="grid gap-3">
        {displayedPerks.map((perk, idx) => (
          <div
            key={`${perk.id}-${idx}`}
            className="group relative overflow-hidden p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/20 backdrop-blur-sm hover:border-cyan-400/50 transition-all hover:scale-[1.02]"
            style={{
              boxShadow: '0 0 20px rgba(34, 211, 238, 0.1)'
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center border border-cyan-400/30 flex-shrink-0">
                <span className="text-xl">{perk.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-white">{perk.name}</h4>
                  <Unlock className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-sm text-white/70">{perk.description}</p>
                {perk.value && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/20 rounded-full border border-cyan-400/30">
                    <Star className="w-3 h-3 text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-300">
                      {perk.type === 'credits' || perk.type === 'discount'
                        ? `+${perk.value}%`
                        : perk.value}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* View More/Less Button */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border-2 border-cyan-400/40 hover:border-cyan-400/60 rounded-xl transition-all flex items-center justify-center gap-2 text-white font-semibold"
          style={{
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)'
          }}
        >
          <span>{showAll ? 'View Less' : `View More (${perks.length - displayLimit} more)`}</span>
          <TrendingUp className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
};

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  size = 'md',
  showTitle = false
}) => {
  const levelInfo = React.useMemo(() => {
    const levels = [
      { level: 1, title: 'Time Novice', badge: '🌱', color: '#86efac' },
      { level: 2, title: 'Time Apprentice', badge: '⭐', color: '#7dd3fc' },
      { level: 3, title: 'Time Professional', badge: '💫', color: '#a78bfa' },
      { level: 4, title: 'Time Expert', badge: '🌟', color: '#fbbf24' },
      { level: 5, title: 'Time Master', badge: '🏆', color: '#f59e0b' },
      { level: 6, title: 'Time Legend', badge: '👑', color: '#ec4899' },
      { level: 7, title: 'Time Immortal', badge: '✨', color: '#8b5cf6' }
    ];
    return levels.find(l => l.level === level) || levels[0];
  }, [level]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-base',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl'
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center border-2 animate-pulse relative overflow-hidden`}
        style={{
          borderColor: levelInfo.color,
          background: `linear-gradient(135deg, ${levelInfo.color}30 0%, ${levelInfo.color}10 100%)`,
          boxShadow: `0 0 20px ${levelInfo.color}40`
        }}
      >
        <span style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}>
          {levelInfo.badge}
        </span>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${levelInfo.color} 0%, transparent 70%)`
          }}
        />
      </div>
      {showTitle && (
        <div>
          <p className="text-sm font-bold" style={{ color: levelInfo.color }}>
            Level {level}
          </p>
          <p className="text-xs text-white/70">{levelInfo.title}</p>
        </div>
      )}
    </div>
  );
};
