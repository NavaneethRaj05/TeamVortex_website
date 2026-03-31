const nodemailer = require('nodemailer');

const CLIENT_URL = process.env.CLIENT_URL || 'https://teamvortexnce.netlify.app';
const FROM = `"${process.env.EMAIL_FROM_NAME || 'Team Vortex'}" <${process.env.EMAIL_USER}>`;

// ============================================
// TRANSPORTER
// ============================================

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
    },
    tls: { rejectUnauthorized: false }
});

transporter.verify((error) => {
    if (error) console.error('❌ Email server connection failed:', error.message);
    else console.log('✅ Email server ready');
});

// ============================================
// SHARED STYLES
// ============================================

const baseStyles = `
    body{font-family:Arial,sans-serif;line-height:1.6;color:#333;background:#f4f4f4;margin:0;padding:0}
    .wrap{max-width:600px;margin:20px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .hdr{padding:30px;text-align:center;color:#fff}
    .hdr h1{margin:0;font-size:22px}
    .body{padding:30px}
    .box{background:#f9fafb;border-left:4px solid #667eea;padding:15px;margin:15px 0;border-radius:4px}
    .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e5e7eb;font-size:14px}
    .row:last-child{border-bottom:none}
    .lbl{color:#6b7280}
    .val{color:#1f2937;font-weight:600;text-align:right}
    .btn{display:inline-block;padding:12px 24px;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;margin:10px 5px}
    .footer{background:#1f2937;color:#d1d5db;padding:20px;text-align:center;font-size:13px}
    .footer a{color:#60a5fa;text-decoration:none}
    .badge{display:inline-block;padding:6px 16px;border-radius:20px;font-weight:600;margin-bottom:15px;font-size:14px}
`;

const wrap = (headerBg, headerEmoji, headerTitle, bodyHtml) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${baseStyles}</style></head>
<body><div class="wrap">
  <div class="hdr" style="background:${headerBg}">
    <div style="font-size:32px">${headerEmoji}</div>
    <h1>${headerTitle}</h1>
  </div>
  <div class="body">${bodyHtml}</div>
  <div class="footer">
    <p><strong>Team Vortex</strong></p>
    <p>Need help? <a href="mailto:teamvortexnce@gmail.com">teamvortexnce@gmail.com</a></p>
    <p style="font-size:12px">&copy; 2026 Team Vortex. All rights reserved.</p>
  </div>
