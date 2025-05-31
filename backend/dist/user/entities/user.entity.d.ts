import { Character } from '../../game/entities/character.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    resetPasswordToken?: string | null;
    resetPasswordExpires?: Date | null;
    emailVerificationToken?: string | null;
    emailVerificationExpires?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    googleId?: string | null;
    profilePicture?: string | null;
    geminiApiKey?: string | null;
    characters: Character[];
}
