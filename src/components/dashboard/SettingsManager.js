import React from 'react';
import { Save, Lock } from 'lucide-react';

const SettingsManager = React.memo(({
    clubSettings,
    setClubSettings,
    onSaveSettings,
    onUpdatePassword,
    userEmail
}) => {
    return (
        <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
            <section>
                <h2 className="text-2xl font-bold text-center text-white mb-6">Club Settings</h2>
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
                        <Save size={18} /> Save Settings
                    </button>
                </form>
            </section>

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
});

export default SettingsManager;
