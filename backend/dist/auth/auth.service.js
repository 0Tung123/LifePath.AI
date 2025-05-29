"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../user/users.service");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
const typeorm_1 = require("@nestjs/typeorm");
const password_reset_token_entity_1 = require("./entities/password-reset-token.entity");
const typeorm_2 = require("typeorm");
const mail_service_1 = require("../mail/mail.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    constructor(usersService, jwtService, configService, passwordResetTokenRepository, mailService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.mailService = mailService;
    }
    async validateUser(username, pass) {
        const user = await this.usersService.findOne(username);
        if (user && user.password === pass) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        const payload = { username: user.username, sub: user.userId };
        return {
            access_token: await this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRES_IN'),
            }),
        };
    }
    async forgotPassword(email) {
        const user = await this.usersService.findOne(email);
        if (!user) {
            return { message: 'User not found' };
        }
        const resetToken = (0, uuid_1.v4)();
        const resetLink = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
        const passwordResetToken = this.passwordResetTokenRepository.create({
            email: email,
            token: resetToken,
        });
        await this.passwordResetTokenRepository.save(passwordResetToken);
        await this.mailService.sendEmail(email, 'Password Reset Request', `Please click the following link to reset your password: ${resetLink}`);
        return { message: `Password reset link sent to ${email}` };
    }
    async resetPassword(token, password) {
        const passwordResetToken = await this.passwordResetTokenRepository.findOne({ where: { token } });
        if (!passwordResetToken) {
            return { message: 'Invalid reset token' };
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = await this.usersService.findOne(passwordResetToken.email);
        if (!user) {
            return { message: 'User not found' };
        }
        user.password = hashedPassword;
        await this.usersService.update(user.userId, user);
        await this.passwordResetTokenRepository.remove(passwordResetToken);
        return { message: 'Password reset successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(password_reset_token_entity_1.PasswordResetToken)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        typeorm_2.Repository,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map