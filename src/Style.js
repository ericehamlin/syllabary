'use strict';

import Config from 'Config';
import { blendHexColors, hexToRgb } from 'utils';

let Style = {
  mediaQueries: {
    TABLET_LANDSCAPE: 'only screen and (max-width: 1024px) and (min-width: 568px) and (orientation: landscape)',
    TABLET_PORTRAIT: 'only screen and (max-width: 1024px) and (min-width: 568px) and (orientation: portrait)',
    PHONE_LANDSCAPE: 'screen and (max-height: 567px) and (orientation: landscape)',
    PHONE_PORTRAIT: 'only screen and (max-width: 567px) and (orientation: portrait)',
    DESKTOP: 'desktop'
  },

  whenMediaQueryMatches: (conditions) => {
    let mediaQueryList = window.matchMedia(Style.mediaQueries.TABLET_LANDSCAPE);
    if (mediaQueryList.matches) {
      return conditions['TABLET_LANDSCAPE'];
    }
    mediaQueryList = window.matchMedia(Style.mediaQueries.TABLET_PORTRAIT);
    if (mediaQueryList.matches) {
      return conditions['TABLET_PORTRAIT'];
    }
    mediaQueryList = window.matchMedia(Style.mediaQueries.PHONE_LANDSCAPE);
    if (mediaQueryList.matches) {
      return conditions['PHONE_LANDSCAPE'];
    }
    mediaQueryList = window.matchMedia(Style.mediaQueries.PHONE_PORTRAIT);
    if (mediaQueryList.matches) {
      return conditions['PHONE_PORTRAIT'];
    }
    return conditions['DESKTOP'];
  },

  addRules: () => {
    const color2Rgb = hexToRgb(Config.color2);
    const stylesheet = document.styleSheets[0];
    stylesheet.insertRule(`html, body { color: ${Config.color1}; background-color: ${Config.color2}; }`);
    stylesheet.insertRule(`.fade-layer { background-color: ${Config.color2}; }`);
    stylesheet.insertRule(`.center-fade { background: radial-gradient(rgba(${color2Rgb.r},${color2Rgb.g},${color2Rgb.b},0.75) 20%, rgba(${color2Rgb.r},${color2Rgb.g},${color2Rgb.b}, 0.7)); }`)
    stylesheet.insertRule(`.poem-container { background-color: rgba(${color2Rgb.r},${color2Rgb.g},${color2Rgb.b}, 0.8); }`);
    stylesheet.insertRule(`.control-bar { background-color: ${blendHexColors(Config.color2, Config.color1, 0.2)}; }`);
  }
};

export default Style;
