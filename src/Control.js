'use strict';

import Syllabary from './Syllabary';

export default class Control {

	constructor() {
		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.svg.setAttribute("class", "control-display");
		this.svg.setAttribute("viewBox", "-100, -100, 200, 200");
		this.svg.setAttribute("width", "200");

		let r1 = 100,
			r2 = r1/1.33,
			r3 = r1/2;


		this.listeners = [];

		this.outerCircleGroup = this.createCircle(r1, "#dddddd", (r1 + r2)/2, Syllabary.xDim, Syllabary.phonemes.x);

		this.middleCircleGroup = this.createCircle(r2, "#bbbbbb", (r2 + r3)/2, Syllabary.yDim, Syllabary.phonemes.y);

		this.innerCircleGroup = this.createCircle(r3, "#999999", r3, Syllabary.zDim, Syllabary.phonemes.z);

		this.svg.appendChild(this.outerCircleGroup);
		this.svg.appendChild(this.middleCircleGroup);
		this.svg.appendChild(this.innerCircleGroup);

		this.currentlyMovingCircle = null;

		let that = this;
		this.outerCircleGroup.onmousedown = (e) => {
			that.currentlyMovingCircle = "outer";
			that.angle = that.getAngle(e.screenX, e.screenY);
			that.dispatchEvent(e);
		}

		this.middleCircleGroup.onmousedown = (e) => {
			that.currentlyMovingCircle = "middle";
			that.dispatchEvent(e);
		}

		this.innerCircleGroup.onmousedown = (e) => {
			that.currentlyMovingCircle = "inner";
			that.dispatchEvent(e);
		}


		window.onmousemove = (e) => {
			if (that.currentlyMovingCircle) {
				let dimension;
				let angle = that.getAngle(e.screenX, e.screenY);
				let angleChange = that.angle - angle;
				let change;

				switch (that.currentlyMovingCircle) {
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

				that.dispatchEvent(new CustomEvent('rotate', {detail: {change: change, dimension: dimension}}));
				that.angle = angle;
			}
		}

		window.onmouseup = (e) => {
			that.currentlyMovingCircle = null;
		}
	}

	getAngle(x, y) {
		let rect = this.outerCircleGroup.getBoundingClientRect();
		let centerX = (rect.left + rect.width)/2;
		let centerY = (rect.top + rect.height)/2;
		let angle = Math.atan2(x-centerX, y-centerY);
		return this.radiansToDegrees(angle);
	}

	radiansToDegrees (angle) {
		return angle * (180 / Math.PI);
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
		let degreesIncrease = 360/(dim-1);
		for(let i=1; i<=dim; i++) {
			let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
			text.setAttribute("x", 0);
			text.setAttribute("y", 0);
			text.setAttribute("fill", "#000000");
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
		let x = Syllabary.getCurrentLocation(Syllabary.grid.xPosition, Syllabary.xDim);
		let y = Syllabary.getCurrentLocation(Syllabary.grid.yPosition, Syllabary.yDim);
		let z = Syllabary.getCurrentLocation(Syllabary.grid.zPosition, Syllabary.zDim);

		let xDeg = (360 * x) / Syllabary.xDim;
		let yDeg = (360 * y) / Syllabary.yDim;
		let zDeg = (360 * z) / Syllabary.zDim;

		this.outerCircleGroup.setAttribute("transform", "rotate(" + xDeg + ")");
		this.middleCircleGroup.setAttribute("transform", "rotate(" + yDeg + ")");
		this.innerCircleGroup.setAttribute("transform", "rotate(" + zDeg + ")");
	}


	addEventListener(type, listener) {
		this.listeners.push({type:type, listener:listener});
	}

	dispatchEvent(event) {
		for (let index in this.listeners) {
			if (event.type == this.listeners[index].type) {
				this.listeners[index].listener(event);
			}
		}
	}

}
