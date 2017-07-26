'use strict';

export default class LayerDisplay {

	constructor(z) {
		this.display = document.createElement("div");
		this.display.setAttribute("class", "layer");

		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.svg.setAttribute("class", "layer-display");
		this.svg.setAttribute("id", "layer-display-"+z);
		this.svg.setAttribute("viewBox", "-1250, -1250, 3000, 3000");
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

		let numVisibleLayers = 4;

		let exactZPosition = this.getExactZPosition();


		if (exactZPosition < Syllabary.zDim - numVisibleLayers) {
			this.display.style.display = "none";
		}
		else {
			this.display.style.display = "block";

			// Position layer in stack
			this.display.style.zIndex = this.getZIndex();

			// Scale layer according to depth
			let calculated = (exactZPosition + numVisibleLayers + 1 - Syllabary.zDim) * 150;

			let displacement = calculated / -2 + "%";
			let scale = (100 + calculated) + "%";
			this.display.style.top = displacement;
			this.display.style.left = displacement;
			this.display.style.width = scale;
			this.display.style.height = scale;


			this.fadeLayer.style.opacity = Math.abs(exactZPosition + 1 - Syllabary.zDim) / numVisibleLayers;

			if (exactZPosition > (Syllabary.zDim - 1)) {
				this.display.style.opacity = -exactZPosition + Syllabary.zDim;
			}

			// Reposition glyphs on layer according to x, y position
			for (let x in Syllabary.grid.syllables) {
				for (let y in Syllabary.grid.syllables[x]) {
					let syllable = Syllabary.grid.syllables[x][y][this.z];
					syllable.glyph.place(Syllabary.grid.xPosition, Syllabary.grid.yPosition);
				}
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
		return zIndex * 2;
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
	 *
	 * TODO negative numbers now not working since I got rid of -1
	 */
	getZOffset() {
		return Math.floor((this.z + Syllabary.grid.zPosition /*- 1*/) / Syllabary.zDim) * Syllabary.zDim;
	}
}
