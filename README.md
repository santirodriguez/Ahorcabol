<p align="center">
  <img src="assets/branding/ahorcabol-logo.svg" alt="Ahorcabol" width="720">
</p>

# Ahorcabol

A lightweight football-themed hangman game for the browser. Guess club names, build a streak, use hints carefully, and try to finish the match before the football hangman is completed.

> **Development / test build:** https://santiagorodriguez.com/Ahorcabol/
>
> The URL above may contain work that is newer than the latest stable GitHub release.

## Highlights

- Argentine Spanish by default, with one-click switching to US English and Catalan.
- Seven football countries/leagues in the current team pool.
- Physical and on-screen keyboard support.
- Score, streak and lives with `localStorage` persistence.
- Country filtering without hard-coded UI options.
- Hint and give-up actions.
- Goal, post, net and confetti feedback.
- Lightweight WebAudio effects and optional SpeechSynthesis commentary.
- Responsive layout for desktop and mobile.
- No framework, dependency or build step.

## Languages

The interface ships with:

- Argentine Spanish (`es-AR`) — default.
- US English (`en-US`).
- Catalan (`ca`).

The selected language is remembered in `localStorage`. Club names are kept as stable football names rather than maintaining translated copies of the team database.

## Gameplay

- You start each match with **6 lives**.
- A correct letter scores **100 points per occurrence**.
- Winning scores **500 points + 50 × remaining lives**.
- A hint reveals a letter and costs **1 life**.
- Giving up reveals the team and resets the streak.
- `Enter` starts a new match.

Accents are ignored when comparing guesses, while the original spelling remains visible on screen.

## Project structure

```text
Ahorcabol/
├── assets/
│   └── branding/
│       └── ahorcabol-logo.svg
├── index.html
├── styles.css
├── script.js
├── teamlist.json
├── screenshot.png
└── LICENSE
```

## Run locally

Keep the project files together and serve the repository directory over HTTP. A static web server is enough; there is no build command.

The game falls back to a built-in team list if `teamlist.json` cannot be loaded, but HTTP serving is recommended because it matches production behavior.

## Team data

`teamlist.json` is an array of country groups:

```json
[
  {
    "pais": "Argentina",
    "equipos": ["Vélez Sarsfield", "Boca Juniors", "River Plate"]
  }
]
```

The country selector is generated from these groups. UI labels are translated separately, so changing language does not modify the underlying filter values.

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- WebAudio
- SpeechSynthesis when available
- LocalStorage

## Browser behavior

Ahorcabol is designed as a standard responsive static site. Optional audio and voice features depend on browser support and may require an initial user interaction before playback is allowed.

## License

GPLv3. See [`LICENSE`](LICENSE).
