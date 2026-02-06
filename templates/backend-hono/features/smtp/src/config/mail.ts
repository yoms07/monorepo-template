import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { z } from 'zod';
import { logger } from './logger.js';

// Validate SMTP environment variables
const smtpEnvSchema = z.object({
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().default('noreply@example.com'),
});

const smtpEnv = smtpEnvSchema.parse(process.env);

export const transporter: Transporter = nodemailer.createTransporter({
  host: smtpEnv.SMTP_HOST,
  port: smtpEnv.SMTP_PORT,
  secure: smtpEnv.SMTP_PORT === 465,
  auth: smtpEnv.SMTP_USER && smtpEnv.SMTP_PASS ? {
    user: smtpEnv.SMTP_USER,
    pass: smtpEnv.SMTP_PASS,
  } : undefined,
});

// Verify connection
transporter.verify((error) => {
  if (error) {
    logger.error('SMTP connection failed:', error);
  } else {
    logger.info('SMTP server ready');
  }
});

export const mailConfig = {
  from: smtpEnv.SMTP_FROM,
};
