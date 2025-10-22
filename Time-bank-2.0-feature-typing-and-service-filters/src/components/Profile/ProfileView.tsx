import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Camera, Edit, Save, X, User, Mail, Phone, MapPin, Award, Clock, Shield, Plus, Trash2, PhoneCall, Lock } from 'lucide-react';
import { EmergencyContact } from '../../types';
import { LevelPerkList, LevelBadge } from '../Level/LevelProgress';
import LevelProgressDetail from '../Level/LevelProgressDetail';
import { getLevelProgress } from '../../services/levelService';
import { useGeolocation } from '../../hooks/useGeolocation';

export const ProfileView: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
    const [profilePicture, setProfilePicture] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    location: user?.location || ''
  });
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(
    user?.emergency_contacts || []
  );
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
    isPrimary: false
  });
  // Change password UI state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Geolocation hook
  const { getCurrentLocation } = useGeolocation();
  const [fetchingLocation, setFetchingLocation] = useState(false);

  // Update editData when user changes
  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        skills: user.skills?.join(', ') || '',
        location: user.location || ''
      });
      setEmergencyContacts(user.emergency_contacts || []);
    }
  }, [user]);

    // Load profile picture when user changes
    useEffect(() => {
      if (user?.id) {
        const savedPicture = localStorage.getItem(`profilePicture_${user.id}`);
        setProfilePicture(savedPicture || '');
      } else {
        setProfilePicture('');
      }
    }, [user?.id]);

    // Update edit data when user changes
    useEffect(() => {
      if (user) {
        setEditData({
          username: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
          skills: user.skills?.join(', ') || '',
          location: user.location || ''
        });
        setEmergencyContacts(user.emergency_contacts || []);
      }
    }, [user]);

    // Listen for booking completion to reload profile (XP/level/credits)
    useEffect(() => {
      const handler = () => {
        window.location.reload(); // simplest: reloads ProfileView to update XP bar and wallet
      };
      window.addEventListener('timebank:refreshProfileAndDashboard', handler);
      return () => window.removeEventListener('timebank:refreshProfileAndDashboard', handler);
    }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setProfilePicture(imageData);
        localStorage.setItem(`profilePicture_${user?.id}`, imageData);
        setUploading(false);
      };
      reader.onerror = () => setUploading(false);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    console.log('handleSave called');
    
    // Basic validation
    if (!editData.username.trim()) {
      alert('Username is required');
      return;
    }
    
    if (!editData.email.trim()) {
      alert('Email is required');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editData.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    if (user) {
      console.log('Current user:', user);
      console.log('Edit data:', editData);
      
      const updatedFields = {
        username: editData.username.trim(),
        email: editData.email.trim(),
        phone: editData.phone.trim(),
        bio: editData.bio.trim(),
        skills: editData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s),
        location: editData.location.trim(),
        emergency_contacts: emergencyContacts
      };
      
      console.log('Updated fields to save:', updatedFields);
      
      try {
        await updateUser(updatedFields);
        console.log('Profile updated successfully in AuthContext');
        alert('Profile updated successfully!');
        setEditing(false);
      } catch (error: any) {
        console.error('Failed to update profile:', error);
        alert(`Failed to update profile: ${error.message || 'Unknown error'}. Please try again.`);
      }
    } else {
      console.error('No user found when trying to save');
      alert('Error: No user session found. Please log in again.');
    }
  };

  const handleCancel = () => {
    // Reset editData to current user data
    if (user) {
      setEditData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        skills: user.skills?.join(', ') || '',
        location: user.location || ''
      });
      setEmergencyContacts(user.emergency_contacts || []);
    }
    setEditing(false);
  };

  // Handler to get current location
  const handleGetLocation = async () => {
    console.log('handleGetLocation called');
    setFetchingLocation(true);
    try {
      console.log('Requesting current location...');
      const loc = await getCurrentLocation();
      console.log('Location received:', loc);
      
      if (loc) {
        console.log('Reverse geocoding coordinates:', loc.lat, loc.lng);
        const address = await reverseGeocode(loc.lat, loc.lng);
        console.log('Address resolved:', address);
        setEditData({ ...editData, location: address });
        alert(`Location detected: ${address}`);
      } else {
        console.warn('No location data received');
        alert('No location data received. Please try again or enter manually.');
      }
    } catch (error: any) {
      console.error('Failed to get location:', error);
      alert(`Failed to get your location: ${error.message || 'Unknown error'}. Please enter manually.`);
    } finally {
      setFetchingLocation(false);
    }
  };

  // Simple reverse geocoding using Nominatim (OpenStreetMap)
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      console.log('Fetching address from Nominatim API...');
      
      // Use a CORS proxy or direct API call with proper headers
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'TimeBank-App/1.0 (contact@timebank.com)',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          mode: 'cors'
        }
      );
      
      if (!response.ok) {
        console.error('Nominatim API error:', response.status, response.statusText);
        // Return coordinates as fallback
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
      
      const data = await response.json();
      console.log('Nominatim response:', data);
      
      // Create a more readable address
      const address = data.address;
      let formattedAddress = data.display_name;
      
      if (address) {
        // Try to create a shorter, more user-friendly address
        const parts = [];
        if (address.house_number && address.road) {
          parts.push(`${address.house_number} ${address.road}`);
        } else if (address.road) {
          parts.push(address.road);
        }
        if (address.city) parts.push(address.city);
        else if (address.town) parts.push(address.town);
        else if (address.village) parts.push(address.village);
        else if (address.hamlet) parts.push(address.hamlet);
        if (address.state) parts.push(address.state);
        if (address.country) parts.push(address.country);
        
        if (parts.length > 0) {
          formattedAddress = parts.join(', ');
        }
      }
      
      return formattedAddress || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      // If CORS fails, try alternative approach or return coordinates
      try {
        // Fallback: try with a different approach
        const fallbackResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        );
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.locality && fallbackData.principalSubdivision) {
            return `${fallbackData.locality}, ${fallbackData.principalSubdivision}`;
          }
        }
      } catch (fallbackError) {
        console.error('Fallback geocoding also failed:', fallbackError);
      }
      
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const handleAddEmergencyContact = () => {
    if (newContact.name && newContact.phone) {
      const contact: EmergencyContact = {
        id: Date.now().toString(),
        ...newContact
      };
      
      // If this is set as primary, remove primary from others
      let updatedContacts = emergencyContacts;
      if (contact.isPrimary) {
        updatedContacts = emergencyContacts.map(c => ({ ...c, isPrimary: false }));
      }
      
      setEmergencyContacts([...updatedContacts, contact]);
      setNewContact({ name: '', phone: '', relationship: '', isPrimary: false });
      setShowAddContact(false);
    }
  };

  const handleDeleteEmergencyContact = (contactId: string) => {
    setEmergencyContacts(emergencyContacts.filter(c => c.id !== contactId));
  };

  const handleCallEmergencyContact = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(''); setPwMessage('');
    if (newPassword.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match'); return; }
    try {
      setPwLoading(true);
      // In mock mode we stored credentials; we can call resetPassword from context
      // We'll import resetPassword via useAuth (extend hook return) — fallback: direct localStorage update
      const auth: any = (useAuth as any)();
      if (!user) throw new Error('No user context');
      if (auth.resetPassword) {
        await auth.resetPassword(user.email, newPassword);
      } else {
        // Fallback update local creds
        const raw = localStorage.getItem('timebank_creds');
        if (raw) {
          const creds = JSON.parse(raw);
          if (!creds[user.email.toLowerCase()]) throw new Error('Credential record missing');
          creds[user.email.toLowerCase()].password = newPassword;
          localStorage.setItem('timebank_creds', JSON.stringify(creds));
        }
      }
      setPwMessage('Password updated successfully');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      setPwError(err.message || 'Failed to update password');
    } finally { setPwLoading(false); }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 h-24 md:h-32"></div>
        <div className="px-4 md:px-6 pb-4 md:pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-center -mt-12 md:-mt-16 space-y-3 md:space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-200 to-cyan-200 flex items-center justify-center">
                    <User className="w-12 h-12 md:w-16 md:h-16 text-emerald-600" />
                  </div>
                )}
                {/* Uploading overlay */}
                {uploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <div className="h-6 w-6 md:h-8 md:w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  </div>
                )}
                {/* Camera button inside the avatar circle */}
                <button
                  aria-label="Change profile picture"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-emerald-500 hover:bg-emerald-600 text-white p-2 md:p-2.5 rounded-full shadow-lg transition-colors tap-target ring-2 ring-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white/80 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Camera className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left sm:self-center">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">{user.username}</h1>
                <LevelBadge level={user.level || 1} size="md" showTitle={false} />
              </div>
              <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 px-4 sm:px-0">{user.bio || 'No bio added yet'}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {user.skills?.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Edit Button */}
            <div className="sm:self-center">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 md:px-6 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm md:text-base tap-target"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Profile</span>
                  <span className="sm:hidden">Edit</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm md:text-base tap-target"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm md:text-base tap-target"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-500" />
            Personal Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              {editing ? (
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{user.username}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              {editing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{user.email}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              {editing ? (
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{user.phone || 'No phone number'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              {editing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter your location"
                  />
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={fetchingLocation}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    title="Get current location"
                  >
                    {fetchingLocation ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{user.location || 'No location set'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skills and Bio */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            Skills & Bio
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              {editing ? (
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Tell others about yourself..."
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
                  <p className="text-gray-700">{user.bio || 'No bio added yet'}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              {editing ? (
                <input
                  type="text"
                  value={editData.skills}
                  onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter skills separated by commas"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  {user.skills && user.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No skills added yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-500" />
            Security
          </h2>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm px-3 py-1.5 rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-50"
          >
            {showPasswordForm ? 'Hide' : 'Change Password'}
          </button>
        </div>
        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            {pwError && <div className="p-2 text-sm bg-red-50 border border-red-200 text-red-600 rounded">{pwError}</div>}
            {pwMessage && <div className="p-2 text-sm bg-emerald-50 border border-emerald-200 text-emerald-700 rounded">{pwMessage}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password (mock)</label>
              <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="(Optional in mock mode)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={pwLoading} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2">
                {pwLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Save Password
              </button>
              <button type="button" onClick={() => { setShowPasswordForm(false); setPwError(''); setPwMessage(''); }} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">Cancel</button>
            </div>
            <p className="text-xs text-gray-500">In production with Firebase this will require re-auth and securely update your password.</p>
          </form>
        )}
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Emergency Contacts
          </h2>
          <button
            onClick={() => setShowAddContact(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors tap-target"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>

        {/* Emergency Contacts List */}
        <div className="space-y-3">
          {emergencyContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>No emergency contacts added yet</p>
              <p className="text-sm">Add contacts for quick access during emergencies</p>
            </div>
          ) : (
            emergencyContacts.map((contact) => (
              <div key={contact.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">{contact.name}</h4>
                    {contact.isPrimary && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <Phone className="w-3 h-3 inline mr-1" />
                    {contact.phone}
                  </p>
                  {contact.relationship && (
                    <p className="text-sm text-gray-500">{contact.relationship}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCallEmergencyContact(contact.phone)}
                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors tap-target"
                    title="Call now"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEmergencyContact(contact.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors tap-target"
                    title="Delete contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Contact Modal */}
        {showAddContact && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Add Emergency Contact</h3>
                <button
                  onClick={() => setShowAddContact(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter contact name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      newContact.phone && !validatePhoneNumber(newContact.phone)
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="+1-555-123-4567"
                    required
                  />
                  {newContact.phone && !validatePhoneNumber(newContact.phone) && (
                    <p className="text-sm text-red-600 mt-1">Please enter a valid phone number</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <select
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Select relationship</option>
                    <option value="Family">Family</option>
                    <option value="Friend">Friend</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Neighbor">Neighbor</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={newContact.isPrimary}
                    onChange={(e) => setNewContact({ ...newContact, isPrimary: e.target.checked })}
                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="isPrimary" className="ml-2 text-sm text-gray-700">
                    Set as primary emergency contact
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddContact(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEmergencyContact}
                  disabled={!newContact.name || !newContact.phone || !validatePhoneNumber(newContact.phone)}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Level Progress Section */}
      {user && (() => {
        const currentExperience = user.experience_points || 0;
        const servicesCompleted = user.services_completed || 0;
        const currentLevel = user.level || 1;

        return (
          <>
            {/* New Detailed Level Progress Component */}
            <LevelProgressDetail
              currentLevel={currentLevel}
              currentExperience={currentExperience}
              servicesCompleted={servicesCompleted}
            />

            {/* All Unlocked Perks */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 rounded-2xl shadow-lg p-6 border-2 border-cyan-500/30"
              style={{
                boxShadow: '0 0 40px rgba(34, 211, 238, 0.2)'
              }}
            >
              {(() => {
                const progress = getLevelProgress(currentExperience, servicesCompleted);
                return <LevelPerkList perks={progress.unlockedPerks} />;
              })()}
            </div>
          </>
        );
      })()}

      {/* Activity Stats */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-500" />
          Activity Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">0</div>
            <div className="text-sm text-gray-600">Services Offered</div>
          </div>
          <div className="text-center p-4 bg-cyan-50 rounded-lg">
            <div className="text-2xl font-bold text-cyan-600">0</div>
            <div className="text-sm text-gray-600">Bookings Made</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Reviews Given</div>
          </div>
        </div>
      </div>
    </div>
  );
};