</div></body></html>`;

// ============================================
// EMAIL TEMPLATES
// ============================================

const emailTemplates = {

    registrationConfirmation: (data) => ({
        subject: `✓ Registration Confirmed - ${data.eventTitle}`,
        html: wrap(
            'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', '✓', 'Registration Confirmed',
            `<div class="badge" style="background:#10b981;color:#fff">✓ REGISTRATION CONFIRMED</div>
            <h2 style="color:#1f2937;margin-top:0">Hi ${data.name}! 👋</h2>
            <p style="color:#6b7280">Your${data.teamName ? ` team "<strong>${data.teamName}</strong>"` : ''} registration for <strong>${data.eventTitle}</strong> is confirmed.</p>
            <div class="box">
              <h3 style="margin-top:0;font-size:16px">📋 Event Details</h3>
              <div class="row"><span class="lbl">Event</span><span class="val">${data.eventTitle}</span></div>
              <div class="row"><span class="lbl">Date</span><span class="val">${data.date}</span></div>
              <div class="row"><span class="lbl">Time</span><span class="val">${data.time}</span></div>
              <div class="row"><span class="lbl">Venue</span><span class="val">${data.location}</span></div>
              ${data.teamName ? `<div class="row"><span class="lbl">Team</span><span class="val">${data.teamName}</span></div>` : ''}
              ${data.amount > 0 ? `<div class="row"><span class="lbl">Amount</span><span class="val">₹${data.amount}</span></div>` : ''}
            </div>
            ${data.isMultiEvent && data.selectedEvents?.length ? `
            <div class="box" style="border-left-color:#10b981">
              <h3 style="margin-top:0;font-size:16px">📋 Registered Sub-Events</h3>
              <ul>${data.selectedEvents.map(e => `<li>${e}</li>`).join('')}</ul>
              ${data.savings > 0 ? `<p style="color:#059669;font-weight:600">💰 You saved ₹${data.savings}!</p>` : ''}
            </div>` : ''}
            ${data.paymentPending ? `
            <div style="background:#fef3c7;padding:15px;border-radius:8px;margin:15px 0">
              <p style="margin:0;color:#92400e"><strong>⏳ Payment Pending:</strong> Please complete your payment to confirm your spot.</p>
            </div>` : ''}
            <div style="background:#eff6ff;padding:15px;border-radius:8px;margin:15px 0">
              <p style="margin:0;color:#1e40af;font-weight:600">⚡ Next Steps:</p>
              <ul style="margin:8px 0;padding-left:20px;color:#1e3a8a">
                <li>Arrive 30 minutes before event time</li>
                <li>Bring your college ID card</li>
                <li>Keep this email for reference</li>
              </ul>
            </div>`
        ),
        text: `Hi ${data.name},\n\nRegistration confirmed for ${data.eventTitle}.\n\nDate: ${data.date}\nTime: ${data.time}\nVenue: ${data.location}\n\nBest regards,\nTeam Vortex`
    }),

    paymentProofReceived: (data) => ({
        subject: `🟡 Payment Proof Submitted - ${data.eventTitle}`,
        html: wrap(
            'linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)', '🟡', 'Payment Proof Received',
            `<div class="badge" style="background:#f59e0b;color:#fff">🟡 PENDING VERIFICATION</div>
            <h2 style="color:#1f2937;margin-top:0">Hi ${data.name}! 👋</h2>
            <p>We've received your payment proof for <strong>${data.eventTitle}</strong>.</p>
            <div class="box">
              <div class="row"><span class="lbl">UTR Number</span><span class="val">${data.utrNumber}</span></div>
              <div class="row"><span class="lbl">Amount</span><span class="val">₹${data.amount}</span></div>
              <div class="row"><span class="lbl">Status</span><span class="val" style="color:#f59e0b">Pending Verification</span></div>
            </div>
            <div style="background:#eff6ff;padding:15px;border-radius:8px;margin:15px 0">
              <p style="margin:0;color:#1e40af;font-weight:600">⏳ What's Next?</p>
              <ul style="margin:8px 0;padding-left:20px;color:#1e3a8a">
                <li>Our team will verify within 24 hours</li>
                <li>You'll receive a confirmation email once verified</li>
              </ul>
            </div>`
        ),
        text: `Hi ${data.name},\n\nWe received your payment proof for ${data.eventTitle}.\nUTR: ${data.utrNumber}\nAmount: ₹${data.amount}\n\nWe'll verify within 24 hours.\n\nBest regards,\nTeam Vortex`
    }),

    paymentProofAlert: (data) => ({
        subject: `🔔 New Payment Proof to Verify - ${data.teamName || data.participantName}`,
        html: wrap(
            'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)', '🔔', 'Action Required: Verify Payment',
            `<p>A new payment proof has been submitted for <strong>${data.eventTitle}</strong>.</p>
            <div class="box" style="border-left-color:#f59e0b;background:#fffbeb">
              <div class="row"><span class="lbl">Participant</span><span class="val">${data.participantName}</span></div>
              <div class="row"><span class="lbl">Email</span><span class="val">${data.participantEmail}</span></div>
              <div class="row"><span class="lbl">UTR Number</span><span class="val">${data.utrNumber}</span></div>
              <div class="row"><span class="lbl">Amount</span><span class="val">₹${data.amount}</span></div>
            </div>
            <div style="text-align:center;margin:25px 0">
              <a href="${CLIENT_URL}/dashboard" class="btn" style="background:#f59e0b">Go to Admin Dashboard</a>
            </div>`
        ),
        text: `New payment proof for ${data.eventTitle}.\nParticipant: ${data.participantName}\nEmail: ${data.participantEmail}\nUTR: ${data.utrNumber}\nAmount: ₹${data.amount}\n\nVerify at: ${CLIENT_URL}/dashboard`
    }),

    paymentApproved: (data) => ({
        subject: `You're confirmed for ${data.eventTitle}`,
        html: wrap(
            'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)', '🎉', `You're In — ${data.eventTitle}`,
            `<h2 style="color:#1f2937;margin-top:0">Hi ${data.name},</h2>
            <p style="color:#374151">Your registration for <strong>${data.eventTitle}</strong> is confirmed. We've verified your payment and everything is set.</p>
            <div class="box" style="border-left-color:#10b981;background:#f0fdf4">
              <div class="row"><span class="lbl">Amount Paid</span><span class="val" style="color:#059669;font-weight:700">₹${data.amount}</span></div>
              ${data.utrNumber ? `<div class="row"><span class="lbl">Transaction Ref</span><span class="val">${data.utrNumber}</span></div>` : ''}
              <div class="row"><span class="lbl">Confirmed On</span><span class="val">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
            </div>
            <div class="box">
              <p style="margin:0 0 10px;font-weight:600;color:#1f2937">Event Details</p>
              <div class="row"><span class="lbl">Date</span><span class="val">${data.date}</span></div>
              <div class="row"><span class="lbl">Time</span><span class="val">${data.time}</span></div>
              <div class="row"><span class="lbl">Venue</span><span class="val">${data.location}</span></div>
            </div>
            <p style="color:#374151">Please carry a valid college ID card on the day of the event. See you there!</p>
            <div style="text-align:center;margin:25px 0">
              <a href="${CLIENT_URL}/contests" class="btn" style="background:#4f46e5">View Event Details</a>
            </div>`
        ),
        text: `Hi ${data.name},\n\nYour registration for ${data.eventTitle} is confirmed.\n\nAmount Paid: ₹${data.amount}\nDate: ${data.date}\nTime: ${data.time}\nVenue: ${data.location}\n\nPlease carry a valid college ID on the day of the event.\n\nSee you there!\nTeam Vortex`
    }),

    paymentRejected: (data) => ({
        subject: `Registration Update — ${data.eventTitle}`,
        html: wrap(
            'linear-gradient(135deg,#1e293b 0%,#0f172a 100%)', '📋', 'Registration Update',
            `<h2 style="color:#1f2937;margin-top:0">Hi ${data.name},</h2>
            <p style="color:#374151">Thank you for registering for <strong>${data.eventTitle}</strong>.</p>
            <p style="color:#374151">After reviewing your payment submission, we were unable to confirm it at this time.</p>
            ${data.reason && data.reason !== 'Payment verification failed' ? `
            <div class="box" style="border-left-color:#6366f1;background:#f5f3ff">
              <p style="margin:0;color:#4338ca"><strong>Note from admin:</strong> ${data.reason}</p>
            </div>` : ''}
            <div style="background:#f8fafc;padding:16px;border-radius:8px;margin:16px 0;border:1px solid #e2e8f0">
              <p style="margin:0 0 8px;font-weight:600;color:#1f2937">What you can do:</p>
              <p style="margin:0;color:#374151">You are welcome to register again on the contests page. Make sure your payment screenshot clearly shows the UTR / transaction ID and the amount paid.</p>
            </div>
            <div style="text-align:center;margin:25px 0">
              <a href="${CLIENT_URL}/contests" class="btn" style="background:#4f46e5">Register Again</a>
            </div>
            <p style="color:#6b7280;font-size:13px">If you believe this is a mistake, please contact us and we'll look into it.</p>`
        ),
        text: `Hi ${data.name},\n\nThank you for registering for ${data.eventTitle}.\n\nWe were unable to confirm your payment at this time${data.reason && data.reason !== 'Payment verification failed' ? ` — ${data.reason}` : ''}.\n\nYou are welcome to register again at ${CLIENT_URL}/contests.\n\nIf you believe this is a mistake, please contact us.\n\nBest regards,\nTeam Vortex`
    }),

    eventReminder24h: (data) => ({
        subject: `📅 Reminder: ${data.eventTitle} - Tomorrow!`,
        html: wrap(
            'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)', '📅', 'Event Tomorrow!',
            `<h2 style="color:#1f2937;margin-top:0">Hi ${data.name}! 👋</h2>
            <p style="font-size:16px"><strong>${data.eventTitle}</strong> is happening <strong>tomorrow</strong>!</p>
            <div class="box" style="border-left-color:#f59e0b;background:#fef3c7">
              <h3 style="margin-top:0;font-size:16px">📍 Event Details</h3>
              <div class="row"><span class="lbl">Date</span><span class="val">${data.date}</span></div>
              <div class="row"><span class="lbl">Time</span><span class="val">${data.time}</span></div>
              <div class="row"><span class="lbl">Venue</span><span class="val">${data.location}</span></div>
              ${data.teamName ? `<div class="row"><span class="lbl">Team</span><span class="val">${data.teamName}</span></div>` : ''}
            </div>
            ${data.isMultiEvent && data.selectedEvents?.length ? `
            <div class="box"><h3 style="margin-top:0;font-size:16px">📋 Your Events</h3>
              <ul>${data.selectedEvents.map(e => `<li>${e}</li>`).join('')}</ul>
            </div>` : ''}
            <div style="background:#f0fdf4;padding:15px;border-radius:8px;margin:15px 0">
              <p style="margin:0;font-weight:600">📝 Remember to bring:</p>
              <ul style="margin:8px 0;padding-left:20px">
                <li>College ID card</li>
                <li>This registration confirmation</li>
                <li>Arrive 30 minutes early</li>
                ${(data.requirements || []).map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>
            <p style="font-size:16px;color:#10b981;font-weight:600">See you tomorrow! 🎉</p>`
        ),
        text: `Hi ${data.name},\n\nReminder: ${data.eventTitle} is tomorrow!\nDate: ${data.date}\nTime: ${data.time}\nVenue: ${data.location}\n\nBring your college ID and arrive 30 min early.\n\nBest regards,\nTeam Vortex`
    }),

    feedbackRequest: (data) => ({
        subject: `📝 How was ${data.eventTitle}? Share Your Feedback`,
        html: wrap(
            'linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)', '📝', "We'd Love Your Feedback!",
            `<h2 style="color:#1f2937;margin-top:0">Hi ${data.name}! 👋</h2>
            <p>Thank you for participating in <strong>${data.eventTitle}</strong>! We hope you had a great experience.</p>
            <p>Your feedback helps us make future events even better. It only takes 2 minutes!</p>
            <div style="text-align:center;margin:30px 0">
              <a href="${data.feedbackUrl}" class="btn" style="background:#8b5cf6;font-size:16px">Share Your Feedback</a>
            </div>
            <div style="background:#f9fafb;padding:15px;border-radius:8px;margin:15px 0">
              <p style="margin:0;font-size:14px;color:#6b7280">
                <strong>Quick questions:</strong><br>
                • How would you rate the event? (1–5 stars)<br>
                • What did you like most?<br>
                • What can we improve?
              </p>
            </div>
            <p style="color:#6b7280;font-size:14px">Thank you,<br><strong>Team Vortex</strong></p>`
        ),
        text: `Hi ${data.name},\n\nThank you for attending ${data.eventTitle}!\n\nShare your feedback: ${data.feedbackUrl}\n\nThank you,\nTeam Vortex`
    }),

    paymentNudge: (data) => ({
        subject: `⏰ Action Required: Complete Payment - ${data.eventTitle}`,
        html: wrap(
            'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)', '⏰', 'Action Required',
            `<div class="badge" style="background:#fef3c7;color:#92400e">⏰ ACTION REQUIRED</div>
            <h2 style="color:#1f2937;margin-top:0">Hi ${data.name},</h2>
            <p>Your registration for <strong>${data.eventTitle}</strong> is still pending payment.</p>
            <div class="box" style="border-left-color:#f59e0b;background:#fffbeb">
              <p style="margin:0;color:#92400e;font-weight:600">⚠️ Complete payment to secure your spot!</p>
              <div class="row" style="margin-top:10px"><span class="lbl">Amount Due</span><span class="val">₹${data.amount}</span></div>
              <div class="row"><span class="lbl">Event Date</span><span class="val">${data.date}</span></div>
              <div class="row"><span class="lbl">Venue</span><span class="val">${data.location}</span></div>
            </div>
            <div style="text-align:center;margin:25px 0">
              <a href="${CLIENT_URL}" class="btn" style="background:#f59e0b;font-size:16px">Complete Payment Now</a>
            </div>
            <p style="color:#6b7280;font-size:14px">Unverified registrations may be released to the waitlist.<br><br>Best regards,<br><strong>Team Vortex</strong></p>`
        ),
        text: `Hi ${data.name},\n\nYour payment for ${data.eventTitle} is still pending.\nAmount: ₹${data.amount}\nDate: ${data.date}\n\nComplete payment at: ${CLIENT_URL}\n\nBest regards,\nTeam Vortex`
    }),

    waitlistPromotion: (data) => ({
        subject: `🎉 You're In! Spot Confirmed - ${data.eventTitle}`,
        html: wrap(
            'linear-gradient(135deg,#10b981 0%,#059669 100%)', '🎉', "You've Been Promoted!",
            `<h2 style="color:#1f2937;margin-top:0">Hi ${data.name}! 🎉</h2>
            <p>A spot opened up for <strong>${data.eventTitle}</strong> and your ${data.teamName ? `team "<strong>${data.teamName}</strong>"` : 'registration'} has been promoted from the waitlist.</p>
            <div class="box" style="border-left-color:#10b981;background:#f0fdf4">
              <p style="margin:0;color:#059669;font-weight:600">✅ Your spot is now confirmed!</p>
            </div>
            <p>We look forward to seeing you at the event!</p>
            <p style="color:#6b7280;font-size:14px">Best regards,<br><strong>Team Vortex</strong></p>`
        ),
        text: `Hi ${data.name},\n\nYou've been promoted from the waitlist for ${data.eventTitle}. Your spot is confirmed!\n\nBest regards,\nTeam Vortex`
    })
};

