'use strict';

import Config from 'Config';
import Grid from 'Grid';
import FileLoader from 'FileLoader';
import Logger from 'Logger';
import {
  getTotalSyllables,
  getXYZForSyllableValues
} from 'syllabary-utils';
import {
  AXIS_DIMENSIONS,
  PHONEME_DIMENSIONS
} from './constants';

const GlyphLoader = {
  numGlyphsTotal: 0,

  load: function() {
    this.numGlyphsTotal = getTotalSyllables();

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
            const {x, y, z} = getXYZForSyllableValues(initialConsonant, vowel, finalConsonant);
            Grid.getSyllable(x,y,z).setGlyphData(svg);
          });
        });
      }
    }
  },

  getNumLoaded: function() {
    let numGlyphsLoaded = 0;
    for (let x=1; x <= AXIS_DIMENSIONS.x; x++) {
      for (let y=1; y <= AXIS_DIMENSIONS.y; y++) {
        for (let z=1; z <= AXIS_DIMENSIONS.z; z++) {
          const syllable = Grid.getSyllable(x,y,z);
          if (syllable.glyph.isLoaded) {
            numGlyphsLoaded++;
          }
        }
      }
    }

    return numGlyphsLoaded;
  },

  getPercentLoaded: function() {
    const totalGlyphs = this.numGlyphsTotal;
    const numGlyphsLoaded = this.getNumLoaded();
    const percentGlyphsLoaded = 100 * numGlyphsLoaded / totalGlyphs;

    Logger.info(numGlyphsLoaded + " (" + percentGlyphsLoaded + ")%  of " + totalGlyphs + " glyphs loaded.");

    return percentGlyphsLoaded;
  }
};

export default GlyphLoader;
