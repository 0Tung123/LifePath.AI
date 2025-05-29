import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'firstName',
        'lastName',
        'isActive',
        'emailVerificationToken',
        'emailVerificationExpires',
        'resetPasswordToken',
        'resetPasswordExpires',
      ],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { emailVerificationToken: token },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'isActive',
        'emailVerificationToken',
        'emailVerificationExpires',
      ],
    });
  }

  async update(userId: string, updatedUser: Partial<User>): Promise<any> {
    await this.usersRepository.update(userId, updatedUser);
    return { message: `User with id ${userId} updated successfully` };
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
  }
}
