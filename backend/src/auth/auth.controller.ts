import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './google.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({
    status: 400,
    description: 'User with this email already exists',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'user@example.com',
          description: 'User email',
        },
        password: {
          type: 'string',
          example: 'password123',
          description: 'User password',
        },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'JWT token for authentication',
        },
        user: {
          type: 'object',
          description: 'User information',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(req.user);

    // Set JWT cookie
    res.cookie('jwt', result.access_token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return result;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset link sent' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid reset token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address (GET)' })
  @ApiQuery({ name: 'token', description: 'Email verification token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid verification token or token expired',
  })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address (POST)' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid verification token or token expired',
  })
  async verifyEmailPost(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiBody({ type: ResendVerificationDto })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
  })
  @ApiResponse({ status: 400, description: 'Email is already verified' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto,
  ) {
    return this.authService.resendVerificationEmail(
      resendVerificationDto.email,
    );
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Login with Google' })
  @ApiResponse({ status: 302, description: 'Redirects to Google login page' })
  googleAuth() {
    // This route will redirect to Google OAuth
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiExcludeEndpoint() // Hide from Swagger docs
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const { access_token } = await this.authService.validateOrCreateGoogleUser(
      req.user,
    );

    // Redirect to frontend with token
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    return res.redirect(
      `${frontendUrl}/auth/google-callback?token=${access_token}`,
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear JWT cookie
    res.clearCookie('jwt');
    return { message: 'Successfully logged out' };
  }

  @Get('status')
  @ApiOperation({ summary: 'Check authentication status' })
  @ApiResponse({
    status: 200,
    description: 'Returns authentication status',
    schema: {
      type: 'object',
      properties: {
        isAuthenticated: {
          type: 'boolean',
          description: 'Whether the user is authenticated',
        },
        user: {
          type: 'object',
          description: 'User information if authenticated',
        },
      },
    },
  })
  async checkAuthStatus(@Req() req) {
    try {
      // Extract JWT from cookie
      const token = req.cookies?.jwt;

      if (!token) {
        return { isAuthenticated: false };
      }

      // Verify token manually
      const decoded = await this.authService.verifyToken(token);

      if (decoded) {
        return {
          isAuthenticated: true,
          user: {
            id: decoded.userId,
            email: decoded.email,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            isActive: decoded.isActive,
            profilePicture: decoded.profilePicture,
            geminiApiKey: decoded.geminiApiKey,
            createdAt: decoded.createdAt,
            updatedAt: decoded.updatedAt,
          },
        };
      }

      return { isAuthenticated: false };
    } catch (error) {
      console.error('Auth status check error:', error);
      return { isAuthenticated: false };
    }
  }
}
