import { Server } from 'socket.io';
export declare class WebSocketsService {
    server: Server;
    onNewMessage(body: any): void;
    onSetVus(body: any): void;
    onMessageDeleted(id: any): void;
}
