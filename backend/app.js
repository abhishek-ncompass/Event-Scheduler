const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const userRoutes = require('./routers/user.router');
const eventRoutes = require('./routers/event.router');
const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------------    Middleware to parse JSON bodies     -----------------------------

app.use(bodyParser.json());
app.use(cors());

// -----------------------------    Using User Routers     -----------------------------
app.use('/user', userRoutes);
app.use('/event', eventRoutes);

// -----------------------------    Socket.IO Setup     -----------------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  },
});

let connectedUsers = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('login', (email) => {
    connectedUsers[socket.id] = email;
    console.log(`User logged in: ${email} with socket ID: ${socket.id}`);
    io.emit('online_users', Object.values(connectedUsers).map((email, index) => ({ email, id: Object.keys(connectedUsers)[index] })));
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    delete connectedUsers[socket.id];
    io.emit('online_users', Object.values(connectedUsers).map((email, index) => ({ email, id: Object.keys(connectedUsers)[index] })));
  });

  socket.on('new_event', (eventData) => {
    io.emit('new_event', eventData);

    eventData.participants.forEach((participantEmail) => {
      const participantSocketId = Object.keys(connectedUsers).find(
        (socketId) => connectedUsers[socketId] === participantEmail
      );
      if (participantSocketId) {
        socket.to(participantSocketId).emit('event_invitation', eventData);
      }
    });
  });
});

// -----------------------------    Start the Server     -----------------------------
server.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});