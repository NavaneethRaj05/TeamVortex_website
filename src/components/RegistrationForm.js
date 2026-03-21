import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, GraduationCap, MapPin, Plus, X, Trophy, Upload, CheckCircle } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const BRANCHES = [
  'Computer Science Engineering (CSE)',
  'Information Science Engineering (ISE)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical & Electronics Engineering (EEE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Artificial Intelligence & Machine Learning (AI/ML)',
  'Data Science',
  'Other Engineering',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const COLLEGE_TYPES = ['VTU Affiliated', 'Autonomous', 'Deemed University', 'Other'];

const TSHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const DIETARY = ['Vegetarian', 'Non-Vegetarian', 'Vegan'];

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Andaman & Nicobar Islands','Chandigarh',
  'Dadra & Nagar Haveli','Daman & Diu','Delhi','Jammu & Kashmir','Ladakh',
  'Lakshadweep','Puducherry',
];

const emptyMember = () => ({
  name: '', email: '', phone: '', college: '', collegeType: '',
  idNumber: '', department: '', year: '', state: 'Karnataka', city: '',
  idCardFile: null, idCardFileName: '',
  tshirtSize: '', dietaryPreference: '',
  emergencyContactName: '', emergencyContactPhone: '',
  specialRequirements: '',
});

// ─── Email validator ───────────────────────────────────────────────────────────

function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return { isValid: false, error: 'Invalid email format' };
  if (email.includes('..') || email.includes('@@')) return { isValid: false, error: 'Invalid email format' };
  const [local] = email.split('@');
  if (local.length < 3) return { isValid: false, error: 'Email username too short' };
  return { isValid: true, error: null };
}

// ─── USN / Student ID field with VTU format validation ────────────────────────
// VTU USN format: digit + 2letters + 2digits + 2letters + 3digits  e.g. 4AD23CS075
const USN_REGEX = /^\d[A-Z]{2}\d{2}[A-Z]{2}\d{3}$/;

const UsnField = ({ value, onChange }) => {
  const [touched, setTouched] = useState(false);
  const isValid = USN_REGEX.test(value);
  const showError = touched && value.length > 0 && !isValid;

  const handleChange = (e) => {
    // Only allow alphanumeric, strip everything else, uppercase
    const raw = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 10);
    onChange(raw);
  };

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-0.5">
        Student ID / USN *
      </label>
      <div className="relative">
        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={15} />
        <input
          type="text"
          required
          className={`w-full input-glass pl-9 pr-8 p-3 rounded-lg text-sm uppercase tracking-widest font-mono ${
            showError ? 'border-red-400/60' : isValid && value ? 'border-green-400/60' : ''
          }`}
          placeholder="e.g. 1XX23XX000"
          value={value}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          maxLength={10}
        />
        {isValid && value && (
          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" size={14} />
        )}
        {showError && (
          <X className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" size={14} />
        )}
      </div>
      {/* Format hint always visible */}
      <p className="text-[10px] text-white/30 ml-1 font-mono tracking-wider">
        Format: <span className="text-white/50">1</span>
        <span className="text-vortex-blue">XX</span>
        <span className="text-white/50">23</span>
        <span className="text-vortex-blue">XX</span>
        <span className="text-white/50">000</span>
        <span className="text-white/20 ml-2 not-italic font-sans normal-case tracking-normal">
          (digit · college code · year · branch · roll no)
        </span>
      </p>
      {showError && (
        <p className="text-red-400 text-[10px] ml-1">
          Invalid USN format — expected like 4AD23CS075
        </p>
      )}
    </div>
  );
};

// ─── Single member card ────────────────────────────────────────────────────────

