import { WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Question } from './question.entity';

@WebSocketGateway({ cors: { origin: '*' } })
export class QuestionGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        console.log('WebSocket Gateway initialized.');
    }

    // Quando um usuário se conecta, ele pode enviar seu ID para entrar em uma sala privada.
    handleConnection(client: Socket, ...args: any[]) {
        const userId = client.handshake.query.userId;
        if (userId) {
            client.join(userId);
            console.log(`Cliente conectado e na sala: ${client.id}, User ID: ${userId}`);
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Cliente desconectado: ${client.id}`);
    }

    // Method to notify all clients about a new question
    notifyNewQuestion(question: Question) {
        this.server.emit('newQuestion', question);
    }

    // Method to notify that a question has been claimed
    notifyQuestionClaimed(questionId: string, consultantName: string) {
        this.server.emit('questionClaimed', { questionId, consultantName });
    }

    notifyClientAnswer(clientId: string) {
        if (clientId) {
            // Emite o evento apenas para a sala do cliente específico
            this.server.to(clientId).emit('questionAnswered', {});
        }
    }
    notifyClientClaimed(clientId: string) {
        if (clientId) {
            this.server.to(clientId).emit('questionClaimed', {});
        }   
    }
}