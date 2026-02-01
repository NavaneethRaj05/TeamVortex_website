import React, { useState, useEffect } from 'react';
import { Save, Edit2, X, Eye, Calendar, MapPin, Users } from 'lucide-react';

const ContentManager = () => {
  const [prayogContent, setPrayogContent] = useState({
    title: 'PRAYOG 1.0',
    date: 'March 25, 2025',
    venue: 'Navkis College of Engineering',
    description1: 'Prayog 1.0 was a flagship technical event organized by Team Vortex at Navkis College of Engineering, Hassan, held on 25th March 2025. Designed to foster innovation, collaboration, and tech-oriented problem-solving, Prayog 1.0 showcased the club\'s commitment to hands-on learning and student engagement through its four key sub-events.',
    description2: 'The event drew over 150 participants, reflecting strong interest across disciplines. Prayog 1.0 not only provided a platform for skill development and networking but also celebrated the diversity and enthusiasm of the tech community at Navkis College of Engineering. The success and energetic response to Prayog 1.0 have laid a strong foundation for it to become a recurring highlight in the annual calendar of Team Vortex.',
    participantCount: '150+',
    galleryDriveLink: '',
    images: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Load content from localStorage on component mount
  useEffect(() => {
    const savedContent = localStorage.getItem('prayogContent');
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        setPrayogContent(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved content:', error);
      }
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage for fast access
      localStorage.setItem('prayogContent', JSON.stringify(prayogContent));
      
      // Simulate API call delay (you can replace this with actual API call)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLastSaved(new Date());
      setIsEditing(false);
      
      // Dispatch custom event to update Events page
      window.dispatchEvent(new CustomEvent('prayogContentUpdated', { 
        detail: prayogContent 
      }));
      
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reload from localStorage to discard changes
    const savedContent = localStorage.getItem('prayogContent');
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        setPrayogContent(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved content:', error);
      }
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">PRAYOG 1.0 Content Management</h2>
          <p className="text-white/60 text-sm">Manage the content displayed in the Events section</p>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-green-400">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-vortex-blue text-black font-bold py-2 px-4 rounded-lg hover:bg-vortex-blue/80 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Content
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-white/10 text-white/70 py-2 px-4 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        {isEditing ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none"
                  value={prayogContent.title}
                  onChange={(e) => setPrayogContent({ ...prayogContent, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                  Event Date
                </label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none"
                  value={prayogContent.date}
                  onChange={(e) => setPrayogContent({ ...prayogContent, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                  Venue
                </label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none"
                  value={prayogContent.venue}
                  onChange={(e) => setPrayogContent({ ...prayogContent, venue: e.target.value })}
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                  First Paragraph
                </label>
                <textarea
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none h-24 resize-none"
                  value={prayogContent.description1}
                  onChange={(e) => setPrayogContent({ ...prayogContent, description1: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                  Second Paragraph
                </label>
                <textarea
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none h-24 resize-none"
                  value={prayogContent.description2}
                  onChange={(e) => setPrayogContent({ ...prayogContent, description2: e.target.value })}
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                  Participant Count
                </label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none"
                  value={prayogContent.participantCount}
                  onChange={(e) => setPrayogContent({ ...prayogContent, participantCount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                  Google Drive Gallery Link
                </label>
                <input
                  type="url"
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={prayogContent.galleryDriveLink}
                  onChange={(e) => setPrayogContent({ ...prayogContent, galleryDriveLink: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                  Image URLs (comma separated)
                </label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none"
                  placeholder="url1.jpg, url2.jpg"
                  value={prayogContent.images}
                  onChange={(e) => setPrayogContent({ ...prayogContent, images: e.target.value })}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Preview */}
            <div className="p-6 bg-gradient-to-br from-vortex-blue/10 via-transparent to-vortex-orange/10 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-vortex-blue" />
                <span className="text-vortex-blue font-bold uppercase tracking-wider text-sm">Live Preview</span>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-3xl md:text-4xl font-orbitron font-bold mb-4 tracking-wider">
                  <span className="gradient-text">{prayogContent.title}</span>
                </h3>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-white/60 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{prayogContent.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{prayogContent.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{prayogContent.participantCount} participants</span>
                  </div>
                </div>
              </div>
              
              <div className="text-white/80 max-w-4xl mx-auto leading-relaxed space-y-4 text-justify">
                <p>{prayogContent.description1}</p>
                <p>{prayogContent.description2}</p>
              </div>

              {/* Gallery Info */}
              {(prayogContent.galleryDriveLink || prayogContent.images) && (
                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-sm text-white/60 mb-2">Gallery Content:</div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-white/40">Drive Link:</span>
                      <div className="text-green-400">{prayogContent.galleryDriveLink ? '✓ Configured' : '✗ Not set'}</div>
                    </div>
                    <div>
                      <span className="text-white/40">Images:</span>
                      <div className="text-blue-400">
                        {prayogContent.images ? `${prayogContent.images.split(',').length} images` : '✗ Not set'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManager;