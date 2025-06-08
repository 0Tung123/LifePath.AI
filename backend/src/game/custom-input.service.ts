import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameSession } from './entities/game-session.entity';
import { Character } from './entities/character.entity';
import { StoryNode } from './entities/story-node.entity';
import { Choice } from './entities/choice.entity';
import { GeminiAiService } from './gemini-ai.service';
import { MemoryService } from '../memory/memory.service';
import { PermadeathService } from './permadeath.service';
import { ConsequenceService } from './consequence.service';
import { MemoryType } from '../memory/entities/memory-record.entity';
import { InputType } from './dto/custom-input.dto';

@Injectable()
export class CustomInputService {
  constructor(
    @InjectRepository(GameSession)
    private gameSessionRepository: Repository<GameSession>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(StoryNode)
    private storyNodeRepository: Repository<StoryNode>,
    @InjectRepository(Choice)
    private choiceRepository: Repository<Choice>,
    private geminiAiService: GeminiAiService,
    private memoryService: MemoryService,
    private permadeathService: PermadeathService,
    private consequenceService: ConsequenceService,
  ) {}

  async processCustomInput(
    gameSessionId: string,
    inputType: InputType,
    content: string,
    target?: string,
  ): Promise<GameSession> {
    // Get the game session with details
    const gameSession = await this.gameSessionRepository.findOne({
      where: { id: gameSessionId },
      relations: ['character', 'currentStoryNode'],
    });

    if (!gameSession) {
      throw new NotFoundException(
        `Game session with ID ${gameSessionId} not found`,
      );
    }

    if (!gameSession.isActive) {
      throw new BadRequestException('This game session is no longer active');
    }

    const character = gameSession.character;

    // Check if character is dead
    if (character.isDead) {
      throw new BadRequestException(
        'This character is dead and cannot perform actions',
      );
    }

    // Calculate current danger level for permadeath evaluation
    const dangerLevel =
      await this.permadeathService.calculateCurrentDangerLevel(gameSessionId);

    // Process based on input type
    const formattedInput = this.formatInputBasedOnType(
      inputType,
      content,
      character.name,
      target,
    );

    // Generate response from AI
    const nextStoryNode = await this.generateResponseToCustomInput(
      gameSession,
      character,
      formattedInput,
      inputType,
    );

    // Save the story node
    const savedStoryNode = await this.storyNodeRepository.save(nextStoryNode);

    // Update game session with new story node
    gameSession.currentStoryNodeId = savedStoryNode.id;
    gameSession.currentStoryNode = savedStoryNode;
    gameSession.lastSavedAt = new Date();

    await this.gameSessionRepository.save(gameSession);

    // Create a memory of this input if it's significant
    if (inputType === InputType.ACTION || inputType === InputType.SPEECH) {
      await this.memoryService.createMemory({
        characterId: character.id,
        title: inputType === InputType.ACTION ? 'Action Taken' : 'Conversation',
        content: `${inputType === InputType.ACTION ? 'You performed: ' : 'You said: '} ${content}`,
        type:
          inputType === InputType.ACTION
            ? MemoryType.ACTION
            : MemoryType.CONVERSATION,
        importance: 0.6, // Medium importance
      });
    }

    // Evaluate for permadeath if it's an action
    if (inputType === InputType.ACTION && gameSession.permadeathEnabled) {
      const deathEvaluation =
        await this.permadeathService.evaluateLethalSituation(
          gameSessionId,
          content,
          dangerLevel,
        );

      // If character died, update gameSession to reflect that
      if (deathEvaluation.died) {
        // Refresh gameSession to get latest state after death processing
        const updatedSession = await this.gameSessionRepository.findOne({
          where: { id: gameSessionId },
          relations: ['character', 'currentStoryNode'],
        });
        
        if (!updatedSession) {
          throw new NotFoundException(`Game session with ID ${gameSessionId} not found`);
        }
        
        return updatedSession;
      }
    }

    // Evaluate consequences if it's an action or speech
    if (inputType === InputType.ACTION || inputType === InputType.SPEECH) {
      const gameContext = {
        gameSessionId,
        characterId: character.id,
        currentSituation: gameSession.currentStoryNode.content,
        characterDescription: `${character.name}, a level ${character.level} ${character.characterClass}`,
      };

      await this.consequenceService.evaluateActionConsequences(
        content,
        gameContext,
      );

      // Update character's survival stats for actions
      if (inputType === InputType.ACTION) {
        if (!character.survivalStats) {
          character.survivalStats = {
            daysSurvived: 0,
            dangerousSituationsOvercome: 0,
            nearDeathExperiences: 0,
            majorDecisionsMade: 0,
          };
        }

        character.survivalStats.majorDecisionsMade++;

        if (dangerLevel >= 7) {
          character.survivalStats.dangerousSituationsOvercome++;
        }

        await this.characterRepository.save(character);
      }
    }

    return gameSession;
  }

