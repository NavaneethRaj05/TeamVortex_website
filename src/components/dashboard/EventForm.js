import React, { useState } from 'react';
import { Plus, X, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import SmartImage from '../SmartImage';

// ─── Collapsible Section ───────────────────────────────────────────────────────
const Section = ({ accent, label, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-xl border ${accent.border} bg-white/[0.03]`}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 ${accent.text} font-black text-[10px] uppercase tracking-widest`}>
        {label}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="px-4 pb-5 space-y-4">{children}</div>}
    </div>
  );
};

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
const Lbl = ({ children }) => (
  <label className="text-[9px] text-white/40 uppercase font-bold tracking-widest ml-0.5 block mb-1.5">{children}</label>
);
const Inp = (props) => <input className="input-glass p-3 rounded-lg w-full text-sm" {...props} />;
const Sel = ({ children, ...p }) => (
  <select className="input-glass p-3 rounded-lg w-full text-sm bg-[#1a1a1a] text-white outline-none cursor-pointer" {...p}>{children}</select>
);
const CheckRow = ({ checked, onChange, children }) => (
  <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors touch-manipulation">
    <input type="checkbox" checked={!!checked} onChange={onChange} className="flex-shrink-0" />
    <span className="text-sm text-white leading-relaxed">{children}</span>
  </label>
);
const RadioRow = ({ name, value, checked, onChange, title, sub }) => (
  <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors touch-manipulation">
    <input type="radio" name={name} value={value} checked={!!checked} onChange={onChange} className="flex-shrink-0 self-start mt-1" />
    <div>
      <div className="text-sm text-white font-medium">{title}</div>
      {sub && <div className="text-[10px] text-white/50 mt-0.5">{sub}</div>}
    </div>
  </label>
);

// ─── Accent palette ────────────────────────────────────────────────────────────
const A = {
  blue:   { border: 'border-blue-500/30',   text: 'text-blue-400'   },
  green:  { border: 'border-green-500/30',  text: 'text-green-400'  },
  purple: { border: 'border-purple-500/30', text: 'text-purple-400' },
  orange: { border: 'border-orange-500/30', text: 'text-orange-400' },
  amber:  { border: 'border-amber-500/30',  text: 'text-amber-400'  },
  cyan:   { border: 'border-cyan-500/30',   text: 'text-cyan-400'   },
  indigo: { border: 'border-indigo-500/30', text: 'text-indigo-400' },
  pink:   { border: 'border-pink-500/30',   text: 'text-pink-400'   },
};

