import { uploadToCloudinary, UploadOptions } from '../../services/uploadToCloudinary';

// Use environment variable if available, else fallback to hardcoded
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'diecgt687';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned';
  // Cloudinary config (replace with your own values)
  // (Cloud name and preset are now set above)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X } from 'lucide-react';
import { Skill } from '../../types';
import { dataService } from '../../services/dataService';

interface ServiceModalProps {
  onClose: () => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillId, setSkillId] = useState('');
  const [type, setType] = useState<'offer' | 'request'>('offer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [creditsPerHour, setCreditsPerHour] = useState<number>(1.0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [fileProgress, setFileProgress] = useState<number[]>([]);
  const [abortControllers, setAbortControllers] = useState<AbortController[]>([]);
  // Handle image file selection
  // Allow multiple image selection with validation (max 10, image types, size <= 5MB)
  const MAX_IMAGES = Number(import.meta.env.VITE_MAX_SERVICE_IMAGES || 10);
  const MAX_SIZE_MB = 5;
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;
    // Merge with existing but cap to MAX_IMAGES
    const combined = [...imageFiles, ...picked];
    const limited = combined.slice(0, MAX_IMAGES);
    const acceptTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const invalids: string[] = [];
    const tooLarge: string[] = [];
    const validFiles = limited.filter(f => {
      if (!acceptTypes.includes(f.type)) { invalids.push(f.name); return false; }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) { tooLarge.push(f.name); return false; }
      return true;
    });
    if (invalids.length) {
      setError(`Some files are not supported types (jpg, png, webp, gif): ${invalids.join(', ')}`);
    } else if (tooLarge.length) {
      setError(`Some files exceed ${MAX_SIZE_MB}MB: ${tooLarge.join(', ')}`);
    } else {
      setError('');
    }
    setImageFiles(validFiles);
    setImagePreviews(validFiles.map(file => URL.createObjectURL(file)));
    setFileProgress(validFiles.map(() => 0));
    setAbortControllers(validFiles.map(() => new AbortController()));
  };

  // Level-based custom pricing: Level 5+ users can set their own rates
  const userLevel = user?.level || 1;
  const canSetCustomCredits = userLevel >= 5 || (!!user && user.total_reviews >= 5 && user.reputation_score >= 4.5);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    const skillsData = await dataService.getSkills();
    setSkills(skillsData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 ServiceModal handleSubmit called');
    console.log('👤 User:', user);
    console.log('📋 Form data:', { title, description, skillId, creditsPerHour, type });
    
    if (!user) {
      console.error('❌ No user found');
      setError('You must be logged in to create a service');
      return;
    }

    // Basic validation
    if (!title.trim()) {
      console.error('❌ Title is required');
      setError('Service title is required');
      return;
    }
    if (!description.trim()) {
      console.error('❌ Description is required');
      setError('Service description is required');
      return;
    }
    if (!skillId) {
      console.error('❌ Skill is required');
      setError('Please select a skill');
      return;
    }

    console.log('✅ Form validation passed');

    setLoading(true);
    setError('');
    setUploading(false);
    setUploadProgress(0);
    try {
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        console.log('📸 Processing images...');
        setUploading(true);
        const total = imageFiles.length;
        for (let i = 0; i < total; i++) {
          try {
            const controller = abortControllers[i] || new AbortController();
            const opts: UploadOptions = {
              signal: controller.signal,
              onProgress: (p) => {
                setFileProgress(prev => {
                  const next = [...prev];
                  next[i] = p;
                  // overall progress as average
                  const sum = next.reduce((a, b) => a + b, 0);
                  setUploadProgress(Math.round(sum / total));
                  return next;
                });
              }
            };
            const url = await uploadToCloudinary(imageFiles[i], CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, opts);
            imageUrls.push(url);
          } catch (uploadError) {
            console.warn('Failed to upload image, continuing without it:', uploadError);
            // Continue without this image
          }
        }
        setUploading(false);
      }
      
      console.log('🚀 Creating service with data:', {
        provider_id: user.id,
        skill_id: skillId,
        title,
        description,
        credits_per_hour: canSetCustomCredits ? creditsPerHour : 1.0,
        status: 'active',
        type,
        imageUrls,
      });
      
      const newService = await dataService.createService({
        provider_id: user.id,
        skill_id: skillId,
        title,
        description,
        credits_per_hour: canSetCustomCredits ? creditsPerHour : 1.0,
        status: 'active',
        type,
        imageUrls,
      });
      
      console.log('✅ Service created successfully:', newService);
      alert('Service posted successfully!');
      onClose();
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      console.error('❌ Failed to create service:', error);
      setError((error as any).message || 'Failed to create service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <label className="block font-medium mb-1">Service Images (up to {MAX_IMAGES})</label>
            <span className="text-sm text-gray-500">{imageFiles.length}/{MAX_IMAGES}</span>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            disabled={imageFiles.length >= MAX_IMAGES}
          />
          <div className="grid grid-cols-5 gap-2 mt-3">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt="preview" className="w-full h-20 object-cover rounded" />
                {uploading ? (
                  <div className="absolute inset-x-0 bottom-0 h-2 bg-black/10 rounded-b">
                    <div className="h-2 bg-emerald-500 rounded-b" style={{ width: `${fileProgress[i] || 0}%` }} />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      // remove image i
                      setImageFiles(prev => prev.filter((_, idx) => idx !== i));
                      setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
                      setFileProgress(prev => prev.filter((_, idx) => idx !== i));
                      setAbortControllers(prev => prev.filter((_, idx) => idx !== i));
                    }}
                    className="absolute top-1 right-1 px-1.5 py-0.5 text-xs bg-white/80 hover:bg-white rounded shadow"
                  >
                    Remove
                  </button>
                )}
                {uploading && (fileProgress[i] || 0) < 100 && (
                  <button
                    type="button"
                    onClick={() => abortControllers[i]?.abort()}
                    className="absolute top-1 right-1 px-1.5 py-0.5 text-xs bg-white/80 hover:bg-white rounded shadow"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
          {uploading && (
            <div className="mt-2 text-sm text-blue-600">Uploading images... {uploadProgress}%</div>
          )}
          {error && (
            <div className="mt-2 text-sm text-red-600">{error}</div>
          )}
        </div>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Post a Service</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credits per hour
                    {userLevel >= 5 && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full">
                        🏆 Level {userLevel} - Custom Pricing Unlocked
                      </span>
                    )}
                  </label>
                  {canSetCustomCredits ? (
                    <div>
                      <input
                        type="number"
                        min={0.5}
                        step={0.5}
                        value={creditsPerHour}
                        onChange={(e) => setCreditsPerHour(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                      <p className="mt-1 text-xs text-emerald-600">
                        ✨ You can set your own rate! Your level perks give you pricing freedom.
                      </p>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 bg-gradient-to-br from-gray-50 to-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🔒</span>
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">Default Rate: 1.0 credit/hr</p>
                          <p className="text-xs">
                            Reach <span className="font-bold text-blue-600">Level 5</span> (25 services completed) to unlock custom pricing!
                          </p>
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            <p className="text-xs text-gray-500">
                              Current: Level {userLevel} • Services: {user?.services_completed || 0}/25
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('offer')}
                className={`p-4 rounded-lg border-2 transition ${
                  type === 'offer'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">I'm Offering</div>
                <div className="text-sm opacity-75">A service I can provide</div>
              </button>
              <button
                type="button"
                onClick={() => setType('request')}
                className={`p-4 rounded-lg border-2 transition ${
                  type === 'request'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">I'm Requesting</div>
                <div className="text-sm opacity-75">A service I need</div>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="skill" className="block text-sm font-medium text-gray-700 mb-1">
              Skill Category
            </label>
            <select
              id="skill"
              value={skillId}
              onChange={(e) => setSkillId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            >
              <option value="">Select a skill</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name} ({skill.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Service Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., React & TypeScript Development Help"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you're offering or what you need help with..."
              rows={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
              required
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Note:</span> All services are priced at 1 time credit per hour.
              This ensures fair exchange across all skill levels.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : 'Post Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};