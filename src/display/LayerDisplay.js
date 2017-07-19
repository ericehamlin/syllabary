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

		// NOT WORKING YET
		let calculated = exactZPosition * -20;
		this.display.style.top = calculated;
		//this.display.style.bottom = calculated;
		//this.display.style.left = calculated;
		//this.display.style.right = calculated;


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
		let zDims;
		if (this.grid.zPosition >= 0) {
			zDims = Math.floor((this.z + this.grid.zPosition - 1) / Syllabary.zDim) * Syllabary.zDim;
			zIndex = (Syllabary.zDim - Math.floor(this.z + this.grid.zPosition) + zDims) * 2;
		}
		else {
			zDims = Math.floor((this.z + this.grid.zPosition - 1) / Syllabary.zDim) * Syllabary.zDim;
			zIndex = (Syllabary.zDim - Math.ceil(this.z + this.grid.zPosition) + zDims) * 2;
		}
		return zIndex;
	}

	/**
	 * for sizing
	 */
	getExactZPosition() {
		let zPosition;
		let zDims;
		if (this.grid.zPosition >= 0) {
			zDims = Math.floor((this.z + this.grid.zPosition - 1) / Syllabary.zDim) * Syllabary.zDim;
			zPosition = Syllabary.zDim - this.z + this.grid.zPosition + zDims;
		}
		else {
			zDims = Math.floor((this.z + this.grid.zPosition - 1) / Syllabary.zDim) * Syllabary.zDim;
			zPosition = Syllabary.zDim - this.z + this.grid.zPosition + zDims;
		}
		console.log("ZPOSITION", zPosition, "Z", this.z);
		return zPosition;
	}
}
