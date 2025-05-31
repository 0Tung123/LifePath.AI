import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GameGenre } from './entities/character.entity';

@Injectable()
export class GeminiAiService {
  private readonly generativeAI: GoogleGenerativeAI;
  private readonly model: any;
  private readonly logger = new Logger(GeminiAiService.name);

  constructor() {
    // API key should be in environment variables in production
    const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
    this.generativeAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.generativeAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateStoryContent(
    prompt: string,
    gameContext: any,
  ): Promise<string> {
    try {
      const character = gameContext.character;
      if (!character) {
        throw new Error(
          'Character information is required for story generation',
        );
      }

      const primaryGenre = character.primaryGenre || GameGenre.FANTASY;
      const secondaryGenres = character.secondaryGenres || [];
      const customGenreDescription = character.customGenreDescription || '';

      // Build character info based on genres
      let characterInfo = `Character: ${character.name}, a level ${character.level} ${character.characterClass}. `;

      // Add all relevant attributes
      characterInfo += 'Attributes: ';
      const attributes = character.attributes;
      const relevantAttributes = this.getRelevantAttributes(primaryGenre, secondaryGenres);
      
      for (const attr of relevantAttributes) {
        if (attributes[attr] !== undefined) {
          characterInfo += `${this.formatAttributeName(attr)} ${attributes[attr]}, `;
        }
      }
      
      // Remove trailing comma and space
      characterInfo = characterInfo.replace(/, $/, '. ');

      // Add inventory information
      if (character.inventory && character.inventory.items) {
        characterInfo += 'Inventory: ';
        character.inventory.items.forEach((item, index) => {
          characterInfo += `${item.name} (${item.quantity})`;
          if (index < character.inventory.items.length - 1) {
            characterInfo += ', ';
          }
        });
        characterInfo += '. ';
      }

      // Add currency information
      if (character.inventory && character.inventory.currency) {
        characterInfo += 'Currency: ';
        Object.entries(character.inventory.currency).forEach(
          ([currency, amount], index, array) => {
            characterInfo += `${amount} ${currency}`;
            if (index < array.length - 1) {
              characterInfo += ', ';
            }
          },
        );
        characterInfo += '. ';
      }

      // Add skills information
      if (character.skills && character.skills.length > 0) {
        characterInfo += 'Skills: ' + character.skills.join(', ') + '. ';
      }

      // Add special abilities if any
      if (
        character.specialAbilities &&
        character.specialAbilities.length > 0
      ) {
        characterInfo += 'Special Abilities: ';
        character.specialAbilities.forEach((ability, index) => {
          characterInfo += `${ability.name} (${ability.description})`;
          if (index < character.specialAbilities.length - 1) {
            characterInfo += ', ';
          }
        });
        characterInfo += '. ';
      }

      // Add game state information
      let gameStateInfo = '';
      if (gameContext.gameState) {
        gameStateInfo = `
        Current Location: ${gameContext.gameState.currentLocation || 'Unknown'}
        Time: Day ${gameContext.gameState.time?.day || 1}, ${
          gameContext.gameState.time?.hour || 0
        }:${gameContext.gameState.time?.minute || 0}
        Weather: ${gameContext.gameState.weather || 'Clear'}
        `;

        if (
          gameContext.gameState.flags &&
          Object.keys(gameContext.gameState.flags).length > 0
        ) {
          gameStateInfo += 'Story Flags: ';
          Object.entries(gameContext.gameState.flags).forEach(
            ([flag, value]) => {
              gameStateInfo += `${flag}: ${value}, `;
            },
          );
          gameStateInfo = gameStateInfo.replace(/, $/, '\n');
        }
      }

      // Add previous choice information if available
      let previousChoiceInfo = '';
      if (gameContext.previousChoice) {
        previousChoiceInfo = `The character's previous action was: "${gameContext.previousChoice}".`;
      }

      // Get genre-specific instructions
      const genreInstructions = this.getGenreSpecificInstructions(primaryGenre);
      
      // Get secondary genre influences
      let secondaryGenreInfluences = '';
      if (secondaryGenres && secondaryGenres.length > 0) {
        secondaryGenreInfluences = 'This story also incorporates elements from: ';
        secondaryGenres.forEach((genre, index) => {
          secondaryGenreInfluences += this.getGenreName(genre);
          if (index < secondaryGenres.length - 1) {
            secondaryGenreInfluences += ', ';
          }
        });
        secondaryGenreInfluences += '. ';
      }
      
      // Add custom genre description if available
      let customGenreInfo = '';
      if (customGenreDescription) {
        customGenreInfo = `This story has the following custom elements: ${customGenreDescription}. `;
      }

      // Construct the full prompt
      const fullPrompt = `
      You are a creative storyteller for an interactive text adventure game.
      
      ${characterInfo}
      
      ${gameStateInfo}
      
      ${previousChoiceInfo}
      
      Primary Genre: ${this.getGenreName(primaryGenre)}
      ${secondaryGenreInfluences}
      ${customGenreInfo}
      ${genreInstructions}
      
      Based on the above context and the following prompt, generate the next part of the story:
      
      "${prompt}"
      
      Provide a rich, detailed description of the scene, including sensory details, character emotions, and environmental elements.
      Write in second person perspective (e.g., "You see a towering castle in the distance").
      Keep your response focused on storytelling, without meta-commentary.
      Response length: 150-250 words.
      `;

      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      this.logger.error(
        `Error generating story content: ${error.message}`,
        error.stack,
      );
      return 'The storyteller pauses, gathering thoughts before continuing the tale...';
    }
  }

  async generateChoices(
    storyContent: string,
    gameContext: any,
  ): Promise<any[]> {
    try {
      const character = gameContext.character;
      if (!character) {
        throw new Error(
          'Character information is required for choice generation',
        );
      }

      const primaryGenre = character.primaryGenre || GameGenre.FANTASY;
      const secondaryGenres = character.secondaryGenres || [];
      const customGenreDescription = character.customGenreDescription || '';

      // Build character info based on genres (similar to generateStoryContent)
      let characterInfo = `Character: ${character.name}, a level ${character.level} ${character.characterClass}. `;

      // Add all relevant attributes
      characterInfo += 'Attributes: ';
      const attributes = character.attributes;
      const relevantAttributes = this.getRelevantAttributes(primaryGenre, secondaryGenres);
      
      for (const attr of relevantAttributes) {
        if (attributes[attr] !== undefined) {
          characterInfo += `${this.formatAttributeName(attr)} ${attributes[attr]}, `;
        }
      }
      
      // Remove trailing comma and space
      characterInfo = characterInfo.replace(/, $/, '. ');

      // Add inventory information
      if (character.inventory && character.inventory.items) {
        characterInfo += 'Inventory: ';
        character.inventory.items.forEach((item, index) => {
          characterInfo += `${item.name} (${item.quantity})`;
          if (index < character.inventory.items.length - 1) {
            characterInfo += ', ';
          }
        });
        characterInfo += '. ';
      }

      // Add skills information
      if (character.skills && character.skills.length > 0) {
        characterInfo += 'Skills: ' + character.skills.join(', ') + '. ';
      }

      // Get genre-specific attributes for choices
      const genreAttributes = this.getGenreAttributes(primaryGenre);
      const genreItems = this.getGenreItems(primaryGenre);
      
      // Get secondary genre influences
      let secondaryGenreInfluences = '';
      if (secondaryGenres && secondaryGenres.length > 0) {
        secondaryGenreInfluences = 'Also incorporate elements from: ';
        secondaryGenres.forEach((genre, index) => {
          secondaryGenreInfluences += this.getGenreName(genre);
          if (index < secondaryGenres.length - 1) {
            secondaryGenreInfluences += ', ';
          }
        });
        secondaryGenreInfluences += '. ';
      }
      
      // Add custom genre description if available
      let customGenreInfo = '';
      if (customGenreDescription) {
        customGenreInfo = `Consider these custom elements: ${customGenreDescription}. `;
      }

      // Determine if this is a combat scene
      const isCombatScene = gameContext.isCombatScene || false;
      let combatInfo = '';
      if (isCombatScene) {
        combatInfo = `
        This is a COMBAT SCENE. Generate choices that include:
        - At least one offensive action
        - At least one defensive or evasive action
        - At least one creative or environmental action
        `;
      }

      // Construct the full prompt
      const fullPrompt = `
      You are generating meaningful choices for an interactive text adventure game.
      
      ${characterInfo}
      
      Based on the following story segment, generate 3-4 distinct choices for the player:
      
      "${storyContent}"
      
      Primary Genre: ${this.getGenreName(primaryGenre)}
      ${secondaryGenreInfluences}
      ${customGenreInfo}
      ${combatInfo}
      
      The choices should be appropriate for the primary genre and reflect its themes and tropes.
      Each choice should be a clear action the character can take.
      
      Relevant attributes for this genre include: ${genreAttributes.join(', ')}
      Relevant item types for this genre include: ${genreItems.join(', ')}
      
      Format each choice as a JSON object with these properties:
      1. text: The choice text shown to the player (1-15 words)
      2. consequences: Potential outcomes (not shown to player)
        - attributeChanges: {attribute: numericValue, ...}
        - itemGains: [{id: string, name: string, quantity: number}, ...]
        - itemLosses: [{id: string, name: string, quantity: number}, ...]
        - currencyChanges: {currencyType: numericValue, ...}
        - flags: {flagName: value, ...}
        - locationChange: string (if applicable)
      3. nextPrompt: Brief description of what happens next if this choice is selected
      
      Return ONLY a valid JSON array of choice objects, with no additional text.
      `;

      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      const responseText = response.text();

      // Extract the JSON array from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to generate valid choice JSON');
      }

      const choicesJson = jsonMatch[0];
      return JSON.parse(choicesJson);
    } catch (error) {
      this.logger.error(
        `Error generating choices: ${error.message}`,
        error.stack,
      );
      // Return default choices if generation fails
      return [
        {
          text: 'Continue cautiously',
          consequences: {
            attributeChanges: {},
          },
          nextPrompt: 'The character proceeds with caution',
        },
        {
          text: 'Look for another path',
          consequences: {
            attributeChanges: {},
          },
          nextPrompt: 'The character searches for alternatives',
        },
        {
          text: 'Rest and recover',
          consequences: {
            attributeChanges: { health: 5 },
          },
          nextPrompt: 'The character takes time to rest',
        },
      ];
    }
  }

