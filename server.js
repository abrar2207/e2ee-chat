// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

let clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);

  ws.on('message', (message) => {
    try {
      const decoded = decodeURIComponent(escape(atob(message.toString())));
      const msgObj = JSON.parse(decoded);

      // Broadcast only to users in the same room
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message.toString()); // already encrypted
        }
      });
    } catch (err) {
      console.log('❌ Message parse error:', err.message);
    }
  });

  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
