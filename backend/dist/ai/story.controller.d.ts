import { StoryService } from './story.service';
import { StoryType } from './prompt.service';
declare class CreateStoryDto {
    type: StoryType;
    userChoice: string;
}
declare class ContinueStoryDto {
    storyId: string;
    userChoice: string;
}
export declare class StoryController {
    private storyService;
    constructor(storyService: StoryService);
    createStory(req: any, createStoryDto: CreateStoryDto): Promise<import("./entities/story.entity").Story>;
    continueStory(continueStoryDto: ContinueStoryDto): Promise<import("./entities/story.entity").Story>;
    getStoryTypes(): {
        types: {
            id: StoryType;
            name: string;
        }[];
    };
    getMyStories(req: any): Promise<import("./entities/story.entity").Story[]>;
    getStory(id: string): Promise<import("./entities/story.entity").Story>;
}
export {};
