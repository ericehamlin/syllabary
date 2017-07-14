'use strict';

import Grid from './Grid.js';
import GlyphLoader from './GlyphLoader.js';
import LoadingDisplay from './display/LoadingDisplay.js';
import SyllabaryDisplay from './display/SyllabaryDisplay.js';

export default class Syllabary {

	constructor(containerId, xDim=20, yDim=10, zDim=18) {
		Syllabary.containerId = containerId;

		Syllabary.xDim = xDim;
		Syllabary.yDim = yDim;
		Syllabary.zDim = zDim;

		Syllabary.characters = {};
		Syllabary.characters.x = [];
		Syllabary.characters.y = [];
		Syllabary.characters.z = [];

		this.grid = new Grid();
		this.initialize();
	}

	initialize() {

		this.loadingDisplay = new LoadingDisplay();
		this.syllabaryDisplay = new SyllabaryDisplay(this.grid);
		this.load();
	}

	load() {
		let that = this;

		this.loadingDisplay.add();

		let glyphLoader = new GlyphLoader(this.grid);

		// LoadingScreen
		// check loading until complete
		let loadingPercentComplete = 0;
		function checkLoading() {
			loadingPercentComplete = glyphLoader.getPercentLoaded();
			that.loadingDisplay.render(loadingPercentComplete);

			if (loadingPercentComplete >= 100) {
				that.loadingDisplay.remove();
				that.syllabaryDisplay.render();
				that.syllabaryDisplay.add();
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

new Syllabary('syllabary-container');