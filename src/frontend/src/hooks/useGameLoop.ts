import type {
  EnemyCar,
  GameState,
  GameStatus,
  Particle,
  PlayerCar,
  PowerUp,
} from "@/types/game";
import { useCallback, useEffect, useRef } from "react";

const CANVAS_W = 400;
const CANVAS_H = 600;
const ROAD_LEFT = 50;
const ROAD_RIGHT = CANVAS_W - 50;
const CAR_W = 40;
const CAR_H = 62;
const ENEMY_COLORS = ["#1a1a2e", "#16213e", "#0f3460", "#1b1b2f"];

function makePlayer(): PlayerCar {
  return {
    x: CANVAS_W / 2 - CAR_W / 2,
    y: CANVAS_H - 100,
    width: CAR_W,
    height: CAR_H,
    dx: 0,
    dy: 0,
    maxSpeed: 7,
  };
}

function isColliding(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function createExplosion(
  particles: Particle[],
  x: number,
  y: number,
  color: string,
) {
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 * i) / 10;
    const speed = 1.5 + Math.random() * 3;
    particles.push({
      x: x + Math.random() * 20 - 10,
      y: y + Math.random() * 20 - 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 30,
      maxLife: 30,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function drawRoadCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  bodyColor: string,
  isPlayer: boolean,
) {
  // Body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(x, y + h * 0.12, w, h * 0.76, 4);
  ctx.fill();

  // Roof
  ctx.fillStyle = isPlayer ? "#cc0000" : "#111122";
  ctx.beginPath();
  ctx.roundRect(x + w * 0.18, y + h * 0.22, w * 0.64, h * 0.36, 3);
  ctx.fill();

  // Windshield
  ctx.fillStyle = isPlayer ? "rgba(100,210,255,0.7)" : "rgba(60,80,120,0.8)";
  ctx.beginPath();
  ctx.roundRect(x + w * 0.2, y + h * 0.24, w * 0.6, h * 0.15, 2);
  ctx.fill();

  // Rear window
  ctx.fillStyle = isPlayer ? "rgba(100,210,255,0.5)" : "rgba(60,80,120,0.6)";
  ctx.beginPath();
  ctx.roundRect(x + w * 0.2, y + h * 0.44, w * 0.6, h * 0.1, 2);
  ctx.fill();

  // Headlights / taillights
  if (isPlayer) {
    // Headlights (top of player car = front)
    ctx.fillStyle = "rgba(200,240,255,0.95)";
    ctx.beginPath();
    ctx.roundRect(x + 4, y + h * 0.12, 10, 5, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(x + w - 14, y + h * 0.12, 10, 5, 2);
    ctx.fill();
    // Glow
    ctx.shadowColor = "rgba(150,220,255,0.8)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "rgba(200,240,255,0.5)";
    ctx.beginPath();
    ctx.ellipse(x + 9, y + h * 0.12, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + w - 9, y + h * 0.12, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Taillights
    ctx.fillStyle = "#ff2200";
    ctx.beginPath();
    ctx.roundRect(x + 4, y + h * 0.84, 10, 5, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(x + w - 14, y + h * 0.84, 10, 5, 2);
    ctx.fill();
  } else {
    // Enemy taillights (bottom)
    ctx.fillStyle = "#cc2200";
    ctx.beginPath();
    ctx.roundRect(x + 4, y + h * 0.82, 9, 5, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(x + w - 13, y + h * 0.82, 9, 5, 2);
    ctx.fill();
    // Headlights (top = front for enemies going down)
    ctx.fillStyle = "rgba(255,240,180,0.9)";
    ctx.beginPath();
    ctx.roundRect(x + 4, y + h * 0.12, 9, 4, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(x + w - 13, y + h * 0.12, 9, 4, 2);
    ctx.fill();
  }

  // Wheels
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.roundRect(x - 4, y + h * 0.2, 8, 16, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x + w - 4, y + h * 0.2, 8, 16, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x - 4, y + h * 0.64, 8, 16, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x + w - 4, y + h * 0.64, 8, 16, 2);
  ctx.fill();
}

function render(
  ctx: CanvasRenderingContext2D,
  player: PlayerCar,
  enemies: EnemyCar[],
  powerUps: PowerUp[],
  particles: Particle[],
  roadOffset: number,
  status: GameStatus,
) {
  const W = CANVAS_W;
  const H = CANVAS_H;

  // Sky/background
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0, "#050d18");
  skyGrad.addColorStop(1, "#0d1b2a");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // Road
  const roadGrad = ctx.createLinearGradient(0, 0, 0, H);
  roadGrad.addColorStop(0, "#1a1a1a");
  roadGrad.addColorStop(1, "#2a2a2a");
  ctx.fillStyle = roadGrad;
  ctx.fillRect(ROAD_LEFT, 0, ROAD_RIGHT - ROAD_LEFT, H);

  // Road edge glow
  const leftGlow = ctx.createLinearGradient(ROAD_LEFT, 0, ROAD_LEFT + 20, 0);
  leftGlow.addColorStop(0, "rgba(0,200,255,0.15)");
  leftGlow.addColorStop(1, "rgba(0,200,255,0)");
  ctx.fillStyle = leftGlow;
  ctx.fillRect(ROAD_LEFT, 0, 20, H);

  const rightGlow = ctx.createLinearGradient(ROAD_RIGHT - 20, 0, ROAD_RIGHT, 0);
  rightGlow.addColorStop(0, "rgba(0,200,255,0)");
  rightGlow.addColorStop(1, "rgba(0,200,255,0.15)");
  ctx.fillStyle = rightGlow;
  ctx.fillRect(ROAD_RIGHT - 20, 0, 20, H);

  // Road boundaries
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(ROAD_LEFT, 0);
  ctx.lineTo(ROAD_LEFT, H);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ROAD_RIGHT, 0);
  ctx.lineTo(ROAD_RIGHT, H);
  ctx.stroke();

  // Center dashed line
  ctx.strokeStyle = "#f5c518";
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 20]);
  ctx.lineDashOffset = -roadOffset;
  ctx.beginPath();
  ctx.moveTo(W / 2, 0);
  ctx.lineTo(W / 2, H);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  // Power-ups
  for (const pu of powerUps) {
    if (pu.type === "shield") {
      ctx.shadowColor = "#00ff88";
      ctx.shadowBlur = 14;
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(
        pu.x + pu.width / 2,
        pu.y + pu.height / 2,
        pu.width / 2,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.fillStyle = "rgba(0,255,136,0.2)";
      ctx.fill();
      // Shield icon
      const cx = pu.x + pu.width / 2;
      const cy = pu.y + pu.height / 2;
      ctx.fillStyle = "#00ff88";
      ctx.beginPath();
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx + 6, cy - 4);
      ctx.lineTo(cx + 6, cy + 2);
      ctx.lineTo(cx, cy + 8);
      ctx.lineTo(cx - 6, cy + 2);
      ctx.lineTo(cx - 6, cy - 4);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      // Star
      const cx = pu.x + pu.width / 2;
      const cy = pu.y + pu.height / 2;
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2 + pu.angle;
        const ia = a + (2 * Math.PI) / 5;
        if (i === 0) ctx.moveTo(cx + Math.cos(a) * 13, cy + Math.sin(a) * 13);
        else ctx.lineTo(cx + Math.cos(a) * 13, cy + Math.sin(a) * 13);
        ctx.lineTo(cx + Math.cos(ia) * 5, cy + Math.sin(ia) * 5);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Enemies
  for (const e of enemies) {
    drawRoadCar(
      ctx,
      e.x,
      e.y,
      e.width,
      e.height,
      ENEMY_COLORS[e.colorIndex],
      false,
    );
  }

  // Player
  drawRoadCar(
    ctx,
    player.x,
    player.y,
    player.width,
    player.height,
    "#e00020",
    true,
  );

  // Particles
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // Pause overlay
  if (status === "paused") {
    ctx.fillStyle = "rgba(5,13,24,0.6)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "oklch(0.68 0.22 175)";
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", W / 2, H / 2);
    ctx.textAlign = "left";
  }

  // Idle overlay
  if (status === "idle") {
    ctx.fillStyle = "rgba(5,13,24,0.55)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "oklch(0.68 0.22 175)";
    ctx.font = 'bold 32px "Space Grotesk", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("NIGHT RACER", W / 2, H / 2 - 20);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = '16px "General Sans", sans-serif';
    ctx.fillText("Press START to race", W / 2, H / 2 + 20);
    ctx.textAlign = "left";
  }
}

export function useGameLoop(onStateChange: (state: GameState) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<GameStatus>("idle");
  const playerRef = useRef<PlayerCar>(makePlayer());
  const enemiesRef = useRef<EnemyCar[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<Record<string, boolean>>({});
  const roadOffsetRef = useRef(0);
  const scoreRef = useRef(0);
  const healthRef = useRef(100);
  const rafRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  const emitState = useCallback(() => {
    onStateChange({
      status: statusRef.current,
      score: scoreRef.current,
      health: healthRef.current,
      speedDisplay: Math.round(Math.abs(playerRef.current.dx) * 20),
    });
  }, [onStateChange]);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const status = statusRef.current;

    if (status === "running") {
      const player = playerRef.current;
      const keys = keysRef.current;

      // Player movement
      const left = keys.ArrowLeft || keys.a || keys.A;
      const right = keys.ArrowRight || keys.d || keys.D;
      const up = keys.ArrowUp || keys.w || keys.W;
      const down = keys.ArrowDown || keys.s || keys.S;

      if (left) player.dx = Math.max(player.dx - 1.2, -player.maxSpeed);
      else if (right) player.dx = Math.min(player.dx + 1.2, player.maxSpeed);
      else player.dx *= 0.9;

      if (up) player.dy = Math.max(player.dy - 0.8, -3);
      else if (down) player.dy = Math.min(player.dy + 0.8, 3);
      else player.dy *= 0.85;

      player.x += player.dx;
      player.y += player.dy;

      // Boundaries
      if (player.x < ROAD_LEFT + 4) {
        player.x = ROAD_LEFT + 4;
        player.dx = 0;
      }
      if (player.x + player.width > ROAD_RIGHT - 4) {
        player.x = ROAD_RIGHT - 4 - player.width;
        player.dx = 0;
      }
      if (player.y < 20) {
        player.y = 20;
        player.dy = 0;
      }
      if (player.y + player.height > CANVAS_H - 20) {
        player.y = CANVAS_H - 20 - player.height;
        player.dy = 0;
      }

      frameCountRef.current++;

      // Spawn enemies
      const spawnRate = Math.max(0.012, 0.025 - scoreRef.current * 0.000005);
      if (Math.random() < spawnRate) {
        const minX = ROAD_LEFT + 8;
        const maxX = ROAD_RIGHT - CAR_W - 8;
        enemiesRef.current.push({
          x: minX + Math.random() * (maxX - minX),
          y: -CAR_H - 10,
          width: CAR_W,
          height: CAR_H,
          speed: 2 + Math.random() * 2.5,
          colorIndex: Math.floor(Math.random() * ENEMY_COLORS.length),
        });
      }

      // Spawn power-ups
      if (Math.random() < 0.006) {
        const minX = ROAD_LEFT + 10;
        const maxX = ROAD_RIGHT - 40;
        powerUpsRef.current.push({
          x: minX + Math.random() * (maxX - minX),
          y: -40,
          width: 30,
          height: 30,
          speed: 2,
          type: Math.random() > 0.5 ? "shield" : "star",
          angle: 0,
        });
      }

      // Update enemies
      const survivors: EnemyCar[] = [];
      for (const e of enemiesRef.current) {
        e.y += e.speed;
        if (
          isColliding(
            player.x,
            player.y,
            player.width,
            player.height,
            e.x,
            e.y,
            e.width,
            e.height,
          )
        ) {
          healthRef.current = Math.max(0, healthRef.current - 10);
          createExplosion(
            particlesRef.current,
            e.x + e.width / 2,
            e.y + e.height / 2,
            "#ff6600",
          );
          if (healthRef.current <= 0) {
            statusRef.current = "gameover";
            createExplosion(
              particlesRef.current,
              player.x + player.width / 2,
              player.y + player.height / 2,
              "#ff2200",
            );
            createExplosion(
              particlesRef.current,
              player.x + player.width / 2,
              player.y + player.height / 2,
              "#ff8800",
            );
          }
        } else if (e.y > CANVAS_H) {
          scoreRef.current += 10;
        } else {
          survivors.push(e);
        }
      }
      enemiesRef.current = survivors;

      // Update power-ups
      const survivingPUs: PowerUp[] = [];
      for (const pu of powerUpsRef.current) {
        pu.y += pu.speed;
        pu.angle += 0.05;
        if (
          isColliding(
            player.x,
            player.y,
            player.width,
            player.height,
            pu.x,
            pu.y,
            pu.width,
            pu.height,
          )
        ) {
          if (pu.type === "shield") {
            healthRef.current = Math.min(100, healthRef.current + 20);
            createExplosion(
              particlesRef.current,
              pu.x + pu.width / 2,
              pu.y + pu.height / 2,
              "#00ff88",
            );
          } else {
            scoreRef.current += 50;
            createExplosion(
              particlesRef.current,
              pu.x + pu.width / 2,
              pu.y + pu.height / 2,
              "#ffd700",
            );
          }
        } else if (pu.y < CANVAS_H + 40) {
          survivingPUs.push(pu);
        }
      }
      powerUpsRef.current = survivingPUs;

      // Update particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= 1;
        return p.life > 0;
      });

      roadOffsetRef.current = (roadOffsetRef.current + 3) % 40;

      // Emit state every 3 frames
      if (frameCountRef.current % 3 === 0) emitState();
    }

    render(
      ctx,
      playerRef.current,
      enemiesRef.current,
      powerUpsRef.current,
      particlesRef.current,
      roadOffsetRef.current,
      statusRef.current,
    );

    rafRef.current = requestAnimationFrame(loop);
  }, [emitState]);

  const startGame = useCallback(() => {
    playerRef.current = makePlayer();
    enemiesRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    healthRef.current = 100;
    roadOffsetRef.current = 0;
    frameCountRef.current = 0;
    statusRef.current = "running";
    emitState();
  }, [emitState]);

  const pauseGame = useCallback(() => {
    if (statusRef.current === "running") {
      statusRef.current = "paused";
      emitState();
    } else if (statusRef.current === "paused") {
      statusRef.current = "running";
      emitState();
    }
  }, [emitState]);

  const resetGame = useCallback(() => {
    playerRef.current = makePlayer();
    enemiesRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    healthRef.current = 100;
    roadOffsetRef.current = 0;
    frameCountRef.current = 0;
    statusRef.current = "idle";
    emitState();
  }, [emitState]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  return { canvasRef, startGame, pauseGame, resetGame };
}
