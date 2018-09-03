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
	this.errors = {};
};

/*
 * WebAudioAPISoundManager Prototype
 */
WebAudioAPISoundManager.prototype = {

  syncStream: function(node){ // should be done by api itself. and hopefully will.
    var buf8 = new Uint8Array(node.buf);
    buf8.indexOf = Array.prototype.indexOf;
    var i=node.sync, b=buf8;
    while(1) {
      node.retry++;
      i=b.indexOf(0xFF,i); if(i==-1 || (b[i+1] & 0xE0 == 0xE0 )) break;
      i++;
    }
    if(i!=-1) {
      var tmp=node.buf.slice(i); //carefull there it returns copy
      delete(node.buf); node.buf=null;
      node.buf=tmp;
      node.sync=i;
      return true;
    }
    return false;
  },

  decode: function(node) {
    var self = this;
    try{
      self.context.decodeAudioData(node.buf,
        function(decoded){
          self.bufferList[node.url] = decoded;
          self.errors[node.url] = undefined;
        },
        function(){ // only on error attempt to sync on frame boundary
          console.info("Audio decoding problem -- re-syncing", node.url);
          if(self.syncStream(node)) {
            self.decode(node);
          }
        });
    } catch(e) {
      console.error('Audio decoding exception', e.message);
      self.errors[node.url] = 'decode';
    }
  },

	addSound: function (url) {
		// Load buffer asynchronously
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";

		var self = this;

		request.onload = function () {
		  if (request.status != 200) {
        console.error(`Failed to load ${url}`);
        self.errors[url] = 'load';
        return false;
      }
		  var node = {
        url: url,
        buf: request.response,
        sync: 0,
        retry: 0
      };
      self.decode(node);
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
		else if (this.manager.errors[this.url]) {
		  this.onEnd();
    }
    else {
      setTimeout(function(){ that.play(); }, 10);
    }
	},

	pause: function() {
	  this.pausedElapsedTime = this.getElapsedTime();
		this.manager.pause();
	},

	resume: function() {
	  this.startTime = new Date((new Date()).getTime() - (this.pausedElapsedTime * 1000));
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

	getElapsedTime() {
		if (!this.startTime) { return 0; }
		let elapsedTime = ((new Date()).getTime() - this.startTime.getTime()) / 1000;
		return elapsedTime;
	},

	getPercentCompleted: function() {
		return this.getBuffer() ? (this.getElapsedTime() / this.getDuration()) * 100 : 0;
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
