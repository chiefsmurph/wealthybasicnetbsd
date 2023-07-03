class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

class Font {
  constructor(name, size) {
    this.name = name;
    this.size = size;
  }

  render(text, antialias, color) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${this.size}px ${this.name}`;
    context.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    context.fillText(text, 0, this.size);

    const surface = new Surface({ width: context.measureText(text).width, height: this.size });
    surface.context.drawImage(canvas, 0, 0);

    return surface;
  }
}

class Rect {
  constructor(left, top, width, height) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
  }
}

class Surface {
  constructor(size) {
    this.size = size;
    this.canvas = document.createElement('canvas');
    this.canvas.width = size.width;
    this.canvas.height = size.height;
    this.context = this.canvas.getContext('2d');
  }

  fill(color) {
    this.context.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  blit(textSurface, rect) {
    this.context.drawImage(textSurface.canvas, rect.left, rect.top);
  }
}

class Mouse {
  getPos(event) {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return [x, y];
  }
}

const mouse = new Mouse();

const GameState = {
  MAIN_MENU: 1,
  GAME: 2
};

const LINE_THICKNESS = 5;
const DOT_RADIUS = 7;
const SCREEN_SIZE = 850; // 600 for the game grid + 40 for padding
const SCORE_AREA_HEIGHT = 200;
const WINDOW_SIZE = new Rect(0, 0, SCREEN_SIZE, SCREEN_SIZE + SCORE_AREA_HEIGHT);

const WHITE = new Color(255, 255, 255);
const RED = new Color(255, 0, 0);
const BLUE = new Color(0, 0, 255);
const BLACK = new Color(0, 0, 0);
const LIGHT_GRAY = new Color(200, 200, 200);

const PLAYER_COLORS = [RED, BLUE];

class Button {
  constructor(color, x, y, width, height, text = '') {
    this.color = color;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.text = text;
  }

  draw(screen, outline = null) {
    if (outline) {
      screen.context.strokeStyle = `rgb(${outline.r}, ${outline.g}, ${outline.b})`;
      screen.context.lineWidth = 2;
      screen.context.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
    }
    screen.context.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
    screen.context.fillRect(this.x, this.y, this.width, this.height);
    if (this.text !== '') {
      const font = new Font('Arial', 25);
      const textSurface = font.render(this.text, true, BLACK);
      screen.blit(textSurface, new Rect(this.x + (this.width / 2 - textSurface.size.width / 2), this.y + (this.height / 2 - textSurface.size.height / 2)));
    }
  }

  isOver(pos) {
    if (this.x < pos[0] && pos[0] < this.x + this.width) {
      if (this.y < pos[1] && pos[1] < this.y + this.height) {
        return true;
      }
    }
    return false;
  }
}

module.exports = {
  Color,
  Font,
  Rect,
  Surface,
  mouse,
  GameState,
  LINE_THICKNESS,
  DOT_RADIUS,
  SCREEN_SIZE,
  SCORE_AREA_HEIGHT,
  WINDOW_SIZE,
  WHITE,
  RED,
  BLUE,
  BLACK,
  LIGHT_GRAY,
  PLAYER_COLORS,
  Button
};
