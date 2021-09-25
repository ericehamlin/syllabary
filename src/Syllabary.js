'use strict';

import Config from 'Config';
import Grid from 'Grid';
import GlyphLoader from 'GlyphLoader';
import LoadingDisplay from 'LoadingDisplay';
import SyllabaryDisplay from 'SyllabaryDisplay';
import RunController from 'RunController';
import WebAudioAPISound from 'WebAudioAPISound';
import DebugControls from 'DebugControls';
import Style from 'Style';
import Logger from 'Logger';

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

    Syllabary.soundsToDimensionsMap = {initialConsonants: 'x', vowels: 'z', finalConsonants: 'y'};

    Syllabary.dims[Syllabary.soundsToDimensionsMap.initialConsonants] = Syllabary.dims.initialConsonants;
    Syllabary.dims[Syllabary.soundsToDimensionsMap.vowels] = Syllabary.dims.vowels;
    Syllabary.dims[Syllabary.soundsToDimensionsMap.finalConsonants] = Syllabary.dims.finalConsonants;


		/** this probably shouldn't be a class variable, but it needs to be globally available */
		Syllabary.grid = new Grid(xPosition, yPosition, zPosition);

    Style.addRules();

		Syllabary.initialize();
	},

	initialize: () => {
		Logger.info("Initializing Syllabary");
    LoadingDisplay.create();
		Syllabary.syllabaryDisplay = new SyllabaryDisplay();
		if (Config.debug) { new DebugControls(); }
		Syllabary.load();
	},

  testAutoplay: () => {
    const audioEl = document.getElementById('test-autoplay');
    console.log(audioEl)
    const autoplayPromise = audioEl.play();
    autoplayPromise.then(
      ()=>{},
      (rejection) => {
        alert('not allowed');
        Logger.error(rejection);
      }
    );
    return autoplayPromise;
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
				LoadingDisplay.enableButtons();

				LoadingDisplay.addEventListener('play', function() {
					sound.play();
          LoadingDisplay.remove();
					Syllabary.syllabaryDisplay.initialize();
					Syllabary.syllabaryDisplay.render();
					Syllabary.syllabaryDisplay.add();
          Syllabary.runController = new RunController();
					Logger.info("Running Syllabary");
          Syllabary.testAutoplay().then(
            () => Syllabary.run()
          );

				});

				return;
			}
			setTimeout(function() { checkLoading(); }, 10);
		}

		checkLoading();
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
		Logger.info("Completing Syllabary");
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


  getXYZForSyllable(syllable) {
    return Syllabary.getXYZForSyllableValues(syllable.initialConsonant, syllable.vowel, syllable.finalConsonant);
  },

  getXYZForSyllableValues(initialConsonant, vowel, finalConsonant) {
    return     {
      [Syllabary.soundsToDimensionsMap.initialConsonants]: initialConsonant,
      [Syllabary.soundsToDimensionsMap.vowels]: vowel,
      [Syllabary.soundsToDimensionsMap.finalConsonants]: finalConsonant
    };
  },

  getSyllableValuesForXYZ(args) {
    return {
      initialConsonant: args[Syllabary.soundsToDimensionsMap.initialConsonants],
      vowel: args[Syllabary.soundsToDimensionsMap.vowels],
      finalConsonant: args[Syllabary.soundsToDimensionsMap.finalConsonants]
    }
  },

  getSyllableStringForXYZ(x, y, z) {
    const {initialConsonant, vowel, finalConsonant} = Syllabary.getSyllableValuesForXYZ({x:x, y:y, z:z});
    return `${initialConsonant}-${vowel}-${finalConsonant}`;
  },

  getTotalSyllables() {
    return Syllabary.dims.initialConsonants * Syllabary.dims.vowels * Syllabary.dims.finalConsonants
  }
};

export default Syllabary;



