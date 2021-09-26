'use strict';
import Syllabary from "./Syllabary";
import {
  AXIS_DIMENSIONS,
  NUM_VISIBLE_LAYERS
} from "./constants";
import {
  createElementWithAttributes,
  createSvgWithAttributes
} from "./Utils";
import Grid from 'Grid';

export default class LayerDisplay {

	constructor(z) {

		this.display = createElementWithAttributes(
      "div",
      {class: "layer"}
    );

		this.svg = createSvgWithAttributes({
      class: "layer-display",
      id: `layer-display-${z}`,
      viewBox: "-2750, -2750, 6000, 6000"
    });
		this.display.appendChild(this.svg);

		this.fadeLayer = createElementWithAttributes(
      "div",
      {
        class: "fade-layer",
        id: `fade-layer-${z-1}`
      }
    );
		this.fadeLayer.style.zIndex = 2;
		this.display.appendChild(this.fadeLayer);

		this.z = z;
	}

	initialize() {
		for (let x in Grid.syllables) {
			for (let y in Grid.syllables[x]) {
				const syllable = Grid.getSyllable(x, y, this.z);
				this.svg.appendChild(syllable.glyph.glyph);
			}
		}
	}

	render() {
		const exactZPosition = this.getExactZPosition();

    // TODO what exactly is this?
    const calculated = (exactZPosition + NUM_VISIBLE_LAYERS + 1 - AXIS_DIMENSIONS.z) * 150; // TODO: what is this number 150?

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
			let opacity = Math.abs(exactZPosition + 1 - AXIS_DIMENSIONS.z) / NUM_VISIBLE_LAYERS;

      this.fadeLayer.style.opacity = opacity;

      // Fade closest layer out
			if (exactZPosition > (AXIS_DIMENSIONS.z - 1)) {
				this.display.style.opacity = Math.pow(AXIS_DIMENSIONS.z - exactZPosition, 2);
			}

			// Reposition glyphs on layer according to x, y position
			for (let x in Grid.syllables) {
				for (let y in Grid.syllables[x]) {
					const syllable = Grid.getSyllable(x, y, this.z);
					syllable.glyph.place(Grid.xPosition, Grid.yPosition);
				}
			}
		}
    else {
      this.display.style.display = "none";
    }
	}

	isDisplayed(exactZPosition) {
    return exactZPosition >= (AXIS_DIMENSIONS.z - NUM_VISIBLE_LAYERS);
  }

	/**
	 * TODO check decimals
	 * @returns {*}
	 */
	getZIndex() {
		let zIndex;
		const zOffset = this.getZOffset();
		if (Grid.zPosition >= 0) {
			zIndex = (AXIS_DIMENSIONS.z - Math.floor(this.z - Grid.zPosition) - zOffset);
		}
		else {
			zIndex = (AXIS_DIMENSIONS.z - Math.ceil(this.z - Grid.zPosition) - zOffset);
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
    return ( Math.floor((this.getZOrder() /*- 1*/) / AXIS_DIMENSIONS.z) * AXIS_DIMENSIONS.z );
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
	  return AXIS_DIMENSIONS.z - this.z + Grid.zPosition;
  }
}
