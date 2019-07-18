import Util from './util';
import Vector2 from './vector2';
import Animation from './animation';  
import Confetti from './confetti';

var CONFETTI_CANNON_DEFAULT_CONFIG = {
  parentElement: null,
  resolutionMultiplier: 1,
  zIndex: 0,

  firePosition: new Vector2(),

  colorChoices: ['#80EAFF', '#FF0055', '#00FFAA', '#FFFF00'],  
  numberOfConfetti: 500,

  delay: 0,
  angle: 3 * Math.PI / 2,
  blastArc: Math.PI / 2,

  powerRange: [2, 40],

  gravity: 1,
  frictionCoefficient: 0.1,
  dragCoefficient: 0.01,

  onStart: function() {},
  onFire: function() {},
  onComplete: function() {},
};

var ConfettiCannon = function(config) {
  this.init(config);
};

ConfettiCannon.prototype = {
  // 1) Initialize properties and stuff.
  init: function(config) {
    this.config = Util.objectAssign({}, CONFETTI_CANNON_DEFAULT_CONFIG);
    this.setConfig(config);

    this.isActive = false;
    this.confetti;
    this.animation;
    this.updateCount = 0;
  },
  // 2) Set config.
  setConfig: function(config) {
    if (typeof config === 'object') Util.objectAssign(this.config, config);
    if (this.config.numberOfConfetti < 0) this.config.numberOfConfetti = 0;
    if (this.config.resolutionMultiplier < 1) this.config.resolutionMultiplier = 1;
    if (this.config.delay < 0) this.config.delay = 0;
  },
  // 3) Trigger Start.
  fire: function() {
    this.setup();
    this.begin();
  },
  // 4) Setup target vectors, initialize coin objects, and create canvas.
  setup: function(callback) {
    if (this.isActive === false) {
      this.isActive = true;
      this.populate();
      this.createCanvas(callback);
    }
  },
  // 7) Prepare, calculate, and initialize confetti objects.
  populate: function() {
    this.confetti = [];
    for (var i = 0; i < this.config.numberOfConfetti; i++) {
      var config = this.generateConfettiConfig();
      this.confetti.push(new Confetti(config));
    }
  },
  // 8) This factory function generates config for each coin object.
  generateConfettiConfig: function() {
    return {
      color: Util.randomChoice(this.config.colorChoices),
      life: Util.modulate(Math.random(), 1, [140, 200]),
      startPosition: new Vector2().equals(this.config.firePosition),
      startVelocity: new Vector2(1, 1)
        .normalize()
        .rotateTo(this.config.angle)
        .rotateBy(Util.modulate(Math.random(), 1, [-this.config.blastArc / 2, this.config.blastArc / 2]))
        .multiply(Util.modulate(Math.random(), 1, this.config.powerRange)),
      mass: 1,
      radius: Util.modulate(Math.random(), 1, [2, 6]),
      dragCoefficient: this.config.dragCoefficient,
    };
  },
  // 9) Create canvas element and calculate offset. Takes in a callback (begin method).
  createCanvas: function() {
    if (typeof this.canvasElement === 'undefined') {
      this.canvasElement = document.createElement('CANVAS');

      this.canvasElement.style.position = 'fixed';
      this.canvasElement.style.zIndex = this.config.zIndex.toString();

      this.canvasElement.style.left = '0px';
      this.canvasElement.style.top  = '0px';

      this.updateCanvasDimension();

      this.context = this.canvasElement.getContext('2d');

      if (Util.isHTMLElement(this.config.parentElement) === true)
        this.config.parentElement.appendChild(this.canvasElement);
    }
  },
  updateCanvasDimension: function() {
    this.canvasElement.style.width  = window.innerWidth  + 'px';
    this.canvasElement.style.height = window.innerHeight + 'px';
    this.canvasElement.width  = window.innerWidth  * this.config.resolutionMultiplier;
    this.canvasElement.height = window.innerHeight * this.config.resolutionMultiplier;
  },
  // 10) This is called once canvasElement is defined and is in the DOM. Start animation!
  begin: function() {
    if (this.isActive === true) {
      this.startAnimation();
      if (this.confetti.length === 0) this.end();
    }
  },
  // 11) Initialize animation object and start it.
  startAnimation: function() {
    console.log('confettiCannon: startAnimation');
    this.updateCount = 0;
    this.config.onStart();
    this.animation = new Animation({
      delay: this.config.delay,
      duration: 'forever',
      onStart: function() {
        this.config.onFire()
      }.bind(this),
      onTick: this.update.bind(this),
    });
    this.animation.play();
  },
  // 12) Loop through each coins and draw them.
  update: function() {
    this.clearCanvas();

    var m = this.config.resolutionMultiplier;
    var deadConfetti = 0;
    var gravity = new Vector2(0, this.config.gravity);
    for (var i = 0; i < this.confetti.length; i++) {
      if (this.confetti[i].isAlive === true) {
        // TODO: Clean up this lateral oscillation force.
        var a = Util.modulate(i, this.confetti.length, [0, 10]);
        this.confetti[i].applyForce(
          new Vector2(
            Math.cos(this.updateCount / (15 - a) + (i * 11)), 0
          )
        );
        this.confetti[i].applyForce(gravity);
        this.confetti[i].applyFriction(this.config.frictionCoefficient);
        this.confetti[i].applyDrag();
        this.confetti[i].update();
        this.confetti[i].draw(this.context);
      } else {
        deadConfetti++;
      }
    }
    this.updateCount++;
    if (deadConfetti === this.confetti.length) this.end();
  },
  // 13) Helper function to clear canvas every frame.
  clearCanvas: function() {
    this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  },
  // 15) This is called after the last coin reached the end. Or if numberOfCoins is 0. Sayonara!
  end: function() {
    console.log('confettiCannon: end');
    this.clearCanvas();
    this.animation.stop();
    this.canvasElement.remove();
    this.canvasElement = undefined;
    this.confetti = [];
    this.isActive = false;
    this.config.onComplete();
  },
}

export default ConfettiCannon;