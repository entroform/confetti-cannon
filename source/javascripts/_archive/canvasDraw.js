var CanvasDraw = function(context) {
  this.init(context);
};

CanvasDraw.prototype = {
  init: function(context) {
    this.context = context;
  },
  moveTo: function(position) {
    this.context.moveTo(position.x, position.y);
  },
  lineTo: function(position) {
    this.context.lineTo(position.x, position.y);
  },
  circle: function(position, radius) {
    this.context.arc(position.x, position.y, radius, 0, Math.PI * 2);
  },
};

export default CanvasDraw;
