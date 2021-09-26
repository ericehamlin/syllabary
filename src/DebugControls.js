'use strict';

import Syllabary from "./Syllabary.js";
import SyllabaryDisplay from 'SyllabaryDisplay';

export default class DebugControls {
	constructor() {
		console.info("Initializing Debug Controls");

		let debugControls = document.createElement("div");
		debugControls.setAttribute("id", "debug-controls");

		let pauseButton = document.createElement("a");
		pauseButton.textContent = "pause";
		pauseButton.onclick = Syllabary.runController.setPaused;

		debugControls.appendChild(pauseButton);

		SyllabaryDisplay.display.appendChild(debugControls);
	}
}
