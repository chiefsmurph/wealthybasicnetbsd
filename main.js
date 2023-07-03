import Game from './game_logic';
import { GRID_SIZE, WINDOW_SIZE, SCREEN_SIZE, WHITE, SCORE_AREA_HEIGHT } from './constants';


const GameState = {
  MAIN_MENU: 1,
  GAME: 2,
};

let game_state = GameState.MAIN_MENU;
let game = null;

class Button {
  constructor(color, x, y, width, height, text = '') {
    this.color = color;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
  }

  draw(ctx, outline = null) {
    if (outline) {
      ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
    }
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    if (this.text !== '') {
      ctx.fillStyle = 'black';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
    }
  }

  isOver(pos) {
    return (
      this.x < pos[0] &&
      pos[0] < this.x + this.width &&
      this.y < pos[1] &&
      pos[1] < this.y + this.height
    );
  }
}

function drawMainMenu(screen) {

  const { context: ctx, canvas } = screen;

  // Redefine buttons and their positions
  const btnWidth = 240;
  const btnHeight = 50;
  const btnX = (SCREEN_SIZE - btnWidth) / 2;
  const btnY = SCREEN_SIZE / 4 - btnHeight;
  const startBtn = new Button('#90ee90', btnX, btnY + btnHeight + 20, btnWidth, btnHeight, 'Start First');
  const secondBtn = new Button('#90ee90', btnX, btnY + btnHeight * 3, btnWidth, btnHeight, 'Start Second');

  // Grid buttons in a 3x3 format, closely spaced
  const gridSizeBtnWidth = 70;
  const gridSizeBtnHeight = 70;
  const gridSizeBtnX = (SCREEN_SIZE - gridSizeBtnWidth * 3) / 2;
  const gridSizeBtnY = btnY + btnHeight * 5 + 20;
  const gridButtons = [];
  for (let i = 0; i < 9; i++) {
    gridButtons.push(new Button('#00ff00', gridSizeBtnX + gridSizeBtnWidth * (i % 3), gridSizeBtnY + gridSizeBtnHeight * Math.floor(i / 3), gridSizeBtnWidth, gridSizeBtnHeight, `${i + 3}`));
  }

  // Change color of play button to yellow
  const playBtn = new Button('#ffff00', (SCREEN_SIZE - btnWidth) / 2, gridSizeBtnY + gridSizeBtnHeight * 3 + 30, btnWidth, btnHeight, 'Play');

  let human_turn = null;
  let grid_size = null;

  function handleMouseDown(event) {
    console.log(event);
    const rect = canvas.getBoundingClientRect();
    const pos = [
      event.clientX - rect.left,
      event.clientY - rect.top,
    ];

    if (startBtn.isOver(pos)) {
      human_turn = true;
      startBtn.color = '#0000ff';
      secondBtn.color = '#00ff00';
    }
    if (secondBtn.isOver(pos)) {
      human_turn = false;
      secondBtn.color = '#0000ff';
      startBtn.color = '#00ff00';
    }
    for (let i = 0; i < gridButtons.length; i++) {
      const btn = gridButtons[i];
      if (btn.isOver(pos)) {
        grid_size = i + 3;
        btn.color = '#0000ff';
        for (let j = 0; j < gridButtons.length; j++) {
          if (i !== j) {
            gridButtons[j].color = '#00ff00';
          }
        }
      }
    }
    if (playBtn.isOver(pos) && human_turn !== null && grid_size !== null) {
      startGame(human_turn, grid_size);
    }
    render();
  }

  function handleMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    const pos = [
      event.clientX - rect.left,
      event.clientY - rect.top,
    ];

    if (startBtn.isOver(pos)) {
      if (human_turn !== true) {
        startBtn.color = '#ff0000';
      }
    } else {
      if (human_turn !== true) {
        startBtn.color = '#00ff00';
      }
    }
    if (secondBtn.isOver(pos)) {
      if (human_turn !== false) {
        secondBtn.color = '#ff0000';
      }
    } else {
      if (human_turn !== false) {
        secondBtn.color = '#00ff00';
      }
    }
    for (const btn of gridButtons) {
      if (btn.isOver(pos)) {
        if (grid_size !== parseInt(btn.text.split(' ')[-1])) {
          btn.color = '#ff0000';
        }
      } else {
        if (grid_size !== parseInt(btn.text.split(' ')[-1])) {
          btn.color = '#00ff00';
        }
      }
    }
    if (playBtn.isOver(pos)) {
      playBtn.color = '#ffff00';
    } else {
      playBtn.color = '#ffff00';
    }
  }

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);

  function render() {
    ctx.clearRect(0, 0, SCREEN_SIZE, SCREEN_SIZE + SCORE_AREA_HEIGHT);

    // Draw the "Choose Play Order" text
    ctx.fillStyle = 'black';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Choose Play Order', SCREEN_SIZE / 2, btnY - 10);

    startBtn.draw(ctx, '#000000');
    secondBtn.draw(ctx, '#000000');

    // Draw the "Choose Grid Size" text
    ctx.fillText('Choose Grid Size', SCREEN_SIZE / 2, gridSizeBtnY - 40);

    for (const btn of gridButtons) {
      btn.draw(ctx, '#000000');
    }

    playBtn.draw(ctx, '#000000');
  }

  render();
}

function drawGameScreen(ctx) {
  // Draw the game logic here
  // ...
  game.draw_lines(ctx);
  game.display_scores(ctx);

  // Draw the restart button
  const restartBtn = new Button('#ff0000', SCREEN_SIZE - 210, SCREEN_SIZE + SCORE_AREA_HEIGHT - 60, 200, 50, 'Restart');
  restartBtn.draw(ctx, '#000000');
}

function startGame(humanTurn, gridSize) {
  game_state = GameState.GAME;
  game = new Game(humanTurn, gridSize);

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (game_state === GameState.GAME) {
      drawGameScreen(ctx);
      // Update and draw the game logic here
      // ...
    }

    requestAnimationFrame(gameLoop);
  }

  gameLoop();
}

export function main(screen) {
  const { canvas, context } = screen;
  canvas.width = WINDOW_SIZE.width;
  canvas.height = WINDOW_SIZE.height + SCORE_AREA_HEIGHT;

  if (game_state === GameState.MAIN_MENU) {
    drawMainMenu(screen);
  }
}

document.addEventListener('DOMContentLoaded', () => main(document.getElementById('gameCanvas')));
