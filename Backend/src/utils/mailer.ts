import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends login credentials email to newly registered users.
 * @param to - Recipient email address
 * @param name - User's name
 * @param password - Auto-generated password
 */
export const sendCredentialsEmail = async (
  to: string,
  name: string,
  password: string
) => {
  const mailOptions = {
    from: `"HRMS Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to HRMS - Your Login Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Hi ${name},</h2>
        <p>Welcome to <strong>HRMS Platform</strong>! Your account has been successfully created.</p>
        
        <h4 style="margin-top: 20px;">Here are your login credentials:</h4>
        <ul style="background-color: #f4f4f4; padding: 15px; border-radius: 6px;">
          <li><strong>Email:</strong> ${to}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>

        <p style="margin-top: 20px;">Please login and change your password after your first login for better security.</p>

        <p>Best regards,<br/>HRMS Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Sends leave status update email to employee
 * @param to - Recipient email address
 * @param name - Employee's name
 * @param status - Leave status ("APPROVED" | "REJECTED")
 */
export const sendLeaveStatusEmail = async (
to: string, name: string, status: 'APPROVED' | 'REJECTED', startDate: Date, endDate: Date, leaveReason: any) => {
  const subject =
    status === 'APPROVED'
      ? 'Your Leave Request has been Approved'
      : 'Your Leave Request has been Rejected';

  const message =
    status === 'APPROVED'
      ? 'Your leave request has been approved. Thank you.'
      : 'Your leave request has been rejected. Thank you.';

  const mailOptions = {
    from: `"HRMS Team" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Hi ${name},</h2>
        <p>${message}</p>
        <p>Best regards,<br/>HRMS Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
/**
 * Sends birthday wishes to an employee
 * @param to - Employee's personal email
 * @param name - Employee's full name
 */
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

  await transporter.sendMail({
    from: `"HRMS Team" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};