'use strict';

import Syllabary from './Syllabary';

export default class Control {

	constructor() {
		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.svg.setAttribute("class", "control-display");

		let r1 = 100,
			r2 = r1/1.33,
			r3 = r1/2;


		let outerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		outerCircle.setAttribute("cx", 0);
		outerCircle.setAttribute("cy", 0);
		outerCircle.setAttribute("r", r1);
		outerCircle.setAttribute("fill", "#dddddd");

		this.outerCircleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.outerCircleGroup.appendChild(outerCircle);
		this.placePhonemes(this.outerCircleGroup, (r1 + r2)/2, Syllabary.xDim, Syllabary.phonemes.x);


		let middleCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		middleCircle.setAttribute("cx", 0);
		middleCircle.setAttribute("cy", 0);
		middleCircle.setAttribute("r", r2);
		middleCircle.setAttribute("fill", "#bbbbbb");

		this.middleCircleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.middleCircleGroup.appendChild(middleCircle);
		this.placePhonemes(this.middleCircleGroup, (r2 + r3)/2, Syllabary.yDim, Syllabary.phonemes.y);


		let innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		innerCircle.setAttribute("cx", 0);
		innerCircle.setAttribute("cy", 0);
		innerCircle.setAttribute("r", r3);
		innerCircle.setAttribute("fill", "#999999");

		this.innerCircleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.innerCircleGroup.appendChild(innerCircle);
		this.placePhonemes(this.innerCircleGroup, r3, Syllabary.zDim, Syllabary.phonemes.z);


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
