import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway(
  4567,
  {
    cors: { origin: '*' },
  })
export class SocketGateway implements OnGatewayConnection {
  @WebSocketServer()
    server: Server;

  @Inject()
    jwtService: JwtService;

  handleConnection(client: Socket): any {
    try {
      // success
      const jwt = client.request.headers['x-jwt'] as string;
      this.jwtService.verify(jwt);
    }
    catch{
      // failed
      client.disconnect();
    }
  }
}