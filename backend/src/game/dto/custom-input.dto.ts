import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum InputType {
  ACTION = 'action',
  THOUGHT = 'thought',
  SPEECH = 'speech',
  CUSTOM = 'custom',
}

export class CustomInputDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(InputType)
  type: InputType;

  @IsString()
  @IsOptional()
  target?: string; // For speech - who you're talking to

  @IsString()
  @IsNotEmpty()
  gameSessionId: string;
}