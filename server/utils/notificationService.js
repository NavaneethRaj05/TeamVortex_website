const nodemailer = require('nodemailer');

// ============================================
// EMAIL SERVICE WITH TEMPLATES (EMAIL ONLY)
// ============================================

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // TLS
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Email Templates
const emailTemplates = {
    registrationConfirmation: (data) => ({
        subject: `Registration Confirmed: ${data.eventTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #00D9FF;">🎉 Registration Confirmed!</h2>
                <p>Hi <strong>${data.name}</strong>,</p>
                <p>Your ${data.teamName ? `team "<strong>${data.teamName}</strong>"` : 'registration'} has been successfully confirmed for <strong>${data.eventTitle}</strong>.</p>
                
                ${data.isMultiEvent ? `
                    <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">📋 Registered Events:</h3>
                        <ul>
                            ${data.selectedEvents.map(e => `<li>${e}</li>`).join('')}
                        </ul>
                        <p style="color: #059669; font-weight: bold;">💰 You saved ₹${data.savings} with multi-event registration!</p>
                    </div>
                ` : ''}
                
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">📅 Event Details</h3>
                    <p><strong>Date:</strong> ${data.date}</p>
                    <p><strong>Time:</strong> ${data.time}</p>
                    <p><strong>Location:</strong> ${data.location}</p>
                    ${data.amount > 0 ? `<p><strong>Amount:</strong> ₹${data.amount}</p>` : ''}
                </div>
                
                ${data.paymentPending ? `
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>⏳ Payment Pending:</strong> Please complete your payment to confirm your spot.</p>
                    </div>
                ` : ''}
                
                <p>We look forward to seeing you there!</p>
                <p style="color: #6b7280; font-size: 14px;">Best regards,<br><strong>Team Vortex</strong></p>
            </div>
        `,
        text: `Hi ${data.name},\n\nYour ${data.teamName ? `team "${data.teamName}"` : 'registration'} has been successfully confirmed for ${data.eventTitle}.\n\nDate: ${data.date}\nTime: ${data.time}\nLocation: ${data.location}\n\nBest regards,\nTeam Vortex`
    }),

    paymentApproved: (data) => ({
        subject: `✅ Payment Verified: ${data.eventTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 8px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 32px;">✅</h1>
                    <h2 style="margin: 10px 0 0 0;">Payment Verified!</h2>
                </div>
                
                <div style="padding: 20px;">
                    <p>Hi <strong>${data.name}</strong>,</p>
                    <p>Great news! Your payment for <strong>${data.eventTitle}</strong> has been verified and approved.</p>
                    
                    <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                        <p style="margin: 0;"><strong>Payment Details:</strong></p>
                        <p style="margin: 5px 0;">Amount: ₹${data.amount}</p>
                        <p style="margin: 5px 0;">UTR: ${data.utrNumber || 'N/A'}</p>
                        <p style="margin: 5px 0;">Verified on: ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <p><strong>Your registration is now confirmed!</strong> We look forward to seeing you at the event.</p>
                    
                    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">📅 Event Details</h3>
                        <p><strong>Date:</strong> ${data.date}</p>
                        <p><strong>Time:</strong> ${data.time}</p>
                        <p><strong>Location:</strong> ${data.location}</p>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px;">Best regards,<br><strong>Team Vortex</strong></p>
                </div>
            </div>
        `,
        text: `Hi ${data.name},\n\nGreat news! Your payment for ${data.eventTitle} has been verified.\n\nAmount: ₹${data.amount}\nYour registration is now confirmed!\n\nDate: ${data.date}\nTime: ${data.time}\nLocation: ${data.location}\n\nBest regards,\nTeam Vortex`
    }),

    eventReminder24h: (data) => ({
        subject: `⏰ Reminder: ${data.eventTitle} is Tomorrow!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 8px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 32px;">⏰</h1>
                    <h2 style="margin: 10px 0 0 0;">Event Tomorrow!</h2>
                </div>
                
                <div style="padding: 20px;">
                    <p>Hi <strong>${data.name}</strong>,</p>
                    <p>This is a friendly reminder that <strong>${data.eventTitle}</strong> is happening <strong>tomorrow</strong>!</p>
                    
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                        <h3 style="margin-top: 0;">📍 Event Details</h3>
                        <p><strong>Date:</strong> ${data.date}</p>
                        <p><strong>Time:</strong> ${data.time}</p>
                        <p><strong>Location:</strong> ${data.location}</p>
                        ${data.teamName ? `<p><strong>Team:</strong> ${data.teamName}</p>` : ''}
                    </div>
                    
                    ${data.isMultiEvent ? `
                        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">📋 Your Registered Events:</h3>
                            <ul>
                                ${data.selectedEvents.map(e => `<li>${e}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">✅ Things to Remember:</h3>
                        <ul>
                            <li>Bring your college ID card</li>
                            <li>Arrive 15 minutes early for registration</li>
                            <li>Carry a copy of your registration confirmation</li>
                            ${data.requirements ? data.requirements.map(r => `<li>${r}</li>`).join('') : ''}
                        </ul>
                    </div>
                    
                    <p>We're excited to see you tomorrow!</p>
                    <p style="color: #6b7280; font-size: 14px;">Best regards,<br><strong>Team Vortex</strong></p>
                </div>
            </div>
        `,
        text: `Hi ${data.name},\n\nReminder: ${data.eventTitle} is happening tomorrow!\n\nDate: ${data.date}\nTime: ${data.time}\nLocation: ${data.location}\n\nThings to remember:\n- Bring your college ID\n- Arrive 15 minutes early\n- Carry registration confirmation\n\nSee you tomorrow!\n\nBest regards,\nTeam Vortex`
    }),

    feedbackRequest: (data) => ({
        subject: `📝 How was ${data.eventTitle}? Share Your Feedback`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; border-radius: 8px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 32px;">📝</h1>
                    <h2 style="margin: 10px 0 0 0;">We'd Love Your Feedback!</h2>
                </div>
                
                <div style="padding: 20px;">
                    <p>Hi <strong>${data.name}</strong>,</p>
                    <p>Thank you for participating in <strong>${data.eventTitle}</strong>! We hope you had a great experience.</p>
                    
                    <p>Your feedback helps us improve future events. Please take 2 minutes to share your thoughts:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${data.feedbackUrl}" style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                            Share Your Feedback
                        </a>
                    </div>
                    
                    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">
                            <strong>Quick Questions:</strong><br>
                            • How would you rate the event? (1-5 stars)<br>
                            • What did you like most?<br>
                            • What can we improve?<br>
                            • Would you recommend this to others?
                        </p>
                    </div>
                    
                    <p style="font-size: 14px; color: #6b7280;">This will only take 2 minutes, and your input is invaluable to us!</p>
                    
                    <p style="color: #6b7280; font-size: 14px;">Thank you,<br><strong>Team Vortex</strong></p>
                </div>
            </div>
        `,
        text: `Hi ${data.name},\n\nThank you for participating in ${data.eventTitle}!\n\nWe'd love to hear your feedback. Please visit:\n${data.feedbackUrl}\n\nYour input helps us improve future events.\n\nThank you,\nTeam Vortex`
    }),

    paymentRejected: (data) => ({
        subject: `⚠️ Payment Issue: ${data.eventTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <h2 style="color: #dc2626; margin-top: 0;">⚠️ Payment Verification Issue</h2>
                    <p>Hi <strong>${data.name}</strong>,</p>
                    <p>Unfortunately, we could not verify your payment for <strong>${data.eventTitle}</strong>.</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Reason:</strong> ${data.reason}</p>
                    </div>
                    
                    <p><strong>Next Steps:</strong></p>
                    <ul>
                        <li>Verify your payment was successful</li>
                        <li>Check the UTR number is correct</li>
                        <li>Submit a new payment proof with clear screenshot</li>
                        <li>Contact us if you believe this is an error</li>
                    </ul>
                    
                    <p>Please resubmit your payment proof or contact our support team for assistance.</p>
                    
                    <p style="color: #6b7280; font-size: 14px;">Best regards,<br><strong>Team Vortex</strong></p>
                </div>
            </div>
        `,
        text: `Hi ${data.name},\n\nUnfortunately, we could not verify your payment for ${data.eventTitle}.\n\nReason: ${data.reason}\n\nPlease verify your payment and resubmit the proof, or contact us for assistance.\n\nBest regards,\nTeam Vortex`
    })
};

// Send Email Function
const sendEmail = async (to, templateName, data) => {
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
        console.warn(`⚠️  Email not configured — skipping email to ${to} (${templateName})`);
        return { success: false, error: 'Email not configured' };
    }
    try {
        const template = emailTemplates[templateName](data);
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || `"Team Vortex" <${process.env.EMAIL_USER}>`,
            to,
            subject: template.subject,
            text: template.text,
            html: template.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${to}: ${template.subject} [${info.messageId}]`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Email failed to ${to} (${templateName}):`, error.message);
        return { success: false, error: error.message };
    }
};

// Unified notification function (email only - no cost)
const sendNotification = async (channels, to, templateName, data) => {
    const results = {
        email: null
    };

    // Send Email (always free)
    if (channels.includes('email') && to.email) {
        results.email = await sendEmail(to.email, templateName, data);
    }

    return results;
};

module.exports = {
    sendEmail,
    sendNotification,
    emailTemplates
};
