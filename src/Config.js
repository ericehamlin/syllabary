'use strict';

let Config = {
	baseUrl: "/odiousenterprises/thesyllabary/",
	navQueueLength: 6,
	color1: "#000000",
	color2: "#ffffff",
	color3: "#aa0000",
  animateInterval: 0.025,

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
