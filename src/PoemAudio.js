'use strict';

import Config from './Config.js';

export default class PoemAudio {
	constructor(x, y, z) {
		this.url = Config.baseUrl + "audio/" + x + "-" + y + "-" + z + ".mp3";
	}

	load() {

	}
}
