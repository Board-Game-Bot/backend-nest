import { Socket } from 'socket.io';

export class EventManager {
  eventBucket: [Socket, string, (...args: any[]) => void][] = [];
  bindEvent(socket: Socket, event: string, listener: (...args: any[]) => void) {
    socket.on(event, listener);
    this.eventBucket.push([socket, event, listener]);
  }

  disband() {
    this.eventBucket.forEach(([socket, event, listener]) => {
      socket.off(event, listener);
    });
  }
}