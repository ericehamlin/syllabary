'use strict';

import Config from 'Config';
import Logger from 'Logger';
import { getSyllableStringForXYZ } from 'syllabary-utils';

let NavQueue = {

	queue: [],
	add: (x, y, z) => {
		NavQueue.queue.unshift({[x+"-"+y+"-"+z]: getSyllableStringForXYZ(x,y,z)});
		if (NavQueue.queue.length > Config.navQueueLength) {
			NavQueue.queue.pop();
		}
		Logger.debug("Current NavQueue", NavQueue.queue);
	},
	includes: (x, y, z) => {
	  for (let i in NavQueue.queue) {
	    if (NavQueue.queue[i][x+'-'+y+'-'+z]) return true;
    }
    return false;
	}
};

export default NavQueue;
