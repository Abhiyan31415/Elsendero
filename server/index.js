import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';

import roomRouter from './routes/roomRouter.js';
import userRouter from './routes/userRouter.js';
import messageRouter from './routes/messageRouter.js';
import trialRouter from './routes/trialRouter.js';
import eventRoutes from './routes/eventRoutes.js';
import Message from './models/Message.js';
import { MAX_MESSAGE_LENGTH } from './controllers/MessageController.js';
import auth from './middleware/auth.js';
import { verifyToken } from './utils/token.js';

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------
const REQUIRED_ENV = ['MONGO_CONNECT', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(
    `FATAL: missing required environment variable(s): ${missingEnv.join(', ')}. ` +
      'Set them in server/.env (see .env.example) or in your hosting provider.'
  );
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const port = process.env.PORT || 5000;

// Comma-separated list, e.g. "https://elsendero.netlify.app,http://localhost:5173"
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients (curl, health checks) that send no Origin header.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'ngrok-skip-browser-warning'],
  credentials: true,
};

// ---------------------------------------------------------------------------
// App / server / socket
// ---------------------------------------------------------------------------
const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'ngrok-skip-browser-warning'],
    credentials: true,
  },
});

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// ---------------------------------------------------------------------------
// Uploads
// ---------------------------------------------------------------------------
const ALLOWED_IMAGE = /jpeg|jpg|png/;

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z.]/g, '');
    const base =
      path
        .basename(file.originalname, path.extname(file.originalname))
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50) || 'image';
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    const extOk = ALLOWED_IMAGE.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = ALLOWED_IMAGE.test(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    return cb(new Error('Only JPEG and PNG images are allowed'));
  },
}).single('image');

app.post('/upload', auth, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      const message =
        err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 1MB)' : err.message || 'Upload failed';
      return res.status(400).json({ success: false, message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file selected!' });
    }
    return res.status(200).json({
      success: true,
      message: 'File uploaded!',
      filePath: `/uploads/${req.file.filename}`,
    });
  });
});

app.get('/images', (req, res) => {
  fs.readdir(UPLOADS_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Unable to scan files!' });
    }
    const images = files.filter((f) => !f.startsWith('.')).map((file) => `/uploads/${file}`);
    return res.status(200).json({ images });
  });
});

app.use('/uploads', express.static(UPLOADS_DIR, { dotfiles: 'ignore' }));

app.get('/api/images/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  res.sendFile(path.join(UPLOADS_DIR, filename), (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ success: false, message: 'Image not found' });
    }
  });
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/events', eventRoutes);
app.use('/messages', messageRouter);
app.use('/room', roomRouter);
app.use('/user', userRouter);
app.use('/trial', trialRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Page not found' });
});

// Final error handler (must have 4 args)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  if (res.headersSent) return;
  res.status(status).json({
    success: false,
    message: status < 500 && err.expose !== false ? err.message || 'Bad request' : 'Server error',
  });
});

// ---------------------------------------------------------------------------
// Socket.io
// ---------------------------------------------------------------------------
// Optional auth: clients pass `io(url, { auth: { token } })`. Valid token →
// socket.data.user is set. No/invalid token → connects read-only.
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  socket.data.user = null;
  if (typeof token === 'string' && token) {
    try {
      socket.data.user = verifyToken(token.replace(/^Bearer\s+/i, ''));
    } catch {
      socket.data.user = null;
    }
  }
  next();
});

io.on('connection', (socket) => {
  socket.on('join room', (eventId) => {
    if (typeof eventId === 'string' && eventId) {
      socket.join(eventId);
    } else {
      socket.emit('error', 'Event ID is required to join a room');
    }
  });

  socket.on('chat message', async (msg) => {
    const user = socket.data.user;
    if (!user) {
      return socket.emit('error', 'Not authorized, please log in again');
    }

    const { eventId, content } = msg || {};
    if (typeof eventId !== 'string' || !eventId) {
      return socket.emit('error', 'Event ID is required.');
    }
    if (typeof content !== 'string' || !content.trim() || content.length > MAX_MESSAGE_LENGTH) {
      return socket.emit('error', `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters`);
    }

    try {
      const message = await Message.create({
        eventId,
        userId: user.id,
        username: user.name,
        content: content.trim(),
      });
      io.to(eventId).emit('chat message', message);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', 'Unable to send message');
    }
  });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECT, { serverSelectionTimeoutMS: 10000 });
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down`);
  // io.close() also closes the underlying HTTP server.
  io.close(() => {
    mongoose.connection.close(false).finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
