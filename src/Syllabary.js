'use strict';

import Grid from './Grid.js';
import GlyphLoader from './GlyphLoader.js';
import LoadingDisplay from './display/LoadingDisplay.js';
import SyllabaryDisplay from './display/SyllabaryDisplay.js';

export default class Syllabary {

	constructor({
		containerId,
		xDim = 20,
		yDim = 10,
		zDim = 18,
		xPosition = null,
		yPosition = null,
		zPosition = null
		}) {
		Syllabary.containerId = containerId;

		Syllabary.xDim = xDim;
		Syllabary.yDim = yDim;
		Syllabary.zDim = zDim;

		Syllabary.characters = {};
		Syllabary.characters.x = [];
		Syllabary.characters.y = [];
		Syllabary.characters.z = [];

		Syllabary.grid = new Grid(xPosition, yPosition, zPosition);
		this.initialize();
	}

	initialize() {

		this.loadingDisplay = new LoadingDisplay();
		this.syllabaryDisplay = new SyllabaryDisplay();
		this.load();
	}

	load() {
		let that = this;

		this.loadingDisplay.add();

		let glyphLoader = new GlyphLoader();

		// LoadingScreen
		// check loading until complete
		let loadingPercentComplete = 0;
		function checkLoading() {
			loadingPercentComplete = glyphLoader.getPercentLoaded();
			that.loadingDisplay.render(loadingPercentComplete);

			if (loadingPercentComplete >= 100) {
				that.loadingDisplay.remove();
				that.syllabaryDisplay.initialize();
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