  async generateCombatScene(character: any, location: string): Promise<any> {
    try {
      const primaryGenre = character.primaryGenre || GameGenre.FANTASY;
      const secondaryGenres = character.secondaryGenres || [];
      const customGenreDescription = character.customGenreDescription || '';
      
      // Get relevant attributes for combat
      const relevantAttributes = this.getRelevantAttributes(primaryGenre, secondaryGenres);
      let attributesInfo = '';
      
      for (const attr of relevantAttributes) {
        if (character.attributes[attr] !== undefined) {
          attributesInfo += `${this.formatAttributeName(attr)}: ${character.attributes[attr]}, `;
        }
      }
      
      // Remove trailing comma and space
      attributesInfo = attributesInfo.replace(/, $/, '');
      
      // Get secondary genre influences
      let secondaryGenreInfluences = '';
      if (secondaryGenres && secondaryGenres.length > 0) {
        secondaryGenreInfluences = 'Also incorporate elements from: ';
        secondaryGenres.forEach((genre, index) => {
          secondaryGenreInfluences += this.getGenreName(genre);
          if (index < secondaryGenres.length - 1) {
            secondaryGenreInfluences += ', ';
          }
        });
        secondaryGenreInfluences += '. ';
      }
      
      // Add custom genre description if available
      let customGenreInfo = '';
      if (customGenreDescription) {
        customGenreInfo = `Consider these custom elements: ${customGenreDescription}. `;
      }

      const prompt = `
      Generate a combat encounter for an interactive text adventure game.
      
      Character: ${character.name}, a level ${character.level} ${
        character.characterClass
      }
      Attributes: ${attributesInfo}
      Location: ${location}
      
      Primary Genre: ${this.getGenreName(primaryGenre)}
      ${secondaryGenreInfluences}
      ${customGenreInfo}
      
      Create a JSON object with the following:
      1. A description of the enemies and the combat situation
      2. Enemy data appropriate for the character's level and the genre
      
      The JSON should have this structure:
      {
        "enemies": [
          {
            "id": string,
            "name": string,
            "level": number,
            "health": number,
            "attributes": {key-value pairs of relevant attributes},
            "abilities": [string array of special abilities]
          }
        ],
        "rewards": {
          "experience": number,
          "gold": number (or appropriate currency for the genre),
          "items": [
            {
              "id": string,
              "name": string,
              "quantity": number,
              "dropChance": number (0-1)
            }
          ]
        },
        "description": Narrative description of the combat scene
      }
      
      Return ONLY a valid JSON object, with no additional text.
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const responseText = response.text();

      // Extract the JSON object from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to generate valid combat scene JSON');
      }

      const combatJson = jsonMatch[0];
      return JSON.parse(combatJson);
    } catch (error) {
      this.logger.error(
        `Error generating combat scene: ${error.message}`,
        error.stack,
      );
      // Return a default combat scene if generation fails
      return {
        enemies: [
          {
            id: 'default-enemy',
            name: 'Mysterious Opponent',
            level: character.level,
            health: 50,
            attributes: {
              strength: 10,
              dexterity: 10,
            },
            abilities: ['Basic Attack'],
          },
        ],
        rewards: {
          experience: 50,
          gold: 25,
          items: [
            {
              id: 'minor-healing',
              name: 'Minor Healing Potion',
              quantity: 1,
              dropChance: 0.7,
            },
          ],
        },
        description:
          'A shadowy figure emerges, challenging you to combat. Prepare yourself!',
      };
    }
  }

  // Helper methods for genre-specific content
  private getGenreName(genre: GameGenre): string {
    switch (genre) {
      case GameGenre.FANTASY:
        return 'Fantasy';
      case GameGenre.SCIFI:
        return 'Science Fiction';
      case GameGenre.CYBERPUNK:
        return 'Cyberpunk';
      case GameGenre.XIANXIA:
        return 'Xianxia (Cultivation)';
      case GameGenre.WUXIA:
        return 'Wuxia (Martial Arts)';
      case GameGenre.HORROR:
        return 'Horror';
      case GameGenre.MODERN:
        return 'Modern';
      case GameGenre.POSTAPOCALYPTIC:
        return 'Post-Apocalyptic';
      case GameGenre.STEAMPUNK:
        return 'Steampunk';
      case GameGenre.HISTORICAL:
        return 'Historical';
      default:
        return 'Fantasy';
    }
  }

  private getGenreSpecificInstructions(genre: GameGenre): string {
    switch (genre) {
      case GameGenre.FANTASY:
        return `
        Create a high fantasy narrative with elements of magic, mythical creatures, and epic quests.
        Use rich descriptions of magical elements, ancient ruins, mystical forests, and fantastical creatures.
        Incorporate themes of heroism, destiny, and the struggle between good and evil.
        `;
      case GameGenre.SCIFI:
        return `
        Create a science fiction narrative with advanced technology, space exploration, and futuristic societies.
        Use descriptions that emphasize technology, alien worlds, spacecraft, and scientific concepts.
        Incorporate themes of discovery, the impact of technology on society, and humanity's place in the universe.
        `;
      case GameGenre.CYBERPUNK:
        return `
        Create a cyberpunk narrative with high tech and low life, corporate dominance, and digital realms.
        Use descriptions that contrast advanced technology with urban decay, neon-lit streets, and digital interfaces.
        Incorporate themes of rebellion against corporate control, transhumanism, and the blurring line between human and machine.
        `;
      case GameGenre.XIANXIA:
      case GameGenre.WUXIA:
        return `
        Create a narrative of martial arts, cultivation, and Eastern mysticism.
        Use descriptions that emphasize qi manipulation, martial techniques, ancient sects, and spiritual growth.
        Incorporate themes of personal cultivation, honor, martial hierarchies, and the pursuit of immortality.
        `;
      case GameGenre.HORROR:
        return `
        Create a horror narrative with elements of fear, the unknown, and psychological tension.
        Use descriptions that evoke fear, dread, and unease, with attention to atmosphere and tension.
        Incorporate themes of survival, sanity, and confronting the unknown or supernatural.
        `;
      case GameGenre.MODERN:
        return `
        Create a contemporary narrative set in the present day with realistic elements.
        Use realistic descriptions of modern settings, technology, and social dynamics.
        Incorporate themes relevant to contemporary life, relationships, and societal challenges.
        `;
      case GameGenre.POSTAPOCALYPTIC:
        return `
        Create a narrative set after a global catastrophe, focusing on survival and rebuilding.
        Use descriptions of ruined landscapes, scarcity, makeshift communities, and environmental hazards.
        Incorporate themes of survival, adaptation, hope in adversity, and the rebuilding of society.
        `;
      case GameGenre.STEAMPUNK:
        return `
        Create a narrative with Victorian aesthetics, steam-powered technology, and retrofuturistic elements.
        Use descriptions of brass machinery, steam engines, airships, and alternative history technologies.
        Incorporate themes of invention, exploration, class dynamics, and the impact of technology.
        `;
      case GameGenre.HISTORICAL:
        return `
        Create a narrative set in a specific historical period with attention to historical accuracy.
        Use descriptions that capture the setting, customs, technology, and social dynamics of the era.
        Incorporate themes relevant to the historical period while maintaining an engaging narrative.
        `;
      default:
        return `
        Create an engaging narrative with vivid descriptions and meaningful choices.
        Focus on character development, world-building, and an immersive story experience.
        `;
    }
  }

  private getGenreAttributes(genre: GameGenre): string[] {
    switch (genre) {
      case GameGenre.FANTASY:
        return ['strength', 'intelligence', 'dexterity', 'charisma', 'health', 'mana'];
      case GameGenre.XIANXIA:
      case GameGenre.WUXIA:
        return ['strength', 'dexterity', 'qi', 'cultivation', 'perception'];
      case GameGenre.SCIFI:
      case GameGenre.CYBERPUNK:
        return ['intelligence', 'tech', 'hacking', 'piloting'];
      case GameGenre.HORROR:
        return ['sanity', 'willpower', 'perception'];
      case GameGenre.MODERN:
        return ['charisma', 'education', 'wealth', 'influence'];
      case GameGenre.POSTAPOCALYPTIC:
        return ['strength', 'survival', 'scavenging', 'radiation resistance'];
      case GameGenre.STEAMPUNK:
        return ['intelligence', 'engineering', 'social standing'];
      default:
        return ['strength', 'intelligence', 'dexterity', 'charisma'];
    }
  }

  private getGenreItems(genre: GameGenre): string[] {
    switch (genre) {
      case GameGenre.FANTASY:
        return ['weapon', 'armor', 'potion', 'scroll', 'magical artifact'];
      case GameGenre.XIANXIA:
      case GameGenre.WUXIA:
        return ['weapon', 'cultivation manual', 'medicinal herb', 'qi pill', 'talisman'];
      case GameGenre.SCIFI:
      case GameGenre.CYBERPUNK:
        return ['weapon', 'implant', 'gadget', 'medkit', 'data chip'];
      case GameGenre.HORROR:
        return ['weapon', 'light source', 'medical supply', 'ritual item', 'key'];
      case GameGenre.MODERN:
        return ['smartphone', 'weapon', 'tool', 'medicine', 'document'];
      case GameGenre.POSTAPOCALYPTIC:
        return ['weapon', 'scrap', 'food', 'water', 'medicine', 'fuel'];
      case GameGenre.STEAMPUNK:
        return ['gadget', 'weapon', 'tool', 'blueprint', 'mechanical part'];
      default:
        return ['weapon', 'tool', 'consumable', 'key item'];
    }
  }
  
  // Helper method to get relevant attributes based on all genres
  private getRelevantAttributes(primaryGenre: GameGenre, secondaryGenres: GameGenre[]): string[] {
    // Start with primary genre attributes
    const attributes = new Set(this.getGenreAttributes(primaryGenre));
    
    // Add attributes from secondary genres
    if (secondaryGenres && secondaryGenres.length > 0) {
      secondaryGenres.forEach(genre => {
        this.getGenreAttributes(genre).forEach(attr => attributes.add(attr));
      });
    }
    
    // Always include basic attributes
    ['strength', 'intelligence', 'dexterity', 'charisma', 'health'].forEach(attr => 
      attributes.add(attr)
    );
    
    return Array.from(attributes);
  }
  
  // Helper method to format attribute names for display
  private formatAttributeName(attr: string): string {
    // Capitalize first letter
    return attr.charAt(0).toUpperCase() + attr.slice(1);
  }
}