'use strict';

export default class LayerDisplay {

	constructor(z) {
		this.display = document.createElement("div");
		this.display.setAttribute("class", "layer");

		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.svg.setAttribute("class", "layer-display");
		this.svg.setAttribute("id", "layer-display-"+z);
		this.svg.setAttribute("viewBox", "-100, -100, 700, 700");
		this.display.appendChild(this.svg);

		this.fadeLayer = document.createElement("div");
		this.fadeLayer.setAttribute("class", "fade-layer");
		this.fadeLayer.setAttribute("id", "fade-layer-" + (z-1));
		this.fadeLayer.style.zIndex = 2;
		this.display.appendChild(this.fadeLayer);

		// if (z>1) {
		// 	this.display.setAttribute("style", "visibility:hidden;");
		// }
		this.z = z;
	}

	initialize() {
		for (let x in Syllabary.grid.syllables) {
			for (let y in Syllabary.grid.syllables[x]) {
				let syllable = Syllabary.grid.syllables[x][y][this.z];
				this.svg.appendChild(syllable.glyph.glyph);
			}
		}
	}

	render() {

		// Position layer in stack
		this.display.style.zIndex = this.getZIndex();

		// Scale layer according to depth
		let exactZPosition = this.getExactZPosition();
		let calculated = Math.pow(exactZPosition/2, 2);
		let displacement = calculated/-2 +"%";
		let scale = (100 + calculated) +"%";
		this.display.style.top = displacement;
		this.display.style.left = displacement;
		this.display.style.width = scale;
		this.display.style.height = scale;

		console.log("EXACTZ", exactZPosition);

		let visibles = 5;

		this.fadeLayer.style.opacity = Math.abs(exactZPosition + 1 - Syllabary.zDim) / visibles;

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
			zIndex = (Syllabary.zDim - Math.floor(this.z + Syllabary.grid.zPosition) + zOffset);
		}
		else {
			zIndex = (Syllabary.zDim - Math.ceil(this.z + Syllabary.grid.zPosition) + zOffset);
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
		return zPosition;
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
