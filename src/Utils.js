'use strict';

export default class Utils {

	static convertVmaxToPx(vmax) {
    const maxDim = document.documentElement.clientWidth > document.documentElement.clientHeight ?
      document.documentElement.clientWidth :
      document.documentElement.clientHeight;
    const px = vmax/maxDim;
	  return px;
  }

  static convertPercentToPx(percent) {
    const height = window.innerHeight;
    const px = (percent * height)/100;
    return px;
  }
}

export function hexToRgb(hex) {
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

export function blendHexColors(firstHexColor, secondHexColor, percent/* TODO not a good name*/) {
  const firstHexColorRgb = hexToRgb(firstHexColor);
  const secondHexColorRgb = hexToRgb(secondHexColor);

  const rDiff = Math.round((firstHexColorRgb.r - secondHexColorRgb.r) * percent);
  const gDiff = Math.round((firstHexColorRgb.g - secondHexColorRgb.g) * percent);
  const bDiff = Math.round((firstHexColorRgb.b - secondHexColorRgb.b) * percent);

  return `rgb(${firstHexColorRgb.r - rDiff}, ${firstHexColorRgb.g - gDiff}, ${firstHexColorRgb.b - bDiff})`;
}

export function radiansToDegrees(radians) {
  return radians * (180 / Math.PI);
}
