'use strict';

try {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	window.audioContext = new window.AudioContext();
} catch (e) {
	console.log("No Web Audio API support");
}

/*
 * WebAudioAPISoundManager Constructor
 */
var WebAudioAPISoundManager = function (context) {
	this.context = context;
	this.bufferList = {};
	this.playingSounds = {};
};

/*
 * WebAudioAPISoundManager Prototype
 */
WebAudioAPISoundManager.prototype = {
	addSound: function (url) {
		// Load buffer asynchronously
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";

		var self = this;

		request.onload = function () {
			// Asynchronously decode the audio file data in request.response
			self.context.decodeAudioData(
				request.response,

				function (buffer) {
					if (!buffer) {
						alert('error decoding file data: ' + url);
						return;
					}
					self.bufferList[url] = buffer;
				});
		};

		request.onerror = function () {
			alert('BufferLoader: XHR error');
		};

		request.send();
	},
	stopSoundWithUrl: function(url) {
		if(this.playingSounds.hasOwnProperty(url)){
			for(var i in this.playingSounds[url]){
				if(this.playingSounds[url].hasOwnProperty(i))
					this.playingSounds[url][i].noteOff(0);
			}
		}
	},
	pause: function() {
		this.context.suspend();
	},
	resume: function() {
		this.context.resume();
	}
};

/*
 * WebAudioAPISound Constructor
 */
var WebAudioAPISound = function (url, options) {
	this.settings = {
		loop: false
	};


	for(var i in options){
		if(options.hasOwnProperty(i))
			this.settings[i] = options[i];
	}

	this.url = url;
	window.webAudioAPISoundManager = window.webAudioAPISoundManager || new WebAudioAPISoundManager(window.audioContext);
	this.manager = window.webAudioAPISoundManager;
	this.manager.addSound(this.url);
};

/*
 * WebAudioAPISound Prototype
 */
WebAudioAPISound.prototype = {
	play: function () {
		let that = this;
		var buffer = this.manager.bufferList[this.url];

		//Only play if it's loaded yet
		if (typeof buffer !== "undefined") {
			var source = this.makeSource(buffer);
			source.loop = this.settings.loop;
			source.start();
			source.addEventListener('ended', () => {
				that.onEnd();
			});
			if(!this.manager.playingSounds.hasOwnProperty(this.url))
				this.manager.playingSounds[this.url] = [];
			this.manager.playingSounds[this.url].push(source);
			this.startTime = new Date();
		}
		else {
			setTimeout(function(){ that.play(); }, 10);
		}
	},
	pause: function() {
		this.manager.pause();
	},
	resume: function() {
		this.manager.resume();
	},
	stop: function () {
		this.manager.stopSoundWithUrl(this.url);
	},
	getVolume: function () {
		return this.translateVolume(this.volume, true);
	},
	//Expect to receive in range 0-100
	setVolume: function (volume) {
		this.volume = this.translateVolume(volume);
	},
	translateVolume: function(volume, inverse){
		return inverse ? volume * 100 : volume / 100;
	},
	getBuffer: function() {
		return this.manager.bufferList[this.url];
	},
	getDuration: function() {
		return this.getBuffer().duration;
	},
	getCurrentTime() {
		if (!this.startTime) { return 0; }
		let currentTime = ((new Date()).getTime() - this.startTime.getTime()) / 1000;
		console.log(currentTime);
		return currentTime;
	},
	getPercentCompleted: function() {
		return this.getBuffer() ? (this.getCurrentTime() / this.getDuration()) * 100 : 0;
	},
	makeSource: function (buffer) {
		var source = this.manager.context.createBufferSource();
		var gainNode = this.manager.context.createGain();
		gainNode.gain.value = this.volume ? this.volume : 0.5;
		source.buffer = buffer;
		source.connect(gainNode);
		gainNode.connect(this.manager.context.destination);
		return source;
	}
};

export default WebAudioAPISound;