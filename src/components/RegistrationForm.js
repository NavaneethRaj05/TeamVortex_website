import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Mail, Phone, Plus, X, Trophy, Upload, CheckCircle, ChevronDown } from 'lucide-react';

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
  tshirtSize: '', dietaryPreference: '', specialRequirements: '',
});

function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return { isValid: false, error: 'Invalid email format' };
  const [local] = email.split('@');
  if (local.length < 3) return { isValid: false, error: 'Email too short' };
  return { isValid: true, error: null };
}

const USN_REGEX = /^\d[A-Z]{2}\d{2}[A-Z]{2}\d{3}$/;

// ─── Shared input styles ──────────────────────────────────────────────────────
const inputCls = "w-full bg-[#111] border border-white/20 text-white rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-vortex-blue/70 transition-[border-color] placeholder-white/40";
const labelCls = "block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider";

// ─── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, children, error }) => (
  <div>
    <label className={labelCls}>{label}</label>
    {children}
    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

// ─── Icon input ────────────────────────────────────────────────────────────────
const IconInput = ({ icon: Icon, error, success, children }) => (
  <div className={`flex items-center bg-[#111] border rounded-xl overflow-hidden ${
    error ? 'border-red-400/60' : success ? 'border-green-400/60' : 'border-white/20 focus-within:border-vortex-blue/70'
  }`}>
    {Icon && <Icon className="ml-3.5 flex-shrink-0 text-white/30" size={16} />}
    {children}
    {success && <CheckCircle className="mr-3 flex-shrink-0 text-green-400" size={15} />}
    {error && <X className="mr-3 flex-shrink-0 text-red-400" size={15} />}
  </div>
);

// ─── Select ────────────────────────────────────────────────────────────────────
const Select = ({ value, onChange, placeholder, options, required }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      required={required}
      className={`${inputCls} appearance-none pr-10 cursor-pointer`}
      style={{ backgroundImage: 'none' }}
    >
      <option value="">{placeholder || 'Select...'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={16} />
  </div>
);

// ─── USN Field ─────────────────────────────────────────────────────────────────
const UsnField = ({ value, onChange }) => {
  const [touched, setTouched] = useState(false);
  const isValid = USN_REGEX.test(value);
  const showError = touched && value.length > 0 && !isValid;

  return (
    <Field label="Student ID / USN *" error={showError ? 'Expected format: 4AD23CS075' : null}>
      <IconInput error={showError} success={isValid && value}>
        <input
          type="text"
          className="flex-1 bg-[#111] px-3 py-3.5 text-base text-white placeholder-white/35 focus:outline-none min-w-0 uppercase tracking-widest font-mono autofill-dark"
          placeholder="e.g. 4AD23CS075"
          value={value}
          onChange={e => onChange(e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 10))}
          onBlur={() => setTouched(true)}
          maxLength={10}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
        />
      </IconInput>
      <p className="text-[11px] text-white/25 mt-1">digit · college code · year · branch · roll no</p>
    </Field>
  );
};

