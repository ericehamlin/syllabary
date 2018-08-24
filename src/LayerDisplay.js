'use strict';

export default class LayerDisplay {

	constructor(z) {
	  this.numVisibleLayers = 4;

		this.display = document.createElement("div");
		this.display.setAttribute("class", "layer");

		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.svg.setAttribute("class", "layer-display");
		this.svg.setAttribute("id", "layer-display-"+z);
		this.svg.setAttribute("viewBox", "-2750, -2750, 6000, 6000");
		this.display.appendChild(this.svg);

		this.fadeLayer = document.createElement("div");
		this.fadeLayer.setAttribute("class", "fade-layer");
		this.fadeLayer.setAttribute("id", "fade-layer-" + (z-1));
		this.fadeLayer.style.zIndex = 2;
		this.display.appendChild(this.fadeLayer);

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
		const exactZPosition = this.getExactZPosition();

    // TODO what exactly is this?
    const calculated = (exactZPosition + this.numVisibleLayers + 1 - Syllabary.dims.z) * 300; // TODO: what is this number 300?

    // Displace layer on x-y axes
    const displacement = (calculated / -2) + "%";

    // Scale layer according to depth
    const scale = (100 + calculated) + "%";

    if (this.isDisplayed(exactZPosition)) {

			this.display.style.display = "block";

			// Position layer in stack
			this.display.style.zIndex = this.getZIndex();

			this.display.style.top = displacement;
			this.display.style.left = displacement;
			this.display.style.width = scale;
			this.display.style.height = scale;

      // TODO: this is the line that's affecting the Z-fade problem
			this.fadeLayer.style.opacity = Math.abs(exactZPosition + 1 - Syllabary.dims.z) / this.numVisibleLayers;

      // Fade closest layer out
			if (exactZPosition > (Syllabary.dims.z - 1)) {
				this.display.style.opacity = Math.pow(Syllabary.dims.z - exactZPosition, 2);
			}

			// Reposition glyphs on layer according to x, y position
			for (let x in Syllabary.grid.syllables) {
				for (let y in Syllabary.grid.syllables[x]) {
					let syllable = Syllabary.grid.syllables[x][y][this.z];
					syllable.glyph.place(Syllabary.grid.xPosition, Syllabary.grid.yPosition);
				}
			}
		}
    else {
      this.display.style.display = "none";
    }
	}

	isDisplayed(exactZPosition) {
    return exactZPosition > (Syllabary.dims.z - this.numVisibleLayers);
  }

	/**
	 * TODO check decimals
	 * @returns {*}
	 */
	getZIndex() {
		let zIndex;
		let zOffset = this.getZOffset();
		if (Syllabary.grid.zPosition >= 0) {
			zIndex = (Syllabary.dims.z - Math.floor(this.z - Syllabary.grid.zPosition) - zOffset);
		}
		else {
			zIndex = (Syllabary.dims.z - Math.ceil(this.z - Syllabary.grid.zPosition) - zOffset);
		}
		return zIndex * 2;
	}

	/**
	 * TODO NEED BETTER NAME
	 * for sizing
	 */
	getExactZPosition() {
		return this.getZOrder() - this.getZOffset();
	}

	/**
	 * TODO NEED BETTER NAME
	 * this is the number of zDims away the zPosition is
	 * the number of lengths(depths)
	 * the distance outside the box
	 * the offset from the real
   * Come on!
	 *
	 * TODO negative numbers now not working since I got rid of -1
   * This TODO might also have something to do with Z-fade problem
	 */
	getZOffset() {
    return ( Math.floor((this.getZOrder() /*- 1*/) / Syllabary.dims.z) * Syllabary.dims.z );
	}

  /**
   *
   * The (adjusted) placement of the layer in 3-space
   * If there were 10 layers this would range from -10 to 10 including floating-point numbers
   *
   * Except... not really. I've seen it go as high as 30.585171249546192
   * and I believe as low as -22.3433434343
   *
   */
	getZOrder() {
	  return Syllabary.dims.z - this.z + Syllabary.grid.zPosition;
  }
}
