import {
  cycleNumber,
  hypotenuse,
} from './utils';

export default class Vector2 {
  constructor(x, y) {
    this.x = typeof x === 'number' ? x : 0;
    this.y = typeof y === 'number' ? y : 0;    
  }

  equals(a, b) {
    if (Vector2.isPoint(a)) {
      this.x = a.x;
      this.y = a.y;
    } else if (typeof a === 'number' && typeof b === 'number') {
      this.x = a;
      this.y = b;
    }
    return this;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }
  
  add(by) {
    if (Vector2.isPoint(by)) {
      this.x += by.x;
      this.y += by.y;
    } else if (typeof by === 'number') {
      this.x += by;
      this.y += by;
    }
    return this;
  }

  subtract(by) {
    if (Vector2.isPoint(by)) {
      this.x -= by.x;
      this.y -= by.y;
    } else if (typeof by === 'number') {
      this.x -= by;
      this.y -= by;
    }
    return this;
  }

  multiply(by) {
    if (typeof by === 'number') {
      this.x *= by;
      this.y *= by;
    }
    return this;
  }

  divide(by) {
    if (typeof by === 'number') {
      if (by === 0) by = 1;
      this.x /= by;
      this.y /= by;
    }
    return this;
  }

  limit(by) {
    if (this.magnitude() > by) {
      this.normalize().multiply(by, by);
    }
    return this;
  }

  magnitude() {
    return hypotenuse(this.x, this.y);
  }
  
  normalize() {
    let mag = Math.abs(this.magnitude());
    mag = mag === 0 ? 1 : mag;
    this.x /= mag;
    this.y /= mag;
    return this;
  }

  // applyCubicBezier(t, p1, cp1, cp2, p2) {
  //   this.x = Util.cubicBezier(t, p1.x, cp1.x, cp2.x, p2.x);
  //   this.y = Util.cubicBezier(t, p1.y, cp1.y, cp2.y, p2.y);
  // }

  getAngle() {
    let angle = Math.acos(this.x / this.magnitude());
    if (this.y < 0) {
      angle = Math.PI + (Math.PI - angle);
    }
    return angle;
  }

  getAngleTo(to) {
    return Vector2.subtract(to, this).getAngle();
  }

  rotateBy(by) {
    const angle = this.getAngle() + by;
    const magnitude = this.magnitude();
    this.x = Math.cos(angle) * magnitude;
    this.y = Math.sin(angle) * magnitude;
    return this;
  }

  rotateTo(angle) {
    var angle = cycleNumber(angle, Math.PI * 2);
    var magnitude = this.magnitude();
    this.x = Math.cos(angle) * magnitude;
    this.y = Math.sin(angle) * magnitude;
    return this;
  }

  getDistanceTo(to) {
    return Vector2.subtract(this, to).magnitude();
  }

  // TODO: get this to work properly.
  polarTranslateTo(angle, to) {}
  polarTranslateBy(angle, by) {}
    
  static isPoint(p) {
    return typeof p === 'object' && typeof p.x === 'number' && typeof p.y === 'number';
  };
  
  static add(a, b) {
    return a.clone().subtract(b);
  };
  
  static subtract(a, b) {
    return a.clone().subtract(b);
  };
  
  static multiply(v, by) {
    return v.clone().multiply(by);
  };
  
  static divide(v, by) {
    if (by === 0) {
      by = 1;
    }
    return v.clone().divide(by);
  };

};
