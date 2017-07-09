'use strict';

import Config from './Config.js';

export default class PoemText {
	constructor(x, y, z) {
		this.url = Config.baseUrl + "/poems/" + x + "-" + y + "-" + z + ".xml";
	}

// <poem>
// <title></title>
// <author>Peter McCarey</author>
// <text>Between the concealed
// 	And the karaoke mike
// 	Feedback screamed
// 	At John le Carré.
// </text>
// </poem>
	load() {

	}
}