'use strict';

import Config from "Config";
import NavQueue from "NavQueue";
import Logger from "Logger";
import * as Hammer from "hammerjs";
import SyllabaryDisplay from 'SyllabaryDisplay';
import Grid from 'Grid';

const RUN_STATES = {
  READ : "read", 			// audio is currently playing
  DRAG : "drag",			// user is controlling using touch gesture
  CONTROL : "control",		// user is controlling using provided control
  DRIFT : "drift",			// user has released drag
  ANIMATE : "animate",		// standard animation is advancing or drift has come to an end
  MAGNETIZE : "magnetize",	// drifting has stopped and grid is moving toward closest syllable
  PAUSE : "pause",
  RESUME: "resume"
};

export default class RunController {

	constructor() {

		this.animateInterval = Config.animateInterval;

		this.setRandomAnimateDirection();

		this.initializeEventListeners();

		this.setAnimating();

		/**
		 * unfortunately need to put this here to bind `this`
		 * if there's a better way, I'd like to know
		 */
		this.setPaused = () => {
      Logger.debug("Starting Pause");
      if (!this.pausedRunState) {
        this.pausedRunState = this.runState;
      }
      this.runState = RUN_STATES.PAUSE;
      this.removeEventListeners();
      if (this.readingSyllable) {
        this.readingSyllable.pause();
      }
		};

		this.setResumed = () => {
      Logger.debug("Resuming...");
      this.runState = RUN_STATES.RESUME;

      switch(this.pausedRunState){
        case RUN_STATES.ANIMATE:
          this.setAnimating();
          break;
        case RUN_STATES.CONTROL:
        case RUN_STATES.DRAG:
        case RUN_STATES.DRIFT:
          this.setDrifting();
          break;
        case RUN_STATES.MAGNETIZE:
          this.setMagnetizing();
        case RUN_STATES.READ:
          this.setReading();
          break;
      }
      this.pausedRunState = null;
      if (this.readingSyllable) {
        this.readingSyllable.resume();
      }
    };

    this.lastCycleTime = new Date();
    this.cycleDifferential = 1;
	}

  /**
   *
   */
	initializeEventListeners() {
    this.initializeGridTouchListeners();
    this.initializeInfoListeners();
    this.initializeControlListeners();
		this.addEventListeners();
	}

  /**
   *
   */
	initializeGridTouchListeners() {
    const gridContainer = document.getElementsByClassName('grid-display')[0];

    this.gridTouchListener = new window.Hammer(gridContainer);
    this.gridTouchListener.get('pinch').set({ enable: true });
    this.gridTouchListener.get('swipe').set({ enable: true });
    this.gridTouchListener.on('pinchin', (ev) => {
      this.setDragging();
      const zAnimate = Math.sqrt(Math.pow(ev.deltaX, 2) + Math.pow(ev.deltaY, 2)) * this.animateInterval;
      Grid.addZ(zAnimate);
      this.setAnimateDirection(0,0,zAnimate);
      this.renderGrid();
    });

    this.gridTouchListener.on('pinchout', (ev) => {
      this.setDragging();
      let zAnimate = -Math.sqrt(Math.pow(ev.deltaX, 2) + Math.pow(ev.deltaY, 2)) * this.animateInterval;
      Grid.addZ(zAnimate);
      this.setAnimateDirection(0, 0, zAnimate);
      this.renderGrid();
    });

    this.gridTouchListener.on('pinchend', (ev) => {
      this.setDrifting();
    });

    this.gridTouchListener.on('pan', (ev) => {
      this.setDragging();
      let xAnimate = -ev.deltaX * this.animateInterval * 0.1;
      let yAnimate = -ev.deltaY * this.animateInterval * 0.1;
      Grid.addX(xAnimate);
      Grid.addY(yAnimate);
      this.setAnimateDirection(xAnimate, yAnimate, 0);
      this.renderGrid();
    });

    this.gridTouchListener.on('panend', (ev) => {
      this.setDrifting();
    });
  }

  /**
   *
   */
  initializeInfoListeners() {
    const showInfo = (e) => {
      this.setPaused();
      //this.removeEventListeners();
    };

    const hideInfo = (e) => {
      this.setResumed();
      //this.addEventListeners();
    };

    SyllabaryDisplay.info.addEventListener("showinfo", showInfo);
    SyllabaryDisplay.info.addEventListener("hideinfo", hideInfo);
  }

  /**
   *
   */
  initializeControlListeners() {
    const controlStartRotate = (event) => {
      this.setControlling();
    };

    const controlRotate = (event) => {
      Grid[event.detail.dimension + "Position"] += event.detail.change;
      this.renderGrid();
    };

    const controlEndRotate = (event) => {
      this.setMagnetizing();
    };

    SyllabaryDisplay.control.addEventListener("startrotate", controlStartRotate);
    SyllabaryDisplay.control.addEventListener("rotate", controlRotate);
    SyllabaryDisplay.control.addEventListener("endrotate", controlEndRotate);
  }

