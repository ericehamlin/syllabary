'use strict';

import Syllabary from 'Syllabary';
import Config from 'Config';

let NavQueue = {

	queue: [],
	add: (x, y, z) => {
		NavQueue.queue.unshift({[x+"-"+y+"-"+z]: Syllabary.getSyllableStringForXYZ(x,y,z)});
		if (NavQueue.queue.length > Config.navQueueLength) {
			NavQueue.queue.pop();
		}
		console.debug("Current NavQueue", NavQueue.queue);
	},
	includes: (x, y, z) => {
	  for (let i in NavQueue.queue) {
	    if (NavQueue.queue[i][x+'-'+y+'-'+z]) return true;
    }
    return false;
	}
};

export default NavQueue;
