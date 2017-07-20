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
		
		this.display.style.zIndex = this.getZIndex();

		let exactZPosition = this.getExactZPosition();
		let calculated = Math.pow(exactZPosition/2, 2);
		let offset = calculated/-2 +"%";
		let dim = (100 + calculated) +"%";
		this.display.style.top = offset;
		this.display.style.left = offset;
		this.display.style.width = dim;
		this.display.style.height = dim;


		for (let x in this.grid.syllables) {
			for (let y in this.grid.syllables[x]) {
				let syllable = this.grid.syllables[x][y][this.z];
				syllable.glyph.place(this.grid.xPosition, this.grid.yPosition);
			}
		}
	}

	/**
	 * TODO check decimals
	 * @returns {*}
	 */
	getZIndex() {
		let zIndex;
		let zDims = this.getZDims();
		if (this.grid.zPosition >= 0) {
			zIndex = (Syllabary.zDim - Math.floor(this.z + this.grid.zPosition) + zDims) * 2;
		}
		else {
			zIndex = (Syllabary.zDim - Math.ceil(this.z + this.grid.zPosition) + zDims) * 2;
		}
		return zIndex;
	}

	/**
	 * TODO NEED BETTER NAME
	 * for sizing
	 */
	getExactZPosition() {
		let zDims = this.getZDims();
		let zPosition = Syllabary.zDim - (this.z + this.grid.zPosition) + zDims;
		return zPosition;
	}

	/**
	 * TODO NEED BETTER NAME
	 */
	getZDims() {
		return Math.floor((this.z + this.grid.zPosition - 1) / Syllabary.zDim) * Syllabary.zDim;
	}
}
