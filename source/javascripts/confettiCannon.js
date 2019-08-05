import {
  Animation,
  DOMUtil,
  Num,
  Point,
  Util,
  Vector2,
} from '@nekobird/rocket';

import Confetti from './confetti';

const CONFETTI_CANNON_DEFAULT_CONFIG = {
  // Canvas Settings
  parentElement: null,
  resolutionMultiplier: 1,
  zIndex: 0,
  prepareCanvas: (canvas, context) => {},

  // Confetti settings
  colorChoices: ['#80EAFF', '#FF0055', '#00FFAA', '#FFFF00'],
  widthRange: [2, 8],
  heightRange: [2, 10],
  lifeSpanRange: [100, 200],

  // Cannon Settings
  // Warning firePosition is relative to canvas.
  firePosition: new Vector2(),
  updateFirePosition: () => false,

  numberOfConfetti: 500,
  delay: 0,
  angle: 3 * Math.PI / 2,
  blastArc: Math.PI / 2,
  powerRange: [2, 40],

  // Environment Settings
  gravity: 1,
  frictionCoefficient: 0.1,
  dragCoefficient: 0,
  simplexZoomMultiplierRange: [80, 100],
  simplexOffsetMultiplier: 100,

  // Hooks
  beforeFire: () => {},
  onFire: () => {},
  onComplete: () => {},
};

class ConfettiCannon {

  // 1) Initialize properties and stuff.
  constructor(config) {
    this.config = Object.assign({}, CONFETTI_CANNON_DEFAULT_CONFIG);
    this.setConfig(config);

    this.isActive = false;
    this.confetti;
    this.animation;
    this.updateCount = 0;
  }

  // 2) Set config.
  setConfig(config) {
    if (typeof config === 'object') Object.assign(this.config, config);
    if (this.config.numberOfConfetti < 0) this.config.numberOfConfetti = 0;
    if (this.config.resolutionMultiplier < 1) this.config.resolutionMultiplier = 1;
    if (this.config.delay < 0) this.config.delay = 0;
  }

  // 3) Trigger Start.
  fire() {
    this.setup();
    this.begin();
  }

  // 4) Setup target vectors, initialize coin objects, and create canvas.
  setup(callback) {
    if (this.isActive === false) {
      this.isActive = true;
      this.createCanvas(callback);
      this.populate();
    }
  }

  // 7) Prepare, calculate, and initialize confetti objects.
  populate() {
    this.confetti = [];
    for (let i = 0; i < this.config.numberOfConfetti; i++) {
      const config = this.generateConfettiConfig();
      this.confetti.push(new Confetti(config));
    }
  }

  // 8) This factory function generates config for each coin object.
  generateConfettiConfig() {
    return {
      color: Util.randomChoice(this.config.colorChoices),
      life: Num.modulate(Math.random(), 1, this.config.lifeSpanRange),
      startPosition: new Vector2().equals(this.config.firePosition),
      startVelocity: new Vector2(1, 1)
        .normalize()
        .rotateTo(this.config.angle)
        .rotateBy(Num.modulate(Math.random(), 1, [-this.config.blastArc / 2, this.config.blastArc / 2]))
        .multiply(Num.modulate(Math.random(), 1, this.config.powerRange)),

      width: Num.modulate(Math.random(), 1, this.config.widthRange),
      height: Num.modulate(Math.random(), 1, this.config.heightRange),
      dragCoefficient: this.config.dragCoefficient,

      simplexZoomMultiplier: Num.modulate(Math.random(), 1, this.config.simplexZoomMultiplierRange),
      simplexXOffset: Math.random() * this.config.simplexOffsetMultiplier,
      simplexYOffset: Math.random() * this.config.simplexOffsetMultiplier,
    };
  }

  // 9) Create canvas element and calculate offset. Takes in a callback (begin method).
  createCanvas() {
    if (typeof this.canvasElement === 'undefined') {
      this.canvasElement = document.createElement('CANVAS');

      this.canvasElement.style.position = 'fixed';
      this.canvasElement.style.zIndex = this.config.zIndex.toString();

      this.canvasElement.style.left = '0px';
      this.canvasElement.style.top = '0px';

      this.setCanvasDimensionToWindow();
      this.config.prepareCanvas(this.canvasElement, this);

      this.context = this.canvasElement.getContext('2d');

      const { parentElement } = this.config;
      if (DOMUtil.isHTMLElement(parentElement) === true) {
        if (parentElement.childElementCount > 0) {
          parentElement.insertBefore(this.canvasElement, parentElement.childNodes[0]);
        } else {
          parentElement.appendChild(this.canvasElement);
        }
      }

      const result = this.config.updateFirePosition(this);
      if (Point.isPointLike(result) === true)
        this.config.firePosition.equals(result);
    }
  }

  setCanvasDimensionToWindow() {
    this.setCanvasDimension(window.innerWidth, window.innerHeight);
  }

  setCanvasDimension(width, height) {
    const { resolutionMultiplier } = this.config;
    this.canvasElement.style.width = width + 'px';
    this.canvasElement.style.height = height + 'px';
    this.canvasElement.width = width * resolutionMultiplier;
    this.canvasElement.height = height * resolutionMultiplier;
  }

  getElementCenterVectorRelativeToCanvas(element) {
    const canvasRect = this.canvasElement.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const x = (elementRect.left - canvasRect.left) + (elementRect.width / 2);
    const y = (elementRect.top - canvasRect.top) + (elementRect.height / 2);
    return new Vector2(x, y);
  }

  // 10) This is called once canvasElement is defined and is in the DOM. Start animation!
  begin() {
    if (this.isActive === true) {
      this.startAnimation();
      if (this.confetti.length === 0) this.end();
    }
  }

  // 11) Initialize animation object and start it.
  startAnimation() {
    this.updateCount = 0;
    this.config.beforeFire(this);
    this.animation = new Animation({
      delay: this.config.delay / 1000,
      numberOfIterations: 'infinite',
      onStart: () => this.config.onFire(this),
      onTick: t => this.update(),
    });
    this.animation.play();
  }

  // 12) Loop through each coins and draw them.
  update() {
    this.clearCanvas();

    const deadConfetti = 0;
    const gravity = new Vector2(0, this.config.gravity);
    for (let i = 0; i < this.confetti.length; i++) {
      if (this.confetti[i].isAlive === true) {
        this.confetti[i].applyFriction(this.config.frictionCoefficient);
        this.confetti[i].applyDrag();
        this.confetti[i].applyForce(gravity);
        this.confetti[i].applyLateralEntropy(this.updateCount);
        this.confetti[i].update();
        this.confetti[i].draw(this.context, this.config.resolutionMultiplier);

        if (this.confetti[i].position.y + this.confetti[i].config.height > this.canvasElement.height)
          this.confetti[i].die();
      } else {
        deadConfetti++;
      }
    }
    this.updateCount++;
    if (deadConfetti === this.confetti.length) this.end();
  }

  // 13) Helper function to clear canvas every frame.
  clearCanvas() {
    if (typeof this.canvasElement === 'object')
      this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  }

  // 15) This is called after the last coin reached the end. Or if numberOfCoins is 0. Sayonara!
  end() {
    this.clearCanvas();
    this.animation.stop();
    this.canvasElement.remove();
    this.canvasElement = undefined;
    this.confetti = [];
    this.isActive = false;
    this.config.onComplete();
  }
}

export default ConfettiCannon;