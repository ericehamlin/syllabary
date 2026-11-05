'use strict';

import EventMixin from './EventMixin.js';
import * as Hammer from "hammerjs";
import Style from './Style.js';
import { convertVmaxToPx, convertPercentToPx } from './Utils.js';
import { createDivWithAttributes } from './Utils.js';

const Info = {
  listeners: [],
  bar: undefined,
  title: undefined,
  info: undefined,
  infoText: undefined,
  version: undefined,
  container: undefined,

  init: function() {

    this.bar = createDivWithAttributes({
      class: "control-bar"
    });

    this.title = createDivWithAttributes({
      id: "syllabary-title"
    });
    this.title.innerHTML = "the Syllabary";

    this.bar.appendChild(this.title);

    this.info = createDivWithAttributes({
      class: "control-info"
    });
    // Kept in its own element so its height can be measured.
    this.infoText = createDivWithAttributes({
      class: "control-info-text"
    });
    this.infoText.innerHTML = "Structure, verse and glyphs copyright &copy; Peter McCarey, 1997-";
    this.info.appendChild(this.infoText);

    this.version = createDivWithAttributes({
      class: "control-version"
    });
    this.version.textContent = typeof __APP_VERSION__ === 'undefined' ? '' : `v${__APP_VERSION__}`;
    this.info.appendChild(this.version);

    this.container = createDivWithAttributes({
      class: "control-container"
    });

    this.container.appendChild(this.bar);
    this.container.appendChild(this.info);

    const self = this;

    // On phones held sideways the drawer is rotated and keeps its fixed opening.
    const isRotated = () => window.matchMedia(Style.mediaQueries.PHONE_LANDSCAPE).matches;

    // Keep the open drawer fitted to its text when the window changes.
    window.addEventListener('resize', () => {
      if (this.container.classList.contains('open')) {
        this.container.style.top = isRotated() ? "" : this.getOpenTop() + 'px';
      }
    });

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
      const rotated = isRotated();
      const top = rotated ? convertVmaxToPx(-10) : this.getOpenTop();
      this.dispatchEvent(new CustomEvent('showinfo'));
      slide(e.overallVelocityY, top, () => {
        this.container.classList.add('open');
        this.container.classList.remove('closed');
        this.container.style.top = rotated ? "" : top + 'px';
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

/**
 * The top of the open drawer: just high enough to show its text and the version
 * number below it, and to clear the wheel, which sits at the top of the drawer and
 * can reach down past the text in a short window.
 */
Info.getOpenTop = function() {
  const parent = this.container.offsetParent;
  const parentHeight = parent ? parent.clientHeight : window.innerHeight;
  const textTop = parseFloat(window.getComputedStyle(this.info).top) || 0;
  const wheel = this.container.querySelector('.control-display');
  const wheelHeight = wheel ? wheel.getBoundingClientRect().height : 0; // an SVG has no offsetHeight
  const gap = 12;
  const contentHeight = Math.max(textTop + this.infoText.offsetHeight, wheelHeight);
  const needed = contentHeight + this.version.offsetHeight + gap;
  return Math.max(0, parentHeight - needed);
};

Object.assign(Info, EventMixin);

export default Info;
