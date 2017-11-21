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

		this.container = document.createElement("div");
		this.container.setAttribute("class", "poem-container");

		this.container.appendChild(this.display);
	}

	setTitle(title) {
		this.title.innerHTML = title;
	}

	setText(text) {
		console.log(this);
		this.text.innerHTML = text;
	}

	show() {
		let self = this;
		let container = document.getElementsByClassName('syllabary-display')[0];
		this.container.style.opacity = 0;
		container.appendChild(this.container);
		window.addEventListener("resize", self.resize);
		return new Promise((resolve, reject) => {
			function fadeIn() {
				self.container.style.opacity = parseFloat(self.container.style.opacity) + 0.02;
				if (parseFloat(self.container.style.opacity) < 0.8) {
					setTimeout(()=>{ fadeIn(); }, 10);
				}
				else {
					resolve(true);
				}
			}
			fadeIn();
		});
	}

	hide() {
		let self = this;
		window.removeEventListener("resize", self.resize);
		return new Promise((resolve, reject) => {
			function fadeOut() {
				self.container.style.opacity = parseFloat(self.container.style.opacity) - 0.02;
				if (parseFloat(self.container.style.opacity) > 0) {
					setTimeout(()=>{ fadeOut(); }, 10);

				}
				else {
					if (self.container.parentNode) {
						self.container.parentNode.removeChild(self.container);
					}
					resolve(true);
				}
			}
			fadeOut();
		});
	}

	resize() {
		console.log("Resizing Poem");
	}
}
