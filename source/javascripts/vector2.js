import Util from './util';

var Vector2 = function(x, y) {
  this.init(x, y);
};

Vector2.prototype = {
  init: function(x, y) {
    this.x = (typeof x === 'number') ? x : 0;
    this.y = (typeof y === 'number') ? y : 0;
  },
  equals: function(v) {
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
    return Vector2.subtract(this, to).magnitude();
  },
};

Vector2.subtract = function(a, b) {
  return new Vector2().equals(a).subtract(b.x, b.y);
};

export default Vector2;