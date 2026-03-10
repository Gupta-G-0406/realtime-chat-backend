import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";

const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];
app.use(cors({ origin: allowedOrigins }));

const PORT = process.env.PORT || 3000;

const app = express();

// http Handshake for socket.io
const server = createServer(app);

// Socket.io Server Instance Initialization
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("<h1>RealTime Chat Application🚀</h1>");
});

// Middleware
io.use(async (socket, next) => {
  console.log(`Socket.io Middleware Called With SocketID ${socket.id}`);
  next();
});

// Socket.io Connection Event Server Named io
io.on("connection", (socket) => {
  console.log(`user is connected with id ${socket.id}`);
  // send msg to all inside server
  // socket.emit("welcome", "Welcome to the chat application");

  // send msg to all except sender
  // socket.broadcast.emit("hello", `${socket.id} has joined the chat`);

  //receive msg from client
  socket.on("message", ({ msg, room }) => {
    console.log({ msg, room });
    // if you want to send msg to all connected clients and also sender
    // io.emit("receive-message", msg);

    // if you want to send msg to all connected clients except sender
    // socket.broadcast.emit("receive-message", msg);

    // for creatig rooms
    socket.to(room).emit("receive-message", msg);
  });

  socket.on("join-room", (roomName) => {
    // It helps in Joining a room with the name roomName
    socket.join(roomName);
    console.log(`user with id ${socket.id} has joined room ${roomName}`);
  });

  //disconnect event
  socket.on("disconnect", () => {
    console.log(`user with id ${socket.id} has left the chat`);
  });
});
server.listen(PORT, () => {
  console.log(`server is running on port no. ${PORT}`);
});

// socket.emit -> to send message to a client

// io.emit -> to send a message to the whole server

// socket.broadcast.emit -> to send a message to everyone except the sender (more useful)

// socket.on -> to write reciever handling logic of the emit logic

// socket.to(id).emit() is the standard way to send a private message to a specific user.
