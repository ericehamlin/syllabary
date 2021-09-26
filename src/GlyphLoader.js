'use strict';

import Config from 'Config';
import Syllabary from 'Syllabary';
import FileLoader from 'FileLoader';
import {
  getTotalSyllables,
  getXYZForSyllableValues
} from 'syllabary-utils';
import {
  AXIS_DIMENSIONS,
  PHONEME_DIMENSIONS
} from './constants';

export default class GlyphLoader {

  constructor() {
    this.numGlyphsTotal = getTotalSyllables();

    this.load();
  }

  load() {
    for (let i = 1; i <= PHONEME_DIMENSIONS.initialConsonants; i++) {
      for (let j = 1; j <= PHONEME_DIMENSIONS.vowels; j++) {
        const url = Config.baseUrl + "coallatedSvg/" + i + "-" + j + ".svg";
        let promise = FileLoader.load(url);
        promise.then((data) => {
          let svgs = data.match(/<svg[\s\S]+?\/svg>/gim);
          svgs.forEach(svg => {
            const match = svg.match(/id="(.+?)-(.+?)-(.+?)"/);
            const initialConsonant = match[1],
              vowel = match[2],
              finalConsonant = match[3];
            let {x, y, z} = getXYZForSyllableValues(initialConsonant, vowel, finalConsonant);
            Syllabary.grid.syllables[x][y][z].setGlyphData(svg);
          });
        });
      }
    }
  }

  getNumLoaded() {
    let numGlyphsLoaded = 0;
    for (let x=1; x <= AXIS_DIMENSIONS.x; x++) {
      for (let y=1; y <= AXIS_DIMENSIONS.y; y++) {
        for (let z=1; z <= AXIS_DIMENSIONS.z; z++) {
          let syllable = Syllabary.grid.syllables[x][y][z];
          if (syllable.glyph.isLoaded) {
            numGlyphsLoaded++;
          }
        }
      }
    }

    return numGlyphsLoaded;
  }

  getPercentLoaded() {
    let totalGlyphs = this.numGlyphsTotal;
    let numGlyphsLoaded = this.getNumLoaded();
    let percentGlyphsLoaded = 100 * numGlyphsLoaded / totalGlyphs;

    console.info(numGlyphsLoaded + " (" + percentGlyphsLoaded + ")%  of " + totalGlyphs + " glyphs loaded.");

    return percentGlyphsLoaded;
  }
}
