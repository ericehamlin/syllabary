'use strict';

import Syllabary from "./Syllabary.js";

export default class RunController {

	constructor(syllabary) {
		this.runStates = {
			"READ" : "read", 		// audio is currently playing
			"DRAG" : "drag",		// user is controlling using touch gesture
			"CONTROL" : "control",	// user is controlling using provided control
			"DRIFT" : "drift",		// user has released drag
			"ANIMATE" : "animate"	// standard animation is advancing or drift has come to an end
		};

		this.syllabary = syllabary;

		this.runState = this.runStates.ANIMATE;

		this.animateInterval = 0.05;
		this.setNewAnimateDirection();
	}

	/**
	 *
	 */
	run() {
		switch(this.runState) {
			case this.runStates.READ :
				break;

			case this.runStates.DRAG :
				break;

			case this.runStates.CONTROL :
				break;

			case this.runStates.DRIFT :
				this.drift();
				break;

			case this.runStates.ANIMATE :
				this.animate();
				break;
		}

		setTimeout(() => {this.run(); }, 10);
	}

	/**
	 *
	 */
	animate() {
		let oldXPosition = Syllabary.grid.xPosition,
			oldYPosition = Syllabary.grid.yPosition,
			oldZPosition = Syllabary.grid.zPosition;

		Syllabary.grid.xPosition += this.animateDirection.x;
		Syllabary.grid.yPosition += this.animateDirection.y;
		Syllabary.grid.zPosition += this.animateDirection.z;
		this.renderGrid();

		if (
			!this.isMovingFromSyllablePosition(oldXPosition, oldYPosition, oldZPosition) &&
			this.animationHasCrossedSyllablePosition(oldXPosition, oldYPosition, oldZPosition)
		) {

			Syllabary.grid.xPosition = Math.round(Syllabary.grid.xPosition);
			Syllabary.grid.yPosition = Math.round(Syllabary.grid.yPosition);
			Syllabary.grid.zPosition = Math.round(Syllabary.grid.zPosition);

			this.renderGrid();

			console.info("ending animate");
			this.runState = this.runStates.READ;
			this.read();
		}
	}

	/**
	 *
	 * @param xPosition
	 * @param yPosition
	 * @param zPosition
	 * @returns {boolean}
	 */
	isMovingFromSyllablePosition(xPosition, yPosition, zPosition) {
		return (
			Math.floor(xPosition) == xPosition &&
			Math.floor(yPosition) == yPosition &&
			Math.floor(zPosition) == zPosition
		);
	}

	/**
	 *
	 * @param oldXPosition
	 * @param oldYPosition
	 * @param oldZPosition
	 * @returns {boolean}
	 */
	animationHasCrossedSyllablePosition(oldXPosition, oldYPosition, oldZPosition) {
		return (
			Math.floor(oldXPosition) != Math.floor(Syllabary.grid.xPosition) ||
			Math.floor(oldYPosition) != Math.floor(Syllabary.grid.yPosition) ||
			Math.floor(oldZPosition) != Math.floor(Syllabary.grid.zPosition)
		);
	}

	/**
	 * TODO combine drift and animate so that drift goes to a glyph
	 */
	drift() {
		let drag = 0.95;

		Syllabary.grid.xPosition += this.animateDirection.x;
		Syllabary.grid.yPosition += this.animateDirection.y;
		Syllabary.grid.zPosition += this.animateDirection.z;
		this.renderGrid();


		this.animateDirection.x = this.animateDirection.x * drag;
		this.animateDirection.y = this.animateDirection.y * drag;
		this.animateDirection.z = this.animateDirection.z * drag;

		if (this.getAnimateVelocity() < 0.01) {
			console.info("ending drift");
			this.runState = this.runStates.ANIMATE;
		}
	}

	/**
	 *
	 * @returns {number}
	 */
	getAnimateVelocity() {
		let xSqr = Math.pow(this.animateDirection.x, 2);
		let ySqr = Math.pow(this.animateDirection.y, 2);
		let zSqr = Math.pow(this.animateDirection.z, 2);
		return Math.sqrt(xSqr + ySqr + zSqr);
	}

	/**
	 *
	 */
	read() {
		// get current syllable
		let x = this.getCurrentLocation(Syllabary.grid.xPosition, Syllabary.xDim);
		let y = this.getCurrentLocation(Syllabary.grid.yPosition, Syllabary.yDim);
		let z = this.getCurrentLocation(Syllabary.grid.zPosition, Syllabary.zDim);

		console.info("READING %s-%s-%s", x, y, z);
		let syllable = Syllabary.grid.syllables[x][y][z];
		let promise = syllable.play();
		promise.then(() => {
			this.setNewAnimateDirection();
		this.runState = this.runStates.ANIMATE;
	});

	}

	/**
	 * randomly assign new direction
	 * TODO make sure we're not going backward
	 */
	setNewAnimateDirection() {
		let direction = Math.floor(Math.random() * 6); // this calculation is incorrect. it will not be evenly distributed
		let xInterval = 0,
			yInterval = 0,
			zInterval = 0;
		switch(direction) {
			case 0:
				xInterval = this.animateInterval;
				break;
			case 1:
				xInterval = -this.animateInterval;
				break;
			case 2:
				yInterval = this.animateInterval;
				break;
			case 3:
				yInterval = -this.animateInterval;
				break;
			case 4:
				zInterval = this.animateInterval;
				break;
			case 5:
			default:
				zInterval = -this.animateInterval;
				break;
		}
		this.animateDirection = {x:xInterval, y:yInterval, z:zInterval};
	}

	/**
	 *
	 */
	renderGrid() {
		this.syllabary.syllabaryDisplay.render();
	}

	/**
	 * TODO not a good name
	 *
	 * @param position
	 * @param dim
	 * @returns {number}
	 */
	getCurrentLocation(position, dim) {
		return position - (Math.floor(position/dim) * dim) + 1;
	}
}
