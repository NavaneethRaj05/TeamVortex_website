const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    // Note: In production, use real SMTP credentials from .env
    // For now, this is a placeholder using Mailtrap or similar service logic
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
            port: process.env.EMAIL_PORT || 2525,
            auth: {
                user: process.env.EMAIL_USER || '',
                pass: process.env.EMAIL_PASS || ''
            }
        });

        const mailOptions = {
            from: '"Team Vortex" <no-reply@teamvortex.com>',
            to,
            subject,
            text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendEmail };
