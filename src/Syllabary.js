'use strict';

import Grid from './Grid.js';
import GlyphLoader from './GlyphLoader.js';
import LoadingDisplay from './display/LoadingDisplay.js';
import SyllabaryDisplay from './display/SyllabaryDisplay.js';
import RunController from './RunController.js';
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

		this.initialize();
	}

	initialize() {
		console.info("Initializing Syllabary");
		this.loadingDisplay = new LoadingDisplay();
		this.syllabaryDisplay = new SyllabaryDisplay();
		this.runController = new RunController(this);
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

				let el = document.getElementById(Syllabary.containerId);
				let hammer = new window.Hammer(el);
				hammer.get('pinch').set({ enable: true });
				hammer.on('pinch', function(ev) {
					that.runController.setDragging();
					console.log(ev);
					Syllabary.grid.zPosition += Math.sqrt(Math.pow(ev.deltaX, 2) + Math.pow(ev.deltaY, 2)) * 0.005;
					that.syllabaryDisplay.render();
				});

				console.info("Running Syllabary");
				that.run();

				return;
			}
			setTimeout(function() { checkLoading(); }, 10);
		}

		checkLoading();

		// when complete,

	}


	/**
	 * TODO move all this stuff to a controller
	 */
	run() {
		this.runController.run();

		// continue regularly until some unforseen event takes place, in which case,
		// this.complete()

	}

	complete() {
		console.info("Completing Syllabary");
	}
}