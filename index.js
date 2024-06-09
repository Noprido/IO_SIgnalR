const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // Importation correcte pour le serveur Socket.IO

const cors = require('cors');
const { io } = require("socket.io-client");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.use(cors());

// Configurer CORS
const corsOptions = {
    origin: 'https://immo229-server-1.onrender.com',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));

// Créer un ChatHub
class ChatHub {
    constructor() {
        this.clients = [];
    }

    // Une connexion est détectée
    onConnected(connection) {
        this.clients.push(connection);

        console.log('Un utilisateur est connecté.');

        // On reçoit un événement "chat data"
        connection.on('chat data', (ChatData) => {
            console.log('Message reçu:', ChatData);

            const parsedData = JSON.parse(ChatData);
            const socket = io("https://immo229-server-1.onrender.com");

            socket.on(parsedData.Id, (Msg) => {
                this.broadcast(parsedData.Id, Msg, connection);
            });

            socket.emit("chat data", ChatData);
        });

        connection.on('close', () => {
            this.clients = this.clients.filter(c => c !== connection);
            console.log('Un utilisateur est déconnecté.');
        });
    }

    broadcast(method, message, exclude) {
        this.clients.forEach(client => {
            if (client !== exclude) {
                client.send(JSON.stringify({ method, message }));
            }
        });
    }
}

// Configurer Socket.IO
const ioServer = new Server(server, {
    path: '/chat',
    cors: corsOptions
});

ioServer.on('connection', (socket) => {
    const chatHub = new ChatHub();
    chatHub.onConnected(socket);

    socket.on('disconnect', () => {
        chatHub.onDisconnected(socket);
    });
});

app.get('/', (req, res) => {
  res.send('Le serveur SignalR est en cours d\'exécution');
});

server.listen(port, () => {
  console.log(`Le serveur est en cours d'exécution sur le port ${port}`);
});
