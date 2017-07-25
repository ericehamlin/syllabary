'use strict';

import Grid from './Grid.js';
import GlyphLoader from './GlyphLoader.js';
import LoadingDisplay from './display/LoadingDisplay.js';
import SyllabaryDisplay from './display/SyllabaryDisplay.js';

export default class Syllabary {

	constructor({ containerId,
		xDim = 20, yDim = 10, zDim = 18,
		xPosition = null, yPosition = null, zPosition = null }) {
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

				that.animateDirection = {x:0.5, y:0, z:0};
				console.log("running Syllabary");
				that.run();

				return;
			}
			setTimeout(function() { checkLoading(); }, 10);
		}

		checkLoading();

		// when complete,

	}

	run() {

		// continue regularly until some unforseen event takes place, in which case,
		// this.complete()

		// current state
		// if (isReading) // precludes other changes
		// if (isDragging)
		// if (isWheeling)
		// if (isDrifting)
		// if (isAnimating) ?? not called this


		this.drift();

		setTimeout(() => {this.run(); }, 10);

	}

	animate() {
		Syllabary.grid.xPosition += this.animateDirection.x;
		Syllabary.grid.yPosition += this.animateDirection.y;
		Syllabary.grid.zPosition += this.animateDirection.z;
		this.syllabaryDisplay.render();
	}

	/**
	 * TODO combine drift and animate so that drift goes to a glyph
	 */
	drift() {
		let that = this;
		function getVelocity() {
			let xSqr = Math.pow(that.animateDirection.x, 2);
			let ySqr = Math.pow(that.animateDirection.y, 2);
			let zSqr = Math.pow(that.animateDirection.z, 2);
			return Math.sqrt(xSqr + ySqr + zSqr);
		}

		Syllabary.grid.xPosition += this.animateDirection.x;
		Syllabary.grid.yPosition += this.animateDirection.y;
		Syllabary.grid.zPosition += this.animateDirection.z;
		this.syllabaryDisplay.render();

		this.animateDirection.x = this.animateDirection.x * 0.95;
		this.animateDirection.y = this.animateDirection.y * 0.95;
		this.animateDirection.z = this.animateDirection.z * 0.95;

		if (getVelocity() < 0.01) {
			console.log("ending drift");
		}
	}

	complete() {
		console.log("completing Syllabary");
	}
}