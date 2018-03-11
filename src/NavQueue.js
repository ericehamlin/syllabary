'use strict';

import Syllabary from './Syllabary.js';
import Config from './Config.js';

let NavQueue = {

	queue: [],
	add: (x, y, z) => {
		NavQueue.queue.unshift(x+"-"+y+"-"+z);
		if (NavQueue.queue.length > Config.navQueueLength) {
			NavQueue.queue.pop();
		}
		console.debug("Current NavQueue", NavQueue.queue);
	},
	includes: (x, y, z) => { return NavQueue.queue.includes(x+"-"+y+"-"+z); }
};

export default NavQueue;