import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, X, User, Mail, GraduationCap, CreditCard, Plus } from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import PaymentFlow from '../components/PaymentFlow';

const Contests = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeContestTab, setActiveContestTab] = useState('overview');
  const [regData, setRegData] = useState({
    teamName: '',
    members: [{
      name: '',
      email: '',
      studentId: '',
      college: '',
      phone: '',
      department: '',
      year: '',
      state: '',
      city: '',
      age: ''
    }]
  });
  const [submitting, setSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [showingPayment, setShowingPayment] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [currentRegistrationIndex, setCurrentRegistrationIndex] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log('🔄 Fetching events from API...');
      const res = await fetch(`${API_BASE_URL}/api/events`);
      const data = await res.json();
      console.log('📊 Raw API response:', data);

      // Filter upcoming events and sort by date
      const now = new Date();
      console.log('🕐 Current date for filtering:', now);

      const upcoming = data.filter(e => {
        if (e.status === 'draft' || e.status === 'completed') return false;

        const eventDate = new Date(e.date);
        const eventEnd = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 23, 59, 59);

        if (e.endTime) {
          const [h, m] = e.endTime.split(':');
          eventEnd.setHours(parseInt(h), parseInt(m), 0);
        }

        const isUpcoming = now <= eventEnd;
        console.log(`📅 Event: ${e.title}, Date: ${eventDate}, Is Upcoming: ${isUpcoming}`);
        return isUpcoming;
      }).sort((a, b) => new Date(a.date) - new Date(b.date));

      console.log('🔮 Filtered upcoming events:', upcoming);
      setEvents(upcoming);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching events:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedEvent) {
      setRegData({
        teamName: '',
        members: [{
          name: '',
          email: '',
          studentId: '',
          college: '',
          phone: '',
          department: '',
          year: '',
          state: '',
          city: '',
          age: ''
        }]
      });
      setActiveContestTab('overview');
    }
  }, [selectedEvent]);

  const addMember = () => {
    const maxSize = selectedEvent.registrationType === 'Solo' ? 1
      : (selectedEvent.registrationType === 'Duo' ? 2
        : (selectedEvent.maxTeamSize || 1));

    if (regData.members.length < maxSize) {
      setRegData({
        ...regData,
        members: [...regData.members, {
          name: '', email: '', studentId: '', college: '', phone: '',
          department: '', year: '', state: '', city: '', age: ''
        }]
      });
    }
  };

  const removeMember = (index) => {
    if (regData.members.length > 1) {
      const newMembers = regData.members.filter((_, i) => i !== index);
      setRegData({ ...regData, members: newMembers });
    }
  };

  const updateMember = (index, field, value) => {
    const newMembers = [...regData.members];
    newMembers[index][field] = value;
    setRegData({ ...regData, members: newMembers });
  };

  const handleRegister = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Check minimum team size
    const minSize = selectedEvent.registrationType === 'Solo' ? 1
      : (selectedEvent.registrationType === 'Duo' ? 2
        : (selectedEvent.minTeamSize || 1));

    if (regData.members.length < minSize) {
      alert(`This event requires at least ${minSize} members.`);
      return;
    }

    setSubmitting(true);
    try {
      const registrationData = {
        teamName: regData.teamName,
        country: 'India',
        institutionName: regData.members[0].college,
        department: regData.members[0].department,
        yearOfStudy: regData.members[0].year,
        members: regData.members,
        paid: false,
        paymentId: ''
      };

      const res = await fetch(`${API_BASE_URL}/api/events/${selectedEvent._id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // If it's a paid contest, show the payment flow
      if (selectedEvent.price > 0 && !showingPayment) {
        try {
          const payInfoRes = await fetch(`${API_BASE_URL}/api/events/${selectedEvent._id}/payment-info`);
          const payInfoData = await payInfoRes.json();
          setPaymentInfo(payInfoData);
          setCurrentRegistrationIndex(data.registrationIndex);
          setShowingPayment(true);
          setSubmitting(false);
        } catch (err) {
          console.error('Failed to fetch payment info:', err);
          setRegSuccess(true);
          setSubmitting(false);
        }
      } else {
        setRegSuccess(true);
        setSubmitting(false);
        setTimeout(() => {
          setRegSuccess(false);
          setShowingPayment(false);
          setSelectedEvent(null);
          setRegData({
            teamName: '',
            members: [{
              name: '', email: '', studentId: '', college: '', phone: '',
              department: '', year: '', state: '', city: '', age: ''
            }]
          });
          fetchEvents();
        }, 3000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert(err.message || 'Registration failed. Please try again.');
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            <span className="gradient-text">UPCOMING EVENTS</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Challenge yourself and showcase your skills in our upcoming hackathons,
            coding competitions, workshops, and technical events.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center text-white/50 text-xl">Loading upcoming events...</div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {events.length > 0 ? (
              events.map((event) => (
                <motion.div
                  key={event._id}
                  variants={itemVariants}
                  className="glass-card overflow-hidden group hover:scale-105 transition-transform duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-vortex-blue/20 to-purple-500/20 relative p-6 flex flex-col justify-end">
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                      UPCOMING
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-white/70 text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-vortex-blue" />
                        {new Date(event.date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center text-white/70 text-sm">
                        <Clock className="h-4 w-4 mr-2 text-vortex-orange" />
                        {event.startTime ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}` : 'Time TBA'}
                      </div>
                      <div className="flex items-center text-white/70 text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-green-400" />
                        {event.location || 'Venue TBA'}
                      </div>
                    </div>

                    {/* Event Stats */}
                    <div className="flex justify-between items-center mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-white/40">Price</span>
                        <span className="text-vortex-blue font-bold">{event.price > 0 ? `₹${event.price}` : 'FREE'}</span>
                      </div>
                      <div className="flex flex-col text-center">
                        <span className="text-[10px] uppercase text-white/40">Registered</span>
                        <span className="text-white font-bold">{event.registrationCount || 0}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] uppercase text-white/40">Spots Left</span>
                        <span className={`${event.capacity > 0 && (event.capacity - (event.registrationCount || 0)) <= 5 ? 'text-vortex-orange' : 'text-white'} font-bold`}>
                          {event.capacity > 0 ? Math.max(0, event.capacity - (event.registrationCount || 0)) : '∞'}
                        </span>
                      </div>
                    </div>

                    <p className="text-white/60 text-sm mb-6 line-clamp-3">
                      {event.description}
                    </p>
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full glass-button font-bold py-3 transition-colors ${event.capacity > 0 && event.registrationCount >= event.capacity
                        ? 'text-vortex-orange border border-vortex-orange/30 hover:bg-vortex-orange hover:text-black'
                        : 'text-vortex-blue border border-vortex-blue/30 hover:bg-vortex-blue hover:text-black'
                        }`}
                    >
                      {event.capacity > 0 && event.registrationCount >= event.capacity ? 'JOIN WAITLIST' : 'REGISTER NOW'}
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 glass-card">
                <h3 className="text-2xl font-bold text-white mb-2">No Events Scheduled</h3>
                <p className="text-white/60">Check back later for upcoming events and contests!</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setSelectedEvent(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl glass-card p-8 border-t-4 border-vortex-blue max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X size={24} />
              </button>

              {regSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
                  <p className="text-white/60">See you at {selectedEvent.title}.</p>
                  <div className="mt-4 p-3 bg-white/5 rounded-lg text-xs text-white/50">
                    <div>📅 {new Date(selectedEvent.date).toLocaleDateString()}</div>
                    <div>🕐 {selectedEvent.startTime}</div>
                    <div>📍 {selectedEvent.location}</div>
                  </div>
                </div>
              ) : showingPayment ? (
                <PaymentFlow
                  eventId={selectedEvent._id}
                  eventTitle={selectedEvent.title}
                  amount={selectedEvent.price}
                  paymentInfo={paymentInfo}
                  userEmail={regData.members[0].email}
                  onComplete={() => {
                    setShowingPayment(false);
                    setRegSuccess(true);
                    setTimeout(() => {
                      setRegSuccess(false);
                      setSelectedEvent(null);
                      setRegData({
                        teamName: '',
                        members: [{
                          name: '', email: '', studentId: '', college: '', phone: '',
                          department: '', year: '', state: '', city: '', age: ''
                        }]
                      });
                      fetchEvents();
                    }, 3000);
                  }}
                  onCancel={() => setShowingPayment(false)}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Event Information */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Event Information</h2>
                      <p className="text-vortex-blue mb-2 font-medium">{selectedEvent.title}</p>
                    </div>

                    {/* Event Details Tabs */}
                    <div>
                      <div className="flex bg-white/5 p-1 rounded-xl overflow-x-auto scrollbar-hide mb-4">
                        {['overview', 'fees', 'rules', 'prizes'].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveContestTab(tab)}
                            className={`px-3 py-2 rounded-lg font-medium capitalize transition-all whitespace-nowrap text-xs ${activeContestTab === tab ? 'bg-vortex-blue text-black shadow-lg' : 'text-white/70 hover:text-white'
                              }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 h-64 overflow-y-auto custom-scrollbar">
                        {activeContestTab === 'overview' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-white/40 uppercase tracking-wider block">Date & Time</span>
                                <div className="text-white font-medium">{new Date(selectedEvent.date).toLocaleDateString()}</div>
                                <div className="text-white/70">{selectedEvent.startTime || 'TBA'}</div>
                              </div>
                              <div>
                                <span className="text-white/40 uppercase tracking-wider block">Location</span>
                                <div className="text-white font-medium">{selectedEvent.location || 'TBA'}</div>
                              </div>
                              <div>
                                <span className="text-white/40 uppercase tracking-wider block">Type</span>
                                <div className="text-white font-medium">{selectedEvent.eventType}</div>
                              </div>
                              <div>
                                <span className="text-white/40 uppercase tracking-wider block">Category</span>
                                <div className="text-white font-medium">{selectedEvent.category}</div>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-white/10">
                              <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Description</span>
                              <p className="text-white/70 text-sm leading-relaxed">{selectedEvent.description}</p>
                            </div>

                            {/* Team Size Info */}
                            <div className="pt-3 border-t border-white/10">
                              <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Participation</span>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] bg-vortex-blue/10 text-vortex-blue px-2 py-1 rounded-full border border-vortex-blue/20 font-bold">
                                  {selectedEvent.registrationType}
                                </span>
                                {selectedEvent.registrationType === 'Team' && (
                                  <span className="text-[10px] bg-white/5 text-white/60 px-2 py-1 rounded-full border border-white/10 font-bold">
                                    {selectedEvent.minTeamSize === selectedEvent.maxTeamSize
                                      ? `${selectedEvent.maxTeamSize} Members`
                                      : `${selectedEvent.minTeamSize}-${selectedEvent.maxTeamSize} Members`}
                                  </span>
                                )}
                                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded-full border border-green-500/20 font-bold">
                                  {selectedEvent.capacity > 0 ? `${selectedEvent.capacity} Spots` : 'Unlimited'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeContestTab === 'fees' && (
                          <div className="space-y-4">
                            {selectedEvent.price > 0 ? (
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-white/70">Registration Fee</span>
                                  <span className="text-white font-bold">₹{selectedEvent.price}</span>
                                </div>

                                {selectedEvent.gstEnabled && (
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/50">GST ({selectedEvent.gstPercent}%)</span>
                                    <span className="text-white/70">₹{Math.round(selectedEvent.price * (selectedEvent.gstPercent / 100))}</span>
                                  </div>
                                )}

                                <div className="border-t border-white/10 pt-2 flex justify-between items-center font-bold">
                                  <span className="text-white">Total</span>
                                  <span className="text-green-400 text-lg">
                                    ₹{selectedEvent.gstEnabled ?
                                      Math.round(selectedEvent.price * (1 + selectedEvent.gstPercent / 100)) :
                                      selectedEvent.price}
                                  </span>
                                </div>

                                {/* Payment Methods */}
                                <div className="pt-3 border-t border-white/10">
                                  <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Payment Options</span>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedEvent.paymentGateway === 'UPI' && (
                                      <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full">UPI</span>
                                    )}
                                    {selectedEvent.paymentGateway === 'Razorpay' && (
                                      <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full">Online</span>
                                    )}
                                    {(selectedEvent.paymentGateway === 'Offline' || selectedEvent.paymentGateway === 'Mixed') && (
                                      <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full">Offline</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <div className="text-green-400 text-4xl mb-2">🎉</div>
                                <div className="text-green-400 font-bold text-lg">FREE EVENT</div>
                                <div className="text-white/60 text-sm">No registration fee required</div>
                              </div>
                            )}
                          </div>
                        )}

                        {activeContestTab === 'rules' && (
                          <div className="space-y-4">
                            {selectedEvent.rules ? (
                              <div>
                                <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Event Rules</span>
                                <div className="text-white/70 text-xs whitespace-pre-line leading-relaxed">
                                  {selectedEvent.rules}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <div className="text-white/20 text-4xl mb-2">📋</div>
                                <div className="text-white/40 text-sm">Rules will be shared before the event</div>
                              </div>
                            )}

                            {/* Required Documents */}
                            {selectedEvent.eligibility?.requiredDocs?.length > 0 && (
                              <div className="pt-3 border-t border-white/10">
                                <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Required Documents</span>
                                <div className="flex flex-wrap gap-2">
                                  {selectedEvent.eligibility.requiredDocs.map(doc => (
                                    <span key={doc} className="text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20">
                                      {doc}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {activeContestTab === 'prizes' && (
                          <div className="space-y-4">
                            {selectedEvent.prizes?.length > 0 ? (
                              <div>
                                <span className="text-white/40 uppercase tracking-wider text-xs block mb-3">Prize Pool</span>
                                <div className="space-y-3">
                                  {selectedEvent.prizes.map((prize, idx) => (
                                    <div key={idx} className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="text-yellow-400 font-bold text-sm">{prize.position}</span>
                                            {prize.trophy && <span className="text-[10px]">🏆</span>}
                                          </div>
                                          <div className="text-white/70 text-xs mt-1">{prize.description}</div>
                                        </div>
                                        {prize.cashAmount > 0 && (
                                          <span className="text-green-400 text-sm font-bold ml-2">₹{prize.cashAmount}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <div className="text-white/20 text-4xl mb-2">🏆</div>
                                <div className="text-white/40 text-sm">Prize details coming soon</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Registration Form */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Register Now</h3>

                      {/* Capacity Warning */}
                      {selectedEvent.capacity > 0 && selectedEvent.registrationCount >= selectedEvent.capacity && (
                        <div className="mb-4 p-3 bg-vortex-orange/10 border border-vortex-orange/30 rounded-lg">
                          <div className="text-vortex-orange text-xs font-bold uppercase tracking-wider mb-1">Waitlist Registration</div>
                          <p className="text-white/70 text-xs">Event is full. You'll be added to the waitlist and notified if a spot opens.</p>
                        </div>
                      )}

                      {/* Eligibility Check */}
                      {selectedEvent.eligibility?.participants?.length > 0 && (
                        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <div className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">Eligibility</div>
                          <div className="flex flex-wrap gap-1">
                            {selectedEvent.eligibility.participants.map(p => (
                              <span key={p} className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
                        {regData.members.map((member, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black bg-vortex-blue text-black px-2 py-0.5 rounded shrink-0">
                                MEMBER {idx + 1} {idx === 0 && '(LEAD)'}
                              </span>
                              {idx === 0 && (selectedEvent.registrationType === 'Team' || selectedEvent.registrationType === 'Duo') && (
                                <div className="flex-1 ml-4 border-l-2 border-vortex-blue/20 pl-4 py-1">
                                  <label className="block text-[8px] font-black text-vortex-blue uppercase tracking-widest mb-1 opacity-60">Team Identity</label>
                                  <input
                                    className="w-full bg-transparent border-b border-vortex-blue/40 focus:border-vortex-blue outline-none text-xs py-1 uppercase font-bold text-white placeholder-white/20"
                                    placeholder="ENTER TEAM NAME"
                                    value={regData.teamName}
                                    onChange={e => setRegData({ ...regData, teamName: e.target.value.toUpperCase() })}
                                    required
                                  />
                                </div>
                              )}
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => removeMember(idx)}
                                  className="text-red-400/50 hover:text-red-400 transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>

                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                              <input
                                className="w-full input-glass pl-10 p-2.5 rounded-lg text-sm"
                                placeholder="Full Name"
                                value={member.name}
                                onChange={e => updateMember(idx, 'name', e.target.value)}
                                required
                              />
                            </div>

                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                              <input
                                className="w-full input-glass pl-10 p-2.5 rounded-lg text-sm"
                                type="email"
                                placeholder="Email Address"
                                value={member.email}
                                onChange={e => updateMember(idx, 'email', e.target.value)}
                                required
                              />
                            </div>

                            <div className="relative">
                              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                              <input
                                className="w-full input-glass pl-10 p-2.5 rounded-lg text-sm"
                                placeholder="Student ID / USN (10 Digits)"
                                value={member.studentId}
                                onChange={e => updateMember(idx, 'studentId', e.target.value)}
                                minLength={10}
                                maxLength={10}
                                pattern="\d{10}"
                                title="Please enter exactly 10 digits"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <input
                                className="w-full input-glass p-2.5 rounded-lg text-sm"
                                placeholder="College"
                                value={member.college}
                                onChange={e => updateMember(idx, 'college', e.target.value)}
                                required
                              />
                              <input
                                className="w-full input-glass p-2.5 rounded-lg text-sm"
                                placeholder="Phone (10 Digits)"
                                value={member.phone}
                                onChange={e => updateMember(idx, 'phone', e.target.value)}
                                minLength={10}
                                maxLength={10}
                                pattern="\d{10}"
                                title="Please enter exactly 10 digits"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <input
                                className="w-full input-glass p-2.5 rounded-lg text-sm"
                                placeholder="Department"
                                value={member.department}
                                onChange={e => updateMember(idx, 'department', e.target.value)}
                                required
                              />
                              <input
                                className="w-full input-glass p-2.5 rounded-lg text-sm"
                                placeholder="Year of Study"
                                value={member.year}
                                onChange={e => updateMember(idx, 'year', e.target.value)}
                                required
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <input
                                className="w-full input-glass p-2.5 rounded-lg text-sm"
                                placeholder="State"
                                value={member.state}
                                onChange={e => updateMember(idx, 'state', e.target.value)}
                                required
                              />
                              <input
                                className="w-full input-glass p-2.5 rounded-lg text-sm"
                                placeholder="City"
                                value={member.city}
                                onChange={e => updateMember(idx, 'city', e.target.value)}
                                required
                              />
                            </div>

                            <input
                              className="w-full input-glass p-2.5 rounded-lg text-sm"
                              type="number"
                              placeholder="Age"
                              value={member.age}
                              onChange={e => updateMember(idx, 'age', e.target.value)}
                              min={selectedEvent.eligibility?.minAge || 1}
                              max={selectedEvent.eligibility?.maxAge || 100}
                              required
                            />
                          </motion.div>
                        ))}

                        {/* Add Member Button */}
                        {regData.members.length < (selectedEvent.registrationType === 'Solo' ? 1 : (selectedEvent.registrationType === 'Duo' ? 2 : (selectedEvent.maxTeamSize || 1))) && (
                          <button
                            type="button"
                            onClick={addMember}
                            className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:border-vortex-blue/30 hover:text-vortex-blue transition-all flex items-center justify-center gap-2 group"
                          >
                            <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                            Add Team Member ({regData.members.length}/{(selectedEvent.registrationType === 'Solo' ? 1 : (selectedEvent.registrationType === 'Duo' ? 2 : (selectedEvent.maxTeamSize || 1)))})
                          </button>
                        )}
                      </div>

                      {/* Intra-college validation */}
                      {selectedEvent.eventType === 'Intra-College' && selectedEvent.allowedCollege && (
                        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                          <div className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">Intra-College Event</div>
                          <p className="text-white/70 text-xs">Only students from <strong>{selectedEvent.allowedCollege}</strong> can participate</p>
                        </div>
                      )}

                      {/* Conditional Fee and Submit Button based on Min Team Size */}
                      {(() => {
                        const minSize = selectedEvent.registrationType === 'Solo' ? 1
                          : (selectedEvent.registrationType === 'Duo' ? 2
                            : (selectedEvent.minTeamSize || 1));

                        if (regData.members.length >= minSize) {
                          return (
                            <>
                              {/* Fee breakdown for paid events */}
                              {selectedEvent.price > 0 && (
                                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                  <div className="text-green-400 text-xs font-bold uppercase tracking-wider mb-2">Fee Details</div>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-white/70">Registration Fee</span>
                                      <span className="text-white">₹{selectedEvent.price}</span>
                                    </div>
                                    {selectedEvent.gstEnabled && (
                                      <div className="flex justify-between">
                                        <span className="text-white/70">GST ({selectedEvent.gstPercent}%)</span>
                                        <span className="text-white">₹{Math.round(selectedEvent.price * (selectedEvent.gstPercent / 100))}</span>
                                      </div>
                                    )}
                                    <div className="border-t border-white/10 pt-1 flex justify-between font-bold">
                                      <span className="text-white">Total</span>
                                      <span className="text-green-400">
                                        ₹{selectedEvent.gstEnabled ?
                                          Math.round(selectedEvent.price * (1 + selectedEvent.gstPercent / 100)) :
                                          selectedEvent.price}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full glass-button font-bold py-3 mt-4 disabled:opacity-50 ${selectedEvent.capacity > 0 && selectedEvent.registrationCount >= selectedEvent.capacity
                                  ? 'bg-vortex-orange text-black'
                                  : 'bg-vortex-blue text-black'
                                  }`}
                              >
                                {submitting ? 'PROCESSING...' : (
                                  selectedEvent.capacity > 0 && selectedEvent.registrationCount >= selectedEvent.capacity
                                    ? 'JOIN WAITLIST'
                                    : (selectedEvent.price > 0 ? 'PROCEED TO PAYMENT' : 'CONFIRM REGISTRATION')
                                )}
                              </button>
                            </>
                          );
                        } else {
                          return (
                            <div className="p-4 bg-vortex-blue/5 border border-dashed border-vortex-blue/20 rounded-xl text-center">
                              <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">
                                Add {minSize - regData.members.length} more member{minSize - regData.members.length > 1 ? 's' : ''} to proceed
                              </p>
                            </div>
                          );
                        }
                      })()}

                      <p className="text-[10px] text-white/30 text-center uppercase tracking-widest mt-2">
                        By registering, you agree to participate in the event at the scheduled time.
                      </p>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contests;