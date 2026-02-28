require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const roomManager = require('./roomManager');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'NearMeet Signaling Server' });
});

// Room info endpoint
app.get('/api/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const count = roomManager.getRoomCount(roomId);
  res.json({ roomId, participantCount: count });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[Connect] ${socket.id}`);

  // Join room
  socket.on('join-room', ({ roomId, displayName }) => {
    const user = {
      socketId: socket.id,
      displayName: displayName || 'Anonymous',
      isMuted: false,
      isCameraOff: false,
      isScreenSharing: false,
    };

    const result = roomManager.joinRoom(roomId, user);

    if (!result.success) {
      socket.emit('room-full', { reason: result.reason });
      return;
    }

    socket.join(roomId);

    // Send existing peers to the new user
    socket.emit('room-peers', {
      peers: result.peers,
      roomId,
    });

    // Notify others that a new user joined
    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      displayName: user.displayName,
      isMuted: user.isMuted,
      isCameraOff: user.isCameraOff,
    });

    console.log(`[Join] ${displayName} (${socket.id}) -> Room ${roomId} (${roomManager.getRoomCount(roomId)} users)`);
  });

  // WebRTC Signaling: Offer
  socket.on('offer', ({ to, offer }) => {
    socket.to(to).emit('offer', {
      from: socket.id,
      offer,
    });
  });

  // WebRTC Signaling: Answer
  socket.on('answer', ({ to, answer }) => {
    socket.to(to).emit('answer', {
      from: socket.id,
      answer,
    });
  });

  // WebRTC Signaling: ICE Candidate
  socket.on('ice-candidate', ({ to, candidate }) => {
    socket.to(to).emit('ice-candidate', {
      from: socket.id,
      candidate,
    });
  });

  // Toggle mute status
  socket.on('user-toggle-mute', ({ roomId, isMuted }) => {
    const found = roomManager.getUserBySocketId(socket.id);
    if (found) {
      roomManager.updateUser(found.roomId, socket.id, { isMuted });
      socket.to(found.roomId).emit('user-toggle-mute', {
        socketId: socket.id,
        isMuted,
      });
    }
  });

  // Toggle camera status
  socket.on('user-toggle-camera', ({ roomId, isCameraOff }) => {
    const found = roomManager.getUserBySocketId(socket.id);
    if (found) {
      roomManager.updateUser(found.roomId, socket.id, { isCameraOff });
      socket.to(found.roomId).emit('user-toggle-camera', {
        socketId: socket.id,
        isCameraOff,
      });
    }
  });

  // Screen share started
  socket.on('screen-share-started', ({ roomId }) => {
    const found = roomManager.getUserBySocketId(socket.id);
    if (found) {
      roomManager.updateUser(found.roomId, socket.id, { isScreenSharing: true });
      socket.to(found.roomId).emit('screen-share-started', {
        socketId: socket.id,
        displayName: found.user.displayName,
      });
    }
  });

  // Screen share stopped
  socket.on('screen-share-stopped', ({ roomId }) => {
    const found = roomManager.getUserBySocketId(socket.id);
    if (found) {
      roomManager.updateUser(found.roomId, socket.id, { isScreenSharing: false });
      socket.to(found.roomId).emit('screen-share-stopped', {
        socketId: socket.id,
      });
    }
  });

  // Chat message
  socket.on('chat-message', ({ roomId, message }) => {
    const found = roomManager.getUserBySocketId(socket.id);
    if (found) {
      const chatMsg = {
        id: `${socket.id}-${Date.now()}`,
        senderId: socket.id,
        senderName: found.user.displayName,
        message,
        timestamp: new Date().toISOString(),
      };
      // Send to everyone in room including sender
      io.to(found.roomId).emit('chat-message', chatMsg);
    }
  });

  // Update display name
  socket.on('update-display-name', ({ displayName }) => {
    const found = roomManager.getUserBySocketId(socket.id);
    if (found) {
      roomManager.updateUser(found.roomId, socket.id, { displayName });
      socket.to(found.roomId).emit('user-updated', {
        socketId: socket.id,
        displayName,
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    const found = roomManager.getUserBySocketId(socket.id);
    if (found) {
      const { roomId, user } = found;
      roomManager.leaveRoom(roomId, socket.id);

      socket.to(roomId).emit('user-left', {
        socketId: socket.id,
        displayName: user.displayName,
      });

      console.log(`[Leave] ${user.displayName} (${socket.id}) <- Room ${roomId} (${roomManager.getRoomCount(roomId)} users)`);
    }
    console.log(`[Disconnect] ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n  🚀 NearMeet Signaling Server`);
  console.log(`  → Running on http://localhost:${PORT}`);
  console.log(`  → Accepting clients from ${CLIENT_URL}\n`);
});
