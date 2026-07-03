import io, { Socket } from "socket.io-client";

// O backend expõe o Socket.IO no namespace padrão "/" e o nginx faz proxy de
// /socket.io/ para o backend. Conectamos na raiz do mesmo host (não em "/api").
//
// transports: ["websocket"] força uma única conexão WebSocket persistente,
// evitando o handshake de long-polling em múltiplas requisições — que, com
// várias réplicas do backend, cairia em pods diferentes. O broadcast entre os
// pods é garantido pelo adapter Redis no backend.
export const socket: typeof Socket = io({ transports: ["websocket"] });
