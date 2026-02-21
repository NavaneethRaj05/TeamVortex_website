import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const UpcomingEventsPopup = ({ events, onClose }) => {
    // Don't show popup if no events
    if (!events || events.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative max-w-lg w-full glass-card border-vortex-blue/30 overflow-hidden shadow-2xl shadow-vortex-blue/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Close Button */}
                <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-vortex-blue/10 to-transparent">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                        aria-label="Close popup"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <h2 className="text-2xl font-display font-bold text-white mb-1">
                        <span className="gradient-text">Upcoming Events</span>
                    </h2>
                    <p className="text-white/60 text-sm">Don't miss out on what's happening next!</p>
                </div>

                {/* Events List */}
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        {events.slice(0, 3).map((event, index) => (
                            <motion.div
                                key={event._id || index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * (index + 1) }}
                                className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-vortex-blue/40 hover:bg-white/10 transition-all duration-300"
                            >
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-vortex-blue transition-colors">
                                    {event.title}
                                </h3>

                                <div className="space-y-2 text-sm text-white/50">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-vortex-blue" />
                                        <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-vortex-blue" />
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/10 flex items-center justify-center bg-black/40">
                    <Link
                        to="/events"
                        onClick={onClose}
                        className="text-vortex-blue text-sm font-bold flex items-center group"
                    >
                        Explore all events
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-vortex-blue/20 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-vortex-orange/20 rounded-full blur-[80px] pointer-events-none"></div>
            </motion.div>
        </motion.div>
    );
};

export default UpcomingEventsPopup;
