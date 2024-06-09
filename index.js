const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Configuration de l'application Express
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Configuration de CORS
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));

// Créer une instance de socket.io
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type']
    }
});

// Configuration de socket.io
io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté.');

    // Lorsqu'on reçoit un événement "message"
    socket.on('message', (data) => {
        console.log('Message reçu:', data);
        // Distribuer les données à tous les utilisateurs abonnés à l'événement "receivedMsg"
        io.emit('receivedMsg', data);
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur est déconnecté.');
    });
});

app.get('/', (req, res) => {
    res.send('Le serveur WebSocket est en marche.');
});

server.listen(port, () => {
    console.log(`Le serveur est en marche sur le port ${port}`);
});
