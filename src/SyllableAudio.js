'use strict';

import Config from './Config.js';
import WebAudioAPISound from './WebAudioAPISound.js';

export default class SyllableAudio {
	constructor(x, y, z) {
		this.url = Config.baseUrl + "audio/" + x + "-" + y + "-" + z + ".mp3";
		this.isLoaded = false;
	}

	/**
	 * TODO clearer understanding of when this is loaded
	 */
	play() {
		if (!this.data) {
			this.load();
		}
		return new Promise((resolve, reject) => {
			this.data.onEnd = function () {
				resolve();
			};
			this.data.play();
		});
	}

	pause() {
		this.data.stop();
	}

	load() {
		this.data = new WebAudioAPISound(this.url);

		// this.data = new Audio(this.url);
	}
}