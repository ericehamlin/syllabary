'use strict';

import Syllabary from 'Syllabary';

let LoadingDisplay = {

	create: () => {
    LoadingDisplay.display = document.createElement("div");
    LoadingDisplay.display.setAttribute("class", "loading-display");
	},

	render: (percentComplete) => {
    LoadingDisplay.display.innerHTML = Math.round(percentComplete) + "% complete";
	},

	addButton: () => {
		let button = document.createElement("button");
		button.innerHTML = "Play";
    LoadingDisplay.display.appendChild(button);
		return button;
	},

	add: () => {
		document.getElementById(Syllabary.containerId).appendChild(LoadingDisplay.display);
	},

	remove: () => {
    LoadingDisplay.display.parentNode.removeChild(LoadingDisplay.display);
	}
};

export default LoadingDisplay;
