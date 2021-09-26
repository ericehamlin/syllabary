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
import { AXIS_DIMENSIONS } from './constants';

const Syllabary = {
  grid: Grid,

	start: (options) => {
		const {
      containerId,
      xPosition = null,
      yPosition = null,
      zPosition = null
    } = options;

		Config.set(options);

		Syllabary.containerId = containerId;

		Grid.init(xPosition, yPosition, zPosition);

    Style.addRules();

		Syllabary.initialize();
	},

	initialize: () => {
		Logger.info("Initializing Syllabary");
    LoadingDisplay.create();
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

		GlyphLoader.load();
		const sound = new WebAudioAPISound(Config.baseUrl + "audio/silence.mp3");

		// check loading until complete
		let loadingPercentComplete = 0;
		function checkLoading() {
			loadingPercentComplete = GlyphLoader.getPercentLoaded();
      LoadingDisplay.render(loadingPercentComplete);

			if (loadingPercentComplete >= 100) {
				LoadingDisplay.enableButtons();

				LoadingDisplay.addEventListener('play', function() {
					sound.play();
          LoadingDisplay.remove();
					SyllabaryDisplay.initGrid();
					SyllabaryDisplay.render();
					SyllabaryDisplay.add();
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
		return Syllabary.getCurrentLocation(x, AXIS_DIMENSIONS.x);
	},

	getY: ({diff=0, actual=null} = {}) => {
		const y = actual || Syllabary.grid.yPosition + diff;
		return Syllabary.getCurrentLocation(y, AXIS_DIMENSIONS.y);
	},

	getZ: ({diff=0, actual=null} = {}) => {
		const z = actual || Syllabary.grid.zPosition + diff;
		return Syllabary.getCurrentLocation(z, AXIS_DIMENSIONS.z);
	},
};

export default Syllabary;