const MemberCard = ({ member, index, isPrimary, canRemove, onChange, onRemove, showAge, showTshirt, showDietary }) => {
  const [emailState, setEmailState] = useState({ isValid: null, error: null });

  const handleEmailBlur = () => {
    if (member.email) setEmailState(validateEmail(member.email));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Only JPG, PNG, or PDF files are allowed.');
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File must be under 2MB.');
      e.target.value = '';
      return;
    }
    onChange('idCardFile', file);
    onChange('idCardFileName', file.name);
  };

  const field = (label, key, type = 'text', extra = {}) => (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-0.5">{label}</label>
      <input
        type={type}
        className="w-full input-glass p-3 rounded-lg text-sm"
        value={member[key] || ''}
        onChange={e => onChange(key, e.target.value)}
        {...extra}
      />
    </div>
  );

  const selectField = (label, key, options) => (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-0.5">{label}</label>
      <select
        className="w-full input-glass p-3 rounded-lg text-sm bg-[#1a1a1a] text-white"
        value={member[key] || ''}
        onChange={e => onChange(key, e.target.value)}
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative p-4 sm:p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-vortex-blue text-black text-xs font-black flex items-center justify-center rounded-lg">
            {index + 1}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
            Member {index + 1}
          </span>
          {isPrimary && (
            <span className="flex items-center gap-1 bg-vortex-blue/20 text-vortex-blue text-[9px] font-black px-2 py-0.5 rounded-full border border-vortex-blue/30 uppercase">
              <Trophy size={9} /> Lead
            </span>
          )}
        </div>
        {canRemove && (
          <button type="button" onClick={onRemove}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Core fields */}
      <div className="grid grid-cols-1 gap-3">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-0.5">Full Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={15} />
            <input
              type="text" required
              className="w-full input-glass pl-9 p-3 rounded-lg text-sm"
              placeholder="Enter full name"
              value={member.name}
              onChange={e => onChange('name', e.target.value)}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-0.5">Email Address *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={15} />
            <input
              type="email" required
              className={`w-full input-glass pl-9 pr-8 p-3 rounded-lg text-sm ${
                emailState.isValid === false ? 'border-red-400/60' :
                emailState.isValid === true ? 'border-green-400/60' : ''
              }`}
              placeholder="email@example.com"
              value={member.email}
              onChange={e => { onChange('email', e.target.value); setEmailState({ isValid: null, error: null }); }}
              onBlur={handleEmailBlur}
            />
            {emailState.isValid === true && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" size={14} />}
            {emailState.isValid === false && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" size={14} />}
          </div>
          {emailState.error && <p className="text-red-400 text-[10px] ml-1">{emailState.error}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-0.5">Phone Number *</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={15} />
            <input
              type="tel" required
              className="w-full input-glass pl-9 p-3 rounded-lg text-sm"
              placeholder="10-digit mobile number"
              value={member.phone}
              onChange={e => onChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              minLength={10} maxLength={10}
            />
          </div>
        </div>

        {/* College + College Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-0.5">College / Institution *</label>
            <input
              type="text" required
              className="w-full input-glass p-3 rounded-lg text-sm"
              placeholder="College name"
              value={member.college}
              onChange={e => onChange('college', e.target.value)}
            />
          </div>
          {selectField('College Type *', 'collegeType', COLLEGE_TYPES)}
        </div>

        {/* USN */}
        <UsnField value={member.idNumber} onChange={val => onChange('idNumber', val)} />

        {/* Branch + Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {selectField('Branch / Department *', 'department', BRANCHES)}
          {selectField('Year of Study *', 'year', YEARS)}
        </div>

        {/* State + City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-0.5">State *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={15} />
              <select
                required
                className="w-full input-glass pl-9 p-3 rounded-lg text-sm bg-[#1a1a1a] text-white"
                value={member.state}
                onChange={e => onChange('state', e.target.value)}
              >
                <option value="">Select state...</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {field('City *', 'city', 'text', { required: true, placeholder: 'City' })}
        </div>

        {/* Age (conditional) */}
        {showAge && field('Age *', 'age', 'number', { required: true, min: 1, max: 100, placeholder: 'Age' })}
      </div>

      {/* ID Card Upload */}
      <div className="space-y-2 pt-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-0.5">College ID Card *</label>
        <input
          type="file" accept="image/jpeg,image/png,application/pdf"
          className="hidden" id={`id-card-${index}`}
          onChange={handleFileChange}
        />
        {member.idCardFileName ? (
          <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
            <span className="text-green-300 text-xs flex-1 truncate">{member.idCardFileName}</span>
            <button type="button"
              onClick={() => { onChange('idCardFile', null); onChange('idCardFileName', ''); }}
              className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => document.getElementById(`id-card-${index}`).click()}
            className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl hover:border-vortex-blue/40 hover:bg-vortex-blue/5 transition-all flex flex-col items-center gap-2 group touch-manipulation"
          >
            <Upload size={20} className="text-white/30 group-hover:text-vortex-blue transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-vortex-blue transition-colors">Upload ID Card</span>
            <span className="text-[9px] text-white/20">JPG, PNG, PDF — Max 2MB</span>
          </button>
        )}
      </div>

      {/* Optional fields — only shown if event admin enabled them */}
      {(showTshirt || showDietary) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-white/5">
          {showTshirt && selectField('T-Shirt Size', 'tshirtSize', TSHIRT_SIZES)}
          {showDietary && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-0.5">Dietary Preference</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {DIETARY.map(d => (
                  <label key={d} className="flex items-center gap-1.5 cursor-pointer touch-manipulation">
                    <input type="radio" name={`diet-${index}`} value={d}
                      checked={member.dietaryPreference === d}
                      onChange={() => onChange('dietaryPreference', d)}
                      className="flex-shrink-0"
                    />
                    <span className="text-xs text-white/70">{d.split('-')[0]}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Emergency Contact */}
      <div className="space-y-2 pt-1 border-t border-white/5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Emergency Contact</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {field('Name', 'emergencyContactName', 'text', { placeholder: 'Parent / Guardian name' })}
          {field('Phone', 'emergencyContactPhone', 'tel', { placeholder: '10-digit number' })}
        </div>
      </div>

      {/* Special Requirements */}
      <div className="space-y-1 pt-1 border-t border-white/5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Special Requirements (Optional)</label>
        <textarea
          className="w-full input-glass p-3 rounded-lg text-sm h-16 resize-none"
          placeholder="Accessibility needs, allergies, etc."
          value={member.specialRequirements || ''}
          onChange={e => onChange('specialRequirements', e.target.value)}
        />
      </div>
    </motion.div>
  );
};

// ─── Main RegistrationForm component ──────────────────────────────────────────

const RegistrationForm = ({ event, onSubmit, submitting }) => {
  const isSolo = event.registrationType === 'Solo';
  const isDuo = event.registrationType === 'Duo';
  const minMembers = isSolo ? 1 : isDuo ? 2 : (event.minTeamSize || 2);
  const maxMembers = isSolo ? 1 : isDuo ? 2 : (event.maxTeamSize || 5);
  const showAge = !!(event.eligibility?.minAge || event.eligibility?.maxAge);
  const showTshirt = !!event.collectTshirtSize;
  const showDietary = !!event.collectDietaryPreference;

  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState([emptyMember()]);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedRefund, setAgreedRefund] = useState(false);

  const updateMember = useCallback((index, key, value) => {
    setMembers(prev => prev.map((m, i) => i === index ? { ...m, [key]: value } : m));
  }, []);

  const addMember = () => {
    if (members.length < maxMembers) setMembers(prev => [...prev, emptyMember()]);
  };

  const removeMember = (index) => {
    if (members.length > minMembers) setMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreedTerms || !agreedRefund) {
      alert('Please agree to the terms and conditions to proceed.');
      return;
    }
    if (members.length < minMembers) {
      alert(`Minimum ${minMembers} member${minMembers > 1 ? 's' : ''} required.`);
      return;
    }
    const missingId = members.findIndex(m => !m.idCardFileName);
    if (missingId !== -1) {
      alert(`Please upload the College ID card for Member ${missingId + 1}.`);
      return;
    }
    const invalidUsn = members.findIndex(m => !USN_REGEX.test(m.idNumber));
    if (invalidUsn !== -1) {
      alert(`Invalid USN for Member ${invalidUsn + 1}. Expected format like 4AD23CS075`);
      return;
    }
    onSubmit({ teamName: isSolo ? '' : teamName, members });
  };

  // Fee calculation
  const feePerUnit = event.price || 0;
  const isPerTeam = event.feeType === 'per_team' || event.teamPricing?.perTeam;
  const totalFee = isPerTeam ? feePerUnit : feePerUnit * members.length;
  const gstAmount = event.gstEnabled ? Math.round(totalFee * ((event.gstPercent || 18) / 100)) : 0;
  const grandTotal = totalFee + gstAmount;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Event summary banner */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-vortex-blue/10 to-purple-500/10 rounded-xl border border-vortex-blue/20">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span className="text-white font-bold">{event.title}</span>
          <span className="text-white/50">•</span>
          <span className="text-vortex-blue font-bold">{event.registrationType}</span>
          {feePerUnit > 0 ? (
            <span className="text-green-400 font-bold ml-auto">
              {isPerTeam ? `₹${feePerUnit} flat` : `₹${feePerUnit} × ${members.length} = ₹${totalFee}`}
            </span>
          ) : (
            <span className="text-green-400 font-bold ml-auto">FREE</span>
          )}
        </div>
      </div>

      {/* Team Name — hidden for Solo */}
      {!isSolo && (
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-0.5">Team Name *</label>
          <input
            type="text" required
            className="w-full input-glass p-3 rounded-lg text-sm font-bold uppercase"
            placeholder="Enter your team name"
            value={teamName}
            onChange={e => setTeamName(e.target.value.toUpperCase())}
          />
        </div>
      )}

      {/* Attendees header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-2">
        <h4 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
          <span className="text-vortex-blue italic">{'//'}</span> Attendees
        </h4>
        <span className="text-[10px] text-white/40 font-bold uppercase">
          {members.length} / {maxMembers} &nbsp;·&nbsp; MIN {minMembers}
        </span>
      </div>

      {/* Member cards */}
      <AnimatePresence>
        {members.map((member, idx) => (
          <MemberCard
            key={idx}
            member={member}
            index={idx}
            isPrimary={idx === 0}
            canRemove={!isSolo && members.length > minMembers}
            onChange={(key, val) => updateMember(idx, key, val)}
            onRemove={() => removeMember(idx)}
            showAge={showAge}
            showTshirt={showTshirt}
            showDietary={showDietary}
          />
        ))}
      </AnimatePresence>

      {/* Add Member — hidden for Solo, disabled at max */}
      {!isSolo && members.length < maxMembers && (
        <button
          type="button" onClick={addMember}
          className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest text-white/40 hover:border-vortex-blue/40 hover:text-vortex-blue hover:bg-vortex-blue/5 transition-all flex items-center justify-center gap-2 group touch-manipulation"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          Add Member ({members.length}/{maxMembers})
        </button>
      )}

      {/* Min members warning */}
      {members.length < minMembers && (
        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 text-xs font-bold text-center">
          Minimum {minMembers} members required
        </div>
      )}

      {/* Fee breakdown */}
      {feePerUnit > 0 && (
        <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl space-y-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-green-400 mb-3">Fee Breakdown</div>
          <div className="flex justify-between text-xs">
            <span className="text-white/60">{isPerTeam ? 'Team Fee' : `₹${feePerUnit} × ${members.length} member${members.length > 1 ? 's' : ''}`}</span>
            <span className="text-white">₹{totalFee}</span>
          </div>
          {event.gstEnabled && (
            <div className="flex justify-between text-xs">
              <span className="text-white/50">GST ({event.gstPercent || 18}%)</span>
              <span className="text-white/70">₹{gstAmount}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-2">
            <span className="text-white">Total</span>
            <span className="text-green-400">₹{grandTotal}</span>
          </div>
        </div>
      )}

      {/* Terms */}
      <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Terms & Conditions</div>
        <label className="flex items-center gap-3 cursor-pointer touch-manipulation">
          <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} className="flex-shrink-0" />
          <span className="text-xs text-white/70 leading-relaxed">I agree to the event terms and conditions</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer touch-manipulation">
          <input type="checkbox" checked={agreedRefund} onChange={e => setAgreedRefund(e.target.checked)} className="flex-shrink-0" />
          <span className="text-xs text-white/70 leading-relaxed">I agree to the refund and cancellation policy</span>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || members.length < minMembers || !agreedTerms || !agreedRefund}
        className="w-full glass-button bg-vortex-blue text-black font-black py-4 text-sm uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
      >
        {submitting ? (
          <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Processing...</>
        ) : (
          <>{feePerUnit > 0 ? `Proceed to Payment — ₹${grandTotal}` : 'Register Now'}</>
        )}
      </button>
    </form>
  );
};

const RegistrationFormMemo = React.memo(RegistrationForm);
export default RegistrationFormMemo;
