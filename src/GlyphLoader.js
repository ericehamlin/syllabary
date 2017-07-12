'use strict';

import Config from './Config.js';
import FileLoader from './FileLoader.js';

export default class GlyphLoader {

	// WTF? These parameters should be "Global Variables," no?
	constructor(xDim, yDim, zDim, grid) {
		this.xDim = xDim;
		this.yDim = yDim;
		this.zDim = zDim;
		this.grid = grid;
		this.numGlyphsLoaded = 0;
		this.numGlyphsTotal = xDim * yDim * zDim;

		this.load();
	}

	load() {
		let that = this;
		for (let x=1; x <= this.xDim; x++) {
			for (let y=1; y <= this.yDim; y++) {
				for (let z=1; z <= this.zDim; z++) {
					let url = Config.baseUrl + "glyphs/" + x + "-" + y + "-" + z + ".svg";
					let promise = FileLoader.load(url);
					promise.then((data) => {
						that.grid.syllables[x][y][z].setGlyphData(data);
					})/*.catch((e) => {
						console.log(e);
					});*/
				}
			}
		}
	}

	getNumLoaded() {
		let numGlyphsLoaded = 0;
		this.grid.forEachSyllable(function(syllable) {
			if (syllable.glyph.isLoaded) {
				numGlyphsLoaded++;
			}
		});
		return numGlyphsLoaded;
	}

	getPercentLoaded() {
		let totalGlyphs = this.grid.getTotalSyllables();
		let numGlyphsLoaded = this.getNumLoaded();
		let percentGlyphsLoaded = 100 * numGlyphsLoaded / totalGlyphs;

		console.log(numGlyphsLoaded + " (" + percentGlyphsLoaded + ")%  of " + totalGlyphs + " glyphs loaded.");

		return percentGlyphsLoaded;
	}
}
