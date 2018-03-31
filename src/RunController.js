'use strict';

import Syllabary from "./Syllabary.js";
import NavQueue from "./NavQueue.js";
import * as Hammer from "hammerjs";

export default class RunController {

	
	constructor() {
		this.runStates = {
			"READ" : "read", 			// audio is currently playing
			"DRAG" : "drag",			// user is controlling using touch gesture
			"CONTROL" : "control",		// user is controlling using provided control
			"DRIFT" : "drift",			// user has released drag
			"ANIMATE" : "animate",		// standard animation is advancing or drift has come to an end
			"MAGNETIZE" : "magnetize",	// drifting has stopped and grid is moving toward closest syllable
			"PAUSE" : "pause"
		};

		this.animateInterval = 0.005;

		this.setRandomAnimateDirection();

		this.initializeEventListeners();

		this.setAnimating();

		/**
		 * unfortunately need to put this here to bind `this`
		 * if there's a better way, I'd like to know
		 */
		this.setPaused = () => {
			if (this.isPaused()) {
				console.debug("Resuming...");
				switch(this.pausedRunState){
					case this.runStates.ANIMATE:
						this.setAnimating();
						break;
					case this.runStates.CONTROL:
					case this.runStates.DRAG:
					case this.runStates.DRIFT:
						this.setDrifting();
						break;
					case this.runStates.MAGNETIZE:
						this.setMagnetizing();
					case this.runStates.READ:
						this.setReading();
						break;
				}
				this.pausedRunState = null;
				this.readingSyllable.resume();
			}
			else {
				console.debug("Starting Pause");
				this.pausedRunState = this.runState;
				this.runState = this.runStates.PAUSE;
				this.readingSyllable.pause();
			}
		}
	}

	initializeEventListeners() {

		let container = document.getElementById(Syllabary.containerId);

		this.touchListener = new window.Hammer(container);
		this.touchListener.get('pinch').set({ enable: true });
		this.touchListener.get('swipe').set({ enable: true });
		this.touchListener.on('pinchin', (ev) => {
			this.setDragging();
			let zAnimate = Math.sqrt(Math.pow(ev.deltaX, 2) + Math.pow(ev.deltaY, 2)) * this.animateInterval;
			Syllabary.grid.zPosition += zAnimate;
			this.setAnimateDirection(0,0,zAnimate);
			this.renderGrid();
		});

		this.touchListener.on('pinchout', (ev) => {
			this.setDragging();
			let zAnimate = -Math.sqrt(Math.pow(ev.deltaX, 2) + Math.pow(ev.deltaY, 2)) * this.animateInterval;
			Syllabary.grid.zPosition += zAnimate;
			this.setAnimateDirection(0,0,zAnimate);
			this.renderGrid();
		});

		this.touchListener.on('pinchend', (ev) => {
			this.setDrifting();
		});

		this.touchListener.on('pan', (ev) => {
			this.setDragging();
			let xAnimate = -ev.deltaX * this.animateInterval * 0.1;
			let yAnimate = -ev.deltaY * this.animateInterval * 0.1;
			Syllabary.grid.xPosition += xAnimate;
			Syllabary.grid.yPosition += yAnimate;
			this.setAnimateDirection(xAnimate, yAnimate, 0);
			this.renderGrid();
		});

		this.touchListener.on('panend', (ev) => {
			this.setDrifting();
		});

		this.controlMouseDown = (event) => {
			this.setControlling();
		};

		this.controlRotate = (event) => {
			Syllabary.grid[event.detail.dimension + "Position"] += event.detail.change;
			this.renderGrid();
		};

		this.controlMouseUp = (event) => {
			this.setMagnetizing();
		};


		Syllabary.syllabaryDisplay.control.addEventListener("mousedown", this.controlMouseDown);
		Syllabary.syllabaryDisplay.control.addEventListener("rotate", this.controlRotate);
		Syllabary.syllabaryDisplay.control.addEventListener("mouseup", this.controlMouseUp);

		this.addEventListeners();
	}

	addEventListeners() {
		this.addTouchEventListeners();
		this.addControlEventListeners();
	}

	removeEventListeners() {
		this.removeTouchEventListeners();
		this.removeControlEventListeners();
	}

	addControlEventListeners() {
		if (this.hasControlEventListeners) {
			return false;
		}
		console.debug("Adding Control Event Listeners");
		Syllabary.syllabaryDisplay.control.startEventListeners();
		this.hasControlEventListeners = true;
	}

	removeControlEventListeners() {
		console.debug("Removing Control Event Listeners");
		Syllabary.syllabaryDisplay.control.pauseEventListeners();
		this.hasControlEventListeners = false;
	}

	/**
	 *
	 */
	addTouchEventListeners() {
		if (this.hasTouchEventListeners) {
			return false;
		}
		console.debug("Adding Touch Event Listeners");
		this.touchListener.set({enable: true});
		this.hasTouchEventListeners = true;
	}

