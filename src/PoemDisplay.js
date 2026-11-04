'use strict';

import { createDivWithAttributes } from "./Utils.js";

const PoemDisplay = {
  display: undefined,
  title: undefined,
  textContainer: undefined,
  text: undefined,
  container: undefined,
  // Changes each time the poem starts to fade in or out, so a fade that has been
  // superseded stops instead of fighting the new one over the opacity.
  fadeId: 0,

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

		this.onResize = () => this.layout();
	},

	// A long title wraps onto several lines. Start the reading area below it, so the
	// text never overlaps the title. Without a title the stylesheet decides.
	layout: function() {
		if (this.container.classList.contains('titleless')) {
			this.textContainer.style.top = '';
			return;
		}
		const gap = 20;
		this.textContainer.style.top = (this.title.offsetTop + this.title.offsetHeight + gap) + 'px';
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
		const fadeId = ++this.fadeId;
		const container = document.getElementsByClassName('syllabary-display')[0];
		this.container.style.opacity = 0;
		container.appendChild(this.container);
		this.layout();
		window.addEventListener("resize", this.onResize);

    this.text.style.top = 0;

		return new Promise((resolve, reject) => {
			function fadeIn() {
				if (fadeId !== self.fadeId) { resolve(false); return; }
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
		const fadeId = ++this.fadeId;
    const fadeIncrement = 0.02;
		window.removeEventListener("resize", self.onResize);
		return new Promise((resolve, reject) => {
			function fadeOut() {
				if (fadeId !== self.fadeId) { resolve(false); return; }
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
