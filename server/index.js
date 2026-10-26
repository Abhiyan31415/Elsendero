import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

import roomRouter from './routes/roomRouter.js';
import userRouter from './routes/userRouter.js';
import messageRouter from './routes/messageRouter.js';
import trialRouter from './routes/trialRouter.js';
import eventRoutes from './routes/eventRoutes.js';
import { migrate, pool } from './db/index.js';
import { saveMessage, listMessages } from './db/messages.js';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 5000;
// Public address of this API, used to build absolute image URLs.
const publicUrl = (process.env.PUBLIC_URL || `http://localhost:${port}`).replace(/\/$/, '');
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const allowedOrigins = [
  'http://localhost:5173',
  'https://elsendero.netlify.app',
  'https://elsendero.abhiyankhanal1.com.np',
  ...(process.env.EXTRA_ORIGINS ? process.env.EXTRA_ORIGINS.split(',') : []),
];

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: allowedOrigins } });

app.use(cors({
  origin: allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Image uploads (max 1 MB, jpg/png only)
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const safe = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${safe}`);
    },
  }),
  limits: { fileSize: 1_000_000 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png/;
    if (ok.test(path.extname(file.originalname).toLowerCase()) && ok.test(file.mimetype)) {
      return cb(null, true);
    }
    cb('Error: Images Only!');
  },
}).single('image');

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ message: String(err.message || err) });
    if (!req.file) return res.status(400).json({ message: 'No file selected!' });
    res.status(200).json({
      message: 'File uploaded!',
      filePath: `${publicUrl}/uploads/${req.file.filename}`,
    });
  });
});

app.get('/images', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.status(500).json({ message: 'Unable to scan files!' });
    res.status(200).json({ images: files.map((f) => `${publicUrl}/uploads/${f}`) });
  });
});

app.use('/uploads', express.static(uploadsDir));
app.get('/api/images/:filename', (req, res) => {
  res.sendFile(path.join(uploadsDir, path.basename(req.params.filename)));
});

app.use('/api/events', eventRoutes);
app.use('/messages', messageRouter);
app.use('/room', roomRouter);
app.use('/user', userRouter);
app.use('/trial', trialRouter);

app.get('/', (req, res) => res.json({ message: 'Hello World' }));
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});
app.use((req, res) => res.status(404).json({ message: 'Page not found' }));

io.on('connection', (socket) => {
  socket.on('join room', (eventId) => {
    if (eventId) socket.join(String(eventId));
    else socket.emit('error', 'Event ID is required to join a room');
  });

  socket.on('chat message', async (msg) => {
    const { eventId, userId, username, content } = msg || {};
    if (!eventId) return socket.emit('error', 'Event ID is required.');
    try {
      const message = await saveMessage({ eventId, userId, username, content });
      io.to(String(eventId)).emit('chat message', message);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });
});

app.get('/messages', async (req, res) => {
  if (!req.query.eventId) return res.status(400).json({ error: 'Event ID is required' });
  try {
    res.json(await listMessages(req.query.eventId));
  } catch {
    res.status(500).json({ error: 'Unable to retrieve messages' });
  }
});

const startServer = async () => {
  try {
    await migrate();
    server.listen(port, '127.0.0.1', () => console.log(`Server is running on port ${port}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
