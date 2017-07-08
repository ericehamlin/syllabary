class Syllabary {

	constructor(xDim=20, yDim=10, zDim=18) {
		this.xDim = xDim;
		this.yDim = yDim;
		this.zDim = zDim;

		this.characters = {};
		this.characters.x = [];
		this.characters.y = [];
		this.characters.z = [];
	}
}

//
// let x=20,
// 	y=10,
// 	z=5,
// 	//z=18,
// 	gridLayers = [],
// 	glyphWidth = 500,
// 	glyphHeight = 500;
// for (let i=1; i<=x; i++) {
// 	let gridLayer = document.createElement("div");
// 	gridLayers.push(gridLayer);
// 	for (let j=1; j<=y; j++) {
// 		for (let k=1; k<=z; k++) {
// 			let glyphimg = document.createElement("img");
// 			glyphimg.setAttribute("src", "data/grid/" + i + "-" + j + "-" + k + ".svg");
// 			glyphimg.setAttribute("width", glyphWidth);
// 			glyphimg.setAttribute("height", glyphHeight);
// 			glyphimg.setAttribute("class", "glyph-img");
// 			glyphimg.style.left = (j-1) * glyphWidth;
// 			glyphimg.style.top = (k-1) * glyphHeight;
// 			gridLayer.appendChild(glyphimg);
//
// 			for(let a=0; a<1000000; a++) {
//
// 			}
// 		}
// 	}
// }
//
// for(let i=1; i<=x; i++) {
// 	document.getElementsByTagName("body")[0].appendChild(gridLayers[i-1]);
// }