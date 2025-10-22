import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Wallet, TrendingUp, TrendingDown, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { TimeCredit, Transaction } from '../../types';
import { dataService } from '../../services/dataService';

export const WalletView: React.FC = () => {
  const { user } = useAuth();
  const [timeCredit, setTimeCredit] = useState<TimeCredit | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    if (user) {
      const credit = await dataService.getTimeCredits(user.id);
      const txns = await dataService.getTransactions(user.id);
      setTimeCredit(credit);
      setTransactions(txns);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!timeCredit) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <Clock className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-1">Current Balance</h3>
          <p className="text-4xl font-bold">{timeCredit.balance.toFixed(1)}</p>
          <p className="text-sm opacity-75 mt-1">time credits</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Earned</h3>
          <p className="text-3xl font-bold text-gray-800">{timeCredit.total_earned.toFixed(1)}</p>
          <p className="text-sm text-gray-500 mt-1">time credits</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Spent</h3>
          <p className="text-3xl font-bold text-gray-800">{timeCredit.total_spent.toFixed(1)}</p>
          <p className="text-sm text-gray-500 mt-1">time credits</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {transactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No transactions yet</p>
            </div>
          ) : (
            transactions.map((txn) => {
              const isIncoming = txn.to_user_id === user?.id;
              const isOutgoing = txn.from_user_id === user?.id;

              return (
                <div key={txn.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isIncoming ? 'bg-emerald-50' : isOutgoing ? 'bg-blue-50' : 'bg-gray-50'
                        }`}
                      >
                        {isIncoming ? (
                          <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                        ) : isOutgoing ? (
                          <ArrowUpRight className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-600" />
                        )}
                      </div>

                      <div>
                        <p className="font-medium text-gray-800">{txn.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(txn.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {txn.from_user && (
                          <p className="text-xs text-gray-500">From: {txn.from_user.username}</p>
                        )}
                        {txn.to_user && isOutgoing && (
                          <p className="text-xs text-gray-500">To: {txn.to_user.username}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          isIncoming ? 'text-emerald-600' : isOutgoing ? 'text-blue-600' : 'text-gray-600'
                        }`}
                      >
                        {isIncoming ? '+' : isOutgoing ? '-' : ''}
                        {txn.amount.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500">credits</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
        <h3 className="font-semibold text-gray-800 mb-3">How Time Credits Work</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• 1 time credit = 1 hour of service</p>
          <p>• Earn credits by providing services to others</p>
          <p>• Spend credits to receive services from the community</p>
          <p>• New members receive 10 free credits to get started</p>
          <p>• Your balance must stay positive to request services</p>
        </div>
      </div>
    </div>
  );
};