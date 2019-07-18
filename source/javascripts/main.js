import Vector2 from './vector2';
import ConfettiCannon from './confettiCannon';

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
  parentElement: containerElement,
  firePosition: getElementCenterVector(triggerElement),

  colorChoices: ['#80EAFF', '#FF0055', '#00FFAA', '#FFFF00'],
  numberOfConfetti: 500,
  widthRange: [2, 10],
  heightRange: [2, 10],
  lifeSpanRange: [100, 250],

  delay: 200,
  // angle: Math.PI,
  // angle: Math.PI + Math.PI / 4,
  angle: 3 * Math.PI / 2,
  // angle: Math.PI * 2 - Math.PI / 4,
  // angle: 0,
  blastArc: Math.PI / 3,

  powerRange: [4, 50],

  gravity: 1,
  frictionCoefficient: 1,
  // Keep this zero for now.
  dragCoefficient: 0,

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

triggerElement.addEventListener('click', function() {
  confettiCannon.fire();
}.bind(this));