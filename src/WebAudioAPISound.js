'use strict';
import Syllabary from './Syllabary.js';
import Config from './Config.js';

try {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	window.audioContext = new window.AudioContext();
} catch (e) {
	console.error("No Web Audio API support");
}

const MAX_DECODE_ATTEMPTS = 5;
const AUDIO_END_GRACE_SECONDS = 5;

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
    node.attempts = (node.attempts || 0) + 1;
    try{
      // decodeAudioData detaches the buffer it is given, so give it a copy and keep
      // the original in case it has to be re-synced and decoded again.
      var promise = self.context.decodeAudioData(node.buf.slice(0),
        function(decoded){
          self.bufferList[node.url] = decoded;
          self.errors[node.url] = undefined;
        },
        function(){ // only on error attempt to sync on frame boundary
          console.info("Audio decoding problem -- re-syncing", node.url);
          if(node.attempts < MAX_DECODE_ATTEMPTS && self.syncStream(node)) {
            self.decode(node);
          }
          else {
            console.error('Audio decoding failed', node.url);
            self.errors[node.url] = 'decode';
          }
        });
      // Newer browsers also reject the promise, which is already handled above.
      if (promise && promise.catch) { promise.catch(function() {}); }
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

		// Without these a failed request is never reported, and whatever is waiting
		// for the sound waits forever.
		var fail = function (reason) {
			console.error(`Failed to load ${url} (${reason})`);
			self.errors[url] = 'load';
		};
		request.onerror = function () { fail('network error'); };
		request.onabort = function () { fail('aborted'); };
		request.ontimeout = function () { fail('timed out'); };

		request.send();
	},

	stopSoundWithUrl: function(url) {
		if(this.playingSounds.hasOwnProperty(url)){
			for(var i in this.playingSounds[url]){
				if(this.playingSounds[url].hasOwnProperty(i))
					this.playingSounds[url][i].stop(0);
			}
		}
	},

	pause: function() {
		this.paused = true;
		this.context.suspend();
	},

	resume: function() {
		this.paused = false;
		this.context.resume();
	},

	// The browser may leave the context suspended (iOS does until a tap, and again
	// after a call or backgrounding). Nothing plays or ends while it is, so bring
	// it back unless it was paused on purpose.
	resumeIfNeeded: function() {
		if (this.paused || this.context.state === 'running') { return; }
		var promise = this.context.resume();
		if (promise && promise.catch) { promise.catch(function() {}); }
	},

	// Must be called from a tap or click. iOS only lets audio start after one.
	unlock: function() {
		var context = this.context;
		this.resumeIfNeeded();
		var source = context.createBufferSource();
		source.buffer = context.createBuffer(1, 1, 22050);
		source.connect(context.destination);
		source.start(0);
	}
};

function getSoundManager() {
	window.webAudioAPISoundManager = window.webAudioAPISoundManager || new WebAudioAPISoundManager(window.audioContext);
	return window.webAudioAPISoundManager;
}

var unlockListening = false;

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
	this.active = [];
	this.manager = getSoundManager();
	this.manager.addSound(this.url);
};

/*
 * WebAudioAPISound Prototype
 */
