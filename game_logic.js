const LINE_THICKNESS = 5;
const DOT_RADIUS = 7;
const SCREEN_SIZE = 850; // 600 for the game grid + 40 for padding
const SCORE_AREA_HEIGHT = 200;
const WINDOW_SIZE = [SCREEN_SIZE, SCREEN_SIZE + SCORE_AREA_HEIGHT];

const WHITE = [255, 255, 255];
const RED = [255, 0, 0];
const BLUE = [0, 0, 255];
const BLACK = [0, 0, 0];
const LIGHT_GRAY = [200, 200, 200];

const PLAYER_COLORS = [RED, BLUE];

class Game {
  constructor(human_turn = true, GRID_SIZE = 3) {
    this.current_player = 1;
    this.hlines = Array.from({ length: GRID_SIZE + 1 }, () =>
      new Array(GRID_SIZE).fill(null)
    );
    this.vlines = Array.from({ length: GRID_SIZE }, () =>
      new Array(GRID_SIZE + 1).fill(null)
    );
    this.squares = Array.from({ length: GRID_SIZE }, () =>
      new Array(GRID_SIZE).fill(0)
    );
    this.GRID_SIZE = GRID_SIZE;
    this.square_counter = 1;
    this.game_over = false;
    this.human_turn = human_turn; // Set this based on the passed parameter
    this.game_end_timer = null;
    this.square_completed_last_turn = false;
    this.box_size = (SCREEN_SIZE - 40) / GRID_SIZE;
    this.numstring = new Array(GRID_SIZE ** 2).fill(0);
  }

  update_line(x, y) {
    let min_distance = Infinity;
    let min_line = null;
    let min_type = null;

    for (let i = 0; i < this.GRID_SIZE + 1; i++) {
      for (let j = 0; j < this.GRID_SIZE; j++) {
        const mid_h = [j * this.box_size + this.box_size / 2, i * this.box_size];
        const distance_h = Math.hypot(mid_h[0] - x, mid_h[1] - y);
        if (
          j < this.GRID_SIZE &&
          !this.hlines[i][j] &&
          distance_h < min_distance
        ) {
          min_distance = distance_h;
          min_line = [i, j];
          min_type = 'h';
        }
      }

      for (let j = 0; j < this.GRID_SIZE + 1; j++) {
        const mid_v = [j * this.box_size, i * this.box_size + this.box_size / 2];
        const distance_v = Math.hypot(mid_v[0] - x, mid_v[1] - y);
        if (
          i < this.GRID_SIZE &&
          !this.vlines[i][j] &&
          distance_v < min_distance
        ) {
          min_distance = distance_v;
          min_line = [i, j];
          min_type = 'v';
        }
      }
    }

    if (min_line !== null) {
      if (min_type === 'h') {
        this.hlines[min_line[0]][min_line[1]] =
          PLAYER_COLORS[this.current_player - 1];
        const squareCompleted = this.update_squares(min_line, 'h');
        if (!squareCompleted && !this.square_completed_last_turn) {
          this.current_player = this.current_player === 1 ? 2 : 1;
          this.human_turn = !this.human_turn;
        }
      } else if (min_type === 'v') {
        this.vlines[min_line[0]][min_line[1]] =
          PLAYER_COLORS[this.current_player - 1];
        const squareCompleted = this.update_squares(min_line, 'v');
        if (!squareCompleted && !this.square_completed_last_turn) {
          this.current_player = this.current_player === 1 ? 2 : 1;
          this.human_turn = !this.human_turn;
        }
      }
    }
  }

  check_square_completion_h(i, j) {
    let squareCompleted = false;
    if (
      i > 0 &&
      this.vlines[i - 1][j] !== null &&
      this.vlines[i - 1][j + 1] !== null &&
      this.hlines[i - 1][j] !== null
    ) {
      this.squares[i - 1][j] = this.current_player;
      squareCompleted = true;
    }

    if (
      i < this.GRID_SIZE &&
      this.vlines[i][j] !== null &&
      this.vlines[i][j + 1] !== null &&
      this.hlines[i + 1][j] !== null
    ) {
      this.squares[i][j] = this.current_player;
      squareCompleted = true;
    }

    return squareCompleted;
  }

  check_square_completion_v(i, j) {
    let squareCompleted = false;
    if (
      j > 0 &&
      this.hlines[i][j - 1] !== null &&
      this.hlines[i + 1][j - 1] !== null &&
      this.vlines[i][j - 1] !== null
    ) {
      this.squares[i][j - 1] = this.current_player;
      squareCompleted = true;
    }

    if (
      j < this.GRID_SIZE &&
      this.hlines[i][j] !== null &&
      this.hlines[i + 1][j] !== null &&
      this.vlines[i][j + 1] !== null
    ) {
      this.squares[i][j] = this.current_player;
      squareCompleted = true;
    }

    return squareCompleted;
  }

