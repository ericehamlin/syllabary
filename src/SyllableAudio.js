'use strict';

import Config from 'Config';
import WebAudioAPISound from 'WebAudioAPISound';

export default class SyllableAudio {
	constructor(i, j, k) {
		this.url = Config.baseUrl + "audio/" + i + "-" + j + "-" + k + ".mp3";
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
		this.data.pause();
	}

	resume() {
		this.data.resume();
	}

	load() {
		this.data = new WebAudioAPISound(this.url);

		// this.data = new Audio(this.url);
	}
}
