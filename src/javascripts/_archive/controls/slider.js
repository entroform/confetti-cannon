import Util from '../util';
import PointerDragEventManager from '../pointerDragEventManager';

var SLIDER_CONTROL_DEFAULT_CONFIG = {
  trackElement: undefined,
  knobElement: undefined,
  valueElement: undefined,

  range: [0, 1],
  listenToKnobOnly: false,

  onInit: function() {},
  onActivate: function() {},
  onDeactivate: function() {},
  onUpdate: function() {},
  moveKnob: function(knob, left) {
    knob.style.transform = `translateX(${left}px)`;
  },
};

var SliderControl = function(config) {
  this.init(config);
};

SliderControl.prototype = {
  init: function(config) {
    this.config = Util.objectAssign({}, SLIDER_CONTROL_DEFAULT_CONFIG);
    this.setConfig(config);

    this.isActive = false;

    this.knobLeftOffset = 0;
    this.pointerDragEventManager = undefined;

    this._value = 0;

    this.config.onInit(this);
    this.config.onUpdate(this);

    this.pointerDragEventManager = new PointerDragEventManager();
    this.listen();
  },
  setConfig: function(config) {
    if (typeof config === 'object') Object.assign(this.config, config);
  },
  setValue: function(value) {
    var knobElement = this.config.knobElement;
    var trackElement = this.config.trackElement;

    var trackRect = trackElement.getBoundingClientRect();
    var knobRect = knobElement.getBoundingClientRect();

    var left = Util.modulate(value, this.config.range, [0, trackRect.width - knobRect.width]);
    this.config.moveKnob(knobElement, left);
    this._value = Util.modulate(value, this.config.range, 1);
    this.config.onUpdate(this);
  },
  getValue: function() {
    return Util.modulate(this._value, 1, this.config.range);
  },
  update: function() {
    var knobElement = this.config.knobElement;
    var trackElement = this.config.trackElement;

    var trackRect = trackElement.getBoundingClientRect();
    var knobRect = knobElement.getBoundingClientRect();

    var left = Util.modulate(this._value, 1, [0, trackRect.width - knobRect.width]);
    this.config.moveKnob(knobElement, left);
    this.config.onUpdate(this);
  },
  eventHandlerStart: function(pointerEvent) {
    if (
      this.isActive === false &&
      Util.isHTMLElement(this.config.knobElement) === true &&
      Util.isHTMLElement(this.config.trackElement) === true
    ) {
      var knobElement = this.config.knobElement;
      var trackElement = this.config.trackElement;

      if (
        this.config.listenToKnobOnly === false &&
        pointerEvent.target === this.config.trackElement
      ) {
        var knobRect = knobElement.getBoundingClientRect();
        var trackRect = trackElement.getBoundingClientRect();
        // Check left edge
        if (
          pointerEvent.position.x - trackRect.left >= 0 &&
          pointerEvent.position.x - trackRect.left <= knobRect.width
        ) {
          this._value = 0;
          this.config.moveKnob(knobElement, 0);
          this.config.onUpdate(this);
          // Check right edge.
        } else if (
          pointerEvent.position.x - trackRect.left <= trackRect.width &&
          pointerEvent.position.x - trackRect.left >= trackRect.width - knobRect.width
        ) {
          this._value = 1;
          this.config.moveKnob(knobElement, trackRect.width - knobRect.width);
          this.config.onUpdate(this);
        } else if (
          pointerEvent.position.x - trackRect.left >= 0 &&
          pointerEvent.position.x - trackRect.left <= trackRect.width
        ) {
          var left = pointerEvent.position.x - trackRect.left - knobRect.width / 2;
          this._value = Util.modulate(left, [0, trackRect.width - knobRect.width], 1, true);
          this.config.moveKnob(knobElement, left);
          this.config.onUpdate(this);
        }
      }

      if (
        this.config.listenToKnobOnly === false ||
        (this.config.listenToKnobOnly === true &&
          Util.hasAncestor(pointerEvent.target, knobElement) === true)
      ) {
        this.isActive = true;
        const knobRect = knobElement.getBoundingClientRect();
        this.knobLeftOffset = pointerEvent.position.x - knobRect.left;
        this.config.onActivate(this);
      }
    }
  },
  eventHandlerDrag: function(pointerEvent) {
    if (this.isActive === true) {
      const knobElement = this.config.knobElement;
      const trackElement = this.config.trackElement;
      const trackRect = trackElement.getBoundingClientRect();
      const knobRect = knobElement.getBoundingClientRect();
      let left = pointerEvent.position.x - this.knobLeftOffset - trackRect.left;
      if (left + knobRect.width >= trackRect.width) left = trackRect.width - knobRect.width;
      if (left < 0) left = 0;
      this._value = Util.modulate(left, [0, trackRect.width - knobRect.width], 1, true);
      this.config.moveKnob(knobElement, left);
      this.config.onUpdate(this);
    }
  },
  eventHandlerEnd: function() {
    if (this.isActive === true) {
      this.config.onDeactivate(this);
      this.isActive = false;
    }
  },
  listen: function() {
    if (Util.isHTMLElement(this.config.trackElement) === true) {
      this.pointerDragEventManager = new PointerDragEventManager({
        onEvent: function(event) {
          event.preventDefault();
        },
        keepHistory: false,
        target: this.config.trackElement,
        onStart: this.eventHandlerStart.bind(this),
        onDrag: this.eventHandlerDrag.bind(this),
        onEnd: this.eventHandlerEnd.bind(this),
        onCancel: this.eventHandlerEnd.bind(this),
      });
    }
  },
};

export default SliderControl;
