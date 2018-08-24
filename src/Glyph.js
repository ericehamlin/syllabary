'use strict';

import Syllabary from 'Syllabary';
import Config from 'Config';

export default class Glyph {

	constructor(initialConsonant, vowel, finalConsonant) {
		this.initialConsonant = initialConsonant;
		this.vowel = vowel;
		this.finalConsonant = finalConsonant;
		this.isLoaded = false;
	}

	/**
   * TODO: xyz
   */
	setData(data) {
		this.data = this.filterData(data);

		let innerHTML = this.data.replace(/<g[^>]*>|<\/g>/i, "");
		let id = this.initialConsonant + "-" + this.vowel + "-" + this.finalConsonant;

		let glyph = document.createElementNS("http://www.w3.org/2000/svg", "g");
		glyph.setAttribute("id", id);
		glyph.innerHTML = innerHTML;
		glyph.children[0].style.fill = Config.color1;

		this.glyph = glyph;

		this.isLoaded = true;
	}

	filterData(data) {
		let replaceXml = /<\?[^>]*>/i;
		let replaceWeirdCharacters = /^[^<]*/i;
		let replaceSvg = /<svg[^>]*>/i;
		let replaceCloseSvg = /<\/svg>/i;

		return data
			.replace(replaceSvg, "")
			.replace(replaceCloseSvg, "")
			.replace(replaceXml, "")
			.replace(replaceWeirdCharacters, "");
	}

	place(offsetX, offsetY) {

		const interval = 700;

		// TODO these names suck -- not at all clear what's going on here
		let centeredX = this.initialConsonant - offsetX - 1;
		let syllabaryOffsetX = Math.floor(centeredX/Syllabary.dims.x);
		centeredX -= syllabaryOffsetX * Syllabary.dims.x;
		if (centeredX > Syllabary.dims.x / 2) {
			centeredX -= Syllabary.dims.x;
		}

		let placeX = centeredX * interval;

		let centeredY = this.vowel - offsetY - 1;
		let syllabaryOffsetY = Math.floor(centeredY/Syllabary.dims.y);
		centeredY -= syllabaryOffsetY * Syllabary.dims.y;
		if (centeredY > Syllabary.dims.y / 2) {
			centeredY -= Syllabary.dims.y;
		}
		let placeY = centeredY * interval;
		this.glyph.setAttribute("transform", `translate(${placeX}, ${placeY})`);
	}
}
