'use strict';

import Syllable from 'Syllable';
import { randomInt } from 'utils';
import { getSyllableValuesForXYZ } from 'syllabary-utils';
import { AXIS_DIMENSIONS } from './constants';

const Grid = {
  syllables: [],
  xPosition: undefined,
  yPosition: undefined,
  zPosition: undefined,

  init: function(xPosition = null, yPosition = null, zPosition = null) {
    // is this actually 0- or 1- indexed?
    if (xPosition != null) {
      this.xPosition = xPosition;
    }
    else {
      this.xPosition = randomInt(0, AXIS_DIMENSIONS.x);
    }

    if (yPosition != null) {
      this.yPosition = yPosition;
    }
    else {
      this.yPosition = randomInt(0, AXIS_DIMENSIONS.y);
    }

    if (zPosition != null) {
      this.zPosition = zPosition;
    }
    else {
      this.zPosition = randomInt(0, AXIS_DIMENSIONS.z);
    }

    for (let x = 1; x <= AXIS_DIMENSIONS.x; x++) {
      this.syllables[x] = [];

      for (let y = 1; y <= AXIS_DIMENSIONS.y; y++) {
        this.syllables[x][y] = [];

        for (let z = 1; z <= AXIS_DIMENSIONS.z; z++) {
          let { initialConsonant, vowel, finalConsonant } = getSyllableValuesForXYZ({ x: x, y: y, z: z });
          this.syllables[x][y][z] = new Syllable(initialConsonant, vowel, finalConsonant, x, y, z);
        }
      }
    }
  },

  getSyllable: function(x,y,z) {
    return this.syllables[x][y][z];
  },

  setX: function(x) {
    this.xPosition = x;
  },

  addX: function(add) {
    this.xPosition += add;
  },

  setY: function(y) {
    this.yPosition = y;
  },

  addY: function(add) {
    this.yPosition += add;
  },

  setZ: function(z) {
    this.zPosition = z;
  },

  addZ: function(add) {
    this.zPosition += add;
  },

  setXYZ: function(x, y, z) {
    this.setX(x);
    this.setY(y);
    this.setZ(z);
  },

  addXYZ: function(x, y, z) {
    this.addX(x);
    this.addY(y);
    this.addZ(z);
  },

  snapToNearestSyllable: function() {
    this.setX(Math.round(this.xPosition));
    this.setY(Math.round(this.yPosition));
    this.setZ(Math.round(this.zPosition));
  }
};

export default Grid;
