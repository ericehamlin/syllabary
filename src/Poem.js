'use strict';

import FileLoader from 'FileLoader';
import Logger from 'Logger';
import SyllabaryDisplay from 'SyllabaryDisplay';

export default class Poem {

	constructor(initialConsonant, vowel, finalConsonant) {
		this.url = "/poems/" + initialConsonant + "-" + vowel + "-" + finalConsonant + ".xml";
		this.isLoaded = false;
	}

	display() {
		let poemPromise = new Promise((resolve, reject) => {
			if (!this.isLoaded) {
				let loadPromise = this.load();
				loadPromise.then((data) => {
					if (this.text) {
						SyllabaryDisplay.setPoemText(this.text);
						SyllabaryDisplay.setPoemTitle(this.title);

						SyllabaryDisplay.showPoem().then(() => {
						  resolve(true);
						});

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
					SyllabaryDisplay.setPoemText(this.text);
					SyllabaryDisplay.setPoemTitle(this.title);
					SyllabaryDisplay.showPoem().then(() => { resolve(true); });
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
				Logger.warn("Poem file " + that.url + " not found. Assuming poem does not exist.");
				this.isLoaded = true;
			}
			// else retry?
		});
		return promise;
	}
}
