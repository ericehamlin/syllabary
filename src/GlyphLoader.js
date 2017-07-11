'use strict';

import Config from './Config.js';
import FileLoader from './FileLoader.js';

export default class GlyphLoader {

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

	getTotalGlyphs() {

	}

	getPercentLoaded() {
		let numGlyphsLoaded = 0;
		let totalGlyphs = 0;

		// THIS CALCULATION IS OBVIOUSLY NOT CORRECT
		// BECAUSE I'M GETTING VALUES ABOVE 100

		// forEachSyllable( function() {} );
		for (let x=1; x <= this.xDim; x++) {
			for (let y=1; y <= this.yDim; y++) {
				for (let z=1; z <= this.zDim; z++) {
					// performActionOnSyllable
					totalGlyphs++;
					if (this.grid.syllables[x][y][z].glyph.isLoaded) {
						numGlyphsLoaded++;
					}
				}
			}
		}
		return numGlyphsLoaded % totalGlyphs;
	}
}
