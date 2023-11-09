import { Participant } from '@/entity';

export interface CreateTapeDto {
  gameId: string;
  json: Record<string, any>;
  participants: Participant[];
}

export interface RequestTapeDto {
  id: string;
}

export interface RequestMyTapeDto {}

export interface DeleteTapeDto {
  id: string;
}