  private formatInputBasedOnType(
    type: InputType,
    content: string,
    characterName: string,
    target?: string,
  ): string {
    switch (type) {
      case InputType.ACTION:
        return `${characterName} decides to ${content}.`;
      case InputType.THOUGHT:
        return `${characterName} thinks to themself: "${content}"`;
      case InputType.SPEECH:
        if (target) {
          return `${characterName} says to ${target}: "${content}"`;
        }
        return `${characterName} says: "${content}"`;
      case InputType.CUSTOM:
      default:
        return content;
    }
  }

  private async generateResponseToCustomInput(
    gameSession: GameSession,
    character: Character,
    formattedInput: string,
    inputType: InputType,
  ): Promise<StoryNode> {
    const currentNode = gameSession.currentStoryNode;

    // Create context for the AI
    const contextPrompt = `
      Current situation: ${currentNode.content}
      
      Character: ${character.name}, a ${character.characterClass} (Level ${character.level})
      
      ${formattedInput}
      
      Respond with how the world and NPCs react to this ${inputType}. Be descriptive and engaging.
      Then, provide 4 possible choices for what ${character.name} could do next.
      
      Format your response as follows:
      [NARRATIVE]
      Your detailed narrative response here, describing what happens after the ${inputType}.
      [/NARRATIVE]
      
      [CHOICES]
      1. First choice option
      2. Second choice option
      3. Third choice option
      4. Custom action...
      [/CHOICES]
    `;

    const aiResponse =
      await this.geminiAiService.generateContent(contextPrompt);

    // Extract narrative and choices
    const narrativeMatch: RegExpMatchArray | null = aiResponse.match(
      /\[NARRATIVE\]([\s\S]*?)\[\/NARRATIVE\]/,
    );
    const choicesMatch: RegExpMatchArray | null = aiResponse.match(/\[CHOICES\]([\s\S]*?)\[\/CHOICES\]/);

    const narrative: string = narrativeMatch && narrativeMatch[1] ? narrativeMatch[1].trim() : aiResponse;
    let choicesText: string = choicesMatch && choicesMatch[1] ? choicesMatch[1].trim() : '';

    // If no choices format found, generate default choices
    if (!choicesText) {
      choicesText =
        '1. Continue\n2. Investigate further\n3. Talk to someone\n4. Custom action...';
    }

    // Create new story node
    const storyNode = new StoryNode();
    storyNode.gameSessionId = gameSession.id;
    storyNode.content = narrative;
    storyNode.isRoot = false;
    storyNode.parentNodeId = currentNode.id;
    storyNode.metadata = {
      inputType,
      userInput: formattedInput,
    };
    storyNode.createdAt = new Date();

    // Save the story node first to get its ID
    const savedNode = await this.storyNodeRepository.save(storyNode);

    // Create choices
    const choiceLines = choicesText
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => line.replace(/^\d+\.\s*/, '').trim());

    // Ensure we have at least one choice
    if (choiceLines.length === 0) {
      choiceLines.push('Continue');
      choiceLines.push('Do something else');
      choiceLines.push('Talk to someone');
      choiceLines.push('Custom action...');
    }

    // Create and save choice entities
    const choices = choiceLines.map((choiceText, index) => {
      const choice = new Choice();
      choice.storyNodeId = savedNode.id;
      choice.text = choiceText;
      choice.order = index;

      // If it's the "Custom action" choice, mark it
      if (choiceText.toLowerCase().includes('custom action')) {
        choice.metadata = { isCustomAction: true };
      }

      return choice;
    });

    await this.choiceRepository.save(choices);

    // Add choices to the story node
    savedNode.choices = choices;

    return savedNode;
  }
}
