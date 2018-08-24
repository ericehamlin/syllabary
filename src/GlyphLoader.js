'use strict';

import Config from 'Config';
import Syllabary from 'Syllabary';
import FileLoader from 'FileLoader';

export default class GlyphLoader {

	constructor() {
		this.numGlyphsLoaded = 0;
		this.numGlyphsTotal = Syllabary.xDim * Syllabary.yDim * Syllabary.zDim;

		this.load();
	}

	load() {
	  for (let i=1; i <= Syllabary.iDim; i++) {
	    for (let j=1; j <= Syllabary.jDim; j++) {
        let url = Config.baseUrl + "coallatedSvg/" + i + "-" + j + ".svg";
        let promise = FileLoader.load(url);
        promise.then((data) => {
          let svgs = data.match(/<svg[\s\S]+?\/svg>/gim);
          svgs.forEach(svg => {
            let match = svg.match(/id="(.+?)-(.+?)-(.+?)"/);
            let x = match[1],
                y = match[2],
                z = match[3];
            // TODO: xyz
            Syllabary.grid.syllables[x][y][z].setGlyphData(svg);
          });
        });
      }
    }
	}

	getNumLoaded() {
		let numGlyphsLoaded = 0;
		Syllabary.grid.forEachSyllable(function(syllable) {
			if (syllable.glyph.isLoaded) {
				numGlyphsLoaded++;
			}
		});
		return numGlyphsLoaded;
	}

	getPercentLoaded() {
		let totalGlyphs = Syllabary.grid.getTotalSyllables();
		let numGlyphsLoaded = this.getNumLoaded();
		let percentGlyphsLoaded = 100 * numGlyphsLoaded / totalGlyphs;

		console.log(numGlyphsLoaded + " (" + percentGlyphsLoaded + ")%  of " + totalGlyphs + " glyphs loaded.");

		return percentGlyphsLoaded;
	}
}
