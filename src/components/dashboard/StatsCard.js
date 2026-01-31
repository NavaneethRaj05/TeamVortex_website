import React from 'react';

const StatsCard = ({ icon: Icon, label, value, color }) => (
    <div className="glass-card p-6 flex items-center gap-6 hover:border-white/20 transition-all group">
        <div className={`p-4 rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
            <Icon size={28} />
        </div>
        <div>
            <p className="text-white/40 text-xs uppercase font-black tracking-widest mb-1">{label}</p>
            <h4 className="text-3xl font-display font-bold text-white">{value}</h4>
        </div>
    </div>
);

export default StatsCard;
