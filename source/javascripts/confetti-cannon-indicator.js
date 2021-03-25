import {
  Num,
  Vector2,
  Viewport,
} from '@nekobird/rocket';

const CONFETTI_CANNON_INDICATOR_DEFAULT_CONFIG = {
  canvasElement: null,
  angle: 0,
  arc: Math.PI / 4,
  power: 10,
  getCannonPosition: () => new Vector2(),
};

class ConfettiCannonIndicator {
  constructor(config) {
    this.config = {...CONFETTI_CANNON_INDICATOR_DEFAULT_CONFIG};
    this.setConfig(config);
    this.context = this.config.canvasElement.getContext('2d');
    this.listen();
  }

  setConfig(config) {
    if (typeof config === 'object') {
      Object.assign(this.config, config);
    }
  }

  updateCanvas() {
    const { canvasElement } = this.config;

    canvasElement.width = Viewport.width;
    canvasElement.height = Viewport.height;
  }

  display() {
    this.updateCanvas();

    const { canvasElement, angle, arc, power } = this.config;

    const position = this.config.getCannonPosition();

    let length = Num.hypotenuse(
      canvasElement.offsetWidth,
      canvasElement.offsetHeight,
    );

    length = length / 2;

    const target = new Vector2(0, 1)
      .rotateTo(angle)
      .normalize()
      .multiply(length)
      .add(position);

    const left = new Vector2(0, 1)
      .rotateTo(angle - arc / 2)
      .normalize()
      .multiply(length)
      .add(position);

    const right = new Vector2(0, 1)
      .rotateTo(angle + arc / 2)
      .normalize()
      .multiply(length)
      .add(position);

    if (arc !== Math.PI * 2) {
      const gradient = this.context.createLinearGradient(
        position.x,
        position.y,
        target.x,
        target.y,
      );

      gradient.addColorStop(0, 'hsla(340, 100%, 50%, 0)');
      gradient.addColorStop(1, 'hsla(340, 100%, 50%, 1)');
      this.context.save();
      this.context.beginPath();
      this.context.moveTo(position.x, position.y);
      this.context.lineTo(target.x, target.y);
      this.context.strokeStyle = gradient;
      this.context.stroke();

      const gradient0 = this.context.createLinearGradient(position.x, position.y, right.x, right.y);
      gradient0.addColorStop(0, 'hsla(340, 100%, 50%, 0)');
      gradient0.addColorStop(1, 'hsla(340, 100%, 50%, 1)');
      this.context.beginPath();
      this.context.moveTo(position.x, position.y);
      this.context.lineTo(right.x, right.y);
      this.context.strokeStyle = gradient0;
      this.context.stroke();

      const gradient1 = this.context.createLinearGradient(position.x, position.y, left.x, left.y);
      gradient1.addColorStop(0, 'hsla(340, 100%, 50%, 0)');
      gradient1.addColorStop(1, 'hsla(340, 100%, 50%, 1)');
      this.context.beginPath();
      this.context.moveTo(position.x, position.y);
      this.context.lineTo(left.x, left.y);
      this.context.strokeStyle = gradient1;
      this.context.stroke();
    }

    this.context.beginPath();
    if (arc === Math.PI * 2) {
      this.context.arc(
        position.x,
        position.y,
        Num.transform(power, [10, 150], [100, 500], true),
        0,
        Math.PI * 2,
      );
    } else {
      this.context.arc(
        position.x,
        position.y,
        Num.transform(power, [10, 150], [100, 500], true),
        Num.cycle(angle - arc / 2, Math.PI * 2),
        Num.cycle(angle + arc / 2, Math.PI * 2),
      );
    }

    this.context.strokeStyle = 'hsla(340, 100%, 50%, 0.5)';

    this.context.stroke();
  }

  listen() {
    window.addEventListener('resize', () => {
      this.updateCanvas();

      this.display();
    });
  }
}

export default ConfettiCannonIndicator;
