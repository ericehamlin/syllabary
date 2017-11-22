'use strict';

export default class Utils {
	static hexToRgb(hex) {
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});

		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	static blendHexColors(firstHexColor, secondHexColor, percent/* TODO not a good name*/) {
		let firstHexColorRgb = Utils.hexToRgb(firstHexColor);
		let secondHexColorRgb = Utils.hexToRgb(secondHexColor);

		let rDiff = Math.round((firstHexColorRgb.r - secondHexColorRgb.r) * percent);
		let gDiff = Math.round((firstHexColorRgb.g - secondHexColorRgb.g) * percent);
		let bDiff = Math.round((firstHexColorRgb.b - secondHexColorRgb.b) * percent);

		return `rgb(${firstHexColorRgb.r - rDiff}, ${firstHexColorRgb.g - gDiff}, ${firstHexColorRgb.b - bDiff})`;
	}
}