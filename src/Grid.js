'use strict';

import Syllabary from 'Syllabary';
import Syllable from 'Syllable';

export default class Grid {

    constructor(xPosition=null, yPosition=null, zPosition=null) {

        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
        }

        // is this actually 0- or 1- indexed?
        if (xPosition != null) {
            this.xPosition = xPosition;
        }
        else {
            this.xPosition = getRandomInt(0, Syllabary.xDim);
        }

        if (yPosition != null) {
            this.yPosition = yPosition;
        }
        else {
            this.yPosition = getRandomInt(0, Syllabary.yDim);
        }

        if (zPosition != null) {
            this.zPosition = zPosition;
        }
        else {
            this.zPosition = getRandomInt(0, Syllabary.zDim);
        }

        this.syllables = [];
        for(let x=1; x <= Syllabary.xDim; x++) {
            this.syllables[x] = [];

            for(let y=1; y <= Syllabary.yDim; y++) {
                this.syllables[x][y] = [];

                for(let z=1; z <= Syllabary.zDim; z++) {
                    this.syllables[x][y][z] = new Syllable(x,y,z);
                }
            }
        }
    }

    getTotalSyllables() {
        return Syllabary.xDim * Syllabary.yDim * Syllabary.zDim;
    }

    forEachSyllable(action) {
        for (let x=1; x <= Syllabary.xDim; x++) {
            for (let y=1; y <= Syllabary.yDim; y++) {
                for (let z=1; z <= Syllabary.zDim; z++) {
                    let syllable = this.syllables[x][y][z];
                    action(syllable);
                }
            }
        }
    }

    setX(x) {
        this.xPosition = x
    }

    addX(add) {
        this.xPosition += add;
    }

    setY(y) {
        this.yPosition = y;
    }

    addY(add) {
        this.yPosition += add;
    }

    setZ(z) {
        this.zPosition = z;
    }

    addZ(add) {
        this.zPosition += add;
    }

    setXYZ(x, y, z) {
        this.setX(x);
        this.setY(y);
        this.setZ(z);
    }

    addXYZ(x, y, z) {
        this.addX(x);
        this.addY(y);
        this.addZ(z);
    }

    snapToNearestSyllable() {
        this.setX(Math.round(this.xPosition));
        this.setY(Math.round(this.yPosition));
        this.setZ(Math.round(this.zPosition));
    }
}
