import websocket from 'ws';
import dotenv from 'dotenv';
dotenv.config();
import { verifyToken } from '../utils/jwt.js';

const wss = new websocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });
});