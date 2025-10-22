import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Zap, BookOpen } from 'lucide-react';
import {
  LEVEL_SYSTEM,
  getLevelProgress,
  EXPERIENCE_REWARDS,
  getLevelInfo
} from '../../services/levelService';

interface LevelProgressDetailProps {
  currentLevel: number;
  currentExperience: number;
  servicesCompleted: number;
}

const LevelProgressDetail: React.FC<LevelProgressDetailProps> = ({
  currentLevel,
  currentExperience,
  servicesCompleted
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const progress = getLevelProgress(currentExperience, servicesCompleted);
  const currentLevelInfo = getLevelInfo(currentLevel);
  const nextLevelInfo = getLevelInfo(currentLevel + 1);

  // Calculate services needed to next level
  const nextLevelData = LEVEL_SYSTEM.find(l => l.level === currentLevel + 1);
  const servicesNeeded = nextLevelData
    ? Math.max(0, nextLevelData.servicesRequired - servicesCompleted)
    : 0;

  const isMaxLevel = currentLevel === 7;

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{currentLevelInfo?.badge}</span>
          <div>
            <h3 className="text-xl font-bold">{currentLevelInfo?.title}</h3>
            <p className="text-sm text-slate-400">Level {currentLevel}</p>
          </div>
        </div>
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Show level system explanation"
        >
          <BookOpen size={20} />
        </button>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4 mb-6">
        {/* XP Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" />
              Experience Points
            </label>
            <span className="text-sm text-slate-300">
              {currentExperience} / {nextLevelInfo?.minExperience || 'MAX'} XP
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
              style={{ width: `${Math.min(progress.progressPercentage, 100)}%` }}
            />
          </div>
          {!isMaxLevel && (
            <p className="text-xs text-slate-400 mt-1">
              {progress.experienceToNextLevel} XP needed to level up
            </p>
          )}
          {isMaxLevel && (
            <p className="text-xs text-purple-400 mt-1 font-semibold">
              🌟 You've reached the maximum level!
            </p>
          )}
        </div>

        {/* Services Progress */}
        {!isMaxLevel && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold">Services Completed</label>
              <span className="text-sm text-slate-300">
                {servicesCompleted} / {nextLevelInfo?.servicesRequired || 0}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    (servicesCompleted / (nextLevelInfo?.servicesRequired || 1)) * 100,
                    100
                  )}%`
                }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {servicesNeeded} more service{servicesNeeded !== 1 ? 's' : ''} needed
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 mb-1">Total XP</p>
          <p className="text-lg font-bold text-yellow-400">{currentExperience}</p>
        </div>
        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 mb-1">Services Done</p>
          <p className="text-lg font-bold text-emerald-400">{servicesCompleted}</p>
        </div>
        <div className="bg-slate-700 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 mb-1">Current Level</p>
          <p className="text-lg font-bold text-violet-400">{currentLevel}/7</p>
        </div>
      </div>

      {/* Current Level Perks */}
      <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold mb-3 text-slate-200">✨ Current Level Perks</h4>
        <div className="space-y-2">
          {currentLevelInfo?.perks.slice(0, 3).map(perk => (
            <div key={perk.id} className="flex items-start gap-2">
              <span className="text-lg flex-shrink-0">{perk.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{perk.name}</p>
                <p className="text-xs text-slate-400">{perk.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Level Preview */}
      {nextLevelInfo && (
        <div className="bg-gradient-to-r from-violet-900/50 to-purple-900/50 rounded-lg p-4 mb-6 border border-violet-700/50">
          <h4 className="text-sm font-semibold mb-3 text-violet-200">🎯 Next Level: {nextLevelInfo.title}</h4>
          <div className="space-y-2">
            {nextLevelInfo.perks.slice(0, 3).map(perk => (
              <div key={perk.id} className="flex items-start gap-2 opacity-80">
                <span className="text-lg flex-shrink-0">{perk.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-violet-100">{perk.name}</p>
                  <p className="text-xs text-violet-300">{perk.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanation Section */}
      {showExplanation && (
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <h4 className="text-sm font-semibold mb-3">📚 Level System Explained</h4>

          {/* How to Gain XP */}
          <div className="mb-4 pb-4 border-b border-slate-600">
            <h5 className="text-xs font-semibold text-slate-200 mb-2">⚡ How to Gain Experience:</h5>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• Complete a service: +{EXPERIENCE_REWARDS.SERVICE_COMPLETED} XP</li>
              <li>• Get 5-star rating: +{EXPERIENCE_REWARDS.HIGH_RATING} XP bonus</li>
              <li>• Complete your first service: +{EXPERIENCE_REWARDS.FIRST_SERVICE} XP</li>
              <li>• Services on consecutive days: +{EXPERIENCE_REWARDS.CONSECUTIVE_SERVICES} XP each day</li>
              <li>• Complete 5+ services in a week with 5-star ratings: +{EXPERIENCE_REWARDS.PERFECT_WEEK} XP</li>
            </ul>
          </div>

          {/* Level Requirements */}
          <div className="mb-4 pb-4 border-b border-slate-600">
            <h5 className="text-xs font-semibold text-slate-200 mb-2">🏆 Level Requirements:</h5>
            <div className="grid grid-cols-2 gap-2">
              {LEVEL_SYSTEM.map(level => (
                <div key={level.level} className="text-xs">
                  <span className="text-slate-300">
                    {level.badge} Level {level.level}: {level.minExperience} XP, {level.servicesRequired} services
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Facts */}
          <div>
            <h5 className="text-xs font-semibold text-slate-200 mb-2">💡 Key Facts:</h5>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>✓ Both XP AND services requirements must be met to level up</li>
              <li>✓ Level 5+ users can set custom credit rates</li>
              <li>✓ Higher levels get better credit bonuses (up to 30%)</li>
              <li>✓ Higher levels get better service discounts (up to 25%)</li>
              <li>✓ All perks from previous levels remain unlocked</li>
            </ul>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setShowExplanation(!showExplanation)}
        className="w-full flex items-center justify-center gap-2 mt-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
      >
        {showExplanation ? (
          <>
            <ChevronUp size={16} />
            Hide Details
          </>
        ) : (
          <>
            <ChevronDown size={16} />
            Show Details
          </>
        )}
      </button>
    </div>
  );
};

export default LevelProgressDetail;
