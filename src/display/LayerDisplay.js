'use strict';

export default class LayerDisplay {

	constructor(z) {
		this.display = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.display.setAttribute("class", "layer-display");
		this.display.setAttribute("id", "layer-display-"+z);
		this.display.setAttribute("viewBox", "-100, -100, 700, 700");
		// if (z>1) {
		// 	this.display.setAttribute("style", "visibility:hidden;");
		// }
		this.z = z;
	}

	initialize() {
		for (let x in Syllabary.grid.syllables) {
			for (let y in Syllabary.grid.syllables[x]) {
				let syllable = Syllabary.grid.syllables[x][y][this.z];
				this.display.appendChild(syllable.glyph.glyph);
			}
		}
	}

	render() {

		// Position layer in stack
		this.display.style.zIndex = this.getZIndex();

		// Scale layer according to depth
		let calculated = this.getExactZPosition();
		let displacement = calculated/-2 +"%";
		let scale = (100 + calculated) +"%";
		this.display.style.top = displacement;
		this.display.style.left = displacement;
		this.display.style.width = scale;
		this.display.style.height = scale;

		// Reposition glyphs on layer according to x, y position
		for (let x in Syllabary.grid.syllables) {
			for (let y in Syllabary.grid.syllables[x]) {
				let syllable = Syllabary.grid.syllables[x][y][this.z];
				syllable.glyph.place(Syllabary.grid.xPosition, Syllabary.grid.yPosition);
			}
		}
	}

	/**
	 * TODO check decimals
	 * @returns {*}
	 */
	getZIndex() {
		let zIndex;
		let zOffset = this.getZOffset();
		if (Syllabary.grid.zPosition >= 0) {
			zIndex = (Syllabary.zDim - Math.floor(this.z + Syllabary.grid.zPosition) + zOffset) * 2;
		}
		else {
			zIndex = (Syllabary.zDim - Math.ceil(this.z + Syllabary.grid.zPosition) + zOffset) * 2;
		}
		return zIndex;
	}

	/**
	 * TODO NEED BETTER NAME
	 * for sizing
	 */
	getExactZPosition() {
		let zOffset = this.getZOffset();
		let zPosition = Syllabary.zDim - (this.z + Syllabary.grid.zPosition) + zOffset;
		return Math.pow(zPosition/2, 2);
	}

	/**
	 * TODO NEED BETTER NAME
	 * this is the number of zDims away the zPosition is
	 * the number of lengths(depths)
	 * the distance outside the box
	 * the offset from the real
	 */
	getZOffset() {
		return Math.floor((this.z + Syllabary.grid.zPosition - 1) / Syllabary.zDim) * Syllabary.zDim;
	}
}
