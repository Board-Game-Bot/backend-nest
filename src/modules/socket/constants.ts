/**
 * 维护一个单例，用来保存当前全局 socket.io
 */
import { Server } from 'socket.io';

export let SOCKET_SERVER: Server;

export function SET_SOCKET_SERVER(server: Server) {
  SOCKET_SERVER = server;
}

export function GET_SOCKET_SERVER() {
  return SOCKET_SERVER;
}