// ─── QR Preview with load state ───────────────────────────────────────────────
const QrPreview = ({ upiId, upiQrCode }) => {
  const [imgStatus, setImgStatus] = React.useState('loading');
  React.useEffect(() => { setImgStatus('loading'); }, [upiQrCode]);

  return (
    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
      <div className="w-16 h-16 rounded border border-white/10 overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
        {imgStatus !== 'error' && (
          <img
            src={upiQrCode}
            alt="QR"
            className={`w-full h-full object-cover transition-opacity duration-200 ${imgStatus === 'loaded' ? 'opacity-100' : 'opacity-0 absolute'}`}
            onLoad={() => setImgStatus('loaded')}
            onError={() => setImgStatus('error')}
          />
        )}
        {imgStatus === 'loading' && <div className="w-full h-full animate-pulse bg-white/10 rounded" />}
        {imgStatus === 'error' && (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3l18 18" />
          </svg>
        )}
      </div>
      <div className="text-xs text-white/60 flex-1 min-w-0">
        <div className="font-medium truncate">UPI: {upiId}</div>
        <div className="text-[10px] text-white/40 mt-0.5">QR shown to users at payment</div>
        {imgStatus === 'error' && (
          <div className="mt-1.5 text-[10px] text-yellow-400 leading-tight">
            ⚠ URL didn't load as an image. Upload your QR to{' '}
            <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="underline">imgbb.com</a>{' '}
            and paste the direct link (ends in .jpg/.png)
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const EventForm = React.memo(({ newEvent, setNewEvent, onSubmit, onCancel, editingEventId, events = [] }) => {
  if (!newEvent) return null;

  const set = (patch) => setNewEvent(prev => ({ ...prev, ...patch }));
  const setElig = (patch) => set({ eligibility: { ...newEvent.eligibility, ...patch } });

  // Only main events (no parentEventId) can be parents
  const mainEvents = events.filter(ev => !ev.parentEventId && ev._id !== editingEventId);
  // Check if current event already has children (can't make it a sub-event then)
  const hasChildren = editingEventId && events.some(ev => String(ev.parentEventId) === String(editingEventId));
  const isSubEvent = !!newEvent.parentEventId;

  // Derived
  const isPaid = newEvent.price > 0;
  const isTeam = newEvent.registrationType === 'Team';
  const isDuo  = newEvent.registrationType === 'Duo';
  const gw     = newEvent.paymentGateway || '';

  // Google Calendar helper
  const generateGCalLink = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.startTime) {
      alert('Please provide title, date, and start time first.'); return;
    }
    try {
      const s = new Date(`${newEvent.date}T${newEvent.startTime}`);
      const e = new Date(newEvent.endTime ? `${newEvent.date}T${newEvent.endTime}` : s.getTime() + 7200000);
      const fmt = d => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
      window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(newEvent.title)}&details=${encodeURIComponent(newEvent.description)}&location=${encodeURIComponent(newEvent.location || '')}&dates=${fmt(s)}/${fmt(e)}`, '_blank');
    } catch { alert('Error generating link.'); }
  };

  // Tag helpers
  const addTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = e.target.value.trim().replace(/,$/, '');
      if (val && !(newEvent.tags || []).includes(val)) {
        set({ tags: [...(newEvent.tags || []), val] });
      }
      e.target.value = '';
    }
  };
  const removeTag = (t) => set({ tags: (newEvent.tags || []).filter(x => x !== t) });

  return (
    <form onSubmit={onSubmit} className="glass-card p-3 sm:p-6 border-l-4 border-vortex-blue animate-slide-up space-y-4">
      {/* Header */}
      <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-vortex-blue/20 flex items-center justify-center">
          <Plus size={18} className="text-vortex-blue" />
        </div>
        {editingEventId ? 'Edit Event' : 'Create New Event'}
      </h3>

      {/* ── SECTION 1: BASIC INFO ─────────────────────────────────────────── */}
      <Section accent={A.blue} label="📝 Section 1 — Basic Event Information">
        <div>
          <Lbl>Event Title *</Lbl>
          <Inp placeholder="Enter a compelling title..." value={newEvent.title}
            onChange={e => set({ title: e.target.value })} required />
        </div>

        {/* Event Type Toggle: Main Event vs Sub Event */}
        <div>
          <Lbl>Event Type *</Lbl>
          {hasChildren ? (
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30 text-xs text-amber-400">
              ⚠️ This event has sub-events and cannot be converted to a sub-event itself.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <RadioRow name="eventKind" value="main" checked={!isSubEvent}
                onChange={() => set({ parentEventId: null })}
                title="Main Event" sub="Groups multiple sub-events (e.g. Prayog 2.0)" />
              <RadioRow name="eventKind" value="sub" checked={isSubEvent}
                onChange={() => {
                  if (mainEvents.length === 0) {
                    alert('No main events available. Create a main event first.');
                    return;
                  }
                  set({ parentEventId: mainEvents[0]._id });
                }}
                title="Sub-Event" sub="Belongs to a main event (e.g. Hackathon)" />
              <RadioRow name="eventKind" value="standalone" checked={false}
                onChange={() => set({ parentEventId: null })}
                title="Standalone" sub="Independent event (e.g. Workshop)" />
            </div>
          )}

          {isSubEvent && !hasChildren && (
            <div className="mt-3">
              <Lbl>Parent Event *</Lbl>
              {mainEvents.length === 0 ? (
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30 text-xs text-red-400">
                  No main events found. Create a main event first.
                </div>
              ) : (
                <Sel value={newEvent.parentEventId || ''} onChange={e => set({ parentEventId: e.target.value || null })}>
                  {mainEvents.map(ev => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title} ({new Date(ev.date).toLocaleDateString()})
                    </option>
                  ))}
                </Sel>
              )}
              <div className="text-[9px] text-blue-400/70 mt-1 px-1">
                This event will be grouped under its parent in the past events section
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Lbl>Event Type *</Lbl>
            <Sel value={newEvent.eventType} onChange={e => set({ eventType: e.target.value })}>
              <option value="Inter-College">Inter-College Competition</option>
              <option value="Intra-College">Intra-College Event</option>
              <option value="Open">Open Event (No Restrictions)</option>
              <option value="Workshop">Workshop / Training</option>
              <option value="Corporate">Corporate / Seminar</option>
            </Sel>
            <div className="text-[9px] text-white/30 mt-1 px-1">
              {newEvent.eventType === 'Inter-College' && 'Students from multiple colleges can participate'}
              {newEvent.eventType === 'Intra-College' && 'Only students from one specific college'}
              {newEvent.eventType === 'Open' && 'Anyone can participate regardless of affiliation'}
              {newEvent.eventType === 'Workshop' && 'Educational / training focused event'}
              {newEvent.eventType === 'Corporate' && 'Professional / industry event'}
            </div>
          </div>
          <div>
            <Lbl>Category *</Lbl>
            <Sel value={newEvent.category} onChange={e => set({ category: e.target.value })}>
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Gaming">Gaming</option>
              <option value="Business">Business / Entrepreneurship</option>
              <option value="Academic">Academic</option>
            </Sel>
          </div>
        </div>

        <div>
          <Lbl>Description *</Lbl>
          <textarea className="input-glass p-3 rounded-lg w-full text-sm h-32 resize-none"
            placeholder="Describe the event — what to expect, prerequisites, highlights..."
            value={newEvent.description}
            onChange={e => set({ description: e.target.value })}
            maxLength={2000} required />
          <div className="text-[9px] text-white/20 text-right mt-0.5">{(newEvent.description || '').length}/2000</div>
        </div>

        <div>
          <Lbl>Tags / Keywords</Lbl>
          <div className="flex flex-wrap gap-2 mb-2">
            {(newEvent.tags || []).map(t => (
              <span key={t} className="flex items-center gap-1 bg-vortex-blue/20 text-vortex-blue text-xs px-2 py-1 rounded-full border border-vortex-blue/30">
                {t}
                <button type="button" onClick={() => removeTag(t)} className="hover:text-red-400 transition-colors"><X size={10} /></button>
              </span>
            ))}
          </div>
          <Inp placeholder="Type a tag and press Enter (e.g. Coding, AI, Hackathon)" onKeyDown={addTag} />
          <div className="text-[9px] text-white/30 mt-1 px-1">Press Enter or comma to add a tag</div>
        </div>
      </Section>

      {/* ── SECTION 2: DATE & TIME ────────────────────────────────────────── */}
      <Section accent={A.orange} label="📅 Section 2 — Date, Time & Venue">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Lbl>Event Date *</Lbl>
            <Inp type="date" value={newEvent.date} onChange={e => set({ date: e.target.value })} required />
          </div>
          <div>
            <Lbl>Start Time *</Lbl>
            <Inp type="time" value={newEvent.startTime} onChange={e => set({ startTime: e.target.value })} required />
          </div>
          <div>
            <Lbl>End Time</Lbl>
            <Inp type="time" value={newEvent.endTime} onChange={e => set({ endTime: e.target.value })} />
          </div>
        </div>

        <div>
          <Lbl>Venue / Location *</Lbl>
          <Inp placeholder="e.g. Lab 301, Main Campus / Zoom Link" value={newEvent.location || ''}
            onChange={e => set({ location: e.target.value })} required />
        </div>

        <button type="button" onClick={generateGCalLink}
          className="text-[10px] font-bold text-vortex-orange bg-vortex-orange/10 px-3 py-1.5 rounded-full flex items-center gap-2 w-fit hover:bg-vortex-orange/20 transition-all">
          <Calendar size={12} /> Sync to Google Calendar
        </button>

        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Registration Period</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Lbl>Opens On</Lbl>
              <Inp type="datetime-local" value={newEvent.registrationOpens || ''}
                onChange={e => set({ registrationOpens: e.target.value })} />
            </div>
            <div>
              <Lbl>Closes On</Lbl>
              <Inp type="datetime-local" value={newEvent.registrationCloses || ''}
                onChange={e => set({ registrationCloses: e.target.value })} />
            </div>
          </div>
          <CheckRow checked={newEvent.autoCloseOnCapacity}
            onChange={e => set({ autoCloseOnCapacity: e.target.checked })}>
            Auto-close registration when capacity is reached
          </CheckRow>
          <CheckRow checked={newEvent.enableWaitlist}
            onChange={e => set({ enableWaitlist: e.target.checked })}>
            Enable waitlist after capacity is full
          </CheckRow>
          {newEvent.enableWaitlist && (
            <div>
              <Lbl>Waitlist Size (0 = unlimited)</Lbl>
              <Inp type="number" min="0" placeholder="e.g. 20"
                value={newEvent.waitlistCapacity || ''}
                onChange={e => set({ waitlistCapacity: e.target.value })} />
            </div>
          )}
          <CheckRow checked={newEvent.collectTshirtSize}
            onChange={e => set({ collectTshirtSize: e.target.checked })}>
            Collect T-Shirt size from participants
          </CheckRow>
          <CheckRow checked={newEvent.collectDietaryPreference}
            onChange={e => set({ collectDietaryPreference: e.target.checked })}>
            Collect dietary preference from participants
          </CheckRow>
        </div>
      </Section>

      {/* ── SECTION 3: PARTICIPATION & CAPACITY ──────────────────────────── */}
      <Section accent={A.cyan} label="👥 Section 3 — Participation & Capacity">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Lbl>Registration Type *</Lbl>
            <Sel value={newEvent.registrationType} onChange={e => {
              const v = e.target.value;
              const min = v === 'Solo' ? 1 : v === 'Duo' ? 2 : 3;
              const max = v === 'Solo' ? 1 : v === 'Duo' ? 2 : 5;
              set({ registrationType: v, minTeamSize: min, maxTeamSize: max });
            }}>
              <option value="Solo">Solo (Individual)</option>
              <option value="Duo">Duo (2 People)</option>
              <option value="Team">Team (Custom Size)</option>
            </Sel>
          </div>
          <div>
            <Lbl>Max Registrations (0 = unlimited)</Lbl>
            <Inp type="number" min="0" placeholder="e.g. 100"
              value={newEvent.capacity} onChange={e => set({ capacity: e.target.value })} />
            {newEvent.capacity > 0 && (
              <div className="text-[9px] text-cyan-400/70 mt-1 px-1">
                {newEvent.registrationType === 'Solo' && `Max ${newEvent.capacity} participants`}
                {newEvent.registrationType === 'Duo' && `Max ${newEvent.capacity} pairs = ~${newEvent.capacity * 2} participants`}
                {newEvent.registrationType === 'Team' && `Max ${newEvent.capacity} teams = ~${newEvent.capacity * (newEvent.maxTeamSize || 5)} participants`}
              </div>
            )}
          </div>
        </div>

        {isTeam && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
            <div>
              <Lbl>Min Team Size</Lbl>
              <Inp type="number" min="2" placeholder="3"
                value={newEvent.minTeamSize} onChange={e => set({ minTeamSize: e.target.value })} />
            </div>
            <div>
              <Lbl>Max Team Size</Lbl>
              <Inp type="number" min="2" placeholder="5"
                value={newEvent.maxTeamSize} onChange={e => set({ maxTeamSize: e.target.value })} />
            </div>
          </div>
        )}
      </Section>

      {/* ── SECTION 4: PRICING & PAYMENT ─────────────────────────────────── */}
      <Section accent={A.green} label="💰 Section 4 — Pricing & Payment">
        {/* Free / Paid toggle */}
        <div className="grid grid-cols-2 gap-3">
          <RadioRow name="pricingType" value="free" checked={!isPaid}
            onChange={() => set({ price: 0, paymentGateway: '', upiId: '', upiQrCode: '', offlineInstructions: '', paymentReceiverName: '', paymentContactNumber: '' })}
            title="Free Event" sub="No registration fee" />
          <RadioRow name="pricingType" value="paid" checked={isPaid}
            onChange={() => set({ price: newEvent.price || 100 })}
            title="Paid Event" sub="Collect registration fee" />
        </div>

        {isPaid && (<>
          {/* Entry fee + fee structure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Lbl>Entry Fee (₹) *</Lbl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">₹</span>
                <Inp type="number" min="1" placeholder="200" className="input-glass p-3 pl-7 rounded-lg w-full text-sm"
                  value={newEvent.price} onChange={e => set({ price: e.target.value })} />
              </div>
            </div>
            <div>
              <Lbl>Fee Structure</Lbl>
              {(newEvent.registrationType === 'Solo' || isDuo) ? (
                <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm text-white/70">
                  Per Person (fixed for {newEvent.registrationType})
                </div>
              ) : (
                <Sel value={newEvent.feeType || 'per_person'} onChange={e => set({ feeType: e.target.value })}>
                  <option value="per_person">Per Person × team members</option>
                  <option value="per_team">Per Team (flat rate)</option>
                </Sel>
              )}
            </div>
          </div>

          {/* Fee preview */}
          <div className="p-3 bg-green-500/5 rounded-lg border border-green-500/10 text-xs space-y-1">
            <div className="text-[9px] text-green-400 uppercase font-bold mb-2">Fee Preview</div>
            <div className="flex justify-between">
              <span className="text-white/60">Base Fee</span>
              <span className="text-white">₹{newEvent.price || 0} {newEvent.feeType === 'per_team' && isTeam ? '/ team' : '/ person'}</span>
            </div>
            {newEvent.gstEnabled && (
              <div className="flex justify-between">
                <span className="text-white/50">GST ({newEvent.gstPercent || 18}%)</span>
                <span className="text-white/70">₹{Math.round((newEvent.price || 0) * ((newEvent.gstPercent || 18) / 100))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-white/10 pt-1">
              <span className="text-white">Total</span>
              <span className="text-green-400">₹{newEvent.gstEnabled ? Math.round((newEvent.price || 0) * (1 + (newEvent.gstPercent || 18) / 100)) : (newEvent.price || 0)}</span>
            </div>
          </div>

          {/* Early bird */}
          <CheckRow checked={newEvent.earlyBirdDiscount?.enabled}
            onChange={e => set({ earlyBirdDiscount: { ...newEvent.earlyBirdDiscount, enabled: e.target.checked } })}>
            Enable Early Bird Discount
          </CheckRow>
          {newEvent.earlyBirdDiscount?.enabled && (
            <div className="grid grid-cols-2 gap-3 pl-2">
              <div>
                <Lbl>Discount %</Lbl>
                <Inp type="number" min="1" max="100" placeholder="20"
                  value={newEvent.earlyBirdDiscount?.discountPercent || ''}
                  onChange={e => set({ earlyBirdDiscount: { ...newEvent.earlyBirdDiscount, discountPercent: e.target.value } })} />
              </div>
              <div>
                <Lbl>Valid Until</Lbl>
                <Inp type="date" value={newEvent.earlyBirdDiscount?.validUntil || ''}
                  onChange={e => set({ earlyBirdDiscount: { ...newEvent.earlyBirdDiscount, validUntil: e.target.value } })} />
              </div>
            </div>
          )}

          {/* GST */}
          <CheckRow checked={newEvent.gstEnabled} onChange={e => set({ gstEnabled: e.target.checked })}>
            Include GST in pricing
          </CheckRow>
          {newEvent.gstEnabled && (
            <div className="grid grid-cols-2 gap-3 pl-2">
              <div>
                <Lbl>GST %</Lbl>
                <Inp type="number" placeholder="18" value={newEvent.gstPercent || 18}
                  onChange={e => set({ gstPercent: e.target.value })} />
              </div>
              <div>
                <Lbl>GST Number</Lbl>
                <Inp placeholder="29XXXXX1234X1ZX" value={newEvent.gstNumber || ''}
                  onChange={e => set({ gstNumber: e.target.value })} />
              </div>
            </div>
          )}

          {/* Payment method */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Payment Method *</div>
            <div className="space-y-2">
              <RadioRow name="paymentGateway" value="UPI" checked={gw === 'UPI'} onChange={e => set({ paymentGateway: e.target.value })}
                title="UPI Direct" sub="QR Code + UPI ID — zero transaction fees, manual verification" />
              <RadioRow name="paymentGateway" value="Offline" checked={gw === 'Offline'} onChange={e => set({ paymentGateway: e.target.value })}
                title="Offline Payment" sub="Cash / Bank Transfer — manual collection" />
              <RadioRow name="paymentGateway" value="Both" checked={gw === 'Both'} onChange={e => set({ paymentGateway: e.target.value })}
                title="Both UPI & Offline" sub="Participants can choose either option" />
            </div>
          </div>

          {/* UPI config */}
          {(gw === 'UPI' || gw === 'Both') && (
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 space-y-3">
              <div className="text-[9px] text-blue-300 uppercase font-bold">🔵 UPI Configuration</div>
              <div>
                <Lbl>Receiver Name</Lbl>
                <Inp placeholder="Team Vortex Events" value={newEvent.paymentReceiverName || ''}
                  onChange={e => set({ paymentReceiverName: e.target.value })} />
              </div>
              <div>
                <Lbl>Contact Number</Lbl>
                <Inp placeholder="+91-9876543210" value={newEvent.paymentContactNumber || ''}
                  onChange={e => set({ paymentContactNumber: e.target.value })} />
              </div>
              <div>
                <Lbl>UPI ID *</Lbl>
                <Inp placeholder="teamvortex@oksbi" value={newEvent.upiId || ''}
                  onChange={e => set({ upiId: e.target.value })} />
              </div>
              <div>
                <Lbl>QR Code Image URL *</Lbl>
                <Inp placeholder="https://i.ibb.co/xxx/qr.jpg" value={newEvent.upiQrCode || ''}
                  onChange={e => set({ upiQrCode: e.target.value })} />
                <div className="text-[8px] text-white/30 mt-1">
                  Use a <span className="text-yellow-400 font-bold">direct image URL</span> ending in .jpg/.png — upload to{' '}
                  <a href="https://imgbb.com" target="_blank" rel="noopener noreferrer" className="text-vortex-blue underline">imgbb.com</a> or{' '}
                  <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-vortex-blue underline">imgur.com</a> and copy the direct link
                </div>
              </div>
              {newEvent.upiId && newEvent.upiQrCode && (
                <QrPreview upiId={newEvent.upiId} upiQrCode={newEvent.upiQrCode} />
              )}
            </div>
          )}

          {/* Offline config */}
          {(gw === 'Offline' || gw === 'Both') && (
            <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 space-y-3">
              <div className="text-[9px] text-orange-300 uppercase font-bold">🟠 Offline Payment Configuration</div>
              {gw === 'Offline' && (<>
                <div>
                  <Lbl>Receiver Name</Lbl>
                  <Inp placeholder="Team Vortex Events" value={newEvent.paymentReceiverName || ''}
                    onChange={e => set({ paymentReceiverName: e.target.value })} />
                </div>
                <div>
                  <Lbl>Contact Number</Lbl>
                  <Inp placeholder="+91-9876543210" value={newEvent.paymentContactNumber || ''}
                    onChange={e => set({ paymentContactNumber: e.target.value })} />
                </div>
              </>)}
              <div>
                <Lbl>Payment Instructions</Lbl>
                <textarea className="input-glass p-3 rounded-lg w-full text-sm h-20 resize-none"
                  placeholder="e.g. Pay at registration desk, Room 101, 9AM–5PM"
                  value={newEvent.offlineInstructions || ''}
                  onChange={e => set({ offlineInstructions: e.target.value })} />
              </div>
            </div>
          )}
        </>)}
      </Section>

      {/* ── SECTION 5: ELIGIBILITY ────────────────────────────────────────── */}
      <Section accent={A.purple} label="🎯 Section 5 — Eligibility & Requirements">
        <div className="space-y-2">
          <Lbl>Who Can Participate? *</Lbl>
          <RadioRow name="participantType" value="open"
            checked={newEvent.eligibility?.participantType === 'open'}
            onChange={() => setElig({ participantType: 'open', restrictBranches: false, allowedBranches: [], restrictYears: false, allowedYears: [] })}
            title="Open to All" sub="Anyone can register — no restrictions" />
          <RadioRow name="participantType" value="engineering"
            checked={newEvent.eligibility?.participantType === 'engineering'}
            onChange={() => setElig({ participantType: 'engineering' })}
            title="Engineering Students Only" sub="Only students from engineering colleges" />
        </div>

        {newEvent.eligibility?.participantType === 'engineering' && (
          <div className="space-y-4 p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
            {/* Branch filter */}
            <CheckRow checked={newEvent.eligibility?.restrictBranches}
              onChange={e => setElig({ restrictBranches: e.target.checked, allowedBranches: e.target.checked ? (newEvent.eligibility?.allowedBranches || []) : [] })}>
              Restrict to specific branches
            </CheckRow>
            {newEvent.eligibility?.restrictBranches && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-2">
                {['CSE', 'ISE', 'ECE', 'EEE', 'ME', 'CE', 'AI/ML', 'Data Science', 'Other'].map(b => (
                  <label key={b} className="flex items-center gap-2 text-sm text-white cursor-pointer p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors touch-manipulation">
                    <input type="checkbox"
                      checked={newEvent.eligibility?.allowedBranches?.includes(b) || false}
                      onChange={e => {
                        const arr = newEvent.eligibility?.allowedBranches || [];
                        setElig({ allowedBranches: e.target.checked ? [...arr, b] : arr.filter(x => x !== b) });
                      }} className="flex-shrink-0" />
                    <span>{b}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Year filter */}
            <CheckRow checked={newEvent.eligibility?.restrictYears}
              onChange={e => setElig({ restrictYears: e.target.checked, allowedYears: e.target.checked ? (newEvent.eligibility?.allowedYears || []) : [] })}>
              Restrict to specific years
            </CheckRow>
            {newEvent.eligibility?.restrictYears && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-2">
                {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => (
                  <label key={y} className="flex items-center gap-2 text-sm text-white cursor-pointer p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors touch-manipulation">
                    <input type="checkbox"
                      checked={newEvent.eligibility?.allowedYears?.includes(y) || false}
                      onChange={e => {
                        const arr = newEvent.eligibility?.allowedYears || [];
                        setElig({ allowedYears: e.target.checked ? [...arr, y] : arr.filter(x => x !== y) });
                      }} className="flex-shrink-0" />
                    <span>{y}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Age restriction */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <Lbl>Age Restriction (Optional)</Lbl>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Lbl>Min Age</Lbl>
              <Inp type="number" placeholder="16" value={newEvent.eligibility?.minAge || ''}
                disabled={newEvent.eligibility?.noAgeRestriction}
                onChange={e => setElig({ minAge: e.target.value })} />
            </div>
            <div>
              <Lbl>Max Age</Lbl>
              <Inp type="number" placeholder="25" value={newEvent.eligibility?.maxAge || ''}
                disabled={newEvent.eligibility?.noAgeRestriction}
                onChange={e => setElig({ maxAge: e.target.value })} />
            </div>
          </div>
          <CheckRow checked={newEvent.eligibility?.noAgeRestriction}
            onChange={e => setElig({ noAgeRestriction: e.target.checked, minAge: '', maxAge: '' })}>
            No age restriction
          </CheckRow>
        </div>

        {/* Required docs */}
        <div className="border-t border-white/10 pt-4 space-y-2">
          <Lbl>Required Documents</Lbl>
          {[
            { value: 'collegeId', label: 'Valid College ID Card' },
            { value: 'govId', label: 'Government ID (Aadhaar / Passport)' },
            { value: 'participationCert', label: 'Previous Participation Certificate' },
          ].map(doc => (
            <CheckRow key={doc.value}
              checked={newEvent.eligibility?.requiredDocs?.includes(doc.value) || false}
              onChange={e => {
                const arr = newEvent.eligibility?.requiredDocs || [];
                setElig({ requiredDocs: e.target.checked ? [...arr, doc.value] : arr.filter(d => d !== doc.value) });
              }}>
              {doc.label}
            </CheckRow>
          ))}
        </div>
      </Section>

      {/* ── SECTION 6: COMPETITION SETTINGS ──────────────────────────────── */}
      <Section accent={A.amber} label="🏆 Section 6 — Competition Settings (Optional)" defaultOpen={false}>
        <CheckRow checked={newEvent.isMultiRound} onChange={e => set({ isMultiRound: e.target.checked })}>
          This is a multi-round competition
        </CheckRow>

        {newEvent.isMultiRound && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Lbl>Rounds</Lbl>
              <button type="button" className="text-[10px] text-amber-400 font-bold hover:underline"
                onClick={() => set({ rounds: [...(newEvent.rounds || []), { roundNumber: (newEvent.rounds?.length || 0) + 1, name: '', date: '', venue: '', format: 'Elimination', advancingCount: 10 }] })}>
                + Add Round
              </button>
            </div>
            {(newEvent.rounds || []).map((r, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-black/20 rounded-lg border border-white/5">
                <Inp placeholder={`Round ${i + 1} Name`} value={r.name}
                  onChange={e => { const rs = [...newEvent.rounds]; rs[i].name = e.target.value; set({ rounds: rs }); }} />
                <Inp type="date" value={r.date || ''}
                  onChange={e => { const rs = [...newEvent.rounds]; rs[i].date = e.target.value; set({ rounds: rs }); }} />
                <div className="flex gap-2">
                  <Inp type="number" placeholder="Advancing" value={r.advancingCount || ''}
                    onChange={e => { const rs = [...newEvent.rounds]; rs[i].advancingCount = e.target.value; set({ rounds: rs }); }} />
                  <button type="button" onClick={() => set({ rounds: newEvent.rounds.filter((_, idx) => idx !== i) })}
                    className="text-red-400/40 hover:text-red-400 transition-colors flex-shrink-0"><X size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Judging criteria */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <Lbl>Judging Criteria</Lbl>
            <button type="button" className="text-[10px] text-amber-400 font-bold hover:underline"
              onClick={() => set({ judgingCriteria: [...(newEvent.judgingCriteria || []), { name: '', maxPoints: 10, description: '' }] })}>
              + Add Criterion
            </button>
          </div>
          {(newEvent.judgingCriteria || []).map((c, i) => (
            <div key={i} className="flex gap-2 items-center p-2 bg-black/20 rounded-lg border border-white/5">
              <Inp placeholder="Criterion (e.g. Innovation)" value={c.name}
                onChange={e => { const arr = [...newEvent.judgingCriteria]; arr[i].name = e.target.value; set({ judgingCriteria: arr }); }} />
              <Inp type="number" placeholder="Pts" className="input-glass p-3 rounded-lg w-20 text-sm flex-shrink-0" value={c.maxPoints}
                onChange={e => { const arr = [...newEvent.judgingCriteria]; arr[i].maxPoints = e.target.value; set({ judgingCriteria: arr }); }} />
              <button type="button" onClick={() => set({ judgingCriteria: newEvent.judgingCriteria.filter((_, idx) => idx !== i) })}
                className="text-red-400/40 hover:text-red-400 transition-colors flex-shrink-0"><X size={16} /></button>
            </div>
          ))}
        </div>

        {/* Prizes */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <Lbl>Prize Structure</Lbl>
            <button type="button" className="text-[10px] text-amber-400 font-bold hover:underline"
              onClick={() => set({ prizes: [...(newEvent.prizes || []), { position: '', cashAmount: 0, description: '', trophy: false }] })}>
              + Add Prize
            </button>
          </div>
          {(newEvent.prizes || []).map((p, i) => (
            <div key={i} className="flex gap-2 items-center p-2 bg-black/20 rounded-lg border border-white/5">
              <Inp placeholder="Position (e.g. 1st)" value={p.position}
                onChange={e => { const arr = [...newEvent.prizes]; arr[i].position = e.target.value; set({ prizes: arr }); }} />
              <div className="relative flex-shrink-0 w-28">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">₹</span>
                <Inp type="number" placeholder="0" className="input-glass p-3 pl-7 rounded-lg w-full text-sm" value={p.cashAmount}
                  onChange={e => { const arr = [...newEvent.prizes]; arr[i].cashAmount = e.target.value; set({ prizes: arr }); }} />
              </div>
              <button type="button" onClick={() => set({ prizes: newEvent.prizes.filter((_, idx) => idx !== i) })}
                className="text-red-400/40 hover:text-red-400 transition-colors flex-shrink-0"><X size={16} /></button>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-4 space-y-2">
          <CheckRow checked={newEvent.participationCertificate} onChange={e => set({ participationCertificate: e.target.checked })}>
            Issue participation certificates to all attendees
          </CheckRow>
          <CheckRow checked={newEvent.winnerCertificate} onChange={e => set({ winnerCertificate: e.target.checked })}>
            Issue winner certificates
          </CheckRow>
        </div>
      </Section>

      {/* ── SECTION 7: ADDITIONAL INFORMATION ────────────────────────────── */}
      <Section accent={A.indigo} label="📋 Section 7 — Additional Information (Optional)" defaultOpen={false}>
        {/* Rules */}
        <div>
          <Lbl>Rules & Regulations</Lbl>
          <textarea className="input-glass p-3 rounded-lg w-full text-sm h-28 resize-none"
            placeholder="Enter event rules, guidelines, and code of conduct..."
            value={newEvent.rules || ''} onChange={e => set({ rules: e.target.value })} />
        </div>
        <div>
          <Lbl>Rulebook URL (PDF link)</Lbl>
          <Inp placeholder="https://example.com/rulebook.pdf" value={newEvent.rulebookUrl || ''}
            onChange={e => set({ rulebookUrl: e.target.value })} />
        </div>

        {/* Images */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <Lbl>Event Banner / Poster (Image URL)</Lbl>
          <Inp placeholder="https://i.ibb.co/xxx/banner.jpg" value={(newEvent.images || [])[0] || ''}
            onChange={e => {
              const imgs = [...(newEvent.images || [])];
              imgs[0] = e.target.value;
              set({ images: imgs.filter(Boolean) });
            }} />
          {(newEvent.images || [])[0] && (
            <div className="w-full h-32 rounded-lg overflow-hidden border border-white/10">
              <SmartImage src={newEvent.images[0]} alt="Banner" className="w-full h-full object-cover" showErrorHint />
            </div>
          )}
          <Lbl>Additional Images (comma-separated URLs)</Lbl>
          <textarea className="input-glass p-3 rounded-lg w-full text-sm h-16 resize-none"
            placeholder="https://img1.jpg, https://img2.jpg, ..."
            value={(newEvent.images || []).slice(1).join(', ')}
            onChange={e => {
              const extra = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              const first = (newEvent.images || [])[0] || '';
              set({ images: [first, ...extra].filter(Boolean) });
            }} />
        </div>

        {/* Gallery Drive Link */}
        <div>
          <Lbl>Google Drive Gallery Link (for past events)</Lbl>
          <Inp placeholder="https://drive.google.com/drive/folders/xxx" value={newEvent.galleryDriveLink || ''}
            onChange={e => set({ galleryDriveLink: e.target.value })} />
        </div>

        {/* Organizer */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <Lbl>Organizer Info</Lbl>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Inp placeholder="Organizer Name" value={newEvent.organizer?.name || ''}
              onChange={e => set({ organizer: { ...newEvent.organizer, name: e.target.value } })} />
            <Inp placeholder="Organizer Email" type="email" value={newEvent.organizer?.email || ''}
              onChange={e => set({ organizer: { ...newEvent.organizer, email: e.target.value } })} />
          </div>
        </div>

        {/* Sponsors */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <Lbl>Sponsors</Lbl>
            <button type="button" className="text-[10px] text-indigo-400 font-bold hover:underline"
              onClick={() => set({ sponsors: [...(newEvent.sponsors || []), { name: '', tier: 'Gold', logoUrl: '' }] })}>
              + Add Sponsor
            </button>
          </div>
          {(newEvent.sponsors || []).map((s, i) => (
            <div key={i} className="flex gap-2 items-center p-2 bg-black/20 rounded-lg border border-white/5">
              <Inp placeholder="Sponsor Name" value={s.name}
                onChange={e => { const arr = [...newEvent.sponsors]; arr[i].name = e.target.value; set({ sponsors: arr }); }} />
              <Sel className="input-glass p-3 rounded-lg text-sm bg-[#1a1a1a] text-white w-28 flex-shrink-0" value={s.tier}
                onChange={e => { const arr = [...newEvent.sponsors]; arr[i].tier = e.target.value; set({ sponsors: arr }); }}>
                <option value="Title">Title</option>
                <option value="Platinum">Platinum</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
              </Sel>
              <button type="button" onClick={() => set({ sponsors: newEvent.sponsors.filter((_, idx) => idx !== i) })}
                className="text-red-400/40 hover:text-red-400 transition-colors flex-shrink-0"><X size={16} /></button>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <Lbl>FAQs</Lbl>
            <button type="button" className="text-[10px] text-indigo-400 font-bold hover:underline"
              onClick={() => set({ faqs: [...(newEvent.faqs || []), { question: '', answer: '' }] })}>
              + Add FAQ
            </button>
          </div>
          {(newEvent.faqs || []).map((faq, i) => (
            <div key={i} className="space-y-1">
              <div className="flex gap-2">
                <Inp placeholder="Question" value={faq.question}
                  onChange={e => { const arr = [...newEvent.faqs]; arr[i].question = e.target.value; set({ faqs: arr }); }} />
                <button type="button" onClick={() => set({ faqs: newEvent.faqs.filter((_, idx) => idx !== i) })}
                  className="text-red-400/40 hover:text-red-400 transition-colors flex-shrink-0"><X size={16} /></button>
              </div>
              <textarea className="input-glass p-2 rounded text-xs w-full h-14 resize-none" placeholder="Answer"
                value={faq.answer} onChange={e => { const arr = [...newEvent.faqs]; arr[i].answer = e.target.value; set({ faqs: arr }); }} />
            </div>
          ))}
        </div>

        {/* Sub-Events */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <Lbl>Sub-Events</Lbl>
            <button type="button" className="text-[10px] text-indigo-400 font-bold hover:underline"
              onClick={() => set({ subEvents: [...(newEvent.subEvents || []), { title: '', description: '', details: '', icon: 'Calendar', color: 'from-blue-500 to-purple-500', duration: '', participants: '', images: [] }] })}>
              + Add Sub-Event
            </button>
          </div>
          {(newEvent.subEvents || []).map((se, i) => (
            <div key={i} className="p-3 bg-black/20 rounded-lg border border-white/5 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Inp placeholder="Sub-Event Title *" value={se.title || ''}
                    onChange={e => { const arr = newEvent.subEvents.map((x, j) => j === i ? { ...x, title: e.target.value } : x); set({ subEvents: arr }); }} />
                  <Inp placeholder="Duration (e.g. Full Day)" value={se.duration || ''}
                    onChange={e => { const arr = newEvent.subEvents.map((x, j) => j === i ? { ...x, duration: e.target.value } : x); set({ subEvents: arr }); }} />
                </div>
                <button type="button" onClick={() => set({ subEvents: newEvent.subEvents.filter((_, idx) => idx !== i) })}
                  className="text-red-400/40 hover:text-red-400 transition-colors flex-shrink-0 mt-1"><X size={16} /></button>
              </div>
              <textarea className="input-glass p-2 rounded text-xs w-full h-14 resize-none" placeholder="Brief description *"
                value={se.description || ''}
                onChange={e => { const arr = newEvent.subEvents.map((x, j) => j === i ? { ...x, description: e.target.value } : x); set({ subEvents: arr }); }} />
              <Sel value={se.color || 'from-blue-500 to-purple-500'}
                onChange={e => { const arr = newEvent.subEvents.map((x, j) => j === i ? { ...x, color: e.target.value } : x); set({ subEvents: arr }); }}>
                <option value="from-blue-500 to-purple-500">Blue → Purple</option>
                <option value="from-yellow-500 to-orange-500">Yellow → Orange</option>
                <option value="from-vortex-blue to-cyan-400">Vortex Blue → Cyan</option>
                <option value="from-purple-500 to-pink-500">Purple → Pink</option>
                <option value="from-red-500 to-vortex-orange">Red → Orange</option>
                <option value="from-green-500 to-emerald-500">Green → Emerald</option>
              </Sel>
            </div>
          ))}
          {!(newEvent.subEvents?.length) && (
            <div className="text-center py-4 text-white/20 text-xs">No sub-events added yet</div>
          )}
        </div>
      </Section>

      {/* ── SECTION 8: PUBLISHING OPTIONS ────────────────────────────────── */}
      <Section accent={A.pink} label="⚙️ Section 8 — Publishing Options">
        <div className="space-y-2">
          <Lbl>Event Status</Lbl>
          <RadioRow name="eventStatus" value="draft" checked={newEvent.status === 'draft'}
            onChange={() => set({ status: 'draft' })}
            title="Save as Draft" sub="Visible only to admins — not published yet" />
          <RadioRow name="eventStatus" value="published" checked={newEvent.status === 'published' || !newEvent.status}
            onChange={() => set({ status: 'published' })}
            title="Publish Now" sub="Visible to all users immediately" />
        </div>

        <div className="border-t border-white/10 pt-4 space-y-2">
          <Lbl>Visibility</Lbl>
          <CheckRow checked={(newEvent.priority || 0) >= 10}
            onChange={e => set({ priority: e.target.checked ? 10 : 0 })}>
            Feature this event on the homepage
          </CheckRow>
        </div>

        <div className="border-t border-white/10 pt-4">
          <Lbl>Priority (higher = shown first)</Lbl>
          <Sel value={newEvent.priority || 0} onChange={e => set({ priority: parseInt(e.target.value) })}>
            <option value={0}>Normal</option>
            <option value={5}>High</option>
            <option value={10}>Featured</option>
            <option value={20}>Top Priority</option>
          </Sel>
        </div>
      </Section>

      {/* ── ACTION BUTTONS ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button type="submit"
          className="glass-button bg-vortex-blue text-white flex-1 font-bold h-12 order-2 sm:order-1">
          {editingEventId ? 'Save Changes' : (newEvent.status === 'draft' ? 'Save Draft' : 'Publish Event')}
        </button>
        <button type="button" onClick={onCancel}
          className="glass-button text-red-400 font-bold border-red-500/20 px-8 h-12 order-1 sm:order-2">
          Discard
        </button>
      </div>
    </form>
  );
});

export default EventForm;
