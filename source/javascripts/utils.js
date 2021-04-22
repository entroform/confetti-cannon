export function createRangeFromNumberOrRange(range) {
  return typeof range === 'number' ? [0, range] : [range[0], range[1]];
}

export function orderRangeArray(range) {
  return [Math.min(...range), Math.max(...range)];
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

export function hypotenuse(x, y) {
  if (Math.hypot) {
    return Math.hypot(x, y);
  }

  const max = Math.max(Math.abs(x), Math.abs(y)) || 1;
  const min = Math.min(Math.abs(x), Math.abs(y));
  const n = min / max;

  return max * Math.sqrt(1 + n * n);
}

// https://en.wikipedia.org/wiki/Euclidean_distance
export function calculateEuclideanDistance(a, b) {
  return a === b ? 0 : Math.sqrt(Math.abs((a - b) * (b - a)));
}

// https://math.stackexchange.com/questions/377169/calculating-a-value-inside-one-range-to-a-value-of-another-range/377174
export function transform(value, from, to, shouldClampResult = true) {
  const _from = createRangeFromNumberOrRange(from);
  const _to   = createRangeFromNumberOrRange(to);

  // Division by zero returns Infinite in JavaScript.
  const result = (value - _from[0]) * ((_to[1] - _to[0]) / (_from[1] - _from[0])) + _to[0];

  return shouldClampResult ? clamp(result, ..._to) : result;
}

export function isHTMLElement(value) {
  return value
    && 'nodeType' in value
    && typeof value.nodeType === 'number'
    && value.nodeType === 1
    && value instanceof HTMLElement;
};

export function prependChild(parent, child) {
  parent.childElementCount > 0 ? parent.insertBefore(child, parent.childNodes[0]) : parent.appendChild(child);
}

export function generateRandomInteger(min, max) {
  const ceilMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  return Math.floor(Math.random() * (floorMax - ceilMin + 1)) + ceilMin;
}

export function cycleNumber(value, range) {
  const _range = createRangeFromNumberOrRange(range);
  const [min, max] = orderRangeArray(_range);

  if (min === 0 && max === 0) {
    return 0;
  }

  const da = calculateEuclideanDistance(min, max);

  if (value > max) {
    const db = calculateEuclideanDistance(value, max);
    const c = (db % da) + min;
    return c === min ? max : c;
  } else if (value < min) {
    const db = calculateEuclideanDistance(value, min);
    const c = max - (db % da);
    return c === max ? min : c;
  }

  return value;
}
