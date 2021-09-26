'use strict';
import { LogLevels } from './Logger.js';

const Config = {
	navQueueLength: 6,
	color1: "#000000",
	color2: "#ffffff",
	color3: "#aa0000",
  animateInterval: 0.025,
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
