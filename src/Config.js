'use strict';
import { LogLevels } from './Logger.js';

const Config = {
	navQueueLength: 6,
	color1: "#000000",
	color2: "#ffffff",
	color3: "#aa0000",
  animateInterval: 0.025,
  panSensitivity: 0.01, // grid units per pixel dragged
  pinchSensitivity: 5, // grid units zoomed when the finger spread doubles
  audioLoadTimeout: 15000, // ms to wait for a syllable's audio before moving on
	logLevel: LogLevels.debug,

	debug: false,

	set: (conf) => {
		for(let key in conf) {
		  let val = conf[key];
			if(Config.hasOwnProperty(key)) {
			  if (!isNaN(parseFloat(val))) {
			    val = parseFloat(val);
        }
				Config[key] = val
			}
		}
	}
};

export default Config;
