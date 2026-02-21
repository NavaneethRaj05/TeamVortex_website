import React from 'react';
import { Plus, Edit2, Trash2, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-react';

const SponsorManager = React.memo(({
    sponsors,
    showSponsorForm,
    setShowSponsorForm,
    editingSponsorId,
    setEditingSponsorId,
    newSponsor,
    setNewSponsor,
    onSave,
    onDelete,
    onEdit,
    onToggleStatus
}) => {
    const sponsorTypes = [
        { value: 'title', label: 'Title Sponsor', color: 'text-yellow-400' },
        { value: 'platinum', label: 'Platinum', color: 'text-gray-300' },
        { value: 'gold', label: 'Gold', color: 'text-yellow-500' },
        { value: 'silver', label: 'Silver', color: 'text-gray-400' },
        { value: 'bronze', label: 'Bronze', color: 'text-orange-600' },
        { value: 'partner', label: 'Partner', color: 'text-blue-400' },
        { value: 'media', label: 'Media Partner', color: 'text-purple-400' }
    ];

    const getSponsorTypeColor = (type) => {
        const typeObj = sponsorTypes.find(t => t.value === type);
        return typeObj ? typeObj.color : 'text-white';
    };

    const getSponsorTypeIcon = (type) => {
        switch (type) {
            case 'title': return '👑';
            case 'platinum': return '💎';
            case 'gold': return '🥇';
            case 'silver': return '🥈';
            case 'bronze': return '🥉';
            case 'partner': return '🤝';
            case 'media': return '📺';
            default: return '🏢';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Sponsor Management</h2>
                <button
                    onClick={() => {
                        setShowSponsorForm(true);
                        setEditingSponsorId(null);
                        setNewSponsor({
                            name: '',
                            description: '',
                            type: 'partner',
                            logo: '',
                            website: '',
                            contactEmail: '',
                            contactPerson: '',
                            phone: '',
                            industry: '',
                            sponsorshipAmount: 0,
                            benefits: [],
                            startDate: '',
                            endDate: '',
                            isActive: true,
                            socialLinks: {
                                linkedin: '',
                                twitter: '',
                                instagram: '',
                                facebook: ''
                            },
                            events: [],
                            notes: ''
                        });
                    }}
                    className="glass-button bg-white/10 flex items-center gap-2 text-sm"
                >
                    <Plus size={16} /> Add Sponsor
                </button>
            </div>

            {showSponsorForm && (
                <div className="glass-card p-4 sm:p-6 border-l-4 border-vortex-blue animate-slide-up">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Plus size={20} className="text-vortex-blue" />
                        {editingSponsorId ? 'Edit Sponsor' : 'New Sponsor'}
                    </h3>
                    <form onSubmit={onSave} className="grid grid-cols-1 gap-5">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase font-black ml-1">Sponsor Name *</label>
                                <input
                                    className="input-glass p-3 rounded-xl w-full text-base sm:text-lg font-medium"
                                    placeholder="Company Name"
                                    value={newSponsor.name}
                                    onChange={e => setNewSponsor({ ...newSponsor, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase font-black ml-1">Sponsor Type *</label>
                                <select
                                    className="input-glass p-3 rounded-xl w-full bg-[#1a1a1a] cursor-pointer"
                                    value={newSponsor.type}
                                    onChange={e => setNewSponsor({ ...newSponsor, type: e.target.value })}
                                    required
                                >
                                    {sponsorTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] text-white/30 uppercase font-black ml-1">Description *</label>
                            <textarea
                                className="input-glass p-3 rounded-xl w-full h-24 resize-none text-sm"
                                placeholder="Brief description about the sponsor..."
                                value={newSponsor.description}
                                onChange={e => setNewSponsor({ ...newSponsor, description: e.target.value })}
                                required
                            />
                        </div>

                        {/* Logo and Website */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase font-black ml-1">Logo URL *</label>
                                <input
                                    className="input-glass p-3 rounded-xl w-full"
                                    placeholder="https://example.com/logo.png"
                                    value={newSponsor.logo}
                                    onChange={e => setNewSponsor({ ...newSponsor, logo: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase font-black ml-1">Website</label>
                                <input
                                    className="input-glass p-3 rounded-xl w-full"
                                    placeholder="https://company.com"
                                    value={newSponsor.website}
                                    onChange={e => setNewSponsor({ ...newSponsor, website: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase font-black ml-1">Contact Person</label>
                                <input
                                    className="input-glass p-3 rounded-xl w-full"
                                    placeholder="John Doe"
                                    value={newSponsor.contactPerson}
                                    onChange={e => setNewSponsor({ ...newSponsor, contactPerson: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase font-black ml-1">Contact Email</label>
                                <input
                                    type="email"
                                    className="input-glass p-3 rounded-xl w-full"
                                    placeholder="contact@company.com"
                                    value={newSponsor.contactEmail}
                                    onChange={e => setNewSponsor({ ...newSponsor, contactEmail: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase font-black ml-1">Phone</label>
                                <input
                                    className="input-glass p-3 rounded-xl w-full"
                                    placeholder="+1 234 567 8900"
                                    value={newSponsor.phone}
                                    onChange={e => setNewSponsor({ ...newSponsor, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Industry and Amount */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase font-black ml-1">Industry</label>
                                <input
                                    className="input-glass p-3 rounded-xl w-full"
                                    placeholder="Technology, Finance, etc."
                                    value={newSponsor.industry}
                                    onChange={e => setNewSponsor({ ...newSponsor, industry: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase font-black ml-1">Sponsorship Amount</label>
                                <input
                                    type="number"
                                    className="input-glass p-3 rounded-xl w-full"
                                    placeholder="0"
                                    value={newSponsor.sponsorshipAmount}
                                    onChange={e => setNewSponsor({ ...newSponsor, sponsorshipAmount: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        {/* Partnership Duration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase font-black ml-1">Start Date</label>
                                <input
                                    type="date"
                                    className="input-glass p-3 rounded-xl w-full"
                                    value={newSponsor.startDate}
                                    onChange={e => setNewSponsor({ ...newSponsor, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-white/30 uppercase font-black ml-1">End Date</label>
                                <input
                                    type="date"
                                    className="input-glass p-3 rounded-xl w-full"
                                    value={newSponsor.endDate}
                                    onChange={e => setNewSponsor({ ...newSponsor, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-1">
                            <label className="text-[10px] text-white/30 uppercase font-black ml-1">Benefits Provided</label>
                            <textarea
                                className="input-glass p-3 rounded-xl w-full h-20 resize-none text-sm"
                                placeholder="Logo placement, booth space, etc. (one per line)"
                                value={Array.isArray(newSponsor.benefits) ? newSponsor.benefits.join('\n') : ''}
                                onChange={e => setNewSponsor({ ...newSponsor, benefits: e.target.value.split('\n').filter(b => b.trim()) })}
                            />
                        </div>

                        {/* Events */}
                        <div className="space-y-1">
                            <label className="text-[10px] text-white/30 uppercase font-black ml-1">Sponsored Events</label>
                            <input
                                className="input-glass p-3 rounded-xl w-full"
                                placeholder="Event names (comma separated)"
                                value={Array.isArray(newSponsor.events) ? newSponsor.events.join(', ') : ''}
                                onChange={e => setNewSponsor({ ...newSponsor, events: e.target.value.split(',').map(e => e.trim()).filter(e => e) })}
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-1">
                            <label className="text-[10px] text-white/30 uppercase font-black ml-1">Internal Notes</label>
                            <textarea
                                className="input-glass p-3 rounded-xl w-full h-20 resize-none text-sm"
                                placeholder="Internal notes about this sponsor..."
                                value={newSponsor.notes}
                                onChange={e => setNewSponsor({ ...newSponsor, notes: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col xs:flex-row gap-3 pt-2">
                            <button type="submit" className="glass-button bg-vortex-blue text-black font-bold h-12 flex-1 order-2 xs:order-1">
                                {editingSponsorId ? 'Update Sponsor' : 'Add Sponsor'}
                            </button>
                            <button type="button" onClick={() => setShowSponsorForm(false)} className="glass-button text-red-400 font-bold border-red-500/20 px-8 h-12 order-1 xs:order-2">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {sponsors.map(sponsor => (
                    <div key={sponsor._id} className="glass-card p-4 flex flex-col sm:flex-row gap-4 group transition-all hover:bg-white/[0.02] border border-white/5">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">{getSponsorTypeIcon(sponsor.type)}</span>
                                <span className={`text-xs font-bold uppercase tracking-wider ${getSponsorTypeColor(sponsor.type)}`}>
                                    {sponsor.type}
                                </span>
                                <button
                                    onClick={() => onToggleStatus(sponsor._id)}
                                    className={`ml-auto p-1 rounded transition-colors ${sponsor.isActive ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'}`}
                                    title={sponsor.isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                                >
                                    {sponsor.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                </button>
                            </div>
                            <h3 className="font-bold text-white text-lg group-hover:text-vortex-blue transition-colors line-clamp-1">{sponsor.name}</h3>
                            <p className="text-white/40 text-xs line-clamp-2 leading-relaxed">{sponsor.description}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold">
                                {sponsor.industry && (
                                    <>
                                        <span className="uppercase text-vortex-blue bg-vortex-blue/10 px-1.5 py-0.5 rounded">{sponsor.industry}</span>
                                        <span className="text-white/20">•</span>
                                    </>
                                )}
                                <span className="text-white/40">Since {new Date(sponsor.startDate).getFullYear()}</span>
                                {sponsor.sponsorshipAmount > 0 && (
                                    <>
                                        <span className="text-white/20">•</span>
                                        <span className="text-green-400">${sponsor.sponsorshipAmount.toLocaleString()}</span>
                                    </>
                                )}
                            </div>
                            {sponsor.website && (
                                <a
                                    href={sponsor.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-vortex-blue hover:text-vortex-orange transition-colors text-xs"
                                >
                                    <ExternalLink size={12} className="mr-1" />
                                    Visit Website
                                </a>
                            )}
                        </div>
                        <div className="flex sm:flex-col gap-2 justify-end border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-4">
                            <button onClick={() => onEdit(sponsor)} className="p-2.5 hover:bg-vortex-blue/20 rounded-xl text-vortex-blue transition-colors flex items-center justify-center"><Edit2 size={18} /></button>
                            <button onClick={() => onDelete(sponsor._id)} className="p-2.5 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors flex items-center justify-center"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default SponsorManager;
