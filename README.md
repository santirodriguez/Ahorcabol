# Ahorcabol ⚽ — Arcade Hangman with Football Flair

**Ahorcabol** is a modern, football-themed hangman for the browser. Guess club names drawn from seven top-flight leagues — **Argentina, Spain, England, Germany, France, Portugal, Brazil** — with a sleek goal scene, animated ball, satisfying SFX, confetti, and a clean, mobile-friendly UI.

> **Bio:** Ahorcabol blends the simplicity of classic hangman with match-day vibes. Built with vanilla HTML/CSS/JS, it’s fast to load, easy to tweak, and perfect for quick rounds on desktop or mobile.

---

## Table of Contents
- Features
- Folder Structure
- Data Format (`teamlist.json`)
- Getting Started
- Gameplay & Scoring
- Accent Handling
- Audio & Voice
- Customization
- Troubleshooting
- Tech Stack

---

## Features

- Accent-insensitive input: á, ä, à, ã → a, ñ → n, etc. (display keeps original accents).
- On-screen keyboard (includes Ñ) + physical keyboard support.
- Hint (reveals a random letter at the cost of 1 life).
- Give up (reveals the word, red card flair, resets streak).
- Lives / Score / Streak with LocalStorage persistence.
- Country filter built dynamically from your data file (no hard-coding).
- Celebrations & feedback:
  - Confetti + goal-net ripple on win.
  - Goal shake + ball “post” bounce on miss.
  - Lightweight SFX (WebAudio) and optional voice lines (SpeechSynthesis): “¡Goool!” / “¡Fuera!”.
- Spanish-localized team names (“españolizados”) to match the game’s language flavor (e.g., Bayern Múnich, San Pablo).

---

## Folder Structure

    /ahorcabol
    ├─ index.html
    ├─ styles.css
    ├─ script.js
    └─ teamlist.json   ← leagues & teams (Spanish-localized names)

---

## Data Format (teamlist.json)

teamlist.json is an array of country groups. Country names go in `pais` and teams in `equipos`:

    [
      {
        "pais": "Argentina",
        "equipos": [""Vélez Sarsfield", Boca Juniors", "River Plate", "..."]
      },
      {
        "pais": "España",
        "equipos": ["Real Madrid", "Barcelona", "..."]
      }
      // ...
    ]

- The Country dropdown is built from all distinct `pais` values found in this file.
- Team names are Spanish-localized to be consistent with the game’s language.

> The game also includes a full built-in fallback list (the same seven countries) so it still runs if the JSON cannot be fetched (e.g., when opening the HTML directly). For production, keep teamlist.json — it’s cleaner and easier to update.

---

## Getting Started

Because index.html fetches teamlist.json, serve the folder with a local static server (browsers often block fetch from file://).

**Python 3**
    cd ahorcabol
    python -m http.server 5173
    # open http://localhost:5173

**Node.js (http-server)**
    npm -g i http-server
    cd ahorcabol
    http-server -p 5173
    # open http://localhost:5173

**npx serve (no global install)**
    cd ahorcabol
    npx serve -l 5173

Place teamlist.json next to index.html and reload.

---

## Gameplay & Scoring

- Lives: 6  
- Correct letter: +100 per occurrence  
- Win: +500 + 50 × (remaining lives)  
- Hint: reveals one random letter and costs 1 life (the revealed letter is marked “used” so it won’t score later)  
- Give up: reveals the word, shows a red card, and resets the streak

**Controls**
- Click the on-screen keyboard (Ñ included) or use your physical keyboard  
- Enter → New game

---

## Accent Handling

All comparisons use a normalized, diacritic-free, uppercase form of the strings; the display preserves accents and punctuation:

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
- Some browsers require a user interaction first (click/keypress) to enable audio.

---

## Customization

- Add or edit teams/countries directly in teamlist.json.
- Tweak visuals in styles.css (ball/goal animations use .idle, .tap, .post, .kick, and net .ripple).
- Want to require the JSON (no fallback)? In script.js, make loadData() throw on fetch error and show a toast instructing to serve the folder over HTTP.

---

## Troubleshooting

- Only a few countries appear: serve over HTTP and ensure teamlist.json is next to index.html. The country dropdown lists all pais values from your file.
- No voice/SFX: click once on the page or press any key to unlock audio; check SpeechSynthesis/WebAudio support in your browser.
- Odd ball/goal animations: ensure CSS classes .idle, .tap, .post, .kick, .ripple exist and aren’t overridden; animations are centrally managed to avoid overlap.

---

## Tech Stack

- HTML5 / CSS3 / JavaScript (no build step required)
- WebAudio (beeps/SFX)
- SpeechSynthesis (optional voice lines)
- LocalStorage (score & streak persistence)
