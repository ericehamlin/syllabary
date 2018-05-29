'use strict';

import EventMixin from './EventMixin.js';
import * as Hammer from "hammerjs";

export default class Info {
  constructor() {
    this.listeners = [];

    this.info = document.createElement("div");
    this.info.setAttribute("class", "control-info");
    this.info.innerHTML = "the Syllabary";

    this.container = document.createElement("div");
    this.container.setAttribute("class", "control-container");

    this.container.appendChild(this.info);

    let touchListener = new window.Hammer(this.container);
    touchListener.get('swipe').set({ enable: true, direction: window.Hammer.DIRECTION_VERTICAL });
    touchListener.on('swipeup', (ev) => {
      this.dispatchEvent(new CustomEvent('showinfo'));
    });

    touchListener.on('swipedown', (ev) => {
      this.dispatchEvent(new CustomEvent('hideinfo'));
    });

  }
}

Object.assign(Info.prototype, EventMixin);
