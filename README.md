# Ahorcabol

<p align="center">
  <img src="assets/branding/ahorcabol-logo-1.svg" alt="Ahorcabol" width="560" />
</p>

<p align="center">
  <strong>Football hangman, because watching your team was apparently not enough punishment.</strong>
</p>

Ahorcabol is a lightweight browser game about guessing football club names before the hangman catches up with you.

No accounts. No ads. No framework. No build step. Just football, letters, and the sort of emotional stability usually associated with a stoppage-time equalizer.

## Why

Football already gives you VAR, missed penalties, inexplicable substitutions and entire weekends ruined by eleven strangers.

Ahorcabol adds spelling to the list.

## Play

**Development / test build:** https://santiagorodriguez.com/Ahorcabol/

It may be newer than the latest stable GitHub release. Test accordingly; blind faith is for transfer windows.

## What it does

- Guess club names from seven football countries/leagues
- Six lives, score, streaks, hints and surrender for when optimism finally expires
- 🇦🇷 **Español** by default
- 🇺🇸 **English**
- <img src="assets/branding/senyera.svg" alt="Senyera" width="22"> **Català**
- Physical and on-screen keyboard support
- Country filtering
- Goal, post, net, confetti, sound and optional voice feedback
- Responsive layout for desktop and mobile
- `localStorage` persistence for score, streak and language
- Plain HTML, CSS and JavaScript with no dependencies

## Screenshot

<p align="center">
  <img src="assets/branding/screenshot-v1.5.png" alt="Ahorcabol 1.5" width="90%" />
</p>

## Run locally

Serve the repository directory with any static web server and open `index.html`.

There is no build command. Civilization survives.

If `teamlist.json` cannot be loaded, the game uses its built-in fallback list.

## Author

[Santiago Rodriguez](https://santiagorodriguez.com)

## License

GPLv3. See [`LICENSE`](LICENSE).
