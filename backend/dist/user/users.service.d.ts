import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(user: User): Promise<User>;
    findOne(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findByVerificationToken(token: string): Promise<User | null>;
    update(userId: string, updatedUser: Partial<User>): Promise<any>;
    findAll(): Promise<User[]>;
}
