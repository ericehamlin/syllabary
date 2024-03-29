'use strict';

import Grid from 'Grid';
import LayerDisplay from 'LayerDisplay';
import { AXIS_DIMENSIONS } from './constants';
import { createElement } from './utils';

export default class GridDisplay {
	constructor() {
		this.display = createElement(
      "div",
      {class: "grid-display"}
    );

		this.centerFade = createElement(
      "div",
      {class: "center-fade"}
    );
		this.centerFade.style.zIndex = (AXIS_DIMENSIONS.z * 2 ) - 3;

		this.display.appendChild(this.centerFade);

		this.layers = [];
		for (let z=1; z <= AXIS_DIMENSIONS.z; z++) {

			const layer = new LayerDisplay(z);

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
	  const zPos = Math.abs(Grid.zPosition);
    const opacity = 1 - (zPos - Math.floor(zPos));
	  this.centerFade.style.opacity = opacity;
		for(let z in this.layers) {
			this.layers[z].render();
		}
	}
}
