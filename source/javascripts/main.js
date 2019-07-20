import Util from './util';
import Vector2 from './vector2';
import ConfettiCannon from './confettiCannon';

var getElementCenterVector = function (element) {
  var rect = element.getBoundingClientRect();
  return new Vector2(
    rect.left + (rect.width / 2),
    rect.top + (rect.height / 2),
  );
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
  angle: 3 * Math.PI / 2,
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

  beforeFire: function () {
    triggerElement.classList.add('triggerButton--disabled');
    triggerElement.textContent = 'Steady...';
  },
  onFire: function () {
    triggerElement.textContent = 'Reloading...';
  },
  onComplete: function () {
    triggerElement.classList.remove('triggerButton--disabled');
    triggerElement.textContent = 'Fire!';
  },
});

triggerElement.addEventListener('click', function () {
  confettiCannon.fire();
}.bind(this));

window.addEventListener('resize', function () {
  confettiCannon.config.firePosition.equals(getElementCenterVector(triggerElement));
}.bind(this));

// @indicator

import ConfettiCannonIndicator from './confettiCannonIndicator';

var confettiCannonIndicator = new ConfettiCannonIndicator({
  canvasElement: document.querySelector('canvas.confettiCannonIndicator'),
  getCannonPosition: function () {
    const rect = triggerElement.getBoundingClientRect();
    return new Vector2(
      rect.left + rect.width  / 2,
      rect.top  + rect.height / 2
    );
  },
});

confettiCannonIndicator.display();

// @controls
import SliderControl from './controls/slider';

new SliderControl({
  sliderControlElement: document.getElementById('cc_angle'),

  trackClassName: 'sliderControl__track',
  knobClassName: 'sliderControl__knob',
  valueClassName: 'sliderControl__value',

  transformValue: function(value) {
    return Util.modulate(value, 1, [0, Math.PI * 2]);
  },
  onInit: function (slider) {
    slider.setValue(Util.modulate(3 * Math.PI / 2, [0, Math.PI * 2], 1));
  },
  onUpdate: function (slider) {
    var value = slider.getValue();
    confettiCannon.config.angle = value;
    confettiCannonIndicator.config.angle = value;
    confettiCannonIndicator.display();
    slider.valueElement.textContent = ((Math.PI * 2 - value) / (Math.PI / 180)).toFixed(2);

  },
});

new SliderControl({
  sliderControlElement: document.getElementById('cc_blastArc'),

  trackClassName: 'sliderControl__track',
  knobClassName: 'sliderControl__knob',
  valueClassName: 'sliderControl__value',

  transformValue: function(value) {
    return Util.modulate(value, 1, [0, Math.PI * 2]);
  },
  onInit: function (slider) {
    slider.setValue(Util.modulate(Math.PI / 2, [0, Math.PI * 2], 1));
  },
  onUpdate: function (slider) {
    var value = slider.getValue();
    confettiCannon.config.blastArc = value;
    confettiCannonIndicator.config.arc = value;
    confettiCannonIndicator.display();
    slider.valueElement.textContent = (value / (Math.PI / 180)).toFixed(2);
  },
});

new SliderControl({
  sliderControlElement: document.getElementById('cc_maxPower'),

  trackClassName: 'sliderControl__track',
  knobClassName: 'sliderControl__knob',
  valueClassName: 'sliderControl__value',

  transformValue: function(value) {
    return Util.modulate(value, 1, [10, 150]);
  },
  onInit: function (slider) {
    slider.setValue(Util.modulate(50, [10, 150], 1));
  },
  onUpdate: function (slider) {
    var value = slider.getValue();
    confettiCannon.config.powerRange = [10, value];
    slider.valueElement.textContent = (value).toFixed(2);
  },
});

new SliderControl({
  sliderControlElement: document.getElementById('cc_numberOfConfetti'),

  trackClassName: 'sliderControl__track',
  knobClassName: 'sliderControl__knob',
  valueClassName: 'sliderControl__value',

  transformValue: function(value) {
    return Util.modulate(value, 1, [50, 10000]);
  },
  onInit: function (slider) {
    slider.setValue(Util.modulate(500, [50, 10000], 1));
  },
  onUpdate: function (slider) {
    var value = slider.getValue();
    confettiCannon.config.numberOfConfetti = Math.floor(value);
    slider.valueElement.textContent = Math.floor(value);
  },
});

new SliderControl({
  sliderControlElement: document.getElementById('cc_gravity'),

  trackClassName: 'sliderControl__track',
  knobClassName: 'sliderControl__knob',
  valueClassName: 'sliderControl__value',

  transformValue: function(value) {
    return Util.modulate(value, 1, [-2, 2]);
  },
  onInit: function (slider) {
    slider.setValue(Util.modulate(1, [-2, 2], 1));
  },
  onUpdate: function (slider) {
    var value = slider.getValue();
    confettiCannon.config.gravity = value;
    slider.valueElement.textContent = (value).toFixed(2);
  },
});