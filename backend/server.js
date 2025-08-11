import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import webhookRouter from "./routes/webhook.js";
import { 
  getConversations, 
  getMessagesForConversation, 
  saveOutgoingMessage,
  getAvailableContacts 
} from "./controllers/messagesController.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL?.split(",") || ["http://localhost:5173"],
  methods: ["GET", "POST"],
  credentials: true
}));

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI missing in .env");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log("DB CONNECTED"))
  .catch(err => {
    console.error("DB connection error:", err.message);
    process.exit(1);
  });

const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { 
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

// Socket connection handling
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  
  // Join user to their profile room for targeted updates
  socket.on("join-profile", (profile) => {
    socket.join(profile);
    console.log(`User joined profile room: ${profile}`);
  });
  
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Webhook route
app.use("/webhook", webhookRouter);

// API endpoints with profile support
app.get("/api/conversations", (req, res) => getConversations(req, res));
app.get("/api/conversations/:wa_id/messages", (req, res) => getMessagesForConversation(req, res));
app.post("/api/conversations/:wa_id/messages", (req, res) => saveOutgoingMessage(req, res, io));
app.get("/api/contacts", (req, res) => getAvailableContacts(req, res));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});