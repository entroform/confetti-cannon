import Util from './util';
import Vector2 from './vector2';

var POINTER_DRAG_EVENT_MANAGER_DEFAULT_CONFIG = {
  target: undefined,
  keepHistory: true,

  condition: function() {
    return true;
  },

  onEvent: function() {},

  onStart: function() {},
  onDrag: function() {},
  onEnd: function() {},
  onCancel: function() {},
};

var PointerDragEventManager = function(config) {
  this.init(config);
};

PointerDragEventManager.prototype = {
  init(config) {
    this.config = Util.objectAssign({}, POINTER_DRAG_EVENT_MANAGER_DEFAULT_CONFIG);
    this.setConfig(config);

    this.isActive = false;
    this.isTouch = false;
    this.touchIdentifier = 0;

    this.history = [];

    this.listen();
  },
  setConfig: function(config) {
    if (typeof config === 'object') Util.objectAssign(this.config, config);
  },
  createMousePointerDragEvent: function(type, event) {
    return {
      event: event,
      isTouch: false,
      position: new Vector2(event.clientX, event.clientY),
      target: event.target,
      time: Date.now(),
      type: type,
    };
  },
  eventHandlerMouseDown: function(event) {
    if (this.isActive === false && this.config.condition(event, this) === true) {
      console.log('he');
      this.isActive = true;
      this.isTouch = false;
      this.config.onEvent(event, this);
      var pointerEvent = this.createMousePointerDragEvent('down', event);
      if (this.config.keepHistory === true) {
        this.history = [];
        this.history.push(pointerEvent);
      }
      this.config.onStart(pointerEvent, this);
    }
  },
  eventHandlerMouseMove: function(event) {
    if (this.isActive === true) {
      this.config.onEvent(event, this);
      var pointerEvent = this.createMousePointerDragEvent('drag', event);
      if (this.config.keepHistory === true) this.history.push(pointerEvent);
      this.config.onDrag(pointerEvent, this);
    }
  },
  eventHandlerMouseUp: function(event) {
    if (this.isActive === true) {
      this.config.onEvent(event, this);
      var pointerEvent = this.createMousePointerDragEvent('up', event);
      if (this.config.keepHistory === true) this.history.push(pointerEvent);
      this.config.onEnd(pointerEvent, this);
      this.end();
    }
  },
  eventHandlerMouseLeave: function(event) {
    if (this.isActive === false) {
      this.config.onEvent(event, this);
      var pointerEvent = this.createMousePointerDragEvent('cancel', event);
      if (this.config.keepHistory === true) this.history.push(pointerEvent);
      this.config.onCancel(pointerEvent, this);
      this.end();
    }
  },
  createTouchPointerDragEvent: function(type, event, touch) {
    return {
      event: event,
      identifier: touch.identifier,
      isTouch: true,
      position: new Vector2(touch.clientX, touch.clientY),
      target: touch.target,
      time: Date.now(),
      touch: touch,
      type: type,
    };
  },
  eventHandlerTouchStart: function(event) {
    if (this.isActive === false && this.config.condition(event, this) === true) {
      this.isActive = true;
      this.isTouch = true;
      this.config.onEvent(event, this);
      this.touchIdentifier = event.changedTouches[0].identifier;
      var pointerEvent = this.createTouchPointerDragEvent('down', event, event.changedTouches[0]);
      if (this.config.keepHistory === true) {
        this.history = [];
        this.history.push(pointerEvent);
      }
      this.config.onStart(pointerEvent, this);
    }
  },
  eventHandlerTouchMove: function(event) {
    if (this.isActive === true) {
      this.config.onEvent(event, this);
      Array.from(event.changedTouches).forEach(touch => {
        if (touch.identifier === this.touchIdentifier) {
          var pointerEvent = this.createTouchPointerDragEvent('drag', event, touch);
          if (this.config.keepHistory === true) this.history.push(pointerEvent);
          this.config.onDrag(pointerEvent, this);
        }
      });
    }
  },
  eventHandlerTouchEnd: function(event) {
    if (this.isActive === true) {
      this.config.onEvent(event, this);
      Array.from(event.changedTouches).forEach(touch => {
        if (touch.identifier === this.touchIdentifier) {
          var pointerEvent = this.createTouchPointerDragEvent('up', event, touch);
          if (this.config.keepHistory === true) this.history.push(pointerEvent);
          this.config.onEnd(pointerEvent, this);
        }
      });
      this.end();
    }
  },
  eventHandlerTouchCancel: function(event) {
    if (this.isActive === true) {
      this.config.onEvent(event, this);
      Array.from(event.changedTouches).forEach(touch => {
        if (touch.identifier === this.touchIdentifier) {
          var pointerEvent = this.createTouchPointerDragEvent('cancel', event, touch);
          if (this.config.keepHistory === true) this.history.push(pointerEvent);
          this.config.onCancel(pointerEvent, this);
        }
      });
      this.end();
    }
  },
  end: function() {
    this.touchIdentifier = 0;
    this.isActive = false;
  },
  listen: function() {
    if (Util.isHTMLElement(this.config.target) === true) {
      // Listen Mouse Events
      this.config.target.addEventListener('mousedown', this.eventHandlerMouseDown.bind(this));
      window.addEventListener('mousemove', this.eventHandlerMouseMove.bind(this));
      window.addEventListener('mouseup', this.eventHandlerMouseUp.bind(this));
      document.body.addEventListener('mouseleave', this.eventHandlerMouseLeave.bind(this));

      // Listen to Touch events.
      this.config.target.addEventListener('touchstart', this.eventHandlerTouchStart.bind(this));
      window.addEventListener('touchmove', this.eventHandlerTouchMove.bind(this));
      window.addEventListener('touchend', this.eventHandlerTouchEnd.bind(this));
      window.addEventListener('touchcancel', this.eventHandlerTouchCancel.bind(this));
    }
  },
};

export default PointerDragEventManager;