  /**
   *
   */
	addEventListeners() {
		this.addTouchEventListeners();
		this.addControlEventListeners();
	}

  /**
   *
   */
	removeEventListeners() {
		this.removeTouchEventListeners();
		this.removeControlEventListeners();
	}

  /**
   *
   * @returns {boolean}
   */
	addControlEventListeners() {
		if (this.hasControlEventListeners) {
			return false;
		}
		Logger.debug("Adding Control Event Listeners");
		SyllabaryDisplay.control.startEventListeners();
		this.hasControlEventListeners = true;
	}

  /**
   *
   */
	removeControlEventListeners() {
		Logger.debug("Removing Control Event Listeners");
		SyllabaryDisplay.control.pauseEventListeners();
		this.hasControlEventListeners = false;
	}

  /**
   *
   * @returns {boolean}
   */
	addTouchEventListeners() {
		if (this.hasTouchEventListeners) {
			return false;
		}
		Logger.debug("Adding Touch Event Listeners");
		this.gridTouchListener.set({enable: true});
		this.hasTouchEventListeners = true;
	}

	removeTouchEventListeners() {
		Logger.debug("Removing Touch Event Listeners");
		this.gridTouchListener.set({enable: false});
		this.hasTouchEventListeners = false;
	}

	/**
	 * Main Loop
	 */
	run() {
		switch(this.runState) {
			case RUN_STATES.PAUSE :
				break;

			case RUN_STATES.READ :
				this.scrollPoemText();
				break;

			case RUN_STATES.DRAG :
				break;

			case RUN_STATES.CONTROL :
				break;

			case RUN_STATES.DRIFT :
				this.drift();
				break;

			case RUN_STATES.ANIMATE :
				this.animate();
				break;

			case RUN_STATES.MAGNETIZE :
				this.magnetize();
				break;
		}

		const cycleTime = new Date();
		this.cycleDifferential = cycleTime.getTime() - this.lastCycleTime.getTime();
    this.lastCycleTime = cycleTime;
		requestAnimationFrame(() => {this.run(); });
	}

	/**
	 *
	 */
	animate() {
		let oldXPosition = Grid.xPosition,
			oldYPosition = Grid.yPosition,
			oldZPosition = Grid.zPosition;

		this.advanceAnimation();
		this.renderGrid();

		if (
			!this.isMovingFromSyllablePosition(oldXPosition, oldYPosition, oldZPosition) &&
			this.animationHasCrossedSyllablePosition(oldXPosition, oldYPosition, oldZPosition)
		) {

			this.snapToNearestSyllable();

			Logger.debug("Ending Animate");
			this.setReading();
			this.read();
		}
	}

	/**
	 *
	 */
	advanceAnimation() {
		Grid.addX(this.getXanimateDirection());
		Grid.addY(this.getYanimateDirection());
		Grid.addZ(this.getZanimateDirection());
	}

