# Ahorcabol

<p align="center">
  <img src="assets/branding/ahorcabol-head-medium.png" alt="Ahorcabol" width="560" />
</p>

<p align="center">
  <strong>Football hangman. Fewer tactics, more spelling.</strong>
</p>

Ahorcabol is a football version of hangman: pick a league, guess the club, and try not to run out of lives before the name gives up first.

## Play

**Play online:** https://santiagorodriguez.com/Ahorcabol/

## What's new in 1.7.0

- Resume an unfinished or completed round after reloading, including hints, lives and points.
- Consistent local flag artwork and clearer correct/incorrect key states.
- Physical keyboard input keeps working after clicking controls.
- Expand **How to play** for the rules and scoring in your selected language.
- Stronger saved-data validation and recovery from missing game files.

## The game

- Pick one league or mix every club into the same bag.
- You get six lives. Wrong letters spend them; hints are not exactly charity either.
- Wins add points and keep your streak alive. Losing, giving up, or changing leagues mid-round does not.
- Play with the on-screen keyboard or a physical one. `Ñ` gets its own key, as it should.
- Sound effects and voice are optional.
- The club pool is shuffled without repeats until exhausted during a session. Changing language keeps its order. Reloading rebuilds the pool but avoids an immediate repeat.

### Languages

- 🇦🇷 **Español**
- 🇺🇸 **English**
- <img src="assets/branding/senyera.svg" alt="Senyera" width="22"> **Català**

## Clubs

The game includes clubs from Argentina, Brazil, England, France, Germany, Portugal, Spain and MLS.

`teamlist.js` is the club list used by the game. It currently follows the 2026 Argentine, Brazilian and MLS seasons and the 2026/27 English, French, German, Portuguese and Spanish top-flight seasons.

## Offline

Download the repository ZIP, extract it, and open `index.html` directly. That's it.

Everything needed to play is local. A static web server still works too, if you feel like making hangman slightly more official.

## Development checks

No installation or build step is needed to play. With Node.js 22 or later, run:

```sh
node --check audio.js
node --check script.js
node --check teamlist.js
node --test tests/*.test.cjs
```

The dependency-free tests execute the game runtime with a small DOM adapter
and exercise the audio controller with a fake audio clock/backend.
They cover scoring, hints, round outcomes, persistence recovery, keyboard input,
localization, the shuffle bag and catalog playability. They do not replace
browser checks for layout, focus behavior, speech/audio or screen readers.

Before releasing, check narrow mobile and desktop layouts in a browser, all three
languages, keyboard/touch input, reload recovery and direct `file://` play.
Storage and speech availability depend on the browser; gameplay works without them.

Effects are synthesized locally in the optional classic script `audio.js`.
Audio starts only after a play action or explicit SFX activation. Muting, starting
another round, or hiding the page cancels pending effects. Returning to the page
requires another play action to resume sound. A blocked audio backend never
prevents gameplay or erases the saved sound preference. Voice remains independent.
Audio tests cover scheduling and cancellation, not perceived sound quality;
audition cues and verify interruption/recovery in a browser before releasing.

## Screenshot

<p align="center">
  <img src="assets/screenshots/screenshot-v1.6.png" alt="Ahorcabol 1.6" width="90%" />
</p>

## Author

[Santiago Rodriguez](https://santiagorodriguez.com)

<a href="https://santiagorodriguez.com/donate"><img src="assets/branding/donate.svg" alt="Donate" height="52" /></a>

## License

GPLv3. See [`LICENSE`](LICENSE).

