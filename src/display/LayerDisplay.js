'use strict';

export default class LayerDisplay {

	constructor(z, grid) {
		this.display = document.createElement("div");
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
				this.display.innerHTML += syllable.glyph.data;
			}
		}
	}
}
