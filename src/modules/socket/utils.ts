import { PreRoomEvent } from './types';

export const makeRoomWrapper = (roomId: string) => {
  return (event: PreRoomEvent) => {
    return `PreRoom<${roomId}>(${event})`;
  };
};