'use strict';

import Syllabary from '../Syllabary';
import LayerDisplay from './LayerDisplay.js';

export default class GridDisplay {
	constructor(grid) {
		this.display = document.createElement("div");
		this.display.setAttribute("class", "grid-display");

		this.grid = grid;

		this.layers = [];
		for (let z=1; z <= Syllabary.zDim; z++) {
			if (z>1) {
				let fadeLayer = document.createElement("div");
				fadeLayer.setAttribute("class", "fade-layer");
				fadeLayer.setAttribute("id", "fade-layer-" + (z-1));
				this.display.appendChild(fadeLayer);
			}
			let layer = new LayerDisplay(z, grid);

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
		// rearrange layers
	}
}
