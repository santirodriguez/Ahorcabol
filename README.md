# Ahorcabol

<p align="center">
  <img src="assets/branding/ahorcabol-head-medium.png" alt="Ahorcabol" width="620" />
</p>

<p align="center">
  <strong>Football hangman. One club. Six lives. No VAR.</strong>
</p>

<p align="center">
  Pick a league, guess the club, build a streak, and try not to get sent off by the alphabet.
</p>

<p align="center">
  <a href="https://santiagorodriguez.com/Ahorcabol/">
    <img src="https://img.shields.io/badge/PLAY_ONLINE-16a34a?style=for-the-badge&labelColor=07131f" alt="Play Ahorcabol online" />
  </a>
  <a href="https://github.com/santirodriguez/Ahorcabol/releases">
    <img src="https://img.shields.io/badge/RELEASES-GitHub-2563eb?style=for-the-badge&logo=github&logoColor=white&labelColor=07131f" alt="Ahorcabol releases on GitHub" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/LICENSE-GPL--3.0-f59e0b?style=for-the-badge&labelColor=07131f" alt="GPL-3.0 license" />
  </a>
</p>

<p align="center">
  <img src="assets/branding/usa.svg" alt="" width="22" /> <strong>English</strong>
  &nbsp;·&nbsp;
  <img src="assets/branding/argentina.svg" alt="" width="22" /> <strong>Español</strong>
  &nbsp;·&nbsp;
  <img src="assets/branding/senyera.svg" alt="" width="22" /> <strong>Català</strong>
</p>

---

## ⚽ Play

<p align="center">
  <a href="https://santiagorodriguez.com/Ahorcabol/">
    <img src="https://img.shields.io/badge/▶_PLAY_AHORCABOL-111827?style=for-the-badge" alt="Play Ahorcabol" />
  </a>
</p>

Play it in a modern browser, or download the repository and open `index.html` locally. No installation, account, or build step is needed to play.

<p align="center">
  <img src="assets/screenshots/screenshot-v1.8.0.png" alt="Ahorcabol v1.8.0 completed round with music enabled" width="900" />
</p>

<p align="center">
  <sub>Ahorcabol v1.8.0 — football, letters, and questionable decisions.</sub>
</p>

---

## ✨ Highlights

|  |  |  |
| :---: | :---: | :---: |
| **⚽ Football hangman** | **🏆 Score & streaks** | **🎵 Match-day audio** |
| Clubs from Argentina, Brazil, England, France, Germany, Portugal, Spain and MLS. | Correct letters score points, wins build your streak, and hints cost a life. | Original background music, sound effects and browser voice, each with its own control. |
| **⌨️ Play your way** | **🌐 Three languages** | **📦 No installation** |
| Use the on-screen keyboard or a physical one on desktop or mobile. | English, Español and Català, with the same game state when you switch. | Play online or open the game directly from a local folder. |

Ahorcabol keeps the rules simple: six lives, one hidden club, and just enough help to make using a hint feel slightly guilty.

---

## 🆕 What’s new in 1.8.0

- **Original match-day music** with a separate Music control.
- **Smoother sound effects** and more reliable audio when muting, changing rounds, or leaving the page.
- **Clearer guess and hint feedback** so the game communicates more without getting in the way.
- **Calmer motion and cleaner presentation**, including improved goal and ball animations.
- **Better accessibility** for the hidden club name and game status.
- **Lighter runtime visuals** with smaller branding assets.

Saved games and existing audio choices continue to work as before.

---

## 🎯 How to play

1. Choose a league — or mix every club into one pool.
2. Guess letters using the on-screen keyboard or your physical keyboard.
3. You have **six lives**. Wrong letters cost one.
4. A hint reveals a hidden letter everywhere it appears, but also costs one life.
5. Correct guesses earn points. Winning keeps your streak alive.
6. Clubs are shuffled without repeats until the current pool is exhausted.

Changing league during a round, losing, or giving up resets the streak — but not your total score.

---

## 🌍 Clubs

The game includes clubs from:

**Argentina · Brazil · England · France · Germany · Portugal · Spain · MLS**

The catalog is intentionally local and bundled with the game, so Ahorcabol does not need a live sports service just to start a round.

---

## 📦 Offline

Ahorcabol is a static game. Download the repository ZIP, extract it, and open `index.html`.

Everything needed to play is included locally. A normal static web server works too, but it is not required.

---

<details>
<summary><strong>🛠️ Development & technical notes</strong></summary>

<br />

Ahorcabol is intentionally lightweight: plain HTML, CSS and JavaScript, with no package installation or build step required to play.

### Development checks

With **Node.js 22 or later**:

```sh
node --check audio.js
node --check script.js
node --check teamlist.js
node --test tests/*.test.cjs
```

The dependency-free tests run the real game logic with a small DOM adapter and exercise the audio controller with a fake audio backend. They cover scoring, hints, round outcomes, saved-state recovery, keyboard input, localization, shuffle behavior, catalog playability and audio lifecycle behavior.

Browser checks still matter for layout, focus, speech/audio behavior and screen readers.

### Audio behavior

Effects and the original eight-bar background loop are synthesized locally in `audio.js`; Ahorcabol does not download music or sound files.

- Music, sound effects and voice are independent.
- Music is enabled by default when there is no saved choice, but playback still waits for user interaction.
- An explicit saved Music-off choice remains off.
- Reloading does not autoplay sound.
- Hiding the page stops playback until another eligible interaction resumes it.
- Unsupported audio or speech never prevents the game from working.

### Club data

`teamlist.js` contains the bundled club catalog. It currently follows the 2026 Argentine, Brazilian and MLS seasons and the 2026/27 English, French, German, Portuguese and Spanish top-flight seasons.

Before a release, check narrow mobile and desktop layouts, all three languages, keyboard/touch input, reload recovery and direct `file://` play.

</details>

---

## 👤 Author

Made by **[Santiago Rodriguez](https://santiagorodriguez.com)**.

<a href="https://santiagorodriguez.com/donate">
  <img src="assets/branding/donate.svg" alt="Donate" height="52" />
</a>

## 📄 License

**GNU General Public License v3.0 (GPL-3.0)** — see [LICENSE](LICENSE).
