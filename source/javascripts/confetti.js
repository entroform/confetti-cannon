import Util from './util';
import Vector2 from './vector2';

// @Confetti
var CONFETTI_DEFAULT_CONFIG = {
  colorChoices: ['red', 'green', 'blue', 'white'],
  radius: 20,
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

    this.angle = 0;
    this.angleVelocity = 0;
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
    // this.angleVelocity = constrain(angleVelocity, [-0.1, 0.1]);
    this.angle += this.angleVelocity;
    return this;
  },
  draw: function(context) {
    context.beginPath();
    context.arc(
      this.position.x,
      this.position.y,
      this.config.radius,
      0,
      Math.PI * 2
    );
    context.fillStyle = this.config.color;
    context.fill();
  },
}

export default Confetti;