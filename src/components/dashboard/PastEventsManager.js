import React, { useState, useEffect } from 'react';
import { Calendar, Image, ExternalLink, Trash2, Plus, Save, X, Eye, MapPin, Clock, Users, Info } from 'lucide-react';
import API_BASE_URL from '../../apiConfig';

const PastEventsManager = () => {
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editMode, setEditMode] = useState('gallery'); // 'gallery' | 'info' | 'subevents'
  const [prayogMissing, setPrayogMissing] = useState(false);
  const [editForm, setEditForm] = useState({
    // Basic Info
    title: '',
    description: '',
    date: '',

    location: '',
    startTime: '',
    endTime: '',
    // Gallery
    galleryDriveLink: '',
    images: '',
    subEvents: [],
    // Status
    status: 'completed',
    // Additional Info
    category: 'Technical',
    eventType: 'Inter-College',
    price: 0,
    priority: 0,
    capacity: 0,
    organizer: {
      name: '',
      email: ''
    }
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchPastEvents();
  }, []);

  const fetchPastEvents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events`);
      const data = await res.json();

      const prayog = data.find(e => (e.title || '').trim().toLowerCase() === 'prayog 1.0');
      
      // Check if PRAYOG exists but has no sub-events
      const prayogNeedsSubEvents = prayog && (!prayog.subEvents || prayog.subEvents.length === 0);
      setPrayogMissing(!prayog || prayogNeedsSubEvents);

      // Filter for completed events or events in the past
      const now = new Date();
      const past = data.filter(event => {
        if (event.status === 'draft') return false;
        if (event.status === 'completed') return true;

        const eventDate = new Date(event.date);
        const eventEnd = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 23, 59, 59);

        if (event.endTime) {
          const [h, m] = event.endTime.split(':');
          eventEnd.setHours(parseInt(h), parseInt(m), 0);
        }

        return now > eventEnd;
      }).sort((a, b) => {
        // Sort by Priority (descending) first, then Date (descending)
        if ((b.priority || 0) !== (a.priority || 0)) {
          return (b.priority || 0) - (a.priority || 0);

        }
        return new Date(b.date) - new Date(a.date);
      });

      setPastEvents(past);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching past events:', err);
      setLoading(false);
    }
  };

  const handleCreatePrayog = async () => {
    try {
      const payload = {
        title: 'PRAYOG 1.0',
        description: "Prayog 1.0 was a flagship technical event organized by Team Vortex at Navkis College of Engineering, Hassan, held on 25th March 2025. Designed to foster innovation, collaboration, and tech-oriented problem-solving, Prayog 1.0 showcased the club's commitment to hands-on learning and student engagement through its four key sub-events.\n\nThe event drew over 150 participants, reflecting strong interest across disciplines. Prayog 1.0 not only provided a platform for skill development and networking but also celebrated the diversity and enthusiasm of the tech community at Navkis College of Engineering. The success and energetic response to Prayog 1.0 have laid a strong foundation for it to become a recurring highlight in the annual calendar of Team Vortex.",
        date: '2025-03-25',
        startTime: '09:00',
        endTime: '17:00',
        location: 'Navkis College of Engineering',
        status: 'completed',
        eventType: 'Inter-College',
        category: 'Technical',
        priority: 10,
        capacity: 0,
        price: 0,
        galleryDriveLink: '',
        images: [],
        subEvents: [
          { 
            title: 'Champions League', 
            description: 'Branch-wise competitive event where teams represented their respective departments.', 
            details: 'Champions League was a branch-wise competitive event where teams represented their respective departments. It focused on testing participants\' technical knowledge, logical thinking, and teamwork through multiple challenging rounds, fostering healthy competition among branches.', 
            icon: 'Trophy', 
            color: 'from-yellow-500 to-orange-500', 
            duration: 'Full Day', 
            participants: 'Branch-wise Teams', 
            images: [] 
          },
          { 
            title: 'Hackathon', 
            description: 'Inter-college team-based coding and innovation challenge.', 
            details: 'The Hackathon was an inter-college team-based coding and innovation challenge. Teams worked intensively to develop practical solutions to real-world problems within a limited time. This event emphasized innovation, problem-solving, coding skills, and collaboration.', 
            icon: 'Code', 
            color: 'from-vortex-blue to-cyan-400', 
            duration: 'Full Day', 
            participants: 'Inter-College Teams', 
            images: [] 
          },
          { 
            title: 'Eureka', 
            description: 'Idea and innovation-based event conducted within the college.', 
            details: 'Eureka was an idea and innovation-based event conducted within the college. Teams presented creative solutions and project ideas to real-world or technical problems, focusing on original thinking, feasibility, and impact.', 
            icon: 'Key', 
            color: 'from-purple-500 to-pink-500', 
            duration: 'Half Day', 
            participants: 'Intra-College Teams', 
            images: [] 
          },
          { 
            title: 'Gameathon', 
            description: 'Fun yet competitive intra-college event centered around strategic games.', 
            details: 'Gameathon was a fun yet competitive intra-college event centered around strategic and skill-based games. It tested participants\' decision-making, coordination, and analytical skills, making it both engaging and intellectually stimulating.', 
            icon: 'Gamepad2', 
            color: 'from-red-500 to-vortex-orange', 
            duration: 'Half Day', 
            participants: 'Intra-College Teams', 
            images: [] 
          }
        ],
        organizer: { name: 'Team Vortex', email: 'teamvortexnce@gmail.com' }
      };

      const res = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Failed to create PRAYOG 1.0');
      }

      await fetchPastEvents();
      alert('PRAYOG 1.0 created! You can now edit its info, sub-events, and gallery.');
    } catch (err) {
      console.error('Error creating PRAYOG 1.0:', err);
      alert(err.message || 'Failed to create PRAYOG 1.0');
    }
  };

  const handleEdit = (event, mode = 'gallery') => {
    setEditingEvent(event._id);
    setEditMode(mode);
    setEditForm({
      // Basic Info
      title: event.title || '',
      description: event.description || '',
      date: event.date ? event.date.split('T')[0] : '',
      location: event.location || '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      // Gallery
      galleryDriveLink: event.galleryDriveLink || '',
      images: Array.isArray(event.images) ? event.images.join(', ') : (event.images || ''),
      subEvents: Array.isArray(event.subEvents) ? event.subEvents : [],
      // Status
      status: event.status || 'completed',
      // Additional Info
      category: event.category || 'Technical',
      eventType: event.eventType || 'Inter-College',
      price: event.price || 0,

      priority: event.priority || 0,
      capacity: event.capacity || 0,
      organizer: {
        name: event.organizer?.name || '',
        email: event.organizer?.email || ''
      }
    });
  };

  const handleSave = async (eventId) => {
    try {
      const updateData = {
        title: editForm.title,
        description: editForm.description,
        date: editForm.date,
        location: editForm.location,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        galleryDriveLink: editForm.galleryDriveLink,
        images: typeof editForm.images === 'string' ? editForm.images.split(',').map(url => url.trim()).filter(url => url.length > 0) : [],
        subEvents: Array.isArray(editForm.subEvents) ? editForm.subEvents : [],
        status: editForm.status,
        category: editForm.category,
        eventType: editForm.eventType,
        price: parseFloat(editForm.price) || 0,
        priority: parseInt(editForm.priority) || 0,

        capacity: parseInt(editForm.capacity) || 0,
        organizer: editForm.organizer
      };

      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (res.ok) {
        setEditingEvent(null);
        setEditMode('gallery');
        fetchPastEvents();
        alert('Event updated successfully!');
      } else {
        const errorData = await res.json();
        alert(`Failed to update event: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error updating event:', err);
      alert('Error updating event');
    }
  };

  const handleDelete = async (eventId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchPastEvents();
        setDeleteConfirm(null);
        alert('Event deleted successfully!');
      } else {
        alert('Failed to delete event');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Error deleting event');
    }
  };

  const handleCancel = () => {
    setEditingEvent(null);
    setEditMode('gallery');
    setEditForm({
      title: '', description: '', date: '', location: '', startTime: '', endTime: '',
      galleryDriveLink: '', images: '', subEvents: [], status: 'completed', category: 'Technical',
      eventType: 'Inter-College', price: 0, priority: 0, capacity: 0, organizer: { name: '', email: '' }
    });
  };

  const updateSubEvent = (index, patch) => {
    const next = [...(editForm.subEvents || [])];
    next[index] = { ...next[index], ...patch };
    setEditForm({ ...editForm, subEvents: next });
  };

  const addSubEvent = () => {
    const next = [...(editForm.subEvents || [])];
    next.push({
      title: '',
      description: '',
      details: '',
      icon: 'Calendar',
      color: 'from-blue-500 to-purple-500',
      duration: '',
      participants: '',
      images: []
    });
    setEditForm({ ...editForm, subEvents: next });
  };

  const removeSubEvent = (index) => {
    const next = (editForm.subEvents || []).filter((_, i) => i !== index);
    setEditForm({ ...editForm, subEvents: next });
  };

  const markAsCompleted = async (eventId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });

      if (res.ok) {
        fetchPastEvents();
        alert('Event marked as completed!');
      }
    } catch (err) {
      console.error('Error updating event status:', err);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-8">
        <div className="text-center text-white/50">Loading past events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Past Events Management</h2>
        <div className="text-sm text-white/60">
          {pastEvents.length} past events • Full CRUD Operations
        </div>
      </div>

      {prayogMissing && (
        <div className="glass-card p-6 border border-yellow-500/30 bg-yellow-500/5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-white font-bold">PRAYOG 1.0 needs setup</div>
              <div className="text-white/60 text-sm">PRAYOG 1.0 is missing or doesn't have sub-events. Create/update it to manage its info, sub-events, and gallery from here.</div>
            </div>
            <button
              onClick={handleCreatePrayog}
              className="bg-vortex-blue text-black font-bold py-2 px-4 rounded-lg hover:bg-vortex-blue/80 transition-colors"
            >
              Setup PRAYOG 1.0
            </button>
          </div>
        </div>
      )}

      {pastEvents.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Past Events</h3>
          <p className="text-white/60">Events will appear here once they are completed or past their date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pastEvents.map((event) => (
            <div key={event._id} className="glass-card p-6 border-l-4 border-vortex-blue">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/60 mb-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-vortex-blue" />
                      {new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-vortex-orange" />
                      {event.startTime ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}` : 'Time TBA'}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-green-400" />
                      {event.location || 'Location TBA'}
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mb-3 line-clamp-2">{event.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${event.status === 'completed'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-orange-500/20 text-orange-400'
                      }`}>
                      {event.status === 'completed' ? 'Completed' : 'Past Event'}
                    </span>
                    {event.priority > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                        Top Priority ({event.priority})
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                      {event.eventType}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
                      {event.category}
                    </span>
                    {event.registrationCount && (
                      <span className="px-2 py-1 rounded-full text-xs bg-white/10 text-white/70">
                        <Users className="w-3 h-3 inline mr-1" />
                        {event.registrationCount} participants
                      </span>
                    )}
                    {event.subEvents && event.subEvents.length > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs bg-vortex-blue/20 text-vortex-blue">
                        {event.subEvents.length} sub-events
                      </span>
                    )}
                    {event.price > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                        ₹{event.price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {event.status !== 'completed' && (
                    <button
                      onClick={() => markAsCompleted(event._id)}
                      className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                      title="Mark as Completed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(event, 'info')}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                    title="Edit Event Info"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(event, 'subevents')}
                    className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                    title="Edit Sub-Events"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(event, 'gallery')}
                    className="p-2 bg-vortex-blue/20 text-vortex-blue rounded-lg hover:bg-vortex-blue/30 transition-colors"
                    title="Edit Gallery"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(event._id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingEvent === event._id ? (
                <div className="space-y-6 p-6 bg-white/5 rounded-xl border border-white/10">
                  {/* Edit Mode Tabs */}
                  <div className="flex bg-white/5 p-1 rounded-lg">
                    <button
                      onClick={() => setEditMode('info')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${editMode === 'info'
                        ? 'bg-blue-500 text-white'
                        : 'text-white/70 hover:text-white'
                        }`}
                    >
                      <Info className="w-4 h-4 inline mr-2" />
                      Event Information
                    </button>
                    <button
                      onClick={() => setEditMode('subevents')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${editMode === 'subevents'
                        ? 'bg-purple-500 text-white'
                        : 'text-white/70 hover:text-white'
                        }`}
                    >
                      <Users className="w-4 h-4 inline mr-2" />
                      Sub-Events
                    </button>
                    <button
                      onClick={() => setEditMode('gallery')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${editMode === 'gallery'
                        ? 'bg-vortex-blue text-black'
                        : 'text-white/70 hover:text-white'
                        }`}
                    >
                      <Image className="w-4 h-4 inline mr-2" />
                      Gallery & Media
                    </button>
                  </div>

                  {editMode === 'info' ? (
                    <div className="space-y-4">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                            Event Title *
                          </label>
                          <input
                            type="text"
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 outline-none"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                            Location *
                          </label>
                          <input
                            type="text"
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 outline-none"
                            value={editForm.location}
                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                          Description *
                        </label>
                        <textarea
                          className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 outline-none h-24 resize-none"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          required
                        />
                      </div>

                      {/* Date and Time */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                            Event Date *
                          </label>
                          <input
                            type="date"
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 outline-none"
                            value={editForm.date}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                            Start Time
                          </label>
                          <input
                            type="time"
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 outline-none"
                            value={editForm.startTime}
                            onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                            End Time
                          </label>
                          <input
                            type="time"
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 outline-none"
                            value={editForm.endTime}
                            onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                            Event Type
                          </label>
                          <select
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 outline-none"
                            value={editForm.eventType}
                            onChange={(e) => setEditForm({ ...editForm, eventType: e.target.value })}
                          >
                            <option value="Inter-College">Inter-College</option>
                            <option value="Intra-College">Intra-College</option>
                            <option value="Open">Open to All</option>
                            <option value="Workshop">Workshop</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                            Category
                          </label>
                          <select
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 outline-none"
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          >
                            <option value="Technical">Technical</option>
                            <option value="Cultural">Cultural</option>
                            <option value="Sports">Sports</option>
                            <option value="Gaming">Gaming</option>
                            <option value="Business">Business</option>
                            <option value="Academic">Academic</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 outline-none"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                            Capacity
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 outline-none"
                            value={editForm.capacity}
                            onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                          Display Priority (Higher = Show First)
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="number"
                            min="0"
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 outline-none"
                            value={editForm.priority}
                            onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                          />
                          <div className="text-xs text-white/40">
                            0 = Default. Set to 10, 20 etc. to highlight specific events.
                          </div>
                        </div>
                      </div>

                      {/* Organizer Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                            Organizer Name
                          </label>
                          <input
                            type="text"
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 outline-none"
                            value={editForm.organizer.name}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              organizer: { ...editForm.organizer, name: e.target.value }
                            })}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                            Organizer Email
                          </label>
                          <input
                            type="email"
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 outline-none"
                            value={editForm.organizer.email}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              organizer: { ...editForm.organizer, email: e.target.value }
                            })}
                          />
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                          Event Status
                        </label>
                        <select
                          className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-blue-400 outline-none"
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ) : editMode === 'subevents' ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-white/60 uppercase tracking-wider">Sub-Events</div>
                        <button
                          type="button"
                          onClick={addSubEvent}
                          className="text-xs text-vortex-blue font-bold hover:underline"
                        >
                          + Add Sub-Event
                        </button>
                      </div>

                      {(editForm.subEvents || []).length === 0 ? (
                        <div className="p-6 bg-white/5 rounded-lg border border-white/10 text-center text-white/50 text-sm">
                          No sub-events added yet.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(editForm.subEvents || []).map((subEvent, index) => (
                            <div key={`subevent-${index}`} className="p-4 bg-black/20 rounded-xl border border-white/10 space-y-3">
                              <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none"
                                    placeholder="Sub-Event Title"
                                    value={subEvent.title || ''}
                                    onChange={(e) => updateSubEvent(index, { title: e.target.value })}
                                  />
                                  <input
                                    type="text"
                                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none"
                                    placeholder="Duration (e.g., Full Day, 2 Hours)"
                                    value={subEvent.duration || ''}
                                    onChange={(e) => updateSubEvent(index, { duration: e.target.value })}
                                  />
                                  <input
                                    type="text"
                                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none"
                                    placeholder="Participants (e.g., Solo, Team)"
                                    value={subEvent.participants || ''}
                                    onChange={(e) => updateSubEvent(index, { participants: e.target.value })}
                                  />
                                  <select
                                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none"
                                    value={subEvent.icon || 'Calendar'}
                                    onChange={(e) => updateSubEvent(index, { icon: e.target.value })}
                                  >
                                    <option value="Calendar">Calendar</option>
                                    <option value="Trophy">Trophy</option>
                                    <option value="Code">Code</option>
                                    <option value="Key">Key</option>
                                    <option value="Gamepad2">Gamepad2</option>
                                    <option value="Users">Users</option>
                                    <option value="MapPin">MapPin</option>
                                    <option value="Clock">Clock</option>
                                  </select>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeSubEvent(index)}
                                  className="text-red-400/60 hover:text-red-400 transition-colors"
                                  title="Remove Sub-Event"
                                >
                                  <X size={18} />
                                </button>
                              </div>

                              <textarea
                                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none h-20 resize-none"
                                placeholder="Brief description"
                                value={subEvent.description || ''}
                                onChange={(e) => updateSubEvent(index, { description: e.target.value })}
                              />

                              <textarea
                                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none h-24 resize-none"
                                placeholder="Detailed information"
                                value={subEvent.details || ''}
                                onChange={(e) => updateSubEvent(index, { details: e.target.value })}
                              />

                              <select
                                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none"
                                value={subEvent.color || 'from-blue-500 to-purple-500'}
                                onChange={(e) => updateSubEvent(index, { color: e.target.value })}
                              >
                                <option value="from-blue-500 to-purple-500">Blue to Purple</option>
                                <option value="from-yellow-500 to-orange-500">Yellow to Orange</option>
                                <option value="from-vortex-blue to-cyan-400">Vortex Blue to Cyan</option>
                                <option value="from-purple-500 to-pink-500">Purple to Pink</option>
                                <option value="from-red-500 to-vortex-orange">Red to Orange</option>
                                <option value="from-green-500 to-emerald-500">Green to Emerald</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Gallery Management */}
                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                          Google Drive Gallery Link
                        </label>
                        <input
                          type="url"
                          className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none"
                          placeholder="https://drive.google.com/drive/folders/..."
                          value={editForm.galleryDriveLink}
                          onChange={(e) => setEditForm({ ...editForm, galleryDriveLink: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                          Image URLs (comma separated)
                        </label>
                        <textarea
                          className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:border-vortex-blue outline-none h-24 resize-none"
                          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                          value={editForm.images}
                          onChange={(e) => setEditForm({ ...editForm, images: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleSave(event._id)}
                      className="flex-1 bg-vortex-blue text-black font-bold py-3 px-6 rounded-lg hover:bg-vortex-blue/80 transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Gallery Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <ExternalLink className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-white/60 uppercase tracking-wider">Drive Gallery</span>
                      </div>
                      {event.galleryDriveLink ? (
                        <a
                          href={event.galleryDriveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-400 hover:text-green-300 transition-colors truncate block"
                        >
                          View Drive Folder
                        </a>
                      ) : (
                        <span className="text-sm text-white/40">Not configured</span>
                      )}
                    </div>

                    <div className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Image className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-white/60 uppercase tracking-wider">Photo Gallery</span>
                      </div>
                      {event.images && (Array.isArray(event.images) ? event.images.length > 0 : event.images.length > 0) ? (
                        <span className="text-sm text-blue-400">
                          {Array.isArray(event.images) ? event.images.length : event.images.split(',').length} photos
                        </span>
                      ) : (
                        <span className="text-sm text-white/40">No photos</span>
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  {(event.galleryDriveLink || event.images) && (
                    <div className="p-3 bg-vortex-blue/5 rounded-lg border border-vortex-blue/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-vortex-blue" />
                        <span className="text-xs text-vortex-blue uppercase tracking-wider font-bold">
                          Visible in Events Section
                        </span>
                      </div>
                      <div className="text-xs text-white/60">
                        Users can access this gallery from the Past Events section
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Delete Confirmation */}
              {deleteConfirm === event._id && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Trash2 className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-red-400 font-bold">Delete Event</div>
                      <div className="text-white/60 text-sm">This action cannot be undone. All registrations and data will be permanently deleted.</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Yes, Delete Event
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="bg-white/10 text-white/70 py-2 px-4 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastEventsManager;