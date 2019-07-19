import Util from '../util';

var SLIDER_CONTROL_DEFAULT_CONFIG = {
  sliderControlElement: undefined,

  trackClassName: '',
  knobClassName: '',
  valueClassName: '',

  transformValue: function(value) { return value; },

  onInit: function() {},

  onActivate: function() {},
  onDeactivate: function() {},
  onUpdate: function() {},

  moveKnob: function (knob, left) {
    knob.style.transform = 'translateX(' + left + 'px)';
  },
}

var SliderControl = function(config) {
  this.init(config);
}

SliderControl.prototype = {
  init: function(config) {
    this.config = Util.objectAssign({}, SLIDER_CONTROL_DEFAULT_CONFIG);
    this.setConfig(config);

    this.isActive = false;

    this.trackElement = this.config.sliderControlElement.querySelector('.' + this.config.trackClassName);
    this.knobElement  = this.config.sliderControlElement.querySelector('.' + this.config.knobClassName);
    this.valueElement = this.config.sliderControlElement.querySelector('.' + this.config.valueClassName);

    this.mouseKnobLeftOffset = 0;
    this.value = 0;

    this.config.onInit(this);
    this.config.onUpdate(this);

    this.listen();
  },
  setConfig: function(config) {
    if (typeof config === 'object') Util.objectAssign(this.config, config);
  },
  setValue: function(value) {
    if (value < 0) value = 0;
    if (value > 1) value = 1;
    var trackRect = this.trackElement.getBoundingClientRect();
    var knobRect  = this.knobElement.getBoundingClientRect();
    var left = Util.modulate(value, 1, [0, trackRect.width - knobRect.width]);
    this.config.moveKnob(this.knobElement, left);
    this.value = value;
    this.config.onUpdate(this);
  },
  getValue: function() {
    return this.config.transformValue(this.value);
  },
  eventHandlerMouseDown: function(event) {
    if (
      this.isActive === false
      && this.pointIsInKnobElement(event.clientX, event.clientY) === true
    ) {
      this.isActive = true;
      var knobRect = this.knobElement.getBoundingClientRect();
      this.mouseKnobLeftOffset = event.clientX - knobRect.left
      this.config.onActivate(this);
    }
  },
  eventHandlerMouseMove: function(event) {
    if (this.isActive === true) {
      var trackRect = this.trackElement.getBoundingClientRect();
      var knobRect = this.knobElement.getBoundingClientRect();
      var left = event.clientX - this.mouseKnobLeftOffset - trackRect.left;
      if (left + knobRect.width >= trackRect.width) left = trackRect.width - knobRect.width;
      if (left < 0) left = 0;
      this.value = Util.modulate(left, [0, trackRect.width - knobRect.width], 1);
      this.config.moveKnob(this.knobElement, left);
      this.config.onUpdate(this);
    }
  },
  eventHandlerMouseUp: function() {
    if (this.isActive === true) {
      this.config.onDeactivate(this);
      this.isActive = false;
    }
  },
  pointIsInKnobElement: function (x, y) {
    var knobRect = this.knobElement.getBoundingClientRect();
    if (
         (x >= knobRect.left && x <= knobRect.right)
      && (y >= knobRect.top  && y <= knobRect.bottom)
    ) return true;
    return false;
  },
  listen: function() {
    this.knobElement.addEventListener('mousedown', this.eventHandlerMouseDown.bind(this));
    window.addEventListener('mousemove', this.eventHandlerMouseMove.bind(this));
    window.addEventListener('mouseup',   this.eventHandlerMouseUp.bind(this));
  },
};

export default SliderControl;