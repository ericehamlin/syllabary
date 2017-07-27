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
		this.poem.display();
		this.audio.play();
	}
}

