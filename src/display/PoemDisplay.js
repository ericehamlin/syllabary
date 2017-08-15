'use strict';

export default class PoemDisplay {

	constructor() {
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

	setTitle(title) {
		this.title.innerHTML = title;
	}

	setText(text) {
		console.log(this);
		this.text.innerHTML = text;
	}

	show() {
		let container = document.getElementsByClassName('syllabary-display')[0];
		container.appendChild(this.display);
	}

	hide() {
		this.display.parentNode.removeChild(this.display);
	}
}
