'use strict';

import Poem from 'Poem';
import Glyph from 'Glyph';
import SyllableAudio from 'SyllableAudio';

export default class Syllable {

	constructor(initialConsonant, vowel, finalConsonant) {
		this.poem = new Poem(initialConsonant, vowel, finalConsonant);
		this.glyph = new Glyph(initialConsonant, vowel, finalConsonant);
		this.audio = new SyllableAudio(initialConsonant, vowel, finalConsonant);
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

	resume() {
		this.audio.resume();
	}
}

