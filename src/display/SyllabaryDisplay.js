'use strict';

import Syllabary from '../Syllabary';
import GridDisplay from './GridDisplay.js';
import PoemDisplay from './PoemDisplay.js';
import ControllerDisplay from './ControllerDisplay.js';

export default class SyllabaryDisplay {

	constructor() {
		this.display = document.createElement("div");
		this.display.setAttribute("class", "syllabary-display");
		this.gridDisplay = new GridDisplay();

		this.poemDisplay = new PoemDisplay();

		this.insert(this.gridDisplay);

	}

	initialize() {
		this.gridDisplay.initialize();
	}

	render() {
		this.gridDisplay.render();
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
