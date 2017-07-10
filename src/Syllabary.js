'use strict';

import Grid from './Grid.js';
import GlyphLoader from './GlyphLoader.js';

class Syllabary {

	constructor(xDim=20, yDim=10, zDim=18) {
		this.xDim = xDim;
		this.yDim = yDim;
		this.zDim = zDim;

		this.characters = {};
		this.characters.x = [];
		this.characters.y = [];
		this.characters.z = [];

		this.grid = new Grid(xDim, yDim, zDim);
		this.glyphLoader = new GlyphLoader(this.xDim, this.yDim, this.zDim, this.grid);
	}
}

new Syllabary();