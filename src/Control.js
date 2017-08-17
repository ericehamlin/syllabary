'use strict';

import Syllabary from './Syllabary';

export default class Control {

	constructor() {
		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.svg.setAttribute("class", "control-display");

		let r1 = 100,
			r2 = r1/1.33,
			r3 = r1/2;


		this.outerCircleGroup = this.createCircle(r1, "#dddddd", (r1 + r2)/2, Syllabary.xDim, Syllabary.phonemes.x);

		this.middleCircleGroup = this.createCircle(r2, "#bbbbbb", (r2 + r3)/2, Syllabary.yDim, Syllabary.phonemes.y);

		this.innerCircleGroup = this.createCircle(r3, "#999999", r3, Syllabary.zDim, Syllabary.phonemes.z);

		this.svg.appendChild(this.outerCircleGroup);
		this.svg.appendChild(this.middleCircleGroup);
		this.svg.appendChild(this.innerCircleGroup);


		this.outerCircleGroup.onmousedown = (e) => {
			console.debug(e);
		}

		this.middleCircleGroup.onmousedown = (e) => {
			console.debug(e);
		}

		this.innerCircleGroup.onmousedown = (e) => {
			console.debug(e);
		}
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
}
