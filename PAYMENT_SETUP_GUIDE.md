# Payment Flow Setup & Usage Guide

## Overview
Your application supports multiple payment methods for event registrations. Here's how to set them up and use them.

---

## Payment Methods Available

### 1. Razorpay Integration (RECOMMENDED - Fully Automated)

**Best for:** Paid events requiring instant payment verification

**Setup Steps:**

1. **Create Razorpay Account**
   - Visit https://razorpay.com
   - Sign up for a business account
   - Complete KYC verification

2. **Get API Credentials**
   - Go to Dashboard > Settings > API Keys
   - Generate Test/Live mode keys
   - Copy: Key ID and Key Secret

3. **Configure Webhook**
   - Go to Dashboard > Settings > Webhooks
   - Add webhook URL: `https://yourdomain.com/api/payments/webhook`
   - Select events: `payment.captured`, `payment.failed`, `order.paid`
   - Copy the webhook secret

4. **Update Server Configuration**
   Edit `server/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_secret_key_here
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

5. **Restart Server**
   ```bash
   cd server
   npm start
   ```

**How to Use:**
1. Create event in dashboard with price > 0
2. Users click "Register Now"
3. Razorpay checkout opens automatically
4. User completes payment
5. System verifies payment automatically
6. Registration confirmed instantly
7. Track payments in Dashboard > Payment Verification Panel

**Features:**
- ✅ Automatic payment verification
- ✅ Instant confirmation
- ✅ Refund support
- ✅ Multiple payment methods (UPI, Cards, NetBanking, Wallets)
- ✅ Payment tracking & analytics
- ✅ Automatic email notifications
- ✅ Secure & PCI compliant

---

### 2. UPI Payment Only (Manual Verification)

**Best for:** Small events, quick setup, no KYC required

**Setup Steps:**

1. **Get Your UPI Details**
   - Your UPI ID (e.g., `teamvortex@paytm`, `9876543210@ybl`)
   - Generate QR code from any UPI app (Google Pay, PhonePe, Paytm)
   - Take screenshot of QR code

2. **Upload QR Code**
   - Upload QR code image to:
     - Imgur: https://imgur.com/upload
     - Cloudinary: https://cloudinary.com
     - ImgBB: https://imgbb.com
   - Copy the direct image URL (must end with .jpg, .png, etc.)

3. **Configure in Event Form**
   - Select "UPI Payment Only"
   - Enter UPI ID
   - Paste QR code image URL
   - Add payment receiver name and contact

**How to Use:**
1. User registers for event
2. System shows UPI QR code and ID
3. User scans QR code and pays
4. User uploads payment screenshot
5. You manually verify in Dashboard > Payment Verification Panel
6. Approve/reject payment
7. User receives confirmation

**Features:**
- ✅ No setup fees
- ✅ Instant setup
- ✅ No KYC required
- ⚠️ Manual verification needed
- ⚠️ Slower confirmation

---

### 3. Offline Payment Only (Manual Collection)

**Best for:** In-person events, cash collection

**Setup Steps:**

1. **Configure in Event Form**
   - Select "Offline Payment Only"
   - Choose methods: Cash, Bank Transfer, or both
   - Add payment receiver details
   - If bank transfer: Add bank account details

2. **Bank Details (if applicable)**
   - Bank Name
   - Account Holder Name
   - Account Number
   - IFSC Code

**How to Use:**
1. User registers for event
2. System shows payment instructions
3. User pays offline (cash/bank transfer)
4. User uploads payment proof (if bank transfer)
5. You verify manually in dashboard
6. Mark as paid after receiving payment

**Features:**
- ✅ No online payment fees
- ✅ Flexible collection
- ⚠️ Manual tracking required
- ⚠️ Slower process

---

### 4. Both UPI & Offline (Hybrid)

**Best for:** Maximum flexibility

**Setup Steps:**
1. Configure both UPI and Offline payment details
2. Users can choose their preferred method

---

## Dashboard Payment Management

### Payment Verification Panel

Access: Dashboard > Payment Verification Panel

**Features:**
- View all payments by event
- Filter by status (Pending, Verified, Failed)
- See payment screenshots
- Approve/reject payments
- Export payment reports (CSV/PDF)
- Refund payments (Razorpay only)

**Actions:**
- ✅ **Verify Payment**: Approve payment and confirm registration
- ❌ **Reject Payment**: Reject with reason
- 💰 **Refund**: Issue refund (Razorpay only)
- 📊 **Export**: Download payment reports

---

## Comparison Table

| Feature | Razorpay | UPI Manual | Offline |
|---------|----------|------------|---------|
| Setup Time | 1-2 days (KYC) | 5 minutes | Instant |
| Verification | Automatic | Manual | Manual |
| Payment Methods | All | UPI only | Cash/Bank |
| Transaction Fee | ~2% | Free | Free |
| Refunds | Automatic | Manual | Manual |
| Best For | Large events | Small events | In-person |

---

## Recommended Setup by Event Type

### Large Technical Event (100+ participants)
- **Use:** Razorpay
- **Why:** Automatic verification, multiple payment methods, professional

### Small Workshop (20-50 participants)
- **Use:** UPI Manual
- **Why:** Quick setup, no fees, easy for participants

### College Fest (In-person registration)
- **Use:** Offline Payment
- **Why:** Cash collection at venue, no online dependency

### Hybrid Event
- **Use:** Both UPI & Offline
- **Why:** Maximum flexibility for participants

---

## Testing Payment Flow

### Test Razorpay (Test Mode)
1. Use test API keys
2. Test card: 4111 1111 1111 1111
3. Any future expiry date
4. Any CVV
5. Test UPI: success@razorpay

### Test UPI Manual
1. Create test event with UPI payment
2. Register as user
3. Upload dummy screenshot
4. Verify in dashboard

---

## Troubleshooting

### Razorpay Not Working
- ✓ Check API keys are correct
- ✓ Verify server is running
- ✓ Check browser console for errors
- ✓ Ensure CORS is configured

### UPI QR Code Not Showing
- ✓ Verify image URL is direct link (ends with .jpg/.png)
- ✓ Check image is publicly accessible
- ✓ Try different image hosting service

### Payments Not Appearing in Dashboard
- ✓ Refresh the page
- ✓ Check event is selected
- ✓ Verify payment was submitted

---

## Security Best Practices

1. **Never commit API keys to Git**
   - Use `.env` files
   - Add `.env` to `.gitignore`

2. **Use HTTPS in production**
   - Required for Razorpay
   - Protects payment data

3. **Verify webhook signatures**
   - Already implemented in code
   - Prevents fake payment notifications

4. **Regular backups**
   - Backup payment logs
   - Export reports regularly

---

## Support & Documentation

- **Razorpay Docs**: https://razorpay.com/docs/
- **Your Implementation**: See `RAZORPAY_COMPLETE.md`
- **API Routes**: `server/routes/payments.js`
- **Frontend Component**: `src/components/RazorpayCheckout.js`

---

## Quick Start Checklist

### For Razorpay:
- [ ] Create Razorpay account
- [ ] Get API keys
- [ ] Configure webhook
- [ ] Update server/.env
- [ ] Restart server
- [ ] Test with test keys
- [ ] Switch to live keys for production

### For UPI Manual:
- [ ] Get UPI ID
- [ ] Generate QR code
- [ ] Upload QR code image
- [ ] Get direct image URL
- [ ] Configure in event form
- [ ] Test registration flow

### For Offline:
- [ ] Decide payment methods
- [ ] Prepare bank details (if needed)
- [ ] Configure in event form
- [ ] Test registration flow

---

## Need Help?

Check these files for detailed implementation:
- `RAZORPAY_COMPLETE.md` - Complete Razorpay integration guide
- `server/utils/razorpayService.js` - Payment service code
- `server/routes/payments.js` - Payment API routes
- `src/components/RazorpayCheckout.js` - Frontend payment component
