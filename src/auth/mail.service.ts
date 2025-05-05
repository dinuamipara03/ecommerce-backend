import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'amiparadinu@gmail.com',
      pass: 'fejr ovwl wujg naia',
    },
  });

  async sendResetLink(email: string, token: string) {
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset your password',
      html: `<p>Click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
    });
  }
}
