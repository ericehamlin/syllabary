'use strict';

import Syllabary from '../Syllabary';
import LayerDisplay from './LayerDisplay.js';

export default class GridDisplay {
	constructor(grid) {
		this.display = document.createElement("div");
		this.display.setAttribute("class", "grid-display");

		this.grid = grid;

		this.layers = [];
		this.fadeLayers = [];
		for (let z=1; z <= Syllabary.zDim; z++) {
			if (z>1) {
				let fadeLayer = document.createElement("div");
				fadeLayer.setAttribute("class", "fade-layer");
				fadeLayer.setAttribute("id", "fade-layer-" + (z-1));
				fadeLayer.style.zIndex = (((Syllabary.zDim - z) * 2) + 1 );
				this.display.appendChild(fadeLayer);
				this.fadeLayers[z-1] = fadeLayer;
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
		let zOpacity; // from 0.25 to 0.5
		// TODO this might be backwards
		if (this.grid.zPosition >= 0) {
			zOpacity = 0.5 - (0.25 * (this.grid.zPosition % 1));
		}
		else {
			// TODO negative opacity still not working
			zOpacity = 0.25 - (0.25 * (this.grid.zPosition % 1));
		}

		for (let z in this.fadeLayers) {
			this.fadeLayers[z].style.opacity = zOpacity;
		}


		for(let z in this.layers) {
			this.layers[z].render();
		}
		// rearrange layers
	}
}
