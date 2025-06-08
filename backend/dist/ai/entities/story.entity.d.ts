import { User } from '../../user/entities/user.entity';
import { StoryType } from '../prompt.service';
export declare class Story {
    id: string;
    type: StoryType;
    content: string;
    metadata: Record<string, any>;
    user: User;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