  update_squares(line, lineType) {
    const [i, j] = line;
    let squareCompleted = false;
    if (lineType === 'h') {
      squareCompleted = this.check_square_completion_h(i, j);
    } else if (lineType === 'v') {
      squareCompleted = this.check_square_completion_v(i, j);
    }
    if (squareCompleted) {
      this.square_completed_last_turn = true;
    }
    return squareCompleted;
  }

  fill_boxes(screen) {
    const box_inner_margin = 10; // Adjust this to change the size of the border
    for (let i = 0; i < this.GRID_SIZE; i++) {
      for (let j = 0; j < this.GRID_SIZE; j++) {
        if (this.squares[i][j] !== 0) {
          screen.fillStyle = PLAYER_COLORS[this.squares[i][j] - 1];
          screen.fillRect(
            20 + j * this.box_size + LINE_THICKNESS / 2 + box_inner_margin,
            20 + i * this.box_size + LINE_THICKNESS / 2 + box_inner_margin,
            this.box_size - LINE_THICKNESS - 2 * box_inner_margin,
            this.box_size - LINE_THICKNESS - 2 * box_inner_margin
          );
        }
      }
    }
  }

  draw_lines(screen) {
    this.fill_boxes(screen);
    for (let i = 0; i < this.GRID_SIZE + 1; i++) {
      for (let j = 0; j < this.GRID_SIZE; j++) {
        const color = this.hlines[i][j] || LIGHT_GRAY;
        screen.strokeStyle = color;
        screen.lineWidth = LINE_THICKNESS;
        screen.beginPath();
        screen.moveTo(20 + j * this.box_size, 20 + i * this.box_size);
        screen.lineTo(20 + (j + 1) * this.box_size, 20 + i * this.box_size);
        screen.stroke();
      }
    }

    for (let i = 0; i < this.GRID_SIZE + 1; i++) {
      for (let j = 0; j < this.GRID_SIZE + 1; j++) {
        if (i < this.GRID_SIZE) {
          const color = this.vlines[i][j] || LIGHT_GRAY;
          screen.strokeStyle = color;
          screen.lineWidth = LINE_THICKNESS;
          screen.beginPath();
          screen.moveTo(20 + j * this.box_size, 20 + i * this.box_size);
          screen.lineTo(20 + j * this.box_size, 20 + (i + 1) * this.box_size);
          screen.stroke();
        }

        screen.fillStyle = BLACK;
        screen.beginPath();
        screen.arc(20 + j * this.box_size, 20 + i * this.box_size, DOT_RADIUS, 0, 2 * Math.PI);
        screen.fill();
      }
    }
  }

  display_scores(screen) {
    const player1_score = this.squares.flat().filter((square) => square === 1).length;
    const player2_score = this.squares.flat().filter((square) => square === 2).length;

    screen.fillStyle = WHITE;
    screen.fillRect(0, SCREEN_SIZE, SCREEN_SIZE, SCORE_AREA_HEIGHT);

    const font = '50px Arial';
    screen.font = font;
    screen.fillStyle = BLACK;
    screen.textAlign = 'center';

    screen.fillText(
      `Player 1: ${player1_score}`,
      SCREEN_SIZE / 2,
      SCORE_AREA_HEIGHT / 3
    );
    screen.fillText(
      `Player 2: ${player2_score}`,
      SCREEN_SIZE / 2,
      (2 * SCORE_AREA_HEIGHT) / 3
    );
  }

  get_available_lines() {
    const available_lines = [];
    for (let i = 0; i < this.GRID_SIZE + 1; i++) {
      for (let j = 0; j < this.GRID_SIZE; j++) {
        if (!this.hlines[i][j]) {
          available_lines.push(['h', i, j]);
        }
      }
    }
    for (let i = 0; i < this.GRID_SIZE; i++) {
      for (let j = 0; j < this.GRID_SIZE + 1; j++) {
        if (!this.vlines[i][j]) {
          available_lines.push(['v', i, j]);
        }
      }
    }
    return available_lines;
  }

  update_numstring() {
    for (let i = 0; i < this.GRID_SIZE; i++) {
      for (let j = 0; j < this.GRID_SIZE; j++) {
        const top = this.hlines[i][j] !== null ? 1 : 0;
        const bottom = this.hlines[i + 1][j] !== null ? 1 : 0;
        const left = this.vlines[i][j] !== null ? 1 : 0;
        const right = this.vlines[i][j + 1] !== null ? 1 : 0;
        this.numstring[i * this.GRID_SIZE + j] = top + bottom + left + right;
      }
    }
  }

