import { Socket } from 'socket.io';
import { isString } from 'lodash';

export const SocketMap = new Map<string, Socket>;
export const IdMap = new Map<Socket, string>;

export const addSocket = (id: string, socket: Socket) => {
  SocketMap.set(id, socket);
  IdMap.set(socket, id);
};

export const removeSocket = (idOrSocket: string | Socket) => {
  let id: string;
  let socket: Socket;
  if (isString(idOrSocket)) {
    id = idOrSocket;
    socket = SocketMap.get(idOrSocket);
  }
  else {
    id = IdMap.get(idOrSocket);
    socket = idOrSocket;
  }
  SocketMap.delete(id);
  IdMap.delete(socket);
};
