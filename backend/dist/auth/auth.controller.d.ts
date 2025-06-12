import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
export declare class AuthController {
    private authService;
    private configService;
    constructor(authService: AuthService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<any>;
    login(req: any): Promise<{
        access_token: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<any>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any>;
    verifyEmail(token: string): Promise<any>;
    resendVerification(resendVerificationDto: ResendVerificationDto): Promise<any>;
    googleAuth(): void;
    googleAuthRedirect(req: any, res: Response): Promise<void>;
    getProfile(req: any): Promise<any>;
}
