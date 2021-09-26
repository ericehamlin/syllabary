'use strict';

import { createDivWithAttributes } from "./Utils";

const PoemDisplay = {
  display: undefined,
  title: undefined,
  textContainer: undefined,
  text: undefined,
  container: undefined,

	init: function() {
		this.display = createDivWithAttributes({class: "poem-display"});

		this.title = createDivWithAttributes({class: "poem-title"});

		this.textContainer = createDivWithAttributes({class: "poem-text-container"});

		this.text = createDivWithAttributes({class: "poem-text"});

		this.textContainer.appendChild(this.text);
		this.display.appendChild(this.title);
		this.display.appendChild(this.textContainer);

		this.container = createDivWithAttributes({class: "poem-container"});

		this.container.appendChild(this.display);
	},

	setTitle: function(title) {
	  if(title && !/^\s*$/.exec(title)) {
	    this.container.classList.remove('titleless');
      this.title.innerHTML = title;
    }
    else {
      this.container.classList.add('titleless');
    }
	},

	setText: function (text) {
		this.text.innerHTML = text;
	},

	show: function() {
		const self = this;
		const container = document.getElementsByClassName('syllabary-display')[0];
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
	},

	hide: function() {
		const self = this;
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
	},

	getTextHeight: function() {
		return parseInt(window.getComputedStyle(this.text).height);
	},

	getTextContainerHeight: function() {
		return parseInt(window.getComputedStyle(this.textContainer).height);
	}
}

export default PoemDisplay;
