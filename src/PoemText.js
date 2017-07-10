'use strict';

import Config from './Config.js';
import FileLoader from './FileLoader.js';

export default class PoemText {
	constructor(x, y, z) {
		this.url = Config.baseUrl + "/poems/" + x + "-" + y + "-" + z + ".xml";
		//this.load();
	}

// <poem>
// <title></title>
// <author>Peter McCarey</author>
// <text>Between the concealed
// 	And the karaoke mike
// 	Feedback screamed
// 	At John le Carré.
// </text>
// </poem>
	load() {
		if (this.isLoaded()) {
			return;
		}
		let promise = FileLoader.load(this.url);
		promise.then((val) => console.log("OHA", val));
	}

	isLoaded() {
		return false;
	}
}