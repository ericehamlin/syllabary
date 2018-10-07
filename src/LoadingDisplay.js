'use strict';

import Config from 'Config';
import Syllabary from 'Syllabary';
import FileLoader from 'FileLoader';

let LoadingDisplay = {

  lastPointDrawn: 0,

  segmentLength: 0, // set dynamically
  segmentWidth: 1000, // known segmentWidth: 10,

  numStrokes: 36, // known
  totalLength: 0, // set dynamically
  points: [],
  strokes: [],
  svgEl: undefined,

	create: () => {
    LoadingDisplay.display = document.createElement("div");
    LoadingDisplay.display.setAttribute("class", "loading-display");

    return LoadingDisplay.load().then((svg) => {
      LoadingDisplay.svgEl = document.createElement('div');
      LoadingDisplay.svgEl.innerHTML = svg;
      LoadingDisplay.display.appendChild(LoadingDisplay.svgEl);
      for (let i=1; i<= LoadingDisplay.numStrokes; i++) {
        const path = document.getElementById(`stroke-${i}-guide`);
        const shape = document.getElementById(`stroke-${i}`);
        const length = path.getTotalLength();
        LoadingDisplay.strokes.push({
          num: i,
          path: path,
          shape: shape,
          length: length,
          start: LoadingDisplay.totalLength
        });
        LoadingDisplay.totalLength += length;
      }

      const numDivisions = 1000;
      const lengthUnit = LoadingDisplay.totalLength / numDivisions;
      let currentStroke = 1; // in the SVG, they're 1-indexed instead of 0-indexed
      for (let i=0; i<numDivisions; i++) {
        let stroke = LoadingDisplay.strokes[currentStroke-1];
        if (((i*lengthUnit) - stroke.start) > stroke.length) {
          LoadingDisplay.addPoint(stroke, stroke.length);

          currentStroke++;

          stroke = LoadingDisplay.strokes[currentStroke-1];
          LoadingDisplay.addPoint(stroke, 0);
        }
        LoadingDisplay.addPoint(stroke, (i*lengthUnit) - stroke.start );

      }

      LoadingDisplay.segmentLength = LoadingDisplay.getDistance(LoadingDisplay.points[0], LoadingDisplay.points[1]);

      const defs = document.getElementsByTagName('defs')[0];

      // create a clipPath for each stroke
      for(let i=1; i<=LoadingDisplay.numStrokes; i++) {
        const stroke = LoadingDisplay.strokes[i-1];
        const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        const clipPathId = `stroke-${i}-clip-path`;
        clipPath.setAttribute('id', clipPathId);
        defs.appendChild(clipPath);
        stroke.shape.setAttribute('clip-path', `url(#${clipPathId})`)
      }

      // create a segment for each
      for (let i=1; i<LoadingDisplay.points.length; i++) {
        const point1 = LoadingDisplay.points[i-1];
        const point2 = LoadingDisplay.points[i];
        if (point1.stroke === point2.stroke) {
          LoadingDisplay.drawSegment(point1.stroke.num, i-1);
        }
      }
    });
	},

  load() {
    const url = Config.baseUrl + "svg/syllabary_v4_loading_screen.svg";
    let promise = FileLoader.load(url);
    return promise;
  },

  addPoint(stroke, length) {
    const point = stroke.path.getPointAtLength(length);
    LoadingDisplay.points.push({
      stroke: stroke,
      point: point
    });
  },

	render: (percentComplete) => {

	  let currentPoint = Math.floor((percentComplete * (LoadingDisplay.points.length-1)) / 100);

    for (let i=LoadingDisplay.lastPointDrawn; i<currentPoint; i++) {
      const point1 = LoadingDisplay.points[i];
      const point2 = LoadingDisplay.points[i+1];

      if (point1.stroke !== point2.stroke) {
        console.log("SKIPPING SEGMENT BETWEEN", point1, point2);
      }
      else {
        const slope = LoadingDisplay.getSlope(point1, point2);
        //console.log("DRAWING SEGMENT BETWEEN", point1, point2, slope);
      }
    }
    LoadingDisplay.lastPointDrawn = currentPoint;

    //LoadingDisplay.display.innerHTML = Math.round(percentComplete) + "% complete";
	},

	addButton: () => {
		let button = document.createElement("button");
		button.innerHTML = "Play";
    LoadingDisplay.display.appendChild(button);
		return button;
	},

	add: () => {
		document.getElementById(Syllabary.containerId).appendChild(LoadingDisplay.display);
	},

	remove: () => {
    LoadingDisplay.display.parentNode.removeChild(LoadingDisplay.display);
	},

  drawSegment: (strokeNum, segmentNum) => {
    const segment = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    segment.setAttribute('id', `clip-path-segment-${segmentNum}`);
    segment.setAttribute('x', 0);
    segment.setAttribute('y', 0);
    segment.setAttribute('width', LoadingDisplay.segmentWidth);
    segment.setAttribute('height', LoadingDisplay.segmentLength);
    segment.setAttribute('style', 'display:none;');
    const clipPath = document.getElementById(`stroke-${strokeNum}-clip-path`);
    clipPath.appendChild(segment);
  },

  getDistance: (point1, point2) => {
    return Math.sqrt( Math.pow(point2.point.y - point1.point.y, 2) + Math.pow(point2.point.x - point1.point.x, 2));
  },

  getSlope: (point1, point2) => {
	  return (point2.point.y - point1.point.y) / (point2.point.x - point1.point.x);
  }
};

export default LoadingDisplay;
