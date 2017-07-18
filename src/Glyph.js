'use strict';

export default class Glyph {

	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.isLoaded = false;
	}

	setData(data) {

		this.data = this.filterData(data);

		let transformReg = /transform="([^"]*)"/i;
		let transform = this.data.match(transformReg);
		let innerHTML = this.data.replace(/<g[^>]*>|<\/g>/i, "");
		let id = this.x + "-" + this.y + "-" + this.z;

		let glyph = document.createElementNS("http://www.w3.org/2000/svg", "g");
		glyph.setAttribute("transform", transform[1]);
		glyph.setAttribute("id", id);
		glyph.innerHTML = innerHTML;

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

}