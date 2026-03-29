import React from 'react';
import { Save, Lock, Plus, Trash2 } from 'lucide-react';

const SettingsManager = ({
    clubSettings,
    setClubSettings,
    onSaveSettings,
    onUpdatePassword,
    userEmail
}) => {
    // Safe defaults with proper fallbacks
    const safeSettings = clubSettings || {};
    const associationLogos = safeSettings.associationLogos || [];
    const stats = safeSettings.stats || {
        activeMembers: "25+",
        projectsBuilt: "50+",
        awardsWon: "12",
        majorEvents: "5"
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            {/* Club Contact Settings */}
            <section>
                <h2 className="text-2xl font-bold text-center text-white mb-6">Club Contact Information</h2>
                <form onSubmit={onSaveSettings} className="glass-card p-4 sm:p-8 space-y-6">
                    <div>
                        <label className="text-white/60 text-sm block mb-2">Club Email</label>
                        <input
                            className="w-full input-glass p-3 rounded-lg"
                            value={clubSettings.email || ''}
                            onChange={e => setClubSettings({ ...clubSettings, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-white/60 text-sm block mb-2">Phone</label>
                        <input
                            className="w-full input-glass p-3 rounded-lg"
                            value={clubSettings.phone || ''}
                            onChange={e => setClubSettings({ ...clubSettings, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-white/60 text-sm block mb-2">Instagram</label>
                        <input
                            className="w-full input-glass p-3 rounded-lg"
                            value={clubSettings.instagramUrl || ''}
                            onChange={e => setClubSettings({ ...clubSettings, instagramUrl: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-white/60 text-sm block mb-2">LinkedIn</label>
                        <input
                            className="w-full input-glass p-3 rounded-lg"
                            value={clubSettings.linkedinUrl || ''}
                            onChange={e => setClubSettings({ ...clubSettings, linkedinUrl: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="w-full glass-button bg-green-500 text-black font-bold flex justify-center items-center gap-2">
                        <Save size={18} /> Save Contact Settings
                    </button>
                </form>
            </section>

            {/* Home Page Stats Section */}
            <section className="pt-8 border-t border-white/10">
                <h2 className="text-2xl font-bold text-center text-white mb-6">Home Page Statistics</h2>
                <div className="glass-card p-4 sm:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-white/60 text-sm block mb-2">Active Members</label>
                            <input
                                type="text"
                                className="w-full input-glass p-3 rounded-lg"
                                style={{ color: 'white' }}
                                placeholder="e.g., 25+"
                                value={stats.activeMembers}
                                onChange={e => setClubSettings({ 
                                    ...safeSettings, 
                                    stats: { ...stats, activeMembers: e.target.value }
                                })}
                            />
                        </div>
                        <div>
                            <label className="text-white/60 text-sm block mb-2">Projects Built</label>
                            <input
                                type="text"
                                className="w-full input-glass p-3 rounded-lg"
                                style={{ color: 'white' }}
                                placeholder="e.g., 50+"
                                value={stats.projectsBuilt}
                                onChange={e => setClubSettings({ 
                                    ...safeSettings, 
                                    stats: { ...stats, projectsBuilt: e.target.value }
                                })}
                            />
                        </div>
                        <div>
                            <label className="text-white/60 text-sm block mb-2">Awards Won</label>
                            <input
                                type="text"
                                className="w-full input-glass p-3 rounded-lg"
                                style={{ color: 'white' }}
                                placeholder="e.g., 12"
                                value={stats.awardsWon}
                                onChange={e => setClubSettings({ 
                                    ...safeSettings, 
                                    stats: { ...stats, awardsWon: e.target.value }
                                })}
                            />
                        </div>
                        <div>
                            <label className="text-white/60 text-sm block mb-2">Major Events</label>
                            <input
                                type="text"
                                className="w-full input-glass p-3 rounded-lg"
                                style={{ color: 'white' }}
                                placeholder="e.g., 5"
                                value={stats.majorEvents}
                                onChange={e => setClubSettings({ 
                                    ...safeSettings, 
                                    stats: { ...stats, majorEvents: e.target.value }
                                })}
                            />
                        </div>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            onSaveSettings(e);
                        }}
                        className="w-full glass-button bg-green-500 text-black font-bold flex justify-center items-center gap-2"
                    >
                        <Save size={18} /> Save Statistics
                    </button>
                </div>
            </section>

            {/* Vision, Mission, Values Section */}
            <section className="pt-8 border-t border-white/10">
                <h2 className="text-2xl font-bold text-center text-white mb-6">Vision, Mission & Values</h2>
                <div className="glass-card p-4 sm:p-8 space-y-6">
                    {/* Vision */}
                    <div>
                        <label className="text-white/60 text-sm block mb-2 font-bold">Our Vision</label>
                        <textarea
                            className="w-full input-glass p-3 rounded-lg h-32 resize-none"
                            style={{ color: 'white' }}
                            placeholder="Enter your club's vision statement..."
                            value={safeSettings.vision || "To cultivate a generation of tech leaders who don't just adapt to the future, but define it. We aim to be the epicenter of student innovation, fostering a culture where every idea has the power to spark a revolution and solve complex global challenges."}
                            onChange={e => setClubSettings({ ...safeSettings, vision: e.target.value })}
                        />
                    </div>

                    {/* Fast Paced */}
                    <div>
                        <label className="text-white/60 text-sm block mb-2 font-bold">Fast Paced (Value 1)</label>
                        <textarea
                            className="w-full input-glass p-3 rounded-lg h-24 resize-none"
                            style={{ color: 'white' }}
                            placeholder="Describe your fast-paced approach..."
                            value={safeSettings.fastPaced || "We move fast, break things, and build them better. Our agile methodology ensures we stay ahead of technical trends and deliver cutting-edge solutions in record time."}
                            onChange={e => setClubSettings({ ...safeSettings, fastPaced: e.target.value })}
                        />
                    </div>

                    {/* Global Impact */}
                    <div>
                        <label className="text-white/60 text-sm block mb-2 font-bold">Global Impact (Value 2)</label>
                        <textarea
                            className="w-full input-glass p-3 rounded-lg h-24 resize-none"
                            style={{ color: 'white' }}
                            placeholder="Describe your global impact..."
                            value={safeSettings.globalImpact || "Solving real-world problems with code. From local community tools to scalable global platforms, our projects are built with the intention of making a positive, measurable difference in society."}
                            onChange={e => setClubSettings({ ...safeSettings, globalImpact: e.target.value })}
                        />
                    </div>

                    {/* Mission */}
                    <div>
                        <label className="text-white/60 text-sm block mb-2 font-bold">Our Mission</label>
                        <textarea
                            className="w-full input-glass p-3 rounded-lg h-32 resize-none"
                            style={{ color: 'white' }}
                            placeholder="Enter your club's mission statement..."
                            value={safeSettings.mission || "To bridge the gap between academic theory and industry reality by providing an ecosystem for hands-on learning, mentorship, and competitive excellence."}
                            onChange={e => setClubSettings({ ...safeSettings, mission: e.target.value })}
                        />
                    </div>

                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            onSaveSettings(e);
                        }}
                        className="w-full glass-button bg-green-500 text-black font-bold flex justify-center items-center gap-2"
                    >
                        <Save size={18} /> Save Vision & Mission
                    </button>
                </div>
            </section>

            {/* Association Logos Slider Section */}
            <section className="pt-8 border-t border-white/10">
                <h2 className="text-2xl font-bold text-center text-white mb-2">Association Logos Slider</h2>
                <p className="text-white/40 text-sm text-center mb-6">These logos appear in the scrolling strip on the Home page.</p>
                <div className="glass-card p-4 sm:p-8 space-y-4">
                    <div>
                        <label className="text-white/60 text-sm block mb-2">Section Heading</label>
                        <input
                            type="text"
                            className="w-full input-glass p-3 rounded-lg"
                            placeholder="e.g. In Association With"
                            value={safeSettings.associationSliderTitle || ''}
                            onChange={e => setClubSettings({ ...safeSettings, associationSliderTitle: e.target.value })}
                        />
                        <p className="text-white/30 text-xs mt-1">This text appears above the logo slider on the Home page.</p>
                    </div>
                    <div>
                        <label className="text-white/60 text-sm block mb-2">Minimum logos required to show slider</label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            className="w-full input-glass p-3 rounded-lg"
                            placeholder="e.g. 3"
                            value={safeSettings.associationSliderMinLogos ?? 3}
                            onChange={e => setClubSettings({ ...safeSettings, associationSliderMinLogos: parseInt(e.target.value) || 1 })}
                        />
                        <p className="text-white/30 text-xs mt-1">
                            Slider only appears on Home page when you have at least this many logos added.
                            {associationLogos.length > 0 && (
                                <span className={`ml-2 font-semibold ${associationLogos.length >= (safeSettings.associationSliderMinLogos ?? 3) ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {associationLogos.length >= (safeSettings.associationSliderMinLogos ?? 3)
                                        ? `✓ ${associationLogos.length} logos added — slider is active`
                                        : `⚠ ${associationLogos.length} of ${safeSettings.associationSliderMinLogos ?? 3} required logos added`}
                                </span>
                            )}
                        </p>
                    </div>
                    {associationLogos.map((logo, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                    type="url"
                                    className="w-full input-glass p-3 rounded-lg text-sm"
                                    placeholder="Logo image URL (https://...)"
                                    value={logo.url}
                                    onChange={e => {
                                        const updated = [...associationLogos];
                                        updated[idx] = { ...updated[idx], url: e.target.value };
                                        setClubSettings({ ...safeSettings, associationLogos: updated });
                                    }}
                                />
                                <input
                                    type="text"
                                    className="w-full input-glass p-3 rounded-lg text-sm"
                                    placeholder="Label (e.g. CSE Dept)"
                                    value={logo.label}
                                    onChange={e => {
                                        const updated = [...associationLogos];
                                        updated[idx] = { ...updated[idx], label: e.target.value };
                                        setClubSettings({ ...safeSettings, associationLogos: updated });
                                    }}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const updated = associationLogos.filter((_, i) => i !== idx);
                                    setClubSettings({ ...safeSettings, associationLogos: updated });
                                }}
                                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors flex-shrink-0"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => setClubSettings({ ...safeSettings, associationLogos: [...associationLogos, { url: '', label: '' }] })}
                        className="w-full glass-button border border-dashed border-white/20 text-white/60 hover:text-white flex justify-center items-center gap-2 py-3"
                    >
                        <Plus size={16} /> Add Logo
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); onSaveSettings(e); }}
                        className="w-full glass-button bg-green-500 text-black font-bold flex justify-center items-center gap-2"
                    >
                        <Save size={18} /> Save Association Logos
                    </button>
                </div>
            </section>

            {/* Security Section */}
            <section className="pt-8 border-t border-white/10">
                <h2 className="text-2xl font-bold text-center text-white mb-6 flex items-center justify-center gap-2">
                    <Lock size={24} className="text-vortex-orange" /> Security
                </h2>
                <div className="glass-card p-4 sm:p-8">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const newPassword = e.target.newPassword.value;
                            const confirmPassword = e.target.confirmPassword.value;
                            onUpdatePassword(newPassword, confirmPassword, e.target);
                        }}
                        className="space-y-4"
                    >
                        <input
                            name="newPassword"
                            type="password"
                            className="w-full input-glass p-3 rounded-lg"
                            placeholder="New Password"
                            required
                        />
                        <input
                            name="confirmPassword"
                            type="password"
                            className="w-full input-glass p-3 rounded-lg"
                            placeholder="Confirm Password"
                            required
                        />
                        <button type="submit" className="w-full glass-button bg-vortex-orange text-black font-bold">
                            Update Password
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default SettingsManager;
