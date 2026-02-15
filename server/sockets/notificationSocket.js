module.exports = (io) => {
  io.on('connection', socket => {
    // 2.2 Socket.io Backend Setup
    socket.on('join', userId => {
      // Support existing object format if needed, but primarily strings as per prompt
      if (typeof userId === 'string') {
        socket.join(userId);
      } else if (userId && userId.id) {
          socket.join(userId.id);
      }
    });
  });
};
