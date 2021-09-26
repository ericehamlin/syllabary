'use strict';
import Syllabary from './Syllabary';
import Grid from 'Grid';
import Config from './Config.js';
import { radiansToDegrees, blendHexColors } from 'utils';
import EventMixin from './EventMixin.js';
import Logger from './Logger.js';
import * as Hammer from "hammerjs";
import {
  PHONEMES,
  PHONEMES_TO_AXES_MAP,
  PHONEME_DIMENSIONS,
  AXIS_DIMENSIONS
} from './constants';
import {
  createElementNSWithAttributes,
  createSvgElementWithAttributes,
  createSvgWithAttributes
} from './utils';

const SVG_NS = "http://www.w3.org/2000/svg";

export default class ControlWheel {

  constructor() {
    /* TODO base these on font size */
    const outerCircleRadius = 150;
    const middleCircleRadius = outerCircleRadius / 1.3;
    const innerCircleRadius = outerCircleRadius / 1.7;

    this.svg = createSvgWithAttributes({
      class: "control-display",
      viewBox:
        `${-outerCircleRadius}, ${-outerCircleRadius}, ${outerCircleRadius * 2}, ${outerCircleRadius * 2}`
    });

    this.listeners = [];

    this.outerCircleGroup = this.createCircle(
      outerCircleRadius,
      blendHexColors(Config.color2, Config.color1, 0.2),
      (((outerCircleRadius + middleCircleRadius) / 2) - 10),
      PHONEMES.initialConsonants
    );

    this.middleCircleGroup = this.createCircle(
      middleCircleRadius,
      blendHexColors(Config.color2, Config.color1, 0.4),
      (((middleCircleRadius + innerCircleRadius) / 2) - 10),
      PHONEMES.vowels
    );

    this.innerCircleGroup = this.createCircle(
      innerCircleRadius,
      blendHexColors(Config.color2, Config.color1, 0.6),
      (innerCircleRadius - 20),
      PHONEMES.finalConsonants
    );


    // Create Indicator

    const defs = document.createElementNS(SVG_NS, "defs");
    const clipPath = createElementNSWithAttributes(
      SVG_NS,
      "clipPath",
      { id: "indicator-clip-path"}
    );
    const circleClipPath = createElementNSWithAttributes(
      SVG_NS,
      "circle",
      {
        cx: 0,
        cy: 0,
        r: outerCircleRadius
      }
    );
    clipPath.appendChild(circleClipPath);
    defs.appendChild(clipPath);
    this.svg.appendChild(defs);

    const indicator = createElementNSWithAttributes(
      SVG_NS,
      "polygon",
      {
        points: "0,0, -30,-200, 30,-200, 0,0",
        style: `fill: ${Config.color3}; mix-blend-mode:  overlay;`,
        "clip-path": "url(#indicator-clip-path)"
      }
    );

    this.svg.appendChild(this.outerCircleGroup);
    this.svg.appendChild(this.middleCircleGroup);
    this.svg.appendChild(this.innerCircleGroup);
    this.svg.appendChild(indicator);

    this.currentlyMovingCircle = null;

    this.initializeEventListeners();
  }

  getAngle(x, y) {
    const rect = this.outerCircleGroup.getBoundingClientRect();
    const centerX = (rect.left + rect.right) / 2;
    const centerY = (rect.top + rect.bottom) / 2;
    const angle = Math.atan2(x - centerX, y - centerY);
    return -radiansToDegrees(angle);
  }

  /**
   *
   * @param r
   * @param fill
   * @param textRadius
   * @param phonemes
   * @returns {Element}
   */
  createCircle(r, fill, textRadius, phonemes) {
    const circle = createElementNSWithAttributes(
      SVG_NS,
      "circle",
      {
        cx: 0,
        cy: 0,
        r: r,
        fill: fill
      }
    );

    const group = document.createElementNS(SVG_NS, "g");
    group.appendChild(circle);
    this.placePhonemes(group, textRadius, phonemes);

    return group;
  }

