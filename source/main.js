// @Util
var Util = {
  objectAssign: function(object1, object2) {
    var keys = Object.keys(object2);
    for (var i = 0; i < keys.length; i++)
      object1[keys[i]] = object2[keys[i]];
    return object1;
  },
  isHTMLElement: function(element) {
    return (
      typeof element === 'object'
      && typeof element.nodeType === 'number'
      && element.nodeType === 1
      && element instanceof HTMLElement
    );
  },
  cubicBezier: function(t, p1, cp1, cp2, p2) {
    return Math.pow(1 - t, 3) * p1 + 3 * t * Math.pow(1 - t, 2) * cp1 + 3 * t * t * (1 - t) * cp2 + t * t * t * p2;
  },
  hypotenuse: function(x, y) {
    var max = Math.max(Math.abs(x), Math.abs(y));
    if (max === 0) max = 1;
    var min = Math.min(Math.abs(x), Math.abs(y));    
    var n = min / max;
    return max * Math.sqrt(1 + n * n);
  },
  lerp: function(from, to, t) {
    return (1 - t) * from + t * to;
  },
  modulate: function(number, from, to) {
    if (typeof from === 'number') from = [0, from];
    if (typeof to === 'number') to = [0, to];
    var percent = (number - from[0]) / (from[1] - from[0]);
    var result;
    if (to[1] > to[0]) {
      result = percent * (to[1] - to[0]) + to[0];
    } else {
      result = to[0] - (percent * (to[0] - to[1]));
    }
    return result;
  },
  getEuclideanDistance: function(a, b) {
    if (a === b) return 0;
    return Math.sqrt(Math.abs((a - b) * (b - a)));
  },
  cycleNumber: function(number, range) {
    if (typeof range === 'number') range = [0, range];
    var max = Math.max(range[0], range[1]);
    var min = Math.min(range[0], range[1]);
    if (max === 0 && min === 0) return 0;
    var da = Util.getEuclideanDistance(min, max);
    var db, c;
    if (number > max) {
      db = Util.getEuclideanDistance(number, max);
      c = db % da + min;
      return c === min ? max : c;
    } else if (number < min) {
      db = Util.getEuclideanDistance(number, min);
      c = max - db % da;
      return c === max ? min : c;
    }
    return number;
  },
  randomChoice: function(array) {
    var index = Util.random(array.length - 1, true);
    return array[index];
  },
  random: function(range, whole, fixed) {
    if (typeof whole === 'undefined') whole = false;
    if (typeof fixed === 'undefined') fixed = 2;
    if (typeof range === 'number') range = [0, range];
    if (range[0] === 0 && range[1] === 1) {
      if (whole === true) {
        return Math.random() > 0.5 ? 1 : 0;
      } else {
        return parseFloat(Math.random().toFixed(fixed));
      }
    } else {
      var number = Util.modulate(Math.random(), 1, range);
      return parseInt((number).toFixed(0), 10);
    }
  }
};

// @Vector2
var Vector2 = function(x, y) {
  this.init(x, y);
};

Vector2.prototype = {
  init: function(x, y) {
    this.x = (typeof x === 'number') ? x : 0;
    this.y = (typeof y === 'number') ? y : 0;
  },
  copy: function(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  },
  clone: function() {
    return new Vector2(this.x, this.y);
  },
  add: function(by) {
    if (typeof by === 'object') {
      this.x += by.x;
      this.y += by.y;
    } else if (typeof by === 'number') {
      this.x += by;
      this.y += by;
    }
    return this;
  },
  subtract: function(by) {
    if (typeof by === 'object') {
      this.x -= by.x;
      this.y -= by.y;
    } else if (typeof by === 'number') {
      this.x -= by;
      this.y -= by;
    }
    return this;
  },
  multiply: function(by) {
    this.x *= by;
    this.y *= by;
    return this;
  },
  divide: function(by) {
    if (by === 0) by = 1;
    this.x /= by;
    this.y /= by;
    return this;
  },
  limit: function(by) {
    if (this.magnitude() > by)
      this.normalize().multiply(by, by);
    return this;
  },
  magnitude: function() {
    return Util.hypotenuse(this.x, this.y);
  },
  normalize: function() {
    var mag = Math.abs(this.magnitude()); 
    mag = mag === 0 ? 1 : mag;
    this.x /= mag;
    this.y /= mag;
    return this;
  },
  applyCubicBezier: function(t, p1, cp1, cp2, p2) {
    this.x = Util.cubicBezier(t, p1.x, cp1.x, cp2.x, p2.x);
    this.y = Util.cubicBezier(t, p1.y, cp1.y, cp2.y, p2.y);
  },
  getAngle: function() {
    var angle = Math.acos(this.x / this.magnitude());
    if (this.y < 0) angle = Math.PI + (Math.PI - angle);
    return angle;
  },
  getAngleTo: function(to) {
    return Vector2.subtract(to, this).getAngle();
  },
  rotateBy: function(by) {
    var angle = this.getAngle() + by;
    var magnitude = this.magnitude();
    this.x = Math.cos(angle) * magnitude;
    this.y = Math.sin(angle) * magnitude;
    return this;
  },
  rotateTo: function(angle) {
    var angle = Util.cycleNumber(angle, Math.PI * 2);
    var magnitude = this.magnitude();
    this.x = Math.cos(angle) * magnitude;
    this.y = Math.sin(angle) * magnitude;
    return this;
  },
  getDistanceTo: function(to) {
    return Vector2
      .subtract(this, to)
      .magnitude();
  },
};

