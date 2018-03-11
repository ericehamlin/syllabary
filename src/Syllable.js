'use strict';

import Poem from './Poem.js';
import Glyph from './Glyph.js';
import SyllableAudio from './SyllableAudio.js';

export default class Syllable {

	constructor(x, y, z) {
		this.poem = new Poem(x,y,z);
		this.glyph = new Glyph(x,y,z);
		this.audio = new SyllableAudio(x,y,z);
	}

	setGlyphData(data) {
		this.glyph.setData(data);
	}

	play() {
		return new Promise((resolve, reject) => {
			let poemPromise = this.poem.display();
			poemPromise.then(() => {
				let audioPromise = this.audio.play();
				audioPromise.then(() => {
					resolve();
				});
			});
		});
	}

	pause() {
		this.audio.pause();
	}
}

