import { transporter, mailConfig } from '../config/mail.js';
import { logger } from '../config/logger.js';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export class EmailService {
  /**
   * Send email
   */
  static async send(options: EmailOptions): Promise<boolean> {
    try {
      const info = await transporter.sendMail({
        from: options.from || mailConfig.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      logger.info('Email sent successfully:', {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email:', {
        error,
        to: options.to,
        subject: options.subject,
      });
      return false;
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcome(email: string, name: string): Promise<boolean> {
    return this.send({
      to: email,
      subject: 'Welcome to __PROJECT_NAME__!',
      html: `
        <h1>Welcome, ${name}!</h1>
        <p>Thank you for joining __PROJECT_NAME__.</p>
        <p>We're excited to have you on board!</p>
      `,
      text: `Welcome, ${name}! Thank you for joining __PROJECT_NAME__. We're excited to have you on board!`,
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.WEB_URL}/reset-password?token=${resetToken}`;

    return this.send({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      text: `You requested a password reset. Visit this link to reset your password: ${resetUrl}. This link will expire in 1 hour.`,
    });
  }
}
