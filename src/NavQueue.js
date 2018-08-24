'use strict';

import Config from 'Config';

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
