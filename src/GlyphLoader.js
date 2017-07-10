'use strict';

import Config from './Config.js';
import FileLoader from './FileLoader.js';

export default class GlyphLoader {

	static load(xDim, yDim, zDim) {
		this.glyphs = [];
		for (let x=1; x<=xDim; x++) {
			this.glyphs[x] = [];
			for (let y=1; y<=yDim; y++) {
				this.glyphs[x][y] = [];
				for (let z=1; z<=zDim; z++) {
					let url = Config.baseUrl + "glyphs/" + x + "-" + y + "-" + z + ".svg";
					let promise = FileLoader.load(url);
					promise.then(function(data){
						console.log("DATA", data);
					})
				}
			}
		}
	}
}
