const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Join default room initially
  socket.join('default');
  socket.room = 'default';

  // Handle room join
  socket.on('joinRoom', (room) => {
    if (socket.room) {
      socket.leave(socket.room);
    }
    socket.join(room);
    socket.room = room;
    console.log(`User joined room: ${room}`);
  });

  // When a drawing event is received from a client, broadcast it to others in the same room
  socket.on('drawing', (data) => {
    const room = socket.room || 'default';
    socket.to(room).emit('drawing', data);
  });

  socket.on('disconnect', () => {
  console.log('User disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
