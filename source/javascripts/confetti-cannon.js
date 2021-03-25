import Confetti from './confetti';
import Ticker from './ticker';
import {
  generateRandomInteger,
  isHTMLElement,
  prependChild,
  transform,
} from './utils';
import Vector2 from './vector2';
import Viewport from './viewport';

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
  // Warning: firePosition is relative to canvas.
  firePosition: new Vector2(),
  updateFirePosition: () => false,
  numberOfConfetti: 500,
  delay: 0,
  angle: (3 * Math.PI) / 2,
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
  constructor(config) {
    this.config = { ...CONFETTI_CANNON_DEFAULT_CONFIG };
    this.setConfig(config);

    this.isActive = false;

    this.confetti;
    this.ticker;
    this.updateCount = 0;
  }

  setConfig(config) {
    if (typeof config === 'object') {
      Object.assign(this.config, config);
    }

    if (this.config.numberOfConfetti < 0) {
      this.config.numberOfConfetti = 0;
    }

    if (this.config.resolutionMultiplier < 1) {
      this.config.resolutionMultiplier = 1;
    }

    if (this.config.delay < 0) {
      this.config.delay = 0;
    }
  }

  fire() {
    this.setup();
    
    if (!this.isActive) {
      return;
    }

    this.startTicker();

    if (this.confetti.length === 0) {
      this.end();
    }
  }

  setup(callback) {
    if (!this.isActive) {
      this.isActive = true;
      this.createCanvas(callback);
      this.populate();
    }
  }

  populate() {
    this.confetti = [];

    for (let i = 0; i < this.config.numberOfConfetti; i++) {
      const config = this.generateConfettiConfig();
      console.log(config);
      this.confetti.push(new Confetti(config));
    }
  }

  // 8) This factory function generates config for each coin object.
  generateConfettiConfig() {
    const {
      colorChoices,
      lifeSpanRange,
      firePosition,
      angle,
      blastArc,
      powerRange,
      widthRange,
      heightRange,
      dragCoefficient,
      simplexZoomMultiplierRange,
      simplexOffsetMultiplier,
    } = this.config;

    return {
      color: colorChoices[generateRandomInteger(0, colorChoices.length - 1)],
      life: transform(Math.random(), 1, lifeSpanRange),
      startPosition: new Vector2().equals(firePosition),
      startVelocity: new Vector2(0, 1)
        .rotateTo(angle)
        .rotateBy(
          transform(Math.random(), 1, [-blastArc / 2, blastArc / 2]),
        )
        .multiply(transform(Math.random(), 1, powerRange)),

      width: transform(Math.random(), 1, widthRange),
      height: transform(Math.random(), 1, heightRange),
      dragCoefficient: dragCoefficient,
      simplexZoomMultiplier: transform(Math.random(), 1, simplexZoomMultiplierRange),
      simplexXOffset: Math.random() * simplexOffsetMultiplier,
      simplexYOffset: Math.random() * simplexOffsetMultiplier,
    };
  }

  // 9) Create canvas element and calculate offset. Takes in a callback (begin method).
  createCanvas() {
    if (this.canvasElement) {
      return;
    }

    this.canvasElement = document.createElement('CANVAS');

    this.canvasElement.style.position = 'fixed';
    this.canvasElement.style.zIndex = this.config.zIndex.toString();

    this.canvasElement.style.left = '0px';
    this.canvasElement.style.top = '0px';

    this.setCanvasDimensionToWindow();

    this.config.prepareCanvas(this.canvasElement, this);

    this.context = this.canvasElement.getContext('2d');

    const { parentElement } = this.config;

    if (isHTMLElement(parentElement) === true) {
      prependChild(parentElement, this.canvasElement);
    }

    const result = this.config.updateFirePosition(this);

    if (Vector2.isPoint(result)) {
      this.config.firePosition.equals(result);
    }
  }

  setCanvasDimensionToWindow() {
    this.setCanvasDimension(Viewport.width, Viewport.height);
  }

  setCanvasDimension(width, height) {
    const { resolutionMultiplier } = this.config;

    this.canvasElement.style.width = `${width}px`;
    this.canvasElement.style.height = `${height}px`;

    this.canvasElement.width = width * resolutionMultiplier;
    this.canvasElement.height = height * resolutionMultiplier;
  }

  getElementCenterVectorRelativeToCanvas(element) {
    const canvasRect = this.canvasElement.getBoundingClientRect();

    const elementRect = element.getBoundingClientRect();

    const x = elementRect.left - canvasRect.left + elementRect.width / 2;
    const y = elementRect.top - canvasRect.top + elementRect.height / 2;

    return new Vector2(x, y);
  }

  startTicker() {
    this.updateCount = 0;

    this.config.beforeFire(this);

    setTimeout(() => {
      this.ticker = new Ticker({
        durationInSeconds: 0.2,
        loopForever: true,
        onStart: () => this.config.onFire(this),
        onTick: () => this.update(),
      });

      this.ticker.start();
    }, this.config.delay);
  }

  update() {
    this.clearCanvas();

    const { gravity, frictionCoefficient, resolutionMultiplier } = this.config;

    let deadConfetti = 0;

    const gravityVector = new Vector2(0, gravity);

    for (let i = 0; i < this.confetti.length; i++) {
      const confetti = this.confetti[i];
      if (confetti.isAlive === true) {
        confetti.applyFriction(frictionCoefficient);
        confetti.applyDrag();
        confetti.applyForce(gravityVector);
        confetti.applyLateralEntropy(this.updateCount);
        confetti.update();
        confetti.draw(this.context, resolutionMultiplier);

        if (confetti.position.y + confetti.config.height > this.canvasElement.height) {
          confetti.die();
        }
      } else {
        deadConfetti++;
      }
    }

    this.updateCount++;

    if (deadConfetti >= this.confetti.length) {
      this.end();
    }
  }

  clearCanvas() {
    if (this.canvasElement) {
      this.context.clearRect(
        0, 0,
        this.canvasElement.width,
        this.canvasElement.height
      );
    }
  }

  end() {
    console.log('This ends');
    this.ticker.stop();
    this.clearCanvas();
    this.canvasElement.remove();
    this.canvasElement = null;
    this.confetti = [];
    this.isActive = false;
    this.config.onComplete();
  }
}

export default ConfettiCannon;
