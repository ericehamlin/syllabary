'use strict';

import Syllabary from 'Syllabary';
import LayerDisplay from 'LayerDisplay';

export default class GridDisplay {
	constructor() {
		this.display = document.createElement("div");
		this.display.setAttribute("class", "grid-display");

		this.centerFade = document.createElement("div");
		this.centerFade.setAttribute("class", "center-fade");
		this.centerFade.style.zIndex = (Syllabary.dims.z * 2 ) - 3;

		this.display.appendChild(this.centerFade);

		this.layers = [];
		for (let z=1; z <= Syllabary.dims.z; z++) {

			let layer = new LayerDisplay(z);

			this.display.appendChild(layer.display);

			this.layers[z] = layer;
		}

	}

	initialize() {
		for(let z in this.layers) {
			this.layers[z].initialize();
		}
	}

	render() {
	  let z = Math.abs(Syllabary.grid.zPosition);
    let opacity = 1 - (z - Math.floor(z));
	  this.centerFade.style.opacity = opacity;
		for(let z in this.layers) {
			this.layers[z].render();
		}
	}
}
