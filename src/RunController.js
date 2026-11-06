'use strict';

import Config from "./Config.js";
import NavQueue from "./NavQueue.js";
import Logger from "./Logger.js";
import * as Hammer from "hammerjs";
import SyllabaryDisplay from './SyllabaryDisplay.js';
import Grid from './Grid.js';

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

    this.autoplay = true;

    // Identifies the current read, so a read that was interrupted can tell it no
    // longer counts when its audio promise settles.
    this.readToken = 0;

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
      // Nothing to resume unless paused, for example when the info sheet is
      // swiped down while already closed.
      if (!this.isPaused()) { return; }
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
          break;
        case RUN_STATES.READ:
          this.setReading();
          break;
      }
      this.pausedRunState = null;
      // A poem the user paused with the pause button stays paused.
      if (this.readingSyllable && this.autoplay) {
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

    // The Hammer manager is never disabled, because a disabled manager drops the
    // touchend of a gesture in progress and is left thinking the finger is still
    // down. Instead each gesture is only acted on if it started while touch
    // control was allowed (hasTouchEventListeners).
    this.gridTouchListener = new window.Hammer(gridContainer);
    this.gridTouchListener.get('pinch').set({ enable: true });
    this.gridTouchListener.get('swipe').set({ enable: true });

    let panActive = false;
    let pinchActive = false;

    // Hammer's scale is the finger spread relative to the start of the gesture, so
    // only the change since the previous event may be applied to the grid.
    let lastScale = 1;
    let lastPinchTime = 0;

    this.gridTouchListener.on('pinchstart', (ev) => {
      pinchActive = this.hasTouchEventListeners;
      lastScale = ev.scale;
      lastPinchTime = ev.deltaTime;
    });

    this.gridTouchListener.on('pinch', (ev) => {
      if (!pinchActive || !this.hasTouchEventListeners) return;
      this.setDragging();
      const sensitivity = Config.pinchSensitivity;
      // Spreading the fingers zooms out, which is negative z.
      const zChange = -(ev.scale - lastScale) * sensitivity;
      const elapsed = ev.deltaTime - lastPinchTime;
      Grid.addZ(zChange);
      // The animate direction is grid units per 25ms, so a released pinch keeps
      // drifting at the speed of the fingers. A pan may be reporting at the same
      // time, so leave its x and y alone.
      if (elapsed > 0) {
        const { x, y } = this.animateDirection;
        this.setAnimateDirection(x, y, zChange / elapsed * 25);
      }
      lastScale = ev.scale;
      lastPinchTime = ev.deltaTime;
      this.renderGrid();
    });

    this.gridTouchListener.on('pinchend pinchcancel', () => {
      if (!pinchActive) return;
      pinchActive = false;
      this.setDrifting();
    });

    // Hammer's deltaX/deltaY are the distance since the gesture began, so only the
    // change since the previous event may be applied to the grid.
    let lastDeltaX = 0;
    let lastDeltaY = 0;

    this.gridTouchListener.on('panstart', () => {
      panActive = this.hasTouchEventListeners;
      lastDeltaX = 0;
      lastDeltaY = 0;
    });

    this.gridTouchListener.on('pan', (ev) => {
      if (!panActive || !this.hasTouchEventListeners) return;
      this.setDragging();
      const sensitivity = Config.panSensitivity;
      Grid.addX(-(ev.deltaX - lastDeltaX) * sensitivity);
      Grid.addY(-(ev.deltaY - lastDeltaY) * sensitivity);
      lastDeltaX = ev.deltaX;
      lastDeltaY = ev.deltaY;
      // Hammer velocity is px/ms. The animate direction is grid units per 25ms,
      // so a released drag keeps drifting at the speed of the finger.
      this.setAnimateDirection(
        -ev.velocityX * sensitivity * 25,
        -ev.velocityY * sensitivity * 25,
        pinchActive ? this.animateDirection.z : 0
      );
      this.renderGrid();
    });

    this.gridTouchListener.on('panend pancancel', () => {
      if (!panActive) return;
      panActive = false;
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
    SyllabaryDisplay.control.addEventListener("stopautoplay", () => this.stopAutoplay());
    SyllabaryDisplay.control.addEventListener("startautoplay", () => this.startAutoplay());
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
		this.hasTouchEventListeners = true;
	}

	removeTouchEventListeners() {
		Logger.debug("Removing Touch Event Listeners");
		this.hasTouchEventListeners = false;
	}

  beginRun() {
    var video = document.querySelector('video');
    video.play().then(()=> {
      Logger.info("Autoplay enabled");
    }).catch(e => {
      alert("Please enable audio autoplay for this site.");
    });

    this.run();
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
    if (!this.autoplay) return;

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
    if (!this.autoplay) return;

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
    if (!this.autoplay) return;

    console.log("mag");
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
		const token = ++this.readToken;
		this.readingSyllable = this.getCurrentSyllable();
		let promise = this.readingSyllable.play();
		promise.then(() => {
			if (token !== this.readToken) { return; } // interrupted
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
	 * Navigating away while a poem is being read: stop the audio, fade out the poem
	 * and forget the read, leaving the app as it is after any other navigation.
	 */
	interruptRead() {
		if (!this.isReading()) { return; }
		Logger.debug("Interrupting Read");
		this.readToken++;
		const syllable = this.readingSyllable;
		this.readingSyllable = null;
		if (syllable) { syllable.cancel(); }
		SyllabaryDisplay.hidePoem();
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
   */
  stopAutoplay() {
    this.autoplay = false;
    // A poem being read pauses too, and its scrolling with it.
    if (this.readingSyllable) {
      this.readingSyllable.pause();
    }
    // this.setDrifting();
  }

  /**
   *
   */
  startAutoplay() {
    this.autoplay = true;
    // Unless the info sheet is open, which resumes it when it closes.
    if (this.readingSyllable && !this.isPaused()) {
      this.readingSyllable.resume();
    }
    // this.setAnimating();
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
		// Input stays on, so that navigating away interrupts the read.
		this.addEventListeners();
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
		this.interruptRead();
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
		this.interruptRead();
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
