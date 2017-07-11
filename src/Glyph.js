'use strict';

export default class Glyph {

	constructor(x, y, z) {
		this.isLoaded = false;
	}

	setData(data) {
		this.data = data;
		this.isLoaded = true;
	}
}
