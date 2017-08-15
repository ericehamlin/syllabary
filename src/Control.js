'use strict';

import Syllabary from './Syllabary';

export default class Control {

	constructor() {
		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.svg.setAttribute("class", "control-display");

		let r1 = 100,
			r2 = r1/1.33,
			r3 = r1/2;


		this.outerCircleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.outerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		this.outerCircle.setAttribute("cx", 0);
		this.outerCircle.setAttribute("cy", 0);
		this.outerCircle.setAttribute("r", r1);
		this.outerCircle.setAttribute("fill", "#dddddd");
		this.outerCircleGroup.appendChild(this.outerCircle);


		this.middleCircleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.middleCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		this.middleCircle.setAttribute("cx", 0);
		this.middleCircle.setAttribute("cy", 0);
		this.middleCircle.setAttribute("r", r2);
		this.middleCircle.setAttribute("fill", "#bbbbbb");
		this.middleCircleGroup.appendChild(this.middleCircle);

		this.innerCircleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
		this.innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		this.innerCircle.setAttribute("cx", 0);
		this.innerCircle.setAttribute("cy", 0);
		this.innerCircle.setAttribute("r", r3);
		this.innerCircle.setAttribute("fill", "#999999");
		this.innerCircleGroup.appendChild(this.innerCircle);

		this.placePhonemes(this.outerCircleGroup, (r1 + r2)/2, Syllabary.xDim, Syllabary.phonemes.x);
		this.placePhonemes(this.middleCircleGroup, (r2 + r3)/2, Syllabary.yDim, Syllabary.phonemes.y);
		this.placePhonemes(this.innerCircleGroup, r3, Syllabary.zDim, Syllabary.phonemes.z);


		this.svg.appendChild(this.outerCircleGroup);
		this.svg.appendChild(this.middleCircleGroup);
		this.svg.appendChild(this.innerCircleGroup);
	}

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
