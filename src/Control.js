'use strict';

import Syllabary from './Syllabary';
import Config from './Config.js';
import Utils from './Utils.js';
import * as Hammer from "hammerjs";

export default class Control {

	constructor() {
		/* TODO base these on font size */
		let r1 = 150,
			r2 = r1/1.3,
			r3 = r1/1.7;

		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.svg.setAttribute("class", "control-display");
		this.svg.setAttribute("viewBox", `${-r1}, ${-r1}, ${r1*2}, ${r1*2}`);

		this.listeners = [];

		this.outerCircleGroup = this.createCircle(r1, Utils.blendHexColors(Config.color2, Config.color1, 0.2), (((r1 + r2)/2) - 10), Syllabary.xDim, Syllabary.phonemes.x);

		this.middleCircleGroup = this.createCircle(r2, Utils.blendHexColors(Config.color2, Config.color1, 0.4), (((r2 + r3)/2) - 10), Syllabary.yDim, Syllabary.phonemes.y);

		this.innerCircleGroup = this.createCircle(r3, Utils.blendHexColors(Config.color2, Config.color1, 0.6), (r3 - 20), Syllabary.zDim, Syllabary.phonemes.z);


		// Create Indicator

		let defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
		let clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
		clipPath.setAttribute("id", "indicator-clip-path");
		let circleClipPath = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		circleClipPath.setAttribute("cx", "0");
		circleClipPath.setAttribute("cy", "0");
		circleClipPath.setAttribute("r", r1);
		clipPath.appendChild(circleClipPath);
		defs.appendChild(clipPath);
		this.svg.appendChild(defs);

		let indicator = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
		indicator.setAttribute("points", "0,0, -30,-200, 30,-200, 0,0"); // TODO
		indicator.setAttribute("style", "fill: " + Config.color3 + "; mix-blend-mode:  overlay;");
		indicator.setAttribute("clip-path", "url(#indicator-clip-path)");


		this.svg.appendChild(this.outerCircleGroup);
		this.svg.appendChild(this.middleCircleGroup);
		this.svg.appendChild(this.innerCircleGroup);
		this.svg.appendChild(indicator);


		this.info = document.createElement("div");
		this.info.setAttribute("class", "control-info");
		this.info.innerHTML = "the Syllabary";

		this.container = document.createElement("div");
		this.container.setAttribute("class", "control-container");
		this.container.appendChild(this.svg);
		this.container.appendChild(this.info);


		this.currentlyMovingCircle = null;

		let that = this;

		this.initializeEventListeners();

	}

	getAngle(x, y) {
		let rect = this.outerCircleGroup.getBoundingClientRect();
		let centerX = (rect.left + rect.right)/2;
		let centerY = (rect.top + rect.bottom)/2;
		let angle = Math.atan2(x-centerX, y-centerY);
		return -this.radiansToDegrees(angle);

	}

	radiansToDegrees (radians) {
		return radians * (180 / Math.PI);
	}

	/**
	 *
	 * @param r
	 * @param fill
	 * @param textR
	 * @param dim
	 * @param phonemes
	 * @returns {Element}
	 */
	createCircle(r, fill, textRadius, dim, phonemes) {
		let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		circle.setAttribute("cx", 0);
		circle.setAttribute("cy", 0);
		circle.setAttribute("r", r);
		circle.setAttribute("fill", fill);

		let group = document.createElementNS("http://www.w3.org/2000/svg", "g");
		group.appendChild(circle);
		this.placePhonemes(group, textRadius, dim, phonemes);

		return group;
	}

	/**
	 *
	 * @param group
	 * @param r
	 * @param dim
	 * @param phonemes
	 */
	placePhonemes(group, r, dim, phonemes) {
		let degreesIncrease = 360/(dim);
		for(let i=1; i<=dim; i++) {
			let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
			text.setAttribute("x", 0);
			text.setAttribute("y", 0);
			text.setAttribute("text-anchor", "middle");
			text.setAttribute("fill", Config.color1);
			text.setAttribute("transform",  "rotate("+  ((i-1)*degreesIncrease)  +") translate(0, "+(-r)+")" );
			let actualText = document.createTextNode(phonemes[i]);
			text.appendChild(actualText);
			group.appendChild(text);
		}
	}

