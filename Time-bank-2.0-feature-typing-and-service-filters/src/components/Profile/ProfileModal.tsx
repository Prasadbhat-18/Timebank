import React, { useEffect, useState } from 'react';
import { dataService } from '../../services/dataService';
import { User } from '../../types';
import { User as UserIcon, Mail, Phone, MapPin } from 'lucide-react';
// Chat is launched from Booking flow only

interface ProfileModalProps {
  userId?: string;
  userObj?: Partial<User>;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ userId, userObj, onClose }) => {
  const [profile, setProfile] = useState<User | null>(userObj ? (userObj as User) : null);
  const [loading, setLoading] = useState(false);
  // Removed inline chat opener to reduce duplicates

  useEffect(() => {
    const load = async () => {
      if (!profile && userId) {
        setLoading(true);
        try {
          const u = await dataService.getUserById(userId);
          if (u) setProfile(u);
          else if (userObj) setProfile(userObj as User);
        } catch (err) {
          if (userObj) setProfile(userObj as User);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [userId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold">Profile</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        {loading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : !profile ? (
          <div className="py-8 text-center">Profile not found</div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-gray-400" />}
              </div>
              <div>
                <div className="text-lg font-semibold">{profile.username}</div>
                <div className="text-sm text-gray-600">{profile.bio}</div>
                <div className="text-xs text-gray-500 mt-1">Reputation: {profile.reputation_score?.toFixed(1) ?? '0.0'}</div>
              </div>
            </div>

            {/* Chat entry removed here; use Booking flow*/}

            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-700"><Mail className="w-4 h-4 text-gray-400" />{profile.email || 'No email'}</div>
              <div className="flex items-center gap-2 text-sm text-gray-700"><Phone className="w-4 h-4 text-gray-400" />{profile.phone || 'No phone'}</div>
              <div className="flex items-center gap-2 text-sm text-gray-700"><MapPin className="w-4 h-4 text-gray-400" />{profile.location || 'No location'}</div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-800">Skills</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">{s}</span>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No skills listed</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* No chat modal here */}
    </div>
  );
};
