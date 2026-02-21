import React from 'react';
import { Plus, X, Edit2, Trash2, Linkedin, Instagram, Mail } from 'lucide-react';

const TeamManager = React.memo(({
    teamMembers,
    showTeamForm,
    setShowTeamForm,
    editingMemberId,
    setEditingMemberId,
    newMember,
    setNewMember,
    onSave,
    onDelete,
    onEdit
}) => {
    const [activeCategory, setActiveCategory] = React.useState('core');

    const categories = [
        { id: 'faculty', label: 'Faculty Advisors' },
        { id: 'core', label: 'Core Team' },
        { id: 'technical', label: 'Technical & Projects' },
        { id: 'creative', label: 'Events & Media' },
        { id: 'editorial', label: 'Editorial' },
        { id: 'alumni', label: 'Alumni' }
    ];


    const filteredMembers = teamMembers.filter(m => m.category === activeCategory);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <h2 className="text-2xl font-bold text-white">Team Management</h2>
                <div className="flex bg-white/5 p-1 rounded-xl overflow-x-auto scrollbar-hide max-w-full">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-vortex-blue text-black shadow-lg' : 'text-white/70 hover:text-white'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => {
                        setShowTeamForm(true);
                        setEditingMemberId(null);
                        setNewMember({ name: '', role: '', category: activeCategory, linkedin: '', instagram: '', email: '' });
                    }}
                    className="glass-button bg-white/10 flex items-center gap-2 text-sm shrink-0"
                >
                    <Plus size={16} /> Add Member
                </button>
            </div>

            {showTeamForm && (
                <form onSubmit={onSave} className="glass-card p-6 border-l-4 border-vortex-orange">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">{editingMemberId ? 'Edit Team Member' : 'New Team Member'}</h3>
                        <button type="button" onClick={() => setShowTeamForm(false)} className="text-white/40 hover:text-white"><X size={20} /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs text-white/40 uppercase font-bold">Full Name</label>
                            <input
                                required
                                value={newMember.name}
                                onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-vortex-orange transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-white/40 uppercase font-bold">Role / Position</label>
                            <input
                                required
                                value={newMember.role}
                                onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-vortex-orange"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-white/40 uppercase font-bold">Category</label>
                            <select
                                value={newMember.category}
                                onChange={e => setNewMember({ ...newMember, category: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-vortex-orange"
                            >
                                <option value="faculty" className="bg-dark-bg">Faculty Advisor</option>
                                <option value="core" className="bg-dark-bg">Core Team</option>
                                <option value="technical" className="bg-dark-bg">Technical & Projects</option>
                                <option value="creative" className="bg-dark-bg">Events & Media</option>
                                <option value="editorial" className="bg-dark-bg">Editorial</option>
                                <option value="alumni" className="bg-dark-bg">Alumni</option>
                            </select>
                        </div>
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <label className="text-xs text-white/40 uppercase font-bold">Bio / About</label>
                            <textarea
                                value={newMember.bio || ''}
                                onChange={e => setNewMember({ ...newMember, bio: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-vortex-orange min-h-[100px]"
                                placeholder="Short biography..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-white/40 uppercase font-bold">Skills (comma separated)</label>
                            <input
                                value={newMember.skills ? newMember.skills.join(', ') : ''}
                                onChange={e => setNewMember({ ...newMember, skills: e.target.value.split(',').map(s => s.trim()) })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-vortex-orange"
                                placeholder="React, Node.js, Design..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-white/40 uppercase font-bold">LinkedIn URL</label>
                            <input
                                value={newMember.linkedin}
                                onChange={e => setNewMember({ ...newMember, linkedin: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-vortex-orange"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-white/40 uppercase font-bold">Instagram URL</label>
                            <input
                                value={newMember.instagram}
                                onChange={e => setNewMember({ ...newMember, instagram: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-vortex-orange"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-white/40 uppercase font-bold">Discord Tag</label>
                            <input
                                value={newMember.discord || ''}
                                onChange={e => setNewMember({ ...newMember, discord: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-vortex-orange"
                                placeholder="username#1234"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-white/40 uppercase font-bold">Email</label>
                            <input
                                type="email"
                                value={newMember.email}
                                onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-vortex-orange"
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowTeamForm(false)} className="px-6 py-2 border border-white/10 rounded-lg text-white hover:bg-white/5">Cancel</button>
                        <button type="submit" className="glass-button bg-vortex-orange text-black px-8 py-2">Save Member</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12 pt-8">
                {filteredMembers.map(member => (
                    <div key={member._id} className="glass-card p-6 relative group animate-fade-in flex flex-col justify-between h-full border-white/5 hover:border-vortex-blue/40 transition-all duration-300">
                        <div>
                            {/* Name & Role */}
                            <div className="space-y-1.5">
                                <h3 className="text-lg font-bold text-white tracking-tight leading-tight">{member.name}</h3>
                                <div className="text-vortex-blue text-xs font-bold uppercase tracking-wider">{member.role}</div>
                                {member.bio && <p className="text-white/40 text-[10px] line-clamp-2 mt-2 leading-relaxed">{member.bio}</p>}
                                {member.skills?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {member.skills.slice(0, 3).map((skill, si) => (
                                            <span key={si} className="text-[8px] px-1.5 py-0.5 bg-vortex-blue/10 text-vortex-blue rounded border border-vortex-blue/20">
                                                {skill}
                                            </span>
                                        ))}
                                        {member.skills.length > 3 && <span className="text-[8px] text-white/20">+{member.skills.length - 3}</span>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Social Icons & Actions */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                {member.linkedin && (
                                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/5 hover:bg-vortex-blue/20 rounded-lg text-white/40 hover:text-vortex-blue transition-all">
                                        <Linkedin size={14} />
                                    </a>
                                )}
                                {member.instagram && (
                                    <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/5 hover:bg-pink-500/20 rounded-lg text-white/40 hover:text-pink-500 transition-all">
                                        <Instagram size={14} />
                                    </a>
                                )}
                                {member.email && (
                                    <a
                                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${member.email}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 bg-white/5 hover:bg-green-500/20 rounded-lg text-white/40 hover:text-green-500 transition-all"
                                        title={`Email ${member.name}`}
                                    >
                                        <Mail size={14} />
                                    </a>
                                )}
                            </div>

                            <div className="flex gap-1 pl-2">
                                <button onClick={() => onEdit(member)} className="p-1.5 text-white/20 hover:text-vortex-blue transition-colors">
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => onDelete(member._id)} className="p-1.5 text-white/20 hover:text-red-500 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default TeamManager;
