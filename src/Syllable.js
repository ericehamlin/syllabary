'use strict';


export default class Syllable {

	constructor(x, y, z) {
		this.poem = new Poem(x,y,z);
		this.glyph = new Glyph(x,y,z);
		this.syllableAudio = new SyllableAudio(x,y,z);
		console.log(x,y,z);
	}
}

