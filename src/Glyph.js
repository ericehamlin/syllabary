'use strict';

import Syllabary from 'Syllabary';
import Config from 'Config';

export default class Glyph {

	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.isLoaded = false;
	}

	/**
   * TODO: xyz
   */
	setData(data) {
		this.data = this.filterData(data);

		let innerHTML = this.data.replace(/<g[^>]*>|<\/g>/i, "");
		let id = this.x + "-" + this.y + "-" + this.z;

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
		let centeredX = this.x - offsetX - 1;
		let syllabaryOffsetX = Math.floor(centeredX/Syllabary.xDim);
		centeredX -= syllabaryOffsetX * Syllabary.xDim;
		if (centeredX > Syllabary.xDim / 2) {
			centeredX -= Syllabary.xDim;
		}

		let placeX = centeredX * interval;

		let centeredY = this.y - offsetY - 1;
		let syllabaryOffsetY = Math.floor(centeredY/Syllabary.yDim);
		centeredY -= syllabaryOffsetY * Syllabary.yDim;
		if (centeredY > Syllabary.yDim / 2) {
			centeredY -= Syllabary.yDim;
		}
		let placeY = centeredY * interval;
		this.glyph.setAttribute("transform", `translate(${placeX}, ${placeY})`);
	}
}
