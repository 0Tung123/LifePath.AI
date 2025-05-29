import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { welcomeTemplate } from './templates/welcome.template';
import { verifyEmailTemplate } from './templates/verify-email.template';
import { resetPasswordTemplate } from './templates/reset-password.template';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    await this.mailerService.sendMail({
      to: to,
      subject: subject,
      text: text,
      html: html || text,
    });
  }

  async sendWelcomeEmail(to: string, firstName: string) {
    const subject = 'Welcome to Our Platform';
    const text = `Hello ${firstName}, welcome to our platform!`;
    const html = welcomeTemplate(firstName);

    await this.sendEmail(to, subject, text, html);
  }

  async sendVerificationEmail(
    to: string,
    firstName: string,
    verificationLink: string,
  ) {
    const subject = 'Verify Your Email';
    const text = `Hello ${firstName}, please verify your email by clicking this link: ${verificationLink}`;
    const html = verifyEmailTemplate(firstName, verificationLink);

    await this.sendEmail(to, subject, text, html);
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const subject = 'Password Reset Request';
    const text = `Please click the following link to reset your password: ${resetLink}`;
    const html = resetPasswordTemplate(resetLink);

    await this.sendEmail(to, subject, text, html);
  }
}
