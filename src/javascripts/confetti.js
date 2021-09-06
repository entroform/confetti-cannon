import {
  clamp,
} from './utils';
import Vector2 from './vector2';
import SimplexNoise from './noise';

const CONFETTI_DEFAULT_CONFIG = {
  color: 'white',
  height: 20,
  width: 20,
  mass: 1,
  life: 100,
  startPosition: new Vector2(),
  startVelocity: new Vector2(),
  frictionCoefficient: 0,
  dragCoefficient: 0,
  simplexZoomMultiplier: 100,
  simplexXOffset: 0,
  simplexYOffset: 0,
};

export default class Confetti {
  constructor(config) {
    this.life = 0;

    this.config = { ...CONFETTI_DEFAULT_CONFIG };
    this.setConfig(config);

    this.isAlive = true;

    this.position = new Vector2().equals(this.config.startPosition);
    this.velocity = new Vector2().equals(this.config.startVelocity);
    this.acceleration = new Vector2();

    this.angle = 0.1;
    this.angleVelocity = 0.4;
    this.angleAcceleration = 0;

    this.simplex = new SimplexNoise();
  }

  setConfig(config) {
    if (typeof config === 'object') {
      Object.assign(this.config, config);
    }

    this.life = this.config.life;
  }

  applyFriction(frictionCoefficient) {
    let friction = this.config.frictionCoefficient;

    if (typeof frictionCoefficient === 'number') {
      friction = frictionCoefficient;
    }

    if (friction !== 0) {
      const force = this.velocity
        .clone()
        .multiply(-1)
        .normalize()
        .multiply(friction);

      this.applyForce(force);
    }
  }

  applyDrag() {
    const speed = this.velocity.magnitude();
    const { dragCoefficient } = this.config;
    const dragMagnitude = dragCoefficient * speed * speed;
    const force = this.velocity
      .clone()
      .multiply(-1)
      .normalize()
      .multiply(dragMagnitude);
    this.applyForce(force);
  }

  applyLateralEntropy(t) {
    const { simplexZoomMultiplier, simplexXOffset, simplexYOffset } = this.config;
    const zoom = simplexZoomMultiplier;
    if (zoom === 0) {
      zoom = 1;
    }
    const x = this.simplex.noise(simplexXOffset + t / zoom, simplexYOffset);
    const lateralOscillation = new Vector2(x, 0);
    this.applyForce(lateralOscillation);
  }

  applyForce(force) {
    force.divide(this.config.mass);
    this.acceleration.add(force);
  }

  update() {
    this.life--;

    if (this.life <= 0) {
      this.die();
    }
    this.velocity.add(this.acceleration).limit(this.config.maximumSpeed);
    this.position.add(this.velocity);
    this.acceleration.multiply(0);

    this.angleVelocity += this.angleAcceleration;
    this.angleVelocity = clamp(this.angleVelocity, -0.1, 0.1);

    this.angle += this.angleVelocity;
  }

  draw(context, m) {
    const { width, height, color } = this.config;

    const x = this.position.x * m;
    const y = this.position.y * m;

    const w = width * m;
    const h = height * m;

    context.save();

    context.translate(x, y);
    context.rotate(this.angle);
    context.transform(1, 0, 0, 1, 0, 0);
    context.translate(-x, -y);

    context.beginPath();
    context.moveTo(x - w / 2, y - h / 2);
    context.lineTo(x + w / 2, y - h / 2);
    context.lineTo(x + w / 2, y + h / 2);
    context.lineTo(x - w / 2, y + h / 2);
    context.fillStyle = color;
    context.fill();

    context.restore();
  }

  die() {
    this.life = 0;
    this.isAlive = false;
  }
}

