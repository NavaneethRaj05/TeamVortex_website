import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users, Calendar, Activity, Plus, Edit2, Trash2, Mail, MapPin, CreditCard, FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API_BASE_URL from '../apiConfig';
import EventForm from '../components/dashboard/EventForm';
import StatsCard from '../components/dashboard/StatsCard';
import TeamManager from '../components/dashboard/TeamManager';
import SponsorManager from '../components/dashboard/SponsorManager';
import SettingsManager from '../components/dashboard/SettingsManager';
import AnalyticsDashboard from '../components/dashboard/AnalyticsDashboard';
import RegistrationViewer from '../components/dashboard/RegistrationViewer';
import PaymentVerificationPanel from '../components/dashboard/PaymentVerificationPanel';
import PastEventsManager from '../components/dashboard/PastEventsManager';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [activeTab, setActiveTab] = useState('contests'); // contests | events | team | settings | sponsors

    // Data States
    const [events, setEvents] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [clubSettings, setClubSettings] = useState({});
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
    const fetchSettings = async () => { try { const res = await fetch(`${API_BASE_URL}/api/settings`); setClubSettings(await res.json()); } catch (err) { console.error(err); } };
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
        if (!event.registrations || event.registrations.length === 0) { alert('No registrations to export'); return; }
        const doc = new jsPDF();
        doc.setFontSize(20); doc.setTextColor(33, 150, 243); doc.text('TEAM VORTEX - REGISTRATION REPORT', 14, 22);
        doc.setFontSize(12); doc.setTextColor(100);
        doc.text(`Event: ${event.title}`, 14, 32); doc.text(`Date: ${new Date(event.date).toLocaleDateString()}`, 14, 38);
        doc.text(`Total Registrations: ${event.registrations.length}`, 14, 44); doc.text(`Exported On: ${new Date().toLocaleString()}`, 14, 50);

        const tableColumn = ["Team/Lead", "Email", "Phone", "Participants", "Payment"];
        const tableRows = [];
        event.registrations.forEach(r => {
            tableRows.push([
                r.teamName || r.members[0]?.name || 'N/A', r.members[0]?.email || 'N/A', r.members[0]?.phone || 'N/A', r.members?.length || 0, r.paid ? 'PAID' : (r.paymentStatus || 'PENDING')
            ]);
        });

        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 60, theme: 'grid', headStyles: { fillColor: [33, 150, 243], textColor: 255 }, alternateRowStyles: { fillColor: [245, 245, 245] }, margin: { top: 60 } });
        doc.save(`${event.title.replace(/\s+/g, '_')}_Registrations.pdf`);
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
        { id: 'contests', label: 'Contests', icon: Calendar },
        { id: 'events', label: 'Events', icon: Activity },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'analytics', label: 'Analytics', icon: Activity },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'sponsors', label: 'Sponsors', icon: Users },
        { id: 'settings', label: 'Settings', icon: FileText }
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
        <div className="min-h-screen pt-24 pb-12 px-4 bg-dark-bg">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header & Tabs */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-display font-bold gradient-text mb-2">Admin Dashboard</h1>
                        <p className="text-white/60">Manage Events, Team, Club, and Content</p>
                    </div>
                    <div className="flex bg-white/5 p-1 rounded-xl overflow-x-auto scrollbar-hide max-w-full">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`px-4 sm:px-6 py-2 rounded-lg font-medium capitalize transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === item.id ? 'bg-vortex-blue text-black shadow-lg' : 'text-white/70 hover:text-white'}`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- CONTESTS TAB (Formerly Events) --- */}
                {activeTab === 'contests' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatsCard icon={Users} label="Total Members" value={teamMembers.length} color="text-vortex-blue" />
                            <StatsCard icon={Calendar} label="Active Contests" value={upcomingContests.length} color="text-vortex-orange" />
                            <StatsCard icon={Activity} label="Registrations" value={upcomingContests.reduce((acc, e) => acc + (e.registrationCount || 0), 0)} color="text-green-400" />
                        </div>

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

                {/* --- EVENTS TAB (Formerly Past Events) --- */}
                {activeTab === 'events' && <PastEventsManager />}

                {/* --- PAYMENTS TAB --- */}
                {activeTab === 'payments' && <PaymentVerificationPanel />}

                {/* --- ANALYTICS TAB --- */}
                {activeTab === 'analytics' && <AnalyticsDashboard eventStats={eventStats} />}

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
        </div >
    );
};

export default Dashboard;
