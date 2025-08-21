const socket = io();

// DOM elements for lobby controls
const joinButton = document.getElementById('joinButton');
const roomInput = document.getElementById('roomInput');

// Emit joinRoom when user clicks join
if (joinButton && roomInput) {
  joinButton.addEventListener('click', () => {
    const room = roomInput.value.trim() || 'default';
    socket.emit('joinRoom', room);
  });
}

// Join default room on initial connection
socket.on('connect', () => {
  socket.emit('joinRoom', 'default');
});

// Canvas setup
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

let drawing = false;
let current = {
  x: 0,
  y: 0,
  color: document.getElementById('colorPicker').value,
  size: parseInt(document.getElementById('brushSize').value, 10)
};

// Tool controls
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');

colorPicker.addEventListener('change', () => {
  current.color = colorPicker.value;
});

brushSize.addEventListener('change', () => {
  current.size = parseInt(brushSize.value, 10);
});

// Mouse events
canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

// Touch events
canvas.addEventListener('touchstart', onTouchStart, false);
canvas.addEventListener('touchend', onTouchEnd, false);
canvas.addEventListener('touchcancel', onTouchEnd, false);
canvas.addEventListener('touchmove', throttle(onTouchMove, 10), false);

// Listen for drawing events from server
socket.on('drawing', onDrawingEvent);

function drawLine(x0, y0, x1, y1, color, size, emit) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.stroke();
  ctx.closePath();

  if (!emit) return;
  const w = canvas.width;
  const h = canvas.height;
  socket.emit('drawing', {
    x0: x0 / w,
    y0: y0 / h,
    x1: x1 / w,
    y1: y1 / h,
    color: color,
    size: size
  });
}

function onMouseDown(e) {
  drawing = true;
  current.x = e.clientX - canvas.getBoundingClientRect().left;
  current.y = e.clientY - canvas.getBoundingClientRect().top;
}

function onMouseUp(e) {
  if (!drawing) return;
  drawing = false;
  const x = e.clientX - canvas.getBoundingClientRect().left;
  const y = e.clientY - canvas.getBoundingClientRect().top;
  drawLine(current.x, current.y, x, y, current.color, current.size, true);
}

function onMouseMove(e) {
  if (!drawing) return;
  const x = e.clientX - canvas.getBoundingClientRect().left;
  const y = e.clientY - canvas.getBoundingClientRect().top;
  drawLine(current.x, current.y, x, y, current.color, current.size, true);
  current.x = x;
  current.y = y;
}

function onTouchStart(e) {
  if (e.touches.length !== 1) return;
  e.preventDefault();
  drawing = true;
  const touch = e.touches[0];
  current.x = touch.clientX - canvas.getBoundingClientRect().left;
  current.y = touch.clientY - canvas.getBoundingClientRect().top;
}

function onTouchEnd(e) {
  if (!drawing) return;
  e.preventDefault();
  drawing = false;
}

function onTouchMove(e) {
  if (!drawing) return;
  e.preventDefault();
  const touch = e.touches[0];
  const x = touch.clientX - canvas.getBoundingClientRect().left;
  const y = touch.clientY - canvas.getBoundingClientRect().top;
  drawLine(current.x, current.y, x, y, current.color, current.size, true);
  current.x = x;
  current.y = y;
}

function onDrawingEvent(data) {
  const w = canvas.width;
  const h = canvas.height;
  drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.size, false);
}

function throttle(callback, delay) {
  let previousCall = Date.now();
  return function() {
    const time = Date.now();
    if ((time - previousCall) >= delay) {
      previousCall = time;
      callback.apply(null, arguments);
    }
  };
}
