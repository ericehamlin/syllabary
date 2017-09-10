'use strict';

import Config from './Config.js';
import FileLoader from './FileLoader.js';

export default class Poem {

	constructor(x, y, z) {
		this.url = Config.baseUrl + "poems/" + x + "-" + y + "-" + z + ".xml";
		this.isLoaded = false;
	}

	display() {
		let poemPromise = new Promise((resolve, reject) => {
			if (!this.isLoaded) {
				let loadPromise = this.load();
				loadPromise.then((data) => {
					if (this.text) {
						Syllabary.syllabaryDisplay.poemDisplay.setText(this.text);
						Syllabary.syllabaryDisplay.poemDisplay.setTitle(this.title);
						Syllabary.syllabaryDisplay.poemDisplay.show();
						resolve(true);
					}
					else {
						resolve(false);
					}
				})
				.catch((e) => {
					resolve(false);
				});
			}
			else {
				if (this.text) {
					Syllabary.syllabaryDisplay.poemDisplay.setText(this.text);
					Syllabary.syllabaryDisplay.poemDisplay.setTitle(this.title);
					Syllabary.syllabaryDisplay.poemDisplay.show();
					resolve(true);
				}
				else {
					resolve(false);
				}
			}
		});
		return poemPromise;
	}

	load() {
		let that = this;
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
			this.isLoaded = true;
		})
		.catch((e) => {
			if (e === 404) {
				console.warn("Poem file " + that.url + " not found. Assuming poem does not exist.");
				this.isLoaded = true;
			}
			// else retry?
		});
		return promise;
	}
}
