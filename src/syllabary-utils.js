'use strict';
import { PHONEMES_TO_AXES_MAP, PHONEME_DIMENSIONS } from './constants';

export function getTotalSyllables() {
  return PHONEME_DIMENSIONS.initialConsonants
    * PHONEME_DIMENSIONS.vowels
    * PHONEME_DIMENSIONS.finalConsonants;
}

export function getSyllableStringForXYZ(x, y, z) {
  const {
    initialConsonant,
    vowel,
    finalConsonant
  } = getSyllableValuesForXYZ({x:x, y:y, z:z});
  return `${initialConsonant}-${vowel}-${finalConsonant}`;
}

export function getSyllableValuesForXYZ(args) {
  return {
    initialConsonant: args[PHONEMES_TO_AXES_MAP.initialConsonants],
    vowel: args[PHONEMES_TO_AXES_MAP.vowels],
    finalConsonant: args[PHONEMES_TO_AXES_MAP.finalConsonants]
  }
}

export function getXYZForSyllable(syllable) {
  return getXYZForSyllableValues(
    syllable.initialConsonant,
    syllable.vowel,
    syllable.finalConsonant
  );
}

export function getXYZForSyllableValues(initialConsonant, vowel, finalConsonant) {
  return     {
    [PHONEMES_TO_AXES_MAP.initialConsonants]: initialConsonant,
    [PHONEMES_TO_AXES_MAP.vowels]: vowel,
    [PHONEMES_TO_AXES_MAP.finalConsonants]: finalConsonant
  };
}
