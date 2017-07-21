'use strict';

import Config from './Config.js';
import Syllabary from './Syllabary.js';
import FileLoader from './FileLoader.js';

export default class GlyphLoader {

	constructor() {
		this.numGlyphsLoaded = 0;
		this.numGlyphsTotal = Syllabary.xDim * Syllabary.yDim * Syllabary.zDim;

		this.load();
	}

	load() {
		let that = this;
		for (let x=1; x <= Syllabary.xDim; x++) {
			for (let y=1; y <= Syllabary.yDim; y++) {
				for (let z=1; z <= Syllabary.zDim; z++) {
					let url = Config.baseUrl + "glyphs/" + x + "-" + y + "-" + z + ".svg";
					let promise = FileLoader.load(url);
					promise.then((data) => {
						Syllabary.grid.syllables[x][y][z].setGlyphData(data);
					})/*.catch((e) => {
						console.log(e);
					});*/
				}
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
