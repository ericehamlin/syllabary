'use strict';

let Config = {
	baseUrl: "/odiousenterprises/thesyllabary/",
	navQueueLength: 6,
	color1: "#000000",
	color2: "#ffffff",
	color3: "#aa0000",

	debug: false,

	set: (conf) => {
		for(let key in conf) {
			if(Config.hasOwnProperty(key)) {
				Config[key] = conf[key]
			}
		}
	}
};

export default Config;
