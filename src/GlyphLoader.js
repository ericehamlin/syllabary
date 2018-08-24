'use strict';

import Config from 'Config';
import Syllabary from 'Syllabary';
import FileLoader from 'FileLoader';

export default class GlyphLoader {

  constructor() {
    this.numGlyphsTotal = Syllabary.getTotalSyllables();

    this.load();
  }

  load() {
    for (let i = 1; i <= Syllabary.dims.initialConsonants; i++) {
      for (let j = 1; j <= Syllabary.dims.vowels; j++) {
        const url = Config.baseUrl + "coallatedSvg/" + i + "-" + j + ".svg";
        let promise = FileLoader.load(url);
        promise.then((data) => {
          let svgs = data.match(/<svg[\s\S]+?\/svg>/gim);
          svgs.forEach(svg => {
            const match = svg.match(/id="(.+?)-(.+?)-(.+?)"/);
            const initialConsonant = match[1],
              vowel = match[2],
              finalConsonant = match[3];
            // TODO: xyz
            Syllabary.grid.syllables[initialConsonant][vowel][finalConsonant].setGlyphData(svg);
          });
        });
      }
    }
  }

  getNumLoaded() {
    let numGlyphsLoaded = 0;
    Syllabary.grid.forEachSyllable(function (syllable) {
      if (syllable.glyph.isLoaded) {
        numGlyphsLoaded++;
      }
    });
    return numGlyphsLoaded;
  }

  getPercentLoaded() {
    let totalGlyphs = this.numGlyphsTotal;
    let numGlyphsLoaded = this.getNumLoaded();
    let percentGlyphsLoaded = 100 * numGlyphsLoaded / totalGlyphs;

    console.log(numGlyphsLoaded + " (" + percentGlyphsLoaded + ")%  of " + totalGlyphs + " glyphs loaded.");

    return percentGlyphsLoaded;
  }
}
