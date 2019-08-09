var Util = {
  objectAssign: function(object1, object2) {
    var keys = Object.keys(object2);
    for (var i = 0; i < keys.length; i++) object1[keys[i]] = object2[keys[i]];
    return object1;
  },
  isHTMLElement: function(element) {
    return (
      typeof element === 'object' &&
      typeof element.nodeType === 'number' &&
      element.nodeType === 1 &&
      element instanceof HTMLElement
    );
  },
  cubicBezier: function(t, p1, cp1, cp2, p2) {
    return (
      Math.pow(1 - t, 3) * p1 +
      3 * t * Math.pow(1 - t, 2) * cp1 +
      3 * t * t * (1 - t) * cp2 +
      t * t * t * p2
    );
  },
  constrain(value, range) {
    if (typeof range === 'number') range = [0, range];

    var max = Math.max(range[0], range[1]);
    var min = Math.min(range[0], range[1]);

    if (value >= max) return max;
    else if (value <= min) return min;

    return value;
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
    if (to[1] > to[0]) result = percent * (to[1] - to[0]) + to[0];
    else result = to[0] - percent * (to[0] - to[1]);
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
      c = (db % da) + min;
      return c === min ? max : c;
    } else if (number < min) {
      db = Util.getEuclideanDistance(number, min);
      c = max - (db % da);
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
      if (whole === true) return Math.floor(Math.random() * 2);
      else return parseFloat(Math.random().toFixed(fixed));
    } else {
      var number = this.modulate(Math.random(), 1, range, false);
      return parseInt(number.toFixed(0), 10);
    }
  },
  hasAncestor(element, ancestor) {
    if (element === null) return false;
    let currentEl = element;
    while (currentEl !== null && currentEl.nodeName !== 'HTML') {
      currentEl = currentEl;
      if (currentEl !== null) {
        if (currentEl === ancestor) return true;
        currentEl = currentEl.parentElement;
      }
    }
    return false;
  },
};

export default Util;
