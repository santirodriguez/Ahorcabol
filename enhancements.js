"use strict";

COUNTRY_LABELS.MLS = {
  "es-AR": "MLS",
  "en-US": "MLS",
  ca: "MLS"
};

Object.assign(I18N["es-AR"], {
  dataWarning: "No se pudo cargar la lista de equipos.",
  dataErrorBody: "Revisá que los archivos del juego estén completos y volvé a intentarlo."
});
Object.assign(I18N["en-US"], {
  dataWarning: "Could not load the team list.",
  dataErrorBody: "Check that the game files are complete and try again."
});
Object.assign(I18N.ca, {
  dataWarning: "No s'ha pogut carregar la llista d'equips.",
  dataErrorBody: "Comprova que els fitxers del joc estiguin complets i torna-ho a provar."
});

const SPOKEN_LETTERS = {
  "es-AR": {
    A: "a", B: "be", C: "ce", D: "de", E: "e", F: "efe", G: "ge", H: "hache",
    I: "i", J: "jota", K: "ka", L: "ele", M: "eme", N: "ene", "Ñ": "eñe", O: "o",
    P: "pe", Q: "cu", R: "erre", S: "ese", T: "te", U: "u", V: "uve",
    W: "doble uve", X: "equis", Y: "ye", Z: "zeta"
  },
  "en-US": {
    A: "A", B: "B", C: "C", D: "D", E: "E", F: "F", G: "G", H: "H", I: "I",
    J: "J", K: "K", L: "L", M: "M", N: "N", "Ñ": "enye", O: "O", P: "P", Q: "Q",
    R: "R", S: "S", T: "T", U: "U", V: "V", W: "W", X: "X", Y: "Y", Z: "Z"
  },
  ca: {
    A: "a", B: "be", C: "ce", D: "de", E: "e", F: "efa", G: "ge", H: "hac",
    I: "i", J: "jota", K: "ca", L: "ela", M: "ema", N: "ena", "Ñ": "enye", O: "o",
    P: "pe", Q: "cu", R: "erra", S: "essa", T: "te", U: "u", V: "ve baixa",
    W: "ve doble", X: "ics", Y: "i grega", Z: "zeta"
  }
};

function selectLocalizedVoice() {
  const preferred = I18N[state.language].locale.toLowerCase();
  const base = preferred.split("-")[0];
  const localized = voices.filter((voice) => voice.lang.toLowerCase().startsWith(base));

  if (!localized.length) return null;

  return (
    localized.find((voice) => voice.localService && voice.lang.toLowerCase() === preferred) ||
    localized.find((voice) => voice.localService) ||
    localized.find((voice) => voice.lang.toLowerCase() === preferred) ||
    localized.find((voice) => voice.default) ||
    localized[0]
  );
}

function localizedSpeechText(text) {
  const value = String(text).trim();
  const normalized = normalizeLetter(value);

  if ([...value].length === 1 && normalized) {
    return SPOKEN_LETTERS[state.language]?.[normalized] || value;
  }

  return value;
}

speak = function speakLocalized(text) {
  if (!state.voiceEnabled || !("speechSynthesis" in window)) return;

  try {
    const voice = selectLocalizedVoice();
    if (!voice) return;

    const utterance = new SpeechSynthesisUtterance(localizedSpeechText(text));
    utterance.voice = voice;
    utterance.lang = voice.lang || I18N[state.language].locale;
    utterance.rate = 0.96;
    utterance.pitch = 0.96;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    // Voice feedback is optional.
  }
};

const dataErrorBody = document.querySelector('[data-i18n="dataErrorBody"]');
if (dataErrorBody) dataErrorBody.textContent = t("dataErrorBody");
