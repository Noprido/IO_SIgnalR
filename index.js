const express = require('express');
const { HttpServer } = require('@microsoft/signalr'); // Correct import
const http = require('http');
const cors = require('cors');
const { io } = require("socket.io-client");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Configurer CORS
const corsOptions = {
    origin: 'https://immo229-server-1.onrender.com', // Correct URL format
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));

// Créer un hub
class ChatHub {
    constructor() {
        this.clients = [];
    }

    // Une connexion est détectée
    onConnected(connection) {
        this.clients.push(connection);

        console.log('A user is connected.');

        // On reçoit un événement "chat data"
        connection.on('chat data', (ChatData) => {
            // On log
            console.log('Message reçu:');
            console.log(ChatData);

            // On se connecte sur le serveur socket.io
            const socket = io("https://immo229-server-1.onrender.com");

            // Ici on met un écouteur en place
            socket.on(JSON.parse(ChatData).Id, (Msg) => {
                this.broadcast(JSON.parse(ChatData).Id, Msg, connection);
            });

            // On émet l'événement "chat data"
            socket.emit("chat data", ChatData);  
        });

        connection.on('close', () => {
            this.clients = this.clients.filter(c => c !== connection);
            console.log('A user is disconnected.');
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

const chatHub = new ChatHub();
const signalRServer = new HttpServer({
    hub: chatHub
});

signalRServer.attach(server, '/chat');

app.get('/', (req, res) => {
    res.send('SignalR Server is running');
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
