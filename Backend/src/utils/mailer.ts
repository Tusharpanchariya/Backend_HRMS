import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// ------------------------
// Create transporter using SendGrid Web API
// ------------------------
export const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    api_key: process.env.EMAIL_PASS as string, // SendGrid API Key
  } as any, // nodemailer SendGrid typing workaround
});

// ------------------------
// Connection check (API doesn’t support verify())
// ------------------------
console.log("SendGrid transporter ready ✅");

// ------------------------
// Send credentials email
// ------------------------
export const sendCredentialsEmail = async (to: string, name: string, password: string) => {
  const mailOptions = {
    from: `"HRMS Team" <${process.env.EMAIL_FROM}>`, // must be verified sender in SendGrid
    to,
    subject: 'Welcome to HRMS - Your Login Credentials',
    html: `<div>Hi ${name}, your password is <strong>${password}</strong></div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Credentials email sent to ${to} ✅`);
  } catch (err) {
    console.error(`Failed to send credentials email to ${to} ❌`, err);
  }
};

// ------------------------
// Send leave status email
// ------------------------
export const sendLeaveStatusEmail = async (
  to: string,
  name: string,
  status: 'APPROVED' | 'REJECTED',
  startDate: Date,
  endDate: Date,
  leaveReason?: string
) => {
  const subject =
    status === 'APPROVED'
      ? 'Your Leave Request has been Approved'
      : 'Your Leave Request has been Rejected';

  const message =
    status === 'APPROVED'
      ? 'Your leave request has been approved. Thank you.'
      : 'Your leave request has been rejected. Thank you.';

  const mailOptions = {
    from: `"HRMS Team" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Hi ${name},</h2>
        <p>${message}</p>
        <p><strong>Leave Period:</strong> ${startDate.toDateString()} - ${endDate.toDateString()}</p>
        ${leaveReason ? `<p><strong>Reason:</strong> ${leaveReason}</p>` : ""}
        <p>Best regards,<br/>HRMS Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Leave status email sent to ${to} ✅`);
  } catch (err) {
    console.error(`Failed to send leave status email to ${to} ❌`, err);
  }
};

// ------------------------
// Send birthday email
// ------------------------
export const sendBirthdayEmail = async (to: string, name: string) => {
  const subject = `🎉 Happy Birthday ${name}! 🎂`;
  const html = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
      <h2 style="color: #2E9DA6;">Happy Birthday, ${name}! 🎉</h2>
      <p>Wishing you joy, success, and good health from all of us at <strong>Your Company</strong>.</p>
      <p style="color: #555;">Have an amazing day! 🥳</p>
      <p>Best regards,<br/>HRMS Team</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"HRMS Team" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    console.log(`Birthday email sent to ${to} ✅`);
  } catch (err) {
    console.error(`Failed to send birthday email to ${to} ❌`, err);
  }
};
