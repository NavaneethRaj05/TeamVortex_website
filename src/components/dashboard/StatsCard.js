import React from 'react';

const StatsCard = ({ icon: Icon, label, value, color }) => (
    <div className="glass-card p-3 sm:p-6 flex items-center gap-3 sm:gap-6 hover:border-white/20 transition-all group">
        <div className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-transform flex-shrink-0`}>
            <Icon size={20} className="sm:hidden" />
            <Icon size={28} className="hidden sm:block" />
        </div>
        <div>
            <p className="text-white/40 text-[9px] sm:text-xs uppercase font-black tracking-widest mb-0.5 sm:mb-1">{label}</p>
            <h4 className="text-xl sm:text-3xl font-display font-bold text-white">{value}</h4>
        </div>
    </div>
);

export default StatsCard;