  /**
   *
   * @param group
   * @param r
   * @param phonemes
   */
  placePhonemes(group, r, phonemes) {
    const dim = phonemes.length -1;
    const degreesIncrease = 360 / (dim);
    for (let i = 1; i <= dim; i++) {
      const text = createSvgElementWithAttributes(
        "text",
        {
          x: 0,
          y: 0,
          "text-anchor": "middle",
          fill: Config.color1,
          transform:
            `rotate( ${((i - 1) * degreesIncrease)} ) translate(0, ${-r} )`
        }
      );

      const actualText = document.createTextNode(phonemes[i]);
      text.appendChild(actualText);
      group.appendChild(text);
    }
  }

  /**
   *
   */
  render() {
    const x = Grid.getCalculatedX();
    const y = Grid.getCalculatedY();
    const z = Grid.getCalculatedZ();

    const deg = {
      x: (360 * (x - 1)) / AXIS_DIMENSIONS.x,
      y: (360 * (y - 1)) / AXIS_DIMENSIONS.y,
      z: (360 * (z - 1)) / AXIS_DIMENSIONS.z
    };

    this.outerCircleGroup.setAttribute(
      "transform",
      `rotate( ${-deg[PHONEMES_TO_AXES_MAP.initialConsonants]} )`
    );
    this.middleCircleGroup.setAttribute(
      "transform",
      `rotate( ${-deg[PHONEMES_TO_AXES_MAP.vowels]} )`
    );
    this.innerCircleGroup.setAttribute(
      "transform",
      `rotate( ${-deg[PHONEMES_TO_AXES_MAP.finalConsonants]} )`
    );
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
        const angle = this.getAngle(e.center.x, e.center.y);
        const angleChange = this.angle - angle;
        let dimension;
        let change;

        switch (this.currentlyMovingCircle) {
          case "outer":
            dimension = PHONEMES_TO_AXES_MAP.initialConsonants;
            change = (angleChange * PHONEME_DIMENSIONS.initialConsonants / 360);
            break;
          case "middle":
            dimension = PHONEMES_TO_AXES_MAP.vowels;
            change = (angleChange * PHONEME_DIMENSIONS.vowels / 360);
            break;
          case "inner":
            dimension = PHONEMES_TO_AXES_MAP.finalConsonants;
            change = (angleChange * PHONEME_DIMENSIONS.finalConsonants / 360);
            break;
        }

        change = Number.isNaN(change) ? 0 : change;

        this.dispatchEvent(
          new CustomEvent(
            'rotate',
            {
              detail: {
                change: change,
                dimension: dimension
              }
            }
          )
        );

        this.angle = angle;
      }
    };

    const syllabaryTouchListener = new window.Hammer(document.getElementById(Syllabary.containerId));
    syllabaryTouchListener.on('pan', e => handlePan(e));
    const handlePanEnd = (e) => {
      this.currentlyMovingCircle = null;
      syllabaryTouchListener.set({ enable: false });
      this.dispatchEvent(new CustomEvent('endrotate'));
    };
    syllabaryTouchListener.on('panend', e => handlePanEnd(e));

    this.outerCirclePanListener = new window.Hammer(this.outerCircleGroup);
    this.outerCirclePanListener.get('pan').set({ enable: true });
    this.outerCirclePanListener.on('panstart', (e) => {
      Logger.debug('Pan outer circle');
      this.currentlyMovingCircle = "outer";
      startPan(e);
    });


    this.middleCircleTouchListener = new window.Hammer(this.middleCircleGroup);
    this.middleCircleTouchListener.get('press').set({ enable: true, threshold: 50, time: 1 });
    this.middleCircleTouchListener.on('press', (e) => {
      Logger.debug('Press middle circle');
      this.currentlyMovingCircle = "middle";
      startPan(e);
    });

    this.innerCircleTouchListener = new window.Hammer(this.innerCircleGroup);
    this.innerCircleTouchListener.get('press').set({ enable: true, threshold: 50, time: 1 });
    this.innerCircleTouchListener.on('press', (e) => {
      Logger.debug('Press inner circle');
      this.currentlyMovingCircle = "inner";
      startPan(e);
    });
  }

  startEventListeners() {
    this.outerCirclePanListener.set({ enable: true });
    this.middleCircleTouchListener.set({ enable: true });
    this.innerCircleTouchListener.set({ enable: true });
  }

  pauseEventListeners() {
    this.outerCirclePanListener.set({ enable: false });
    this.middleCircleTouchListener.set({ enable: false });
    this.innerCircleTouchListener.set({ enable: false });
  }
}

Object.assign(ControlWheel.prototype, EventMixin);
