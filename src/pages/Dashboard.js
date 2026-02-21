import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users, Calendar, Activity, Plus, Edit2, Trash2, Mail, MapPin, CreditCard, Menu, X, LayoutDashboard, TrendingUp, Award, Settings
} from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import { generateAdminReportPDF, downloadPDF } from '../utils/pdfGenerator';
import EventForm from '../components/dashboard/EventForm';
import StatsCard from '../components/dashboard/StatsCard';
import TeamManager from '../components/dashboard/TeamManager';
import SponsorManager from '../components/dashboard/SponsorManager';
import SettingsManager from '../components/dashboard/SettingsManager';
import AnalyticsDashboard from '../components/dashboard/AnalyticsDashboard';
import RegistrationViewer from '../components/dashboard/RegistrationViewer';
import PaymentVerificationPanel from '../components/dashboard/PaymentVerificationPanel';
import PastEventsManager from '../components/dashboard/PastEventsManager';
import ChatbotManager from '../components/dashboard/ChatbotManager';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [activeTab, setActiveTab] = useState('overview'); // overview | contests | events | team | settings | sponsors | payments | analytics
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Data States
    const [events, setEvents] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const defaultSettings = {
        stats: {
            activeMembers: "25+",
            projectsBuilt: "50+",
            awardsWon: "12",
            majorEvents: "5"
        },
        vision: "To cultivate a generation of tech leaders who don't just adapt to the future, but define it. We aim to be the epicenter of student innovation, fostering a culture where every idea has the power to spark a revolution and solve complex global challenges.",
        fastPaced: "We move fast, break things, and build them better. Our agile methodology ensures we stay ahead of technical trends and deliver cutting-edge solutions in record time.",
        globalImpact: "Solving real-world problems with code. From local community tools to scalable global platforms, our projects are built with the intention of making a positive, measurable difference in society.",
        mission: "To bridge the gap between academic theory and industry reality by providing an ecosystem for hands-on learning, mentorship, and competitive excellence.",
        email: "",
        phone: "",
        instagramUrl: "",
        linkedinUrl: ""
    };
    const [clubSettings, setClubSettings] = useState(defaultSettings);
    const [sponsors, setSponsors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Event Form States
    const [showEventForm, setShowEventForm] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        startTime: '',
        endTime: '',
        images: '',
        // Event Type & Category
        eventType: 'Inter-College',
        category: 'Technical',
        // Pricing
        price: 0,
        teamPricing: { perTeam: true, pricePerMember: 0 },
        earlyBirdDiscount: { enabled: false, discountPercent: 0, validUntil: '', limitedTo: 0 },
        // Capacity & Team
        capacity: Math.floor(Math.random() * 50) + 50,
        registrationType: 'Solo',
        minTeamSize: 1,
        maxTeamSize: 1,
        // Registration Window
        registrationOpens: '',
        registrationCloses: '',
        autoCloseOnCapacity: true,
        enableWaitlist: true,
        // Eligibility
        eligibility: { participants: [], minAge: '', maxAge: '', requiredDocs: [] },
        // Organizer
        organizer: { name: '', email: '', phone: '', department: '' },
        // Rules & Tags
        rules: '',
        rulebookUrl: '',
        tags: [],
        // Phase 2: Payment & Coupons
        paymentGateway: 'UPI',
        upiId: '',
        upiQrCode: '',
        paymentReceiverName: '',
        offlineMethods: [],
        bankDetails: { bankName: '', accountName: '', accountNumber: '', ifscCode: '' },
        cashDetails: { location: '' },
        enableOfflinePayment: false,
        gstEnabled: false,
        gstPercent: 18,
        gstNumber: '',
        coupons: [],
        // Phase 3: Rounds & Prizes
        isMultiRound: false,
        rounds: [],
        judgingCriteria: [],
        prizes: [],
        participationCertificate: true,
        winnerCertificate: true,
        // Phase 4: Social & Sponsors
        socialLinks: { website: '', facebook: '', instagram: '', whatsapp: '', linkedin: '' },
        sponsors: [],
        faqs: [],
        // Phase 5: Check-in
        enableQrCheckin: false,
        certificateTemplate: ''
    });
    const [viewingRegistrations, setViewingRegistrations] = useState(null); // event object
    const [eventStats, setEventStats] = useState([]);

    // Team Form States
    const [showTeamForm, setShowTeamForm] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState(null);
    const [newMember, setNewMember] = useState({ name: '', role: '', category: 'core', linkedin: '', instagram: '', email: '' });

    // Sponsor Form States
    const [showSponsorForm, setShowSponsorForm] = useState(false);
    const [editingSponsorId, setEditingSponsorId] = useState(null);
    const [newSponsor, setNewSponsor] = useState({
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

    useEffect(() => {
        if (!user) { navigate('/signin'); return; }

        const fetchAll = async () => {
            setLoading(true);
            try {
                const [evRes, teamRes, settingsRes, sponsorsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/events`),
                    fetch(`${API_BASE_URL}/api/team`),
                    fetch(`${API_BASE_URL}/api/settings`),
                    fetch(`${API_BASE_URL}/api/sponsors`)
                ]);

                setEvents(await evRes.json());
                setTeamMembers(await teamRes.json());
                setClubSettings(await settingsRes.json());
                setSponsors(await sponsorsRes.json());

                const statsRes = await fetch(`${API_BASE_URL}/api/events/stats`);
                setEventStats(await statsRes.json());
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [user, navigate]);

    // Individual fetch functions
    const fetchEvents = async () => { try { const res = await fetch(`${API_BASE_URL}/api/events`); setEvents(await res.json()); } catch (err) { console.error(err); } };
    const fetchTeam = async () => { try { const res = await fetch(`${API_BASE_URL}/api/team`); setTeamMembers(await res.json()); } catch (err) { console.error(err); } };
    const fetchSponsors = async () => { try { const res = await fetch(`${API_BASE_URL}/api/sponsors`); setSponsors(await res.json()); } catch (err) { console.error(err); } };

    // --- Event Handlers ---
    const handleSaveEvent = async (e) => {
        e.preventDefault();
        const url = editingEventId ? `${API_BASE_URL}/api/events/${editingEventId}` : `${API_BASE_URL}/api/events`;
        const method = editingEventId ? 'PUT' : 'POST';
        const eventData = {
            ...newEvent,
            price: Number(newEvent.price) || 0,
            capacity: Number(newEvent.capacity) || 0,
            images: Array.isArray(newEvent.images) ? newEvent.images : (newEvent.images?.split(',').map(img => img.trim()).filter(img => img) || [])
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });

            if (!res.ok) throw new Error("Failed to save event");

            setShowEventForm(false);
            setEditingEventId(null);
            setNewEvent({
                title: '', description: '', date: '', location: '', startTime: '', endTime: '', images: '',
                eventType: 'Inter-College', category: 'Technical', price: 0,
                teamPricing: { perTeam: true, pricePerMember: 0 },
                earlyBirdDiscount: { enabled: false, discountPercent: 0, validUntil: '', limitedTo: 0 },
                capacity: 100, registrationType: 'Solo', minTeamSize: 1, maxTeamSize: 1,
                registrationOpens: '', registrationCloses: '', autoCloseOnCapacity: true, enableWaitlist: true,
                eligibility: { participants: [], minAge: '', maxAge: '', requiredDocs: [] },
                organizer: { name: '', email: '', phone: '', department: '' },
                rules: '', rulebookUrl: '', tags: [],
                paymentGateway: 'UPI', upiId: '', upiQrCode: '', paymentReceiverName: '', offlineMethods: [],
                bankDetails: { bankName: '', accountName: '', accountNumber: '', ifscCode: '' },
                cashDetails: { location: '' }, enableOfflinePayment: false, gstEnabled: false, gstPercent: 18, gstNumber: '',
                coupons: [], isMultiRound: false, rounds: [], judgingCriteria: [], prizes: [],
                participationCertificate: true, winnerCertificate: true,
                socialLinks: { website: '', facebook: '', instagram: '', whatsapp: '', linkedin: '' },
                sponsors: [], faqs: [], enableQrCheckin: false, certificateTemplate: ''
            });
            fetchEvents();
            alert(`Event ${editingEventId ? 'updated' : 'created'} successfully!`);
        } catch (err) {
            console.error('Event save error:', err);
            alert(err.message);
        }
    };

    const handleDeleteEvent = async (id) => { if (!window.confirm('Delete this event?')) return; await fetch(`${API_BASE_URL}/api/events/${id}`, { method: 'DELETE' }); fetchEvents(); };

    const startEditEvent = (ev) => {
        setNewEvent({
            ...ev,
            date: ev.date ? new Date(ev.date).toISOString().slice(0, 10) : '',
            registrationOpens: ev.registrationOpens ? new Date(ev.registrationOpens).toISOString().slice(0, 16) : '',
            registrationCloses: ev.registrationCloses ? new Date(ev.registrationCloses).toISOString().slice(0, 16) : '',
            images: ev.images || []
        });
        setEditingEventId(ev._id);
        setShowEventForm(true);
    };

    const handleSendReminders = async (id) => {
        if (!window.confirm('Send 24h reminders to all registered users?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/events/${id}/remind`, { method: 'POST' });
            const data = await res.json();
            alert(data.message);
        } catch (err) { alert('Failed to send reminders'); }
    };

    const startViewRegistrations = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/events/${id}`);
            const data = await res.json();
            setViewingRegistrations(data);
        } catch (err) { alert('Failed to load registrations'); }
    };

    // --- Team Handlers ---
    const handleSaveMember = async (e) => {
        e.preventDefault();
        const url = editingMemberId ? `${API_BASE_URL}/api/team/${editingMemberId}` : `${API_BASE_URL}/api/team`;
        const method = editingMemberId ? 'PUT' : 'POST';
        try { await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMember) }); setShowTeamForm(false); setEditingMemberId(null); setNewMember({ name: '', role: '', category: 'core', linkedin: '', instagram: '', email: '' }); fetchTeam(); } catch (err) { alert(err.message); }
    };
    const handleDeleteMember = async (id) => { if (!window.confirm('Remove this team member?')) return; await fetch(`${API_BASE_URL}/api/team/${id}`, { method: 'DELETE' }); fetchTeam(); };
    const startEditMember = (m) => { setNewMember(m); setEditingMemberId(m._id); setShowTeamForm(true); };

    // --- Settings Handler ---
    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try { await fetch(`${API_BASE_URL}/api/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(clubSettings) }); alert('Settings Saved!'); } catch (err) { alert(err.message); }
    };

    const handleUpdatePassword = async (newPassword, confirmPassword, form) => {
        if (newPassword !== confirmPassword) { alert("Passwords do not match!"); return; }
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, newPassword })
            });
            if (res.ok) { alert("Updated!"); form.reset(); } else { alert("Failed"); }
        } catch (err) { alert("Error"); }
    };

    // --- Sponsor Handlers ---
    const handleSaveSponsor = async (e) => {
        e.preventDefault();
        const url = editingSponsorId ? `${API_BASE_URL}/api/sponsors/${editingSponsorId}` : `${API_BASE_URL}/api/sponsors`;
        const method = editingSponsorId ? 'PUT' : 'POST';

        try {
            await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newSponsor) });
            setShowSponsorForm(false);
            setEditingSponsorId(null);
            setNewSponsor({
                name: '', description: '', type: 'partner', logo: '', website: '', contactEmail: '', contactPerson: '', phone: '', industry: '', sponsorshipAmount: 0, benefits: [], startDate: '', endDate: '', isActive: true,
                socialLinks: { linkedin: '', twitter: '', instagram: '', facebook: '' }, events: [], notes: ''
            });
            fetchSponsors();
        } catch (err) { alert(err.message); }
    };

    const handleDeleteSponsor = async (id) => {
        if (!window.confirm('Delete this sponsor?')) return;
        await fetch(`${API_BASE_URL}/api/sponsors/${id}`, { method: 'DELETE' });
        fetchSponsors();
    };

    const startEditSponsor = (s) => { setNewSponsor(s); setEditingSponsorId(s._id); setShowSponsorForm(true); };

    const handleToggleSponsorStatus = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/sponsors/${id}/toggle-status`, { method: 'PUT' });
            fetchSponsors();
        } catch (err) { alert('Failed to toggle sponsor status'); }
    };

    const exportToPDF = (event) => {
        try {
            const doc = generateAdminReportPDF(event);
            const filename = `${event.title.replace(/\s+/g, '_')}_Registrations.pdf`;
            const success = downloadPDF(doc, filename);
            
            if (!success) {
                alert('Failed to download PDF. Please try again.');
            }
        } catch (error) {
            alert(error.message || 'Failed to export PDF');
        }
    };

    const exportToCSV = (event) => {
        if (!event.registrations || event.registrations.length === 0) { alert('No registrations to export'); return; }
        const headers = ['Team Name', 'Member Name', 'Email', 'Phone', 'College', 'ID Number', 'Registered At', 'Payment Status'];
        const rows = [];
        event.registrations.forEach(r => {
            r.members.forEach(m => {
                rows.push([`"${r.teamName || 'Solo'}"`, `"${m.name}"`, `"${m.email}"`, `"${m.phone || ''}"`, `"${m.college || ''}"`, `"${m.idNumber || ''}"`, `"${new Date(r.registeredAt).toLocaleString()}"`, `"${r.paid ? 'PAID' : (r.paymentStatus || 'PENDING')}"`]);
            });
        });
        const csvContent = [headers, ...rows].map(e => e.join(',')).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${event.title.replace(/\s+/g, '_')}_Registrations.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'contests', label: 'Contests', icon: Award },
        { id: 'events', label: 'Past Events', icon: Calendar },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        { id: 'chatbot', label: 'VortexBot', icon: Activity },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'sponsors', label: 'Sponsors', icon: Activity },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    if (loading) return <div className="min-h-screen pt-24 text-center text-white">Loading Dashboard...</div>;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcomingContests = events.filter(e => {
        const title = (e.title || '').trim().toLowerCase();
        if (title === 'prayog 1.0') return false;
        if (e.status === 'draft' || e.status === 'completed') return false;
        const eventDate = new Date(e.date);
        return eventDate >= now;
    });

    return (
        <div className="min-h-screen bg-dark-bg">
            {/* Hamburger Menu Button - Mobile Optimized */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-20 left-4 z-50 p-2.5 sm:p-3 glass-card rounded-xl hover:bg-white/10 active:scale-95 transition-all touch-manipulation"
                aria-label="Toggle Menu"
            >
                {sidebarOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
            </button>

            {/* Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar - Mobile Optimized */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed left-0 top-0 h-full w-64 sm:w-72 bg-gradient-to-b from-[#0a1628] to-[#0f1f3a] border-r border-white/10 z-40 overflow-y-auto"
                    >
                        {/* Sidebar Header */}
                        <div className="p-4 sm:p-6 border-b border-white/10">
                            <h2 className="text-lg sm:text-xl font-bold gradient-text">Team Vortex</h2>
                            <p className="text-white/60 text-xs sm:text-sm mt-1">Admin Dashboard</p>
                        </div>

                        {/* Navigation Menu - Mobile Optimized */}
                        <nav className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all touch-manipulation ${
                                        activeTab === item.id
                                            ? 'bg-vortex-blue text-black font-bold shadow-lg'
                                            : 'text-white/70 active:bg-white/10 sm:hover:bg-white/5 active:text-white sm:hover:text-white'
                                    }`}
                                >
                                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                    <span className="text-sm sm:text-base">{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        {/* User Info - Mobile Optimized */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-white/10 bg-black/20">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-vortex-blue to-vortex-orange flex items-center justify-center flex-shrink-0">
                                    <span className="text-black font-bold text-xs sm:text-sm">
                                        {user?.email?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs sm:text-sm font-medium truncate">Admin</p>
                                    <p className="text-white/60 text-[10px] sm:text-xs truncate">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="pt-24 pb-12 px-4 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Page Header */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
                                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                            </h1>
                            <p className="text-white/60">
                                {activeTab === 'overview' && 'Welcome to your admin dashboard'}
                                {activeTab === 'contests' && 'Manage upcoming hackathons and competitions'}
                                {activeTab === 'events' && 'View and manage past events'}
                                {activeTab === 'payments' && 'Verify and manage payment submissions'}
                                {activeTab === 'analytics' && 'View event statistics and insights'}
                                {activeTab === 'chatbot' && 'Manage VortexBot responses and FAQs'}
                                {activeTab === 'team' && 'Manage team members and roles'}
                                {activeTab === 'sponsors' && 'Manage sponsors and partnerships'}
                                {activeTab === 'settings' && 'Configure club settings and preferences'}
                            </p>
                        </div>
                    </div>

                    {/* --- OVERVIEW TAB --- */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatsCard 
                                    icon={Users} 
                                    label="Total Members" 
                                    value={teamMembers.length} 
                                    color="text-vortex-blue" 
                                />
                                <StatsCard 
                                    icon={Calendar} 
                                    label="Active Contests" 
                                    value={upcomingContests.length} 
                                    color="text-vortex-orange" 
                                />
                                <StatsCard 
                                    icon={Activity} 
                                    label="Total Events" 
                                    value={events.length} 
                                    color="text-green-400" 
                                />
                                <StatsCard 
                                    icon={Award} 
                                    label="Registrations" 
                                    value={upcomingContests.reduce((acc, e) => acc + (e.registrationCount || 0), 0)} 
                                    color="text-purple-400" 
                                />
                            </div>

                            {/* Quick Actions */}
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <button
                                        onClick={() => {
                                            setActiveTab('contests');
                                            setShowEventForm(true);
                                            setEditingEventId(null);
                                        }}
                                        className="glass-button bg-vortex-blue/10 text-vortex-blue border-vortex-blue/20 flex items-center justify-center gap-2 py-4 hover:bg-vortex-blue hover:text-black transition-all"
                                    >
                                        <Plus size={20} />
                                        <span>Add Contest</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('team')}
                                        className="glass-button bg-purple-500/10 text-purple-400 border-purple-500/20 flex items-center justify-center gap-2 py-4 hover:bg-purple-500 hover:text-white transition-all"
                                    >
                                        <Users size={20} />
                                        <span>Manage Team</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('payments')}
                                        className="glass-button bg-green-500/10 text-green-400 border-green-500/20 flex items-center justify-center gap-2 py-4 hover:bg-green-500 hover:text-white transition-all"
                                    >
                                        <CreditCard size={20} />
                                        <span>Payments</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('analytics')}
                                        className="glass-button bg-orange-500/10 text-orange-400 border-orange-500/20 flex items-center justify-center gap-2 py-4 hover:bg-orange-500 hover:text-white transition-all"
                                    >
                                        <TrendingUp size={20} />
                                        <span>Analytics</span>
                                    </button>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-bold text-white mb-4">Recent Contests</h2>
                                <div className="space-y-3">
                                    {upcomingContests.slice(0, 5).map(event => (
                                        <div key={event._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-vortex-blue to-vortex-orange flex items-center justify-center">
                                                    <Calendar className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{event.title}</p>
                                                    <p className="text-white/60 text-sm">{new Date(event.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 bg-vortex-blue/20 text-vortex-blue rounded-full text-xs font-bold">
                                                    {event.registrationCount || 0} Registered
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- CONTESTS TAB --- */}
                    {activeTab === 'contests' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Upcoming Contests</h2>
                                    <p className="text-white/60">Manage your active hackathons and competitions</p>
                                </div>
                                <button onClick={() => {
                                    setShowEventForm(true);
                                    setEditingEventId(null);
                                    setNewEvent({
                                        title: '', description: '', date: '', location: '', price: 0, capacity: 50, images: [], registrationType: 'Solo', maxTeamSize: 1, paymentGateway: 'UPI',
                                        upiId: '', upiQrCode: '', paymentReceiverName: '', offlineMethods: [], bankDetails: { bankName: '', accountName: '', accountNumber: '', ifscCode: '' }, cashDetails: { location: '' },
                                        offlineInstructions: '', registrationOpens: '', registrationCloses: ''
                                    });
                                }}
                                    className="glass-button bg-vortex-blue/10 text-vortex-blue border-vortex-blue/20 flex items-center gap-2 text-xs sm:text-sm px-4 py-2 hover:bg-vortex-blue hover:text-black transition-all duration-300">
                                    <Plus size={16} /> <span className="hidden xs:inline">Add Contest</span><span className="xs:hidden">Add</span>
                                </button>
                            </div>

                            {showEventForm && (
                                <EventForm
                                    newEvent={newEvent}
                                    setNewEvent={setNewEvent}
                                    onSubmit={handleSaveEvent}
                                    onCancel={() => { setShowEventForm(false); setEditingEventId(null); }}
                                    editingEventId={editingEventId}
                                />
                            )}

                            <div className="grid gap-4">
                                {upcomingContests.map(event => (
                                    <div key={event._id} className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-vortex-blue/30 transition-all group">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-white text-lg group-hover:text-vortex-blue transition-colors line-clamp-1">{event.title}</h3>
                                            <div className="text-white/40 text-xs flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(event.date).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
                                                <span className="text-vortex-blue flex items-center gap-1 font-bold"><Users size={12} /> {event.registrationCount || 0} Joined</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 sm:gap-2 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 justify-end">
                                            <button onClick={() => handleSendReminders(event._id)} className="p-2.5 hover:bg-purple-500/20 rounded-xl text-purple-400 transition-colors" title="Send Reminders"><Mail size={18} /></button>
                                            <button onClick={() => startViewRegistrations(event._id)} className="p-2.5 hover:bg-green-500/20 rounded-xl text-green-400 transition-colors" title="View Registrations"><Users size={18} /></button>
                                            <button onClick={() => startEditEvent(event)} className="p-2.5 hover:bg-vortex-blue/20 rounded-xl text-vortex-blue transition-colors"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDeleteEvent(event._id)} className="p-2.5 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- EVENTS TAB (Past Events) --- */}
                    {activeTab === 'events' && <PastEventsManager />}

                    {/* --- PAYMENTS TAB --- */}
                    {activeTab === 'payments' && <PaymentVerificationPanel />}

                    {/* --- ANALYTICS TAB --- */}
                    {activeTab === 'analytics' && <AnalyticsDashboard eventStats={eventStats} />}

                    {/* --- CHATBOT TAB --- */}
                    {activeTab === 'chatbot' && <ChatbotManager />}

                    {/* --- TEAM TAB --- */}
                    {activeTab === 'team' && (
                        <TeamManager
                            teamMembers={teamMembers}
                            showTeamForm={showTeamForm}
                            setShowTeamForm={setShowTeamForm}
                            editingMemberId={editingMemberId}
                            setEditingMemberId={setEditingMemberId}
                            newMember={newMember}
                            setNewMember={setNewMember}
                            onSave={handleSaveMember}
                            onDelete={handleDeleteMember}
                            onEdit={startEditMember}
                        />
                    )}

                    {/* --- SPONSORS TAB --- */}
                    {activeTab === 'sponsors' && (
                        <SponsorManager
                            sponsors={sponsors}
                            showSponsorForm={showSponsorForm}
                            setShowSponsorForm={setShowSponsorForm}
                            editingSponsorId={editingSponsorId}
                            setEditingSponsorId={setEditingSponsorId}
                            newSponsor={newSponsor}
                            setNewSponsor={setNewSponsor}
                            onSave={handleSaveSponsor}
                            onDelete={handleDeleteSponsor}
                            onEdit={startEditSponsor}
                            onToggleStatus={handleToggleSponsorStatus}
                        />
                    )}

                    {/* --- SETTINGS TAB --- */}
                    {activeTab === 'settings' && (
                        <SettingsManager
                            clubSettings={clubSettings}
                            setClubSettings={setClubSettings}
                            onSaveSettings={handleSaveSettings}
                            onUpdatePassword={handleUpdatePassword}
                            userEmail={user?.email}
                        />
                    )}

                    {/* --- Registrations Modal --- */}
                    <RegistrationViewer
                        viewingRegistrations={viewingRegistrations}
                        setViewingRegistrations={setViewingRegistrations}
                        onExport={exportToCSV}
                        onExportPDF={exportToPDF}
                    />
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
