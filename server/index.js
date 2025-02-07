const express = require("express");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: true,
});

app.use(bodyParser.json());

// Maps to keep track of socket connections
const emailToSocketMap = new Map();
const socketToEmailMap = new Map();

io.on("connection", (socket) => {
  socket.on("joinRoom", (data) => {
    const { emailId, roomId } = data;
    
    emailToSocketMap.set(emailId, socket.id);
    socketToEmailMap.set(socket.id, emailId);

    socket.join(roomId);
    socket.emit("joinedRoom", { roomId });
    socket.broadcast.to(roomId).emit("userJoined", { emailId });
  });

  socket.on("callUser", (data) => {
    const { emailId, offer } = data;
    const socketId = emailToSocketMap.get(emailId);
    const fromEmailId = socketToEmailMap.get(socket.id);
    
    socket.to(socketId).emit("inComingCall", { from: fromEmailId, offer });
  });

  socket.on("callAccepted", (data) => {
    const { emailId, answer } = data;
    const socketId = emailToSocketMap.get(emailId);

    if (socketId) {
      socket.to(socketId).emit("callAccepted", { answer });
    }
  });
});

server.listen(3000, () => {});
