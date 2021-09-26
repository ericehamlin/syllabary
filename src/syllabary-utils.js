'use strict';
import Syllabary from 'Syllabary';
import { PHONEMES_TO_AXES_MAP } from './constants';

export function getTotalSyllables() {
  return Syllabary.dims.initialConsonants
    * Syllabary.dims.vowels
    * Syllabary.dims.finalConsonants;
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
