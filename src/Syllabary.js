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

		/** this probably shouldn't be a class variable, but it needs to be globally available */
		Syllabary.grid = new Grid(xPosition, yPosition, zPosition);

		Syllabary.runStates = {
			"READ" : "read", 		// audio is currently playing
			"DRAG" : "drag",		// user is controlling using touch gesture
			"CONTROL" : "control",	// user is controlling using provided control
			"DRIFT" : "drift",		// user has released drag
			"ANIMATE" : "animate"	// standard animation is advancing or drift has come to an end
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

				that.runState = Syllabary.runStates.ANIMATE;

				that.animateDirection = {x:0, y:0, z:0.005};

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

		switch(this.runState) {
			case Syllabary.runStates.READ :
				break;

			case Syllabary.runStates.DRAG :
				break;

			case Syllabary.runStates.CONTROL :
				break;

			case Syllabary.runStates.DRIFT :
				this.drift();
				break;

			case Syllabary.runStates.ANIMATE :
				this.animate();
				break;
		}

		// continue regularly until some unforseen event takes place, in which case,
		// this.complete()
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

		if (Math.floor(oldXPosition) != Math.floor(Syllabary.grid.xPosition) ||
			Math.floor(oldYPosition) != Math.floor(Syllabary.grid.yPosition) ||
			Math.floor(oldZPosition) != Math.floor(Syllabary.grid.zPosition)) {

			Syllabary.grid.xPosition = Math.round(Syllabary.grid.xPosition);
			Syllabary.grid.yPosition = Math.round(Syllabary.grid.yPosition);
			Syllabary.grid.zPosition = Math.round(Syllabary.grid.zPosition);

			this.syllabaryDisplay.render();

			console.log("ending animate");
			this.runState = Syllabary.runStates.READ;
			this.read();
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

	read() {
		// get current syllable
		let x = this.getCurrentLocation(Syllabary.grid.xPosition, Syllabary.xDim);
		let y = this.getCurrentLocation(Syllabary.grid.yPosition, Syllabary.yDim);
		let z = this.getCurrentLocation(Syllabary.grid.zPosition, Syllabary.zDim);

		let syllable = Syllabary.grid.syllables[x][y][z];
		syllable.play();

	}

	getCurrentLocation(position, dim) {
		if (position >= 0) {
			return position - (Math.floor(position/dim) * dim) + 1;
		}
		else {
			return position - (Math.ceil(position/dim) * dim) + 1;
		}

	}

	complete() {
		console.log("completing Syllabary");
	}
}