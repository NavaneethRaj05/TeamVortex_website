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
                            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1 mb-2 block">Event Type</label>
                            <select
                                className="input-glass p-3 sm:p-4 rounded-xl w-full bg-[#1a1a1a] text-white outline-none cursor-pointer"
                                value={newEvent.eventType}
                                onChange={e => setNewEvent({ ...newEvent, eventType: e.target.value })}
                            >
                                <option value="Inter-College">Inter-College</option>
                                <option value="Intra-College">Intra-College</option>
                                <option value="Open">Open to All</option>
                                <option value="Workshop">Workshop</option>
                            </select>
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
                            </select>
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
                                {['College ID', 'Registration Screenshot'].map(doc => (
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
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">₹</span>
                                <input className="input-glass p-3 pl-7 rounded-lg w-full text-sm" type="number" placeholder="Entry Fee (per person/team)" value={newEvent.price} onChange={e => setNewEvent({ ...newEvent, price: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <input className="input-glass p-3 rounded-lg w-full text-sm" type="number" placeholder="Total Participants Limit" value={newEvent.capacity} onChange={e => setNewEvent({ ...newEvent, capacity: e.target.value })} />
                                <div className="text-[9px] text-white/30 px-1">Max people who can attend (0 = unlimited)</div>
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
                        <label className="text-[10px] text-green-400 uppercase font-black block">💳 Payment & Fee Collection</label>

                        {/* Payment Gateway Selection */}
                        <div className="space-y-2">
                            <label className="text-[9px] text-white/40 uppercase ml-1 block">Payment Method</label>
                            <select className="input-glass p-3 rounded-lg w-full bg-[#1a1a1a]" value={newEvent.paymentGateway} onChange={e => setNewEvent({ ...newEvent, paymentGateway: e.target.value })}>
                                <option value="UPI">UPI Direct (QR Code + UPI ID)</option>
                                <option value="Offline">Offline Only (Bank/Cash/Multiple)</option>
                            </select>
                        </div>

                        {/* Payment Receiver Name */}
                        <div className="space-y-2">
                            <label className="text-[9px] text-white/40 uppercase ml-1 block">Payment Receiver Name</label>
                            <input
                                className="input-glass p-3 rounded-lg w-full text-sm"
                                placeholder="Organization/Person name appearing on bills"
                                value={newEvent.paymentReceiverName || ''}
                                onChange={e => setNewEvent({ ...newEvent, paymentReceiverName: e.target.value })}
                            />
                        </div>

                        {/* UPI Details for Direct UPI */}
                        {newEvent.paymentGateway === 'UPI' && (
                            <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                <label className="text-[9px] text-green-300 uppercase font-bold block">UPI Payment Details</label>
                                <input
                                    className="input-glass p-2 rounded-lg w-full text-xs"
                                    placeholder="UPI ID (e.g., teamvortex@upi)"
                                    value={newEvent.upiId || ''}
                                    onChange={e => setNewEvent({ ...newEvent, upiId: e.target.value })}
                                />
                                <input
                                    className="input-glass p-2 rounded-lg w-full text-xs"
                                    placeholder="QR Code Image URL (optional)"
                                    value={newEvent.upiQrCode || ''}
                                    onChange={e => setNewEvent({ ...newEvent, upiQrCode: e.target.value })}
                                />
                            </div>
                        )}

                        {/* Offline Details */}
                        {newEvent.paymentGateway === 'Offline' && (
                            <div className="space-y-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-4">
                                    <div>
                                        <label className="text-[9px] text-white/40 uppercase font-black block mb-2">General Offline Instructions</label>
                                        <textarea
                                            className="input-glass p-2 rounded-lg w-full text-xs h-16 resize-none"
                                            placeholder="General instructions for offline payment (e.g., Pay at the help desk)..."
                                            value={newEvent.offlineInstructions || ''}
                                            onChange={e => setNewEvent({ ...newEvent, offlineInstructions: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] text-orange-300 uppercase font-bold block">Accepted Offline Methods</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['UPI', 'Bank Transfer', 'Cash', 'Cheque'].map(method => (
                                                <label key={method} className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={newEvent.offlineMethods?.includes(method) || false}
                                                        onChange={e => {
                                                            const methods = newEvent.offlineMethods || [];
                                                            if (e.target.checked) {
                                                                setNewEvent({ ...newEvent, offlineMethods: [...methods, method] });
                                                            } else {
                                                                setNewEvent({ ...newEvent, offlineMethods: methods.filter(m => m !== method) });
                                                            }
                                                        }}
                                                        className="accent-orange-400"
                                                    />
                                                    {method}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* UPI (if selected in offline) */}
                                {newEvent.offlineMethods?.includes('UPI') && (
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-2">
                                        <label className="text-[9px] text-green-300 uppercase font-bold block">UPI Details</label>
                                        <input
                                            className="input-glass p-2 rounded-lg w-full text-xs"
                                            placeholder="UPI ID"
                                            value={newEvent.upiId || ''}
                                            onChange={e => setNewEvent({ ...newEvent, upiId: e.target.value })}
                                        />
                                        <input
                                            className="input-glass p-2 rounded-lg w-full text-xs"
                                            placeholder="QR Code URL"
                                            value={newEvent.upiQrCode || ''}
                                            onChange={e => setNewEvent({ ...newEvent, upiQrCode: e.target.value })}
                                        />
                                    </div>
                                )}

                                {/* Bank Details */}
                                {newEvent.offlineMethods?.includes('Bank Transfer') && (
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-2">
                                        <label className="text-[9px] text-blue-300 uppercase font-bold block">Bank Account Details</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input className="input-glass p-2 rounded text-xs" placeholder="Bank Name" value={newEvent.bankDetails?.bankName || ''} onChange={e => setNewEvent({ ...newEvent, bankDetails: { ...newEvent.bankDetails, bankName: e.target.value } })} />
                                            <input className="input-glass p-2 rounded text-xs" placeholder="Account Name" value={newEvent.bankDetails?.accountName || ''} onChange={e => setNewEvent({ ...newEvent, bankDetails: { ...newEvent.bankDetails, accountName: e.target.value } })} />
                                            <input className="input-glass p-2 rounded text-xs" placeholder="Account Number" value={newEvent.bankDetails?.accountNumber || ''} onChange={e => setNewEvent({ ...newEvent, bankDetails: { ...newEvent.bankDetails, accountNumber: e.target.value } })} />
                                            <input className="input-glass p-2 rounded text-xs" placeholder="IFSC Code" value={newEvent.bankDetails?.ifscCode || ''} onChange={e => setNewEvent({ ...newEvent, bankDetails: { ...newEvent.bankDetails, ifscCode: e.target.value } })} />
                                        </div>
                                    </div>
                                )}

                                {/* Cash Details */}
                                {newEvent.offlineMethods?.includes('Cash') && (
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-2">
                                        <label className="text-[10px] text-amber-300 uppercase font-bold block">Cash Collection Info</label>
                                        <textarea
                                            className="input-glass p-2 rounded-lg w-full text-xs h-16 resize-none"
                                            placeholder="Location, timings, and contact person for cash payment..."
                                            value={newEvent.cashDetails?.location || ''}
                                            onChange={e => setNewEvent({ ...newEvent, cashDetails: { ...newEvent.cashDetails, location: e.target.value } })}
                                        />
                                    </div>
                                )}
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
