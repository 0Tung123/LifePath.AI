import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../user/users.service';
import { ConfigService } from '@nestjs/config';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
interface GoogleUser {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    accessToken: string;
}
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    private passwordResetTokenRepository;
    private mailService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService, passwordResetTokenRepository: Repository<PasswordResetToken>, mailService: MailService);
    register(registerDto: RegisterDto): Promise<any>;
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
    }>;
    forgotPassword(email: string): Promise<any>;
    resetPassword(token: string, password: string): Promise<any>;
    verifyEmail(token: string): Promise<any>;
    resendVerificationEmail(email: string): Promise<any>;
    validateOrCreateGoogleUser(googleUser: GoogleUser): Promise<any>;
}
export {};
