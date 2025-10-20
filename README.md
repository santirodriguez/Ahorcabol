# Ahorcabol ⚽ — Arcade Hangman with Football Flair

**Ahorcabol** is a modern, football-themed hangman for the browser. Guess club names drawn from seven top-flight leagues — Argentina, Spain, England, Germany, France, Portugal, and Brazil — with a sleek goal scene, animated ball, satisfying SFX, confetti, and a clean, mobile-friendly UI.

Repository: https://github.com/santirodriguez/Ahorcabol

[![Ahorcabol screenshot](https://github.com/santirodriguez/Ahorcabol/blob/main/screenshot.png)](https://github.com/santirodriguez/Ahorcabol/blob/main/screenshot.png)

---

## Table of Contents
- [Features](#features)
- [Screenshot](#screenshot)
- [Folder Structure](#folder-structure)
- [Data Format (teamlist.json)](#data-format-teamlistjson)
- [Getting Started](#getting-started)
- [Gameplay & Scoring](#gameplay--scoring)
- [Accent Handling](#accent-handling)
- [Audio & Voice](#audio--voice)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [Tech Stack](#tech-stack)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Features

- Accent-insensitive input: á, ä, à, ã → a; ñ → n, etc. (display keeps original accents).
- On-screen keyboard (includes Ñ) + physical keyboard support.
- Hint (reveals a random letter at the cost of 1 life).
- Give up (reveals the word, red-card flair, resets streak).
- Lives / Score / Streak with LocalStorage persistence.
- Country filter built dynamically from your data file (no hard-coding).
- Celebrations & feedback:
  - Confetti + goal-net ripple on win.
  - Goal shake + ball “post” bounce on miss.
  - Lightweight SFX (WebAudio) and optional voice lines (SpeechSynthesis): “¡Goool!” / “¡Fuera!”.
- Spanish-localized team names (“españolizados”) to match the game’s language flavor (e.g., Bayern Múnich, San Pablo).
- Built-in fallback team list so the game can run even if `teamlist.json` isn’t served.

---

## Screenshot

The image above is embedded from the project repository:
https://github.com/santirodriguez/Ahorcabol/blob/main/screenshot.png

---

## Folder Structure

/ahorcabol  
├─ index.html  
├─ styles.css  
├─ script.js  
└─ teamlist.json   ← leagues & teams (Spanish-localized names)

---

## Data Format (teamlist.json)

`teamlist.json` is an array of country groups. Country names go in `pais` and teams in `equipos`:

[
  {
    "pais": "Argentina",
    "equipos": ["Vélez Sarsfield", "Boca Juniors", "River Plate", "..."]
  },
  {
    "pais": "España",
    "equipos": ["Real Madrid", "Barcelona", "..."]
  }
  // ...
]

Notes:
- The Country dropdown is built from all distinct `pais` values found in this file.
- Team names are Spanish-localized to be consistent with the game’s language.
- The game includes a built-in fallback list (same seven countries) so it still runs if the JSON cannot be fetched (e.g., when opening the HTML directly). For production, keep `teamlist.json` — it’s cleaner and easier to update.

---

## Getting Started

1) Download or clone the entire project so all files (`index.html`, `script.js`, `styles.css`, and `teamlist.json`) sit in the **same folder**.

2) Open `index.html` in your preferred browser (double-click it or run something like `firefox index.html`).

3) If your browser blocks the JSON fetch (some Chrome/Edge versions do this for `file://` URLs), serve the folder over HTTP:

    Python 3  
      cd ahorcabol  
      python -m http.server 5173  
      open http://localhost:5173

    Alternative options  
    - VS Code: use the “Live Server” extension and open `index.html`.  
    - Node.js (if installed): `npx http-server -p 5173` then visit `http://localhost:5173`.

Ensure `teamlist.json` stays next to `index.html` — that’s where the game reads its data.

---

## Gameplay & Scoring

- Lives: 6
- Correct letter: +100 per occurrence
- Win: +500 + 50 × (remaining lives)
- Hint: reveals one random letter and costs 1 life (the revealed letter is marked “used” so it won’t score later)
- Give up: reveals the word, shows a red card, and resets the streak

Controls  
- Click the on-screen keyboard (Ñ included) or use your physical keyboard  
- Enter → New game

---

## Accent Handling

All comparisons use a normalized, diacritic-free, uppercase form; the display preserves accents and punctuation.

á, ä, à, ã → a  
é, è, ë → e  
í, ï → i  
ó, ö, ò → o  
ú, ü, ù → u  
ñ → n

---

## Audio & Voice

- SFX via WebAudio — no external files required.
- SpeechSynthesis (if available) plays short Spanish voice lines:
  - On correct letter: “¡Goool!”
  - On miss: “¡Fuera!”
- Many browsers require a user interaction first (click or key press) to unlock audio.

---

## Customization

- Add or edit teams/countries in `teamlist.json`.
- Tweak visuals in `styles.css` (ball/goal animations use `.idle`, `.tap`, `.post`, `.kick`, and net `.ripple`).
- Require JSON strictly? In `script.js`, make `loadData()` throw on fetch error and show a toast instructing users to serve the folder over HTTP.

---

## Troubleshooting

- Only a few countries appear:
  - Serve over HTTP and ensure `teamlist.json` is next to `index.html`.
  - The country dropdown lists all `pais` values from your file.
- No voice/SFX:
  - Click once on the page or press any key to unlock audio.
  - Check SpeechSynthesis and WebAudio support in your browser.
- Odd ball/goal animations:
  - Ensure CSS classes `.idle`, `.tap`, `.post`, `.kick`, and `.ripple` exist and aren’t overridden.
  - Animations are centrally managed to avoid overlap.

---

## Tech Stack

- HTML5 / CSS3 / JavaScript (no build step required)
- WebAudio (beeps/SFX)
- SpeechSynthesis (optional voice lines)
- LocalStorage (score & streak persistence)

---

## Development

- Code style: vanilla JS with small, focused functions; keep DOM queries scoped and cached where possible.
- Data: prefer updating `teamlist.json` over editing inline arrays in JS.
- Testing locally: always serve over HTTP when changing data-loading code to mirror production behavior.

---

## Contributing

Issues and PRs are welcome! If you have a country list to add or a visual polish tweak, open an issue describing the change, then submit a PR referencing that issue. Please keep features lightweight and dependency-free.

---

## License

GPLv3 — see the [LICENSE](./LICENSE) file (also at https://www.gnu.org/licenses/).

---

## Acknowledgments

- Inspired by classic hangman and match-day football aesthetics.
