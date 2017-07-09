'use strict';

import PoemText from './PoemText.js';
import PoemAudio from './PoemAudio.js';

export default class Poem {

	constructor(x, y, z) {
		this.poemText = new PoemText(x, y, z);
		this.poemAudio = new PoemAudio(x, y, z);
	}
}
