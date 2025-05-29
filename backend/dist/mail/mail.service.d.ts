import { MailerService } from '@nestjs-modules/mailer';
export declare class MailService {
    private readonly mailerService;
    constructor(mailerService: MailerService);
    sendEmail(to: string, subject: string, text: string, html?: string): Promise<void>;
    sendWelcomeEmail(to: string, firstName: string): Promise<void>;
    sendVerificationEmail(to: string, firstName: string, verificationLink: string): Promise<void>;
    sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
}
