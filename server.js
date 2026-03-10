import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// CORS setup
const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Home route to test backend
app.get("/", (req, res) => {
  res.send("<h1>Real-Time Chat Backend is Running 🚀</h1>");
});

// Serve React frontend in production (optional)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Create HTTP server for Socket.IO
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// Socket.IO middleware (optional logging)
io.use((socket, next) => {
  console.log(`Socket.io Middleware Called With SocketID ${socket.id}`);
  next();
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join room
  socket.on("join-room", (roomName) => {
    socket.join(roomName);
    console.log(`${socket.id} joined room ${roomName}`);
  });

  // Receive message
  socket.on("message", ({ msg, room }) => {
    console.log({ msg, room });
    if (room) {
      socket.to(room).emit("receive-message", msg); // send to room
    } else {
      io.emit("receive-message", msg); // send to all
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
