'use strict';

const EventMixin = {
  addEventListener: function(type, listener) {
    this.listeners = this.listeners === undefined ? [] : this.listeners;
    this.listeners.push({type:type, listener:listener});
  },

  dispatchEvent: function(event) {
    for (let index in this.listeners) {
      if (event.type == this.listeners[index].type) {
        this.listeners[index].listener(event);
      }
    }
  }
};

export default EventMixin;