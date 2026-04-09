const User = require('../models/User');
const Match = require('../models/Match');

let onlineUsers = new Map();

exports.setupSocket = (io) => {
  io.on('connection', async (socket) => {
    console.log('User connected:', socket.id);

    // User online
    socket.on('user-online', async (userId) => {
      onlineUsers.set(userId.toString(), socket.id);
      
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date()
      });

      io.emit('user-status-update', { userId, isOnline: true });
    });

    // Join match room
    socket.on('join-match', (matchId) => {
      socket.join(`match_${matchId}`);
    });

    // Send message
    socket.on('send-message', async (data) => {
      const { matchId, senderId, receiverId, content, type } = data;
      
      // Save message to DB (implement your message model)
      
      io.to(`match_${matchId}`).emit('new-message', {
        matchId,
        senderId,
        receiverId,
        content,
        type,
        createdAt: new Date()
      });
    });

    // Call events
    socket.on('call-user', (data) => {
      io.to(onlineUsers.get(data.userToCall.toString())).emit('incoming-call', {
        signal: data.signalData,
        from: data.from
      });
    });

    socket.on('accept-call', (data) => {
      io.to(onlineUsers.get(data.to)).emit('call-accepted', data.signal);
    });

    // User disconnect
    socket.on('disconnect', async () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date()
          });
          onlineUsers.delete(userId);
          io.emit('user-status-update', { userId, isOnline: false });
          break;
        }
      }
    });
  });
};