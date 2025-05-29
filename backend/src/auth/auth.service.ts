import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../user/users.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { Repository } from 'typeorm';
import { MailService } from 'src/mail/mail.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { User } from '../user/entities/user.entity';

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

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User();
    newUser.email = email;
    newUser.password = hashedPassword;
    newUser.firstName = firstName;
    newUser.lastName = lastName;

    await this.usersService.create(newUser);

    return { message: 'User registered successfully' };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
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

    await this.mailService.sendEmail(
      email,
      'Password Reset Request',
      `Please click the following link to reset your password: ${resetLink}`,
    );

    return { message: `Password reset link sent to ${email}` };
  }

  async resetPassword(token: string, password: string): Promise<any> {
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
    await this.usersService.update(parseInt(user.id), user);

    await this.passwordResetTokenRepository.remove(passwordResetToken);

    return { message: 'Password reset successfully' };
  }
}