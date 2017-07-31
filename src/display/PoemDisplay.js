'use strict';

export default class PoemDisplay {

	construct() {
		this.display = document.createElement("div");
		this.display.setAttribute("class", "poem-display");

		this.title = document.createElement("div");
		this.title.setAttribute("class", "poem-title");

		this.text = document.createElement("div");
		this.text.setAttribute("class", "poem-text");

		this.display.appendChild(this.title);
		this.display.appendChild(this.text);
		this.display.style.zIndex = (Syllabary.zDim * 2) + 1;

	}

	show() {
		let container = document.getElementById(Syllabary.containerId);
		container.appendChild(this.display);
	}

	hide() {
		this.display.parentNode.removeChild(this.display);
	}
}
