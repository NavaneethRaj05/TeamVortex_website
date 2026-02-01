import React from 'react';
import { Plus, X, Calendar, Clock, MapPin, Mail, Users, Edit2, Trash2 } from 'lucide-react';

const EventForm = React.memo(({ newEvent, setNewEvent, onSubmit, onCancel, editingEventId }) => {

    const generateGCalLink = () => {
        if (!newEvent.title || !newEvent.date || !newEvent.startTime) {
            alert("Please provide title, date, and start time first.");
            return;
        }

        try {
            const startDateTime = new Date(`${newEvent.date}T${newEvent.startTime}`);
            const endDateTime = new Date(newEvent.endTime ? `${newEvent.date}T${newEvent.endTime}` : startDateTime.getTime() + 2 * 60 * 60 * 1000);

            const start = startDateTime.toISOString().replace(/-|:|\.\d\d\d/g, "");
            const end = endDateTime.toISOString().replace(/-|:|\.\d\d\d/g, "");

            const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(newEvent.title)}&details=${encodeURIComponent(newEvent.description)}&location=${encodeURIComponent(newEvent.location)}&dates=${start}/${end}`;
            window.open(url, '_blank');
        } catch (e) {
            alert("Error generating link. Please check date and time formats.");
        }
    };

    return (
        <form onSubmit={onSubmit} className="glass-card p-4 sm:p-8 border-l-4 border-vortex-blue animate-slide-up">
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-6 sm:mb-8 uppercase tracking-widest flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-vortex-blue/20 flex items-center justify-center">
                    <Plus size={20} className="text-vortex-blue" />
                </div>
                {editingEventId ? 'Refine Event' : 'Create New Experience'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
                {/* Left Column */}
                <div className="space-y-6">
                    <div className="group">
                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1 mb-2 block">Event Identity</label>
                        <input
                            className="input-glass p-3 sm:p-4 rounded-xl w-full text-base sm:text-lg font-medium focus:ring-2 ring-vortex-blue/50"
                            placeholder="Enter a compelling title..."
                            value={newEvent.title}
                            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1 mb-2 block">Event Type & Scope</label>
                            <select
                                className="input-glass p-3 sm:p-4 rounded-xl w-full bg-[#1a1a1a] text-white outline-none cursor-pointer"
                                value={newEvent.eventType}
                                onChange={e => setNewEvent({ ...newEvent, eventType: e.target.value })}
                            >
                                <option value="Inter-College">Inter-College (Multiple Institutions)</option>
                                <option value="Intra-College">Intra-College (Single Institution)</option>
                                <option value="Open">Open to All (No Restrictions)</option>
                                <option value="Workshop">Workshop/Training</option>
                                <option value="Corporate">Corporate Event</option>
                            </select>
                            <div className="text-[8px] text-white/30 mt-1 px-1">
                                {newEvent.eventType === 'Inter-College' && 'Students from multiple colleges can participate'}
                                {newEvent.eventType === 'Intra-College' && 'Only students from one specific college'}
                                {newEvent.eventType === 'Open' && 'Anyone can participate regardless of affiliation'}
                                {newEvent.eventType === 'Workshop' && 'Educational/training focused event'}
                                {newEvent.eventType === 'Corporate' && 'Professional/industry event'}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1 mb-2 block">Category</label>
                            <select
                                className="input-glass p-3 sm:p-4 rounded-xl w-full bg-[#1a1a1a] text-white outline-none cursor-pointer"
                                value={newEvent.category}
                                onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                            >
                                <option value="Technical">Technical</option>
                                <option value="Cultural">Cultural</option>
                                <option value="Sports">Sports</option>
                                <option value="Gaming">Gaming</option>
                                <option value="Business">Business/Entrepreneurship</option>
                                <option value="Academic">Academic</option>
                            </select>
                        </div>
                    </div>

                    {/* College/Institution Verification Section */}
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 rounded-xl border border-blue-500/20 space-y-4">
                        <label className="text-[10px] text-blue-400 uppercase font-black tracking-widest block">🏫 Institution Verification & Restrictions</label>
                        
                        {/* Intra-College Specific Settings */}
                        {newEvent.eventType === 'Intra-College' && (
                            <div className="space-y-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                                <label className="text-[9px] text-orange-300 uppercase font-bold block">Intra-College Configuration</label>
                                <input
                                    className="input-glass p-3 rounded-lg w-full text-sm"
                                    placeholder="Allowed College/Institution Name (e.g., Navkis College of Engineering)"
                                    value={newEvent.allowedCollege || ''}
                                    onChange={e => setNewEvent({ ...newEvent, allowedCollege: e.target.value })}
                                    required={newEvent.eventType === 'Intra-College'}
                                />
                                <div className="text-[8px] text-white/30">Only students from this institution will be allowed to register</div>
                                
                                {/* Department Restrictions */}
                                <div className="space-y-2">
                                    <label className="text-[9px] text-orange-300 uppercase font-bold block">Department Restrictions (Optional)</label>
                                    <input
                                        className="input-glass p-2 rounded-lg w-full text-xs"
                                        placeholder="Allowed departments (comma separated, e.g., CSE, ECE, ME)"
                                        value={newEvent.allowedDepartments || ''}
                                        onChange={e => setNewEvent({ ...newEvent, allowedDepartments: e.target.value })}
                                    />
                                    <div className="text-[8px] text-white/30">Leave empty to allow all departments</div>
                                </div>
                            </div>
                        )}

                        {/* Inter-College Settings */}
                        {newEvent.eventType === 'Inter-College' && (
                            <div className="space-y-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                <label className="text-[9px] text-green-300 uppercase font-bold block">Inter-College Configuration</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newEvent.requireCollegeVerification || false}
                                            onChange={e => setNewEvent({ ...newEvent, requireCollegeVerification: e.target.checked })}
                                            className="accent-green-400"
                                        />
                                        Require College ID Card Upload
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newEvent.verifyStudentStatus || false}
                                            onChange={e => setNewEvent({ ...newEvent, verifyStudentStatus: e.target.checked })}
                                            className="accent-green-400"
                                        />
                                        Verify Active Student Status
                                    </label>
                                </div>
                                
                                {/* Excluded Colleges */}
                                <div className="space-y-2">
                                    <label className="text-[9px] text-green-300 uppercase font-bold block">Excluded Institutions (Optional)</label>
                                    <textarea
                                        className="input-glass p-2 rounded-lg w-full text-xs h-16 resize-none"
                                        placeholder="List institutions to exclude (one per line)..."
                                        value={newEvent.excludedColleges || ''}
                                        onChange={e => setNewEvent({ ...newEvent, excludedColleges: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* General Verification Settings */}
                        <div className="space-y-3">
                            <label className="text-[9px] text-blue-300 uppercase font-bold block">General Verification Requirements</label>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newEvent.requirePhoneVerification || false}
                                        onChange={e => setNewEvent({ ...newEvent, requirePhoneVerification: e.target.checked })}
                                        className="accent-blue-400"
                                    />
                                    Phone OTP Verification
                                </label>
                                <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newEvent.requireEmailVerification || false}
                                        onChange={e => setNewEvent({ ...newEvent, requireEmailVerification: e.target.checked })}
                                        className="accent-blue-400"
                                    />
                                    Email Verification
                                </label>
                            </div>
                        </div>

                        {/* Geographic Restrictions */}
                        <div className="space-y-3 pt-3 border-t border-white/5">
                            <label className="text-[9px] text-blue-300 uppercase font-bold block">Geographic Restrictions (Optional)</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[8px] text-white/40 uppercase ml-1 block mb-1">Allowed States</label>
                                    <input
                                        className="input-glass p-2 rounded-lg w-full text-xs"
                                        placeholder="e.g., Karnataka, Tamil Nadu"
                                        value={newEvent.allowedStates || ''}
                                        onChange={e => setNewEvent({ ...newEvent, allowedStates: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[8px] text-white/40 uppercase ml-1 block mb-1">Allowed Cities</label>
                                    <input
                                        className="input-glass p-2 rounded-lg w-full text-xs"
                                        placeholder="e.g., Bangalore, Hassan"
                                        value={newEvent.allowedCities || ''}
                                        onChange={e => setNewEvent({ ...newEvent, allowedCities: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="text-[8px] text-white/30">Leave empty to allow participants from anywhere</div>
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                        <label className="text-[10px] text-vortex-blue uppercase font-black tracking-widest block">Registration Period</label>
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] text-white/30 uppercase ml-1 mb-1 block">Opens On</label>
                                <input className="input-glass p-3 rounded-lg w-full text-sm" type="datetime-local" value={newEvent.registrationOpens} onChange={e => setNewEvent({ ...newEvent, registrationOpens: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[9px] text-white/30 uppercase ml-1 mb-1 block">Closes On</label>
                                <input className="input-glass p-3 rounded-lg w-full text-sm" type="datetime-local" value={newEvent.registrationCloses} onChange={e => setNewEvent({ ...newEvent, registrationCloses: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 xs:gap-6 text-xs text-white/60">
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newEvent.autoCloseOnCapacity} onChange={e => setNewEvent({ ...newEvent, autoCloseOnCapacity: e.target.checked })} />Auto-close</label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newEvent.enableWaitlist} onChange={e => setNewEvent({ ...newEvent, enableWaitlist: e.target.checked })} />Waitlist</label>
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                        <label className="text-[10px] text-vortex-orange uppercase font-black tracking-widest block">Organizer Info</label>
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                            <input className="input-glass p-3 rounded-lg text-sm" placeholder="Name" value={newEvent.organizer?.name || ''} onChange={e => setNewEvent({ ...newEvent, organizer: { ...newEvent.organizer, name: e.target.value } })} />
                            <input className="input-glass p-3 rounded-lg text-sm" placeholder="Email" value={newEvent.organizer?.email || ''} onChange={e => setNewEvent({ ...newEvent, organizer: { ...newEvent.organizer, email: e.target.value } })} />
                        </div>
                    </div>

                    {/* Eligibility & Restrictions */}
                    <div className="p-4 bg-gradient-to-br from-purple-500/10 rounded-xl border border-purple-500/20 space-y-4">
                        <label className="text-[10px] text-purple-400 uppercase font-black tracking-widest block">🎯 Eligibility & Restrictions</label>

                        {/* Participant Types */}
                        <div className="space-y-2">
                            <label className="text-[9px] text-white/40 uppercase ml-1 block">Who Can Participate?</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Open to All', 'Engineering Students', 'BCA Students', 'MCA Students'].map(type => (
                                    <label key={type} className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newEvent.eligibility?.participants?.includes(type) || false}
                                            onChange={e => {
                                                const participants = newEvent.eligibility?.participants || [];
                                                if (e.target.checked) {
                                                    setNewEvent({
                                                        ...newEvent,
                                                        eligibility: {
                                                            ...newEvent.eligibility,
                                                            participants: [...participants, type]
                                                        }
                                                    });
                                                } else {
                                                    setNewEvent({
                                                        ...newEvent,
                                                        eligibility: {
                                                            ...newEvent.eligibility,
                                                            participants: participants.filter(p => p !== type)
                                                        }
                                                    });
                                                }
                                            }}
                                            className="accent-purple-400"
                                        />
                                        {type}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Age Restrictions */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[9px] text-white/40 uppercase ml-1 block mb-1">Min Age</label>
                                <input
                                    className="input-glass p-2 rounded-lg w-full text-xs"
                                    type="number"
                                    placeholder="e.g., 16"
                                    value={newEvent.eligibility?.minAge || ''}
                                    onChange={e => setNewEvent({ ...newEvent, eligibility: { ...newEvent.eligibility, minAge: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="text-[9px] text-white/40 uppercase ml-1 block mb-1">Max Age</label>
                                <input
                                    className="input-glass p-2 rounded-lg w-full text-xs"
                                    type="number"
                                    placeholder="e.g., 25"
                                    value={newEvent.eligibility?.maxAge || ''}
                                    onChange={e => setNewEvent({ ...newEvent, eligibility: { ...newEvent.eligibility, maxAge: e.target.value } })}
                                />
                            </div>
                        </div>

                        {/* Required Documents */}
                        <div className="space-y-2">
                            <label className="text-[9px] text-white/40 uppercase ml-1 block">Required Documents</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Registration Screenshot', 'College ID Proof'].map(doc => (
                                    <label key={doc} className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newEvent.eligibility?.requiredDocs?.includes(doc) || false}
                                            onChange={e => {
                                                const docs = newEvent.eligibility?.requiredDocs || [];
                                                if (e.target.checked) {
                                                    setNewEvent({
                                                        ...newEvent,
                                                        eligibility: {
                                                            ...newEvent.eligibility,
                                                            requiredDocs: [...docs, doc]
                                                        }
                                                    });
                                                } else {
                                                    setNewEvent({
                                                        ...newEvent,
                                                        eligibility: {
                                                            ...newEvent.eligibility,
                                                            requiredDocs: docs.filter(d => d !== doc)
                                                        }
                                                    });
                                                }
                                            }}
                                            className="accent-purple-400"
                                        />
                                        {doc}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* College/Institution Restrictions */}
                        {newEvent.eventType === 'Intra-College' && (
                            <div className="space-y-2 p-3 bg-white/5 rounded-lg border border-white/5">
                                <label className="text-[9px] text-orange-300 uppercase font-bold block">Intra-College Restrictions</label>
                                <input
                                    className="input-glass p-2 rounded-lg w-full text-xs"
                                    placeholder="Allowed College/Institution Name"
                                    value={newEvent.allowedCollege || ''}
                                    onChange={e => setNewEvent({ ...newEvent, allowedCollege: e.target.value })}
                                />
                                <div className="text-[8px] text-white/30">Only students from this institution can register</div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-white/40 uppercase ml-1 block mb-2">Event Date</label>
                            <input className="input-glass p-3 sm:p-4 rounded-xl w-full" type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} required />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] text-white/40 uppercase ml-1 block mb-2">Start</label>
                                <input className="input-glass p-3 sm:p-4 rounded-xl w-full" type="time" value={newEvent.startTime} onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-[10px] text-white/40 uppercase ml-1 block mb-2">End</label>
                                <input className="input-glass p-3 sm:p-4 rounded-xl w-full" type="time" value={newEvent.endTime} onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <button type="button" onClick={generateGCalLink} className="text-[10px] font-bold text-vortex-orange bg-vortex-orange/10 px-3 py-1.5 rounded-full flex items-center gap-2 w-fit hover:bg-vortex-orange/20 transition-all"><Calendar size={12} />Sync GCal</button>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                        <label className="text-[10px] text-green-400 uppercase font-black tracking-widest block">💰 Pricing & Limits</label>
                        
                        {/* Free vs Paid Event Toggle */}
                        <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/5">
                            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                                <input
                                    type="radio"
                                    name="eventPricing"
                                    checked={!newEvent.price || newEvent.price === 0}
                                    onChange={() => setNewEvent({ ...newEvent, price: 0 })}
                                    className="accent-green-400"
                                />
                                Free Event
                            </label>
                            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                                <input
                                    type="radio"
                                    name="eventPricing"
                                    checked={newEvent.price > 0}
                                    onChange={() => setNewEvent({ ...newEvent, price: newEvent.price || 100 })}
                                    className="accent-green-400"
                                />
                                Paid Event
                            </label>
                        </div>

                        {/* Pricing Details (only show if paid event) */}
                        {newEvent.price > 0 && (
                            <div className="space-y-4 p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">₹</span>
                                        <input 
                                            className="input-glass p-3 pl-7 rounded-lg w-full text-sm" 
                                            type="number" 
                                            placeholder="Entry Fee Amount" 
                                            value={newEvent.price} 
                                            onChange={e => setNewEvent({ ...newEvent, price: e.target.value })} 
                                            min="1"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <select 
                                            className="input-glass p-3 rounded-lg w-full text-sm bg-[#1a1a1a]"
                                            value={newEvent.feeType || 'per_person'}
                                            onChange={e => setNewEvent({ ...newEvent, feeType: e.target.value })}
                                        >
                                            <option value="per_person">Per Person</option>
                                            <option value="per_team">Per Team (Flat Rate)</option>
                                        </select>
                                        <div className="text-[9px] text-white/30 px-1">How the fee is calculated</div>
                                    </div>
                                </div>

                                {/* Fee Breakdown Preview */}
                                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                    <div className="text-[9px] text-green-300 uppercase font-bold mb-2">Fee Breakdown Preview</div>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-white/70">Base Fee ({newEvent.feeType === 'per_team' ? 'Per Team' : 'Per Person'})</span>
                                            <span className="text-white">₹{newEvent.price || 0}</span>
                                        </div>
                                        {newEvent.gstEnabled && (
                                            <div className="flex justify-between">
                                                <span className="text-white/50">GST ({newEvent.gstPercent || 18}%)</span>
                                                <span className="text-white/70">₹{Math.round((newEvent.price || 0) * ((newEvent.gstPercent || 18) / 100))}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-white/10 pt-1 flex justify-between font-bold">
                                            <span className="text-white">Total Amount</span>
                                            <span className="text-green-400">
                                                ₹{newEvent.gstEnabled ? 
                                                    Math.round((newEvent.price || 0) * (1 + ((newEvent.gstPercent || 18) / 100))) : 
                                                    (newEvent.price || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Capacity Settings */}
                        <div className="space-y-3">
                            <label className="text-[9px] text-white/40 uppercase font-bold block">Participant Capacity</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <input 
                                        className="input-glass p-3 rounded-lg w-full text-sm" 
                                        type="number" 
                                        placeholder="Max Participants" 
                                        value={newEvent.capacity} 
                                        onChange={e => setNewEvent({ ...newEvent, capacity: e.target.value })} 
                                        min="0"
                                    />
                                    <div className="text-[9px] text-white/30 px-1">0 = unlimited</div>
                                </div>
                                <div className="space-y-1">
                                    <input 
                                        className="input-glass p-3 rounded-lg w-full text-sm" 
                                        type="number" 
                                        placeholder="Waitlist Limit" 
                                        value={newEvent.waitlistCapacity || ''} 
                                        onChange={e => setNewEvent({ ...newEvent, waitlistCapacity: e.target.value })} 
                                        min="0"
                                    />
                                    <div className="text-[9px] text-white/30 px-1">Max waitlist size</div>
                                </div>
                            </div>
                        </div>

                        {/* Fee Structure Options */}
                        <div className="space-y-3 pt-2 border-t border-white/5">
                            <label className="text-[9px] text-green-300 uppercase font-bold tracking-wider block">Fee Structure</label>
                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                                <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="feeStructure"
                                        value="perPerson"
                                        checked={!newEvent.teamPricing?.perTeam}
                                        onChange={e => setNewEvent({ ...newEvent, teamPricing: { ...newEvent.teamPricing, perTeam: false } })}
                                        className="accent-green-400"
                                    />
                                    Per Person
                                </label>
                                <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="feeStructure"
                                        value="perTeam"
                                        checked={newEvent.teamPricing?.perTeam}
                                        onChange={e => setNewEvent({ ...newEvent, teamPricing: { ...newEvent.teamPricing, perTeam: true } })}
                                        className="accent-green-400"
                                    />
                                    Per Team (Flat Rate)
                                </label>
                            </div>
                        </div>

                        {/* Early Bird Discount */}
                        <div className="space-y-3 pt-2 border-t border-white/5">
                            <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newEvent.earlyBirdDiscount?.enabled}
                                    onChange={e => setNewEvent({ ...newEvent, earlyBirdDiscount: { ...newEvent.earlyBirdDiscount, enabled: e.target.checked } })}
                                    className="accent-green-400"
                                />
                                Enable Early Bird Discount
                            </label>
                            {newEvent.earlyBirdDiscount?.enabled && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <input
                                            className="input-glass p-2 rounded-lg w-full text-xs"
                                            type="number"
                                            placeholder="Discount %"
                                            value={newEvent.earlyBirdDiscount?.discountPercent || ''}
                                            onChange={e => setNewEvent({ ...newEvent, earlyBirdDiscount: { ...newEvent.earlyBirdDiscount, discountPercent: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            className="input-glass p-2 rounded-lg w-full text-xs"
                                            type="date"
                                            placeholder="Valid Until"
                                            value={newEvent.earlyBirdDiscount?.validUntil || ''}
                                            onChange={e => setNewEvent({ ...newEvent, earlyBirdDiscount: { ...newEvent.earlyBirdDiscount, validUntil: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-white/40 uppercase ml-1 block mb-2">Registration Type</label>
                            <select className="input-glass p-3 sm:p-4 rounded-xl w-full" value={newEvent.registrationType} onChange={e => {
                                const val = e.target.value;
                                let min = 1, max = 1;
                                if (val === 'Duo') { min = 2; max = 2; }
                                else if (val === 'Team') { min = 2; max = 4; }
                                setNewEvent({ ...newEvent, registrationType: val, minTeamSize: min, maxTeamSize: max });
                            }}>
                                <option value="Solo">Solo (Individual)</option>
                                <option value="Duo">Duo (2 People)</option>
                                <option value="Team">Team (Custom Size)</option>
                            </select>
                        </div>
                        {newEvent.registrationType === 'Team' && (
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase ml-1 block mb-2">Min Team Size</label>
                                    <input className="input-glass p-3 sm:p-4 rounded-xl w-full" type="number" placeholder="Min" value={newEvent.minTeamSize} onChange={e => setNewEvent({ ...newEvent, minTeamSize: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/40 uppercase ml-1 block mb-2">Max Team Size</label>
                                    <input className="input-glass p-3 sm:p-4 rounded-xl w-full" type="number" placeholder="Max" value={newEvent.maxTeamSize} onChange={e => setNewEvent({ ...newEvent, maxTeamSize: e.target.value })} />
                                </div>
                            </div>
                        )}
                        {newEvent.registrationType === 'Team' && (
                            <div className="col-span-full">
                                <div className="text-[9px] text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-2">
                                    <strong>💡 Example:</strong> If Capacity = 120 and Max Team Size = 4, you can have up to 30 teams (120 ÷ 4 = 30 teams max)
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1 mb-2 block">Tell the story</label>
                        <textarea className="input-glass p-4 rounded-xl w-full h-40 resize-none" placeholder="Enter event details, prerequisites, and what to expect..." value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} required />
                    </div>

                    <div className="p-4 bg-gradient-to-br from-green-500/10 rounded-xl border border-green-500/20 space-y-4">
                        <label className="text-[10px] text-green-400 uppercase font-black block">💳 Payment Configuration & Fee Collection</label>

                        {/* Payment Method Selection */}
                        <div className="space-y-3">
                            <label className="text-[9px] text-white/40 uppercase ml-1 block">Payment Gateway Selection</label>
                            <div className="grid grid-cols-1 gap-2">
                                <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                    <input
                                        type="radio"
                                        name="paymentGateway"
                                        value="UPI"
                                        checked={newEvent.paymentGateway === 'UPI'}
                                        onChange={e => setNewEvent({ ...newEvent, paymentGateway: e.target.value })}
                                        className="accent-green-400"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-white">UPI Payment Only</div>
                                        <div className="text-xs text-white/60">QR Code + UPI ID for instant payments</div>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                    <input
                                        type="radio"
                                        name="paymentGateway"
                                        value="Offline"
                                        checked={newEvent.paymentGateway === 'Offline'}
                                        onChange={e => setNewEvent({ ...newEvent, paymentGateway: e.target.value })}
                                        className="accent-green-400"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-white">Offline Payment Only</div>
                                        <div className="text-xs text-white/60">Cash, Bank Transfer, Manual Collection</div>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                    <input
                                        type="radio"
                                        name="paymentGateway"
                                        value="Both"
                                        checked={newEvent.paymentGateway === 'Both'}
                                        onChange={e => setNewEvent({ ...newEvent, paymentGateway: e.target.value })}
                                        className="accent-green-400"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-white">Both UPI & Offline</div>
                                        <div className="text-xs text-white/60">Participants can choose either option</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Payment Receiver Information */}
                        <div className="space-y-3 pt-3 border-t border-white/5">
                            <label className="text-[9px] text-white/40 uppercase ml-1 block">Payment Receiver Details</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    className="input-glass p-3 rounded-lg w-full text-sm"
                                    placeholder="Organization/Person Name"
                                    value={newEvent.paymentReceiverName || ''}
                                    onChange={e => setNewEvent({ ...newEvent, paymentReceiverName: e.target.value })}
                                />
                                <input
                                    className="input-glass p-3 rounded-lg w-full text-sm"
                                    placeholder="Contact Number"
                                    value={newEvent.paymentContactNumber || ''}
                                    onChange={e => setNewEvent({ ...newEvent, paymentContactNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* UPI Details for UPI or Both payment methods */}
                        {(newEvent.paymentGateway === 'UPI' || newEvent.paymentGateway === 'Both') && (
                            <div className="space-y-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <label className="text-[9px] text-blue-300 uppercase font-bold block">🔵 UPI Payment Configuration (Required)</label>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[8px] text-white/40 uppercase ml-1 block mb-1">UPI ID *</label>
                                        <input
                                            className="input-glass p-3 rounded-lg w-full text-sm"
                                            placeholder="e.g., teamvortex@paytm, admin@upi"
                                            value={newEvent.upiId || ''}
                                            onChange={e => setNewEvent({ ...newEvent, upiId: e.target.value })}
                                            required={newEvent.paymentGateway === 'UPI' || newEvent.paymentGateway === 'Both'}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] text-white/40 uppercase ml-1 block mb-1">QR Code Image URL *</label>
                                        <input
                                            className="input-glass p-3 rounded-lg w-full text-sm"
                                            placeholder="https://example.com/qr-code.jpg"
                                            value={newEvent.upiQrCode || ''}
                                            onChange={e => setNewEvent({ ...newEvent, upiQrCode: e.target.value })}
                                            required={newEvent.paymentGateway === 'UPI' || newEvent.paymentGateway === 'Both'}
                                        />
                                        <div className="text-[8px] text-white/30 mt-1">Upload QR code image to a hosting service and paste the direct image URL</div>
                                    </div>
                                </div>
                                
                                {/* UPI Preview */}
                                {newEvent.upiId && newEvent.upiQrCode && (
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="text-[8px] text-green-400 uppercase font-bold mb-2">Preview</div>
                                        <div className="flex items-center gap-3">
                                            <img 
                                                src={newEvent.upiQrCode} 
                                                alt="QR Code Preview" 
                                                className="w-12 h-12 rounded border border-white/10"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                            <div className="hidden text-[10px] text-red-400 bg-red-500/10 px-2 py-1 rounded">Invalid Image URL</div>
                                            <div className="text-xs text-white/70">
                                                <div className="font-medium">UPI ID: {newEvent.upiId}</div>
                                                <div className="text-[10px] text-white/50">QR Code will be displayed to users</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Offline Details */}
                        {(newEvent.paymentGateway === 'Offline' || newEvent.paymentGateway === 'Both') && (
                            <div className="space-y-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                                <label className="text-[9px] text-orange-300 uppercase font-bold block">🟠 Offline Payment Configuration</label>
                                <div>
                                    <label className="text-[8px] text-white/40 uppercase ml-1 block mb-1">Payment Instructions</label>
                                    <textarea
                                        className="input-glass p-3 rounded-lg w-full text-sm h-20 resize-none"
                                        placeholder="Provide instructions for offline payment (e.g., Pay at registration desk, Bank transfer details, etc.)"
                                        value={newEvent.offlineInstructions || ''}
                                        onChange={e => setNewEvent({ ...newEvent, offlineInstructions: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* GST Settings */}
                        <div className="space-y-3 pt-2 border-t border-white/5">
                            <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newEvent.gstEnabled}
                                    onChange={e => setNewEvent({ ...newEvent, gstEnabled: e.target.checked })}
                                    className="accent-green-400"
                                />
                                Include GST in pricing
                            </label>
                            {newEvent.gstEnabled && (
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        className="input-glass p-2 rounded-lg w-full text-xs"
                                        type="number"
                                        placeholder="GST %"
                                        value={newEvent.gstPercent || 18}
                                        onChange={e => setNewEvent({ ...newEvent, gstPercent: e.target.value })}
                                    />
                                    <input
                                        className="input-glass p-2 rounded-lg w-full text-xs"
                                        placeholder="GST Number"
                                        value={newEvent.gstNumber || ''}
                                        onChange={e => setNewEvent({ ...newEvent, gstNumber: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-blue-500/10 rounded-xl border border-blue-500/20 space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] text-blue-400 uppercase font-black tracking-tighter sm:tracking-widest">🏆 Rounds / Timeline</label>
                            <button type="button" onClick={() => setNewEvent({ ...newEvent, rounds: [...(newEvent.rounds || []), { roundNumber: (newEvent.rounds?.length || 0) + 1, name: '', date: '', venue: '', format: 'Elimination', advancingCount: 10 }] })} className="text-[10px] text-blue-400 font-bold hover:underline">+ Add Round</button>
                        </div>
                        <div className="grid gap-2">
                            {newEvent.rounds?.map((r, i) => (
                                <div key={i} className="flex gap-2 items-center bg-black/20 p-2 rounded-lg border border-white/5">
                                    <span className="text-[10px] text-white/20 font-bold ml-1">{i + 1}</span>
                                    <input className="input-glass p-2 rounded text-xs flex-1" placeholder="Round Name" value={r.name} onChange={e => { const rds = [...newEvent.rounds]; rds[i].name = e.target.value; setNewEvent({ ...newEvent, rounds: rds }); }} />
                                    <button type="button" onClick={() => setNewEvent({ ...newEvent, rounds: newEvent.rounds.filter((_, idx) => idx !== i) })} className="text-red-400/40 hover:text-red-400 transition-colors"><X size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-amber-500/10 rounded-xl border border-amber-500/20 space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] text-amber-400 uppercase font-black">🤝 Sponsors</label>
                            <button type="button" onClick={() => setNewEvent({ ...newEvent, sponsors: [...(newEvent.sponsors || []), { name: '', tier: 'Gold', logoUrl: '' }] })} className="text-[10px] text-amber-400 font-bold hover:underline">+ Add Sponsor</button>
                        </div>
                        <div className="grid gap-2">
                            {newEvent.sponsors?.map((s, i) => (
                                <div key={i} className="flex gap-2 items-center bg-black/20 p-2 rounded-lg border border-white/5">
                                    <input className="input-glass p-2 rounded text-xs flex-1" placeholder="Brand Name" value={s.name} onChange={e => { const sps = [...newEvent.sponsors]; sps[i].name = e.target.value; setNewEvent({ ...newEvent, sponsors: sps }); }} />
                                    <button type="button" onClick={() => setNewEvent({ ...newEvent, sponsors: newEvent.sponsors.filter((_, idx) => idx !== i) })} className="text-red-400/40 hover:text-red-400 transition-colors"><X size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] text-cyan-400 uppercase font-black">❓ FAQs</label>
                            <button type="button" onClick={() => setNewEvent({ ...newEvent, faqs: [...(newEvent.faqs || []), { question: '', answer: '' }] })} className="text-[10px] text-cyan-400 font-bold hover:underline">+ Add FAQ</button>
                        </div>
                        <div className="grid gap-2">
                            {newEvent.faqs?.map((faq, i) => (
                                <div key={i} className="grid gap-1">
                                    <div className="flex gap-2">
                                        <input className="input-glass p-2 rounded text-xs flex-1" placeholder="Question" value={faq.question} onChange={e => { const fs = [...newEvent.faqs]; fs[i].question = e.target.value; setNewEvent({ ...newEvent, faqs: fs }); }} />
                                        <button type="button" onClick={() => setNewEvent({ ...newEvent, faqs: newEvent.faqs.filter((_, idx) => idx !== i) })} className="text-red-400/40 hover:text-red-400"><X size={16} /></button>
                                    </div>
                                    <textarea className="input-glass p-2 rounded text-[10px] w-full h-16 resize-none" placeholder="Answer" value={faq.answer} onChange={e => { const fs = [...newEvent.faqs]; fs[i].answer = e.target.value; setNewEvent({ ...newEvent, faqs: fs }); }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col xs:flex-row gap-4 pt-6">
                        <button type="submit" className="glass-button bg-vortex-blue text-white flex-1 font-bold h-12 order-2 xs:order-1">
                            {editingEventId ? 'Sync Changes' : 'Launch Event'}
                        </button>
                        <button type="button" onClick={onCancel} className="glass-button text-red-400 font-bold border-red-500/20 px-8 h-12 order-1 xs:order-2">Discard</button>
                    </div>
                </div >
            </div >
        </form >
    );
});

export default EventForm;
