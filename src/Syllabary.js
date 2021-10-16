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



