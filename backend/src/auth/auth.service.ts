import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../user/users.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { User } from '../user/entities/user.entity';

// Interface for Google user
interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findOne(email);
    if (existingUser) {
      return {
        message: 'User with this email already exists',
        statusCode: 400,
      };
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate email verification token
    const emailVerificationToken = uuidv4();
    const expiresIn = 24; // hours
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(
      emailVerificationExpires.getHours() + expiresIn,
    );

    const newUser = new User();
    newUser.email = email;
    newUser.password = hashedPassword;
    newUser.firstName = firstName;
    newUser.lastName = lastName;
    newUser.isActive = false;
    newUser.emailVerificationToken = emailVerificationToken;
    newUser.emailVerificationExpires = emailVerificationExpires;

    const user = await this.usersService.create(newUser);

    // Create verification link
    const verificationLink = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${emailVerificationToken}`;

    // Send verification email
    await this.mailService.sendVerificationEmail(
      user.email,
      user.firstName ?? '',
      verificationLink,
    );

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      }),
    };
  }

  async forgotPassword(email: string): Promise<any> {
    const user = await this.usersService.findOne(email);

    if (!user) {
      return { message: 'User not found' };
    }

    const resetToken = uuidv4();
    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    const passwordResetToken = this.passwordResetTokenRepository.create({
      email: email,
      token: resetToken,
    });

    await this.passwordResetTokenRepository.save(passwordResetToken);

    await this.mailService.sendPasswordResetEmail(email, resetLink);

    return { message: `Password reset link sent to ${email}` };
  }

  async resetPassword(token: string, password: string): Promise<any> {
    const passwordResetToken = await this.passwordResetTokenRepository.findOne({
      where: { token },
    });

    if (!passwordResetToken) {
      return { message: 'Invalid reset token', statusCode: 400 };
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await this.usersService.findOne(passwordResetToken.email);

    if (!user) {
      return { message: 'User not found', statusCode: 404 };
    }

    user.password = hashedPassword;
    await this.usersService.update(user.id, user);

    await this.passwordResetTokenRepository.remove(passwordResetToken);

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string): Promise<any> {
    const user = await this.usersService.findByVerificationToken(token);

    if (!user) {
      return { message: 'Invalid verification token', statusCode: 400 };
    }

    // Check if token is expired
    if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires < new Date()
    ) {
      return { message: 'Verification token has expired', statusCode: 400 };
    }

    // Activate user account
    user.isActive = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await this.usersService.update(user.id, user);

    // Send welcome email after verification
    await this.mailService.sendWelcomeEmail(user.email, user.firstName ?? '');

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string): Promise<any> {
    const user = await this.usersService.findOne(email);

    if (!user) {
      return { message: 'User not found', statusCode: 404 };
    }

    if (user.isActive) {
      return { message: 'Email is already verified', statusCode: 400 };
    }

    // Generate new verification token
    const emailVerificationToken = uuidv4();
    const expiresIn = 24; // hours
    const emailVerificationExpires = new Date();
    emailVerificationExpires.setHours(
      emailVerificationExpires.getHours() + expiresIn,
    );

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;

    await this.usersService.update(user.id, user);

    // Create verification link
    const verificationLink = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${emailVerificationToken}`;

    // Send verification email
    await this.mailService.sendVerificationEmail(
      user.email,
      user.firstName ?? '',
      verificationLink,
    );

    return { message: 'Verification email sent successfully' };
  }

  async validateOrCreateGoogleUser(googleUser: GoogleUser): Promise<any> {
    let user = await this.usersService.findOne(googleUser.email);

    if (!user) {
      // Create a new user with Google information
      const newUser = new User();
      newUser.email = googleUser.email;
      newUser.firstName = googleUser.firstName;
      newUser.lastName = googleUser.lastName;
      newUser.isActive = true; // Google accounts are pre-verified
      newUser.googleId = googleUser.accessToken;
      newUser.profilePicture = googleUser.picture;

      // Generate a random password for the user (they won't use it)
      const randomPassword = Math.random().toString(36).slice(-8);
      const saltRounds = 10;
      newUser.password = await bcrypt.hash(randomPassword, saltRounds);

      user = await this.usersService.create(newUser);

      // Send welcome email to Google user
      await this.mailService.sendWelcomeEmail(user.email, user.firstName ?? '');
    } else {
      // Update existing user with Google information if needed
      user.googleId = googleUser.accessToken;
      user.isActive = true; // Ensure the user is active

      // Only update profile picture if user doesn't have one
      if (!user.profilePicture) {
        user.profilePicture = googleUser.picture;
      }

      await this.usersService.update(user.id, user);
    }

    return this.login(user);
  }
}
