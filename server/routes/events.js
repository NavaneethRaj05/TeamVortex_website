const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const PaymentLog = require('../models/PaymentLog');
const { sendNotification, sendEmail, sendToAllMembers, sendToAllMembersSafe } = require('../utils/notificationService');

// @route   GET /api/events/main-only
// @desc    Get only main events (no parentEventId) for EventForm parent dropdown
router.get('/main-only', async (req, res) => {
    try {
        const events = await Event.find({ parentEventId: null })
            .select('title date')
            .sort({ date: -1 })
            .lean();
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/events/lightweight
// @desc    Get lightweight events data for fast loading (minimal fields)
router.get('/lightweight', async (req, res) => {
    try {
        // No long-term caching — events must appear immediately after creation
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        
        const events = await Event.aggregate([
            { $sort: { priority: -1, date: 1 } }, // Sort by priority (descending) then date (ascending)
            {
                $project: {
                    title: 1,
                    description: 1,
                    date: 1,
                    location: 1,
                    startTime: 1,
                    endTime: 1,
                    eventType: 1,
                    category: 1,
                    price: 1,
                    capacity: 1,
                    registrationType: 1,
                    minTeamSize: 1,
                    maxTeamSize: 1,
                    feeType: 1,
                    status: 1,
                    priority: 1,
                    parentEventId: 1,
                    isMainEventContainer: 1,
                    images: { $slice: ["$images", 1] }, // Only first image
                    galleryDriveLink: 1,
                    subEvents: {
                        $map: {
                            input: { $slice: ["$subEvents", 4] }, // Only first 4 sub-events
                            as: "subEvent",
                            in: {
                                title: "$$subEvent.title",
                                icon: "$$subEvent.icon",
                                color: "$$subEvent.color",
                                duration: "$$subEvent.duration",
                                participants: "$$subEvent.participants"
                            }
                        }
                    },
                    registrationCount: {
                        $size: {
                            $filter: {
                                input: { $ifNull: ["$registrations", []] },
                                as: "reg",
                                cond: {
                                    $or: [
                                        { $eq: ["$$reg.paymentStatus", "verified"] },
                                        { $eq: ["$$reg.registrationStatus", "confirmed"] }
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        ]).allowDiskUse(true);

        res.json(events);
    } catch (err) {
        console.error('Lightweight events fetch error:', err);
        res.status(500).json({ message: 'Failed to fetch events', error: err.message });
    }
});

// @route   GET /api/events
// @desc    Get all events (Optimized for performance with caching)
router.get('/', async (req, res) => {
    try {
        // No long-term caching — events must appear immediately after creation
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        
        // Exclude registrations, waitlist and feedback from list view to reduce payload size
        const events = await Event.aggregate([
            { $sort: { priority: -1, date: 1 } }, // Sort by priority (descending) then date (ascending)
            {
                $project: {
                    title: 1,
                    description: 1,
                    date: 1,
                    location: 1,
                    startTime: 1,
                    endTime: 1,
                    eventType: 1,
                    category: 1,
                    price: 1,
                    teamPricing: 1,
                    earlyBirdDiscount: 1,
                    capacity: 1,
                    registrationType: 1,
                    minTeamSize: 1,
                    maxTeamSize: 1,
                    registrationOpens: 1,
                    registrationCloses: 1,
                    autoCloseOnCapacity: 1,
                    enableWaitlist: 1,
                    eligibility: 1,
                    allowedCollege: 1,
                    organizer: 1,
                    rules: 1,
                    rulebookUrl: 1,
                    tags: 1,
                    paymentGateway: 1,
                    upiId: 1,
                    upiQrCode: 1,
                    paymentReceiverName: 1,
                    paymentContactNumber: 1,
                    feeType: 1,
                    offlineInstructions: 1,
                    enableOfflinePayment: 1,
                    offlineMethods: 1,
                    bankDetails: 1,
                    cashDetails: 1,
                    gstEnabled: 1,
                    gstPercent: 1,
                    gstNumber: 1,
                    coupons: 1,
                    isMultiRound: 1,
                    rounds: 1,
                    judgingCriteria: 1,
                    prizes: 1,
                    participationCertificate: 1,
                    winnerCertificate: 1,
                    socialLinks: 1,
                    sponsors: 1,
                    faqs: 1,
                    enableQrCheckin: 1,
                    certificateTemplate: 1,
                    status: 1,
                    images: { $slice: ["$images", 3] }, // Limit images to first 3 for performance
                    galleryDriveLink: 1,
                    subEvents: 1,
                    priority: 1,
                    parentEventId: 1,
                    isMainEventContainer: 1,
                    documentUrl: 1,
                    documentName: 1,
                    endDate: 1,
                    registrationCount: {
                        $size: {
                            $filter: {
                                input: { $ifNull: ["$registrations", []] },
                                as: "reg",
                                cond: {
                                    $or: [
                                        { $eq: ["$$reg.paymentStatus", "verified"] },
                                        { $eq: ["$$reg.registrationStatus", "confirmed"] }
                                    ]
                                }
                            }
                        }
                    },
                    waitlistCount: { $size: { $ifNull: ["$waitlist", []] } },
                    feedbackCount: { $size: { $ifNull: ["$feedback", []] } }
                }
            }
        ]).allowDiskUse(true); // Allow disk use for large datasets
        
        res.json(events);
    } catch (err) {
        console.error('Events fetch error:', err);
        res.status(500).json({ message: 'Failed to fetch events', error: err.message });
    }
});

// @route   GET /api/events/stats
// @desc    Get aggregate stats for dashboard (Optimized) - Only upcoming events
router.get('/stats', async (req, res) => {
    try {
        const now = new Date();
        
        // Fetch only upcoming events (not completed or past)
        const events = await Event.find({
            $or: [
                { status: { $in: ['published', 'active'] } },
                { status: { $exists: false } }
            ],
            status: { $ne: 'completed' }
        })
            .select('title registrations waitlist feedback date endTime status')
            .lean();

        // Further filter to exclude past events based on date
        const upcomingEvents = events.filter(e => {
            try {
                const eventDate = new Date(e.date);
                const eventEnd = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 23, 59, 59);
                
                if (e.endTime) {
                    const [h, m] = e.endTime.split(':');
                    eventEnd.setHours(parseInt(h), parseInt(m), 0);
                }
                
                return now <= eventEnd;
            } catch (err) {
                return false;
            }
        });

        const stats = upcomingEvents.map(e => ({
            _id: e._id,
            title: e.title,
            registrations: e.registrations?.filter(r => r.paymentStatus !== 'rejected').length || 0,
            waitlist: e.waitlist?.length || 0,
            feedbackCount: e.feedback?.length || 0,
            avgRating: e.feedback?.length > 0 ? e.feedback.reduce((acc, f) => acc + f.rating, 0) / e.feedback.length : 0
        }));
        
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/events/:id
// @desc    Get single event with full details
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).lean();
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/events
// @desc    Create a new event
router.post('/', async (req, res) => {
    try {
        const body = { ...req.body };

        // Sanitize: free events should not have paymentGateway
        if (!body.price || Number(body.price) === 0) {
            body.paymentGateway = '';
            body.upiId = '';
            body.upiQrCode = '';
            body.offlineInstructions = '';
            body.paymentReceiverName = '';
            body.paymentContactNumber = '';
        }

        // Sanitize: ensure numeric fields are numbers
        body.price = Number(body.price) || 0;
        body.capacity = Number(body.capacity) || 0;
        body.waitlistCapacity = Number(body.waitlistCapacity) || 0;
        body.gstPercent = Number(body.gstPercent) || 18;

        // Sanitize: ensure arrays are arrays
        if (!Array.isArray(body.images)) body.images = [];
        if (!Array.isArray(body.tags)) body.tags = [];
        if (!Array.isArray(body.offlineMethods)) body.offlineMethods = [];

        // Sanitize: remove undefined/null strings that could fail enum validation
        const enumFields = ['eventType', 'category', 'registrationType', 'status', 'paymentGateway', 'feeType'];
        enumFields.forEach(field => {
            if (body[field] === null || body[field] === undefined) {
                delete body[field]; // Let schema default kick in
            }
        });

        const event = new Event(body);
        const newEvent = await event.save();
        res.status(201).json(newEvent);
    } catch (err) {
        console.error('Event creation error:', err.message);
        res.status(400).json({
            message: err.message,
            details: err.errors ? Object.keys(err.errors).map(key => ({
                field: key,
                message: err.errors[key].message
            })) : []
        });
    }
});

// @route   POST /api/events/:id/register-multiple
// @desc    Register for multiple sub-events (Fast — atomic push, async email)
router.post('/:id/register-multiple', async (req, res) => {
    const { selectedSubEvents, teamName, country, institutionName, department, yearOfStudy, members } = req.body;

    if (!selectedSubEvents || !Array.isArray(selectedSubEvents) || selectedSubEvents.length === 0) {
        return res.status(400).json({ message: 'At least one sub-event must be selected' });
    }
    if (!members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ message: 'At least one participant is required' });
    }
    const primaryMember = members[0];
    if (!primaryMember.name || !primaryMember.email) {
        return res.status(400).json({ message: 'Primary member name and email are required' });
    }

    try {
        // Only load what we need — skip feedback, waitlist full arrays
        const event = await Event.findById(req.params.id)
            .select('title date startTime endTime location price subEvents registrations')
            .lean();
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (!event.subEvents?.length) return res.status(400).json({ message: 'This event does not have sub-events' });

        const allEmails = members.map(m => m.email.toLowerCase());
        const allIds = members.map(m => m.idNumber).filter(Boolean);
        const alreadyIn = event.registrations.some(reg =>
            reg.members.some(m => allEmails.includes(m.email?.toLowerCase()) || (m.idNumber && allIds.includes(m.idNumber)))
        );
        if (alreadyIn) return res.status(400).json({ message: 'One or more members are already registered for this event' });

        const multiEventGroupId = `multi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const subtotal = selectedSubEvents.reduce((sum, id) => {
            const sub = event.subEvents.find(se => se.id === id || se.title === id);
            return sum + (sub?.price || 0);
        }, 0);
        const eventCount = selectedSubEvents.length;
        const multiEventDiscount = eventCount >= 4 ? subtotal * 0.25 : eventCount >= 3 ? subtotal * 0.20 : eventCount >= 2 ? subtotal * 0.10 : 0;
        const totalAmount = Math.max(0, subtotal - multiEventDiscount);

        const registration = {
            teamName: teamName || '',
            country: country || 'India',
            institutionName: institutionName || '',
            department: department || '',
            yearOfStudy: yearOfStudy || '',
            members,
            paid: totalAmount === 0,
            paymentId: '',
            paymentStatus: totalAmount > 0 ? 'pending' : 'verified',
            registeredAt: new Date(),
            multiEventGroupId,
            selectedSubEvents,
            pricing: { subtotal, multiEventDiscount, couponDiscount: 0, total: totalAmount }
        };

        // Atomic push — no full document reload
        await Event.updateOne({ _id: event._id }, { $push: { registrations: registration } });

        // Respond immediately
        res.json({
            message: 'Multi-event registration successful!',
            multiEventGroupId,
            selectedSubEvents,
            pricing: registration.pricing,
            status: 'success',
            emailSent: false
        });

        // Fire email after response — zero impact on response time
        setImmediate(() => {
            const subEventTitles = selectedSubEvents.map(id => {
                const sub = event.subEvents.find(se => se.id === id || se.title === id);
                return sub?.title || id;
            });
            sendToAllMembersSafe(members, 'registrationConfirmation', {
                name: primaryMember.name,
                eventTitle: event.title,
                teamName,
                date: event.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '',
                time: `${event.startTime || ''}${event.endTime ? ` - ${event.endTime}` : ''}`,
                location: event.location || '',
                amount: totalAmount,
                savings: multiEventDiscount,
                paymentPending: totalAmount > 0,
                isMultiEvent: true,
                selectedEvents: subEventTitles
            }).then(r => console.log(`📧 Multi-reg emails: ${r.sent} sent, ${r.failed} failed`))
              .catch(e => console.error('Email error:', e));
        });

    } catch (err) {
        console.error('Multi-Event Registration Error:', err);
        res.status(500).json({ message: 'Server error during multi-event registration' });
    }
});

// @route   POST /api/events/:id/register
// @desc    Register a student/team for an event (Fast — minimal DB load, async email)
router.post('/:id/register', async (req, res) => {
    const { teamName, country, members, paid, paymentId } = req.body;

    if (!members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ message: 'At least one participant is required' });
    }

    const primaryMember = members[0];
    if (!primaryMember.name || !primaryMember.email) {
        return res.status(400).json({ message: 'Primary member name and email are required' });
    }

    try {
        // Load only the fields needed for validation — skip registrations/waitlist arrays
        const event = await Event.findById(req.params.id)
            .select('title date startTime endTime location price capacity registrationType status registrations waitlist')
            .lean();
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Duplicate check
        const allEmails = members.map(m => m.email.toLowerCase());
        const allIds = members.map(m => m.idNumber).filter(Boolean);

        const alreadyIn = (list) => list.some(reg =>
            reg.members.some(m =>
                allEmails.includes(m.email?.toLowerCase()) ||
                (m.idNumber && allIds.includes(m.idNumber))
            )
        );

        if (alreadyIn(event.registrations) || alreadyIn(event.waitlist)) {
            return res.status(400).json({ message: 'One or more members are already registered for this event' });
        }

        const paymentExpiresAt = event.price > 0 ? new Date(Date.now() + 30 * 60 * 1000) : null;

        const registration = {
            teamName: teamName || '',
            country: country || 'India',
            members,
            paid: event.price === 0 || !!paid,
            paymentId: paymentId || '',
            paymentStatus: event.price > 0 ? 'pending' : 'verified',
            registeredAt: new Date(),
            paymentExpiresAt
        };

        // Capacity check using count query — no need to load all registrations
        let status = 'success';
        if (event.capacity > 0) {
            const activeCount = event.registrations.filter(r =>
                r.paymentStatus !== 'rejected' &&
                !(r.paymentStatus === 'pending' && r.paymentExpiresAt && new Date(r.paymentExpiresAt) < new Date())
            ).length;

            if (activeCount >= event.capacity) {
                // Use atomic $push to waitlist — no full document reload needed
                await Event.updateOne({ _id: event._id }, { $push: { waitlist: registration } });
                status = 'waitlist';
                // Fire email in background — don't block response
                setImmediate(() => {
                    sendToAllMembersSafe(members, 'registrationConfirmation', {
                        name: primaryMember.name,
                        eventTitle: event.title,
                        teamName,
                        date: event.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '',
                        time: `${event.startTime || ''}${event.endTime ? ` - ${event.endTime}` : ''}`,
                        location: event.location || '',
                        amount: event.price,
                        paymentPending: false,
                        isMultiEvent: false,
                        selectedEvents: []
                    }).catch(e => console.error('Email error:', e));
                });
                return res.json({ message: 'Event is full. Your team has been placed on the priority waitlist.', status });
            }
        }

        // Atomic $push — much faster than load-modify-save on large documents
        await Event.updateOne({ _id: event._id }, { $push: { registrations: registration } });

        // Respond immediately — don't wait for email
        res.json({
            message: paid ? 'Payment verified and registration confirmed!' : 'Registration successful!',
            status,
            emailSent: false // email fires in background
        });

        // Fire email after response is sent — zero impact on response time
        setImmediate(() => {
            sendToAllMembersSafe(members, 'registrationConfirmation', {
                name: primaryMember.name,
                eventTitle: event.title,
                teamName,
                date: event.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '',
                time: `${event.startTime || ''}${event.endTime ? ` - ${event.endTime}` : ''}`,
                location: event.location || '',
                amount: event.price,
                paymentPending: event.price > 0 && !paid,
                isMultiEvent: false,
                selectedEvents: []
            }).then(r => console.log(`📧 Reg emails: ${r.sent} sent, ${r.failed} failed`))
              .catch(e => console.error('Email error:', e));
        });

    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// @route   POST /api/events/:id/feedback
// @desc    Submit feedback for an event
router.post('/:id/feedback', async (req, res) => {
    const { studentId, name, rating, comment } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.feedback.push({ studentId, name, rating, comment });
        await event.save();
        res.json({ message: 'Feedback submitted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event (with orphan handling for sub-events)
router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Handle orphaned sub-events
        const orphanAction = req.query.orphanAction; // 'cascade' or 'convert'
        const childEvents = await Event.find({ parentEventId: req.params.id });

        if (childEvents.length > 0) {
            if (orphanAction === 'cascade') {
                // Delete all sub-events too
                await Event.deleteMany({ parentEventId: req.params.id });
            } else {
                // Convert sub-events to main events (remove parentEventId)
                await Event.updateMany({ parentEventId: req.params.id }, { $set: { parentEventId: null } });
            }
        }

        await event.deleteOne();
        res.json({ message: 'Event removed', eventId: req.params.id, childrenHandled: childEvents.length });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({ message: err.message || 'Failed to delete event' });
    }
});

// @route   PUT /api/events/:id
// @desc    Update an event
router.put('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const body = { ...req.body };

        // Same sanitization as POST
        if (!body.price || Number(body.price) === 0) {
            body.paymentGateway = '';
        }
        body.price = Number(body.price) || 0;
        body.capacity = Number(body.capacity) || 0;
        body.waitlistCapacity = Number(body.waitlistCapacity) || 0;

        // Don't overwrite registrations/waitlist from form data
        delete body.registrations;
        delete body.waitlist;
        delete body._id;
        delete body.__v;

        Object.assign(event, body);
        await event.save();
        res.json(event);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/events/:id/cancel
// @desc    Cancel a registration and promote next in waitlist
router.post('/:id/cancel', async (req, res) => {
    const { email } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Remove from registrations (check primary member email)
        const regIndex = event.registrations.findIndex(r => r.members[0].email === email);
        if (regIndex === -1) return res.status(400).json({ message: 'Registration not found' });

        const cancelledUser = event.registrations.splice(regIndex, 1)[0];

        // Promote from waitlist if any
        let promotedUser = null;
        if (event.waitlist.length > 0) {
            promotedUser = event.waitlist.shift();
            event.registrations.push(promotedUser);

            // Send promotion email to all members of the promoted team
            await sendToAllMembers(promotedUser.members, 'waitlistPromotion', {
                name: promotedUser.members[0].name,
                eventTitle: event.title,
                teamName: promotedUser.teamName
            });
        }

        await event.save();
        res.json({ message: 'Registration cancelled', event });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/events/:id/remind
// @desc    Send 24h reminders to all registered users
router.post('/:id/remind', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const count = event.registrations.length;
        for (const reg of event.registrations) {
            await sendToAllMembers(reg.members, 'eventReminder24h', {
                name: reg.members[0].name,
                eventTitle: event.title,
                date: new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                time: `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`,
                location: event.location,
                teamName: reg.teamName,
                isMultiEvent: false,
                selectedEvents: [],
                requirements: event.eligibility?.requiredDocs || []
            });
        }

        res.json({ message: `Reminders sent to ${count} participants.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// @route   GET /api/events/:id/payment-info
// @desc    Get payment information for an event (QR code, UPI ID, bank details)
router.get('/:id/payment-info', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .select('title price paymentGateway upiId upiQrCode paymentReceiverName offlineInstructions offlineMethods bankDetails cashDetails gstEnabled gstPercent')
            .lean();
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/events/:id/submit-payment-proof
// @desc    Submit payment proof (screenshot + UTR) for a registration
router.post('/:id/submit-payment-proof', async (req, res) => {
    const { email, screenshotData, utrNumber, transactionDate, amountPaid, paidFrom, userNotes } = req.body;

    if (!email || !screenshotData || !utrNumber) {
        return res.status(400).json({ message: 'Email, screenshot, and UTR number are required' });
    }

    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Find registration by primary member email
        const regIndex = event.registrations.findIndex(r =>
            r.members[0]?.email?.toLowerCase() === email.toLowerCase()
        );

        if (regIndex === -1) {
            return res.status(404).json({ message: 'Registration not found for this email' });
        }

        const registration = event.registrations[regIndex];

        // Check if payment is already verified
        if (registration.paymentStatus === 'verified') {
            return res.status(400).json({ message: 'Payment already verified. No further action needed.' });
        }

        // Check if payment proof is already submitted and pending verification
        if (registration.paymentStatus === 'submitted') {
            return res.status(400).json({ message: 'Payment proof already submitted. Please wait for admin verification.' });
        }

        // Check for duplicate UTR number across all registrations in this event
        const duplicateUTR = event.registrations.some((reg, idx) => 
            idx !== regIndex && 
            reg.paymentProof?.utrNumber === utrNumber &&
            reg.paymentStatus !== 'rejected'
        );

        if (duplicateUTR) {
            return res.status(400).json({ message: 'This UTR number has already been used for another registration. Please check your transaction details.' });
        }

        // Update payment proof
        registration.paymentStatus = 'submitted';
        registration.paymentProof = {
            screenshotData,
            utrNumber,
            transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
            amountPaid: amountPaid || event.price,
            paidFrom: paidFrom || '',
            submittedAt: new Date(),
            userNotes: userNotes || ''
        };

        await event.save();

        // Send confirmation email to user
        try {
            await sendNotification(
                ['email'],
                { email },
                'paymentProofReceived',
                {
                    name: registration.members[0].name,
                    eventTitle: event.title,
                    utrNumber,
                    amount: amountPaid || event.price
                }
            );
        } catch (mailErr) {
            console.error('Mail Error:', mailErr);
        }

        // Send notification to admin — use organizer email or fallback to club email
        try {
            const adminEmail = event.organizer?.email || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
            if (adminEmail) {
                await sendNotification(
                    ['email'],
                    { email: adminEmail },
                    'paymentProofAlert',
                    {
                        eventTitle: event.title,
                        participantName: registration.members[0].name,
                        participantEmail: email,
                        utrNumber,
                        amount: amountPaid || event.price
                    }
                );
            }
        } catch (mailErr) {
            console.error('Admin Mail Error:', mailErr);
        }

        // Create Payment Log
        await PaymentLog.create({
            eventId: event._id,
            registrationIndex: regIndex,
            teamName: registration.teamName,
            leadEmail: registration.members[0].email,
            action: 'submitted',
            previousStatus: registration.paymentStatus,
            newStatus: 'submitted',
            amount: amountPaid || event.price,
            utrNumber: utrNumber,
            ipAddress: req.ip
        });

        res.json({
            message: 'Payment proof submitted successfully. Pending verification.',
            status: 'submitted',
            registrationIndex: regIndex
        });
    } catch (err) {
        console.error('Payment Proof Submission Error:', err);
        res.status(500).json({ message: 'Server error while submitting payment proof' });
    }
});

// @route   POST /api/events/:id/verify-payment/:regIndex
// @desc    Admin: Verify or reject a payment
router.post('/:id/verify-payment/:regIndex', async (req, res) => {
    const { action, rejectionReason, verifiedBy } = req.body;

    if (!action || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: 'Action must be either "approve" or "reject"' });
    }

    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const regIndex = parseInt(req.params.regIndex);
        if (isNaN(regIndex) || regIndex < 0 || regIndex >= event.registrations.length) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        const registration = event.registrations[regIndex];

        if (registration.paymentStatus === 'verified') {
            return res.status(400).json({ message: 'Payment already verified' });
        }

        const primaryMember = registration.members[0];
        const prevStatus = registration.paymentStatus;

        if (action === 'approve') {
            registration.paymentStatus = 'verified';
            registration.paid = true;
            registration.registrationStatus = 'confirmed';
            registration.verifiedAt = new Date();
            registration.verifiedBy = verifiedBy || 'admin';

            // Create Payment Log (non-blocking — don't let log failure crash verification)
            PaymentLog.create({
                eventId: event._id,
                registrationIndex: regIndex,
                teamName: registration.teamName,
                leadEmail: primaryMember?.email || 'unknown',
                action: 'verified',
                previousStatus: prevStatus,
                newStatus: 'verified',
                amount: registration.paymentProof?.amountPaid || event.price,
                utrNumber: registration.paymentProof?.utrNumber,
                performedBy: verifiedBy || 'admin',
                ipAddress: req.ip
            }).catch(e => console.error('PaymentLog create error:', e));

            // Send approval notification in background — don't block response
            sendToAllMembersSafe(registration.members, 'paymentApproved', {
                name: primaryMember?.name,
                eventTitle: event.title,
                amount: registration.paymentProof?.amountPaid || event.price,
                utrNumber: registration.paymentProof?.utrNumber,
                date: event.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '',
                time: event.startTime ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}` : '',
                location: event.location
            }).catch(e => console.error('Approval email error:', e));
        } else {
            registration.paymentStatus = 'rejected';
            registration.rejectionReason = rejectionReason || 'Payment verification failed';

            // Create Payment Log (non-blocking)
            PaymentLog.create({
                eventId: event._id,
                registrationIndex: regIndex,
                teamName: registration.teamName,
                leadEmail: primaryMember?.email || 'unknown',
                action: 'rejected',
                previousStatus: prevStatus,
                newStatus: 'rejected',
                rejectionReason: registration.rejectionReason,
                performedBy: verifiedBy || 'admin',
                ipAddress: req.ip
            }).catch(e => console.error('PaymentLog create error:', e));

            // Send rejection notification in background — don't block response
            sendToAllMembersSafe(registration.members, 'paymentRejected', {
                name: primaryMember?.name || 'Participant',
                eventTitle: event.title,
                reason: rejectionReason || 'Payment verification failed'
            }).catch(e => console.error('Rejection email error:', e));
        }

        // Use $set on the specific registration to bypass full-document validation
        const updatePath = `registrations.${regIndex}`;
        await Event.updateOne(
            { _id: event._id },
            { $set: { [updatePath]: registration.toObject() } }
        );

        res.json({
            message: action === 'approve' ? 'Payment verified successfully' : 'Payment rejected',
            status: registration.paymentStatus
        });

    } catch (err) {
        console.error('Payment Verification Error:', err.message, err.errors ? JSON.stringify(err.errors) : '');
        res.status(500).json({ message: err.message || 'Server error during payment verification' });
    }
});

// @route   GET /api/events/:id/pending-payments
// @desc    Get all registrations with pending payment verification
router.get('/:id/pending-payments', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).lean();
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const pendingPayments = event.registrations
            .map((reg, index) => ({ ...reg, registrationIndex: index }))
            .filter(reg => reg.paymentStatus === 'submitted'); // Only show submitted proof — pending are auto-deleted

        res.json({
            eventTitle: event.title,
            eventId: event._id,
            totalRegistrations: event.registrations.length,
            submittedCount: pendingPayments.length,
            pendingPayments
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/events/cleanup-pending
// @desc    Delete all expired pending registrations across all events (no payment proof submitted)
router.post('/cleanup-pending', async (req, res) => {
    try {
        const now = new Date();
        const events = await Event.find({ 'registrations.paymentStatus': 'pending' });
        let totalRemoved = 0;

        for (const event of events) {
            const before = event.registrations.length;
            event.registrations = event.registrations.filter(reg => {
                if (reg.paymentStatus !== 'pending') return true;
                // Remove if expired OR if no expiry set (legacy pending with no proof)
                if (!reg.paymentExpiresAt) return false; // legacy — no expiry = delete
                return new Date(reg.paymentExpiresAt) > now; // keep if not yet expired
            });
            const removed = before - event.registrations.length;
            if (removed > 0) {
                totalRemoved += removed;
                await event.save();
            }
        }

        res.json({ message: `Cleaned up ${totalRemoved} expired pending registration(s)`, removed: totalRemoved });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   GET /api/events/:id/payment-logs
// @desc    Get transaction audit logs for an event
router.get('/:id/payment-logs', async (req, res) => {
    try {
        const logs = await PaymentLog.find({ eventId: req.params.id })
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
