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
import { PHONEMES } from 'constants';

const Syllabary = {

	start: (options) => {
		const {
      containerId,
      xPosition = null,
      yPosition = null,
      zPosition = null
    } = options;

		Config.set(options);

		Syllabary.containerId = containerId;

    Syllabary.dims = {
      initialConsonants: PHONEMES.initialConsonants.length - 1,
      vowels:            PHONEMES.vowels.length - 1,
      finalConsonants:   PHONEMES.finalConsonants.length - 1
    };

    Syllabary.soundsToDimensionsMap = {
      initialConsonants: 'x',
      vowels: 'z',
      finalConsonants: 'y'
    };

    Syllabary.dims['x'] = Syllabary.dims.initialConsonants;
    Syllabary.dims['z'] = Syllabary.dims.vowels;
    Syllabary.dims['y'] = Syllabary.dims.finalConsonants;


		/** this probably shouldn't be a class variable, but it needs to be globally available */
		Syllabary.grid = new Grid(xPosition, yPosition, zPosition);

    Style.addRules();

		Syllabary.initialize();
	},

	initialize: () => {
		Logger.info("Initializing Syllabary");
    LoadingDisplay.create();
		Syllabary.syllabaryDisplay = SyllabaryDisplay;
    SyllabaryDisplay.init();
		if (Config.debug) { new DebugControls(); }
		Syllabary.load();
	},

  testAutoplay: () => {
    const audioEl = document.getElementById('test-autoplay');
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

		const glyphLoader = new GlyphLoader();
		const sound = new WebAudioAPISound(Config.baseUrl + "audio/silence.mp3");

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
					Syllabary.syllabaryDisplay.initGrid();
					Syllabary.syllabaryDisplay.render();
					Syllabary.syllabaryDisplay.add();
          Syllabary.runController = new RunController();
					Logger.info("Running Syllabary");
          Syllabary.testAutoplay().then(Syllabary.run);

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
		const x = actual || Syllabary.grid.xPosition + diff;
		return Syllabary.getCurrentLocation(x, Syllabary.dims.x);
	},

	getY: ({diff=0, actual=null} = {}) => {
		const y = actual || Syllabary.grid.yPosition + diff;
		return Syllabary.getCurrentLocation(y, Syllabary.dims.y);
	},

	getZ: ({diff=0, actual=null} = {}) => {
		const z = actual || Syllabary.grid.zPosition + diff;
		return Syllabary.getCurrentLocation(z, Syllabary.dims.z);
	},
};

export default Syllabary;



