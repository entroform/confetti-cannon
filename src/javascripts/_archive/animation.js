import Util from './util';

var ANIMATION_DEFAULT_CONFIG = {
  // Animation duration is in ms.
  // You can also set it to 'forever'
  // if you want it to run indefinitely
  // until stop() is called.
  duration: 1000,
  delay: 0,
  timingFunction: function(t) {
    return t;
  },

  // Hooks.
  onTick: function() {},
  beforeStart: function() {},
  onStart: function() {},
  onComplete: function() {},
};

var Animation = function(config) {
  this.init(config);
};

Animation.prototype = {
  init: function(config) {
    this.config = Util.objectAssign({}, ANIMATION_DEFAULT_CONFIG);
    this.setConfig(config);

    this.rafID;
    this.timeoutID;

    this.isActive = false;
    this.isAnimating = false;

    this.timeStart = 0;
    this.timeEnd = 0;

    this.progress = 0;
  },
  setConfig: function(config) {
    if (typeof config === 'object') Util.objectAssign(this.config, config);
  },
  updateProgress: function() {
    if (typeof this.config.duration === 'number') {
      var now = Date.now();
      this.progress = (now - this.timeStart) / this.config.duration;
      if (this.progress > 1) this.progress = 1;
    } else if (this.config.duration === 'forever') {
      this.progress = 0;
    } else {
      this.progress = 1;
    }
  },
  loop: function() {
    if (this.isAnimating === true) {
      this.updateProgress();
      this.config.onTick(this.config.timingFunction(this.progress));
      if (this.progress < 1) {
        this.continueLoop();
      } else {
        this.stop();
      }
    }
  },
  continueLoop: function() {
    if (this.isAnimating === true) {
      window.cancelAnimationFrame(this.rafID);
      this.rafID = window.requestAnimationFrame(this.loop.bind(this));
    }
  },
  play: function() {
    if (this.isActive === false) {
      this.isActive = true;
      this.config.beforeStart(this);
      this.timeoutID = setTimeout(
        function() {
          this.isAnimating = true;
          this.timeStart = Date.now();
          this.config.onStart(this);
          this.continueLoop();
        }.bind(this),
        this.config.delay,
      );
    }
  },
  stop: function() {
    if (this.isActive === true) {
      window.cancelAnimationFrame(this.rafID);
      clearTimeout(this.timeoutID);
      this.timeEnd = Date.now();
      this.progress = 0;
      this.isAnimating = false;
      this.isActive = false;
      this.config.onComplete(this);
    }
  },
};

export default Animation;
