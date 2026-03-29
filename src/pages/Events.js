import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ArrowRight, ChevronLeft, ChevronRight, Trophy, Code, Key, Gamepad2, X, Download } from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import PaymentFlow from '../components/PaymentFlow';
import SmartImage from '../components/SmartImage';
import { generateRegistrationPDF, downloadPDF } from '../utils/pdfGenerator';
import RegistrationForm from '../components/RegistrationForm';

const Events = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedSubEvent, setSelectedSubEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEventGallery, setSelectedEventGallery] = useState(null);
  const [rsvpEvent, setRsvpEvent] = useState(null);
  const [activeInfoTab, setActiveInfoTab] = useState('details');
  const [showingPayment, setShowingPayment] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const prayogFallback = useMemo(() => ({
    title: 'PRAYOG 1.0',
    date: 'March 25, 2025',
    venue: 'Navkis College of Engineering',
    description1: 'Prayog 1.0 was a flagship technical event organized by Team Vortex at Navkis College of Engineering, Hassan, held on 25th March 2025. Designed to foster innovation, collaboration, and tech-oriented problem-solving, Prayog 1.0 showcased the club\'s commitment to hands-on learning and student engagement through its four key sub-events.',
    description2: 'The event drew over 150 participants, reflecting strong interest across disciplines. Prayog 1.0 not only provided a platform for skill development and networking but also celebrated the diversity and enthusiasm of the tech community at Navkis College of Engineering. The success and energetic response to Prayog 1.0 have laid a strong foundation for it to become a recurring highlight in the annual calendar of Team Vortex.',
    galleryDriveLink: '',
    images: []
  }), []);

  const prayogSubEventsFallback = useMemo(() => ([
    {
      title: 'Champions League',
      description: 'Branch-wise competitive event where teams represented their respective departments.',
      details: 'Champions League was a branch-wise competitive event where teams represented their respective departments. It focused on testing participants\' technical knowledge, logical thinking, and teamwork through multiple challenging rounds, fostering healthy competition among branches.',
      icon: 'Trophy',
      color: 'from-yellow-500 to-orange-500',
      duration: 'Full Day',
      participants: 'Branch-wise Teams'
    },
    {
      title: 'Hackathon',
      description: 'Inter-college team-based coding and innovation challenge.',
      details: 'The Hackathon was an inter-college team-based coding and innovation challenge. Teams worked intensively to develop practical solutions to real-world problems within a limited time. This event emphasized innovation, problem-solving, coding skills, and collaboration.',
      icon: 'Code',
      color: 'from-vortex-blue to-cyan-400',
      duration: 'Full Day',
      participants: 'Inter-College Teams'
    },
    {
      title: 'Eureka',
      description: 'Idea and innovation-based event conducted within the college.',
      details: 'Eureka was an idea and innovation-based event conducted within the college. Teams presented creative solutions and project ideas to real-world or technical problems, focusing on original thinking, feasibility, and impact.',
      icon: 'Key',
      color: 'from-purple-500 to-pink-500',
      duration: 'Half Day',
      participants: 'Intra-College Teams'
    },
    {
      title: 'Gameathon',
      description: 'Fun yet competitive intra-college event centered around strategic games.',
      details: 'Gameathon was a fun yet competitive intra-college event centered around strategic and skill-based games. It tested participants\' decision-making, coordination, and analytical skills, making it both engaging and intellectually stimulating.',
      icon: 'Gamepad2',
      color: 'from-red-500 to-vortex-orange',
      duration: 'Half Day',
      participants: 'Intra-College Teams'
    }
  ]), []);

  // Enhanced state management for registration flow
  const [registrationFlow, setRegistrationFlow] = useState({
    step: 'form', // 'form' | 'processing' | 'payment' | 'success' | 'error'
    isSubmitting: false,
    canSubmit: true,
    error: null,
    success: null,
    registrationData: null // Store registration data for PDF generation
  });

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
      city: '',
      idCardFile: ''
    }],
    couponCode: '',
    appliedCoupon: null,
    paid: false,
    paymentId: ''
  });

  const [expandedSubEvents, setExpandedSubEvents] = useState({});

  const toggleSubEvents = (eventId) => {
    setExpandedSubEvents(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };
  const [feedbackEvent, setFeedbackEvent] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ studentId: '', name: '', rating: 5, comment: '' });



  useEffect(() => {
    if (!rsvpEvent) {
      // Reset all states when modal closes
      setRegistrationFlow({
        step: 'form',
        isSubmitting: false,
        canSubmit: true,
        error: null,
        success: null
      });
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
          city: '',
          idCardFile: ''
        }],
        couponCode: '',
        appliedCoupon: null,
        paid: false,
        paymentId: ''
      });
      setActiveInfoTab('details');
      setShowingPayment(false);
      setPaymentInfo(null);
    }
  }, [rsvpEvent]);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEvents = useCallback(() => {
    // Use lightweight endpoint for faster initial loading
    fetch(`${API_BASE_URL}/api/events/lightweight`)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
      })
      .catch(err => {
        console.error('Error fetching events:', err);
        // Fallback to regular endpoint if lightweight fails
        fetch(`${API_BASE_URL}/api/events`)
          .then(res => res.json())
          .then(data => {
            setEvents(data);
          })
          .catch(fallbackErr => {
            console.error('Error fetching events (fallback):', fallbackErr);
          });
      });
  }, []);

  const now = new Date();

  const displayableEvents = events.filter(e => e && e.status !== 'draft');

  const prayogEvent = useMemo(() => {
    return displayableEvents.find(e => e && e.title && e.title.trim().toLowerCase() === 'prayog 1.0');
  }, [displayableEvents]);

  const prayogDisplay = useMemo(() => {
    if (!prayogEvent) return prayogFallback;

    const eventDateStr = prayogEvent.date
      ? new Date(prayogEvent.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : prayogFallback.date;

    const venueStr = (prayogEvent.location || '').trim() || prayogFallback.venue;

    const rawDesc = (prayogEvent.description || '').trim();
    const parts = rawDesc
      ? rawDesc.split(/\n\s*\n+/g).map(p => p.trim()).filter(Boolean)
      : [];

    return {
      title: (prayogEvent.title || '').trim() || prayogFallback.title,
      date: eventDateStr,
      venue: venueStr,
      description1: parts[0] || prayogFallback.description1,
      description2: parts[1] || prayogFallback.description2,
      galleryDriveLink: prayogEvent.galleryDriveLink || '',
      images: Array.isArray(prayogEvent.images) ? prayogEvent.images : []
    };
  }, [prayogEvent, prayogFallback]);

  const prayogSubEvents = useMemo(() => {
    if (prayogEvent?.subEvents?.length > 0) return prayogEvent.subEvents;
    return prayogSubEventsFallback;
  }, [prayogEvent, prayogSubEventsFallback]);

  const upcomingEvents = displayableEvents.filter(e => {
    if (!e || e.status === 'completed') return false;

    try {
      const eventDate = new Date(e.date);
      
      // Check if date is valid
      if (isNaN(eventDate.getTime())) {
        console.warn('Invalid date for event:', e.title, e.date);
        return false;
      }
      
      const eventEnd = new Date(eventDate);
      eventEnd.setHours(23, 59, 59, 999); // Default to end of day

      if (e.endTime) {
        const [h, m] = e.endTime.split(':').map(num => parseInt(num, 10));
        if (!isNaN(h) && !isNaN(m)) {
          eventEnd.setHours(h, m, 0, 0);
        }
      }

      return now <= eventEnd;
    } catch (err) {
      console.error('Error processing event date:', e.title, err);
      return false;
    }
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastEvents = displayableEvents.filter(e => {
    if (!e || e.status === 'completed') return true;

    try {
      const eventDate = new Date(e.date);
      
      // Check if date is valid
      if (isNaN(eventDate.getTime())) {
        console.warn('Invalid date for event:', e.title, e.date);
        return false;
      }
      
      const eventEnd = new Date(eventDate);
      eventEnd.setHours(23, 59, 59, 999); // Default to end of day

      if (e.endTime) {
        const [h, m] = e.endTime.split(':').map(num => parseInt(num, 10));
        if (!isNaN(h) && !isNaN(m)) {
          eventEnd.setHours(h, m, 0, 0);
        }
      }

      return now > eventEnd;
    } catch (err) {
      console.error('Error processing event date:', e.title, err);
      return false;
    }
  }).sort((a, b) => {
    if ((b.priority || 0) !== (a.priority || 0)) {
      return (b.priority || 0) - (a.priority || 0);
    }
    return new Date(b.date) - new Date(a.date);
  });

  // Group past events: parent events get their children attached, children are excluded from top level
  const groupedPastEvents = useMemo(() => {
    return pastEvents
      .filter(e => !e.parentEventId) // only top-level events
      .map(e => ({
        ...e,
        childEvents: pastEvents
          .filter(c => String(c.parentEventId) === String(e._id))
          .sort((a, b) => new Date(a.date) - new Date(b.date)) // sort sub-events by date
      }));
  }, [pastEvents]);

  const nextSlide = () => {
    if (groupedPastEvents.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % groupedPastEvents.length);
  };

  const prevSlide = () => {
    if (groupedPastEvents.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + groupedPastEvents.length) % groupedPastEvents.length);
  };

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  }), []);

  const getIconComponent = useMemo(() => (iconName) => {
    const icons = { Trophy, Code, Key, Gamepad2, Users, MapPin, Clock };
    return icons[iconName] || Calendar;
  }, []);

  // Enhanced registration handler with state machine logic
  const handleRsvpSubmit = async (e, forceData = null) => {
    if (e && e.preventDefault) e.preventDefault();
    
    // Prevent multiple submissions
    if (registrationFlow.isSubmitting || !registrationFlow.canSubmit) {
      console.log('Registration already in progress or blocked');
      return;
    }

    // Set processing state
    setRegistrationFlow(prev => ({
      ...prev,
      step: 'processing',
      isSubmitting: true,
      canSubmit: false,
      error: null
    }));

    const submitData = forceData || rsvpForm;

    try {
      // Retry up to 3 times on network/server errors
      let res, lastErr;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
          res = await fetch(`${API_BASE_URL}/api/events/${rsvpEvent._id}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submitData),
            signal: controller.signal
          });
          clearTimeout(timeout);
          break; // success — exit retry loop
        } catch (fetchErr) {
          lastErr = fetchErr;
          if (fetchErr.name === 'AbortError') {
            lastErr = new Error('Request timed out. Please try again.');
            break; // don't retry on timeout
          }
          if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 1000));
        }
      }
      if (!res) throw new Error(lastErr?.message || 'Network error. Please check your connection and try again.');

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }

      const data = await res.json();

      // Handle successful registration
      if (rsvpEvent.price > 0) {
        // Paid event - initiate payment flow
        await initiatePaymentFlow(data);
      } else {
        // Free event
        handleRegistrationSuccess(data);
      }

    } catch (err) {
      console.error('Registration error:', err);
      setRegistrationFlow(prev => ({
        ...prev,
        step: 'error',
        isSubmitting: false,
        canSubmit: true,
        error: err.message || 'Registration failed. Please try again.'
      }));
    }
  };

  // Wrapper for RegistrationForm component ({ teamName, members }) signature
  const handleRsvpFromForm = ({ teamName, members }) => {
    const submitData = {
      teamName,
      country: 'India',
      institutionName: members[0]?.college || '',
      department: members[0]?.department || '',
      yearOfStudy: members[0]?.year || '',
      members: members.map(m => ({
        name: m.name, email: m.email, phone: m.phone,
        college: m.college, collegeType: m.collegeType,
        idNumber: m.idNumber, department: m.department, year: m.year,
        age: m.age || '',
        state: m.state, city: m.city,
        tshirtSize: m.tshirtSize, dietaryPreference: m.dietaryPreference,
        emergencyContactName: m.emergencyContactName,
        emergencyContactPhone: m.emergencyContactPhone,
        specialRequirements: m.specialRequirements,
      })),
      paid: false, paymentId: ''
    };
    setRsvpForm(prev => ({ ...prev, ...submitData, members: submitData.members }));
    handleRsvpSubmit(null, submitData);
  };

  // Initiate payment flow
  const initiatePaymentFlow = async (registrationData) => {
    try {
      const payInfoRes = await fetch(`${API_BASE_URL}/api/events/${rsvpEvent._id}/payment-info`);
      
      if (!payInfoRes.ok) {
        throw new Error('Failed to fetch payment information');
      }

      const payInfoData = await payInfoRes.json();
      setPaymentInfo(payInfoData);
      
      setRegistrationFlow(prev => ({
        ...prev,
        step: 'payment',
        isSubmitting: false,
        canSubmit: false
      }));
      
      setShowingPayment(true);

    } catch (err) {
      console.error('Failed to initiate payment flow:', err);
      setRegistrationFlow(prev => ({
        ...prev,
        step: 'success',
        isSubmitting: false,
        canSubmit: false,
        success: 'Registration successful! Please contact admin for payment instructions.'
      }));
      
      setTimeout(() => {
        resetRegistrationFlow();
      }, 3000);
    }
  };

  // Handle successful registration
  const handleRegistrationSuccess = (data) => {
    setRegistrationFlow(prev => ({
      ...prev,
      step: 'success',
      isSubmitting: false,
      canSubmit: false,
      success: data.message || 'Registration successful!',
      registrationData: data.registration || data // Store registration data
    }));

    // Don't auto-close - let user download PDF first
    // setTimeout(() => {
    //   resetRegistrationFlow();
    //   fetchEvents(); // Refresh events data
    // }, 2500);
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    try {
      if (!registrationFlow.registrationData || !rsvpEvent) {
        alert('Unable to generate PDF. Please try again.');
        return;
      }

      const doc = generateRegistrationPDF(registrationFlow.registrationData, rsvpEvent);
      const filename = `TeamVortex_${rsvpEvent.title.replace(/\s+/g, '_')}_Registration.pdf`;
      const success = downloadPDF(doc, filename);

      if (success) {
        // Show success message
        setTimeout(() => {
          resetRegistrationFlow();
          fetchEvents();
        }, 1000);
      } else {
        alert('Failed to download PDF. Please try again.');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please contact support.');
    }
  };

  // Reset registration flow
  const resetRegistrationFlow = () => {
    setRsvpEvent(null);
    setShowingPayment(false);
    setPaymentInfo(null);
    setRegistrationFlow({
      step: 'form',
      isSubmitting: false,
      canSubmit: true,
      error: null,
      success: null
    });
  };

  // Handle payment completion
  const handlePaymentComplete = () => {
    setShowingPayment(false);
    setRegistrationFlow(prev => ({
      ...prev,
      step: 'success',
      success: 'Payment submitted for verification!'
    }));
    
    setTimeout(() => {
      resetRegistrationFlow();
    }, 3000);
  };

  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setShowingPayment(false);
    setRegistrationFlow(prev => ({
      ...prev,
      step: 'form',
      isSubmitting: false,
      canSubmit: true,
      error: 'Payment cancelled. You can try again.'
    }));
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

  return (
    <div className="pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
            <span className="gradient-text">EVENTS GALLERY</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Explore our memories and past events. A showcase of our journey, potential, and the milestones we've achieved together.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="glass-card overflow-hidden bg-white/5 border border-white/10">
            <div className="p-4 sm:p-6 md:p-10">
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <h2 className="text-2xl sm:text-4xl md:text-6xl font-orbitron font-bold mb-2 sm:mb-3 md:mb-4 tracking-wider">
                  <span className="gradient-text">{prayogDisplay.title}</span>
                </h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 text-white/60">
                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                    {prayogDisplay.date}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                    {prayogDisplay.venue}
                  </span>
                </div>
              </div>

              <div className="text-white/80 max-w-4xl mx-auto leading-relaxed space-y-2 sm:space-y-3 md:space-y-4 text-justify text-sm sm:text-base">
                <p>{prayogDisplay.description1}</p>
                <p>{prayogDisplay.description2}</p>
              </div>

              {(prayogDisplay.images?.length > 0 || prayogDisplay.galleryDriveLink) && (
                <div className="mt-4 sm:mt-6 md:mt-8 flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center">
                  {prayogDisplay.images?.length > 0 && (
                    <button
                      onClick={() => setSelectedEventGallery({
                        _id: prayogEvent?._id,
                        title: prayogDisplay.title,
                        images: prayogDisplay.images
                      })}
                      className="glass-button text-vortex-blue border border-vortex-blue/30 hover:bg-vortex-blue hover:text-black transition-all inline-flex items-center justify-center self-start px-6 py-2"
                    >
                      ðŸ“¸ View Photos
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  )}

                  {prayogDisplay.galleryDriveLink && (
                    <button
                      onClick={() => window.open(prayogDisplay.galleryDriveLink, '_blank')}
                      className="glass-button text-green-400 border border-green-400/30 hover:bg-green-400 hover:text-black transition-all inline-flex items-center justify-center self-start px-6 py-2"
                    >
                      ðŸ“ Drive Gallery
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  )}
                </div>
              )}

              {prayogSubEvents?.length > 0 && (
                <div className="mt-4 sm:mt-6 md:mt-10">
                  <h3 className="text-lg sm:text-xl font-bold text-white/80 mb-2 sm:mb-3 md:mb-4 text-center">Sub-Events</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {prayogSubEvents.map((subEvent, index) => {
                      // Safety check for subEvent
                      if (!subEvent || !subEvent.title) {
                        console.warn('Invalid prayog subEvent data in Events.js:', subEvent);
                        return null;
                      }
                      
                      const IconComponent = getIconComponent(subEvent.icon);

                      return (
                        <button
                          key={`prayog-subevent-${subEvent.title || index}`}
                          onClick={() => setSelectedSubEvent(subEvent)}
                          className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-left"
                        >
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${subEvent.color || 'from-blue-500 to-purple-500'} rounded-xl flex items-center justify-center mb-2 sm:mb-3`}>
                            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-white leading-tight">{subEvent.title}</div>
                          {subEvent.duration && (
                            <div className="text-[10px] sm:text-xs text-white/50 mt-0.5 sm:mt-1">{subEvent.duration}</div>
                          )}
                          {subEvent.participants && (
                            <div className="text-[9px] sm:text-[11px] text-white/40 mt-0.5 sm:mt-1 leading-tight">{subEvent.participants}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {upcomingEvents.length > 0 && (
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
            >
              {upcomingEvents.map((event, eventIndex) => {
                // Safety check
                if (!event || !event._id || !event.title) {
                  console.warn('Invalid event data:', event);
                  return null;
                }
                
                // Define different gradient backgrounds for each card
                const gradientConfigs = [
                  'from-green-400 to-cyan-400',
                  'from-blue-400 to-purple-400', 
                  'from-cyan-400 to-blue-400',
                  'from-purple-400 to-pink-400',
                  'from-orange-400 to-red-400'
                ];
                
                const gradientClass = gradientConfigs[eventIndex % gradientConfigs.length];
                
                return (
                <motion.div
                  key={event._id}
                  variants={itemVariants}
                  className="glass-card overflow-hidden group"
                >
                  <div className="h-48 overflow-hidden relative">
                    {event.images && event.images.length > 0 ? (
                      <SmartImage src={event.images[0]} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-vortex-blue/20 to-vortex-orange/20 flex items-center justify-center">
                        <Calendar className="h-16 w-16 text-white/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40" />
                    
                    {/* Gradient background with text */}
                    <div className="absolute bottom-4 left-6">
                      <div className={`px-4 py-2 bg-gradient-to-r ${gradientClass} rounded-lg shadow-lg`}>
                        <div className="text-white font-bold text-lg">
                          {event.title.split(' ')[0]}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">{event.title}</h3>
                    <div className="space-y-2 text-white/60 mb-6">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-vortex-blue" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-vortex-blue" />
                        {event.location}
                      </div>
                      {event.faqs && event.faqs.length > 0 && (
                        <div className="flex items-center">
                          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full border border-cyan-500/30 font-medium">
                            â“ {event.faqs.length} FAQ{event.faqs.length > 1 ? 's' : ''} Available
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Sub-Events Display */}
                    {event.subEvents && event.subEvents.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-white/80 mb-3">Sub-Events</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          {event.subEvents.map((subEvent, index) => {
                            // Safety check for subEvent
                            if (!subEvent || !subEvent.title) {
                              console.warn('Invalid subEvent data in Events.js upcoming events:', subEvent);
                              return null;
                            }
                            
                            const IconComponent = getIconComponent(subEvent.icon);
                            
                            return (
                              <button
                                key={`subevent-${subEvent.title || index}`}
                                onClick={() => setSelectedSubEvent(subEvent)}
                                className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all text-left"
                              >
                                <div className={`w-8 h-8 bg-gradient-to-br ${subEvent.color} rounded-lg flex items-center justify-center mb-2`}>
                                  <IconComponent className="h-4 w-4 text-white" />
                                </div>
                                <div className="text-xs font-medium text-white">{subEvent.title}</div>
                                <div className="text-xs text-white/50">{subEvent.duration}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <button
                        onClick={() => setRsvpEvent(event)}
                        className="w-full glass-button bg-vortex-blue text-white font-bold py-3"
                      >
                        Register Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
              })}
            </motion.div>
          </section>
        )}


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
                <button 
                  onClick={resetRegistrationFlow} 
                  className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
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
                    {['details', 'fees', 'rules', 'prizes', 'faq'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveInfoTab(tab)}
                        className={`px-4 py-2 rounded-lg font-medium capitalize transition-all whitespace-nowrap text-xs ${activeInfoTab === tab ? 'bg-vortex-blue text-black shadow-lg' : 'text-white/70 hover:text-white'
                          }`}
                      >
                        {tab === 'details' ? 'Event Info' : tab === 'faq' ? 'FAQ' : tab}
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
                            <span className="text-white font-bold">â‚¹{rsvpEvent.price}</span>
                          </div>

                          {rsvpEvent.gstEnabled && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-white/50">GST ({rsvpEvent.gstPercent}%)</span>
                              <span className="text-white/70">â‚¹{Math.round(rsvpEvent.price * (rsvpEvent.gstPercent / 100))}</span>
                            </div>
                          )}

                          <div className="border-t border-white/10 pt-2 flex justify-between items-center font-bold">
                            <span className="text-white">Total Amount</span>
                            <span className="text-green-400 text-lg">
                              â‚¹{rsvpEvent.gstEnabled ?
                                Math.round(rsvpEvent.price * (1 + rsvpEvent.gstPercent / 100)) :
                                rsvpEvent.price}
                            </span>
                          </div>
                        </div>

                        {/* Early Bird Discount */}
                        {rsvpEvent.earlyBirdDiscount?.enabled && new Date() <= new Date(rsvpEvent.earlyBirdDiscount.validUntil) && (
                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">ðŸŽ‰ Early Bird Offer</div>
                            <div className="text-white/70 text-xs">
                              Get {rsvpEvent.earlyBirdDiscount.discountPercent}% discount until {new Date(rsvpEvent.earlyBirdDiscount.validUntil).toLocaleDateString()}
                            </div>
                            <div className="text-green-400 text-sm font-bold mt-1">
                              Save â‚¹{Math.round(rsvpEvent.price * (rsvpEvent.earlyBirdDiscount.discountPercent / 100))}
                            </div>
                          </div>
                        )}

                        {/* Payment Methods */}
                        <div className="pt-3 border-t border-white/10">
                          <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Payment Methods</span>
                          <div className="flex flex-wrap gap-2">
                            {rsvpEvent.paymentGateway === 'UPI' && (
                              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">UPI Only</span>
                            )}
                            {rsvpEvent.paymentGateway === 'Offline' && (
                              <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full border border-orange-500/20">Offline Only</span>
                            )}
                            {rsvpEvent.paymentGateway === 'Both' && (
                              <>
                                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">UPI</span>
                                <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full border border-orange-500/20">Offline</span>
                              </>
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
                                      {coupon.discountPercent ? `${coupon.discountPercent}% OFF` : `â‚¹${coupon.flatDiscount} OFF`}
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
                                        {prize.trophy && <span className="text-[10px]">ðŸ†</span>}
                                      </div>
                                      <div className="text-white/70 text-xs mt-1">{prize.description}</div>
                                    </div>
                                    {prize.cashAmount > 0 && (
                                      <span className="text-green-400 text-sm font-bold ml-2">â‚¹{prize.cashAmount}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-white/20 text-4xl mb-2">ðŸ†</div>
                            <div className="text-white/40 text-sm">Prize details will be announced soon</div>
                          </div>
                        )}

                        {/* Certificates */}
                        <div className="pt-3 border-t border-white/10">
                          <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Certificates</span>
                          <div className="flex flex-wrap gap-2">
                            {rsvpEvent.participationCertificate && (
                              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">
                                ðŸ“œ Participation Certificate
                              </span>
                            )}
                            {rsvpEvent.winnerCertificate && (
                              <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/20">
                                ðŸ¥‡ Winner Certificate
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeInfoTab === 'faq' && (
                      <div className="space-y-4">
                        {rsvpEvent.faqs?.length > 0 ? (
                          <div>
                            <span className="text-white/40 uppercase tracking-wider text-xs block mb-3">Frequently Asked Questions</span>
                            <div className="space-y-3">
                              {rsvpEvent.faqs.map((faq, idx) => (
                                <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-vortex-blue/30 transition-all">
                                  <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-vortex-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <span className="text-vortex-blue text-xs font-bold">Q</span>
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-white font-medium text-sm mb-2">{faq.question}</div>
                                      <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                          <span className="text-green-400 text-xs font-bold">A</span>
                                        </div>
                                        <div className="text-white/70 text-xs leading-relaxed flex-1">{faq.answer}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-white/20 text-4xl mb-2">â“</div>
                            <div className="text-white/40 text-sm">No FAQs available yet</div>
                            <div className="text-white/30 text-xs mt-2">Check back later or contact the organizers</div>
                          </div>
                        )}

                        {/* Contact Organizer */}
                        {rsvpEvent.organizer?.email && (
                          <div className="pt-3 border-t border-white/10">
                            <span className="text-white/40 uppercase tracking-wider text-xs block mb-2">Still have questions?</span>
                            <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                              <div className="text-white text-xs mb-1">Contact the organizer:</div>
                              <a 
                                href={`mailto:${rsvpEvent.organizer.email}`}
                                className="text-vortex-blue text-sm font-medium hover:underline"
                              >
                                {rsvpEvent.organizer.email}
                              </a>
                              {rsvpEvent.organizer.name && (
                                <div className="text-white/50 text-xs mt-1">{rsvpEvent.organizer.name}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Processing State */}
                {registrationFlow.step === 'processing' && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 border-4 border-vortex-blue/30 border-t-vortex-blue rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold text-white mb-2">Processing Registration</h3>
                    <p className="text-gray-400">Please wait while we process your registration...</p>
                  </div>
                )}

                {/* Status Display */}
                {(registrationFlow.error || registrationFlow.success) && (
                  <div className={`p-6 rounded-2xl text-center mb-6 ${
                    registrationFlow.success 
                      ? 'bg-green-500/10 border border-green-500/50 text-green-400' 
                      : 'bg-red-500/10 border border-red-500/50 text-red-400'
                  }`}>
                    <div className="text-lg font-bold mb-2">
                      {registrationFlow.success ? 'Success!' : 'Error'}
                    </div>
                    <div className="whitespace-pre-line mb-4">
                      {registrationFlow.success || registrationFlow.error}
                    </div>
                    
                    {/* PDF Download Button */}
                    {registrationFlow.success && registrationFlow.registrationData && (
                      <div className="space-y-3">
                        <button
                          onClick={handleDownloadPDF}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-vortex-blue to-vortex-orange text-white font-bold py-3 px-6 rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-lg"
                        >
                          <Download className="w-5 h-5" />
                          Download Registration PDF
                        </button>
                        <p className="text-xs text-white/60">
                          Download your registration confirmation with all event details
                        </p>
                        <button
                          onClick={() => {
                            resetRegistrationFlow();
                            fetchEvents();
                          }}
                          className="text-sm text-white/60 hover:text-white underline"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Registration Form */}
                {registrationFlow.step === 'form' && !showingPayment && (
                  <RegistrationForm
                    event={rsvpEvent}
                    onSubmit={handleRsvpFromForm}
                    submitting={registrationFlow.isSubmitting}
                  />
                )}

                {/* Payment Flow */}
                {showingPayment && (
                  <PaymentFlow
                    eventId={rsvpEvent._id}
                    eventTitle={rsvpEvent.title}
                    amount={rsvpEvent.price}
                    paymentInfo={paymentInfo}
                    userEmail={rsvpForm.members[0]?.email || ''}
                    onComplete={handlePaymentComplete}
                    onCancel={handlePaymentCancel}
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Modal - CLEAN */}
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
                    <input type="text" placeholder="Your Name" className="input-glass p-3 rounded-lg" required
                      value={feedbackForm.name} onChange={e => setFeedbackForm({ ...feedbackForm, name: e.target.value })} />
                    <input type="text" placeholder="Student ID" className="input-glass p-3 rounded-lg" required
                      value={feedbackForm.studentId} onChange={e => setFeedbackForm({ ...feedbackForm, studentId: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 ml-1">Rating: {feedbackForm.rating} Stars</label>
                    <input type="range" min="1" max="5" className="w-full mt-2 accent-vortex-blue"
                      value={feedbackForm.rating} onChange={e => setFeedbackForm({ ...feedbackForm, rating: parseInt(e.target.value) })} />
                  </div>
                  <textarea placeholder="Your comments..." className="w-full input-glass p-3 rounded-lg h-24" required
                    value={feedbackForm.comment} onChange={e => setFeedbackForm({ ...feedbackForm, comment: e.target.value })} />
                  <button type="submit" className="w-full glass-button bg-purple-500 text-white font-bold py-4">Submit Feedback</button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Past Events with Gallery */}
        {groupedPastEvents.length > 0 && (
          <section className="mb-16">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-display font-bold mb-8 text-white uppercase tracking-wider"
            >
              Our Journey
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
                  {groupedPastEvents.map((event, index) => {
                    // Safety check
                    if (!event || !event._id || !event.title) {
                      console.warn('Invalid past event data:', event);
                      return null;
                    }
                    
                    return (
                    <div key={event._id} className="w-full flex-shrink-0">
                      <div className="glass-card mx-2 overflow-hidden bg-white/5 border border-white/10 group">
                        <div className="md:flex">
                          <div className="md:w-1/2 h-64 md:h-auto overflow-hidden relative">
                            {event.images && event.images.length > 0 ? (
                              <SmartImage src={event.images[0]} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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
                              {/* Gallery Button - Show images if available */}
                              {event.images && event.images.length > 0 && (
                                <button
                                  onClick={() => setSelectedEventGallery(event)}
                                  className="glass-button text-vortex-blue border border-vortex-blue/30 hover:bg-vortex-blue hover:text-black transition-all inline-flex items-center justify-center self-start px-6 py-2"
                                >
                                  ðŸ“¸ View Photos
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </button>
                              )}

                              {/* Drive Gallery Button - Show if drive link available */}
                              {event.galleryDriveLink && (
                                <button
                                  onClick={() => window.open(event.galleryDriveLink, '_blank')}
                                  className="glass-button text-green-400 border border-green-400/30 hover:bg-green-400 hover:text-black transition-all inline-flex items-center justify-center self-start px-6 py-2"
                                >
                                  ðŸ“ Drive Gallery
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </button>
                              )}

                              {/* Feedback Button - Only show if event has ended */}
                              {(() => {
                                try {
                                  const eventDate = new Date(event.date);
                                  const eventEnd = new Date(eventDate);
                                  eventEnd.setHours(23, 59, 59, 999);
                                  if (event.endTime) {
                                    const [h, m] = event.endTime.split(':').map(num => parseInt(num, 10));
                                    if (!isNaN(h) && !isNaN(m)) eventEnd.setHours(h, m, 0, 0);
                                  }
                                  return now > eventEnd ? (
                                    <button
                                      onClick={() => setFeedbackEvent(event)}
                                      className="glass-button text-purple-400 border border-purple-400/30 hover:bg-purple-400 hover:text-black transition-all inline-flex items-center justify-center self-start px-6 py-2"
                                    >
                                      Feedback
                                    </button>
                                  ) : null;
                                } catch (err) { return null; }
                              })()}
                            </div>

                            {/* Child sub-events grouped under this parent */}
                            {event.childEvents && event.childEvents.length > 0 && (
                              <div className="mt-6 pt-6 border-t border-white/10">
                                <button
                                  onClick={() => toggleSubEvents(event._id)}
                                  className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition-colors mb-3"
                                >
                                  <span className="text-blue-400">
                                    {expandedSubEvents[event._id] ? '▼' : '▶'}
                                  </span>
                                  {expandedSubEvents[event._id] ? 'Hide' : 'View'} Sub Events ({event.childEvents.length})
                                </button>
                                {expandedSubEvents[event._id] && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {event.childEvents.map(child => (
                                      <div key={child._id} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all hover:scale-[1.02] hover:border-blue-500/30">
                                        {child.images && child.images.length > 0 && (
                                          <div className="w-full h-20 rounded-lg overflow-hidden mb-2">
                                            <SmartImage src={child.images[0]} alt={child.title} className="w-full h-full object-cover" />
                                          </div>
                                        )}
                                        <div className="font-semibold text-white text-sm mb-1">{child.title}</div>
                                        <div className="text-[10px] text-white/50 mb-2">
                                          {new Date(child.date).toLocaleDateString()} &middot; {child.registrationCount || 0} participants
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                          {child.images && child.images.length > 0 && (
                                            <button onClick={() => setSelectedEventGallery(child)}
                                              className="text-[10px] text-vortex-blue hover:underline">📸 Photos</button>
                                          )}
                                          {child.galleryDriveLink && (
                                            <button onClick={() => window.open(child.galleryDriveLink, '_blank')}
                                              className="text-[10px] text-green-400 hover:underline">📁 Drive</button>
                                          )}
                                          <button onClick={() => setFeedbackEvent(child)}
                                            className="text-[10px] text-purple-400 hover:underline">Feedback</button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })}
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
                {groupedPastEvents.map((_, index) => (
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
                  {getIconComponent(selectedSubEvent.icon) && 
                    React.createElement(getIconComponent(selectedSubEvent.icon), { className: "h-10 w-10 text-white" })
                  }
                </div>
                <h3 className="text-3xl font-display font-bold gradient-text mb-2">
                  {selectedSubEvent.title}
                </h3>
                <p className="text-white/70">
                  {selectedSubEvent.description}
                </p>
              </div>

              <div className="space-y-6">
                {/* Sub-Event Images (PRAYOG 1.0 Only) */}
                {selectedSubEvent.images && selectedSubEvent.images.length > 0 && (
                  <div>
                    <h4 className="text-xl font-bold text-white mb-3">Event Photos</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedSubEvent.images.map((img, index) => (
                        <div key={index} className="aspect-video rounded-xl overflow-hidden">
                          <SmartImage src={img} alt={`${selectedSubEvent.title} ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
                  {selectedEventGallery.images.map((img, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="aspect-video rounded-xl sm:rounded-3xl overflow-hidden glass-card group cursor-zoom-in relative"
                    >
                      <SmartImage src={img} alt={`${selectedEventGallery.title} ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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
