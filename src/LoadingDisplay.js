'use strict';

import Config from 'Config';
import Syllabary from 'Syllabary';
import FileLoader from 'FileLoader';
import EventMixin from './EventMixin.js';
import { createElementNSWithAttributes } from './Utils.js';

const LoadingDisplay = {

  lastPointDrawn: 0,

  segmentLength: 0, // set dynamically
  segmentWidth: 50, // known

  numStrokes:   36, // known
  totalLength:  0, // set dynamically
  points:       [],
  strokes:      [],
  svgContainer: undefined,

	create: () => {
    LoadingDisplay.display = document.createElement("div");
    LoadingDisplay.display.setAttribute("class", "loading-display");

    return LoadingDisplay.load().then((svg) => {
      LoadingDisplay.display.innerHTML = svg;
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

      const numDivisions = 300;
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
        //const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'g');
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
          LoadingDisplay.positionSegment(i-1);
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
	  if (!LoadingDisplay.totalLength) {
	    return;
    }

	  let currentPoint = Math.floor((percentComplete * (LoadingDisplay.points.length-1)) / 100);

    for (let i=LoadingDisplay.lastPointDrawn; i<currentPoint; i++) {
      const point1 = LoadingDisplay.points[i];
      const point2 = LoadingDisplay.points[i+1];

      if (point1.stroke === point2.stroke) {
        const segment = document.getElementById(`clip-path-segment-${i}`);
        segment.setAttribute('style', 'display:block;');
      }
    }
    LoadingDisplay.lastPointDrawn = currentPoint;

    //LoadingDisplay.display.innerHTML = Math.round(percentComplete) + "% complete";
	},

  enableButtons: () => {
    const topButtonHit = document.getElementById('button-top-hit');
    const topButton = document.getElementById('button-top');
    const middleButtonHit = document.getElementById('button-middle-hit');
    const middleButton = document.getElementById('button-middle');
    const bottomButtonHit = document.getElementById('button-bottom-hit');
    const bottomButton = document.getElementById('button-bottom');

    topButtonHit.onmouseover = () => {
      topButton.setAttribute('fill', Config.color3);
    };
    topButtonHit.onmouseout = () => {
      topButton.setAttribute('fill', Config.color1);
    };
    topButtonHit.onclick = () => {
      topButton.setAttribute('fill', Config.color3);
      LoadingDisplay.dispatchEvent(new CustomEvent("play"));
    };

    middleButtonHit.onmouseover = () => {
      middleButton.setAttribute('fill', Config.color3);
    };
    middleButtonHit.onmouseout = () => {
      middleButton.setAttribute('fill', Config.color1);
    };
    middleButtonHit.onclick = () => {
      middleButton.setAttribute('fill', Config.color3);
      document.location.href = 'exclamation.html';
    };

    bottomButtonHit.onmouseover = () => {
      bottomButton.setAttribute('fill', Config.color3);
    };
    bottomButtonHit.onmouseout = () => {
      bottomButton.setAttribute('fill', Config.color1);
    };
    bottomButtonHit.onclick = () => {
      bottomButton.setAttribute('fill', Config.color3);
      document.location.href = 'question.html';
    };
  },

	add: () => {
		document.getElementById(Syllabary.containerId).appendChild(LoadingDisplay.display);
	},

	remove: () => {
    LoadingDisplay.display.parentNode.removeChild(LoadingDisplay.display);
	},

  drawSegment: (strokeNum, segmentNum) => {
    const segment = createElementNSWithAttributes(
      'http://www.w3.org/2000/svg',
      'rect',
      {
        id: `clip-path-segment-${segmentNum}`,
        x: 0,
        y: 0,
        width: LoadingDisplay.segmentWidth,
        height: LoadingDisplay.segmentLength,
        class: 'clip-path-segment',
        style: 'display:none;'
      }
    );

    const clipPath = document.getElementById(`stroke-${strokeNum}-clip-path`);
    clipPath.appendChild(segment);
  },

  positionSegment: (segmentNum) => {
    const segment = document.getElementById(`clip-path-segment-${segmentNum}`);
    const point1 = LoadingDisplay.points[segmentNum];
    const x = point1.point.x;
    const y = point1.point.y;

    const translate = `translate(-${(LoadingDisplay.segmentWidth / 2)}, -${(LoadingDisplay.segmentLength / 2)})`;
    segment.setAttribute('transform', `${translate}`);

    segment.setAttribute("x", x);
    segment.setAttribute("y", y);
  },

  getDistance: (point1, point2) => {
    return Math.sqrt(
      Math.pow(point2.point.y - point1.point.y, 2) + Math.pow(point2.point.x - point1.point.x, 2)
    );
  },

  /**
   *
   * @param {number} rad radians
   * @returns {number} degrees
   */
  radToDeg: function(rad) {
    return rad * 180 / Math.PI;
  }
};

Object.assign(LoadingDisplay, EventMixin);

export default LoadingDisplay;
