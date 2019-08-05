import {
  MonoKnobSlider,
  Vector2,
} from '@nekobird/rocket';

import ConfettiCannon from './confettiCannon';

const getElementCenterVector = element => {
  const { left, top, width, height } = element.getBoundingClientRect();
  return new Vector2(
    left + (width / 2),
    top + (height / 2),
  );
};

const containerElement = document.querySelector('.container');
const triggerElement = document.querySelector('.triggerButton');

const confettiCannon = new ConfettiCannon({
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

  beforeFire: () => {
    triggerElement.classList.add('triggerButton--disabled');
    triggerElement.textContent = 'Steady...';
  },
  onFire: () => {
    triggerElement.textContent = 'Reloading...';
  },
  onComplete: () => {
    triggerElement.classList.remove('triggerButton--disabled');
    triggerElement.textContent = 'Fire!';
  },
});

triggerElement.addEventListener('click', () => confettiCannon.fire());

window.addEventListener('resize', () => {
  confettiCannon.config.firePosition.equals(getElementCenterVector(triggerElement));
});

// @indicator

import ConfettiCannonIndicator from './confettiCannonIndicator';

const confettiCannonIndicator = new ConfettiCannonIndicator({
  canvasElement: document.querySelector('canvas.confettiCannonIndicator'),
  getCannonPosition: () => {
    const { left, top, width, height } = triggerElement.getBoundingClientRect();
    return new Vector2(left + width / 2, top + height / 2);
  },
});

confettiCannonIndicator.display();

// @controls

const sliderControlElementAngle = document.getElementById('sc_angle');
const sc_angle = new MonoKnobSlider({
  trackElement: sliderControlElementAngle.querySelector('.sliderControl__track'),
  knobElement: sliderControlElementAngle.querySelector('.sliderControl__knob'),
  valueElement: sliderControlElementAngle.querySelector('.sliderControl__value'),
  range: [0, Math.PI * 2],
  onInit: slider => slider.value = (3 * Math.PI / 2),
  onUpdate: slider => {
    const { value } = slider;
    confettiCannon.config.angle = value;
    confettiCannonIndicator.config.angle = value;
    confettiCannonIndicator.display();
    slider.config.valueElement.textContent = ((Math.PI * 2 - value) / (Math.PI / 180)).toFixed(2) + String.fromCharCode(176);
  },
});

const sliderBlastArcControlElement = document.getElementById('sc_blastArc');
const sc_blastArc = new MonoKnobSlider({
  trackElement: sliderBlastArcControlElement.querySelector('.sliderControl__track'),
  knobElement: sliderBlastArcControlElement.querySelector('.sliderControl__knob'),
  valueElement: sliderBlastArcControlElement.querySelector('.sliderControl__value'),
  range: [0, Math.PI * 2],
  onInit: slider => slider.value = (Math.PI / 2),
  onUpdate: slider => {
    const { value }= slider;
    confettiCannon.config.blastArc = value;
    confettiCannonIndicator.config.arc = value;
    confettiCannonIndicator.display();
    slider.config.valueElement.textContent = (value / (Math.PI / 180)).toFixed(2) + String.fromCharCode(176);
  },
});

const sliderMaxPowerControlElement = document.getElementById('sc_maxPower');
const sc_maxPower = new MonoKnobSlider({
  trackElement: sliderMaxPowerControlElement.querySelector('.sliderControl__track'),
  knobElement: sliderMaxPowerControlElement.querySelector('.sliderControl__knob'),
  valueElement: sliderMaxPowerControlElement.querySelector('.sliderControl__value'),
  range: [10, 150],
  onInit: slider => slider.value = (50),
  onUpdate: slider => {
    const { value } = slider;
    confettiCannon.config.powerRange = [10, value];
    confettiCannonIndicator.config.power = value;
    confettiCannonIndicator.display();
    slider.config.valueElement.textContent = (value).toFixed(2);
  },
});

const sliderNumberOfConfettiControlElement = document.getElementById('sc_numberOfConfetti');
const sc_numberOfConfetti = new MonoKnobSlider({
  trackElement: sliderNumberOfConfettiControlElement.querySelector('.sliderControl__track'),
  knobElement: sliderNumberOfConfettiControlElement.querySelector('.sliderControl__knob'),
  valueElement: sliderNumberOfConfettiControlElement.querySelector('.sliderControl__value'),
  range: [50, 10000],
  onInit: slider => slider.value = (500),
  onUpdate: slider => {
    const { value } = slider;
    confettiCannon.config.numberOfConfetti = Math.floor(value);
    slider.config.valueElement.textContent = Math.floor(value);
  },
});

const sliderGravityControlElement = document.getElementById('sc_gravity');
const sc_gravity = new MonoKnobSlider({
  trackElement: sliderGravityControlElement.querySelector('.sliderControl__track'),
  knobElement: sliderGravityControlElement.querySelector('.sliderControl__knob'),
  valueElement: sliderGravityControlElement.querySelector('.sliderControl__value'),
  range: [-2, 2],
  onInit: slider => slider.value = (1),
  onUpdate: slider => {
    const { value } = slider;
    confettiCannon.config.gravity = value;
    slider.config.valueElement.textContent = value.toFixed(2);
  },
});

const updateSliders = () => {
  sc_angle.update();
  sc_blastArc.update();
  sc_gravity.update();
  sc_maxPower.update();
  sc_numberOfConfetti.update();
}

// Controls

const controlsIsOpen = false;
const controlsElement = document.querySelector('.controls');
const jsControlsOpenElement = document.querySelector('.js-controls-open');
jsControlsOpenElement.addEventListener('click', function () {
  if (controlsIsOpen === false) {
    controlsIsOpen = true;
    controlsElement.classList.remove('controls--animate-out');
    jsControlsOpenElement.style.display = 'none';
    controlsElement.classList.add('controls--active');
    updateSliders();
    controlsElement.classList.add('controls--animate-in');
  }
}.bind(this));

const jsControlsCloseElement = document.querySelector('.js-controls-close');

const closeControlsElement = () => {
  if (controlsIsOpen === true) {
    controlsElement.classList.remove('controls--animate-in');
    controlsElement.classList.add('controls--animate-out');
    setTimeout(() => {
      controlsElement.classList.remove('controls--active');
      jsControlsOpenElement.style.display = 'block';
      controlsIsOpen = false;
    }, 200);
  }
}

jsControlsCloseElement.addEventListener('click', () => closeControlsElement());

window.addEventListener('keyup', event => {
  if (
    controlsIsOpen === true
    && event.keyCode === 27
  ) closeControlsElement();
});
