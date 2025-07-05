import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NPCService } from '../services/npc.service';
import {
  CreateNPCDto,
  UpdateNPCDto,
  CreateNPCInteractionDto,
  NPCBatchUpdateDto,
} from '../dto/npc.dto';
import { NPC, NPCInteraction, NPCNotification } from '../entities/npc.entity';

@ApiTags('NPCs')
@Controller('games/:gameId/npcs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NPCController {
  constructor(private readonly npcService: NPCService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new NPC' })
  @ApiResponse({
    status: 201,
    description: 'NPC created successfully',
    type: NPC,
  })
  @ApiResponse({
    status: 403,
    description: 'NPC with this name already exists',
  })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async createNPC(
    @Param('gameId') gameId: string,
    @Body() createNPCDto: CreateNPCDto,
    @Req() req: any,
  ): Promise<NPC> {
    return this.npcService.createNPC(gameId, req.user.id, createNPCDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all NPCs for a game' })
  @ApiResponse({
    status: 200,
    description: 'NPCs retrieved successfully',
    type: [NPC],
  })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async getNPCs(
    @Param('gameId') gameId: string,
    @Req() req: any,
  ): Promise<NPC[]> {
    return this.npcService.getNPCsByGame(gameId, req.user.id);
  }

  @Get(':npcId')
  @ApiOperation({ summary: 'Get a specific NPC' })
  @ApiResponse({
    status: 200,
    description: 'NPC retrieved successfully',
    type: NPC,
  })
  @ApiResponse({ status: 404, description: 'NPC not found' })
  async getNPC(
    @Param('gameId') gameId: string,
    @Param('npcId') npcId: string,
    @Req() req: any,
  ): Promise<NPC> {
    return this.npcService.getNPC(gameId, npcId, req.user.id);
  }

  @Patch(':npcId')
  @ApiOperation({ summary: 'Update an NPC' })
  @ApiResponse({
    status: 200,
    description: 'NPC updated successfully',
    type: NPC,
  })
  @ApiResponse({ status: 404, description: 'NPC not found' })
  async updateNPC(
    @Param('gameId') gameId: string,
    @Param('npcId') npcId: string,
    @Body() updateNPCDto: UpdateNPCDto,
    @Req() req: any,
  ): Promise<NPC> {
    return this.npcService.updateNPC(gameId, npcId, req.user.id, updateNPCDto);
  }

  @Delete(':npcId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an NPC' })
  @ApiResponse({ status: 204, description: 'NPC deleted successfully' })
  @ApiResponse({ status: 404, description: 'NPC not found' })
  async deleteNPC(
    @Param('gameId') gameId: string,
    @Param('npcId') npcId: string,
    @Req() req: any,
  ): Promise<void> {
    return this.npcService.deleteNPC(gameId, npcId, req.user.id);
  }

  @Post(':npcId/interactions')
  @ApiOperation({ summary: 'Create an NPC interaction' })
  @ApiResponse({
    status: 201,
    description: 'Interaction created successfully',
    type: NPCInteraction,
  })
  @ApiResponse({ status: 404, description: 'NPC not found' })
  async createNPCInteraction(
    @Param('gameId') gameId: string,
    @Param('npcId') npcId: string,
    @Body() createInteractionDto: CreateNPCInteractionDto,
    @Req() req: any,
  ): Promise<NPCInteraction> {
    return this.npcService.createNPCInteraction(
      gameId,
      npcId,
      req.user.id,
      createInteractionDto,
    );
  }

  @Get(':npcId/interactions')
  @ApiOperation({ summary: 'Get NPC interactions' })
  @ApiResponse({
    status: 200,
    description: 'Interactions retrieved successfully',
    type: [NPCInteraction],
  })
  @ApiResponse({ status: 404, description: 'NPC not found' })
  async getNPCInteractions(
    @Param('gameId') gameId: string,
    @Param('npcId') npcId: string,
    @Req() req: any,
  ): Promise<NPCInteraction[]> {
    return this.npcService.getNPCInteractions(gameId, npcId, req.user.id);
  }

  @Patch('batch-update')
  @ApiOperation({ summary: 'Batch update NPCs (for AI story processing)' })
  @ApiResponse({
    status: 200,
    description: 'NPCs updated successfully',
    type: [NPC],
  })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async batchUpdateNPCs(
    @Param('gameId') gameId: string,
    @Body() batchUpdateDto: NPCBatchUpdateDto,
    @Req() req: any,
  ): Promise<NPC[]> {
    return this.npcService.batchUpdateNPCs(gameId, req.user.id, batchUpdateDto);
  }

  @Post('process-lore')
  @ApiOperation({ summary: 'Process lore fragments and create/update NPCs' })
  @ApiResponse({
    status: 200,
    description: 'Lore fragments processed successfully',
    type: [NPC],
  })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async processLoreFragments(
    @Param('gameId') gameId: string,
    @Body() loreFragments: any[],
    @Req() req: any,
  ): Promise<NPC[]> {
    return this.npcService.processLoreFragments(
      gameId,
      req.user.id,
      loreFragments,
    );
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get NPC notifications for a game' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    type: [NPCNotification],
  })
  @ApiResponse({ status: 404, description: 'Game not found' })
  async getNPCNotifications(
    @Param('gameId') gameId: string,
    @Req() req: any,
  ): Promise<NPCNotification[]> {
    return this.npcService.getNPCNotifications(gameId, req.user.id);
  }

  @Patch('notifications/:notificationId/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 204, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markNotificationAsRead(
    @Param('gameId') gameId: string,
    @Param('notificationId') notificationId: string,
    @Req() req: any,
  ): Promise<void> {
    return this.npcService.markNotificationAsRead(
      gameId,
      notificationId,
      req.user.id,
    );
  }

  @Post(':npcId/notifications')
  @ApiOperation({ summary: 'Create an NPC notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    type: NPCNotification,
  })
  @ApiResponse({ status: 404, description: 'NPC not found' })
  async createNPCNotification(
    @Param('gameId') gameId: string,
    @Param('npcId') npcId: string,
    @Body()
    body: { type: string; title: string; message: string; priority?: string },
    @Req() req: any,
  ): Promise<NPCNotification> {
    return this.npcService.createNPCNotification(
      gameId,
      npcId,
      req.user.id,
      body.type as any,
      body.title,
      body.message,
      (body.priority as any) || 'medium',
    );
  }
}
