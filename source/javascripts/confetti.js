import Util from './util';
import Vector2 from './vector2';

// @Confetti
var CONFETTI_DEFAULT_CONFIG = {
  color: 'white',

  height: 20,
  width: 20,

  mass: 1,
  life: 100,

  startPosition: new Vector2(),
  startVelocity: new Vector2(),

  frictionCoefficient: 0,
  dragCoefficient: 0,
};

var Confetti = function(config) {
  this.init(config);
};

Confetti.prototype = {
  // 1) Initialize properties and set config.
  init: function(config) {
    this.config = Util.objectAssign({}, CONFETTI_DEFAULT_CONFIG);
    this.setConfig(config);

    this.isAlive = true;

    // Vector2
    this.position = new Vector2().equals(this.config.startPosition);
    this.velocity = new Vector2().equals(this.config.startVelocity);
    this.acceleration = new Vector2();

    this.angle = 0.1;
    this.angleVelocity = 0.4;
    this.angleAcceleration = 0;
  },
  // 2) Set coin config.
  setConfig: function(config) {
    if (typeof config === 'object') Util.objectAssign(this.config, config);
    this.life = this.config.life;
  },
  applyFriction: function(frictionCoefficient) {
    var friction = typeof frictionCoefficient === 'number' ? frictionCoefficient : this.config.frictionCoefficient;
    if (friction !== 0) {
      var force = this.velocity.clone().multiply(-1).normalize().multiply(friction);
      this.applyForce(force);
    }
  },
  applyDrag: function() {
    var speed = this.velocity.magnitude();
    var dragMagnitude = this.config.dragCoefficient * speed * speed;
    var force = this.velocity.clone().multiply(-1).normalize().multiply(dragMagnitude);
    this.applyForce(force);
  },
  applyForce: function(force) {
    force.divide(this.config.mass);
    this.acceleration.add(force);
    return this;
  },
  update: function() {
    this.life--;
    if (this.life <= 0) this.isAlive = false;
    this.velocity
      .add(this.acceleration)
      .limit(this.config.maximumSpeed);
    this.position.add(this.velocity);
    this.acceleration.multiply(0);

    this.angleVelocity += this.angleAcceleration;
    this.angleVelocity = Util.constrain(this.angleVelocity, [-0.1, 0.1]);
    this.angle += this.angleVelocity;
    return this;
  },
  draw: function(context) {

    var x = this.position.x;
    var y = this.position.y;

    context.save();

    context.translate(x, y);
    context.rotate(this.angle);
    context.transform(1, 0, 0, 1, 0, 0);
    context.translate(-x, -y);

    context.beginPath();
    
    context.moveTo(x, y);
    context.lineTo(x + this.config.width, y);
    context.lineTo(x + this.config.width, y + this.config.height);
    context.lineTo(x, y + this.config.height);

    context.fillStyle = this.config.color;
    context.fill();

    context.restore();
  },
  die: function() {
    this.life = 0;
    this.isAlive = false;
  },
}

export default Confetti;