// index.js
import './styles.css';
import { main } from './main';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const context = canvas.getContext('2d');
  const screen = {
    canvas,
    context,
    drawRect: (x, y, width, height, color) => {
      context.fillStyle = color;
      context.fillRect(x, y, width, height);
    },
    blit: (text, x, y) => {
      context.fillStyle = 'black';
      context.fillText(text, x, y);
    },
  };

  main(screen);
});
