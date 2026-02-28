// Room manager - in-memory room state management
class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, []);
    }
    return this.rooms.get(roomId);
  }

  joinRoom(roomId, user) {
    const room = this.createRoom(roomId);
    // Max 8 participants
    if (room.length >= 8) {
      return { success: false, reason: 'Room is full (max 8 participants)' };
    }
    // Check if already in room
    const existing = room.find(u => u.socketId === user.socketId);
    if (!existing) {
      room.push(user);
    }
    return { success: true, peers: room.filter(u => u.socketId !== user.socketId) };
  }

  leaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    const userIndex = room.findIndex(u => u.socketId === socketId);
    if (userIndex === -1) return null;
    
    const user = room[userIndex];
    room.splice(userIndex, 1);
    
    // Clean up empty rooms
    if (room.length === 0) {
      this.rooms.delete(roomId);
    }
    
    return user;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId) || [];
  }

  getRoomCount(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.length : 0;
  }

  getUserBySocketId(socketId) {
    for (const [roomId, users] of this.rooms.entries()) {
      const user = users.find(u => u.socketId === socketId);
      if (user) {
        return { roomId, user };
      }
    }
    return null;
  }

  updateUser(roomId, socketId, updates) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    const user = room.find(u => u.socketId === socketId);
    if (user) {
      Object.assign(user, updates);
    }
    return user;
  }

  getRoomList() {
    const list = {};
    for (const [roomId, users] of this.rooms.entries()) {
      list[roomId] = users.length;
    }
    return list;
  }
}

module.exports = new RoomManager();
