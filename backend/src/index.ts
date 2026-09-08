import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { WebSocketServer, WebSocket } from 'ws';
import { config } from './config';
import apiRouter from './routes/api';

const app = express();
const server = http.createServer(app);

// 1. Security & Body Parsing Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-bridge-token'],
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// 2. Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'BẠC MÔN HUB Core Backend API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 3. Mount API Routes
app.use('/api', apiRouter);

// 4. WebSocket Server for Realtime MT5 Updates & Notifications
const wss = new WebSocketServer({ server, path: '/ws' });

const connectedClients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  connectedClients.add(ws);
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Connected to Bạc Môn HUB Realtime Stream' }));

  ws.on('close', () => {
    connectedClients.delete(ws);
  });
});

// Broadcast helper
export function broadcastWsMessage(data: any) {
  const payload = JSON.stringify(data);
  for (const client of connectedClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// 5. Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi nội bộ máy chủ',
    error: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// 6. Start Server
server.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 BẠC MÔN HUB Backend API Server đang chạy`);
  console.log(`   - HTTP REST API: http://localhost:${config.port}/api`);
  console.log(`   - WebSocket:     ws://localhost:${config.port}/ws`);
  console.log(`   - Health Check:  http://localhost:${config.port}/health`);
  console.log(`=======================================================`);
});

export default app;
