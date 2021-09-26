'use strict';
/**
 * A phoneme (from the Greek:  phonema, "a sound uttered")
 * is the smallest linguistically distinctive unit of sound.
 */
export const PHONEMES = {
  initialConsonants: [null, '-', 'B', 'P', 'M', 'V', 'F', 'Th', 'N', 'T', 'D', 'S', 'Tj', 'Sh', 'R', 'Y', 'G', 'K', 'H', 'W', 'L'],
  vowels: [null, "U", "O", "o", "u", "a", "i", "e", "A", "E", "I"],
  finalConsonants: [null, '-', 'B', 'P', 'M', 'V', 'F', 'Th', 'N', 'T', 'D', 'Z', 'S', 'Tj', 'Sh', 'R', 'G', 'K', 'L'],
};

export const PHONEMES_TO_AXES_MAP = {
  initialConsonants: 'x',
  vowels: 'z',
  finalConsonants: 'y'
};

export const PHONEME_DIMENSIONS = {
  initialConsonants: PHONEMES.initialConsonants.length - 1,
  vowels:            PHONEMES.vowels.length - 1,
  finalConsonants:   PHONEMES.finalConsonants.length - 1
};

export const AXIS_DIMENSIONS = {
  [PHONEMES_TO_AXES_MAP.initialConsonants]:
    PHONEME_DIMENSIONS.initialConsonants,
  [PHONEMES_TO_AXES_MAP.vowels]:
    PHONEME_DIMENSIONS.vowels,
  [PHONEMES_TO_AXES_MAP.finalConsonants]:
    PHONEME_DIMENSIONS.finalConsonants,
};

export const NUM_VISIBLE_LAYERS = 4;