	/**
	 *
	 */
	render() {
		let x = Syllabary.getX();
		let y = Syllabary.getY();
		let z = Syllabary.getZ();

		let xDeg = (360 * (x-1)) / Syllabary.xDim;
		let yDeg = (360 * (y-1)) / Syllabary.yDim;
		let zDeg = (360 * (z-1)) / Syllabary.zDim;

		this.outerCircleGroup.setAttribute("transform", "rotate(" + -xDeg + ")");
		this.middleCircleGroup.setAttribute("transform", "rotate(" + -yDeg + ")");
		this.innerCircleGroup.setAttribute("transform", "rotate(" + -zDeg + ")");
	}


	addEventListener(type, listener) {
		this.listeners.push({type:type, listener:listener});
	}

	// TODO: cancel control when no pan
	initializeEventListeners() {

    const startPan = (e) => {
      syllabaryTouchListener.set({ enable: true });
      this.angle = this.getAngle(e.center.x, e.center.y);
      this.dispatchEvent(new CustomEvent('startrotate'));
    };

    const handlePan = (e) => {
      if (this.currentlyMovingCircle) {
        let dimension;
        let angle = this.getAngle(e.center.x, e.center.y);
        let angleChange = this.angle - angle;
        let change;

        switch (this.currentlyMovingCircle) {
          case "outer":
            dimension = "x";
            change = (angleChange * Syllabary.xDim / 360);
            break;
          case "middle":
            dimension = "y";
            change = (angleChange * Syllabary.yDim / 360);
            break;
          case "inner":
            dimension = "z";
            change = (angleChange * Syllabary.zDim / 360);
            break;
        }

        change = Number.isNaN(change) ? 0 : change;
        this.dispatchEvent(new CustomEvent('rotate', {detail: {change: change, dimension: dimension}}));
        this.angle = angle;
      }
    };

    const handlePanEnd = (e) => {
      this.currentlyMovingCircle = null;
      syllabaryTouchListener.set({ enable: false });
      this.dispatchEvent(new CustomEvent('endrotate'));
    };

    let syllabaryTouchListener = new window.Hammer(document.getElementById(Syllabary.containerId));
    syllabaryTouchListener.on('pan', e => handlePan(e) );
    syllabaryTouchListener.on('panend', e => handlePanEnd(e) );


    this.outerCircleTouchListener = new window.Hammer(this.outerCircleGroup);
    this.outerCircleTouchListener.get('press').set({ enable: true, time: 0 });
    this.outerCircleTouchListener.on('press', (e) => {
			this.currentlyMovingCircle = "outer";
			startPan(e);
		});

    this.middleCircleTouchListener = new window.Hammer(this.middleCircleGroup);
    this.middleCircleTouchListener.get('press').set({ enable: true, time: 0 });
    this.middleCircleTouchListener.on('press', (e) => {
      this.currentlyMovingCircle = "middle";
      startPan(e);
    });

    this.innerCircleTouchListener = new window.Hammer(this.innerCircleGroup);
    this.innerCircleTouchListener.get('press').set({ enable: true, time: 0 });
    this.innerCircleTouchListener.on('press', (e) => {
      this.currentlyMovingCircle = "inner";
      startPan(e);
    });
	}

	startEventListeners() {
    this.outerCircleTouchListener.set({enable: true});
    this.middleCircleTouchListener.set({enable: true});
    this.innerCircleTouchListener.set({enable: true});
	}

	pauseEventListeners() {
    this.outerCircleTouchListener.set({enable: false});
    this.middleCircleTouchListener.set({enable: false});
    this.innerCircleTouchListener.set({enable: false});
	}

	dispatchEvent(event) {
		for (let index in this.listeners) {
			if (event.type == this.listeners[index].type) {
				this.listeners[index].listener(event);
			}
		}
	}
}
