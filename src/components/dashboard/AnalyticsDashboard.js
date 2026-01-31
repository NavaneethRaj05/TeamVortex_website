import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsDashboard = React.memo(({ eventStats }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="glass-card p-4 sm:p-6 h-[300px] sm:h-[400px]">
                <h2 className="text-xl font-bold text-white mb-6">Engagement Metrics</h2>
                <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={eventStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="title" stroke="#888" tick={{ fontSize: 10 }} hide={window.innerWidth < 640} />
                        <YAxis stroke="#888" tick={{ fontSize: 10 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                            itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="registrations" fill="#00f2fe" name="Registrations" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="waitlist" fill="#f69d3c" name="Waitlist" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {eventStats.map((stat, i) => (
                    <div key={i} className="glass-card p-4 border-l-2 border-vortex-blue">
                        <h3 className="font-bold text-white text-sm line-clamp-1">{stat.title}</h3>
                        <div className="mt-2 flex justify-between items-end">
                            <div className="text-xs text-white/40">Avg. Rating</div>
                            <div className="text-xl font-bold text-vortex-blue">{stat.avgRating ? stat.avgRating.toFixed(1) : 'N/A'} ★</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default AnalyticsDashboard;
