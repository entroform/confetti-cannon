import Vector2 from './vector2';
import ConfettiCannon from './confettiCannon';

var getElementCenterVector = function(element) {
  var rect = element.getBoundingClientRect();
  return new Vector2(rect.left + rect.width / 2, rect.top + rect.height / 2);
};

var containerElement = document.querySelector('.container');
var triggerElement = document.querySelector('.triggerButton');

var confettiCannon = new ConfettiCannon({
  parentElement: containerElement,
  resolutionMultiplier: 2,

  colorChoices: ['#80EAFF', '#FF0055', '#00FFAA', '#FFFF00'],
  widthRange: [2, 10],
  heightRange: [2, 10],
  lifeSpanRange: [100, 250],

  // Cannon Settings
  firePosition: getElementCenterVector(triggerElement),
  numberOfConfetti: 500,

  delay: 200,
  // angle: Math.PI,
  // angle: Math.PI + Math.PI / 4,
  angle: (3 * Math.PI) / 2,
  // angle: Math.PI * 2 - Math.PI / 4,
  // angle: 0,
  blastArc: Math.PI / 3,

  // Power Ranger
  powerRange: [10, 50],

  gravity: 1,
  // Please don't set this higher or equal to gravity value.
  frictionCoefficient: 0.9,
  // Keep this zero.
  dragCoefficient: 0,

  // Simplex lateral entropy settings.
  simplexZoomMultiplierRange: [80, 120],
  simplexOffsetMultiplier: 100,

  beforeFire: function() {
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

triggerElement.addEventListener(
  'click',
  function() {
    confettiCannon.fire();
  }.bind(this),
);

window.addEventListener(
  'resize',
  function() {
    confettiCannon.config.firePosition.equals(getElementCenterVector(triggerElement));
  }.bind(this),
);

// @indicator

import ConfettiCannonIndicator from './confettiCannonIndicator';

var confettiCannonIndicator = new ConfettiCannonIndicator({
  canvasElement: document.querySelector('canvas.confettiCannonIndicator'),
  getCannonPosition: function() {
    const rect = triggerElement.getBoundingClientRect();
    return new Vector2(rect.left + rect.width / 2, rect.top + rect.height / 2);
  },
});

confettiCannonIndicator.display();

// @controls

import SliderControl from './controls/slider';

var sliderControlElementAngle = document.getElementById('sc_angle');
var sc_angle = new SliderControl({
  trackElement: sliderControlElementAngle.querySelector('.sliderControl__track'),
  knobElement: sliderControlElementAngle.querySelector('.sliderControl__knob'),
  valueElement: sliderControlElementAngle.querySelector('.sliderControl__value'),

  range: [0, Math.PI * 2],

  onInit: function(slider) {
    slider.setValue((3 * Math.PI) / 2);
  },
  onUpdate: function(slider) {
    var value = slider.getValue();
    confettiCannon.config.angle = value;
    confettiCannonIndicator.config.angle = value;
    confettiCannonIndicator.display();
    slider.config.valueElement.textContent =
      ((Math.PI * 2 - value) / (Math.PI / 180)).toFixed(2) + String.fromCharCode(176);
  },
});

var sliderBlastArcControlElement = document.getElementById('sc_blastArc');
var sc_blastArc = new SliderControl({
  trackElement: sliderBlastArcControlElement.querySelector('.sliderControl__track'),
  knobElement: sliderBlastArcControlElement.querySelector('.sliderControl__knob'),
  valueElement: sliderBlastArcControlElement.querySelector('.sliderControl__value'),

  range: [0, Math.PI * 2],

  onInit: function(slider) {
    slider.setValue(Math.PI / 2);
  },
  onUpdate: function(slider) {
    var value = slider.getValue();
    confettiCannon.config.blastArc = value;
    confettiCannonIndicator.config.arc = value;
    confettiCannonIndicator.display();
    slider.config.valueElement.textContent =
      (value / (Math.PI / 180)).toFixed(2) + String.fromCharCode(176);
  },
});

var sliderMaxPowerControlElement = document.getElementById('sc_maxPower');
var sc_maxPower = new SliderControl({
  trackElement: sliderMaxPowerControlElement.querySelector('.sliderControl__track'),
  knobElement: sliderMaxPowerControlElement.querySelector('.sliderControl__knob'),
  valueElement: sliderMaxPowerControlElement.querySelector('.sliderControl__value'),

  range: [10, 150],

  onInit: function(slider) {
    slider.setValue(50);
  },
  onUpdate: function(slider) {
    var value = slider.getValue();
    confettiCannon.config.powerRange = [10, value];
    confettiCannonIndicator.config.power = value;
    confettiCannonIndicator.display();
    slider.config.valueElement.textContent = value.toFixed(2);
  },
});

var sliderNumberOfConfettiControlElement = document.getElementById('sc_numberOfConfetti');
var sc_numberOfConfetti = new SliderControl({
  trackElement: sliderNumberOfConfettiControlElement.querySelector('.sliderControl__track'),
  knobElement: sliderNumberOfConfettiControlElement.querySelector('.sliderControl__knob'),
  valueElement: sliderNumberOfConfettiControlElement.querySelector('.sliderControl__value'),

  range: [50, 10000],

  onInit: function(slider) {
    slider.setValue(500);
  },
  onUpdate: function(slider) {
    var value = slider.getValue();
    confettiCannon.config.numberOfConfetti = Math.floor(value);
    slider.config.valueElement.textContent = Math.floor(value);
  },
});

var sliderGravityControlElement = document.getElementById('sc_gravity');
var sc_gravity = new SliderControl({
  trackElement: sliderGravityControlElement.querySelector('.sliderControl__track'),
  knobElement: sliderGravityControlElement.querySelector('.sliderControl__knob'),
  valueElement: sliderGravityControlElement.querySelector('.sliderControl__value'),

  range: [-2, 2],

  onInit: function(slider) {
    slider.setValue(1);
  },
  onUpdate: function(slider) {
    var value = slider.getValue();
    confettiCannon.config.gravity = value;
    slider.config.valueElement.textContent = value.toFixed(2);
  },
});

var updateSliders = function() {
  sc_angle.update();
  sc_blastArc.update();
  sc_gravity.update();
  sc_maxPower.update();
  sc_numberOfConfetti.update();
};

// Controls

var controlsIsOpen = false;
var controlsElement = document.querySelector('.controls');
var jsControlsOpenElement = document.querySelector('.js-controls-open');
jsControlsOpenElement.addEventListener(
  'click',
  function() {
    if (controlsIsOpen === false) {
      controlsIsOpen = true;
      controlsElement.classList.remove('controls--animate-out');
      jsControlsOpenElement.style.display = 'none';
      controlsElement.classList.add('controls--active');
      updateSliders();
      controlsElement.classList.add('controls--animate-in');
    }
  }.bind(this),
);

var jsControlsCloseElement = document.querySelector('.js-controls-close');

var closeControlsElement = function() {
  if (controlsIsOpen === true) {
    controlsElement.classList.remove('controls--animate-in');
    controlsElement.classList.add('controls--animate-out');
    setTimeout(
      function() {
        controlsElement.classList.remove('controls--active');
        jsControlsOpenElement.style.display = 'block';
        controlsIsOpen = false;
      }.bind(this),
      200,
    );
  }
};

jsControlsCloseElement.addEventListener(
  'click',
  function() {
    closeControlsElement();
  }.bind(this),
);

window.addEventListener('keyup', function(event) {
  if (controlsIsOpen === true && event.keyCode === 27) closeControlsElement();
});
