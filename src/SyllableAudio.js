'use strict';

import Config from './Config.js';
import WebAudioAPISound from './WebAudioAPISound.js';

export default class SyllableAudio {
	constructor(initialConsonant, vowel, finalConsonant) {
		this.url = "/audio/" + initialConsonant + "-" + vowel + "-" + finalConsonant + ".mp3";
		this.isLoaded = false;
	}

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
	}
}
