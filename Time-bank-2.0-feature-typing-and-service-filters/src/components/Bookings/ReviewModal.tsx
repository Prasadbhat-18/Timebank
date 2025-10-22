import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Star } from 'lucide-react';
import { Booking } from '../../types';
import { dataService } from '../../services/dataService';

interface ReviewModalProps {
  booking: Booking;
  onClose: () => void;
  onReviewed: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ booking, onClose, onReviewed }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const isProvider = booking.provider_id === user?.id;
  const reviewee = isProvider ? booking.requester : booking.provider;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewee) return;

    // Basic validation
    if (rating < 1 || rating > 5) {
      alert('Please select a valid rating');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating review:', {
        booking_id: booking.id,
        reviewer_id: user.id,
        reviewee_id: reviewee.id,
        rating,
        comment,
      });
      
      const newReview = await dataService.createReview({
        booking_id: booking.id,
        reviewer_id: user.id,
        reviewee_id: reviewee.id,
        rating,
        comment,
      });
      
      console.log('Review created successfully:', newReview);
      alert('Review submitted successfully!');
      onReviewed();
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Leave a Review</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-1">{booking.service?.title}</h3>
            <p className="text-sm text-gray-600">
              Review for: <span className="font-medium">{reviewee?.username}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="transition hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      value <= rating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Your Review
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this service..."
              rows={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
              required
            />
          </div>

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
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};