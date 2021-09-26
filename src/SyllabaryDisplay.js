'use strict';

import Syllabary from 'Syllabary';
import GridDisplay from 'GridDisplay';
import PoemDisplay from 'PoemDisplay';
import Control from 'Control'
import Info from 'Info';

const SyllabaryDisplay = {
  display: null,
  gridDisplay: null,
  poemDisplay: null,
  control: null,
  info: null,

	init: function() {
		this.display = document.createElement("div");
		this.display.setAttribute("class", "syllabary-display");
		this.gridDisplay = new GridDisplay();

    Info.init();
    this.info = Info;

		this.control = new Control();

    PoemDisplay.init();
		this.poemDisplay = PoemDisplay;

    this.info.container.appendChild(this.control.svg);
		this.display.appendChild(this.info.container);

		this.insert(this.gridDisplay);

	},

	initGrid: function() {
		this.gridDisplay.initialize();
	},

	render: function() {
		this.gridDisplay.render();
		this.control.render();
	},

	insert: function(display) {
		this.display.appendChild(display.display);
	},

	add: function() {
		document.getElementById(Syllabary.containerId).appendChild(this.display);
	},

	remove: function() {
		this.display.parentNode.removeChild(this.display);
	},

  // Poem Functions

  showPoem: function() {
    return PoemDisplay.show();
  },

  hidePoem: function() {
    return PoemDisplay.hide();
  },

  setPoemText: function(text) {
    PoemDisplay.setText(text);
  },

  setPoemTitle: function(title) {
    PoemDisplay.setTitle(title);
  }
};

export default SyllabaryDisplay;
