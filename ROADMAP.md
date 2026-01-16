# MegaBlast Roadmap

## P0 - Stabilisierung und Bugfixes
- Fix offensichtlicher Logikfehler (z. B. `Rock.checkCollision` nutzt `Rock.y` statt `this.y`).
- Globale Abhaengigkeiten reduzieren (z. B. `GameAudio` greift auf globale DOM-Elemente zu).
- Input-Handling modernisieren (`KeyboardEvent.code`, konsistente Pause/Resume).

## P1 - Architektur und Modularisierung
- Umstieg auf ES-Modules und klare Trennung von State, Entities, Rendering, Audio.
- Zentraler GameState und dedizierte Update/Render-Phasen.

## P2 - Rendering und Skalierung
- Responsive Canvas + DPR-Scaling, Resize-Handling.
- Bewegungen/Spawns an `deltaTime` koppeln.

## P3 - Qualitaet und Wartbarkeit
- ESLint/Prettier (optional), kleine Utility-Tests.
- Simple Build-/Serve-Scripts (optional).
