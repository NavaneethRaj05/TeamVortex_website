import React, { useState, useEffect, useMemo } from 'react';
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
    success: null
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
  const [rsvpStatus, setRsvpStatus] = useState({ loading: false, message: '', type: '' });
  const [feedbackEvent, setFeedbackEvent] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ studentId: '', name: '', rating: 5, comment: '' });
  const [emailValidation, setEmailValidation] = useState({});

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
      setRsvpStatus({ loading: false, message: '', type: '' });
      setShowingPayment(false);
      setPaymentInfo(null);
      setCurrentRegistrationIndex(null);
    }
  }, [rsvpEvent]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    // Use lightweight endpoint for faster initial loading
    fetch(`${API_BASE_URL}/api/events/lightweight`)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching events:', err);
        // Fallback to regular endpoint if lightweight fails
        fetch(`${API_BASE_URL}/api/events`)
          .then(res => res.json())
          .then(data => {
            setEvents(data);
            setLoading(false);
          })
          .catch(fallbackErr => {
            console.error('Error fetching events (fallback):', fallbackErr);
            setLoading(false);
          });
      });
  };

  // Email validation function
  const validateEmail = (email, memberIndex) => {
    const validationResult = {
      isValid: false,
      errors: [],
      warnings: []
    };

    // Basic format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      validationResult.errors.push('Invalid email format');
      return validationResult;
    }

    // Extract domain and local part
    const [localPart, domain] = email.split('@');
    const domainLower = domain.toLowerCase();

    // Check for common typos in popular domains
    const commonDomains = {
      'gmail.com': ['gmai.com', 'gmial.com', 'gmail.co', 'gmaill.com', 'gmil.com'],
      'yahoo.com': ['yaho.com', 'yahoo.co', 'yahooo.com', 'yhoo.com'],
      'hotmail.com': ['hotmai.com', 'hotmial.com', 'hotmail.co'],
      'outlook.com': ['outlok.com', 'outlook.co', 'outloo.com'],
      'college.edu': ['colege.edu', 'college.ed', 'collge.edu']
    };

    let suggestedDomain = null;
    for (const [correct, typos] of Object.entries(commonDomains)) {
      if (typos.includes(domainLower)) {
        suggestedDomain = correct;
        break;
      }
    }

    if (suggestedDomain) {
      validationResult.errors.push(`Did you mean ${localPart}@${suggestedDomain}?`);
      return validationResult;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /test/i,
      /fake/i,
      /dummy/i,
      /temp/i,
      /example/i,
      /sample/i,
      /^[a-z]{1,3}@/,  // Very short local parts
      /^\d+@/,         // Only numbers in local part
      /^[a-z]+\d{1,2}@/, // Simple pattern like abc1@
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(email));
    if (isSuspicious) {
      validationResult.warnings.push('Email appears suspicious. Please use your real email address.');
    }

    // Check for educational domains (preferred for students)
    const eduDomains = ['.edu', '.ac.', '.edu.', 'college', 'university', 'institute', 'school'];
    const isEduDomain = eduDomains.some(edu => domainLower.includes(edu));
    
    // Check for common personal email providers
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'protonmail.com'];
    const isPersonalDomain = personalDomains.includes(domainLower);

    // Validate domain exists (basic check)
    if (!domainLower.includes('.') || domainLower.endsWith('.') || domainLower.startsWith('.')) {
      validationResult.errors.push('Invalid domain format');
      return validationResult;
    }

    // Check for minimum length requirements
    if (localPart.length < 3) {
      validationResult.errors.push('Email username too short (minimum 3 characters)');
    }

    if (domain.length < 4) {
      validationResult.errors.push('Domain name too short');
    }

    // Check for consecutive dots or special characters
    if (email.includes('..') || email.includes('@@')) {
      validationResult.errors.push('Invalid email format (consecutive special characters)');
    }

    // Check for valid TLD
    const tld = domain.split('.').pop().toLowerCase();
    const validTlds = ['com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'co', 'in', 'uk', 'de', 'fr', 'jp', 'au', 'ca', 'br', 'ru', 'cn', 'it', 'es', 'nl', 'se', 'no', 'dk', 'fi', 'pl', 'be', 'ch', 'at', 'ie', 'nz', 'za', 'mx', 'ar', 'cl', 'pe', 'co', 'kr', 'th', 'sg', 'my', 'ph', 'id', 'vn', 'bd', 'pk', 'lk', 'np', 'mm', 'kh', 'la', 'bn', 'mv'];
    
    if (!validTlds.includes(tld)) {
      validationResult.warnings.push('Uncommon domain extension. Please verify your email is correct.');
    }

    // Additional validation for educational events
    if (rsvpEvent && rsvpEvent.eventType === 'Intra-College') {
      if (!isEduDomain && !email.toLowerCase().includes('navkis')) {
        validationResult.warnings.push('For college events, please use your college email if available.');
      }
    }

    // Check for duplicate emails in the same registration
    const currentEmails = rsvpForm.members.map(m => m.email.toLowerCase()).filter(e => e);
    const duplicateCount = currentEmails.filter(e => e === email.toLowerCase()).length;
    if (duplicateCount > 1) {
      validationResult.errors.push('This email is already used by another team member');
    }

    // If no errors, mark as valid
    if (validationResult.errors.length === 0) {
      validationResult.isValid = true;
    }

    return validationResult;
  };

  // Real-time email validation
  const handleEmailChange = (memberIndex, email) => {
    updateMember(memberIndex, 'email', email);
    
    if (email.length > 3) {
      const validation = validateEmail(email, memberIndex);
      setEmailValidation(prev => ({
        ...prev,
        [memberIndex]: validation
      }));
    } else {
      setEmailValidation(prev => ({
        ...prev,
        [memberIndex]: { isValid: false, errors: [], warnings: [] }
      }));
    }
  };

  const now = new Date();

  const displayableEvents = events.filter(e => e.status !== 'draft');

  const prayogEvent = useMemo(() => {
    return displayableEvents.find(e => (e.title || '').trim().toLowerCase() === 'prayog 1.0');
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
  }).sort((a, b) => {
    if ((b.priority || 0) !== (a.priority || 0)) {
      return (b.priority || 0) - (a.priority || 0);
    }
    return new Date(b.date) - new Date(a.date);
  });

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

    // Validate form data
    const validationResult = validateRegistrationForm();
    if (!validationResult.isValid) {
      setRegistrationFlow(prev => ({
        ...prev,
        step: 'error',
        error: validationResult.error,
        canSubmit: true
      }));
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

    const submitData = forceData ? { ...rsvpForm, ...forceData } : rsvpForm;

    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${rsvpEvent._id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }

      const data = await res.json();

      // Handle successful registration
      if (rsvpEvent.price > 0 && !forceData) {
        // Paid event - initiate payment flow
        await initiatePaymentFlow(data);
      } else {
        // Free event or payment already processed
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

  // Validate registration form
  const validateRegistrationForm = () => {
    // Email validation
    const emailErrors = [];
    rsvpForm.members.forEach((member, index) => {
      if (member.email) {
        const validation = validateEmail(member.email, index);
        if (!validation.isValid) {
          emailErrors.push(`Member ${index + 1}: ${validation.errors.join(', ')}`);
        }
      }
    });

    if (emailErrors.length > 0) {
      return {
        isValid: false,
        error: `Please fix email errors:\n${emailErrors.join('\n')}`
      };
    }

    // Required fields validation
    const requiredFields = ['name', 'email', 'phone'];
    for (const member of rsvpForm.members) {
      for (const field of requiredFields) {
        if (!member[field] || member[field].trim() === '') {
          return {
            isValid: false,
            error: `Please fill in all required fields for all members`
          };
        }
      }
    }

    // Team size validation
    const minSize = rsvpEvent.registrationType === 'Solo' ? 1
      : (rsvpEvent.registrationType === 'Duo' ? 2
        : (rsvpEvent.minTeamSize || 1));
    
    if (rsvpForm.members.length < minSize) {
      return {
        isValid: false,
        error: `Please add ${minSize - rsvpForm.members.length} more member(s)`
      };
    }

    return { isValid: true };
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
      setCurrentRegistrationIndex(registrationData.registrationIndex);
      
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
      success: data.message || 'Registration successful!'
    }));

    setTimeout(() => {
      resetRegistrationFlow();
      fetchEvents(); // Refresh events data
    }, 2500);
  };

  // Reset registration flow
  const resetRegistrationFlow = () => {
    setRsvpEvent(null);
    setShowingPayment(false);
    setPaymentInfo(null);
    setCurrentRegistrationIndex(null);
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
          city: '',
          idCardFile: ''
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
            <div className="p-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-4 tracking-wider">
                  <span className="gradient-text">{prayogDisplay.title}</span>
                </h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-white/60">
                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                    {prayogDisplay.date}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                    {prayogDisplay.venue}
                  </span>
                </div>
              </div>

              <div className="text-white/80 max-w-4xl mx-auto leading-relaxed space-y-4 text-justify">
                <p>{prayogDisplay.description1}</p>
                <p>{prayogDisplay.description2}</p>
              </div>

              {(prayogDisplay.images?.length > 0 || prayogDisplay.galleryDriveLink) && (
                <div className="mt-8 flex flex-wrap gap-4 justify-center">
                  {prayogDisplay.images?.length > 0 && (
                    <button
                      onClick={() => setSelectedEventGallery({
                        _id: prayogEvent?._id,
                        title: prayogDisplay.title,
                        images: prayogDisplay.images
                      })}
                      className="glass-button text-vortex-blue border border-vortex-blue/30 hover:bg-vortex-blue hover:text-black transition-all inline-flex items-center justify-center self-start px-6 py-2"
                    >
                      📸 View Photos
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  )}

                  {prayogDisplay.galleryDriveLink && (
                    <button
                      onClick={() => window.open(prayogDisplay.galleryDriveLink, '_blank')}
                      className="glass-button text-green-400 border border-green-400/30 hover:bg-green-400 hover:text-black transition-all inline-flex items-center justify-center self-start px-6 py-2"
                    >
                      📁 Drive Gallery
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  )}
                </div>
              )}

              {prayogSubEvents?.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-xl font-bold text-white/80 mb-4 text-center">Sub-Events</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {prayogSubEvents.map((subEvent, index) => {
                      const IconComponent = getIconComponent(subEvent.icon);

                      return (
                        <button
                          key={`prayog-subevent-${subEvent.title || index}`}
                          onClick={() => setSelectedSubEvent(subEvent)}
                          className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all text-left"
                        >
                          <div className={`w-10 h-10 bg-gradient-to-br ${subEvent.color || 'from-blue-500 to-purple-500'} rounded-xl flex items-center justify-center mb-3`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="text-sm font-semibold text-white">{subEvent.title}</div>
                          {subEvent.duration && (
                            <div className="text-xs text-white/50 mt-1">{subEvent.duration}</div>
                          )}
                          {subEvent.participants && (
                            <div className="text-[11px] text-white/40 mt-1">{subEvent.participants}</div>
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {upcomingEvents.map((event, eventIndex) => {
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
                      <img src={event.images[0]} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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
                    </div>

                    {/* Sub-Events Display */}
                    {event.subEvents && event.subEvents.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-white/80 mb-3">Sub-Events</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          {event.subEvents.map((subEvent, index) => {
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

                    <button
                      onClick={() => setRsvpEvent(event)}
                      className="w-full glass-button bg-vortex-blue text-white font-bold py-3"
                    >
                      Register Now
                    </button>
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
                    <div className="whitespace-pre-line">
                      {registrationFlow.success || registrationFlow.error}
                    </div>
                  </div>
                )}

                {/* Registration Form */}
                {registrationFlow.step === 'form' && !showingPayment && (
                  <form onSubmit={handleRsvpSubmit} className="space-y-6 max-h-[60vh] overflow-y-auto px-2 custom-scrollbar">

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
                                    <div className="relative">
                                      <input
                                        type="email" 
                                        placeholder="EMAIL ADDRESS" 
                                        className={`w-full bg-transparent border-b p-3 text-sm outline-none transition-colors text-white ${
                                          emailValidation[idx]?.isValid === false 
                                            ? 'border-red-400 focus:border-red-400' 
                                            : emailValidation[idx]?.isValid === true 
                                              ? 'border-green-400 focus:border-green-400' 
                                              : 'border-white/10 focus:border-vortex-blue'
                                        }`}
                                        required
                                        value={member.email} 
                                        onChange={e => handleEmailChange(idx, e.target.value)}
                                      />
                                      {emailValidation[idx]?.isValid === true && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
                                          ✓
                                        </div>
                                      )}
                                      {emailValidation[idx]?.isValid === false && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                                          ✗
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Email Validation Feedback */}
                                    {emailValidation[idx] && (emailValidation[idx].errors.length > 0 || emailValidation[idx].warnings.length > 0) && (
                                      <div className="mt-2 space-y-1">
                                        {emailValidation[idx].errors.map((error, errorIdx) => (
                                          <div key={errorIdx} className="text-red-400 text-xs flex items-center gap-2">
                                            <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                            {error}
                                          </div>
                                        ))}
                                        {emailValidation[idx].warnings.map((warning, warningIdx) => (
                                          <div key={warningIdx} className="text-yellow-400 text-xs flex items-center gap-2">
                                            <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                                            {warning}
                                          </div>
                                        ))}
                                      </div>
                                    )}
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
                                      type="text" placeholder="ID NUMBER / USN (e.g., 4YG23AD002)" className="w-full bg-transparent border-b border-white/10 p-3 text-sm focus:border-vortex-blue outline-none transition-colors text-white" required
                                      value={member.idNumber} onChange={e => updateMember(idx, 'idNumber', e.target.value)}
                                      minLength={6} maxLength={15} pattern="[A-Za-z0-9]+" title="Please enter alphanumeric USN (letters and numbers only)"
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
                                      <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">Upload Document</label>
                                        <input
                                          type="file"
                                          accept="image/*,.pdf"
                                          className="hidden"
                                          id={`file-upload-${idx}`}
                                          onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                              // Validate file type (more comprehensive)
                                              const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
                                              const fileName = file.name.toLowerCase();
                                              const fileExtension = fileName.split('.').pop();
                                              const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];

                                              if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
                                                alert('❌ Invalid file type!\n\nPlease upload only:\n• Image files: JPG, JPEG, PNG, WebP\n• Document files: PDF\n\nCurrent file: ' + file.name);
                                                e.target.value = '';
                                                return;
                                              }

                                              // Validate file size (max 2MB)
                                              if (file.size > 2 * 1024 * 1024) {
                                                const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                                                alert(`❌ File too large!\n\nFile size: ${fileSizeMB}MB\nMaximum allowed: 2MB\n\nPlease compress your image or choose a smaller file.`);
                                                e.target.value = '';
                                                return;
                                              }

                                              // Validate minimum file size (prevent empty files)
                                              if (file.size < 1024) {
                                                alert('❌ File too small!\n\nThe selected file appears to be empty or corrupted. Please choose a valid document.');
                                                e.target.value = '';
                                                return;
                                              }

                                              // Success - store the file name
                                              updateMember(idx, 'idCardFile', file.name);
                                              console.log('✅ File uploaded successfully:', file.name, `(${(file.size / 1024).toFixed(1)}KB)`);
                                            }
                                          }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => document.getElementById(`file-upload-${idx}`).click()}
                                          className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:border-vortex-blue/30 hover:text-vortex-blue transition-all flex flex-col items-center gap-1 group/upload"
                                        >
                                          <div className="flex items-center gap-2">
                                            <Mail size={16} className="group-hover/upload:scale-110 transition-transform" />
                                            {member.idCardFile ? 'CHANGE DOCUMENT' : 'UPLOAD DOCUMENT'}
                                          </div>
                                          <span className="text-[8px] font-medium text-white/20">
                                            {member.idCardFile ? `Selected: ${member.idCardFile}` : 'Required: Registration Screenshot or College ID Proof (JPG, PNG, PDF - Max 2MB)'}
                                          </span>
                                        </button>
                                      </div>
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
                            // Check email validation status
                            const emailIssues = rsvpForm.members.map((member, idx) => {
                              if (member.email && emailValidation[idx]) {
                                return emailValidation[idx].isValid ? null : `Member ${idx + 1}`;
                              }
                              return member.email ? null : `Member ${idx + 1}`;
                            }).filter(Boolean);

                            return (
                              <div className="pt-8 sticky bottom-0 bg-dark-bg/90 backdrop-blur-sm">
                                {/* Email Validation Summary */}
                                {emailIssues.length > 0 && (
                                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-red-400 text-sm font-bold">⚠️ Email Issues Detected</span>
                                    </div>
                                    <div className="text-red-300 text-xs">
                                      Please fix email validation errors for: {emailIssues.join(', ')}
                                    </div>
                                  </div>
                                )}
                                
                                <button
                                  type="submit" 
                                  disabled={registrationFlow.isSubmitting || !registrationFlow.canSubmit || emailIssues.length > 0}
                                  className={`w-full py-5 rounded-2xl ${
                                    emailIssues.length > 0 || !registrationFlow.canSubmit
                                      ? 'bg-gray-500 cursor-not-allowed' 
                                      : rsvpEvent.capacity > 0 && rsvpEvent.registrations?.length >= rsvpEvent.capacity 
                                        ? 'bg-vortex-orange' 
                                        : 'bg-vortex-blue'
                                  } text-black font-black uppercase tracking-[0.2em] shadow-2xl hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-3 border-t-2 border-white/20`}
                                >
                                  {registrationFlow.isSubmitting ? (
                                    <>
                                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                      {registrationFlow.step === 'processing' ? 'PROCESSING...' : 'PLEASE WAIT...'}
                                    </>
                                  ) : emailIssues.length > 0 ? (
                                    'FIX EMAIL ERRORS FIRST'
                                  ) : !registrationFlow.canSubmit ? (
                                    'PLEASE WAIT...'
                                  ) : (
                                    <>
                                      {rsvpEvent.capacity > 0 && rsvpEvent.registrationCount >= rsvpEvent.capacity 
                                        ? 'JOIN WAITLIST' 
                                        : rsvpEvent.price > 0 
                                          ? `PROCEED TO PAYMENT (₹${rsvpEvent.price})` 
                                          : 'CONFIRM REGISTRATION'
                                      }
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
                    {showingPayment && (
                      <PaymentFlow
                        eventId={rsvpEvent._id}
                        eventTitle={rsvpEvent.title}
                        amount={rsvpEvent.price}
                        paymentInfo={paymentInfo}
                        userEmail={rsvpForm.members[0].email}
                        onComplete={handlePaymentComplete}
                        onCancel={handlePaymentCancel}
                      />
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

        {/* Past Events with Gallery */}
        {pastEvents.length > 0 && (
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
                              {/* Gallery Button - Show images if available */}
                              {event.images && event.images.length > 0 && (
                                <button
                                  onClick={() => setSelectedEventGallery(event)}
                                  className="glass-button text-vortex-blue border border-vortex-blue/30 hover:bg-vortex-blue hover:text-black transition-all inline-flex items-center justify-center self-start px-6 py-2"
                                >
                                  📸 View Photos
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </button>
                              )}

                              {/* Drive Gallery Button - Show if drive link available */}
                              {event.galleryDriveLink && (
                                <button
                                  onClick={() => window.open(event.galleryDriveLink, '_blank')}
                                  className="glass-button text-green-400 border border-green-400/30 hover:bg-green-400 hover:text-black transition-all inline-flex items-center justify-center self-start px-6 py-2"
                                >
                                  📁 Drive Gallery
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </button>
                              )}

                              <button
                                onClick={() => setFeedbackEvent(event)}
                                className="glass-button text-purple-400 border border-purple-400/30 hover:bg-purple-400 hover:text-black transition-all inline-flex items-center justify-center self-start px-6 py-2"
                              >
                                💬 Feedback
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
                          <img src={img} alt={`${selectedSubEvent.title} photo ${index + 1}`} className="w-full h-full object-cover" />
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