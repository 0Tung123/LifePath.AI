# Enhanced World Building Prompts for LifePath.AI

This directory contains advanced prompt templates for creating more immersive, dynamic, and responsive game worlds in LifePath.AI.

## Files

- `enhanced-world-building.prompt.ts` - Contains two main functions:
  - `buildEnhancedWorldPrompt()` - Used for initial game creation
  - `buildEnhancedActionPrompt()` - Used for processing player actions

## Key Features

### 1. Ripple Effect System
Each player decision triggers multiple consequences:
- Immediate reactions
- Medium-term effects (1-2 segments later)
- Long-term consequences (appearing when least expected)

### 2. Parallel Timeline System
Each segment includes events happening elsewhere in the world, independent of the player's actions, making the world feel alive and autonomous.

### 3. Autonomous Character System
NPCs have:
- Personal motivations
- Core fears
- Secrets
- Internal conflicts
- Independent schedules

NPCs change over time even when not interacting with the player:
- Physical changes
- Circumstantial changes
- Relationship changes

### 4. Independent Event System
The world has major events occurring regardless of player involvement:
- Natural disasters
- Political changes
- Social phenomena
- Cultural events

### 5. Multi-Perspective Realism
Events are viewed from multiple perspectives:
- Player character's view
- Opposing view (enemies/rivals)
- Neutral observer view

### 6. Living Detail Technique
Each segment includes:
- Sensory details (smells, sounds, textures, tastes)
- Movement details (how characters move, body language)
- Dynamic environment details (changing light, weather, atmosphere)

### 7. Layered Dialogue
Dialogue contains multiple layers:
- Explicit layer (what's actually said)
- Implicit layer (what's meant)
- Contextual layer (body language, tone)

## Implementation

These prompts are integrated into the game system through:
- `games.service.ts` - Uses the enhanced prompts for game creation and action processing
- `buildInitialPrompt()` - Creates the initial game world
- `buildActionPrompt()` - Processes player actions within the dynamic world

## Usage

The system automatically uses these enhanced prompts. No additional configuration is needed.