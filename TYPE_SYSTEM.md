# LifePath.AI Type System Documentation

This document provides an overview of the comprehensive type system implemented in the LifePath.AI project.

## Overview

The LifePath.AI type system is designed to ensure type safety and consistency across the entire application, from frontend to backend. It provides a shared set of type definitions that are used throughout the codebase, reducing duplication and preventing type-related bugs.

## Directory Structure

```
frontend/
  └── src/
      └── types/
          ├── shared/
          │   ├── index.ts
          │   ├── common.types.ts
          │   ├── game.types.ts
          │   └── user.types.ts
          └── game.types.ts (legacy)

backend/
  └── src/
      └── common/
          ├── types/
          │   ├── index.ts
          │   ├── api-response.type.ts
          │   ├── pagination.type.ts
          │   ├── game.types.ts
          │   └── user.types.ts
          └── utils/
              ├── index.ts
              ├── date-utils.ts
              ├── transform-utils.ts
              ├── type-guards.ts
              └── validation-utils.ts
```

## Shared Types

The type system is built around a set of shared types that are used in both the frontend and backend. These types are defined in the `frontend/src/types/shared` directory and are imported by both frontend and backend code.

### Common Types

Common types include:

- `ApiResponse<T>`: Standard API response format
- `PaginationMeta`: Pagination metadata
- `PaginatedResponse<T>`: Paginated response
- `BaseEntity`: Base entity with ID and timestamps
- `SortDirection`: Sort direction (ASC/DESC)
- `SortOptions`: Sort options
- `FilterOperator`: Filter operator types
- `FilterCondition`: Filter condition
- `QueryParams`: Query parameters for list endpoints

### Game Types

Game-related types include:

- Enums: `GameDifficulty`, `GameLength`, `CombatStyle`, `GameTheme`, etc.
- Interfaces: `CharacterLevel`, `CultivationInfo`, `ExperiencePoints`, etc.
- DTOs: `CreateGameDto`, `GameActionDto`, etc.
- Entity types: `Game`, `StorySegment`, `Choice`, etc.

### User Types

User-related types include:

- Enums: `UserRole`, `AuthStatus`
- Interfaces: `User`, `RegisterUserDto`, `LoginCredentialsDto`, etc.
- DTOs: `AuthResponseDto`, `UpdateProfileDto`, etc.

## Type Guards

The type system includes a set of type guards that can be used to validate types at runtime:

- `isObject`: Check if a value is a non-null object
- `isArray`: Check if a value is an array
- `isString`: Check if a value is a string
- `isNumber`: Check if a value is a number
- `isBoolean`: Check if a value is a boolean
- `isDate`: Check if a value is a Date
- `isISODateString`: Check if a value is a valid ISO date string
- `hasProperty`: Check if a value has a specific property
- `hasRequiredProperties`: Check if a value has all required properties
- `isEnum`: Check if a value matches a specific enum

## Utilities

The type system is supported by a set of utilities:

### Date Utilities

- `dateToISOString`: Convert a Date object to an ISO string without milliseconds
- `formatDate`: Convert a Date object to a formatted date string
- `getDateDiff`: Calculate the difference between two dates in a human-readable format
- `addToDate`: Add a specified amount of time to a date

### Transform Utilities

- `convertDatesToISOStrings`: Convert all Date objects in an object to ISO strings
- `convertISOStringsToDates`: Convert all ISO date strings in an object to Date objects
- `transformEntityToDto`: Transform an entity to a DTO by converting dates and applying transformations

### Validation Utilities

- `sanitizeString`: Sanitize a string by removing HTML tags and trimming
- `sanitizeObject`: Sanitize an object by applying sanitization to all string properties
- `validateRange`: Validate that a value is within a specified range
- `clampValue`: Ensure a value is within a specified range, clamping if necessary
- `validatePattern`: Validate that a string matches a regex pattern
- `validateRequiredProperties`: Validate that an object has all required properties

## API Response Standardization

All API responses are standardized using the `TransformInterceptor` and `HttpExceptionFilter`:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {
      // Additional error details
    }
  }
}
```

## Best Practices

When working with the type system, follow these best practices:

1. Always use the shared types when defining new interfaces, classes, or functions
2. Use type guards to validate types at runtime
3. Use the transform utilities when converting between frontend and backend types
4. Use the validation utilities to validate and sanitize user input
5. Always return standardized API responses from controllers
6. Use enums instead of string literals for fixed sets of values
7. Use interfaces for complex objects
8. Use generics to create reusable type definitions
9. Document all types with JSDoc comments

## Examples

### Using Shared Types in Frontend

```typescript
import { Game, CreateGameDto } from '../types/shared';

async function createGame(gameData: CreateGameDto): Promise<Game> {
  const response = await api.post<ApiResponse<Game>>('/games', gameData);
  return response.data.data as Game;
}
```

### Using Shared Types in Backend

```typescript
import { GameActionDto } from '../../common/types/game.types';

@Post(':id/action')
async performAction(
  @Param('id') id: string,
  @Body() actionDto: GameActionDto,
): Promise<Game> {
  return this.gamesService.performAction(id, actionDto);
}
```

### Using Type Guards

```typescript
import {
  isObject,
  hasRequiredProperties,
} from '../../common/utils/type-guards';

function validateGameData(data: unknown): boolean {
  if (!isObject(data)) {
    return false;
  }

  return hasRequiredProperties(data, ['theme', 'setting', 'characterName']);
}
```

### Using Transform Utilities

```typescript
import { transformEntityToDto } from '../../common/utils/transform-utils';

function mapGameToDto(game: Game): GameDto {
  return transformEntityToDto<Game, GameDto>(game, {
    createdAt: (date) => formatDate(date, 'YYYY-MM-DD'),
    updatedAt: (date) => formatDate(date, 'YYYY-MM-DD'),
  });
}
```
