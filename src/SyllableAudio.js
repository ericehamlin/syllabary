'use strict';

import Config from './Config.js';

export default class SyllableAudio {
	constructor(x, y, z) {
		this.url = Config.baseUrl + "audio/" + x + "-" + y + "-" + z + ".mp3";
		this.isLoaded = false;
	}

	play() {
		if (!this.data) {
			this.load();
		}
		this.data.play();
		this.data.addEventListener("ended", function() {
			alert("ended");
		});
	}

	load() {
		this.data = new Audio(this.url);
	}
}
