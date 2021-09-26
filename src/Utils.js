'use strict';

export function convertPercentToPx(percent) {
  const height = window.innerHeight;
  const px = (percent * height)/100;
  return px;
}

export function convertVmaxToPx(vmax) {
  const maxDim = document.documentElement.clientWidth > document.documentElement.clientHeight ?
    document.documentElement.clientWidth :
    document.documentElement.clientHeight;
  const px = vmax/maxDim;
  return px;
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

export function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

// Element Creation

export function createElementWithAttributes(tag, attributes) {
  const el = document.createElement(tag);
  for (const property in attributes) {
    el.setAttribute(property, attributes[property]);
  }
  return el;
}

export function createDivWithAttributes(attributes) {
  return createElementWithAttributes('div', attributes);
}

export function createElementNSWithAttributes(ns, tag, attributes) {
  const el = document.createElementNS(ns, tag);
  for (const property in attributes) {
    el.setAttribute(property, attributes[property]);
  }
  return el;
}

export function createSvgWithAttributes(attributes) {
  return createElementNSWithAttributes(
    "http://www.w3.org/2000/svg",
    "svg",
    attributes
  );
}

export function createSvgElementWithAttributes(tag, attributes) {
  return createElementNSWithAttributes(
    "http://www.w3.org/2000/svg",
    tag,
    attributes
  );
}
