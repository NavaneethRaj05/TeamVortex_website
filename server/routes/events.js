const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const PaymentLog = require('../models/PaymentLog');
const { sendNotification } = require('../utils/notificationService');

// @route   GET /api/events/lightweight
// @desc    Get lightweight events data for fast loading (minimal fields)
router.get('/lightweight', async (req, res) => {
    try {
        // Set aggressive cache headers for lightweight data
        res.set('Cache-Control', 'public, max-age=600'); // Cache for 10 minutes
        
        const events = await Event.aggregate([
            { $sort: { priority: -1, date: 1 } }, // Sort by priority (descending) then date (ascending)
            {
                $project: {
                    title: 1,
                    date: 1,
                    location: 1,
                    startTime: 1,
                    endTime: 1,
                    eventType: 1,
                    category: 1,
                    price: 1,
                    capacity: 1,
                    registrationType: 1,
                    status: 1,
                    images: { $slice: ["$images", 1] }, // Only first image
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
                    registrationCount: { $size: { $ifNull: ["$registrations", []] } }
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
        // Set cache headers for better performance
        res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
        
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
                    registrationCount: { $size: { $ifNull: ["$registrations", []] } },
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
            registrations: e.registrations?.length || 0,
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
        console.log('Creating event with data:', JSON.stringify(req.body, null, 2));
        const event = new Event(req.body);
        const newEvent = await event.save();
        console.log('Event created successfully:', newEvent._id);
        res.status(201).json(newEvent);
    } catch (err) {
        console.error('Event creation error:', err);
        console.error('Request body:', JSON.stringify(req.body, null, 2));
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
// @desc    Register for multiple sub-events in a single transaction
router.post('/:id/register-multiple', async (req, res) => {
    const { selectedSubEvents, teamName, country, institutionName, department, yearOfStudy, members, pricing, couponCode, appliedCoupon } = req.body;

    if (!selectedSubEvents || !Array.isArray(selectedSubEvents) || selectedSubEvents.length === 0) {
        return res.status(400).json({ message: 'At least one sub-event must be selected' });
    }

    if (!members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ message: 'At least one participant is required' });
    }

    // Basic validation for the first member
    const primaryMember = members[0];
    if (!primaryMember.name || !primaryMember.email) {
        return res.status(400).json({ message: 'Primary member name and email are required' });
    }

    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (!event.subEvents || event.subEvents.length === 0) {
            return res.status(400).json({ message: 'This event does not have sub-events' });
        }

        // Generate a unique group ID for this multi-event registration
        const multiEventGroupId = `multi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Check if any member is already registered
        const allEmails = members.map(m => m.email.toLowerCase());
        const allIds = members.map(m => m.idNumber).filter(id => id);

        const isRegistered = event.registrations.some(reg =>
            reg.members.some(m => allEmails.includes(m.email.toLowerCase()) || (m.idNumber && allIds.includes(m.idNumber)))
        );

        if (isRegistered) {
            return res.status(400).json({ message: 'One or more members are already registered for this event' });
        }

        // Calculate total price (server-side validation)
        const subtotal = selectedSubEvents.reduce((sum, subEventId) => {
            const subEvent = event.subEvents.find(se => se.id === subEventId || se.title === subEventId);
            return sum + (subEvent?.price || 0);
        }, 0);

        let multiEventDiscount = 0;
        const eventCount = selectedSubEvents.length;
        
        if (eventCount >= 4) {
            multiEventDiscount = subtotal * 0.25;
        } else if (eventCount >= 3) {
            multiEventDiscount = subtotal * 0.20;
        } else if (eventCount >= 2) {
            multiEventDiscount = subtotal * 0.10;
        }

        const totalAmount = Math.max(0, subtotal - multiEventDiscount);

        // Create registration object
        const registration = {
            teamName: teamName || '',
            country: country || 'India',
            institutionName: institutionName || '',
            department: department || '',
            yearOfStudy: yearOfStudy || '',
            members,
            paid: totalAmount === 0, // Free if total is 0
            paymentId: '',
            paymentStatus: totalAmount > 0 ? 'pending' : 'verified',
            registeredAt: new Date(),
            multiEventGroupId: multiEventGroupId,
            selectedSubEvents: selectedSubEvents,
            pricing: {
                subtotal: subtotal,
                multiEventDiscount: multiEventDiscount,
                couponDiscount: 0,
                total: totalAmount
            }
        };

        // Add to registrations
        event.registrations.push(registration);
        await event.save();

        // Send confirmation via email and WhatsApp
        try {
            const subEventTitles = selectedSubEvents.map(subEventId => {
                const subEvent = event.subEvents.find(se => se.id === subEventId || se.title === subEventId);
                return subEvent?.title || subEventId;
            });

            const notificationData = {
                name: primaryMember.name,
                eventTitle: event.title,
                teamName: teamName,
                date: new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }),
                time: `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`,
                location: event.location,
                amount: totalAmount,
                savings: multiEventDiscount,
                paymentPending: totalAmount > 0,
                isMultiEvent: true,
                selectedEvents: subEventTitles
            };

            await sendNotification(
                ['email'],
                { email: primaryMember.email },
                'registrationConfirmation',
                notificationData
            );
        } catch (notifErr) {
            console.error('Notification Error:', notifErr);
        }

        res.json({
            message: 'Multi-event registration successful!',
            multiEventGroupId: multiEventGroupId,
            selectedSubEvents: selectedSubEvents,
            pricing: registration.pricing,
            status: 'success'
        });
    } catch (err) {
        console.error('Multi-Event Registration Error:', err);
        res.status(500).json({ message: 'Server error during multi-event registration' });
    }
});

// @route   POST /api/events/:id/register
// @desc    Register a student/team for an event (Atomic & Robust)
router.post('/:id/register', async (req, res) => {
    const { teamName, country, members, paid, paymentId } = req.body;

    if (!members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ message: 'At least one participant is required' });
    }

    // Basic validation for the first member
    const primaryMember = members[0];
    if (!primaryMember.name || !primaryMember.email) {
        return res.status(400).json({ message: 'Primary member name and email are required' });
    }

    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check if any member is already registered or in waitlist
        const allEmails = members.map(m => m.email.toLowerCase());
        const allIds = members.map(m => m.idNumber).filter(id => id);

        const isRegistered = event.registrations.some(reg =>
            reg.members.some(m => allEmails.includes(m.email.toLowerCase()) || (m.idNumber && allIds.includes(m.idNumber)))
        );
        const inWaitlist = event.waitlist.some(reg =>
            reg.members.some(m => allEmails.includes(m.email.toLowerCase()) || (m.idNumber && allIds.includes(m.idNumber)))
        );

        if (isRegistered || inWaitlist) {
            return res.status(400).json({ message: 'One or more members are already registered for this event' });
        }

        const registration = {
            teamName: teamName || '',
            country: country || 'India',
            members,
            paid: event.price === 0 || !!paid, // Free events are auto-paid
            paymentId: paymentId || '',
            paymentStatus: event.price > 0 ? 'pending' : 'verified', // Pending for paid events
            registeredAt: new Date()
        };

        // Check capacity
        if (event.capacity > 0 && event.registrations.length >= event.capacity) {
            event.waitlist.push(registration);
            await event.save();
            return res.json({
                message: 'Event is full. Your team has been placed on the priority waitlist.',
                event,
                status: 'waitlist'
            });
        }

        event.registrations.push(registration);
        await event.save();

        // Send confirmation via email and WhatsApp
        try {
            const notificationData = {
                name: primaryMember.name,
                eventTitle: event.title,
                teamName: teamName,
                date: new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }),
                time: `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`,
                location: event.location,
                amount: event.price,
                paymentPending: event.price > 0 && !paid,
                isMultiEvent: false,
                selectedEvents: []
            };

            await sendNotification(
                ['email'],
                { email: primaryMember.email },
                'registrationConfirmation',
                notificationData
            );
        } catch (notifErr) {
            console.error('Notification Error:', notifErr);
        }

        res.json({
            message: paid ? 'Payment verified and registration confirmed!' : 'Registration successful!',
            event,
            status: 'success'
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
// @desc    Delete an event
router.delete('/:id', async (req, res) => {
    try {
        console.log(`Attempting to delete event with ID: ${req.params.id}`);
        
        const event = await Event.findById(req.params.id);
        if (!event) {
            console.log(`Event not found: ${req.params.id}`);
            return res.status(404).json({ message: 'Event not found' });
        }

        console.log(`Deleting event: ${event.title}`);
        await event.deleteOne();
        
        console.log(`Event deleted successfully: ${req.params.id}`);
        res.json({ message: 'Event removed', eventId: req.params.id });
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

        Object.assign(event, req.body);
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

            // Send promotion email to primary member
            const primaryMember = promotedUser.members[0];
            await sendEmail(
                primaryMember.email,
                `You're In! Waitlist Promotion for ${event.title}`,
                `Hi ${primaryMember.name},\n\nA spot opened up for ${event.title} and your ${promotedUser.teamName ? `team "${promotedUser.teamName}"` : 'registration'} has been promoted from the waitlist. Your spot is now confirmed!\n\nBest regards,\nTeam Vortex`
            );
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
            const primary = reg.members[0];
            await sendEmail(
                primary.email,
                `Reminder: ${event.title} is coming up!`,
                `Hi ${primary.name},\n\nThis is a reminder that ${event.title} is happening in approximately 24 hours.\n\nDate: ${new Date(event.date).toLocaleDateString()}\nTime: ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}\nLocation: ${event.location}\n\nWe look forward to seeing you!\n\nBest regards,\nTeam Vortex`
            );
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
            await sendEmail(
                email,
                `Payment Proof Received: ${event.title}`,
                `Hi ${registration.members[0].name},\n\nWe have received your payment proof for ${event.title}.\n\nUTR Number: ${utrNumber}\nAmount: ₹${amountPaid || event.price}\n\nOur team will verify your payment within 24-48 hours. You will receive an email once verified.\n\nBest regards,\nTeam Vortex`
            );
        } catch (mailErr) {
            console.error('Mail Error:', mailErr);
        }

        // Send notification to admin
        try {
            if (event.organizer?.email) {
                await sendEmail(
                    event.organizer.email,
                    `New Payment Proof: ${event.title}`,
                    `A new payment proof has been submitted for ${event.title}.\n\nParticipant: ${registration.members[0].name}\nEmail: ${email}\nUTR Number: ${utrNumber}\nAmount: ₹${amountPaid || event.price}\n\nPlease verify the payment in the admin dashboard.`
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

        if (action === 'approve') {
            registration.paymentStatus = 'verified';
            registration.paid = true;
            registration.verifiedAt = new Date();
            registration.verifiedBy = verifiedBy || 'admin';

            // Create Payment Log
            await PaymentLog.create({
                eventId: event._id,
                registrationIndex: regIndex,
                teamName: registration.teamName,
                leadEmail: primaryMember.email,
                action: 'verified',
                previousStatus: 'submitted',
                newStatus: 'verified',
                amount: registration.paymentProof?.amountPaid || event.price,
                utrNumber: registration.paymentProof?.utrNumber,
                performedBy: verifiedBy || 'admin',
                ipAddress: req.ip
            });

            // Send approval notification via email and WhatsApp
            try {
                const notificationData = {
                    name: primaryMember.name,
                    eventTitle: event.title,
                    amount: registration.paymentProof?.amountPaid || event.price,
                    utrNumber: registration.paymentProof?.utrNumber,
                    date: new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    }),
                    time: `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`,
                    location: event.location
                };

                await sendNotification(
                    ['email'],
                    { email: primaryMember.email },
                    'paymentApproved',
                    notificationData
                );
            } catch (notifErr) {
                console.error('Notification Error:', notifErr);
            }
        } else {
            registration.paymentStatus = 'rejected';
            registration.rejectionReason = rejectionReason || 'Payment verification failed';

            // Create Payment Log
            await PaymentLog.create({
                eventId: event._id,
                registrationIndex: regIndex,
                teamName: registration.teamName,
                leadEmail: primaryMember.email,
                action: 'rejected',
                previousStatus: 'submitted',
                newStatus: 'rejected',
                rejectionReason: registration.rejectionReason,
                performedBy: verifiedBy || 'admin',
                ipAddress: req.ip
            });

            // Send rejection notification via email and WhatsApp
            try {
                const notificationData = {
                    name: primaryMember.name,
                    eventTitle: event.title,
                    reason: rejectionReason || 'Payment verification failed'
                };

                await sendNotification(
                    ['email'],
                    { email: primaryMember.email },
                    'paymentRejected',
                    notificationData
                );
            } catch (notifErr) {
                console.error('Notification Error:', notifErr);
            }
        }

        await event.save();

        res.json({
            message: action === 'approve' ? 'Payment verified successfully' : 'Payment rejected',
            status: registration.paymentStatus
        });
    } catch (err) {
        console.error('Payment Verification Error:', err);
        res.status(500).json({ message: 'Server error during payment verification' });
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
            .filter(reg => reg.paymentStatus === 'submitted' || reg.paymentStatus === 'pending');

        res.json({
            eventTitle: event.title,
            eventId: event._id,
            totalRegistrations: event.registrations.length,
            pendingCount: pendingPayments.filter(p => p.paymentStatus === 'pending').length,
            submittedCount: pendingPayments.filter(p => p.paymentStatus === 'submitted').length,
            pendingPayments
        });
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
