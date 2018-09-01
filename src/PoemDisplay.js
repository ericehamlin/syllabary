'use strict';

export default class PoemDisplay {

	constructor() {
		this.display = document.createElement("div");
		this.display.setAttribute("class", "poem-display");

		this.title = document.createElement("div");
		this.title.setAttribute("class", "poem-title");

		this.textContainer = document.createElement("div");
		this.textContainer.setAttribute("class", "poem-text-container");

		this.text = document.createElement("div");
		this.text.setAttribute("class", "poem-text");

		this.textContainer.appendChild(this.text);
		this.display.appendChild(this.title);
		this.display.appendChild(this.textContainer);

		this.container = document.createElement("div");
		this.container.setAttribute("class", "poem-container");

		this.container.appendChild(this.display);
	}

	setTitle(title) {
	  if(title && !/^\s*$/.exec(title)) {
	    this.container.classList.remove('titleless');
      this.title.innerHTML = title;
    }
    else {
      this.container.classList.add('titleless');
    }
	}

	setText(text) {
		this.text.innerHTML = text;
	}

	show() {
		let self = this;
		let container = document.getElementsByClassName('syllabary-display')[0];
		this.container.style.opacity = 0;
		container.appendChild(this.container);

    this.text.style.top = 0;

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
    const fadeIncrement = 0.02;
		window.removeEventListener("resize", self.resize);
		return new Promise((resolve, reject) => {
			function fadeOut() {
				self.container.style.opacity = parseFloat(self.container.style.opacity) - fadeIncrement;
				if (parseFloat(self.container.style.opacity) > fadeIncrement) {
					setTimeout(()=>{ fadeOut(); }, 10);
				}
				else {
          self.container.style.opacity = 0;
          if (self.container.parentNode) {
						self.container.parentNode.removeChild(self.container);
					}
					resolve(true);
				}
			}
			fadeOut();
		});
	}

	getTextHeight() {
		return parseInt(window.getComputedStyle(this.text).height);
	}

	getTextContainerHeight() {
		return parseInt(window.getComputedStyle(this.textContainer).height);
	}
}
