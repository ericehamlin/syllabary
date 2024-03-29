'use strict';

import Config from 'Config';
import { AXIS_DIMENSIONS } from './constants';
import { createSvgElement } from './Utils';

export default class Glyph {

	constructor(initialConsonant, vowel, finalConsonant, x, y, z) {
	  this.x = x;
    this.y = y;
    this.z = z;
		this.initialConsonant = initialConsonant;
		this.vowel = vowel;
		this.finalConsonant = finalConsonant;
		this.isLoaded = false;
	}

	setData(data) {
		this.data = this.filterData(data);

		const innerHTML = this.data.replace(/<g[^>]*>|<\/g>/i, "");
		const id = this.initialConsonant + "-" + this.vowel + "-" + this.finalConsonant;

		const glyph = createSvgElement("g", {id: id});
		glyph.innerHTML = innerHTML;
		glyph.children[0].style.fill = Config.color1;

		this.glyph = glyph;

		this.isLoaded = true;
	}

	filterData(data) {
		const replaceXml = /<\?[^>]*>/i;
		const replaceWeirdCharacters = /^[^<]*/i;
		const replaceSvg = /<svg[^>]*>/i;
		const replaceCloseSvg = /<\/svg>/i;

		return data
			.replace(replaceSvg, "")
			.replace(replaceCloseSvg, "")
			.replace(replaceXml, "")
			.replace(replaceWeirdCharacters, "");
	}

	place(offsetX, offsetY) {

		const interval = 700;

		// TODO these names suck -- not at all clear what's going on here
		let centeredX = this.x - offsetX - 1;
		const syllabaryOffsetX = Math.floor(centeredX/AXIS_DIMENSIONS.x);
		centeredX -= syllabaryOffsetX * AXIS_DIMENSIONS.x;
		if (centeredX > AXIS_DIMENSIONS.x / 2) {
			centeredX -= AXIS_DIMENSIONS.x;
		}

		const placeX = centeredX * interval;

		let centeredY = this.y - offsetY - 1;
		const syllabaryOffsetY = Math.floor(centeredY/AXIS_DIMENSIONS.y);
		centeredY -= syllabaryOffsetY * AXIS_DIMENSIONS.y;
		if (centeredY > AXIS_DIMENSIONS.y / 2) {
			centeredY -= AXIS_DIMENSIONS.y;
		}
		const placeY = centeredY * interval;
		this.glyph.setAttribute("transform", `translate(${placeX}, ${placeY})`);
	}
}
