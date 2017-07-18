'use strict';

export default class LayerDisplay {

	constructor(z, grid) {
		this.display = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.display.setAttribute("class", "layer-display");
		this.display.setAttribute("id", "layer-display-"+z);
		this.grid = grid;
		this.z = z;
	}

	render() {
		// TODO Too slow, want to add Glyphs as they become available
		for (let x in this.grid.syllables) {
			for (let y in this.grid.syllables[x]) {
				let syllable = this.grid.syllables[x][y][this.z];
				this.display.appendChild(syllable.glyph.glyph);
			}
		}
	}
}
