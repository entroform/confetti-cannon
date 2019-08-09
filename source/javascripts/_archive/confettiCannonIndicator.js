import Util from './util';
import Vector2 from './vector2';

var CONFETTI_CANNON_INDICATOR_DEFAULT_CONFIG = {
  canvasElement: undefined,
  angle: 0,
  arc: Math.PI / 4,
  power: 10,
  getCannonPosition: function() {
    return new Vector2();
  },
};

var ConfettiCannonIndicator = function(config) {
  this.init(config);
};

ConfettiCannonIndicator.prototype = {
  init: function(config) {
    this.config = Util.objectAssign({}, CONFETTI_CANNON_INDICATOR_DEFAULT_CONFIG);
    this.setConfig(config);

    this.context = this.config.canvasElement.getContext('2d');

    this.listen();
  },
  setConfig: function(config) {
    if (typeof config === 'object') Util.objectAssign(this.config, config);
  },
  updateCanvas: function() {
    this.config.canvasElement.width = window.innerWidth;
    this.config.canvasElement.height = window.innerHeight;
  },
  display: function() {
    this.updateCanvas();
    var position = this.config.getCannonPosition();

    var length = Util.hypotenuse(
      this.config.canvasElement.offsetWidth,
      this.config.canvasElement.offsetHeight,
    );
    length = length / 2;

    var target = new Vector2(0, 1)
      .rotateTo(this.config.angle)
      .normalize()
      .multiply(length)
      .add(position);
    var left = new Vector2(0, 1)
      .rotateTo(this.config.angle - this.config.arc / 2)
      .normalize()
      .multiply(length)
      .add(position);
    var right = new Vector2(0, 1)
      .rotateTo(this.config.angle + this.config.arc / 2)
      .normalize()
      .multiply(length)
      .add(position);

    if (this.config.arc !== Math.PI * 2) {
      var gradient = this.context.createLinearGradient(position.x, position.y, target.x, target.y);
      gradient.addColorStop(0, 'hsla(340, 100%, 50%, 0)');
      gradient.addColorStop(1, 'hsla(340, 100%, 50%, 1)');
      this.context.save();
      this.context.beginPath();
      this.context.moveTo(position.x, position.y);
      this.context.lineTo(target.x, target.y);
      this.context.strokeStyle = gradient;
      this.context.stroke();

      var gradient0 = this.context.createLinearGradient(position.x, position.y, right.x, right.y);
      gradient0.addColorStop(0, 'hsla(340, 100%, 50%, 0)');
      gradient0.addColorStop(1, 'hsla(340, 100%, 50%, 1)');
      this.context.beginPath();
      this.context.moveTo(position.x, position.y);
      this.context.lineTo(right.x, right.y);
      this.context.strokeStyle = gradient0;
      this.context.stroke();
      // this.context.restore();

      var gradient1 = this.context.createLinearGradient(position.x, position.y, left.x, left.y);
      gradient1.addColorStop(0, 'hsla(340, 100%, 50%, 0)');
      gradient1.addColorStop(1, 'hsla(340, 100%, 50%, 1)');
      this.context.beginPath();
      this.context.moveTo(position.x, position.y);
      this.context.lineTo(left.x, left.y);
      this.context.strokeStyle = gradient1;
      this.context.stroke();
      // this.context.restore();
    }

    this.context.beginPath();
    if (this.config.arc === Math.PI * 2) {
      this.context.arc(
        position.x,
        position.y,
        Util.modulate(this.config.power, [10, 150], [100, 500]),
        0,
        Math.PI * 2,
      );
    } else {
      this.context.arc(
        position.x,
        position.y,
        Util.modulate(this.config.power, [10, 150], [100, 500]),
        Util.cycleNumber(this.config.angle - this.config.arc / 2, Math.PI * 2),
        Util.cycleNumber(this.config.angle + this.config.arc / 2, Math.PI * 2),
      );
    }
    this.context.strokeStyle = 'hsla(340, 100%, 50%, 0.5)';
    this.context.stroke();
  },
  listen: function() {
    window.addEventListener(
      'resize',
      function() {
        this.updateCanvas();
        this.display();
      }.bind(this),
    );
  },
};

export default ConfettiCannonIndicator;
