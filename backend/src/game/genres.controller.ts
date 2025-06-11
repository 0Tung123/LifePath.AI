import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GameGenre } from './entities/game-genre.enum';

@ApiTags('game')
@Controller('game')
export class GenresController {
  @Get('genres')
  @ApiOperation({ summary: 'Get available game genres' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of available game genres',
  })
  async getGenres() {
    // Return predefined genres with descriptions
    return [
      {
        id: 'fantasy',
        name: 'Fantasy',
        description:
          'A genre of speculative fiction involving magical elements and creatures',
      },
      {
        id: 'modern',
        name: 'Modern',
        description: 'Set in contemporary times with realistic settings',
      },
      {
        id: 'scifi',
        name: 'Science Fiction',
        description:
          'Explores advanced technology, space travel, and futuristic concepts',
      },
      {
        id: 'xianxia',
        name: 'Xianxia',
        description:
          'Chinese fantasy focusing on cultivators seeking immortality',
      },
      {
        id: 'wuxia',
        name: 'Wuxia',
        description: 'Chinese martial arts fiction with heroic characters',
      },
      {
        id: 'horror',
        name: 'Horror',
        description:
          'Features supernatural elements intended to frighten or unsettle',
      },
      {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        description:
          'High-tech, low-life dystopian settings with advanced technology and societal breakdown',
      },
      {
        id: 'steampunk',
        name: 'Steampunk',
        description:
          'Retro-futuristic setting inspired by 19th-century industrial steam-powered machinery',
      },
      {
        id: 'postapocalyptic',
        name: 'Post-Apocalyptic',
        description:
          'Set in a world after a catastrophic disaster or collapse of civilization',
      },
      {
        id: 'historical',
        name: 'Historical',
        description:
          'Set in the past with elements based on real historical events and settings',
      },
    ];
  }
}
