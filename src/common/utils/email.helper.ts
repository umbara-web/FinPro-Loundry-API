import { transporter } from './nodemailer';
import { GMAIL_EMAIL } from '../../configs/env.config';

export async function sendVerificationEmail(
  to: string,
  name: string,
  verificationLink: string
) {
  const mailOptions = {
    from: GMAIL_EMAIL,
    to,
    subject: 'Verify Your Email - Laundry App',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #2563eb, #1d4ed8); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to Laundry App</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for registering! Please verify your email address to complete your registration and set your password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email & Set Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hours.</p>
          <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Laundry App. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendResetPasswordEmail(
  to: string,
  name: string,
  resetLink: string
) {
  const mailOptions = {
    from: GMAIL_EMAIL,
    to,
    subject: 'Reset Your Password - Laundry App',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #2563eb, #1d4ed8); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Reset Password</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p>Hi <strong>${name}</strong>,</p>
          <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Laundry App. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendComplaintStatusEmail(
  to: string,
  name: string,
  complaintId: string,
  status: string,
  orderId: string
) {
  const statusLabels: Record<string, string> = {
    IN_REVIEW: 'Sedang Ditinjau',
    RESOLVED: 'Diselesaikan',
    REJECTED: 'Ditolak',
  };

  const statusColors: Record<string, string> = {
    IN_REVIEW: '#eab308', // Yellow
    RESOLVED: '#22c55e', // Green
    REJECTED: '#ef4444', // Red
  };

  const label = statusLabels[status] || status;
  const color = statusColors[status] || '#2563eb';

  const mailOptions = {
    from: GMAIL_EMAIL,
    to,
    subject: `Update Komplain #${complaintId.slice(0, 8)} - Laundry App`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #2563eb, #1d4ed8); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Update Status Komplain</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p>Halo <strong>${name}</strong>,</p>
          <p>Status komplain Anda untuk Pesanan <strong>#${orderId.slice(
            0,
            8
          )}</strong> telah diperbarui menjadi:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="background-color: ${color}; color: white; padding: 12px 30px; border-radius: 50px; font-weight: bold; font-size: 16px;">
              ${label}
            </span>
          </div>

          <p>Silakan cek detail komplain di aplikasi untuk informasi lebih lanjut.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Laundry App. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
