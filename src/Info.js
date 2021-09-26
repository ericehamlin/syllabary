'use strict';

import EventMixin from 'EventMixin';
import * as Hammer from "hammerjs";
import Style from 'Style';
import { convertVmaxToPx, convertPercentToPx } from 'utils';

const Info = {
  listeners: [],
  bar: undefined,
  title: undefined,
  info: undefined,
  container: undefined,

  init: function() {

    this.bar = document.createElement("div");
    this.bar.setAttribute("class", "control-bar");

    this.title = document.createElement("div");
    this.title.setAttribute("id", "syllabary-title");
    this.title.innerHTML = "the Syllabary";

    this.bar.appendChild(this.title);

    this.info = document.createElement("div");
    this.info.setAttribute("class", "control-info");
    this.info.innerHTML = "Info about the Syllabary";

    this.container = document.createElement("div");
    this.container.setAttribute("class", "control-container");

    this.container.appendChild(this.bar);
    this.container.appendChild(this.info);

    const self = this;
    function slide(velocity, target, callback = null) {
      const delay = 10;
      let change = velocity * delay * 10;
      if (velocity < 0) {
        if (self.container.offsetTop + change > target) {
          self.container.style.top = (self.container.offsetTop + change) + 'px';
        }
        else {
          self.container.style.top = target + 'px';
          callback();
          return;
        }
      }
      else {
        if (self.container.offsetTop + change < target) {
          self.container.style.top = (self.container.offsetTop + change) + 'px';
        }
        else {
          self.container.style.top = target + 'px';
          callback();
          return;
        }
      }
      setTimeout(() => slide(velocity, target, callback), delay);
    }

    const touchListener = new window.Hammer(this.container);
    touchListener.get('swipe').set({ enable: true, direction: window.Hammer.DIRECTION_VERTICAL });

    touchListener.on('swipeup', (e) => {
      e.preventDefault();
      const top = Style.whenMediaQueryMatches({
        TABLET_LANDSCAPE: convertPercentToPx(-22),
        TABLET_PORTRAIT: convertPercentToPx(-20),
        PHONE_LANDSCAPE: convertVmaxToPx(-10),
        PHONE_PORTAIT: convertPercentToPx(-25),
        DESKTOP: convertPercentToPx(-10)
      });
      this.dispatchEvent(new CustomEvent('showinfo'));
      slide(e.overallVelocityY, top, () => {
        this.container.classList.add('open');
        this.container.classList.remove('closed');
        this.container.style.top = "";
      });
    });

    touchListener.on('swipedown', (e) => {
      e.preventDefault();
      const top = Style.whenMediaQueryMatches({
        TABLET_LANDSCAPE: convertPercentToPx(75),
        TABLET_PORTRAIT: convertPercentToPx(80),
        PHONE_LANDSCAPE: convertVmaxToPx(70),
        PHONE_PORTAIT: convertPercentToPx(75),
        DESKTOP: convertPercentToPx(37)
      });
      slide(e.overallVelocityY, top, () => {
        self.dispatchEvent(new CustomEvent('hideinfo'));
        this.container.classList.add('closed');
        this.container.classList.remove('open');
        this.container.style.top = "";
      });
    });
  }
}

Object.assign(Info, EventMixin);

export default Info;
