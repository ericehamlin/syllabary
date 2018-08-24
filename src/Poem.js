'use strict';

import Config from 'Config';
import FileLoader from 'FileLoader';

export default class Poem {

	constructor(i, j, k) {
		this.url = Config.baseUrl + "poems/" + i + "-" + j + "-" + k + ".xml";
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

						Syllabary.syllabaryDisplay.poemDisplay.show().then(()=> { resolve(true); });

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
					Syllabary.syllabaryDisplay.poemDisplay.show().then(() => { resolve(true); });
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
			this.text = `<pre>${getElementText("text")}</pre>`;
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