	removeTouchEventListeners() {
		console.debug("Removing Touch Event Listeners");
		this.touchListener.set({enable: false});
		this.hasTouchEventListeners = false;
	}

	/**
	 * Main Loop
	 */
	run() {
		switch(this.runState) {
			case this.runStates.PAUSE :
				break;

			case this.runStates.READ :
				this.scrollPoemText();
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

			case this.runStates.MAGNETIZE :
				this.magnetize();
				break;
		}

		requestAnimationFrame(() => {this.run(); });
	}

	/**
	 *
	 */
	animate() {
		let oldXPosition = Syllabary.grid.xPosition,
			oldYPosition = Syllabary.grid.yPosition,
			oldZPosition = Syllabary.grid.zPosition;

		this.advanceAnimation();
		this.renderGrid();

		if (
			!this.isMovingFromSyllablePosition(oldXPosition, oldYPosition, oldZPosition) &&
			this.animationHasCrossedSyllablePosition(oldXPosition, oldYPosition, oldZPosition)
		) {

			this.snapToNearestSyllable();

			console.debug("Ending Animate");
			this.setReading();
			this.read();
		}
	}

	/**
	 *
	 */
	advanceAnimation() {
		Syllabary.grid.xPosition += this.animateDirection.x;
		Syllabary.grid.yPosition += this.animateDirection.y;
		Syllabary.grid.zPosition += this.animateDirection.z;
	}

	/**
	 *
	 */
	snapToNearestSyllable() {
		Syllabary.grid.xPosition = Math.round(Syllabary.grid.xPosition);
		Syllabary.grid.yPosition = Math.round(Syllabary.grid.yPosition);
		Syllabary.grid.zPosition = Math.round(Syllabary.grid.zPosition);
		this.renderGrid();
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

		this.advanceAnimation();
		this.renderGrid();

		this.animateDirection.x = this.animateDirection.x * drag;
		this.animateDirection.y = this.animateDirection.y * drag;
		this.animateDirection.z = this.animateDirection.z * drag;

		if (this.getAnimateVelocity() < 0.01) {

			let xComponent = this.getAnimateComponent(Syllabary.grid.xPosition);
			let yComponent = this.getAnimateComponent(Syllabary.grid.yPosition);
			let zComponent = this.getAnimateComponent(Syllabary.grid.zPosition);
			this.setAnimateDirection(xComponent, yComponent, zComponent);

			console.debug("Ending Drift");
			this.setMagnetizing();
		}
	}

	getAnimateComponent(position) {
		let component = (Math.round(position) - position) * 0.01;
		if (isNaN(component)) {
			component = 0;
		}
		return component;
	}

