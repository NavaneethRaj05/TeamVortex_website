import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users } from 'lucide-react';

const RegistrationViewer = React.memo(({ viewingRegistrations, setViewingRegistrations, onExport, onExportPDF }) => {
    return (
        <AnimatePresence>
            {viewingRegistrations && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setViewingRegistrations(null)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative glass-card p-6 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-white line-clamp-1">{viewingRegistrations.title}</h2>
                                <div className="flex gap-4 text-sm">
                                    <p className="text-vortex-blue font-bold">{viewingRegistrations.registrations?.length || 0} Registered Players</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                <button onClick={() => onExport(viewingRegistrations)} className="glass-button bg-green-500/20 text-green-400 border-green-500/30 text-[10px] font-black uppercase tracking-widest px-4 py-2 flex-1 sm:flex-none">CSV</button>
                                <button onClick={() => onExportPDF(viewingRegistrations)} className="glass-button bg-vortex-blue/20 text-vortex-blue border-vortex-blue/30 text-[10px] font-black uppercase tracking-widest px-4 py-2 flex-1 sm:flex-none">PDF</button>
                                <button onClick={() => setViewingRegistrations(null)} className="text-white/40 hover:text-white p-2 bg-white/5 rounded-full transition-colors self-center"><X size={20} /></button>
                            </div>
                        </div>

                        <div className="overflow-auto flex-1 custom-scrollbar space-y-8 pr-2">
                            <div>
                                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30 mb-4 ml-1">Confirmed Registrations</h3>
                                <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]">
                                    <table className="w-full text-left border-collapse min-w-[600px]">
                                        <thead className="bg-black/40 text-white/20 text-[10px] uppercase font-black tracking-widest">
                                            <tr>
                                                <th className="p-4 border-b border-white/5">Team / Primary</th>
                                                <th className="p-4 border-b border-white/5">Country</th>
                                                <th className="p-4 border-b border-white/5">Size</th>
                                                <th className="p-4 border-b border-white/5">Payment</th>
                                                <th className="p-4 border-b border-white/5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-white/80 divide-y divide-white/5">
                                            {viewingRegistrations.registrations?.map((r, i) => (
                                                <React.Fragment key={i}>
                                                    <tr className="hover:bg-white/[0.03] transition-colors group">
                                                        <td className="p-4">
                                                            <div className="font-bold text-white group-hover:text-vortex-blue transition-colors">{r.teamName || r.members[0]?.name || 'N/A'}</div>
                                                            <div className="text-[10px] text-white/30 uppercase tracking-tighter sm:tracking-normal">{r.members[0]?.email}</div>
                                                        </td>
                                                        <td className="p-4 text-sm text-white/60">{r.country}</td>
                                                        <td className="p-4 text-sm font-mono text-white/40">{r.members?.length || 0}</td>
                                                        <td className="p-4">
                                                            {r.paid ? (
                                                                <div className="flex flex-col">
                                                                    <span className="text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-400/30 px-2 py-0.5 rounded w-fit bg-green-400/5">PAID</span>
                                                                    <span className="text-[8px] text-white/10 font-mono mt-1 hidden sm:block">{r.paymentId}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-white/20 text-[10px] font-black uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded w-fit">FREE / UNPAID</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <button
                                                                className="text-vortex-blue text-[10px] font-black uppercase tracking-widest hover:bg-vortex-blue/10 px-3 py-1.5 rounded-lg border border-vortex-blue/20 transition-all"
                                                                onClick={(e) => {
                                                                    const row = e.currentTarget.closest('tr').nextSibling;
                                                                    row.classList.toggle('hidden');
                                                                }}
                                                            >
                                                                View Team
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    <tr className="hidden bg-black/40">
                                                        <td colSpan="5" className="p-4 sm:p-8">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                                                {r.members?.map((m, midx) => (
                                                                    <div key={midx} className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-vortex-blue/40 transition-all">
                                                                        <div className="text-[10px] text-vortex-blue font-black uppercase tracking-widest mb-3 flex justify-between">
                                                                            <span>Member {midx + 1}</span>
                                                                            {midx === 0 && <span className="text-vortex-orange italic">Primary</span>}
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <div className="text-white font-bold leading-tight">{m.name}</div>
                                                                            <div className="text-white/40 text-[10px] truncate">{m.email}</div>
                                                                            <div className="grid grid-cols-1 gap-1 text-[10px] text-white/30 pt-2 border-t border-white/5">
                                                                                {m.phone && <div className="flex items-center gap-2"><span className="w-4">P:</span> <span className="text-white/50">{m.phone}</span></div>}
                                                                                {m.college && <div className="flex items-center gap-2"><span className="w-4">C:</span> <span className="text-white/50 truncate">{m.college}</span></div>}
                                                                                {m.idNumber && <div className="flex items-center gap-2"><span className="w-4">ID:</span> <span className="text-white/50">{m.idNumber}</span></div>}
                                                                                {(m.state || m.city) && <div className="flex items-center gap-2"><span className="w-4">L:</span> <span className="text-white/50">{m.city}, {m.state}</span></div>}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {viewingRegistrations.waitlist?.length > 0 && (
                                <div>
                                    <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-vortex-orange mb-4 ml-1">Waitlist Queue</h3>
                                    <div className="overflow-x-auto rounded-xl border border-vortex-orange/10 bg-vortex-orange/[0.02]">
                                        <table className="w-full text-left border-collapse min-w-[500px]">
                                            <thead className="bg-black/40 text-white/20 text-[10px] uppercase font-black tracking-widest">
                                                <tr>
                                                    <th className="p-4 border-b border-white/5">Team / Primary</th>
                                                    <th className="p-4 border-b border-white/5">Country</th>
                                                    <th className="p-4 border-b border-white/5">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-white/80 divide-y divide-white/5">
                                                {viewingRegistrations.waitlist.map((r, i) => (
                                                    <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                                                        <td className="p-4">
                                                            <div className="font-bold text-white">{r.teamName || r.members[0]?.name || 'N/A'}</div>
                                                            <div className="text-[10px] text-white/30 uppercase">{r.members[0]?.email}</div>
                                                        </td>
                                                        <td className="p-4 text-sm text-white/60">{r.country}</td>
                                                        <td className="p-4 text-[10px] text-vortex-orange font-black uppercase tracking-widest">
                                                            <span className="bg-vortex-orange/10 px-3 py-1 rounded">Rank: {i + 1}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {(!viewingRegistrations.registrations || viewingRegistrations.registrations.length === 0) && !viewingRegistrations.waitlist?.length && (
                                <div className="p-16 text-center">
                                    <div className="text-white/10 mb-4 flex justify-center"><Users size={48} /></div>
                                    <div className="text-white/40 italic font-medium">No registrations for this event yet.</div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
});

export default RegistrationViewer;