Vector2.subtract = function(a, b) {
  return new Vector2().copy(a).subtract(b.x, b.y);
};

// @Animation
var ANIMATION_DEFAULT_CONFIG = {
  duration: 1000, // In ms
  delay: 0,
  timingFunction: function(t) { return t },
  onTick: function() {},
  onStart: function() {},
  onComplete: function() {},
};

var Animation = function(config) {
  this.init(config);
};

Animation.prototype = {
  init: function(config) {
    this.config = Util.objectAssign({}, ANIMATION_DEFAULT_CONFIG);
    this.setConfig(config);

    this.rafID;
    this.timeoutID;

    this.isActive = false;
    this.isAnimating = false;

    this.timeStart = 0;
    this.timeEnd = 0;

    this.progress = 0;
  },
  setConfig: function(config) {
    if (typeof config === 'object') Util.objectAssign(this.config, config);
  },
  updateProgress: function() {
    if (typeof this.config.duration === 'number') {
      var now = Date.now();
      this.progress = (now - this.timeStart) / this.config.duration;
      if (this.progress > 1) this.progress = 1;
    } else {
      this.progress = 0;
    }
  },
  loop: function() {
    if (this.isAnimating === true) {
      this.updateProgress();
      this.config.onTick(this.config.timingFunction(this.progress));
      if (this.progress < 1) {
        this.continueLoop();
      } else {
        this.stop();
      }
    }
  },
  continueLoop: function() {
    if (this.isAnimating === true) {
      window.cancelAnimationFrame(this.rafID);
      this.rafID = window.requestAnimationFrame(this.loop.bind(this));
    }
  },
  play: function() {
    if (this.isActive === false) {
      this.isActive = true;
      this.timeoutID = setTimeout(function() {
        this.isAnimating = true;
        this.timeStart = Date.now();
        this.config.onStart(this);
        this.continueLoop();  
      }.bind(this), this.config.delay);
    }
  },
  stop: function() {
    if (this.isActive === true) {
      window.cancelAnimationFrame(this.rafID);
      clearTimeout(this.timeoutID);
      this.isAnimating = false;
      this.isActive = false;
      this.timeEnd = Date.now();
      this.progress = 0;
      this.config.onComplete(this);
    }
  },
}

// @Confetti
var CONFETTI_DEFAULT_CONFIG = {
  colorChoices: ['red', 'green', 'blue', 'white'],
  radius: 20,
  mass: 1,
  life: 100,
  startPosition: new Vector2(),
  startVelocity: new Vector2(),
  frictionCoefficient: 0,
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
    this.position = new Vector2().copy(this.config.startPosition);
    this.velocity = new Vector2().copy(this.config.startVelocity);
    this.acceleration = new Vector2();
  },
  // 2) Set coin config.
  setConfig: function(config) {
    if (typeof config === 'object') Util.objectAssign(this.config, config);
    this.life = this.config.life;
  },
  applyFriction: function(frictionCoefficient) {
    var friction = typeof frictionCoefficient === 'number' ? frictionCoefficient : this.config.frictionCoefficient;
    if (friction !== 0) {
      var force = new Vector2().copy(this.velocity).normalize().multiply(-friction);
      this.applyForce(force);
    }
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

// @ConfettiCannon
var CONFETTI_CANNON_DEFAULT_CONFIG = {
  parentElement: null,
  resolutionMultiplier: 1,
  zIndex: 0,

  delay: 0,
  startPosition: new Vector2(),
  angle: Math.PI / 4,
  blastArc: Math.PI / 6,

  numberOfConfetti: 200,

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
      startPosition: new Vector2().copy(this.config.startPosition),
      startVelocity: new Vector2(1, 1)
        .normalize()
        .multiply(1)
        .rotateTo(this.config.angle)
        .rotateBy(Util.modulate(Math.random(), 1, [-(this.config.blastArc / 2), this.config.blastArc / 2]))
        .multiply(Util.modulate(Math.random(), 1, [2, 40])),
      mass: 1,
      radius: Util.modulate(Math.random(), 1, [2, 6]),
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
      duration: 'infinite',
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
        var a = Util.modulate(i, this.confetti.length, [0, 10]);
        this.confetti[i].applyForce(
          new Vector2(Math.cos(this.updateCount / (15 - a) + (i * 11)), 0)
        );
        this.confetti[i].applyForce(gravity);
        this.confetti[i].applyFriction(0.9);
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

// Implementation.

var getElementCenterVector = function(element) {
  var rect = element.getBoundingClientRect();
  return new Vector2(
    rect.left + (rect.width  / 2),
    rect.top  + (rect.height / 2),
  );
};

var containerElement = document.querySelector('.container');
var triggerElement = document.querySelector('.triggerButton');

var confettiCannon = new ConfettiCannon({
  colorChoices: ['#80EAFF', '#FF0055', '#00FFAA', '#FFFF00'],
  parentElement: containerElement,
  startPosition: getElementCenterVector(triggerElement),

  numberOfConfetti: 500,
  angle: Math.PI + Math.PI / 2,
  blastArc: Math.PI / 2,

  gravity: 1,

  delay: 200,
  onStart: function() {
    triggerElement.classList.add('triggerButton--disabled');
    triggerElement.textContent = 'Steady...';
  },
  onFire: function() {
    triggerElement.textContent = 'Reloading...';
  },
  onComplete: function() {
    triggerElement.classList.remove('triggerButton--disabled');
    triggerElement.textContent = 'Fire!';
  },
});

triggerElement.addEventListener('click', function() {
  confettiCannon.fire();
}.bind(this));