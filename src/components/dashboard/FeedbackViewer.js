import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, TrendingUp, Calendar, User } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';

const FeedbackViewer = ({ event, onClose }) => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    if (event && event._id) {
      fetchFeedback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/events/${event._id}`);
      const data = await res.json();
      
      const feedbackData = data.feedback || [];
      setFeedback(feedbackData);
      
      // Calculate statistics
      const total = feedbackData.length;
      const avgRating = total > 0 
        ? feedbackData.reduce((sum, f) => sum + f.rating, 0) / total 
        : 0;
      
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      feedbackData.forEach(f => {
        if (f.rating >= 1 && f.rating <= 5) {
          distribution[f.rating]++;
        }
      });
      
      setStats({
        totalFeedback: total,
        averageRating: avgRating,
        ratingDistribution: distribution
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-white/20'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-400';
    if (rating >= 3.5) return 'text-yellow-400';
    if (rating >= 2.5) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative glass-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Event Feedback</h2>
          <p className="text-white/60">{event.title}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-white/50">Loading feedback...</div>
          </div>
        ) : feedback.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Feedback Yet</h3>
            <p className="text-white/60">No participants have submitted feedback for this event.</p>
          </div>
        ) : (
          <>
            {/* Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="glass-card p-4 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  <span className="text-xs text-white/60 uppercase tracking-wider">Total Feedback</span>
                </div>
                <div className="text-3xl font-bold text-white">{stats.totalFeedback}</div>
              </div>

              <div className="glass-card p-4 border border-yellow-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  <span className="text-xs text-white/60 uppercase tracking-wider">Average Rating</span>
                </div>
                <div className={`text-3xl font-bold ${getRatingColor(stats.averageRating)}`}>
                  {stats.averageRating.toFixed(1)} / 5.0
                </div>
              </div>

              <div className="glass-card p-4 border border-blue-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="w-5 h-5 text-blue-400" />
                  <span className="text-xs text-white/60 uppercase tracking-wider">Rating Distribution</span>
                </div>
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-xs text-white/60 w-8">{rating}★</span>
                      <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-yellow-400 h-full rounded-full transition-all"
                          style={{
                            width: `${stats.totalFeedback > 0 ? (stats.ratingDistribution[rating] / stats.totalFeedback) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span className="text-xs text-white/40 w-8">{stats.ratingDistribution[rating]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">All Feedback ({feedback.length})</h3>
              {feedback.map((item, index) => (
                <div key={index} className="glass-card p-4 border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold">{item.name}</div>
                        <div className="text-white/40 text-xs">ID: {item.studentId}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {renderStars(item.rating)}
                      {item.createdAt && (
                        <div className="flex items-center gap-1 text-white/40 text-xs">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-white/70 text-sm leading-relaxed">
                    {item.comment}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackViewer;
