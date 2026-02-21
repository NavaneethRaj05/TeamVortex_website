import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate a branded registration confirmation PDF for users
 * Works on all devices including iOS and Android
 */
export const generateRegistrationPDF = (registrationData, eventData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Add Team Vortex branding header
  doc.setFillColor(59, 130, 246); // Vortex blue
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Team Vortex logo/title
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('TEAM VORTEX', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Navkis College of Engineering', pageWidth / 2, 30, { align: 'center' });

  // Registration Confirmation Title
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.setFont('helvetica', 'bold');
  doc.text('REGISTRATION CONFIRMATION', pageWidth / 2, 55, { align: 'center' });

  // Success checkmark
  doc.setFontSize(40);
  doc.setTextColor(34, 197, 94); // Green
  doc.text('✓', pageWidth / 2, 75, { align: 'center' });

  // Event Details Section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Event Details', 14, 95);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  let yPos = 105;
  const lineHeight = 7;

  // Event information
  doc.setFont('helvetica', 'bold');
  doc.text('Event Name:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(eventData.title || 'N/A', 50, yPos);
  yPos += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(eventData.date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), 50, yPos);
  yPos += lineHeight;

  if (eventData.startTime) {
    doc.setFont('helvetica', 'bold');
    doc.text('Time:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${eventData.startTime}${eventData.endTime ? ' - ' + eventData.endTime : ''}`, 50, yPos);
    yPos += lineHeight;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Location:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(eventData.location || 'TBA', 50, yPos);
  yPos += lineHeight;

  doc.setFont('helvetica', 'bold');
  doc.text('Type:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(eventData.registrationType || 'Solo', 50, yPos);
  yPos += lineHeight;

  if (eventData.price > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Fee:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`₹${eventData.price}`, 50, yPos);
    yPos += lineHeight;
  }

  yPos += 5;

  // Registration Details Section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Registration Details', 14, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);

  // Registration ID
  doc.setFont('helvetica', 'bold');
  doc.text('Registration ID:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(registrationData._id || 'Pending', 50, yPos);
  yPos += lineHeight;

  // Team/Solo name
  if (registrationData.teamName) {
    doc.setFont('helvetica', 'bold');
    doc.text('Team Name:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(registrationData.teamName, 50, yPos);
    yPos += lineHeight;
  }

  // Registered date
  doc.setFont('helvetica', 'bold');
  doc.text('Registered On:', 14, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(registrationData.registeredAt || Date.now()).toLocaleString(), 50, yPos);
  yPos += lineHeight;

  yPos += 5;

  // Team Members Table
  if (registrationData.members && registrationData.members.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Team Members', 14, yPos);
    yPos += 5;

    const tableData = registrationData.members.map((member, index) => [
      index + 1,
      member.name || 'N/A',
      member.email || 'N/A',
      member.phone || 'N/A',
      member.college || 'N/A'
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['#', 'Name', 'Email', 'Phone', 'College']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [60, 60, 60]
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 14, right: 14 }
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // Payment Status
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Payment Status', 14, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const paymentStatus = registrationData.paid ? 'PAID' : (registrationData.paymentStatus || 'PENDING');
  const statusColor = paymentStatus === 'PAID' ? [34, 197, 94] : 
                      paymentStatus === 'verified' ? [34, 197, 94] :
                      paymentStatus === 'rejected' ? [239, 68, 68] : [251, 191, 36];
  
  doc.setTextColor(...statusColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`Status: ${paymentStatus.toUpperCase()}`, 14, yPos);
  yPos += lineHeight;

  if (eventData.price > 0 && !registrationData.paid) {
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text('Please complete payment and upload proof for verification.', 14, yPos);
    yPos += lineHeight;
  }

  // Important Notes
  yPos += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Important Notes', 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  const notes = [
    '• Please bring a valid ID card on the day of the event',
    '• Arrive 15 minutes before the event start time',
    '• This confirmation serves as your entry pass',
    '• For any queries, contact: teamvortexnce@gmail.com',
    '• Follow us on Instagram: @teamvortex_nce'
  ];

  notes.forEach(note => {
    doc.text(note, 14, yPos);
    yPos += 6;
  });

  // Footer
  const footerY = pageHeight - 25;
  doc.setFillColor(59, 130, 246);
  doc.rect(0, footerY, pageWidth, 25, 'F');

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('Team Vortex - Navkis College of Engineering', pageWidth / 2, footerY + 10, { align: 'center' });
  doc.text('Email: teamvortexnce@gmail.com | Instagram: @teamvortex_nce', pageWidth / 2, footerY + 17, { align: 'center' });

  return doc;
};

/**
 * Generate admin registration report PDF
 * Works on all devices including iOS and Android
 */
export const generateAdminReportPDF = (event) => {
  if (!event.registrations || event.registrations.length === 0) {
    throw new Error('No registrations to export');
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Add Team Vortex branding header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('TEAM VORTEX', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('REGISTRATION REPORT', pageWidth / 2, 25, { align: 'center' });

  // Event Details
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(`Event: ${event.title}`, 14, 45);
  doc.text(`Date: ${new Date(event.date).toLocaleDateString()}`, 14, 52);
  doc.text(`Total Registrations: ${event.registrations.length}`, 14, 59);
  doc.text(`Exported On: ${new Date().toLocaleString()}`, 14, 66);

  // Registrations Table
  const tableColumn = ['Team/Lead', 'Email', 'Phone', 'Participants', 'Payment'];
  const tableRows = [];

  event.registrations.forEach(r => {
    tableRows.push([
      r.teamName || r.members[0]?.name || 'N/A',
      r.members[0]?.email || 'N/A',
      r.members[0]?.phone || 'N/A',
      r.members?.length || 0,
      r.paid ? 'PAID' : (r.paymentStatus || 'PENDING')
    ]);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 75,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 75 }
  });

  return doc;
};

/**
 * Download PDF with proper mobile support
 * Works on iOS, Android, and desktop browsers
 */
export const downloadPDF = (doc, filename) => {
  try {
    // For mobile devices (iOS/Android), use blob and create download link
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } else {
      // Desktop browsers - use standard save
      doc.save(filename);
    }
    return true;
  } catch (error) {
    console.error('PDF download error:', error);
    return false;
  }
};
