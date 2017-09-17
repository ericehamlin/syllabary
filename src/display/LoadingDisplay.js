'use strict';

import Syllabary from '../Syllabary';

export default class LoadingDisplay {

	constructor() {
		this.display = document.createElement("div");
		this.display.setAttribute("class", "loading-display");
	}


	render(percentComplete) {
		this.display.innerHTML = Math.round(percentComplete) + "% complete";
	}

	addButton() {
		let button = document.createElement("button");
		button.innerHTML = "Play";
		this.display.appendChild(button);
		return button;
	}

	add() {
		document.getElementById(Syllabary.containerId).appendChild(this.display);
	}

	remove() {
		this.display.parentNode.removeChild(this.display);
	}
}
