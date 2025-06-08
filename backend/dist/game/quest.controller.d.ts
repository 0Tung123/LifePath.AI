import { QuestService } from './quest.service';
import { Quest, QuestStatus } from './entities/quest.entity';
export declare class QuestController {
    private readonly questService;
    constructor(questService: QuestService);
    generateQuest(data: {
        gameSessionId: string;
        trigger: string;
        triggerType: 'item' | 'location' | 'npc' | 'event';
    }): Promise<Quest>;
    getQuestsByGameSession(gameSessionId: string): Promise<Quest[]>;
    getQuestById(id: string): Promise<Quest>;
    updateQuestStatus(id: string, data: {
        status: QuestStatus;
    }): Promise<Quest>;
}
