'use strict';

import Syllabary from './Syllabary';
import Syllable from './Syllable.js';

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

        if (yPosition != null) {
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

        // create display layers and put glyphs in them
    }

//Movement is in percentages, translated to screen pixels if necessary.
    move(deltaX, deltaY, deltaZ) {
        this.xPosition += deltaX;
        this.yPosition += deltaY;
        this.zPosition += deltaZ;
    }

    render() {
            //cycle through all Syllables
            // syllable would be in view?
                // no
                    // hide
                //  yes
                    //position if necessary
                    //resize if necessary
                    // show
            //atmospherics, as needed -- in layers

            // actually we should be embedding glyphs in layers for display purposes. Then we can just position the layer
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
}