import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ArrowRight, ChevronLeft, ChevronRight, Trophy, Code, Key, Gamepad2, X, AlertCircle, Mail, Plus, CreditCard } from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import PaymentFlow from '../components/PaymentFlow';

const Events = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedSubEvent, setSelectedSubEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventGallery, setSelectedEventGallery] = useState(null);
  const [rsvpEvent, setRsvpEvent] = useState(null);
  const [activeInfoTab, setActiveInfoTab] = useState('details');
  const [showingPayment, setShowingPayment] = useState(false);
  const [currentRegistrationIndex, setCurrentRegistrationIndex] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [rsvpForm, setRsvpForm] = useState({
    teamName: '',
    country: 'India',
    institutionName: '',
    department: '',
    yearOfStudy: '',
    members: [{
      name: '',
      email: '',
      phone: '',
      college: '',
      idNumber: '',
      department: '',
      year: '',
      age: '',
      state: '',
      city: ''
    }],
    couponCode: '',
    appliedCoupon: null,
    paid: false,
    paymentId: '',
    paymentStep: false
  });
  const [rsvpStatus, setRsvpStatus] = useState({ loading: false, message: '', type: '' });
  const [feedbackEvent, setFeedbackEvent] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ studentId: '', name: '', rating: 5, comment: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!rsvpEvent) {
      setRsvpForm({
        teamName: '',
        country: 'India',
        institutionName: '',
        department: '',
        yearOfStudy: '',
        members: [{
          name: '',
          email: '',
          phone: '',
          college: '',
          idNumber: '',
          department: '',
          year: '',
          age: '',
          state: '',
          city: ''
        }],
        couponCode: '',
        appliedCoupon: null,
        paid: false,
        paymentId: '',
        paymentStep: false
      });
      setActiveInfoTab('details');
      setRsvpStatus({ loading: false, message: '', type: '' });
    }
  }, [rsvpEvent]);

  const fetchEvents = () => {
    fetch(`${API_BASE_URL}/api/events`)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching events:', err);
        setLoading(false);
      });
  };

  const handleRsvpSubmit = async (e, forceData = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setRsvpStatus({ loading: true, message: rsvpEvent.price > 0 && !forceData ? 'PREPARING PAYMENT...' : 'REGISTERING...', type: '' });

    const submitData = forceData ? { ...rsvpForm, ...forceData } : rsvpForm;

    // Check minimum team size
    const minSize = rsvpEvent.registrationType === 'Solo' ? 1 : (rsvpEvent.registrationType === 'Duo' ? 2 : (rsvpEvent.minTeamSize || 1));
    if (submitData.members.length < minSize) {
      setRsvpStatus({ loading: false, message: `This event requires at least ${minSize} members.`, type: 'error' });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${rsvpEvent._id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      const data = await res.json();
      if (res.ok) {
        // If it's a paid event and we haven't shown the payment flow yet
        if (rsvpEvent.price > 0 && !forceData && !showingPayment) {
          try {
            const payInfoRes = await fetch(`${API_BASE_URL}/api/events/${rsvpEvent._id}/payment-info`);
            const payInfoData = await payInfoRes.json();

            setPaymentInfo(payInfoData);
            setCurrentRegistrationIndex(data.registrationIndex);
            setShowingPayment(true);
            setRsvpStatus({ loading: false, message: '', type: '' });
          } catch (err) {
            console.error('Failed to fetch payment info:', err);
            setRsvpStatus({ loading: false, message: 'Registration successful! Please contact admin for payment.', type: 'success' });
            // Close after delay if failed to load payment info but registration succeeded
            setTimeout(() => setRsvpEvent(null), 3000);
          }
        } else {
          setRsvpStatus({ loading: false, message: data.message || 'Registration Successful!', type: 'success' });
          setTimeout(() => {
            setRsvpEvent(null);
            setShowingPayment(false);
            setRsvpStatus({ loading: false, message: '', type: '' });
            setRsvpForm({
              teamName: '',
              country: 'India',
              institutionName: '',
              department: '',
              yearOfStudy: '',
              members: [{
                name: '',
                email: '',
                phone: '',
                college: '',
                idNumber: '',
                department: '',
                year: '',
                age: '',
                state: '',
                city: ''
              }],
              couponCode: '',
              appliedCoupon: null,
              paid: false,
              paymentId: '',
              paymentStep: false
            });
            fetchEvents();
          }, 2500);
        }
      } else {
        setRsvpStatus({ loading: false, message: data.message, type: 'error' });
      }
    } catch (err) {
      setRsvpStatus({ loading: false, message: 'Failed to register', type: 'error' });
    }
  };

  const addMember = () => {
    const max = rsvpEvent.registrationType === 'Solo' ? 1 : (rsvpEvent.registrationType === 'Duo' ? 2 : (rsvpEvent.maxTeamSize || 1));
    if (rsvpForm.members.length < max) {
      setRsvpForm({
        ...rsvpForm,
        members: [...rsvpForm.members, {
          name: '',
          email: '',
          phone: '',
          college: '',
          idNumber: '',
          department: '',
          year: '',
          age: '',
          state: '',
          city: ''
        }]
      });
    }
  };

  const removeMember = (index) => {
    if (rsvpForm.members.length > 1) {
      const newMembers = rsvpForm.members.filter((_, i) => i !== index);
      setRsvpForm({ ...rsvpForm, members: newMembers });
    }
  };

  const updateMember = (index, field, value) => {
    const newMembers = [...rsvpForm.members];
    newMembers[index][field] = value;
    setRsvpForm({ ...rsvpForm, members: newMembers });
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${feedbackEvent._id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackForm)
      });
      if (res.ok) {
        alert('Thank you for your feedback!');
        setFeedbackEvent(null);
        setFeedbackForm({ studentId: '', name: '', rating: 5, comment: '' });
      }
    } catch (err) {
      alert('Failed to submit feedback');
    }
  };

  const addToCalendar = (event) => {
    if (!event.date || !event.startTime) {
      alert('Event date and time information is incomplete');
      return;
    }

    try {
      const startDateTime = new Date(`${event.date.split('T')[0]}T${event.startTime}`);
      const endDateTime = event.endTime
        ? new Date(`${event.date.split('T')[0]}T${event.endTime}`)
        : new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

      const start = startDateTime.toISOString().replace(/-|:|\.\d\d\d/g, "");
      const end = endDateTime.toISOString().replace(/-|:|\.\d\d\d/g, "");

      const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&dates=${start}/${end}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error creating calendar link:', error);
      alert('Error creating calendar link. Please check event details.');
    }
  };


  const prayogSubEvents = [
    {
      id: 1,
      title: 'Champions League',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      description: 'A competitive segment that brought together teams to test their technical prowess, teamwork, and strategic thinking in a curated set of challenges.',
      details: 'Champions League: A competitive segment that brought together teams to test their technical prowess, teamwork, and strategic thinking in a curated set of challenges. Teams competed across multiple rounds showcasing their problem-solving abilities and collaboration skills.',
      duration: 'Full Day',
      participants: 'Multiple Teams',
    },
    {
      id: 2,
      title: 'Hackathon',
      icon: Code,
      color: 'from-vortex-blue to-cyan-400',
      description: 'This marathon programming event encouraged students to tackle real-world problems by developing creative solutions over a focused time period.',
      details: 'Hackathon: This marathon programming event encouraged students to tackle real-world problems by developing creative solutions over a focused time period. Teams presented their project ideas, built prototypes, and were assessed on innovation, implementation, and impact.',
      duration: 'Marathon Session',
      participants: 'Developer Teams',
    },
    {
      id: 3,
      title: 'Cicada',
      icon: Key,
      color: 'from-purple-500 to-pink-500',
      description: 'This ideation contest challenged participants to pitch unique concepts or startup ideas, aiming to inspire creativity and entrepreneurial thinking.',
      details: 'Cicada: This ideation contest challenged participants to pitch unique concepts or startup ideas, aiming to inspire creativity and entrepreneurial thinking within the student body. Participants presented innovative solutions and business models, judged on creativity, feasibility, and potential impact.',
      duration: 'Full Day',
      participants: 'Aspiring Entrepreneurs',
    },
    {
      id: 4,
      title: 'Gameathon',
      icon: Gamepad2,
      color: 'from-red-500 to-vortex-orange',
      description: 'A gaming event that tested logic, skill, and strategic planning in a fun, competitive environment, bringing gamers together for an unforgettable experience.',
      details: 'Gameathon: A gaming event that tested logic, skill, and strategic planning in a fun, competitive environment. Participants engaged in various gaming challenges that combined entertainment with strategic thinking.',
      duration: 'Full Day',
      participants: 'Gaming Enthusiasts',
    },
  ];

  const now = new Date();

  // Filter for displayable events (not drafts)
  const displayableEvents = events.filter(e => e.status !== 'draft');

  const upcomingEvents = displayableEvents.filter(e => {
    if (e.status === 'completed') return false;

    const eventDate = new Date(e.date);
    const eventEnd = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 23, 59, 59);

    if (e.endTime) {
      const [h, m] = e.endTime.split(':');
      eventEnd.setHours(parseInt(h), parseInt(m), 0);
    }

    return now <= eventEnd;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastEvents = displayableEvents.filter(e => {
    if (e.status === 'completed') return true;

    const eventDate = new Date(e.date);
    const eventEnd = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 23, 59, 59);

    if (e.endTime) {
      const [h, m] = e.endTime.split(':');
      eventEnd.setHours(parseInt(h), parseInt(m), 0);
    }

    return now > eventEnd;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));


  const nextSlide = () => {
    if (pastEvents.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % pastEvents.length);
  };

  const prevSlide = () => {
    if (pastEvents.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + pastEvents.length) % pastEvents.length);
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            <span className="gradient-text">EVENTS</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            We are excited to conduct innovative events, hackathons, and tech competitions in upcoming sessions. Stay tuned for announcements!
          </p>
        </motion.div>

        {/* PRAYOG 1.0 Section */}
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl glass-card p-8 md:p-12 mb-12"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-vortex-blue/10 via-transparent to-vortex-orange/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-vortex-blue/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-vortex-orange/20 to-transparent rounded-full blur-3xl"></div>

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >

                <h2 className="text-5xl md:text-7xl font-orbitron font-bold mb-4 tracking-wider">
                  <span className="gradient-text">PRAYOG 1.0</span>
                </h2>
                <div className="text-lg text-white/60 mb-8 flex flex-col md:flex-row items-center justify-center gap-2">
                  <span className="px-3 py-1 glass-card rounded-full text-sm font-medium">March 25, 2025</span>
                  <span className="px-3 py-1 glass-card rounded-full text-sm font-medium">Navkis College of Engineering</span>
                </div>
                <div className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed space-y-6 text-justify">
                  <p>
                    Prayog 1.0 was a flagship technical event organized by Team Vortex at Navkis College of Engineering, Hassan, held on 25th March 2025. Designed to foster innovation, collaboration, and tech-oriented problem-solving, Prayog 1.0 showcased the club's commitment to hands-on learning and student engagement through its four key sub-events.
                  </p>
                  <p>
                    The event drew over 150 participants, reflecting strong interest across disciplines. Prayog 1.0 not only provided a platform for skill development and networking but also celebrated the diversity and enthusiasm of the tech community at Navkis College of Engineering. The success and energetic response to Prayog 1.0 have laid a strong foundation for it to become a recurring highlight in the annual calendar of Team Vortex.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Sub-Events Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-3xl font-display font-bold text-center mb-12">
              <span className="gradient-text">Featured Events</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {prayogSubEvents.map((event, index) => {
                const IconComponent = event.icon;
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="glass-card-hover p-6 text-center group cursor-pointer"
                    onClick={() => setSelectedSubEvent(event)}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${event.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>

                    <h4 className="text-xl font-bold text-white mb-3 group-hover:text-vortex-blue transition-colors">
                      {event.title}
                    </h4>

                    <p className="text-white/70 text-sm mb-6 leading-relaxed">
                      {event.description}
                    </p>

                    <button className="glass-button text-vortex-blue border border-vortex-blue/30 hover:bg-vortex-blue hover:text-black transition-all duration-300 text-sm font-medium w-full">
                      Know More
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* Upcoming Events */}
        {(upcomingEvents.length > 0) ? (
          <section className="mb-16">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-display font-bold mb-8 text-white uppercase tracking-wider"
            >
              Upcoming Events
            </motion.h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {upcomingEvents.map((event) => (
                <motion.div
                  key={event._id}
                  variants={itemVariants}
                  className="glass-card overflow-hidden hover:bg-white/10 transition-all duration-300 group flex flex-col h-full"
                >
                  <div className="h-48 bg-gradient-to-r from-vortex-blue/30 to-vortex-orange/30 flex items-center justify-center relative">
                    <div className="text-6xl font-bold text-white/20">
                      {event.title.split(' ')[0]}
                    </div>
                    <div className="absolute top-4 right-4 bg-vortex-blue text-black px-3 py-1 rounded-full text-xs font-bold">
                      UPCOMING
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-vortex-blue transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-white/70 text-sm mb-6 flex-1">
                      {event.description}
                    </p>
                    <div className="space-y-2 mb-6 text-sm text-white/60">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-vortex-blue" />
                        {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-vortex-blue" />
                        {event.startTime ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}` : 'TBA'}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-vortex-blue" />
                        {event.location}
                      </div>
                      <div className="flex items-center justify-between mt-4 p-2 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase text-white/40">Price</span>
                          <span className="text-vortex-blue font-bold">{event.price > 0 ? `₹${event.price}` : 'FREE'}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] uppercase text-white/40">Spots Left</span>
                          <span className={`${(event.capacity - (event.registrationCount || 0)) <= 5 ? 'text-vortex-orange' : 'text-white'} font-bold`}>
                            {event.capacity > 0 ? Math.max(0, event.capacity - (event.registrationCount || 0)) : '∞'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => setRsvpEvent(event)}
                        className={`w-full glass-button ${event.capacity > 0 && event.registrationCount >= event.capacity ? 'bg-vortex-orange' : 'bg-vortex-blue'} text-black font-bold py-3 transition-colors flex items-center justify-center group/btn`}
                      >
                        {event.capacity > 0 && event.registrationCount >= event.capacity ? 'Join Waitlist' : 'Register Now'}
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                      <button
                        onClick={() => addToCalendar(event)}
                        className="w-full glass-button border border-white/10 text-white/70 py-2 text-xs hover:text-white transition-all flex items-center justify-center"
                      >
                        <Calendar className="h-3 w-3 mr-2" /> Add to Calendar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>
        ) : null}

        {/* RSVP Modal */}
        <AnimatePresence>
          {rsvpEvent && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={() => setRsvpEvent(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative glass-card p-8 max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => setRsvpEvent(null)} className="absolute top-4 right-4 text-white/40 hover:text-white">
                  <X />
                </button>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold gradient-text">{rsvpEvent.capacity > 0 && rsvpEvent.registrationCount >= rsvpEvent.capacity ? 'JOIN WAITLIST' : 'EVENT REGISTRATION'}</h3>
                  <p className="text-white/60 text-sm mt-2 font-medium uppercase tracking-widest">{rsvpEvent.title}</p>
                  <div className="flex justify-center gap-3 mt-4">
                    <span className="text-[10px] bg-vortex-blue/10 text-vortex-blue px-3 py-1 rounded-full border border-vortex-blue/20 font-bold uppercase">{rsvpEvent.registrationType} Event</span>
                    {rsvpEvent.registrationType === 'Team' && (
                      <span className="text-[10px] bg-white/5 text-white/60 px-3 py-1 rounded-full border border-white/10 font-bold">
                        {rsvpEvent.minTeamSize === rsvpEvent.maxTeamSize
                          ? `${rsvpEvent.maxTeamSize} Members`
                          : `${rsvpEvent.minTeamSize}-${rsvpEvent.maxTeamSize} Members`}
                      </span>
                    )}
                    {rsvpEvent.registrationType === 'Duo' && (
                      <span className="text-[10px] bg-white/5 text-white/60 px-3 py-1 rounded-full border border-white/10 font-bold">2 Members</span>
                    )}
                  </div>
                </div>

                {/* Event Information Tabs */}
                <div className="mb-6">
                  <div className="flex bg-white/5 p-1 rounded-xl overflow-x-auto scrollbar-hide">
                    {['details', 'fees', 'rules', 'prizes'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveInfoTab(tab)}
                        className={`px-4 py-2 rounded-lg font-medium capitalize transition-all whitespace-nowrap text-xs ${activeInfoTab === tab ? 'bg-vortex-blue text-black shadow-lg' : 'text-white/70 hover:text-white'
                          }`}
                      >
                        {tab === 'details' ? 'Event Info' : tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 max-h-48 overflow-y-auto custom-scrollbar">
                    {activeInfoTab === 'details' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-white/40 uppercase tracking-wider block">Date & Time</span>
                            <div className="text-white font-medium">{new Date(rsvpEvent.date).toLocaleDateString()}</div>
                            <div className="text-white/70">{rsvpEvent.startTime}{rsvpEvent.endTime ? ` - ${rsvpEvent.endTime}` : ''}</div>
                          </div>
                          <div>
                            <span className="text-white/40 uppercase tracking-wider block">Location</span>
                            <div className="text-white font-medium">{rsvpEvent.location}</div>
                          </div>
                          <div>
                            <span className="text-white/40 uppercase tracking-wider block">Category</span>
                            <div className="text-white font-medium">{rsvpEvent.category}</div>
                          </div>
                          <div>
                            <span className="text-white/40 uppercase tracking-wider block">Capacity</span>
                            <div className="text-white font-medium">{rsvpEvent.capacity || 'Unlimited'}</div>
                          </div>
                        </div>

                        {/* Eligibility */}
                        {rsvpEvent.eligibility?.participants?.length > 0 && (
                          <div className="pt-3 border-t border-white/10">
                            <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Eligibility</span>
                            <div className="flex flex-wrap gap-2">
                              {rsvpEvent.eligibility.participants.map(p => (
                                <span key={p} className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded-full border border-green-500/20">
                                  {p}
                                </span>
                              ))}
                            </div>
                            {(rsvpEvent.eligibility.minAge || rsvpEvent.eligibility.maxAge) && (
                              <div className="text-xs text-white/60 mt-2">
                                Age: {rsvpEvent.eligibility.minAge || 'Any'} - {rsvpEvent.eligibility.maxAge || 'Any'} years
                              </div>
                            )}
                          </div>
                        )}

                        {/* Event Rounds */}
                        {rsvpEvent.rounds?.length > 0 && (
                          <div className="pt-3 border-t border-white/10">
                            <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Event Timeline</span>
                            <div className="space-y-2">
                              {rsvpEvent.rounds.map((round, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                  <span className="text-white/70">Round {round.roundNumber}: {round.name}</span>
                                  <span className="text-vortex-blue">{new Date(round.date).toLocaleDateString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeInfoTab === 'fees' && (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-white/70">
                              Registration Fee {rsvpEvent.teamPricing?.perTeam ? '(Per Team)' : '(Per Person)'}
                            </span>
                            <span className="text-white font-bold">₹{rsvpEvent.price}</span>
                          </div>

                          {rsvpEvent.gstEnabled && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-white/50">GST ({rsvpEvent.gstPercent}%)</span>
                              <span className="text-white/70">₹{Math.round(rsvpEvent.price * (rsvpEvent.gstPercent / 100))}</span>
                            </div>
                          )}

                          <div className="border-t border-white/10 pt-2 flex justify-between items-center font-bold">
                            <span className="text-white">Total Amount</span>
                            <span className="text-green-400 text-lg">
                              ₹{rsvpEvent.gstEnabled ?
                                Math.round(rsvpEvent.price * (1 + rsvpEvent.gstPercent / 100)) :
                                rsvpEvent.price}
                            </span>
                          </div>
                        </div>

                        {/* Early Bird Discount */}
                        {rsvpEvent.earlyBirdDiscount?.enabled && new Date() <= new Date(rsvpEvent.earlyBirdDiscount.validUntil) && (
                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">🎉 Early Bird Offer</div>
                            <div className="text-white/70 text-xs">
                              Get {rsvpEvent.earlyBirdDiscount.discountPercent}% discount until {new Date(rsvpEvent.earlyBirdDiscount.validUntil).toLocaleDateString()}
                            </div>
                            <div className="text-green-400 text-sm font-bold mt-1">
                              Save ₹{Math.round(rsvpEvent.price * (rsvpEvent.earlyBirdDiscount.discountPercent / 100))}
                            </div>
                          </div>
                        )}

                        {/* Payment Methods */}
                        <div className="pt-3 border-t border-white/10">
                          <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Payment Methods</span>
                          <div className="flex flex-wrap gap-2">
                            {rsvpEvent.paymentGateway === 'UPI' && (
                              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">UPI</span>
                            )}
                            {rsvpEvent.paymentGateway === 'Razorpay' && (
                              <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded-full border border-purple-500/20">Online Payment</span>
                            )}
                            {(rsvpEvent.paymentGateway === 'Offline' || rsvpEvent.paymentGateway === 'Mixed') && (
                              <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full border border-orange-500/20">Offline Payment</span>
                            )}
                            {rsvpEvent.paymentGateway === 'Mixed' && (
                              <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded-full border border-green-500/20">Multiple Options</span>
                            )}
                          </div>
                        </div>

                        {/* Coupon Section */}
                        {rsvpEvent.coupons?.length > 0 && (
                          <div className="pt-3 border-t border-white/10">
                            <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Available Coupons</span>
                            <div className="space-y-2">
                              {rsvpEvent.coupons.map((coupon, idx) => (
                                <div key={idx} className="p-2 bg-gradient-to-r from-vortex-blue/10 to-vortex-orange/10 rounded-lg border border-vortex-blue/20">
                                  <div className="flex justify-between items-center">
                                    <span className="text-vortex-blue font-bold text-sm">{coupon.code}</span>
                                    <span className="text-green-400 text-xs">
                                      {coupon.discountPercent ? `${coupon.discountPercent}% OFF` : `₹${coupon.flatDiscount} OFF`}
                                    </span>
                                  </div>
                                  {coupon.validUntil && (
                                    <div className="text-[10px] text-white/50 mt-1">
                                      Valid until {new Date(coupon.validUntil).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeInfoTab === 'rules' && (
                      <div className="space-y-4">
                        {rsvpEvent.rules && (
                          <div>
                            <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Event Rules</span>
                            <div className="text-white/70 text-xs whitespace-pre-line leading-relaxed">
                              {rsvpEvent.rules}
                            </div>
                          </div>
                        )}

                        {/* Required Documents */}
                        {rsvpEvent.eligibility?.requiredDocs?.length > 0 && (
                          <div className="pt-3 border-t border-white/10">
                            <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Required Documents</span>
                            <div className="flex flex-wrap gap-2">
                              {rsvpEvent.eligibility.requiredDocs.map(doc => (
                                <span key={doc} className="text-[10px] bg-red-500/10 text-red-400 px-2 py-1 rounded-full border border-red-500/20">
                                  {doc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Judging Criteria */}
                        {rsvpEvent.judgingCriteria?.length > 0 && (
                          <div className="pt-3 border-t border-white/10">
                            <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Judging Criteria</span>
                            <div className="space-y-2">
                              {rsvpEvent.judgingCriteria.map((criteria, idx) => (
                                <div key={idx} className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="text-white text-xs font-medium">{criteria.name}</div>
                                    <div className="text-white/50 text-[10px]">{criteria.description}</div>
                                  </div>
                                  <span className="text-vortex-blue text-xs font-bold ml-2">{criteria.maxPoints} pts</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeInfoTab === 'prizes' && (
                      <div className="space-y-4">
                        {rsvpEvent.prizes?.length > 0 ? (
                          <div>
                            <span className="text-white/40 uppercase tracking-wider text-xs block mb-3">Prize Pool</span>
                            <div className="space-y-3">
                              {rsvpEvent.prizes.map((prize, idx) => (
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
                            <div className="text-white/40 text-sm">Prize details will be announced soon</div>
                          </div>
                        )}

                        {/* Certificates */}
                        <div className="pt-3 border-t border-white/10">
                          <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Certificates</span>
                          <div className="flex flex-wrap gap-2">
                            {rsvpEvent.participationCertificate && (
                              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">
                                📜 Participation Certificate
                              </span>
                            )}
                            {rsvpEvent.winnerCertificate && (
                              <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/20">
                                🥇 Winner Certificate
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {rsvpStatus.message ? (
                  <div className={`p-6 rounded-2xl text-center mb-6 ${rsvpStatus.type === 'success' ? 'bg-green-500/10 border border-green-500/50 text-green-400' : 'bg-red-500/10 border border-red-500/50 text-red-400'}`}>
                    <div className="text-lg font-bold mb-2">{rsvpStatus.type === 'success' ? 'Success!' : 'Oops!'}</div>
                    {rsvpStatus.message}
                  </div>
                ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (rsvpEvent.price > 0 && !rsvpForm.paid && (rsvpEvent.capacity > 0 && rsvpEvent.registrationCount < rsvpEvent.capacity)) {
                      setRsvpStatus({ loading: true, message: 'Redirecting to Payment...', type: '' });
                      setTimeout(() => {
                        setRsvpStatus({ loading: false, message: '', type: '' });
                        setRsvpForm({ ...rsvpForm, paymentStep: true });
                      }, 1500);
                      return;
                    }
                    handleRsvpSubmit(e);
                  }} className="space-y-6 max-h-[60vh] overflow-y-auto px-2 custom-scrollbar">

                    {/* Waitlist Alert */}
                    {rsvpEvent.capacity > 0 && rsvpEvent.registrationCount >= rsvpEvent.capacity && (
                      <div className="bg-vortex-orange/10 border border-vortex-orange/50 p-4 rounded-xl flex items-start gap-3 mb-4 animate-pulse">
                        <AlertCircle className="text-vortex-orange shrink-0 mt-0.5" size={18} />
                        <div>
                          <div className="text-vortex-orange font-bold text-xs uppercase tracking-wider">Waitlist Active</div>
                          <p className="text-white/60 text-[11px] leading-tight mt-0.5">This event is at full capacity. You will be registered in the queue and notified if a spot opens up.</p>
                        </div>
                      </div>
                    )}

                    {!rsvpForm.paymentStep ? (
                      <>
                        <div className="space-y-6">
                          {/* Team Details (if applicable) */}
                          {(rsvpEvent.registrationType === 'Team' || rsvpEvent.registrationType === 'Duo') && (
                            <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-vortex-blue ml-1">Team Details</h4>
                              <div className="relative">
                                <input
                                  type="text" placeholder="TEAM NAME" className="w-full input-glass p-3 pl-10 rounded-lg text-sm text-white" required
                                  value={rsvpForm.teamName} onChange={e => setRsvpForm({ ...rsvpForm, teamName: e.target.value })}
                                />
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                              </div>
                            </div>
                          )}

                          {/* Country Selection */}
                          <div className="space-y-2 px-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-vortex-blue ml-1">Country Name *</label>
                            <select
                              className="w-full input-glass p-3 rounded-lg text-sm bg-black/40 outline-none border border-white/10 text-white"
                              value={rsvpForm.country}
                              onChange={e => setRsvpForm({ ...rsvpForm, country: e.target.value })}
                              required
                            >
                              <option value="India">India</option>
                              <option value="USA">USA</option>
                              <option value="UK">UK</option>
                              <option value="Canada">Canada</option>
                              <option value="Australia">Australia</option>
                              <option value="Germany">Germany</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          {/* College/Institution Verification */}
                          <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-vortex-blue ml-1">Institution Details</h4>

                            {/* Event Type Specific Validation */}
                            {rsvpEvent.eventType === 'Intra-College' && rsvpEvent.allowedCollege && (
                              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                                <div className="text-orange-400 text-[10px] font-black uppercase tracking-wider mb-1">Intra-College Event</div>
                                <p className="text-white/70 text-xs">Only students from <strong>{rsvpEvent.allowedCollege}</strong> can participate</p>
                              </div>
                            )}

                            <div className="grid grid-cols-1 gap-4">
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="COLLEGE / INSTITUTION NAME"
                                  className="w-full bg-transparent border-b border-white/10 p-3 text-sm focus:border-vortex-blue outline-none transition-colors text-white"
                                  required
                                  value={rsvpForm.institutionName || ''}
                                  onChange={e => setRsvpForm({ ...rsvpForm, institutionName: e.target.value })}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <input
                                  type="text"
                                  placeholder="DEPARTMENT"
                                  className="w-full bg-transparent border-b border-white/10 p-3 text-sm focus:border-vortex-blue outline-none transition-colors text-white"
                                  value={rsvpForm.department || ''}
                                  onChange={e => setRsvpForm({ ...rsvpForm, department: e.target.value })}
                                />
                                <input
                                  type="text"
                                  placeholder="YEAR OF STUDY"
                                  className="w-full bg-transparent border-b border-white/10 p-3 text-sm focus:border-vortex-blue outline-none transition-colors text-white"
                                  value={rsvpForm.yearOfStudy || ''}
                                  onChange={e => setRsvpForm({ ...rsvpForm, yearOfStudy: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Fee Information Display */}
                          {rsvpEvent.price > 0 && (
                            <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl border border-green-500/20">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400 ml-1 mb-3">Fee Structure</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-white/70 text-sm">
                                    {rsvpEvent.teamPricing?.perTeam ? 'Per Team' : 'Per Person'}
                                  </span>
                                  <span className="text-white font-bold">₹{rsvpEvent.price}</span>
                                </div>

                                {rsvpEvent.gstEnabled && (
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/50">GST ({rsvpEvent.gstPercent}%)</span>
                                    <span className="text-white/70">₹{Math.round(rsvpEvent.price * (rsvpEvent.gstPercent / 100))}</span>
                                  </div>
                                )}

                                <div className="border-t border-white/10 pt-2 flex justify-between items-center font-bold">
                                  <span className="text-white">Total Amount</span>
                                  <span className="text-green-400 text-lg">
                                    ₹{rsvpEvent.gstEnabled ?
                                      Math.round(rsvpEvent.price * (1 + rsvpEvent.gstPercent / 100)) :
                                      rsvpEvent.price}
                                  </span>
                                </div>

                                {/* Early Bird Discount */}
                                {rsvpEvent.earlyBirdDiscount?.enabled && new Date() <= new Date(rsvpEvent.earlyBirdDiscount.validUntil) && (
                                  <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <div className="text-yellow-400 text-[10px] font-black uppercase tracking-wider">Early Bird Discount</div>
                                    <div className="text-white/70 text-xs">{rsvpEvent.earlyBirdDiscount.discountPercent}% off until {new Date(rsvpEvent.earlyBirdDiscount.validUntil).toLocaleDateString()}</div>
                                  </div>
                                )}

                                {/* Coupon Input */}
                                {rsvpEvent.coupons?.length > 0 && (
                                  <div className="pt-3 border-t border-white/10">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-vortex-blue ml-1 mb-2 block">Have a Coupon Code?</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        className="flex-1 bg-transparent border border-white/20 p-2 rounded-lg text-sm focus:border-vortex-blue outline-none transition-colors text-white"
                                        value={rsvpForm.couponCode || ''}
                                        onChange={e => setRsvpForm({ ...rsvpForm, couponCode: e.target.value.toUpperCase() })}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          // Validate coupon logic here
                                          const coupon = rsvpEvent.coupons.find(c => c.code === rsvpForm.couponCode);
                                          if (coupon) {
                                            setRsvpForm({ ...rsvpForm, appliedCoupon: coupon });
                                          } else {
                                            alert('Invalid coupon code');
                                          }
                                        }}
                                        className="px-3 py-2 bg-vortex-blue/20 text-vortex-blue border border-vortex-blue/30 rounded-lg text-xs font-bold hover:bg-vortex-blue/30 transition-colors"
                                      >
                                        Apply
                                      </button>
                                    </div>

                                    {rsvpForm.appliedCoupon && (
                                      <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                                        <div className="text-green-400 text-xs font-bold">
                                          ✅ Coupon "{rsvpForm.appliedCoupon.code}" applied!
                                        </div>
                                        <div className="text-white/70 text-xs">
                                          Discount: {rsvpForm.appliedCoupon.discountPercent ? `${rsvpForm.appliedCoupon.discountPercent}%` : `₹${rsvpForm.appliedCoupon.flatDiscount}`}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Attendees Section */}
                          <div className="space-y-6 pt-4">
                            <div className="flex justify-between items-end border-b border-white/10 pb-2 px-1">
                              <h4 className="text-lg font-bold tracking-widest text-white leading-none flex items-center gap-2">
                                <span className="text-vortex-blue italic">{'//'}</span> ATTENDEES
                              </h4>
                              <span className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">
                                MIN: 1 / MAX: {rsvpEvent.registrationType === 'Solo' ? 1 : (rsvpEvent.registrationType === 'Duo' ? 2 : rsvpEvent.maxTeamSize)}
                              </span>
                            </div>

                            <div className="space-y-8 mt-6">
                              {rsvpForm.members.map((member, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="relative p-6 bg-white/5 rounded-2xl border border-white/5 group-member"
                                >
                                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-vortex-blue text-black font-black flex items-center justify-center rounded-lg shadow-lg z-10">
                                    {idx + 1}
                                  </div>

                                  {idx === 0 && (rsvpEvent.registrationType === 'Team' || rsvpEvent.registrationType === 'Duo') && (
                                    <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                                      <div className="bg-vortex-blue/20 text-vortex-blue text-[9px] font-black px-2 py-1 rounded-md border border-vortex-blue/30 uppercase tracking-tighter flex items-center gap-1.5 mb-1">
                                        <Trophy size={10} /> Primary Participant
                                      </div>
                                      <div className="w-40 bg-black/20 p-2 rounded-lg border border-white/5">
                                        <label className="block text-[7px] font-black text-white/40 uppercase tracking-widest mb-1">Registration Identity</label>
                                        <input
                                          className="bg-transparent border-b border-vortex-blue/40 text-[11px] py-1 text-white outline-none focus:border-vortex-blue uppercase font-black w-full placeholder-white/10"
                                          placeholder="TEAM NAME"
                                          required
                                          value={rsvpForm.teamName || ''}
                                          onChange={e => setRsvpForm({ ...rsvpForm, teamName: e.target.value.toUpperCase() })}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {idx === 0 && rsvpEvent.registrationType === 'Solo' && (
                                    <div className="absolute top-4 right-4 bg-vortex-blue/20 text-vortex-blue text-[9px] font-black px-2 py-1 rounded-md border border-vortex-blue/30 uppercase tracking-tighter flex items-center gap-1.5">
                                      <Trophy size={10} /> Primary Participant
                                    </div>
                                  )}

                                  {idx > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => removeMember(idx)}
                                      className="absolute top-4 right-4 text-red-400/40 hover:text-red-400 transition-colors"
                                    >
                                      <X size={16} />
                                    </button>
                                  )}

                                  <div className="space-y-4 mt-4">
                                    <input
                                      type="text" placeholder="FULL NAME" className="w-full bg-transparent border-b border-white/10 p-3 text-sm focus:border-vortex-blue outline-none transition-colors text-white" required
                                      value={member.name} onChange={e => updateMember(idx, 'name', e.target.value)}
                                    />
                                    <input
                                      type="email" placeholder="EMAIL ADDRESS" className="w-full bg-transparent border-b border-white/10 p-3 text-sm focus:border-vortex-blue outline-none transition-colors text-white" required
                                      value={member.email} onChange={e => updateMember(idx, 'email', e.target.value)}
                                    />
                                    <input
                                      type="tel" placeholder="PHONE NO. (10 DIGITS)" className="w-full bg-transparent border-b border-white/10 p-3 text-sm focus:border-vortex-blue outline-none transition-colors text-white" required
                                      value={member.phone} onChange={e => updateMember(idx, 'phone', e.target.value)}
                                      minLength={10} maxLength={10} pattern="\d{10}" title="Please enter exactly 10 digits"
                                    />
                                    <input
                                      type="text" placeholder="COLLEGE / COMPANY NAME" className="w-full bg-transparent border-b border-white/10 p-3 text-sm focus:border-vortex-blue outline-none transition-colors text-white" required
                                      value={member.college} onChange={e => updateMember(idx, 'college', e.target.value)}
                                    />
                                    <input
                                      type="text" placeholder="ID NUMBER / USN (10 DIGITS)" className="w-full bg-transparent border-b border-white/10 p-3 text-sm focus:border-vortex-blue outline-none transition-colors text-white" required
                                      value={member.idNumber} onChange={e => updateMember(idx, 'idNumber', e.target.value)}
                                      minLength={10} maxLength={10} pattern="\d{10}" title="Please enter exactly 10 digits"
                                    />

                                    {/* Additional fields for better verification */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <input
                                        type="text" placeholder="DEPARTMENT" className="w-full bg-transparent border-b border-white/10 p-3 text-sm focus:border-vortex-blue outline-none transition-colors text-white" required
                                        value={member.department || ''} onChange={e => updateMember(idx, 'department', e.target.value)}
                                      />
                                      <input
                                        type="text" placeholder="YEAR" className="w-full bg-transparent border-b border-white/10 p-3 text-sm focus:border-vortex-blue outline-none transition-colors text-white" required
                                        value={member.year || ''} onChange={e => updateMember(idx, 'year', e.target.value)}
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <input
                                        type="text" placeholder="STATE" className="w-full bg-transparent border-b border-white/10 p-3 text-sm focus:border-vortex-blue outline-none transition-colors text-white" required
                                        value={member.state} onChange={e => updateMember(idx, 'state', e.target.value)}
                                      />
                                      <input
                                        type="text" placeholder="CITY" className="w-full bg-transparent border-b border-white/10 p-3 text-sm focus:border-vortex-blue outline-none transition-colors text-white" required
                                        value={member.city} onChange={e => updateMember(idx, 'city', e.target.value)}
                                      />
                                    </div>

                                    {/* Age verification if required */}
                                    {(rsvpEvent.eligibility?.minAge || rsvpEvent.eligibility?.maxAge) && (
                                      <input
                                        type="number" placeholder="AGE" className="w-full bg-transparent border-b border-white/10 p-3 text-sm focus:border-vortex-blue outline-none transition-colors text-white" required
                                        value={member.age || ''} onChange={e => updateMember(idx, 'age', e.target.value)}
                                        min={rsvpEvent.eligibility?.minAge || 1}
                                        max={rsvpEvent.eligibility?.maxAge || 100}
                                      />
                                    )}

                                    <div className="pt-2">
                                      <button
                                        type="button"
                                        className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:border-vortex-blue/30 hover:text-vortex-blue transition-all flex flex-col items-center gap-1 group/upload"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Mail size={16} className="group-hover/upload:scale-110 transition-transform" /> UPLOAD ID CARD
                                        </div>
                                        <span className="text-[8px] font-medium text-white/20">
                                          {rsvpEvent.eligibility?.requiredDocs?.length > 0
                                            ? `Required: ${rsvpEvent.eligibility.requiredDocs.join(', ')}`
                                            : 'Formats: JPG, PNG, PDF (Max 2MB)'
                                          }
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>

                            {rsvpForm.members.length < (rsvpEvent.registrationType === 'Solo' ? 1 : (rsvpEvent.registrationType === 'Duo' ? 2 : rsvpEvent.maxTeamSize)) && (
                              <button
                                type="button"
                                onClick={addMember}
                                className="w-full py-4 border-2 border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white/60 hover:bg-white/5 hover:text-vortex-blue transition-all flex items-center justify-center gap-3 group"
                              >
                                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                                Add Team Member ({rsvpForm.members.length}/{(rsvpEvent.registrationType === 'Solo' ? 1 : (rsvpEvent.registrationType === 'Duo' ? 2 : rsvpEvent.maxTeamSize))})
                              </button>
                            )}
                          </div>
                        </div>

                        {(() => {
                          const minSize = rsvpEvent.registrationType === 'Solo' ? 1
                            : (rsvpEvent.registrationType === 'Duo' ? 2
                              : (rsvpEvent.minTeamSize || 1));

                          if (rsvpForm.members.length >= minSize) {
                            return (
                              <div className="pt-8 sticky bottom-0 bg-dark-bg/90 backdrop-blur-sm">
                                <button
                                  type="submit" disabled={rsvpStatus.loading}
                                  className={`w-full py-5 rounded-2xl ${rsvpEvent.capacity > 0 && rsvpEvent.registrations?.length >= rsvpEvent.capacity ? 'bg-vortex-orange' : 'bg-vortex-blue'} text-black font-black uppercase tracking-[0.2em] shadow-2xl hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-3 border-t-2 border-white/20`}
                                >
                                  {rsvpStatus.loading ? 'INITIATING...' : (
                                    <>
                                      {rsvpEvent.capacity > 0 && rsvpEvent.registrationCount >= rsvpEvent.capacity ? 'JOIN WAITLIST' : (rsvpEvent.price > 0 ? `PROCEED TO PAYMENT (₹${rsvpEvent.price})` : 'CONFIRM REGISTRATION')}
                                      <ArrowRight size={20} />
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          } else {
                            return (
                              <div className="pt-8 sticky bottom-0 bg-dark-bg/90 backdrop-blur-sm pb-4">
                                <div className="p-4 bg-vortex-blue/5 border-2 border-dashed border-vortex-blue/20 rounded-2xl text-center">
                                  <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.2em]">
                                    ALMOST THERE! ADD {minSize - rsvpForm.members.length} MORE {minSize - rsvpForm.members.length > 1 ? 'MEMBERS' : 'MEMBER'} TO PROCEED
                                  </p>
                                </div>
                              </div>
                            );
                          }
                        })()}
                      </>
                    ) : showingPayment ? (
                      <PaymentFlow
                        eventId={rsvpEvent._id}
                        eventTitle={rsvpEvent.title}
                        amount={rsvpEvent.price}
                        paymentInfo={paymentInfo}
                        userEmail={rsvpForm.members[0].email}
                        onComplete={() => {
                          setShowingPayment(false);
                          setRsvpStatus({ loading: false, message: 'Payment submitted for verification!', type: 'success' });
                          setTimeout(() => setRsvpEvent(null), 3000);
                        }}
                        onCancel={() => setShowingPayment(false)}
                      />
                    ) : (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center">
                          <AlertCircle size={48} className="mx-auto text-vortex-blue mb-4" />
                          <h4 className="text-xl font-bold text-white mb-2">Notice</h4>
                          <p className="text-white/60 mb-6 font-medium">This event uses an external payment flow. Please click the button below to proceed.</p>
                          <button
                            type="button"
                            onClick={(e) => handleRsvpSubmit(e)}
                            className="glass-button bg-vortex-blue text-black font-bold px-8 py-3 w-full"
                          >
                            PROCEED TO PAYMENT
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Modal */}
        <AnimatePresence>
          {feedbackEvent && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={() => setFeedbackEvent(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative glass-card p-8 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => setFeedbackEvent(null)} className="absolute top-4 right-4 text-white/40 hover:text-white">
                  <X />
                </button>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold gradient-text">EVENT FEEDBACK</h3>
                  <p className="text-white/60 text-sm mt-2">{feedbackEvent.title}</p>
                </div>

                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text" placeholder="Your Name" className="input-glass p-3 rounded-lg" required
                      value={feedbackForm.name} onChange={e => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                    />
                    <input
                      type="text" placeholder="Student ID" className="input-glass p-3 rounded-lg" required
                      value={feedbackForm.studentId} onChange={e => setFeedbackForm({ ...feedbackForm, studentId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 ml-1">Rating: {feedbackForm.rating} Stars</label>
                    <input
                      type="range" min="1" max="5" className="w-full mt-2 accent-vortex-blue"
                      value={feedbackForm.rating} onChange={e => setFeedbackForm({ ...feedbackForm, rating: parseInt(e.target.value) })}
                    />
                  </div>
                  <textarea
                    placeholder="Your comments..." className="w-full input-glass p-3 rounded-lg h-24" required
                    value={feedbackForm.comment} onChange={e => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                  />
                  <button type="submit" className="w-full glass-button bg-purple-500 text-white font-bold py-4">
                    Submit Feedback
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section className="mb-16">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-display font-bold mb-8 text-white uppercase tracking-wider"
            >
              Past Events
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              {/* Carousel Container */}
              <div className="overflow-hidden rounded-xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {pastEvents.map((event, index) => (
                    <div key={event._id} className="w-full flex-shrink-0">
                      <div className="glass-card mx-2 overflow-hidden bg-white/5 border border-white/10 group">
                        <div className="md:flex">
                          <div className="md:w-1/2 h-64 md:h-auto overflow-hidden relative">
                            {event.images && event.images.length > 0 ? (
                              <img src={event.images[0]} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-vortex-blue/20 to-vortex-orange/20 flex items-center justify-center">
                                <Calendar className="h-16 w-16 text-white/10" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="absolute bottom-4 left-6 text-2xl font-bold text-white/80">
                              {event.title.split(' ')[0]}
                            </div>
                          </div>

                          <div className="md:w-1/2 p-10 flex flex-col justify-center">
                            <h3 className="text-3xl font-bold text-white mb-6">
                              {event.title}
                            </h3>

                            <div className="space-y-4 text-white/60 mb-8">
                              <div className="flex items-center">
                                <Calendar className="h-5 w-5 mr-3 text-vortex-blue" />
                                {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-5 w-5 mr-3 text-vortex-blue" />
                                {event.location}
                              </div>
                              <div className="flex items-center">
                                <Users className="h-5 w-5 mr-3 text-vortex-blue" />
                                {event.registrationCount || 0} participants
                              </div>
                            </div>

                            <div className="flex gap-4">
                              <button
                                onClick={() => setSelectedEventGallery(event)}
                                className="glass-button text-vortex-blue border border-vortex-blue/30 hover:bg-vortex-blue hover:text-black transition-all inline-flex items-center justify-center self-start px-8"
                              >
                                View Gallery
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </button>
                              <button
                                onClick={() => setFeedbackEvent(event)}
                                className="glass-button text-purple-400 border border-purple-400/30 hover:bg-purple-400 hover:text-black transition-all inline-flex items-center justify-center self-start px-8"
                              >
                                Leave Feedback
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 glass-card rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 glass-card rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>

              {/* Dots Indicator */}
              <div className="flex justify-center mt-6 space-x-2">
                {pastEvents.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-vortex-blue' : 'bg-white/30'
                      }`}
                  />
                ))}
              </div>
            </motion.div>
          </section>
        )}
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedSubEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSubEvent(null)}
          >
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative glass-card p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedSubEvent(null)}
                className="absolute top-4 right-4 w-10 h-10 glass-card rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              <div className="text-center mb-6">
                <div className={`w-20 h-20 bg-gradient-to-br ${selectedSubEvent.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <selectedSubEvent.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-display font-bold gradient-text mb-2">
                  {selectedSubEvent.title}
                </h3>
                <p className="text-white/70">
                  {selectedSubEvent.description}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-white mb-3">Event Details</h4>
                  <p className="text-white/80 leading-relaxed">
                    {selectedSubEvent.details}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-4 text-center">
                    <Clock className="h-6 w-6 text-vortex-blue mx-auto mb-2" />
                    <div className="text-sm text-white/60">Duration</div>
                    <div className="text-white font-medium">{selectedSubEvent.duration}</div>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <Users className="h-6 w-6 text-vortex-orange mx-auto mb-2" />
                    <div className="text-sm text-white/60">Participants</div>
                    <div className="text-white font-medium">{selectedSubEvent.participants}</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedSubEvent(null)}
                    className="flex-1 glass-button text-white border border-white/20 hover:bg-white/10 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Modal */}
      <AnimatePresence>
        {selectedEventGallery && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedEventGallery(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-display font-bold text-white uppercase tracking-tighter">
                  {selectedEventGallery.title} <span className="text-vortex-blue">Gallery</span>
                </h3>
                <button onClick={() => setSelectedEventGallery(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all">
                  <X />
                </button>
              </div>

              {selectedEventGallery.images && selectedEventGallery.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {selectedEventGallery.images.map((img, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="aspect-video rounded-3xl overflow-hidden glass-card group cursor-zoom-in relative"
                    >
                      <img src={img} alt={`${selectedEventGallery.title} ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-3xl">
                  <div className="text-white/20 text-xl font-medium mb-2">No Content Available</div>
                  <p className="text-white/10">Photos from this event haven't been uploaded yet.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;