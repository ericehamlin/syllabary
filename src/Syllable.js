'use strict';

import Poem from './Poem.js';
import Glyph from './Glyph.js';
import SyllableAudio from './SyllableAudio.js';

export default class Syllable {

	constructor(initialConsonant, vowel, finalConsonant, x, y, z) {
		this.playId = 0;
		this.poem = new Poem(initialConsonant, vowel, finalConsonant);
		this.glyph = new Glyph(initialConsonant, vowel, finalConsonant, x, y, z);
		this.audio = new SyllableAudio(initialConsonant, vowel, finalConsonant);
	}

	setGlyphData(data) {
		this.glyph.setData(data);
	}

	play() {
		// Cancelling changes the id, which stops the steps below from going on.
		const playId = ++this.playId;
		const isCurrent = () => playId === this.playId;
		return new Promise((resolve, reject) => {
			let poemPromise = this.poem.display(isCurrent);
			poemPromise.then(() => {
				if (!isCurrent()) { return; }
				let audioPromise = this.audio.play();
				audioPromise.then(() => {
					if (isCurrent()) { resolve(); }
				});
			});
		});
	}

	/**
	 * Stop playing: the audio stops at once and nothing more is shown or played.
	 * The poem is left on screen for the caller to fade out.
	 */
	cancel() {
		this.playId++;
		this.audio.cancel();
	}

	pause() {
		this.audio.pause();
	}

	resume() {
		this.audio.resume();
	}
}

