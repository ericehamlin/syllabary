'use strict';

import Syllabary from './Syllabary';
import LayerDisplay from './LayerDisplay.js';

export default class GridDisplay {
	constructor() {
		this.display = document.createElement("div");
		this.display.setAttribute("class", "grid-display");

		this.centerFade = document.createElement("div");
		this.centerFade.setAttribute("class", "center-fade");
		this.centerFade.style.zIndex = (Syllabary.zDim * 2 ) - 3;

		this.display.appendChild(this.centerFade);

		this.layers = [];
		for (let z=1; z <= Syllabary.zDim; z++) {

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
		for(let z in this.layers) {
			this.layers[z].render();
		}
	}
}