// ─── Member Card — pure CSS, no framer-motion ─────────────────────────────────
const MemberCard = ({ member, index, isPrimary, canRemove, onChange, onRemove, showAge, showTshirt, showDietary }) => {
  const [emailState, setEmailState] = useState({ isValid: null, error: null });
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg','image/jpg','image/png','application/pdf'].includes(file.type)) {
      alert('Only JPG, PNG, or PDF files are allowed.'); e.target.value = ''; return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('File must be under 2MB.'); e.target.value = ''; return;
    }
    onChange('idCardFile', file);
    onChange('idCardFileName', file.name);
  };

  return (
    <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 bg-vortex-blue text-black text-xs font-black flex items-center justify-center rounded-lg flex-shrink-0">
            {index + 1}
          </span>
          <span className="text-sm font-bold text-white">Member {index + 1}</span>
          {isPrimary && (
            <span className="flex items-center gap-1 bg-vortex-blue/20 text-vortex-blue text-[10px] font-bold px-2 py-0.5 rounded-full border border-vortex-blue/30">
              <Trophy size={9} /> Lead
            </span>
          )}
        </div>
        {canRemove && (
          <button type="button" onClick={onRemove}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400/60 active:text-red-400 active:bg-red-400/10 touch-manipulation">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="p-4 space-y-4">
        {/* Name */}
        <Field label="Full Name *">
          <IconInput>
            <input
              type="text" required
              className="flex-1 bg-[#111] px-3 py-3.5 text-base text-white placeholder-white/35 focus:outline-none min-w-0 autofill-dark"
              placeholder="Enter full name"
              value={member.name}
              onChange={e => onChange('name', e.target.value)}
              autoComplete="name"
            />
          </IconInput>
        </Field>

        {/* Email */}
        <Field label="Email Address *" error={emailState.error}>
          <IconInput icon={Mail} error={emailState.isValid === false} success={emailState.isValid === true}>
            <input
              type="email" required
              className="flex-1 bg-[#111] px-3 py-3.5 text-base text-white placeholder-white/35 focus:outline-none min-w-0 autofill-dark"
              placeholder="email@example.com"
              value={member.email}
              onChange={e => { onChange('email', e.target.value); setEmailState({ isValid: null, error: null }); }}
              onBlur={() => member.email && setEmailState(validateEmail(member.email))}
              autoComplete="email"
              inputMode="email"
            />
          </IconInput>
        </Field>

        {/* Phone */}
        <Field label="Phone Number *">
          <IconInput icon={Phone}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              className="flex-1 bg-[#111] px-3 py-3.5 text-base text-white placeholder-white/35 focus:outline-none min-w-0 autofill-dark"
              placeholder="10-digit mobile number"
              value={member.phone}
              onChange={e => onChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              minLength={10} maxLength={10}
              autoComplete="tel"
            />
          </IconInput>
        </Field>

        {/* College */}
        <Field label="College / Institution *">
          <input
            type="text" required
            className={inputCls}
            placeholder="College name"
            value={member.college}
            onChange={e => onChange('college', e.target.value)}
            autoComplete="organization"
          />
        </Field>

        {/* College Type */}
        <Field label="College Type *">
          <Select value={member.collegeType} onChange={e => onChange('collegeType', e.target.value)}
            placeholder="Select type..." options={COLLEGE_TYPES} required />
        </Field>

        {/* USN */}
        <UsnField value={member.idNumber} onChange={val => onChange('idNumber', val)} />

        {/* Branch */}
        <Field label="Branch / Department *">
          <Select value={member.department} onChange={e => onChange('department', e.target.value)}
            placeholder="Select branch..." options={BRANCHES} required />
        </Field>

        {/* Year */}
        <Field label="Year of Study *">
          <Select value={member.year} onChange={e => onChange('year', e.target.value)}
            placeholder="Select year..." options={YEARS} required />
        </Field>

        {/* State + City */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="State *">
            <div className="relative">
              <select
                required
                value={member.state}
                onChange={e => onChange('state', e.target.value)}
                className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                style={{ backgroundImage: 'none' }}
              >
                <option value="">State...</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={14} />
            </div>
          </Field>
          <Field label="City *">
            <input
              type="text" required
              className={inputCls}
              placeholder="City"
              value={member.city}
              onChange={e => onChange('city', e.target.value)}
            />
          </Field>
        </div>

        {/* Age */}
        {showAge && (
          <Field label="Age *">
            <input type="text" inputMode="numeric" pattern="[0-9]*" required
              className={inputCls} placeholder="Age"
              value={member.age || ''}
              onChange={e => onChange('age', e.target.value.replace(/\D/g, '').slice(0, 3))}
            />
          </Field>
        )}

        {/* ID Card Upload */}
        <div>
          <label className={labelCls}>College ID Card *</label>
          <input ref={fileInputRef} type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            className="hidden" onChange={handleFileChange} />
          {member.idCardFileName ? (
            <div className="flex items-center gap-3 p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl">
              <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
              <span className="text-green-300 text-sm flex-1 truncate">{member.idCardFileName}</span>
              <button type="button"
                onClick={() => { onChange('idCardFile', null); onChange('idCardFileName', ''); }}
                className="text-white/30 active:text-red-400 p-1 touch-manipulation">
                <X size={16} />
              </button>
            </div>
          ) : (
            <label
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-6 border-2 border-dashed border-white/15 rounded-xl active:bg-vortex-blue/5 flex flex-col items-center gap-2 cursor-pointer touch-manipulation select-none"
            >
              <Upload size={24} className="text-white/30" />
              <span className="text-sm font-semibold text-white/50">Tap to Upload ID Card</span>
              <span className="text-xs text-white/25">JPG, PNG, PDF — Max 2MB</span>
            </label>
          )}
        </div>

        {/* Optional */}
        {(showTshirt || showDietary) && (
          <div className="space-y-4 pt-2 border-t border-white/5">
            {showTshirt && (
              <Field label="T-Shirt Size">
                <Select value={member.tshirtSize} onChange={e => onChange('tshirtSize', e.target.value)}
                  placeholder="Select size..." options={TSHIRT_SIZES} />
              </Field>
            )}
            {showDietary && (
              <div>
                <label className={labelCls}>Dietary Preference</label>
                <div className="flex gap-3 flex-wrap">
                  {DIETARY.map(d => (
                    <label key={d} className="flex items-center gap-2 cursor-pointer touch-manipulation py-1">
                      <input type="radio" name={`diet-${index}`} value={d}
                        checked={member.dietaryPreference === d}
                        onChange={() => onChange('dietaryPreference', d)}
                        className="w-4 h-4 flex-shrink-0 accent-vortex-blue"
                      />
                      <span className="text-sm text-white/70">{d}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Special requirements */}
        <Field label="Special Requirements (Optional)">
          <textarea
            className={`${inputCls} h-16 resize-none`}
            placeholder="Accessibility needs, allergies, etc."
            value={member.specialRequirements || ''}
            onChange={e => onChange('specialRequirements', e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
};

// ─── Main Form ─────────────────────────────────────────────────────────────────
const RegistrationForm = ({ event, onSubmit, submitting }) => {
  const isSolo = event.registrationType === 'Solo';
  const isDuo = event.registrationType === 'Duo';
  const minMembers = isSolo ? 1 : isDuo ? 2 : (event.minTeamSize || 2);
  const maxMembers = isSolo ? 1 : isDuo ? 2 : (event.maxTeamSize || 5);
  const showAge = !!(event.eligibility?.minAge || event.eligibility?.maxAge);
  const showTshirt = !!event.collectTshirtSize;
  const showDietary = !!event.collectDietaryPreference;

  const draftKey = `reg_draft_${event._id}`;

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const { teamName: tn, members: ms } = JSON.parse(saved);
        return { teamName: tn || '', members: ms?.length ? ms : [emptyMember()] };
      }
    } catch {}
    return null;
  };

  const draft = loadDraft();
  const [teamName, setTeamName] = useState(draft?.teamName || '');
  const [members, setMembers] = useState(draft?.members || [emptyMember()]);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedRefund, setAgreedRefund] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    try {
      const saveable = { teamName, members: members.map(m => ({ ...m, idCardFile: null })) };
      localStorage.setItem(draftKey, JSON.stringify(saveable));
    } catch {}
  }, [teamName, members, draftKey]);

  const clearDraft = () => { try { localStorage.removeItem(draftKey); } catch {} };

  const updateMember = useCallback((index, key, value) => {
    setMembers(prev => prev.map((m, i) => i === index ? { ...m, [key]: value } : m));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hasSubmitted || submitting) return;
    if (!agreedTerms || !agreedRefund) { alert('Please agree to the terms and conditions.'); return; }
    if (members.length < minMembers) { alert(`Minimum ${minMembers} member${minMembers > 1 ? 's' : ''} required.`); return; }
    const missingId = members.findIndex(m => !m.idCardFileName);
    if (missingId !== -1) { alert(`Please upload the College ID card for Member ${missingId + 1}.`); return; }
    const invalidUsn = members.findIndex(m => !USN_REGEX.test(m.idNumber));
    if (invalidUsn !== -1) { alert(`Invalid USN for Member ${invalidUsn + 1}. Expected format like 4AD23CS075`); return; }
    setHasSubmitted(true);
    clearDraft();
    onSubmit({ teamName: isSolo ? '' : teamName, members });
  };

  const feePerUnit = event.price || 0;
  const isPerTeam = event.feeType === 'per_team' || event.teamPricing?.perTeam;
  const totalFee = isPerTeam ? feePerUnit : feePerUnit * members.length;
  const gstAmount = event.gstEnabled ? Math.round(totalFee * ((event.gstPercent || 18) / 100)) : 0;
  const grandTotal = totalFee + gstAmount;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 registration-form">

      {/* Event banner */}
      <div className="flex items-center justify-between p-3.5 bg-vortex-blue/10 rounded-xl border border-vortex-blue/20">
        <div>
          <p className="text-white font-bold text-sm">{event.title}</p>
          <p className="text-vortex-blue text-xs mt-0.5">{event.registrationType} Event</p>
        </div>
        <span className="text-green-400 font-bold text-sm">
          {feePerUnit > 0 ? (isPerTeam ? `₹${feePerUnit}` : `₹${feePerUnit}/person`) : 'FREE'}
        </span>
      </div>

      {/* Team name */}
      {!isSolo && (
        <Field label="Team Name *">
          <input
            type="text" required
            className={`${inputCls} font-bold uppercase`}
            placeholder="Enter your team name"
            value={teamName}
            onChange={e => setTeamName(e.target.value.toUpperCase())}
          />
        </Field>
      )}

      {/* Members count */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white">
          <span className="text-vortex-blue mr-1">//</span> Attendees
        </h4>
        <span className="text-xs text-white/40 font-medium">
          {members.length}/{maxMembers} · min {minMembers}
        </span>
      </div>

      {/* Member cards — plain divs, no animation library */}
      <div className="space-y-4">
        {members.map((member, idx) => (
          <MemberCard
            key={idx}
            member={member} index={idx}
            isPrimary={idx === 0}
            canRemove={!isSolo && members.length > minMembers}
            onChange={(key, val) => updateMember(idx, key, val)}
            onRemove={() => setMembers(prev => prev.filter((_, i) => i !== idx))}
            showAge={showAge} showTshirt={showTshirt} showDietary={showDietary}
          />
        ))}
      </div>

      {/* Add member */}
      {!isSolo && members.length < maxMembers && (
        <button type="button"
          onClick={() => setMembers(prev => [...prev, emptyMember()])}
          className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-sm font-semibold text-white/40 active:border-vortex-blue/40 active:text-vortex-blue active:bg-vortex-blue/5 flex items-center justify-center gap-2 touch-manipulation"
        >
          <Plus size={18} /> Add Member ({members.length}/{maxMembers})
        </button>
      )}

      {/* Min warning */}
      {members.length < minMembers && (
        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-400 text-sm font-semibold text-center">
          Minimum {minMembers} members required
        </div>
      )}

      {/* Fee breakdown */}
      {feePerUnit > 0 && (
        <div className="p-4 bg-[#0d0d0d] border border-white/10 rounded-xl space-y-2.5">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Fee Breakdown</p>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">{isPerTeam ? 'Team Fee' : `₹${feePerUnit} × ${members.length} member${members.length > 1 ? 's' : ''}`}</span>
            <span className="text-white font-medium">₹{totalFee}</span>
          </div>
          {event.gstEnabled && (
            <div className="flex justify-between text-sm">
              <span className="text-white/50">GST ({event.gstPercent || 18}%)</span>
              <span className="text-white/60">₹{gstAmount}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold border-t border-white/10 pt-2.5">
            <span className="text-white">Total</span>
            <span className="text-green-400">₹{grandTotal}</span>
          </div>
        </div>
      )}

      {/* Terms */}
      <div className="space-y-3 p-4 bg-[#0d0d0d] border border-white/10 rounded-xl">
        <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Terms & Conditions</p>
        {[
          { state: agreedTerms, set: setAgreedTerms, text: 'I agree to the event terms and conditions' },
          { state: agreedRefund, set: setAgreedRefund, text: 'I agree to the refund and cancellation policy' },
        ].map(({ state, set, text }) => (
          <label key={text} className="flex items-start gap-3 cursor-pointer touch-manipulation">
            <input type="checkbox" checked={state} onChange={e => set(e.target.checked)}
              className="w-5 h-5 mt-0.5 flex-shrink-0 accent-vortex-blue rounded" />
            <span className="text-sm text-white/70 leading-relaxed">{text}</span>
          </label>
        ))}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || hasSubmitted || members.length < minMembers || !agreedTerms || !agreedRefund}
        className="w-full bg-vortex-blue text-black font-black py-4 text-base rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation active:opacity-80"
      >
        {submitting ? (
          <><span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Processing...</>
        ) : (
          feePerUnit > 0 ? `Proceed to Payment — ₹${grandTotal}` : 'Register Now'
        )}
      </button>
    </form>
  );
};

export default React.memo(RegistrationForm);
