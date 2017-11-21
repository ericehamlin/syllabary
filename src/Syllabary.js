'use strict';

import Config from './Config.js';
import Grid from './Grid.js';
import GlyphLoader from './GlyphLoader.js';
import LoadingDisplay from './display/LoadingDisplay.js';
import SyllabaryDisplay from './display/SyllabaryDisplay.js';
import RunController from './RunController.js';
import WebAudioAPISound from './WebAudioAPISound.js';

export default class Syllabary {

	constructor({ containerId,
		xDim = 20, yDim = 10, zDim = 18,
		xPosition = null, yPosition = null, zPosition = null,
		color1 = "#000000", color2 = "#ffffff", color3 = "#aa0000"}) {

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

		Syllabary.color1 = color1;
		Syllabary.color2 = color2;
		Syllabary.color3 = color3;


		function hexToRgb(hex) {
			// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
			var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			hex = hex.replace(shorthandRegex, function(m, r, g, b) {
				return r + r + g + g + b + b;
			});

			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		}

		let color2Rgb = hexToRgb(color2);
		let stylesheet = document.styleSheets[0];
		stylesheet.insertRule(`html, body { color: ${color1}; background-color: ${color2};`);
		stylesheet.insertRule(`.fade-layer { background-color: ${color2};`);
		stylesheet.insertRule(`.center-fade { background: radial-gradient(rgba(${color2Rgb.r},${color2Rgb.g},${color2Rgb.b},0.75) 20%, rgba(${color2Rgb.r},${color2Rgb.g},${color2Rgb.b},0)); }`)
		stylesheet.insertRule(`.poem-container { background-color:rgba(${color2Rgb.r},${color2Rgb.g},${color2Rgb.b}, 0.8); }`)

		this.initialize();
	}

	initialize() {
		console.info("Initializing Syllabary");
		this.loadingDisplay = new LoadingDisplay();
		Syllabary.syllabaryDisplay = new SyllabaryDisplay();
		this.runController = new RunController(this);
		this.load();
	}

	load() {
		let that = this;

		this.loadingDisplay.add();

		let glyphLoader = new GlyphLoader();
		let sound = new WebAudioAPISound(Config.baseUrl + "audio/1-1-1.mp3");
		// LoadingScreen
		// check loading until complete
		let loadingPercentComplete = 0;
		function checkLoading() {
			loadingPercentComplete = glyphLoader.getPercentLoaded();
			that.loadingDisplay.render(loadingPercentComplete);

			if (loadingPercentComplete >= 100) {
				let button = that.loadingDisplay.addButton();
				button.addEventListener("click", function() {


					sound.play();

					that.loadingDisplay.remove();
					Syllabary.syllabaryDisplay.initialize();
					Syllabary.syllabaryDisplay.render();
					Syllabary.syllabaryDisplay.add();

					console.info("Running Syllabary");
					that.run();
				});

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

	/**
	 * TODO not a good name
	 *
	 * @param position
	 * @param dim
	 * @returns {number}
	 */
	static getCurrentLocation(position, dim) {
		return position - (Math.floor(position/dim) * dim) + 1;
	}
}