	/**
	 *
	 */
	snapToNearestSyllable() {
	  Grid.snapToNearestSyllable();
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
			Math.floor(oldXPosition) != Math.floor(Grid.xPosition) ||
			Math.floor(oldYPosition) != Math.floor(Grid.yPosition) ||
			Math.floor(oldZPosition) != Math.floor(Grid.zPosition)
		);
	}

	/**
	 * TODO combine drift and animate so that drift goes to a glyph
	 */
	drift() {
		const drag = 0.95;

		this.advanceAnimation();
		this.renderGrid();

		this.animateDirection.x = this.animateDirection.x * drag;
		this.animateDirection.y = this.animateDirection.y * drag;
		this.animateDirection.z = this.animateDirection.z * drag;

		if (this.getAnimateVelocity() < 0.01) {
			let xComponent = this.getAnimateComponent(Grid.xPosition);
			let yComponent = this.getAnimateComponent(Grid.yPosition);
			let zComponent = this.getAnimateComponent(Grid.zPosition);
			this.setAnimateDirection(xComponent, yComponent, zComponent);

			Logger.debug("Ending Drift");
			this.setMagnetizing();
		}
	}

  /**
   *
   * @param position
   * @returns {number}
   */
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
		let oldXPosition = Grid.xPosition,
			oldYPosition = Grid.yPosition,
			oldZPosition = Grid.zPosition;


		this.advanceAnimation();
		this.renderGrid();

		if (this.getAnimateVelocity() < this.animateInterval) {
			const acceleration = 1.01;
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
			Logger.debug("Ending Magnetize");
			this.setReading();
			this.read();
		}
	}

	/**
	 *
	 * @returns {number}
	 */
	getAnimateVelocity() {
		const xSqr = this.animateDirection.x ** 2;
		const ySqr = this.animateDirection.y ** 2;
		const zSqr = this.animateDirection.z ** 2;
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
			SyllabaryDisplay.hidePoem().then(() => {
				self.setRandomAnimateDirection();
        if (self.isPaused()) {
          self.pausedRunState = self.runStates.ANIMATE;
        }
        else {
          self.setAnimating();
        }
			});

		});

	}

	/**
	 *
	 * @returns {Syllable}
	 */
	getCurrentSyllable() {
		const x = Grid.getCalculatedX();
		const y = Grid.getCalculatedY();
		const z = Grid.getCalculatedZ();

		const syllable = Grid.getSyllable(x,y,z);
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

			const targetX = Grid.getCalculatedX(xDiff);
			const targetY = Grid.getCalculatedY(yDiff);
			const targetZ = Grid.getCalculatedZ(zDiff);

			if (NavQueue.includes(targetX, targetY, targetZ)) {
				Logger.debug("Cannot return to " + targetX + "-" + targetY + "-" + targetZ);
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
		SyllabaryDisplay.render();
	}

  /**
   *
   * @returns {boolean}
   */
	scrollPoemText() {
		const syllable = this.getCurrentSyllable();
    if (!syllable.audio.data || !syllable.poem.isLoaded || !syllable.poem.text) {
      return false;
    }

    const textHeight = SyllabaryDisplay.poemDisplay.getTextHeight();
    const textContainerHeight = SyllabaryDisplay.poemDisplay.getTextContainerHeight();

    const percentNeedToScroll = syllable.audio.data.getPercentCompleted();
    const totalScroll = textHeight - textContainerHeight;
    if (totalScroll <= 0) {
      return false;
    }

    const scrollTo = (totalScroll * percentNeedToScroll) / 100;
    SyllabaryDisplay.poemDisplay.text.style.top = -scrollTo + "px";
	}

	getXanimateDirection() {
	  return (this.animateDirection.x * this.cycleDifferential) / 25;
  }

  getYanimateDirection() {
    return (this.animateDirection.y * this.cycleDifferential) / 25;
  }

  getZanimateDirection() {
    return (this.animateDirection.z * this.cycleDifferential) / 25;
  }

	/**
	 *
	 * @returns {boolean}
	 */
	isReading() {
		return this.runState === RUN_STATES.READ;
	}

	/**
	 *
	 */
	setReading() {
    if (this.isPaused()) { return false; }
		Logger.debug("Starting Read");
		this.removeEventListeners();
		NavQueue.add(Grid.getCalculatedX(), Grid.getCalculatedY(), Grid.getCalculatedZ());
		this.runState = RUN_STATES.READ;
	}

	/**
	 *
	 * @returns {boolean}
	 */
	isDragging() {
		return this.runState === RUN_STATES.DRAG;
	}

	/**
	 *
	 */
	setDragging() {
    if (this.isPaused()) { return false; }
		Logger.debug("Starting Drag");
		this.removeControlEventListeners();
    this.addTouchEventListeners();
		this.runState = RUN_STATES.DRAG;
	}

	/**
	 *
	 * @returns {boolean}
	 */
	isDrifting() {
		return this.runState === RUN_STATES.DRIFT;
	}

	/**
	 *
	 */
	setDrifting() {
    if (this.isPaused()) { return false; }
		Logger.debug("Starting Drift");
		this.addEventListeners();
		this.runState = RUN_STATES.DRIFT;
	}

	/**
	 *
	 * @returns {boolean}
	 */
	isAnimating() {
		return this.runState === RUN_STATES.ANIMATE;
	}

	/**
	 *
	 */
	setAnimating() {
    if (this.isPaused()) { return false; }
		Logger.debug("Starting Animate");
		this.addEventListeners();
		this.runState = RUN_STATES.ANIMATE;
	}

	/**
	 *
	 * @returns {boolean}
	 */
	isMagnetizing() {
		return this.runState === RUN_STATES.MAGNETIZE;
	}

	/**
	 *
	 */
	setMagnetizing() {
    if (this.isPaused()) { return false; }
		Logger.debug("Starting Magnetize");
		this.addEventListeners();
		this.runState = RUN_STATES.MAGNETIZE;
	}

	/**
	 *
	 * @returns {boolean}
	 */
	isControlling() {
		return this.runState === RUN_STATES.CONTROL;
	}

	setControlling() {
	  if (this.isPaused()) { return false; }
		Logger.debug("Starting Control");
		this.removeTouchEventListeners();
    this.addControlEventListeners();
		this.runState = RUN_STATES.CONTROL;
	}

	/**
	 *
	 * @returns {boolean}
	 */
	isPaused() {
		return this.runState === RUN_STATES.PAUSE;
	}
}
