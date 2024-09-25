const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const queryFn = require('./utils/queryFunction');

dotenv.config();

const userRoutes = require('./routers/user.router');
const eventRoutes = require('./routers/event.router');
const { Client } = require('pg');
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
  
  console.log("email nahi Aaya !")
  socket.on('login', (email) => {
    console.log("email Aaya ?")
    connectedUsers[socket.id] = email;
    console.log(`User logged in: ${email} with socket ID: ${socket.id}`);
    io.emit('online_users', Object.values(connectedUsers).map((email, index) => ({ email, id: Object.keys(connectedUsers)[index] })));
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    delete connectedUsers[socket.id];
    io.emit('online_users', Object.values(connectedUsers).map((email, index) => ({ email, id: Object.keys(connectedUsers)[index] })));
  });
});

// -----------------------------    Notification Send Functionality     -----------------------------
async function handleNewEventNotification(payload) {
  const eventData = JSON.parse(payload);
  console.log("New Event Data", eventData)
  const userData = await queryFn('SELECT email, firstname FROM users WHERE userid = $1', [eventData.createdby]);
  console.log(userData.rows[0])
  const newEventData = {
    ...eventData,
    start: eventData.startdatetime,
    end: eventData.enddatetime,
    createdBy: {
      email: userData.rows[0].email,
      firstname: userData.rows[0].firstname,
    },
  };

  // Query the participant table to get the participant emails
  const participantData = await queryFn('SELECT userid FROM participants WHERE eventid = $1', [eventData.eventid]);
  console.log(participantData.rows)

  // Query the users table to get the participant emails
  const participantEmails = await queryFn('SELECT email FROM users WHERE userid = ANY($1)', [participantData.rows.map(participant => participant.userid)]);
  console.log(participantEmails.rows)

  // Emit the event_invitation event to each participant
  participantEmails.rows.forEach((participant) => {
    const participantSocketId = Object.keys(connectedUsers).find((socketId) => connectedUsers[socketId] === participant.email);
    console.log("sockets: ----------", participantSocketId)
    if (participantSocketId) {
      console.log("bhej diya invite")
      io.to(participantSocketId).emit('event_invitation', newEventData);
    }
  });
}

// -----------------------------    Listen for PostgreSQL Notifications     -----------------------------
const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
});

client.connect().then(() => console.log('connected triggers pg'));

client.query('LISTEN new_event');

client.on('notification', (msg) => {
  if (msg.channel === 'new_event') {
    console.log(msg.payload)
    handleNewEventNotification(msg.payload);
  }
});

// -----------------------------    Start the Server     -----------------------------
server.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});