  computer_turn() {
    if (this.game_over) {
      return;
    }

    this.square_completed_last_turn = false;
    let squareCompleted = true;
    const available_lines = this.get_available_lines();

    const optimal_moves = this.generate_optimal_move();

    let chosen_move;
    if (optimal_moves.length > 0) {
      chosen_move = optimal_moves[Math.floor(Math.random() * optimal_moves.length)];
      console.log("Numstring was used for this move.");
    } else {
      chosen_move = available_lines[Math.floor(Math.random() * available_lines.length)];
      console.log("Minimax was used for this move.");
    }

    const [lineType, lineI, lineJ] = chosen_move;

    if (lineType === 'h') {
      this.hlines[lineI][lineJ] = PLAYER_COLORS[this.current_player - 1];
    } else if (lineType === 'v') {
      this.vlines[lineI][lineJ] = PLAYER_COLORS[this.current_player - 1];
    }

    squareCompleted = this.update_squares([lineI, lineJ], lineType);

    if (!squareCompleted && !this.square_completed_last_turn) {
      this.current_player = this.current_player === 1 ? 2 : 1;
      this.human_turn = true;
    }
  }

  make_move(move) {
    const [lineType, lineI, lineJ] = move;
    if (lineType === 'h') {
      this.hlines[lineI][lineJ] = PLAYER_COLORS[this.current_player - 1];
    } else if (lineType === 'v') {
      this.vlines[lineI][lineJ] = PLAYER_COLORS[this.current_player - 1];
    }
    const squareCompleted = this.update_squares([lineI, lineJ], lineType);
    if (squareCompleted) {
      this.square_completed_last_turn = true;
    }
  }

  minimax(game, depth, alpha, beta, maximizing_player) {
    if (depth === 0 || game.game_over) {
      return this.evaluate(game);
    }

    if (maximizing_player) {
      let maxEval = -Infinity;
      for (const move of game.get_available_lines()) {
        const newGame = Object.assign(Object.create(Object.getPrototypeOf(game)), game);
        newGame.make_move(move);
        const evaluation = this.minimax(newGame, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) {

          break;
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of game.get_available_lines()) {
        const newGame = Object.assign(Object.create(Object.getPrototypeOf(game)), game);
        newGame.make_move(move);
        const evaluation = this.minimax(newGame, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) {

          break;
        }
      }
      return minEval;
    }
  }

  evaluate(game) {
    const player1_score = game.squares.flat().filter((square) => square === 1).length;
    const player2_score = game.squares.flat().filter((square) => square === 2).length;
    const total_boxes = game.GRID_SIZE ** 2;
    const boxes_left = total_boxes - (player1_score + player2_score);
    const boxes_diff = player1_score - player2_score;

    const evaluation = 3 * boxes_diff + 2 * boxes_left;

    return evaluation;
  }

  generate_optimal_move() {
    this.update_numstring();
    const available_lines = this.get_available_lines();
    const optimal_moves = [];
    const safe_moves = [];
    const risky_moves = [];
    const single_box_moves = [];
    const chain_moves = [];

    for (const move of available_lines) {
      const [lineType, lineI, lineJ] = move;

      if (lineType === 'h') {
        this.hlines[lineI][lineJ] = PLAYER_COLORS[this.current_player - 1];
      } else if (lineType === 'v') {
        this.vlines[lineI][lineJ] = PLAYER_COLORS[this.current_player - 1];
      }

      const squareCompleted = this.update_squares([lineI, lineJ], lineType);
      this.update_numstring();

      if (squareCompleted) {
        optimal_moves.push(move);
      } else if (this.numstring.includes(3)) {
        risky_moves.push(move);
        if (this.numstring.filter((num) => num === 3).length === 1) {
          single_box_moves.push(move);
        } else if (this.numstring.filter((num) => num === 3).length > 2) {
          chain_moves.push(move);
        }
      } else {
        safe_moves.push(move);
      }

      if (lineType === 'h') {
        this.hlines[lineI][lineJ] = null;
      } else if (lineType === 'v') {
        this.vlines[lineI][lineJ] = null;
      }
    }

    if (optimal_moves.length > 0) {
      return optimal_moves;
    }
    if (safe_moves.length > 0) {
      return safe_moves;
    }
    if (chain_moves.length > 0) {
      return chain_moves;
    }
    if (single_box_moves.length > 0) {
      return single_box_moves;
    }
    if (risky_moves.length > 0) {
      console.log("Minimax was used for this move.");
      return risky_moves;
    }

    return this.generate_optimal_move_minimax();
  }

  generate_optimal_move_minimax() {
    let bestScore = -Infinity;
    let bestMoves = [];

    for (const move of this.get_available_lines()) {
      const [lineType, lineI, lineJ] = move;
      const newGame = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
      newGame.make_move(move);
      const score = this.minimax(newGame, 3, -Infinity, Infinity, false);

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }

    if (bestMoves.length > 0) {
      return bestMoves;
    } else {
      return this.get_available_lines();
    }
  }
}

module.exports = Game;
