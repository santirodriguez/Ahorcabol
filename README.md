<p align="center">
  <img src="assets/branding/ahorcabol-logo-1.svg" alt="Ahorcabol" width="600">
</p>

# Ahorcabol

A lightweight football-themed hangman game for the browser, because apparently football did not already have enough ways to ruin your evening. Guess club names, protect what remains of your streak, and discover how quickly a team you have known for twenty years disappears from memory when six lives are involved.

> **Development / test build:** https://santiagorodriguez.com/Ahorcabol/
>
> Test it before trusting it. A rare moment of common sense.

## Highlights

- 🇦🇷 **Español** by default.
- 🇺🇸 **English** with one click.
- <img src="assets/branding/senyera.svg" alt="Senyera" width="22"> **Català** with the traditional Senyera.
- Seven football countries/leagues in the current team pool.
- Physical and on-screen keyboard support.
- Score, streak and lives with `localStorage` persistence.
- Country filtering without hard-coded UI options.
- Hint and give-up actions for when confidence meets reality.
- Goal, post, net and confetti feedback.
- Lightweight WebAudio effects and optional SpeechSynthesis commentary.
- Responsive layout for desktop and mobile.
- No framework, dependency or build step. The browser already has enough problems.

No motivational speeches. No inspirational journey. Just football clubs, bad guesses and enough time to blame the referee.

## Languages

The interface ships with:

- 🇦🇷 **Español** — default.
- 🇺🇸 **English**.
- <img src="assets/branding/senyera.svg" alt="Senyera" width="22"> **Català**.

The selected language is remembered in `localStorage`. Club names are kept as stable football names rather than maintaining translated copies of the team database, because maintaining three versions of the same bad result would be excessive even for football.

## Gameplay

- You start each match with **6 lives**.
- A correct letter scores **100 points per occurrence**.
- Winning scores **500 points + 50 × remaining lives**.
- A hint reveals a letter and costs **1 life**.
- Giving up reveals the team and resets the streak.
- `Enter` starts a new match.

Accents are ignored when comparing guesses, while the original spelling remains visible on screen. The game is judgmental enough without also judging diacritics.

## Project structure

```text
Ahorcabol/
├── assets/
│   └── branding/
│       ├── ahorcabol-logo-1.svg
│       ├── logo-adaptation.css
│       └── senyera.svg
├── index.html
├── styles.css
├── script.js
├── teamlist.json
├── screenshot.png
└── LICENSE
```

## Run locally

Keep the project files together and serve the repository directory over HTTP. A static web server is enough; there is no build command.

The game falls back to a built-in team list if `teamlist.json` cannot be loaded, but HTTP serving is recommended because it matches production behavior and removes one more excuse when something looks wrong.

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

Ahorcabol is designed as a standard responsive static site. Optional audio and voice features depend on browser support and may require an initial user interaction before playback is allowed. Browsers have rules. Occasionally even football does.

## License

GPLv3. See [`LICENSE`](LICENSE).
