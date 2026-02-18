import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Circle, Calendar, Clock, Users, Trophy, Code, Key, 
  Gamepad2, ArrowRight, ArrowLeft, X, AlertCircle, CreditCard, Tag 
} from 'lucide-react';
import API_BASE_URL from '../apiConfig';

const MultiEventRegistration = ({ event, onClose, onSuccess }) => {
  const [step, setStep] = useState('selection'); // 'selection' | 'form' | 'payment' | 'success'
  const [selectedSubEvents, setSelectedSubEvents] = useState([]);
  const [pricing, setPricing] = useState({
    subtotal: 0,
    multiEventDiscount: 0,
    couponDiscount: 0,
    total: 0,
    breakdown: []
  });
  
  const [formData, setFormData] = useState({
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
    appliedCoupon: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Icon mapping
  const getIconComponent = (iconName) => {
    const icons = { Trophy, Code, Key, Gamepad2, Calendar, Users };
    return icons[iconName] || Calendar;
  };

  // Toggle sub-event selection
  const toggleSubEvent = (subEvent) => {
    setSelectedSubEvents(prev => {
      // Use id if available, otherwise use title as fallback
      const eventId = subEvent.id || subEvent.title;
      const isSelected = prev.find(e => (e.id || e.title) === eventId);
      if (isSelected) {
        return prev.filter(e => (e.id || e.title) !== eventId);
      } else {
        // Ensure each sub-event has an id
        return [...prev, { ...subEvent, id: eventId }];
      }
    });
  };

  // Select all sub-events
  const selectAll = () => {
    // Ensure each sub-event has an id
    const eventsWithIds = (event.subEvents || []).map(se => ({
      ...se,
      id: se.id || se.title
    }));
    setSelectedSubEvents(eventsWithIds);
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedSubEvents([]);
  };

  // Calculate pricing whenever selection changes
  useEffect(() => {
    calculatePricing();
  }, [selectedSubEvents, formData.appliedCoupon]);

  const calculatePricing = () => {
    if (selectedSubEvents.length === 0) {
      setPricing({
        subtotal: 0,
        multiEventDiscount: 0,
        couponDiscount: 0,
        total: 0,
        breakdown: []
      });
      return;
    }

    // Calculate subtotal
    const subtotal = selectedSubEvents.reduce((sum, subEvent) => {
      return sum + (subEvent.price || 0);
    }, 0);

    // Calculate multi-event discount
    let multiEventDiscount = 0;
    const eventCount = selectedSubEvents.length;
    
    if (eventCount >= 4) {
      multiEventDiscount = subtotal * 0.25; // 25% off for 4+ events
    } else if (eventCount >= 3) {
      multiEventDiscount = subtotal * 0.20; // 20% off for 3 events
    } else if (eventCount >= 2) {
      multiEventDiscount = subtotal * 0.10; // 10% off for 2 events
    }

    // Calculate coupon discount
    let couponDiscount = 0;
    if (formData.appliedCoupon) {
      const afterMultiDiscount = subtotal - multiEventDiscount;
      if (formData.appliedCoupon.type === 'percentage') {
        couponDiscount = afterMultiDiscount * (formData.appliedCoupon.value / 100);
      } else {
        couponDiscount = formData.appliedCoupon.value;
      }
    }

    // Calculate total
    const total = Math.max(0, subtotal - multiEventDiscount - couponDiscount);

    // Create breakdown
    const breakdown = selectedSubEvents.map(subEvent => ({
      id: subEvent.id,
      title: subEvent.title,
      price: subEvent.price || 0
    }));

    setPricing({
      subtotal,
      multiEventDiscount,
      couponDiscount,
      total,
      breakdown
    });
  };

  // Validate selection step
  const validateSelection = () => {
    if (selectedSubEvents.length === 0) {
      setErrors({ selection: 'Please select at least one event' });
      return false;
    }
    setErrors({});
    return true;
  };

  // Validate form step
  const validateForm = () => {
    const newErrors = {};

    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    }

    formData.members.forEach((member, index) => {
      if (!member.name.trim()) {
        newErrors[`member${index}name`] = 'Name is required';
      }
      if (!member.email.trim()) {
        newErrors[`member${index}email`] = 'Email is required';
      }
      if (!member.phone.trim()) {
        newErrors[`member${index}phone`] = 'Phone is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (step === 'selection') {
      if (validateSelection()) {
        setStep('form');
      }
    } else if (step === 'form') {
      if (validateForm()) {
        setStep('payment');
      }
    }
  };

  // Handle back step
  const handleBack = () => {
    if (step === 'form') {
      setStep('selection');
    } else if (step === 'payment') {
      setStep('form');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${event._id}/register-multiple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedSubEvents: selectedSubEvents.map(se => se.id || se.title),
          teamName: formData.teamName,
          country: formData.country,
          institutionName: formData.institutionName,
          department: formData.department,
          yearOfStudy: formData.yearOfStudy,
          members: formData.members,
          pricing: pricing,
          couponCode: formData.couponCode,
          appliedCoupon: formData.appliedCoupon
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }

      const data = await res.json();
      
      setStep('success');
      setIsSubmitting(false);
      
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Multi-event registration error:', error);
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
      setIsSubmitting(false);
    }
  };

  // Add team member
  const addMember = () => {
    setFormData({
      ...formData,
      members: [...formData.members, {
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
  };

  // Remove team member
  const removeMember = (index) => {
    if (formData.members.length > 1) {
      setFormData({
        ...formData,
        members: formData.members.filter((_, i) => i !== index)
      });
    }
  };

  // Update member field
  const updateMember = (index, field, value) => {
    const newMembers = [...formData.members];
    newMembers[index][field] = value;
    setFormData({ ...formData, members: newMembers });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-dark-bg/95 backdrop-blur-xl border-b border-white/10 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Register for {event.title}
              </h2>
              <p className="text-white/60 text-sm">
                {step === 'selection' && 'Select the events you want to participate in'}
                {step === 'form' && 'Fill in your registration details'}
                {step === 'payment' && 'Complete your payment'}
                {step === 'success' && 'Registration successful!'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white/70" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            {['selection', 'form', 'payment'].map((s, index) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 ${
                  step === s ? 'text-vortex-blue' : 
                  ['selection', 'form', 'payment'].indexOf(step) > index ? 'text-green-400' : 'text-white/30'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    step === s ? 'border-vortex-blue bg-vortex-blue/20' :
                    ['selection', 'form', 'payment'].indexOf(step) > index ? 'border-green-400 bg-green-400/20' : 'border-white/30'
                  }`}>
                    {['selection', 'form', 'payment'].indexOf(step) > index ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium capitalize hidden sm:inline">{s}</span>
                </div>
                {index < 2 && (
                  <div className={`flex-1 h-0.5 ${
                    ['selection', 'form', 'payment'].indexOf(step) > index ? 'bg-green-400' : 'bg-white/30'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Event Selection */}
            {step === 'selection' && (
              <motion.div
                key="selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Quick Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={selectAll}
                    className="px-4 py-2 bg-vortex-blue/20 text-vortex-blue rounded-lg hover:bg-vortex-blue/30 transition-colors text-sm font-medium"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-4 py-2 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>

                {/* Sub-Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(event.subEvents || []).map((subEvent, index) => {
                    const eventId = subEvent.id || subEvent.title;
                    const isSelected = selectedSubEvents.find(e => (e.id || e.title) === eventId);
                    const IconComponent = getIconComponent(subEvent.icon);

                    return (
                      <motion.button
                        key={eventId || `subevent-${index}`}
                        onClick={() => toggleSubEvent(subEvent)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-vortex-blue bg-vortex-blue/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${subEvent.color || 'from-blue-500 to-purple-500'}`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-bold text-white">{subEvent.title}</h3>
                              {isSelected ? (
                                <CheckCircle2 className="w-5 h-5 text-vortex-blue flex-shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-white/30 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-white/60 mb-3 line-clamp-2">
                              {subEvent.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {subEvent.duration && (
                                <span className="px-2 py-1 bg-white/10 rounded-full flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {subEvent.duration}
                                </span>
                              )}
                              {subEvent.participants && (
                                <span className="px-2 py-1 bg-white/10 rounded-full flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {subEvent.participants}
                                </span>
                              )}
                              {subEvent.price > 0 && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full font-bold">
                                  ₹{subEvent.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Error Message */}
                {errors.selection && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 text-sm">{errors.selection}</span>
                  </div>
                )}

                {/* Pricing Summary */}
                {selectedSubEvents.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 border border-vortex-blue/30"
                  >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-vortex-blue" />
                      Price Breakdown
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-white/70">
                        <span>{selectedSubEvents.length} event{selectedSubEvents.length > 1 ? 's' : ''} selected</span>
                      </div>
                      {pricing.breakdown.map((item) => (
                        <div key={item.id} className="flex justify-between text-white/60 text-sm">
                          <span>{item.title}</span>
                          <span>₹{item.price}</span>
                        </div>
                      ))}
                      <div className="border-t border-white/10 pt-2 mt-2">
                        <div className="flex justify-between text-white/70">
                          <span>Subtotal</span>
                          <span>₹{pricing.subtotal}</span>
                        </div>
                        {pricing.multiEventDiscount > 0 && (
                          <div className="flex justify-between text-green-400">
                            <span>Multi-event discount ({selectedSubEvents.length >= 4 ? '25%' : selectedSubEvents.length >= 3 ? '20%' : '10%'})</span>
                            <span>-₹{pricing.multiEventDiscount.toFixed(0)}</span>
                          </div>
                        )}
                        {pricing.couponDiscount > 0 && (
                          <div className="flex justify-between text-green-400">
                            <span>Coupon discount</span>
                            <span>-₹{pricing.couponDiscount.toFixed(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-white/10 pt-2 mt-2">
                        <div className="flex justify-between text-white font-bold text-lg">
                          <span>Total</span>
                          <span className="text-vortex-blue">₹{pricing.total.toFixed(0)}</span>
                        </div>
                      </div>
                      {pricing.multiEventDiscount > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg mt-3">
                          <Tag className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm">
                            You're saving ₹{pricing.multiEventDiscount.toFixed(0)} with multi-event registration!
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: Registration Form */}
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-4 bg-vortex-blue/10 border border-vortex-blue/30 rounded-lg">
                  <p className="text-white/80 text-sm">
                    Registering for: <span className="font-bold text-vortex-blue">
                      {selectedSubEvents.map(e => e.title).join(', ')}
                    </span>
                  </p>
                </div>

                {/* Team Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Team Information</h3>
                  <input
                    type="text"
                    placeholder="Team Name *"
                    className="w-full input-glass p-3 rounded-lg"
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  />
                  {errors.teamName && (
                    <p className="text-red-400 text-sm">{errors.teamName}</p>
                  )}
                </div>

                {/* Team Members */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Team Members</h3>
                    <button
                      onClick={addMember}
                      className="px-4 py-2 bg-vortex-blue/20 text-vortex-blue rounded-lg hover:bg-vortex-blue/30 transition-colors text-sm font-medium"
                    >
                      + Add Member
                    </button>
                  </div>

                  {formData.members.map((member, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-white">Member {index + 1}</h4>
                        {formData.members.length > 1 && (
                          <button
                            onClick={() => removeMember(index)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Name *"
                          className="input-glass p-3 rounded-lg"
                          value={member.name}
                          onChange={(e) => updateMember(index, 'name', e.target.value)}
                        />
                        <input
                          type="email"
                          placeholder="Email *"
                          className="input-glass p-3 rounded-lg"
                          value={member.email}
                          onChange={(e) => updateMember(index, 'email', e.target.value)}
                        />
                        <input
                          type="tel"
                          placeholder="Phone *"
                          className="input-glass p-3 rounded-lg"
                          value={member.phone}
                          onChange={(e) => updateMember(index, 'phone', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="College"
                          className="input-glass p-3 rounded-lg"
                          value={member.college}
                          onChange={(e) => updateMember(index, 'college', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Total Amount: ₹{pricing.total.toFixed(0)}
                  </h3>
                  <p className="text-white/60">Complete your payment to confirm registration</p>
                </div>

                <div className="glass-card p-6">
                  <h4 className="font-bold text-white mb-4">You're registering for:</h4>
                  <ul className="space-y-2">
                    {selectedSubEvents.map((subEvent) => (
                      <li key={subEvent.id} className="flex justify-between text-white/70">
                        <span>• {subEvent.title}</span>
                        <span>₹{subEvent.price}</span>
                      </li>
                    ))}
                  </ul>
                  {pricing.multiEventDiscount > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex justify-between text-green-400">
                        <span>Multi-event discount</span>
                        <span>-₹{pricing.multiEventDiscount.toFixed(0)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-white/60 text-sm mb-4">
                    Payment integration would go here (UPI, QR code, etc.)
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
                <p className="text-white/60 mb-6">
                  You've been registered for {selectedSubEvents.length} event{selectedSubEvents.length > 1 ? 's' : ''}
                </p>
                <div className="space-y-2 text-white/70">
                  {selectedSubEvents.map((subEvent) => (
                    <div key={subEvent.id} className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span>{subEvent.title}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {step !== 'success' && (
          <div className="sticky bottom-0 bg-dark-bg/95 backdrop-blur-xl border-t border-white/10 p-6">
            <div className="flex justify-between gap-4">
              {step !== 'selection' && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              )}
              <button
                onClick={step === 'payment' ? handleSubmit : handleNext}
                disabled={isSubmitting || (step === 'selection' && selectedSubEvents.length === 0)}
                className="flex-1 px-6 py-3 bg-vortex-blue text-black font-bold rounded-lg hover:bg-vortex-blue/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {step === 'payment' ? 'Complete Registration' : 'Continue'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MultiEventRegistration;