// ============================================
// CORE SEND FUNCTION
// ============================================

const sendEmail = async (to, templateName, data) => {
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
        console.warn(`⚠️  Email not configured — skipping (${templateName}) to ${to}`);
        return { success: false, error: 'Email not configured' };
    }
    try {
        const template = emailTemplates[templateName](data);
        const info = await transporter.sendMail({
            from: FROM,
            to,
            subject: template.subject,
            text: template.text,
            html: template.html
        });
        console.log(`✅ Email sent to ${to}: ${template.subject} [${info.messageId}]`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Email failed to ${to} (${templateName}):`, error.message);
        return { success: false, error: error.message };
    }
};

// ============================================
// HELPERS
// ============================================

/**
 * Send to a single recipient via channel array.
 */
const sendNotification = async (channels, to, templateName, data) => {
    const results = { email: null };
    if (channels.includes('email') && to.email) {
        results.email = await sendEmail(to.email, templateName, data);
    }
    return results;
};

/**
 * Send to ALL members of a registration.
 * Each member gets their own name personalised in the email.
 * Members without an email are silently skipped.
 */
const sendToAllMembers = async (members, templateName, baseData) => {
    if (!Array.isArray(members) || members.length === 0) return;
    for (const member of members) {
        if (!member?.email) continue;
        try {
            await sendEmail(member.email, templateName, { ...baseData, name: member.name || baseData.name });
        } catch (err) {
            console.error(`❌ sendToAllMembers failed for ${member.email} (${templateName}):`, err.message);
        }
    }
};

/**
 * Send to ALL members — safe version.
 * Registration NEVER fails if email fails.
 * Failed sends are logged to FailedEmail collection for retry.
 * Returns { sent: number, failed: number }
 */
const sendToAllMembersSafe = async (members, templateName, baseData) => {
    if (!Array.isArray(members) || members.length === 0) return { sent: 0, failed: 0 };

    let sent = 0;
    let failed = 0;
    const failedRecipients = [];

    for (const member of members) {
        if (!member?.email) continue;
        try {
            await sendEmail(member.email, templateName, { ...baseData, name: member.name || baseData.name });
            sent++;
        } catch (err) {
            console.error(`❌ Email failed for ${member.email} (${templateName}):`, err.message);
            failed++;
            failedRecipients.push(member.email);
        }
    }

    // Log failed sends for retry (non-blocking)
    if (failedRecipients.length > 0) {
        try {
            const FailedEmail = require('../models/FailedEmail');
            await FailedEmail.create({
                emailType: templateName,
                recipients: failedRecipients,
                data: baseData,
                error: `Failed for ${failedRecipients.length} recipient(s)`
            });
            console.warn(`⚠️  ${failedRecipients.length} email(s) queued for retry (${templateName})`);
        } catch (logErr) {
            console.error('❌ Could not log failed email:', logErr.message);
        }
    }

    return { sent, failed };
};

module.exports = { sendEmail, sendNotification, sendToAllMembers, sendToAllMembersSafe, emailTemplates };
