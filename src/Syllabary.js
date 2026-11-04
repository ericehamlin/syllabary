'use strict';

import Config from './Config.js';
import Grid from './Grid.js';
import GlyphLoader from './GlyphLoader.js';
import LoadingDisplay from './LoadingDisplay.js';
import SyllabaryDisplay from './SyllabaryDisplay.js';
import RunController from './RunController.js';
import WebAudioAPISound from './WebAudioAPISound.js';
import DebugControls from './DebugControls.js';
import Style from './Style.js';
import Logger from './Logger.js';
import { AXIS_DIMENSIONS } from './constants.js';

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

	load: () => {
    LoadingDisplay.add();

		GlyphLoader.load();
		const sound = new WebAudioAPISound("/audio/silence.mp3");

		// check loading until complete
		let loadingPercentComplete = 0;
		function checkLoading() {
			loadingPercentComplete = GlyphLoader.getPercentLoaded();
      LoadingDisplay.render(loadingPercentComplete);

			if (loadingPercentComplete >= 100) {

				LoadingDisplay.enableButtons();

				LoadingDisplay.addEventListener('play', function() {
					// This is the tap that lets iOS start audio.
					WebAudioAPISound.unlock();
					sound.play();
          LoadingDisplay.remove();
					SyllabaryDisplay.initGrid();
					SyllabaryDisplay.render();
					SyllabaryDisplay.add();
          Syllabary.runController = new RunController();
					Logger.info("Running Syllabary");
          Syllabary.run();

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
		Syllabary.runController.beginRun();

		// continue regularly until some unforseen event takes place, in which case,
		// this.complete()

	},

	complete: () => {
		Logger.info("Completing Syllabary");
	},

};

export default Syllabary;



