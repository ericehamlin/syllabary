'use strict';

import Grid from './Grid.js';
import GlyphLoader from './GlyphLoader.js';
import LoadingDisplay from './display/LoadingDisplay.js';
import SyllabaryDisplay from './display/SyllabaryDisplay.js';
import * as Hammer from "hammerjs";

export default class Syllabary {

	constructor({ containerId,
		xDim = 20, yDim = 10, zDim = 18,
		xPosition = null, yPosition = null, zPosition = null }) {
		Syllabary.containerId = containerId;

		Syllabary.xDim = xDim;
		Syllabary.yDim = yDim;
		Syllabary.zDim = zDim;

		/** A phoneme (from the Greek:  phonema, "a sound uttered") is the smallest linguistically distinctive unit of sound. */
		Syllabary.phonemes = {};
		/** initial consonants */
		Syllabary.phonemes.x = [null, '', 'B', 'P', 'M', 'V', 'F', 'Th', 'N', 'T', 'D', 'S', 'Tj', 'Sh', 'R', 'Y', 'G', 'K', 'H', 'W', 'L'];
		/** vowels */
		Syllabary.phonemes.y = [null, "U", "O", "o", "u", "a", "i", "e", "A", "E", "I"];
		/** final consonants */
		Syllabary.phonemes.z = [null, '', 'B', 'P', 'M', 'V', 'F', 'Th', 'N', 'T', 'D', 'Z', 'S', 'Tj', 'Sh', 'R', 'G', 'K', 'L'];

		Syllabary.grid = new Grid(xPosition, yPosition, zPosition);

		Syllabary.runStates = {
			"READ" : "read",
			"DRAG" : "drag",
			"WHEEL" : "wheel",
			"DRIFT" : "drift",
			"ANIMATE" : "animate"
		};

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

				that.runState = Syllabary.runStates.DRIFT;

				that.animateDirection = {x:0.5, y:0, z:0};
				
				let el = document.getElementById(Syllabary.containerId);
				let hammer = new window.Hammer(el);
				hammer.get('pinch').set({ enable: true });
				hammer.on('pinch', function(ev) {
					alert(ev);
				});

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

		switch(this.runState) {
			case Syllabary.runStates.DRIFT :
				this.drift();
				break;
			case Syllabary.runStates.ANIMATE :
				this.animate();
				break;
		}




		setTimeout(() => {this.run(); }, 10);

	}

	animate() {
		let oldXPosition = Syllabary.grid.xPosition,
			oldYPosition = Syllabary.grid.yPosition,
			oldZPosition = Syllabary.grid.zPosition;

		Syllabary.grid.xPosition += this.animateDirection.x;
		Syllabary.grid.yPosition += this.animateDirection.y;
		Syllabary.grid.zPosition += this.animateDirection.z;
		this.syllabaryDisplay.render();

		if (Math.floor(oldXPosition) != Math.floor(Syllabary.grid.xPosition)) {
			console.log("ending animate");
			this.runState = Syllabary.runStates.READ;
		}
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

		let drag = 0.95;
		this.animateDirection.x = this.animateDirection.x * drag;
		this.animateDirection.y = this.animateDirection.y * drag;
		this.animateDirection.z = this.animateDirection.z * drag;

		if (getVelocity() < 0.01) {
			console.log("ending drift");
			this.runState = Syllabary.runStates.ANIMATE;
		}
	}

	complete() {
		console.log("completing Syllabary");
	}
}