import { Participant, Tape } from '@/entity';

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

// TODO 格式校验
export interface UploadDto extends Omit<Tape, 'userId' | 'id'> {}

export type UploadVo = void;

export interface DeleteDto {
  tapeId: string;
}