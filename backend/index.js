const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const dotenv = require('dotenv');
const initDatabase = require('./configs/database');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Link database
initDatabase();

// Allowed origins (supports multiple for dev flexibility)
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3100',
  'http://localhost:3000',
  'http://localhost:3100',
];

// Realtime layer
const io = socketio(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.set('io', io);

// Security
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(mongoSanitize());
app.use(xss());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { ok: false, msg: 'Too many requests, slow down.' },
});
app.use('/api', generalLimiter);

const tightLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { ok: false, msg: 'Too many attempts, try later.' },
});

// CORS — must come before routes, handles preflight OPTIONS automatically
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploaded files
app.use('/assets_uploaded', express.static(path.join(__dirname, 'assets_uploaded')));

// Mount API groups
app.use('/api/identity', tightLimiter, require('./api/identityRoutes'));
app.use('/api/listings', require('./api/listingRoutes'));
app.use('/api/stays', require('./api/stayRoutes'));
app.use('/api/petitions', require('./api/petitionRoutes'));
app.use('/api/wishlist', require('./api/wishlistRoutes'));
app.use('/api/chat', require('./api/chatRoutes'));
app.use('/api/alerts', require('./api/alertRoutes'));
app.use('/api/account', require('./api/accountRoutes'));
app.use('/api/manager', require('./api/managerRoutes'));

app.get('/api/ping', (req, res) => {
  res.json({ ok: true, msg: 'HouseRman backend is alive', time: new Date() });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, msg: 'Endpoint not found' });
});

const { errorGuard } = require('./guards/errorGuard');
app.use(errorGuard);

// ─── Socket.io ────────────────────────────────────────────────────────────────
const liveAccounts = new Map();

io.on('connection', (socket) => {
  console.log('Socket linked:', socket.id);

  socket.on('account_online', (accountId) => {
    if (accountId) {
      liveAccounts.set(accountId, socket.id);
      socket.join(accountId);
      io.emit('live_accounts', Array.from(liveAccounts.keys()));
    }
  });

  socket.on('join_thread', (threadTag) => {
    if (threadTag) socket.join(threadTag);
  });

  socket.on('leave_thread', (threadTag) => {
    if (threadTag) socket.leave(threadTag);
  });

  socket.on('thread_typing', ({ threadTag, accountId }) => {
    socket.to(threadTag).emit('peer_typing', { accountId });
  });

  socket.on('thread_stop_typing', ({ threadTag }) => {
    socket.to(threadTag).emit('peer_stop_typing');
  });

  socket.on('disconnect', () => {
    for (const [accountId, sId] of liveAccounts.entries()) {
      if (sId === socket.id) { liveAccounts.delete(accountId); break; }
    }
    io.emit('live_accounts', Array.from(liveAccounts.keys()));
  });
});

const PORT = process.env.PORT || 4500;
server.listen(PORT, () => {
  console.log(`\nHouseRman backend running on port ${PORT}`);
  console.log(`Realtime layer ready`);
  console.log(`API root: http://localhost:${PORT}/api\n`);
});

module.exports = { app, io };
