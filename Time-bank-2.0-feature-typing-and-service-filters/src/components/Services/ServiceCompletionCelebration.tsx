import React, { useEffect, useState } from 'react';
import { Award, Star, Zap, Trophy, Gift } from 'lucide-react';

interface ServiceCompletionCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  xpEarned: number;
  creditsEarned: number;
  newLevel?: number;
  previousLevel?: number;
  totalServicesCompleted?: number;
  rating?: number;
  bonusInfo?: {
    highRatingBonus?: number;
    consecutiveBonus?: number;
    perfectWeekBonus?: number;
  };
}

interface FloatingParticle {
  id: number;
  type: 'xp' | 'credit' | 'star' | 'spark';
  x: number;
  y: number;
  duration: number;
}

const ServiceCompletionCelebration: React.FC<ServiceCompletionCelebrationProps> = ({
  isOpen,
  onClose,
  xpEarned,
  creditsEarned,
  newLevel,
  previousLevel,
  totalServicesCompleted = 0,
  rating = 5,
  bonusInfo = {}
}) => {
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [showContent, setShowContent] = useState(false);
  const [particleId, setParticleId] = useState(0);

  const leveledUp = newLevel && previousLevel && newLevel > previousLevel;

  // Generate floating particles
  useEffect(() => {
    if (!isOpen) {
      setShowContent(false);
      setParticles([]);
      return;
    }

    setShowContent(true);

    // Create initial particles
    const newParticles: FloatingParticle[] = [];
    
    // XP particles
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: particleId + i,
        type: 'xp',
        x: Math.random() * 40 - 20,
        y: Math.random() * 40 - 20,
        duration: 2 + Math.random() * 1
      });
    }

    // Credit particles
    for (let i = 0; i < 6; i++) {
      newParticles.push({
        id: particleId + 8 + i,
        type: 'credit',
        x: Math.random() * 40 - 20,
        y: Math.random() * 40 - 20,
        duration: 2 + Math.random() * 1
      });
    }

    // Star particles for rating
    if (rating === 5) {
      for (let i = 0; i < 10; i++) {
        newParticles.push({
          id: particleId + 14 + i,
          type: 'star',
          x: Math.random() * 60 - 30,
          y: Math.random() * 60 - 30,
          duration: 2.5 + Math.random() * 1
        });
      }
    }

    setParticles(newParticles);
    setParticleId(prev => prev + 30);

    // Auto-generate more particles
    const interval = setInterval(() => {
      setParticles(prev => {
        const filtered = prev.filter(p => p.duration > 0);
        if (filtered.length < 5) {
          return [
            ...filtered,
            {
              id: Math.random(),
              type: Math.random() > 0.6 ? 'spark' : 'star',
              x: Math.random() * 80 - 40,
              y: Math.random() * 80 - 40,
              duration: 2
            }
          ];
        }
        return filtered;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const totalBonus = (bonusInfo.highRatingBonus || 0) + 
                     (bonusInfo.consecutiveBonus || 0) + 
                     (bonusInfo.perfectWeekBonus || 0);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Animated Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto cursor-pointer"
        onClick={onClose}
        style={{
          animation: showContent ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-out'
        }}
      />

      {/* Main Celebration Container */}
      <div
        className="relative w-96 max-w-[90vw] pointer-events-auto"
        style={{
          animation: showContent ? 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'scaleOut 0.3s ease-in'
        }}
      >
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {particles.map(particle => {
            const icons: Record<string, string> = {
              xp: '⚡',
              credit: '💰',
              star: '⭐',
              spark: '✨'
            };

            return (
              <div
                key={particle.id}
                className="absolute text-2xl pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                  animation: `floatUp ${particle.duration}s ease-out forwards`,
                  transform: `translate(calc(-50% + ${particle.x}px), calc(-50% + ${particle.y}px))`,
                  opacity: 0.8
                }}
              >
                {icons[particle.type]}
              </div>
            );
          })}
        </div>

        {/* Main Content Card */}
        <div className="relative bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 rounded-2xl p-8 shadow-2xl border-2 border-purple-500/50 overflow-hidden">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-purple-600/10 pointer-events-none" />

          {/* Header with Trophy */}
          <div className="relative text-center mb-6">
            <div className="flex justify-center mb-4">
              <div
                className="text-6xl animate-bounce"
                style={{
                  animationDuration: '0.6s',
                  filter: 'drop-shadow(0 0 20px rgba(234, 179, 8, 0.6))'
                }}
              >
                🎉
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Service Completed!</h2>
            <p className="text-purple-200 text-sm">Amazing work! Here's what you earned...</p>
          </div>

          {/* XP and Credits Display */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* XP Card */}
            <div
              className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl p-4 text-center transform hover:scale-105 transition-transform"
              style={{
                animation: 'slideInLeft 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s backwards'
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap size={20} className="text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-200">XP Earned</span>
              </div>
              <div className="text-3xl font-bold text-yellow-300">+{xpEarned}</div>
              <div className="text-xs text-yellow-200/70 mt-1">Experience Points</div>
            </div>

            {/* Credits Card */}
            <div
              className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/50 rounded-xl p-4 text-center transform hover:scale-105 transition-transform"
              style={{
                animation: 'slideInRight 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s backwards'
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift size={20} className="text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-200">Credits</span>
              </div>
              <div className="text-3xl font-bold text-emerald-300">+{creditsEarned}</div>
              <div className="text-xs text-emerald-200/70 mt-1">Time Credits</div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 mb-6 text-center text-sm">
            <div
              className="bg-slate-700/50 rounded-lg p-2"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.2s backwards' }}
            >
              <div className="text-yellow-400 font-bold text-lg">{totalServicesCompleted}</div>
              <div className="text-slate-300 text-xs">Services Done</div>
            </div>
            {rating && (
              <div
                className="bg-slate-700/50 rounded-lg p-2"
                style={{ animation: 'fadeInUp 0.6s ease-out 0.3s backwards' }}
              >
                <div className="text-purple-400 font-bold text-lg flex items-center justify-center gap-1">
                  <Star size={16} fill="currentColor" />{rating}
                </div>
                <div className="text-slate-300 text-xs">Rating</div>
              </div>
            )}
            {totalBonus > 0 && (
              <div
                className="bg-slate-700/50 rounded-lg p-2"
                style={{ animation: 'fadeInUp 0.6s ease-out 0.4s backwards' }}
              >
                <div className="text-blue-400 font-bold text-lg">+{totalBonus}</div>
                <div className="text-slate-300 text-xs">Bonus XP</div>
              </div>
            )}
          </div>

          {/* Bonus Details */}
          {totalBonus > 0 && (
            <div
              className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 mb-6"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.5s backwards' }}
            >
              <h4 className="text-sm font-semibold text-blue-200 mb-2 flex items-center gap-2">
                <Zap size={16} />
                Bonus Breakdown
              </h4>
              <div className="space-y-1 text-xs text-blue-100">
                {bonusInfo.highRatingBonus && (
                  <div className="flex justify-between">
                    <span>⭐ 5-Star Rating Bonus:</span>
                    <span className="font-bold">+{bonusInfo.highRatingBonus}</span>
                  </div>
                )}
                {bonusInfo.consecutiveBonus && (
                  <div className="flex justify-between">
                    <span>🔥 Consecutive Services Bonus:</span>
                    <span className="font-bold">+{bonusInfo.consecutiveBonus}</span>
                  </div>
                )}
                {bonusInfo.perfectWeekBonus && (
                  <div className="flex justify-between">
                    <span>🏆 Perfect Week Bonus:</span>
                    <span className="font-bold">+{bonusInfo.perfectWeekBonus}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Level Up Message */}
          {leveledUp && (
            <div
              className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500 rounded-lg p-4 mb-6 text-center"
              style={{
                animation: 'pulse 1s ease-in-out infinite, slideInUp 0.6s ease-out 0.6s backwards'
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy size={24} className="text-amber-400 animate-bounce" />
                <span className="text-2xl">🎊</span>
                <Trophy size={24} className="text-amber-400 animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-amber-300 mb-1">LEVEL UP! 🚀</h3>
              <p className="text-amber-100 text-sm">
                Congratulations! You reached <span className="font-bold text-lg">Level {newLevel}</span>
              </p>
              <p className="text-amber-200/70 text-xs mt-2">You unlocked new perks and abilities!</p>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            style={{
              animation: 'slideInUp 0.6s ease-out 0.7s backwards'
            }}
          >
            <Award size={20} />
            Awesome! Let's Continue
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.5) rotateX(-10deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotateX(0);
          }
        }

        @keyframes scaleOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.5);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatUp {
          from {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-100px) scale(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(251, 191, 36, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceCompletionCelebration;