WebAudioAPISound.prototype = {
  paused: false,
  // Paused on purpose, whether or not the sound has started.
  held: false,

	play: function (fromPoll = false) {
		let that = this;
		// Only one poll for the buffer at a time, so a resume while still loading
		// doesn't start the sound twice.
		if (!fromPoll && this.polling) { return; }
		this.polling = false;

		var buffer = this.manager.bufferList[this.url];

		//Only play if it's loaded yet
		if (typeof buffer !== "undefined") {
			this.waitingSince = null;
			var source = this.makeSource(buffer);
			source.loop = this.settings.loop;
			var finished = false;
			var watchdog = null;
			var active = null;
			var finish = () => {
				if (finished) { return; }
				finished = true;
				clearInterval(watchdog);
				that.active = that.active.filter((a) => a !== active);
				if (typeof that.onEnd === 'function') { that.onEnd(); }
			};
			// What cancel() needs to undo: stop the source without it reporting an end.
			active = {
				stop: () => {
					finished = true;
					clearInterval(watchdog);
					source.removeEventListener('ended', finish);
					try { source.stop(); } catch (e) {}
				}
			};
			this.active.push(active);
			source.addEventListener('ended', finish);
			if(!this.manager.playingSounds.hasOwnProperty(this.url))
				this.manager.playingSounds[this.url] = [];
			this.manager.playingSounds[this.url].push(source);
      // There is no runController yet while the app is starting, so it can't be paused.
      var paused = () => this.held || (Syllabary.runController && Syllabary.runController.isPaused());
      if (!paused()) {
        this.manager.resumeIfNeeded();
        source.start();
        this.startTime = new Date();
        // If the sound never ends, for example because the browser won't let the
        // context run, carry on as if it had. Time spent paused doesn't count.
        if (!source.loop) {
          var playedMs = 0;
          var last = Date.now();
          watchdog = setInterval(() => {
            var now = Date.now();
            if (!paused() && !this.manager.paused) { playedMs += now - last; }
            last = now;
            if (playedMs > (buffer.duration + AUDIO_END_GRACE_SECONDS) * 1000) {
              console.error(`${this.url} did not finish playing, moving on`);
              try { source.stop(); } catch (e) {}
              finish();
            }
          }, 500);
        }
      }
		}
		else if (this.manager.errors[this.url]) {
			this.waitingSince = null;
		  this.onEnd();
    }
    else {
      // Don't let a sound that never loads hold everything up. Carry on as if it
      // had played. It is not marked as failed, so it still plays if asked again
      // and has loaded by then.
      if (!this.waitingSince) { this.waitingSince = Date.now(); }
      if (Date.now() - this.waitingSince > Config.audioLoadTimeout) {
        console.error(`Gave up waiting for ${this.url}`);
        this.waitingSince = null;
        this.onEnd();
        return;
      }
      this.polling = true;
      this.pollTimer = setTimeout(function(){ that.play(true); }, 10);
    }
	},

	// Stop at once and forget it was playing, without reporting an end. Also stops
	// waiting for the sound to load, so it doesn't start later.
	cancel: function() {
		clearTimeout(this.pollTimer);
		this.polling = false;
		this.waitingSince = null;
		this.active.forEach((a) => a.stop());
		this.active = [];
		this.startTime = null;
		this.pausedElapsedTime = 0;
		// Don't leave the context suspended for whatever plays next.
		if (this.held && this.manager.paused) { this.manager.resume(); }
		this.held = false;
	},

	pause: function() {
	  this.pausedElapsedTime = this.getElapsedTime();
	  // Also stops a sound that hasn't started yet (still loading) from starting.
	  this.held = true;
    if (this.pausedElapsedTime > 0) {
      this.manager.pause();
    }
	},

	resume: function() {
    this.held = false;
    if (this.pausedElapsedTime > 0) {
      this.startTime = new Date((new Date()).getTime() - (this.pausedElapsedTime * 1000));
      this.manager.resume();
    }
    else {
      this.play();
    }
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
		// Time stands still while paused, so whatever follows the audio, such as the
		// scrolling of the poem, stops with it.
		if (this.held) { return this.pausedElapsedTime; }
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

// Call from a tap or click. Also keeps resuming the context on later taps, in case
// the browser suspends it again.
WebAudioAPISound.unlock = function () {
	var manager = getSoundManager();
	manager.unlock();
	if (!unlockListening) {
		unlockListening = true;
		['touchend', 'click'].forEach(function (type) {
			document.addEventListener(type, function () { manager.resumeIfNeeded(); }, true);
		});
	}
};

export default WebAudioAPISound;
