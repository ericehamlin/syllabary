'use strict';

import Syllabary from './Syllabary';
import GridDisplay from './GridDisplay.js';
import PoemDisplay from './PoemDisplay.js';
import Control from './Control.js'
import Info from './Info.js';

export default class SyllabaryDisplay {

	constructor() {
		this.display = document.createElement("div");
		this.display.setAttribute("class", "syllabary-display");
		this.gridDisplay = new GridDisplay();

    this.info = new Info();
		this.control = new Control();
		this.poemDisplay = new PoemDisplay();

    this.info.container.appendChild(this.control.svg);
		this.display.appendChild(this.info.container);

		this.insert(this.gridDisplay);

	}

	initialize() {
		this.gridDisplay.initialize();
	}

	render() {
		this.gridDisplay.render();
		this.control.render();
	}

	insert(display) {
		this.display.appendChild(display.display);
	}

	add() {
		document.getElementById(Syllabary.containerId).appendChild(this.display);
	}

	remove() {
		this.display.parentNode.removeChild(this.display);
	}
}
