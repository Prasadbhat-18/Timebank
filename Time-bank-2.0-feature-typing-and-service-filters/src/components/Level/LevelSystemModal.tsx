import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { LEVEL_SYSTEM, EXPERIENCE_REWARDS } from '../../services/levelService';

interface LevelSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LevelSystemModal: React.FC<LevelSystemModalProps> = ({ isOpen, onClose }) => {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-violet-900 to-purple-900 p-6 flex items-center justify-between border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">📚 Level System Guide</h2>
            <p className="text-sm text-violet-200 mt-1">Complete guide to leveling up in Time Bank</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview Section */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h3 className="text-lg font-bold text-white mb-3">⚡ Overview</h3>
            <p className="text-slate-300 text-sm mb-3">
              The Level System rewards you for being an active member of the Time Bank community. As you level up, you unlock exclusive perks, bonuses, and features that enhance your experience.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800 rounded p-3">
                <p className="text-xs text-slate-400 mb-1">Total Levels</p>
                <p className="text-2xl font-bold text-violet-400">7</p>
              </div>
              <div className="bg-slate-800 rounded p-3">
                <p className="text-xs text-slate-400 mb-1">Max Experience</p>
                <p className="text-2xl font-bold text-yellow-400">5000+</p>
              </div>
            </div>
          </div>

