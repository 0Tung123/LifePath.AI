"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const welcome_template_1 = require("./templates/welcome.template");
const verify_email_template_1 = require("./templates/verify-email.template");
const reset_password_template_1 = require("./templates/reset-password.template");
let MailService = class MailService {
    constructor(mailerService) {
        this.mailerService = mailerService;
    }
    async sendEmail(to, subject, text, html) {
        await this.mailerService.sendMail({
            to: to,
            subject: subject,
            text: text,
            html: html || text,
        });
    }
    async sendWelcomeEmail(to, firstName) {
        const subject = 'Welcome to Our Platform';
        const text = `Hello ${firstName}, welcome to our platform!`;
        const html = (0, welcome_template_1.welcomeTemplate)(firstName);
        await this.sendEmail(to, subject, text, html);
    }
    async sendVerificationEmail(to, firstName, verificationLink) {
        const subject = 'Verify Your Email';
        const text = `Hello ${firstName}, please verify your email by clicking this link: ${verificationLink}`;
        const html = (0, verify_email_template_1.verifyEmailTemplate)(firstName, verificationLink);
        await this.sendEmail(to, subject, text, html);
    }
    async sendPasswordResetEmail(to, resetLink) {
        const subject = 'Password Reset Request';
        const text = `Please click the following link to reset your password: ${resetLink}`;
        const html = (0, reset_password_template_1.resetPasswordTemplate)(resetLink);
        await this.sendEmail(to, subject, text, html);
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService])
], MailService);
//# sourceMappingURL=mail.service.js.map