	/**
	 * TODO: this needs to be better
	 */
	magnetize() {
		let oldXPosition = Syllabary.grid.xPosition,
			oldYPosition = Syllabary.grid.yPosition,
			oldZPosition = Syllabary.grid.zPosition;

		this.advanceAnimation();
		this.renderGrid();

		if (this.getAnimateVelocity() < this.animateInterval) {
			let acceleration = 1.01;
			this.setAnimateDirection(
				this.animateDirection.x * acceleration,
				this.animateDirection.y * acceleration,
				this.animateDirection.z * acceleration
			);
		}

		if (
			!this.isMovingFromSyllablePosition(oldXPosition, oldYPosition, oldZPosition) &&
			this.animationHasCrossedSyllablePosition(oldXPosition, oldYPosition, oldZPosition)
		) {
			this.snapToNearestSyllable();
			console.debug("Ending Magnetize");
			this.setReading();
			this.read();
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
		let self = this;
		this.readingSyllable = this.getCurrentSyllable();
		let promise = this.readingSyllable.play();
		promise.then(() => {
			this.readingSyllable = null;
			Syllabary.syllabaryDisplay.poemDisplay.hide().then(() => {
				self.setRandomAnimateDirection();
				self.setAnimating();
			});

		});

	}

	/**
	 *
	 * @returns {Syllable}
	 */
	getCurrentSyllable() {
		let x = Syllabary.getX();
		let y = Syllabary.getY();
		let z = Syllabary.getZ();

		let syllable = Syllabary.grid.syllables[x][y][z];
		return syllable;
	}

	/**
	 *
	 * @param x
	 * @param y
	 * @param z
	 */
	setAnimateDirection(x,y,z) {
		this.animateDirection = {x:x, y:y, z:z};
	}

	/**
	 * randomly assign new direction
	 */
	setRandomAnimateDirection() {
		let xInterval,
			yInterval,
			zInterval;

		let allowedDirection = false;

		while(!allowedDirection) {
			let direction = Math.floor(Math.random() * 6); // this calculation is incorrect. it will not be evenly distributed

			xInterval = 0;
			yInterval = 0;
			zInterval = 0;

			let xDiff = 0,
				yDiff = 0,
				zDiff = 0;

			switch (direction) {
				case 0:
					xDiff = 1;
					xInterval = this.animateInterval;
					break;
				case 1:
					xDiff = -1;
					xInterval = -this.animateInterval;
					break;
				case 2:
					yDiff = 1;
					yInterval = this.animateInterval;
					break;
				case 3:
					yDiff = -1;
					yInterval = -this.animateInterval;
					break;
				case 4:
					zDiff = 1;
					zInterval = this.animateInterval;
					break;
				case 5:
				default:
					zDiff = -1;
					zInterval = -this.animateInterval;
					break;
			}

			let targetX = Syllabary.getX({diff: xDiff}),
				targetY = Syllabary.getY({diff: yDiff}),
				targetZ = Syllabary.getZ({diff: zDiff});

			if (NavQueue.includes(targetX, targetY, targetZ)) {
				console.log("Cannot return to " + targetX + "-" + targetY + "-" + targetZ);
			} else {
				allowedDirection = true;
			}

		}
		this.setAnimateDirection(xInterval, yInterval, zInterval);
	}

	/**
	 *
	 */
	renderGrid() {
		Syllabary.syllabaryDisplay.render();
	}

  /**
   * WebAudioAPISound.js:145 Uncaught TypeError: Cannot read property 'duration' of undefined
   at WebAudioAPISound.getDuration (WebAudioAPISound.js:145)
   at RunController.scrollPoemText (RunController.js:468)
   at RunController.run (RunController.js:177)
   at RunController.js:199
   * @returns {boolean}
   */
	scrollPoemText() {
		const syllable = this.getCurrentSyllable();
    if (!syllable.audio.data || !syllable.poem.isLoaded || !syllable.poem.text) {
      return false;
    }

    const textHeight = Syllabary.syllabaryDisplay.poemDisplay.getTextHeight(),
      textContainerHeight = Syllabary.syllabaryDisplay.poemDisplay.getTextContainerHeight(),
      // audioDuration = syllable.audio.data.getDuration(),
      audioElapsed = syllable.audio.data.getElapsedTime();

    const topOffset = 0.5 * textContainerHeight,
      bottomOffset = 0.1 * textContainerHeight;

    // let textToAudioRatio = textHeight / audioDuration;

    let percentNeedToScroll = syllable.audio.data.getPercentCompleted();
    let totalScroll = textHeight - textContainerHeight;

    if (totalScroll <= 0) {
      return false;
    }

    let scroll = (totalScroll * percentNeedToScroll) / 100;
    Syllabary.syllabaryDisplay.poemDisplay.text.style.top = -scroll;
    // if (audioElapsed * textToAudioRatio > topOffset) {
    //   console.log("scrolling");
    // }

    // console.log(audioDuration, audioPercentCompleted, textHeight, textContainerHeight);

	}

	/**
	 *
	 * @returns {boolean}
	 */
	isReading() {
		return this.runState === this.runStates.READ;
	}

	/**
	 *
	 */
	setReading() {
		console.debug("Starting Read");
		this.removeEventListeners();
		NavQueue.add(Syllabary.getX(), Syllabary.getY(), Syllabary.getZ());
		this.runState = this.runStates.READ;
	}

	/**
	 *
	 * @returns {boolean}
	 */
	isDragging() {
		return this.runState === this.runStates.DRAG;
	}

	/**
	 *
	 */
	setDragging() {
		console.debug("Starting Drag");
		this.removeControlEventListeners();
		this.runState = this.runStates.DRAG;
	}

	/**
	 *
	 * @returns {boolean}
	 */
	isDrifting() {
		return this.runState === this.runStates.DRIFT;
	}

	/**
	 *
	 */
	setDrifting() {
		console.debug("Starting Drift");
		this.addEventListeners();
		this.runState = this.runStates.DRIFT;
	}

	/**
	 *
	 * @returns {boolean}
	 */
	isAnimating() {
		return this.runState === this.runStates.ANIMATE;
	}

	/**
	 *
	 */
	setAnimating() {
		console.debug("Starting Animate");
		this.addEventListeners();
		this.runState = this.runStates.ANIMATE;
	}

	/**
	 *
	 * @returns {boolean}
	 */
	isMagnetizing() {
		return this.runState === this.runStates.MAGNETIZE;
	}

	/**
	 *
	 */
	setMagnetizing() {
		console.debug("Starting Magnetize");
		this.addEventListeners();
		this.runState = this.runStates.MAGNETIZE;
	}

	/**
	 *
	 * @returns {boolean}
	 */
	isControlling() {
		return this.runState === this.runStates.CONTROL;
	}

	setControlling() {
		console.debug("Starting Control");
		this.removeTouchEventListeners();
		this.runState = this.runStates.CONTROL;
	}

	/**
	 *
	 * @returns {boolean}
	 */
	isPaused() {
		return this.runState === this.runStates.PAUSE;
	}
}
