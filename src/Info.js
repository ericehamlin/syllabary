'use strict';

import EventMixin from 'EventMixin';
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

    let self = this;
    function slide(velocity, target, callback=null) {
      const delay = 10;
      let change = velocity * delay * 10;
      if (velocity < 0) {
        if (self.container.offsetTop + change > target) {
          self.container.style.top = (self.container.offsetTop + change) + 'px';
        }
        else {
          self.container.style.top = target + 'px';
          return;
        }
      }
      else {
        if (self.container.offsetTop + change < target) {
          self.container.style.top = (self.container.offsetTop + change) + 'px';
        }
        else {
          self.container.style.top = target + 'px';
          return;
        }
      }
      setTimeout(() => slide(velocity, target, callback), delay);
    }

    let touchListener = new window.Hammer(this.container);
    touchListener.get('swipe').set({ enable: true, direction: window.Hammer.DIRECTION_VERTICAL });
    touchListener.on('swipeup', (e) => {
      this.dispatchEvent(new CustomEvent('showinfo'));
      slide(e.overallVelocityY, 0);
    });

    touchListener.on('swipedown', (e) => {
      slide(e.overallVelocityY, 75, () => self.dispatchEvent(new CustomEvent('hideinfo')) );
    });

  }
}

Object.assign(Info.prototype, EventMixin);
