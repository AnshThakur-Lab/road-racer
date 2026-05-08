import { useGameLoop } from "@/hooks/useGameLoop";
import type { GameState } from "@/types/game";
import { useCallback, useState } from "react";

const INITIAL_STATE: GameState = {
  status: "idle",
  score: 0,
  health: 100,
  speedDisplay: 0,
};

export default function Game() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);

  const handleStateChange = useCallback((state: GameState) => {
    setGameState({ ...state });
  }, []);

  const { canvasRef, startGame, pauseGame, resetGame } =
    useGameLoop(handleStateChange);

  const isRunning = gameState.status === "running";
  const isPaused = gameState.status === "paused";
  const isGameOver = gameState.status === "gameover";
  const isIdle = gameState.status === "idle";

  const healthPct = Math.max(0, gameState.health);
  const healthColor =
    healthPct > 60 ? "#00ff88" : healthPct > 30 ? "#f5c518" : "#ff3333";

  return (
    <div className="game-container p-4">
      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={600}
          className="game-canvas"
          data-ocid="game.canvas_target"
          style={{ width: "100%", maxWidth: 400 }}
        />
        {/* Touch controls overlay for mobile */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4 md:hidden pointer-events-none">
          <button
            type="button"
            className="pointer-events-auto btn-arcade opacity-70 text-xl px-5 py-3 select-none"
            onTouchStart={() =>
              window.dispatchEvent(
                new KeyboardEvent("keydown", {
                  key: "ArrowLeft",
                  bubbles: true,
                }),
              )
            }
            onTouchEnd={() =>
              window.dispatchEvent(
                new KeyboardEvent("keyup", { key: "ArrowLeft", bubbles: true }),
              )
            }
            aria-label="Move left"
            data-ocid="game.left_button"
          >
            ◀
          </button>
          <button
            type="button"
            className="pointer-events-auto btn-arcade opacity-70 text-xl px-5 py-3 select-none"
            onTouchStart={() =>
              window.dispatchEvent(
                new KeyboardEvent("keydown", {
                  key: "ArrowRight",
                  bubbles: true,
                }),
              )
            }
            onTouchEnd={() =>
              window.dispatchEvent(
                new KeyboardEvent("keyup", {
                  key: "ArrowRight",
                  bubbles: true,
                }),
              )
            }
            aria-label="Move right"
            data-ocid="game.right_button"
          >
            ▶
          </button>
        </div>
      </div>

      {/* HUD Panel */}
      <div className="score-panel flex flex-col gap-3" data-ocid="game.panel">
        {/* Title */}
        <div className="mb-1">
          <h1
            className="font-display font-black text-2xl tracking-tight leading-none"
            style={{ color: "oklch(0.68 0.22 175)" }}
          >
            NIGHT
          </h1>
          <h1
            className="font-display font-black text-3xl tracking-tight leading-tight"
            style={{ color: "oklch(0.95 0.01 250)" }}
          >
            RACER
          </h1>
        </div>

        <div className="border-t border-border/50" />

        {/* Stats */}
        <div className="stat-row" data-ocid="game.score_stat">
          <span className="text-muted-foreground text-xs uppercase tracking-widest">
            Score
          </span>
          <span className="stat-value">{gameState.score.toLocaleString()}</span>
        </div>

        <div className="stat-row" data-ocid="game.health_stat">
          <span className="text-muted-foreground text-xs uppercase tracking-widest">
            Health
          </span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${healthPct}%`, backgroundColor: healthColor }}
              />
            </div>
            <span
              className="stat-value text-base"
              style={{ color: healthColor }}
            >
              {healthPct}
            </span>
          </div>
        </div>

        <div className="stat-row border-b-0" data-ocid="game.speed_stat">
          <span className="text-muted-foreground text-xs uppercase tracking-widest">
            Speed
          </span>
          <div className="flex items-center gap-1">
            <span className="stat-value">{gameState.speedDisplay}</span>
            <span className="text-muted-foreground text-xs">km/h</span>
          </div>
        </div>

        <div className="border-t border-border/50" />

        {/* Controls */}
        <div className="flex flex-col gap-2 mt-1">
          <button
            type="button"
            className="btn-arcade w-full"
            style={
              isRunning || isPaused
                ? {
                    background: "oklch(0.26 0.02 250)",
                    color: "oklch(0.55 0.01 250)",
                    cursor: "not-allowed",
                    opacity: 0.5,
                  }
                : {}
            }
            disabled={isRunning || isPaused}
            onClick={startGame}
            data-ocid="game.start_button"
          >
            START
          </button>

          <button
            type="button"
            className="btn-arcade w-full"
            style={
              isIdle || isGameOver
                ? {
                    background: "oklch(0.26 0.02 250)",
                    color: "oklch(0.55 0.01 250)",
                    cursor: "not-allowed",
                    opacity: 0.5,
                  }
                : {
                    background: isPaused
                      ? "oklch(0.68 0.22 175)"
                      : "oklch(0.55 0.19 175)",
                    color: "oklch(0.11 0.01 175)",
                  }
            }
            disabled={isIdle || isGameOver}
            onClick={pauseGame}
            data-ocid="game.pause_button"
          >
            {isPaused ? "RESUME" : "PAUSE"}
          </button>

          <button
            type="button"
            className="btn-arcade w-full"
            style={{
              background: "oklch(0.6 0.24 25)",
              color: "oklch(0.95 0.01 25)",
            }}
            onClick={resetGame}
            data-ocid="game.restart_button"
          >
            RESTART
          </button>
        </div>

        <div className="border-t border-border/50" />

        {/* Instructions */}
        <div className="text-xs text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground/70 mb-1">Controls</p>
          <p>← → or A/D — move sideways</p>
          <p>↑ ↓ or W/S — forward / back</p>
          <p>Avoid enemy cars · collect power-ups</p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: "#00ff88" }}
            />
            <span className="text-muted-foreground">+20 HP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ background: "#ffd700" }}
            />
            <span className="text-muted-foreground">+50 pts</span>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(5,13,24,0.85)" }}
          data-ocid="game.dialog"
        >
          <div
            className="score-panel text-center"
            style={{ maxWidth: 340, animation: "slideUp 0.3s ease" }}
          >
            <h2
              className="font-display font-black text-3xl mb-2"
              style={{ color: "oklch(0.6 0.24 25)" }}
            >
              GAME OVER
            </h2>
            <p className="text-muted-foreground text-sm mb-4">Final Score</p>
            <p
              className="font-display font-black text-5xl mb-6"
              style={{ color: "oklch(0.68 0.22 175)" }}
              data-ocid="game.final_score"
            >
              {gameState.score.toLocaleString()}
            </p>
            <button
              type="button"
              className="btn-arcade w-full"
              onClick={startGame}
              data-ocid="game.confirm_button"
            >
              PLAY AGAIN
            </button>
            <button
              type="button"
              className="btn-arcade w-full mt-2"
              style={{
                background: "oklch(0.2 0.02 250)",
                color: "oklch(0.55 0.01 250)",
              }}
              onClick={resetGame}
              data-ocid="game.cancel_button"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
