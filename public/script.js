const socket = io();
const canvas = document.getElementById('drawingCanvas');
const context = canvas.getContext('2d');
let drawing = false;
let current = {};

function drawLine(x0, y0, x1, y1, emit) {
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.strokeStyle = 'black';
  context.lineWidth = 2;
  context.stroke();
  context.closePath();

  if (!emit) return;
  const w = canvas.width;
  const h = canvas.height;
  socket.emit('drawing', {
    x0: x0 / w,
    y0: y0 / h,
    x1: x1 / w,
    y1: y1 / h,
  });
}

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  current.x = e.offsetX;
  current.y = e.offsetY;
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
});

canvas.addEventListener('mouseout', () => {
  drawing = false;
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  drawLine(current.x, current.y, e.offsetX, e.offsetY, true);
  current.x = e.offsetX;
  current.y = e.offsetY;
});

// Handle incoming drawing data
socket.on('drawing', (data) => {
  const w = canvas.width;
  const h = canvas.height;
  drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, false);
});
