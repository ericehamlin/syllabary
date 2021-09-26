'use strict';
import Syllabary from 'Syllabary'

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
    initialConsonant: args[Syllabary.soundsToDimensionsMap.initialConsonants],
    vowel: args[Syllabary.soundsToDimensionsMap.vowels],
    finalConsonant: args[Syllabary.soundsToDimensionsMap.finalConsonants]
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
    [Syllabary.soundsToDimensionsMap.initialConsonants]: initialConsonant,
    [Syllabary.soundsToDimensionsMap.vowels]: vowel,
    [Syllabary.soundsToDimensionsMap.finalConsonants]: finalConsonant
  };
}
