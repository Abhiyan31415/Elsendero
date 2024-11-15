import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import fs from 'fs';

import roomRouter from './routes/roomRouter.js';
import userRouter from './routes/userRouter.js';
import messageRouter from './routes/messageRouter.js';
import Message from './models/Message.js';
import trialRouter from './routes/trialRouter.js';
import eventRoutes from './routes/eventRoutes.js';

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const corsOptions = {
  origin: 'http://localhost:5173', // Replace with your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
    
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}
let _ID_;
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).single('image');

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    _ID_=req.body.userId
    if (err) {
      res.status(400).json({ message: err });
    } else {
      if (req.file == undefined) {
        res.status(400).json({ message: 'No file selected!' });
      } else {
        res.status(200).json({
          message: 'File uploaded!',
          filePath: `/uploads/${req.file.filename}`,
        });
      }
    }
  });
});

app.get('/images', (req, res) => {
  const directoryPath = path.join(__dirname, 'uploads');
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Unable to scan files!' });
    }
    const images = files.map(file => `/uploads/${file}`);
    res.status(200).json({ images });
  });
});

app.use('/uploads', express.static('uploads'));

//pp.use('/images', express.static(path.join(__dirname, 'uploads')));

app.get('/api/images/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, 'uploads', filename));
});
// CORS setup
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'file://');
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
  next();
});
app.use('/api/events', eventRoutes);
app.use('/messages', messageRouter);
app.use('/room', roomRouter);
app.use('/user', userRouter);
app.use('/trial', trialRouter); 

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});
app.use((req, res) => {
  res.status(404).json({ message: 'Page not found' });
});

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle joining a specific event room
  socket.on("join room", (eventId) => {
      if (eventId) {
          socket.join(eventId);
          console.log(`User joined room: ${eventId}`);
      } else {
          socket.emit("error", "Event ID is required to join a room");
      }
  });

  // Handle sending a chat message to a specific room
  socket.on("chat message", async (msg) => {
    console.log("Received message data:", msg); // Debugging

    const { eventId, userId, username, content } = msg;

    if (!eventId) {
        console.error("Error: Event ID is missing in the message data.");
        return socket.emit("error", "Event ID is required.");
    }

    try {
        const message = new Message({ eventId, userId, username, content });
        await message.save();
        console.log("Message saved:", message);
        io.to(eventId).emit("chat message", message); // Broadcast to event room
    } catch (error) {
        console.error("Error saving message:", error);
    }
});


  socket.on("disconnect", () => {
      console.log("A user disconnected");
  });
});


app.get("/messages", async (req, res) => {
  const { eventId } = req.query;

  if (!eventId) {
      return res.status(400).json({ error: "Event ID is required" });
  }

  try {
      const messages = await Message.find({ eventId }).sort({ timestamp: 1 }).limit(50);
      res.json(messages);
  } catch (error) {
      res.status(500).json({ error: "Unable to retrieve messages" });
  }
});


const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECT, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    server.listen(port, () => console.log(`Server is running on port ${port}`));
  } catch (error) {
    console.log("Failed to start server:", error);
  }
};

startServer();