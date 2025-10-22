import React from 'react';
import { X, AlertCircle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface ServiceBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicesCompleted: number;
  servicesRequested: number;
  canRequest: boolean;
}

const ServiceBalanceModal: React.FC<ServiceBalanceModalProps> = ({
  isOpen,
  onClose,
  servicesCompleted,
  servicesRequested,
  canRequest
}) => {
  const maxAllowed = servicesCompleted * 3;
  const servicesUntilRequired = maxAllowed - servicesRequested;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div
          className={`p-6 rounded-t-xl text-white ${
            canRequest
              ? 'bg-gradient-to-r from-emerald-600 to-green-600'
              : 'bg-gradient-to-r from-amber-600 to-orange-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Service Balance</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-white/90">
            {canRequest ? '✨ You can request more services' : '⚠️ You need to provide services'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Status */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-700">Current Ratio</span>
              <span className="text-2xl font-bold text-slate-900">
                {servicesRequested}/{maxAllowed}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all rounded-full ${
                  canRequest ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${(servicesRequested / maxAllowed) * 100}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {servicesCompleted}
              </div>
              <div className="text-sm text-gray-600">Services Provided</div>
              <div className="text-xs text-blue-600 mt-2 font-semibold">
                <TrendingUp size={14} className="inline mr-1" />
                Earned Quota
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {servicesRequested}
              </div>
              <div className="text-sm text-gray-600">Services Requested</div>
              <div className="text-xs text-purple-600 mt-2 font-semibold">
                <TrendingDown size={14} className="inline mr-1" />
                Used Quota
              </div>
            </div>
          </div>

          {/* Status Message */}
          {canRequest ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3">
              <CheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-emerald-900 mb-1">You're Good to Go! ✅</h4>
                <p className="text-sm text-emerald-800">
                  You can request <span className="font-bold">{servicesUntilRequired}</span> more{' '}
                  {servicesUntilRequired === 1 ? 'service' : 'services'} before needing to provide one.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">Limit Reached ⚠️</h4>
                <p className="text-sm text-amber-800">
                  You've reached your service request quota. Please provide a service first to unlock
                  more requests. Complete 1 service to request 3 more.
                </p>
              </div>
            </div>
          )}

          {/* How It Works */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">How It Works</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex gap-2">
                <span className="text-gray-400">•</span>
                <span>For every <span className="font-semibold">1 service you provide</span>, you can request up to <span className="font-semibold">3 services</span></span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400">•</span>
                <span>This maintains balance and encourages community participation</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-400">•</span>
                <span>Once you provide more services, your request quota increases</span>
              </div>
            </div>
          </div>

          {/* Action */}
          {!canRequest && (
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-900 mb-3">
                Ready to provide a service? Create one now to expand your request quota!
              </p>
              <a
                href="/services"
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Create Service
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceBalanceModal;
