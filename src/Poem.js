'use strict';

import Config from './Config.js';
import FileLoader from './FileLoader.js';

export default class Poem {

	constructor(x, y, z) {
		this.url = Config.baseUrl + "/poems/" + x + "-" + y + "-" + z + ".xml";
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

	display() {
		if (!this.isLoaded()) {
			this.load();
		}
	}

	load() {
		if (this.isLoaded()) {
			return;
		}
		let promise = FileLoader.load(this.url);
		promise.then((data) => {

			let parser = new DOMParser();
			let xmlDoc = parser.parseFromString(data, "text/xml");

			function getElementText(tagName) {
				if (xmlDoc.getElementsByTagName(tagName) &&
					xmlDoc.getElementsByTagName(tagName)[0].childNodes[0]
					) {
					return xmlDoc.getElementsByTagName(tagName)[0].childNodes[0].nodeValue;
				}
				else {
					return null;
				}
			}


			this.title = getElementText("title");
			this.text = getElementText("text");
			console.log(this.title, this.text);
		});
	}

	isLoaded() {
		return false;
	}
}
