import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create nodemailer transporter
let transporter = null;

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (smtpHost && smtpUser) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort || '2525'),
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
}

/**
 * Send an email notification
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body
 */
export async function sendEmail({ to, subject, text, html }) {
  const from = process.env.SMTP_FROM || 'noreply@jobboard.local';

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html
      });
      console.log(`📧 Email notification sent to: ${to} (Subject: "${subject}")`);
      return true;
    } catch (err) {
      console.error(`❌ Failed to send email to ${to}:`, err.message);
    }
  }

  // Fallback / Demo Console Logging (Always active if SMTP is not set up)
  console.log(`
┌──────────────────────────────────────────────────────────┐
│ 📧 EMAIL NOTIFICATION SIMULATION                        │
├──────────────────────────────────────────────────────────┤
│ From:    ${from}
│ To:      ${to}
│ Subject: ${subject}
├──────────────────────────────────────────────────────────┤
│ Text:    ${text}
└──────────────────────────────────────────────────────────┘
  `);
  return true;
}

/**
 * Send job application success email to candidate
 */
export async function sendApplicationSuccessEmail(candidateEmail, candidateName, jobTitle, companyName) {
  const subject = `Application Received: ${jobTitle} at ${companyName}`;
  const text = `Hi ${candidateName},\n\nYour application for the position of ${jobTitle} at ${companyName} has been successfully submitted! We have notified the employer.\n\nBest of luck,\nThe Job Board Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
      <h2 style="color: #4F46E5;">Application Successful!</h2>
      <p>Hi <strong>${candidateName}</strong>,</p>
      <p>Your application for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully submitted!</p>
      <p>The employer has been notified and will review your profile. You will receive updates directly here.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">This is an automated notification from the Job Board Team.</p>
    </div>
  `;
  return await sendEmail({ to: candidateEmail, subject, text, html });
}

/**
 * Send new application notification to employer
 */
export async function sendEmployerNotificationEmail(employerEmail, employerName, candidateName, jobTitle) {
  const subject = `New Application for ${jobTitle}`;
  const text = `Hi ${employerName},\n\nYou have received a new job application for your posting "${jobTitle}" from ${candidateName}. Log in to your dashboard to review their resume and cover letter.\n\nBest regards,\nThe Job Board Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
      <h2 style="color: #4F46E5;">New Candidate Application</h2>
      <p>Hi <strong>${employerName}</strong>,</p>
      <p>You have received a new job application for your posting "<strong>${jobTitle}</strong>" from <strong>${candidateName}</strong>.</p>
      <p>Please log in to your Employer Dashboard to review their application, cover letter, and resume.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">This is an automated notification from the Job Board Team.</p>
    </div>
  `;
  return await sendEmail({ to: employerEmail, subject, text, html });
}

/**
 * Send application status update notification to candidate
 */
export async function sendStatusUpdateEmail(candidateEmail, candidateName, jobTitle, companyName, newStatus) {
  const subject = `Application Update: ${jobTitle} at ${companyName}`;
  const text = `Hi ${candidateName},\n\nThe status of your application for ${jobTitle} at ${companyName} has been updated to: ${newStatus}.\n\nBest regards,\nThe Job Board Team`;
  
  let statusColor = '#4F46E5';
  if (newStatus === 'Accepted') statusColor = '#10B981';
  if (newStatus === 'Rejected') statusColor = '#EF4444';
  if (newStatus === 'Interviewing') statusColor = '#F59E0B';

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #333;">
      <h2 style="color: #4F46E5;">Application Status Update</h2>
      <p>Hi <strong>${candidateName}</strong>,</p>
      <p>The status of your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated to:</p>
      <div style="display: inline-block; padding: 8px 16px; background-color: ${statusColor}15; color: ${statusColor}; border-radius: 4px; font-weight: bold; font-size: 16px; margin: 10px 0;">
        ${newStatus}
      </div>
      <p>Please log in to your Candidate Dashboard to view more details.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">This is an automated notification from the Job Board Team.</p>
    </div>
  `;
  return await sendEmail({ to: candidateEmail, subject, text, html });
}
