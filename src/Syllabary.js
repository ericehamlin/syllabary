'use strict';

import Config from 'Config';
import Utils from 'Utils';
import Grid from 'Grid';
import GlyphLoader from 'GlyphLoader';
import LoadingDisplay from 'LoadingDisplay';
import SyllabaryDisplay from 'SyllabaryDisplay';
import RunController from 'RunController';
import WebAudioAPISound from 'WebAudioAPISound';
import DebugControls from 'DebugControls';

let Syllabary = {

	start: (options) => {
		let { containerId, xPosition = null, yPosition = null, zPosition = null } = options;

		Config.set(options);

		Syllabary.containerId = containerId;

		/** A phoneme (from the Greek:  phonema, "a sound uttered") is the smallest linguistically distinctive unit of sound. */
		Syllabary.phonemes = {};
		/** initial consonants */
		Syllabary.phonemes.initialConsonants = [null, '-', 'B', 'P', 'M', 'V', 'F', 'Th', 'N', 'T', 'D', 'S', 'Tj', 'Sh', 'R', 'Y', 'G', 'K', 'H', 'W', 'L'];
		/** vowels */
		Syllabary.phonemes.vowels = [null, "U", "O", "o", "u", "a", "i", "e", "A", "E", "I"];
		/** final consonants */
		Syllabary.phonemes.finalConsonants = [null, '-', 'B', 'P', 'M', 'V', 'F', 'Th', 'N', 'T', 'D', 'Z', 'S', 'Tj', 'Sh', 'R', 'G', 'K', 'L'];

    Syllabary.dims = {
      initialConsonants: Syllabary.phonemes.initialConsonants.length - 1,
      vowels:            Syllabary.phonemes.vowels.length - 1,
      finalConsonants:   Syllabary.phonemes.finalConsonants.length - 1
    };

    Syllabary.soundsToDimensionsMap = {initialConsonants: 'x', vowels: 'y', finalConsonants: 'z'};

    Syllabary.dims[Syllabary.soundsToDimensionsMap.initialConsonants] = Syllabary.dims.initialConsonants;
    Syllabary.dims[Syllabary.soundsToDimensionsMap.vowels] = Syllabary.dims.vowels;
    Syllabary.dims[Syllabary.soundsToDimensionsMap.finalConsonants] = Syllabary.dims.finalConsonants;
    

		/** this probably shouldn't be a class variable, but it needs to be globally available */
		Syllabary.grid = new Grid(xPosition, yPosition, zPosition);

		let color2Rgb = Utils.hexToRgb(Config.color2);
		let stylesheet = document.styleSheets[0];
		stylesheet.insertRule(`html, body { color: ${Config.color1}; background-color: ${Config.color2}; }`);
		stylesheet.insertRule(`.fade-layer { background-color: ${Config.color2}; }`);
		stylesheet.insertRule(`.center-fade { background: radial-gradient(rgba(${color2Rgb.r},${color2Rgb.g},${color2Rgb.b},0.75) 20%, rgba(${color2Rgb.r},${color2Rgb.g},${color2Rgb.b},0)); }`)
		stylesheet.insertRule(`.poem-container { background-color: rgba(${color2Rgb.r},${color2Rgb.g},${color2Rgb.b}, 0.8); }`);
		stylesheet.insertRule(`.control-info { background-color: ${Utils.blendHexColors(Config.color2, Config.color1, 0.2)}; }`);

		Syllabary.initialize();
	},

	initialize: () => {
		console.info("Initializing Syllabary");
    LoadingDisplay.create();
		Syllabary.syllabaryDisplay = new SyllabaryDisplay();
		if (Config.debug) { new DebugControls(); }
		Syllabary.load();
	},


	load: () => {
    LoadingDisplay.add();

		let glyphLoader = new GlyphLoader();
		let sound = new WebAudioAPISound(Config.baseUrl + "audio/silence.mp3");

		// check loading until complete
		let loadingPercentComplete = 0;
		function checkLoading() {
			loadingPercentComplete = glyphLoader.getPercentLoaded();
      LoadingDisplay.render(loadingPercentComplete);

			if (loadingPercentComplete >= 100) {
				let button = LoadingDisplay.addButton();

				button.addEventListener("click", function() {
					sound.play();
          LoadingDisplay.remove();
					Syllabary.syllabaryDisplay.initialize();
					Syllabary.syllabaryDisplay.render();
					Syllabary.syllabaryDisplay.add();
          Syllabary.runController = new RunController();
					console.info("Running Syllabary");
					Syllabary.run();
				});

				return;
			}
			setTimeout(function() { checkLoading(); }, 10);
		}

		checkLoading();

		// when complete,

	},


	/**
	 * TODO move all this stuff to a controller
	 */
	run: () => {
		Syllabary.runController.run();

		// continue regularly until some unforseen event takes place, in which case,
		// this.complete()

	},

	complete: () => {
		console.info("Completing Syllabary");
	},

	/**
	 * TODO not a good name
	 *
	 * @param position
	 * @param dim
	 * @returns {number}
	 */
	getCurrentLocation: (position, dim) => {
		return position - (Math.floor(position/dim) * dim) + 1;
	},

	getX: ({diff=0, actual=null} = {}) => {
		let x = actual || Syllabary.grid.xPosition + diff;
		return Syllabary.getCurrentLocation(x, Syllabary.dims.x);
	},

	getY: ({diff=0, actual=null} = {}) => {
		let y = actual || Syllabary.grid.yPosition + diff;
		return Syllabary.getCurrentLocation(y, Syllabary.dims.y);
	},

	getZ: ({diff=0, actual=null} = {}) => {
		let z = actual || Syllabary.grid.zPosition + diff;
		return Syllabary.getCurrentLocation(z, Syllabary.dims.z);
	},

	getPhonemeFilename(x, y, z) {
  },

  getXForPhonemeIndex() {
  },

  getPhonemeIndexForX() {
  }
};

export default Syllabary;



