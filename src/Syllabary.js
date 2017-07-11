'use strict';

import Grid from './Grid.js';
import GlyphLoader from './GlyphLoader.js';

// Shouldn't this be named theSyllabary ho ho
// Let he who is without sin cast the first stone at this poor endeavor
// |----------------------------|-----------------------------|
// |      Digital Watermark Here! Please Remove!              |
// |                      Or Change!                          |
// |----------------------------|-----------------------------|
//
//

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
		this.initialize();
	}

	initialize() {

		this.load();
	}

	load() {
		let that = this;
		let glyphLoader = new GlyphLoader(this.xDim, this.yDim, this.zDim, this.grid);

		// LoadingScreen
		// check loading until complete
		let loadingPercentComplete = 0;
		function checkLoading() {
			loadingPercentComplete = glyphLoader.getPercentLoaded();
			console.log(loadingPercentComplete + " percent loaded");
			if (loadingPercentComplete >= 100) {

				that.run();
				that.complete();
				return;
			}
			setTimeout(function() { checkLoading(); }, 10);
		}

		checkLoading();

		// when complete,

	}

	run() {
		console.log("running Syllabary");
		// continue regularly until some unforseen event takes place, in which case,
		// this.complete()
	}

	complete() {
		console.log("completing Syllabary");
	}
}

new Syllabary();