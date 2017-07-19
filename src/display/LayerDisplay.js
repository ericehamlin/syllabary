'use strict';

export default class LayerDisplay {

	constructor(z, grid) {
		this.display = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.display.setAttribute("class", "layer-display");
		this.display.setAttribute("id", "layer-display-"+z);
		this.display.setAttribute("viewBox", "-100, -100, 700, 700");
		// if (z>1) {
		// 	this.display.setAttribute("style", "visibility:hidden;");
		// }
		this.grid = grid;
		this.z = z;
	}

	initialize() {
		for (let x in this.grid.syllables) {
			for (let y in this.grid.syllables[x]) {
				let syllable = this.grid.syllables[x][y][this.z];
				this.display.appendChild(syllable.glyph.glyph);
			}
		}
	}

	render() {
		let zDisplay = (Syllabary.zDim - this.z) * 2;
		this.display.style.zIndex = zDisplay;

		for (let x in this.grid.syllables) {
			for (let y in this.grid.syllables[x]) {
				let syllable = this.grid.syllables[x][y][this.z];
				syllable.glyph.place(this.grid.xPosition, this.grid.yPosition);
			}
		}
	}
}
