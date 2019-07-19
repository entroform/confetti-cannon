import Util from './util';
import Vector2 from './vector2';

var CONFETTI_CANNON_INDICATOR_DEFAULT_CONFIG = {
  canvasElement: undefined,
  angle: 0,
  arc: Math.PI / 4,
  getCannonPosition: function() { return new Vector2(); },
};

var ConfettiCannonIndicator = function(config) {
  this.init(config);
}

ConfettiCannonIndicator.prototype = {
  init: function(config) {
    this.config = Util.objectAssign({}, CONFETTI_CANNON_INDICATOR_DEFAULT_CONFIG);
    this.setConfig(config);

    this.context = this.config.canvasElement.getContext('2d');
  },
  setConfig: function(config) {
    if (typeof config === 'object') Util.objectAssign(this.config, config);
  },
  display: function() {
    var position = this.config.getCannonPosition();
    var length = Util.hypotenuse(this.config.canvasElement.offsetWidth, this.config.canvasElement.offsetHeight);
    var target = Vector2.clone(position).rotateTo(this.config.angle).normalize().multiply(length);

    context.save();
    context.moveTo(position.x, position.y);
    context.lineTo(target.x, target, y);
    context.strokeStyle = 'red';
    context.stroke();
    context.restore();
  },
};

export default ConfettiCannonIndicator;
