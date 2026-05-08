export interface PlayerCar {
  x: number;
  y: number;
  width: number;
  height: number;
  dx: number;
  dy: number;
  maxSpeed: number;
}

export interface EnemyCar {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  colorIndex: number;
}

export interface PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: "shield" | "star";
  angle: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export type GameStatus = "idle" | "running" | "paused" | "gameover";

export interface GameState {
  status: GameStatus;
  score: number;
  health: number;
  speedDisplay: number;
}
