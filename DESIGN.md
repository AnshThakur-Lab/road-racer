# Design Brief — Road Racer Arcade Game

## Direction

Dark Arcade Racer — immersive 2D canvas game with vibrant neon accents, retro arcade aesthetic, and high-contrast gameplay overlay.

## Tone

Brutalist arcade: stark contrast, maximum visual pop, zero UI ambiguity. Every color serves gameplay legibility.

## Differentiation

Canvas-rendered game objects (cars, roads, particles) paired with arcade HUD stats panel; neon primary accent (cyan) for active states and high-energy feedback.

## Color Palette

| Token            | OKLCH                  | Role                                  |
| :--------------- | :--------------------- | :------------------------------------ |
| background       | 0.11 0.01 250          | Deep charcoal page background         |
| foreground       | 0.95 0.01 250          | Off-white text, high contrast         |
| primary          | 0.68 0.22 280          | Neon cyan accent, buttons, stats     |
| card             | 0.16 0.015 250         | Dark HUD panel background             |
| accent           | 0.68 0.22 175          | Teal/green game highlights            |
| destructive      | 0.6 0.24 25            | Red alerts, collisions                |
| border           | 0.26 0.02 250          | Subtle panel edges                    |

## Typography

- Display: Space Grotesk — bold game headings, stats, arcade button labels
- Body: General Sans — UI text, instructions, modal content
- Scale: Stats (1.25rem bold), Labels (0.875rem semibold), Body (1rem regular)

## Elevation & Depth

Minimal shadows; primary visual depth via color contrast. Game canvas elevated via subtle border + glow. HUD panel sits flush with page background with light borders.

## Structural Zones

| Zone      | Background              | Border                              | Notes                                    |
| :-------- | :---------------------- | :--------------------------------- | :--------------------------------------- |
| Game Area | Linear gradient asphalt | 2px border, primary glow           | Canvas rendering, pixelated style        |
| HUD Panel | Dark card bg            | 1px subtle border                 | Stats display, button controls           |
| Page      | Deep charcoal           | —                                 | Full-screen, flex layout mobile→desktop  |

## Spacing & Rhythm

Dense HUD panel (1.5rem padding); loose game-to-panel gap (1.5rem mobile, 2rem desktop). Stat rows use 0.75rem vertical padding for readable density.

## Component Patterns

- Buttons: Neon cyan bg, white text, uppercase, 0.25rem corners, hover lift (+1px transform), 0.15s transitions
- Stats: Space Grotesk display font, 1.25rem cyan values, right-aligned
- Canvas: Pixelated rendering, 2px border, subtle glow shadow

## Motion

- Entrance: None (instant canvas render via requestAnimationFrame)
- Hover: Buttons lift +1px with glow intensification (0.15s ease-out)
- Game: Particle explosions, smooth car movement, animated road markings

## Constraints

- Canvas uses explicit color hex values (not CSS vars) for game rendering
- UI panel dark theme enforced; no light mode toggle
- All interactive elements use cyan primary for visual consistency
- Sharp corners (0.25rem) for game elements, minimal rounding for arcade feel

## Signature Detail

Pixelated canvas rendering with high-contrast neon cyan UI overlay: a bold arcade aesthetic that prioritizes gameplay clarity and retro-futuristic energy.