          {/* How to Gain XP Section */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h3 className="text-lg font-bold text-white mb-3">🎯 How to Gain Experience</h3>
            <div className="space-y-2">
              <div className="flex gap-3 items-start bg-slate-800 rounded p-3">
                <span className="text-xl flex-shrink-0">🎁</span>
                <div>
                  <p className="font-semibold text-white text-sm">Complete a Service</p>
                  <p className="text-xs text-slate-400">+{EXPERIENCE_REWARDS.SERVICE_COMPLETED} XP</p>
                </div>
              </div>
              <div className="flex gap-3 items-start bg-slate-800 rounded p-3">
                <span className="text-xl flex-shrink-0">⭐</span>
                <div>
                  <p className="font-semibold text-white text-sm">Get 5-Star Rating</p>
                  <p className="text-xs text-slate-400">+{EXPERIENCE_REWARDS.HIGH_RATING} XP bonus</p>
                </div>
              </div>
              <div className="flex gap-3 items-start bg-slate-800 rounded p-3">
                <span className="text-xl flex-shrink-0">🎊</span>
                <div>
                  <p className="font-semibold text-white text-sm">First Service</p>
                  <p className="text-xs text-slate-400">+{EXPERIENCE_REWARDS.FIRST_SERVICE} XP bonus</p>
                </div>
              </div>
              <div className="flex gap-3 items-start bg-slate-800 rounded p-3">
                <span className="text-xl flex-shrink-0">🔥</span>
                <div>
                  <p className="font-semibold text-white text-sm">Consecutive Services</p>
                  <p className="text-xs text-slate-400">+{EXPERIENCE_REWARDS.CONSECUTIVE_SERVICES} XP per day</p>
                </div>
              </div>
              <div className="flex gap-3 items-start bg-slate-800 rounded p-3">
                <span className="text-xl flex-shrink-0">🏆</span>
                <div>
                  <p className="font-semibold text-white text-sm">Perfect Week</p>
                  <p className="text-xs text-slate-400">5+ services with 5-star ratings: +{EXPERIENCE_REWARDS.PERFECT_WEEK} XP</p>
                </div>
              </div>
            </div>
          </div>

          {/* Leveling Requirements Section */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h3 className="text-lg font-bold text-white mb-3">📊 Leveling Requirements</h3>
            <p className="text-sm text-slate-300 mb-3">
              💡 To level up, you need BOTH minimum XP AND minimum services completed
            </p>
            <div className="space-y-1">
              {LEVEL_SYSTEM.map(level => (
                <div key={level.level} className="flex items-center justify-between bg-slate-800 rounded p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{level.badge}</span>
                    <div>
                      <p className="font-semibold text-white text-sm">{level.title}</p>
                      <p className="text-xs text-slate-400">Level {level.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-yellow-400">{level.minExperience} XP</p>
                    <p className="text-xs text-emerald-400">{level.servicesRequired} services</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Level Breakdown */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">🎖️ Level Details & Perks</h3>
            <div className="space-y-2">
              {LEVEL_SYSTEM.map(level => (
                <div key={level.level} className="border border-slate-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedLevel(expandedLevel === level.level ? null : level.level)
                    }
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors bg-slate-700/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{level.badge}</span>
                      <div className="text-left">
                        <p className="font-bold text-white">{level.title}</p>
                        <p className="text-xs text-slate-400">
                          {level.minExperience} XP • {level.servicesRequired} services
                        </p>
                      </div>
                    </div>
                    {expandedLevel === level.level ? (
                      <ChevronUp size={20} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={20} className="text-slate-400" />
                    )}
                  </button>

                  {expandedLevel === level.level && (
                    <div className="bg-slate-800 p-4 border-t border-slate-600 space-y-3">
                      {/* Progression Info */}
                      <div className="bg-slate-700/50 rounded p-3">
                        <p className="text-xs font-semibold text-slate-300 mb-2">Progression:</p>
                        <p className="text-sm text-slate-300">
                          {level.level === 1
                            ? 'Starting level - Welcome to Time Bank!'
                            : `From ${level.minExperience} XP and ${level.servicesRequired} completed services`}
                        </p>
                        {level.level < 7 && (
                          <p className="text-xs text-slate-400 mt-2">
                            Next level requires {
                              LEVEL_SYSTEM.find(l => l.level === level.level + 1)?.minExperience
                            } XP and {
                              LEVEL_SYSTEM.find(l => l.level === level.level + 1)?.servicesRequired
                            } services
                          </p>
                        )}
                        {level.level === 7 && (
                          <p className="text-xs text-purple-400 mt-2 font-semibold">
                            ✨ Maximum level reached!
                          </p>
                        )}
                      </div>

                      {/* Perks */}
                      <div>
                        <p className="text-xs font-semibold text-slate-300 mb-2">Unlocked Perks:</p>
                        <div className="space-y-2">
                          {level.perks.map(perk => (
                            <div
                              key={perk.id}
                              className="flex gap-2 bg-slate-700/50 rounded p-2"
                            >
                              <span className="text-lg flex-shrink-0">{perk.icon}</span>
                              <div className="min-w-0">
                                <p className="font-semibold text-white text-sm">
                                  {perk.name}
                                  {perk.value && (
                                    <span className="text-violet-400 ml-1">
                                      (+{perk.value}%)
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-slate-400">{perk.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Special Notes */}
                      {level.level === 5 && (
                        <div className="bg-amber-900/30 border border-amber-700 rounded p-3">
                          <p className="text-sm font-semibold text-amber-200">
                            🎯 Special: Custom Pricing Unlocked
                          </p>
                          <p className="text-xs text-amber-100 mt-1">
                            Set your own credit rates for services you offer
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-lg p-4 border border-emerald-700 space-y-2">
            <h3 className="text-lg font-bold text-emerald-200">💡 Pro Tips</h3>
            <ul className="text-sm text-emerald-100 space-y-1">
              <li>✓ Maintain high ratings to earn bonus XP faster</li>
              <li>✓ Complete services on consecutive days for bonus streaks</li>
              <li>✓ Level 5+ unlocks custom pricing - set rates strategically</li>
              <li>✓ All perks from previous levels stay unlocked</li>
              <li>✓ Higher levels get better bonuses and discounts</li>
              <li>✓ Reach Level 7 for maximum prestige and rewards</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 bg-slate-900 p-4 flex gap-2 sticky bottom-0">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelSystemModal;
