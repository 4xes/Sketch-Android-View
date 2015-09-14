@import 'library/common.js'
@import 'library/devel-tools.js'

var code = {};

var sp = '    ';
var sp2x = sp + sp;

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

code.getShape = function(layer){
  switch ([layer class]) {
    case MSShapePathLayer:
      //tools.dump(layer.parentGroup());
      return new Shape(layer);
    default:
      //this shape is not support, yet
      return null;
  }
};

code.nameBuffRect = 'buffRect';
code.nameTouchPoint = 'touchPoint';


var Shape = function(layer){
  [layer makeNameUnique];
  this._layer = layer;

  var indexOptions = [layer name].indexOf('#');
  var options = indexOptions != -1? [layer name].substr(indexOptions+1): null;
  var clearName = (options ? [layer name].substr(0, indexOptions): [layer name]).replace(/\s+/g, '');
  if(/^\d+$/.test(clearName.substr(0,1))){
    clearName = 'shape' + clearName;
  }
  this.name = clearName;
  this.onClick = options != null? options.indexOf('noclick') == -1: true;

  /*generate code*/
  if(this.canDraw()){
    this.path = this.getPath(this._layer);
    this.property = this.getProperty();
    this.regionPropery = this.getPropertyRegion();
  }

  //ui.alert('Code', this.property + this.regionPropery+ this.path);
}

Shape.prototype.canDraw = function(){
  var points = this._layer.path().points();
  return [points count] > 2;
}

Shape.prototype.getProperty = function(){
   return sp + 'private Path ' + this.name + ';\n';
}

Shape.prototype.getPropertyRegion = function(){
   if(this.onClick){
     return sp +'private Region ' + 'region' + this.name.capitalize() + ';\n';
   }else{
     return '';
   }

}

Shape.prototype.getRegionName = function(){
  return 'region' + this.name.capitalize();
}

Shape.prototype.getShapeInit = function(){
  return this.path;
}

Shape.prototype.getPaint = function(){
  return 'mPaint';
}

Shape.prototype.getDraw = function(){
  return sp2x + 'canvas.drawPath(' + this.name + ',' + this.getPaint() + ');\n';
}

Shape.prototype.getRegionInit = function(){
  if(this.onClick){
    return sp2x + this.name +'.computeBounds(bounds, true);\n' +
            sp2x + 'Region ' + this.getRegionName() + ' = new Region();\n' +
            sp2x + this.getRegionName() + '.setPath(' + this.name + ', new Region((int) bounds.left, (int) bounds.top, (int) bounds.right, (int) bounds.bottom));\n' +
            sp2x + 'mRegions.put(\"' + this.name +'\", ' + this.getRegionName() + ');\n';

  }else{
    return "";
  }
}
Shape.prototype.getPath = function(layer){
    var points = layer.path().points();
    var count = [points count];

    var rect = [layer absoluteRect];
    var debug = new Debug();
    var code = new CodeInit(this.name);

    for(var i = 0; i < count; i++){
      var prevI = i - 1 < 0 ? count - 1: i - 1;
      var nextI = i + 1 > count - 1? 0: i + 1;

      var prevP = new Point(rect, points.objectAtIndex(prevI), true);
      var p = new Point(rect, points.objectAtIndex(i), true);
      var nextP = new Point(rect, points.objectAtIndex(nextI), true);

      debug.add(i,p);

      if(i == 0){
        code.moveTo(p);
      }
      if(p.hasTo || p.hasFrom){
          if(nextP.hasFrom){
            code.cubicTo(p.fromX, p.fromY, nextP.toX, nextP.toY, nextP.x, nextP.y);
          }else{
            code.cubicTo(p.fromX, p.fromY, nextP.x, nextP.y, nextP.x, nextP.y);
          }
      }else{
          if(nextP.hasFrom){
            code.cubicTo(p.x, p.y,  nextP.toX, nextP.toY, nextP.x, nextP.y);
          }else{
            code.lineTo(nextP);
          }
      }
      if(i == count - 1 && layer.path().isClosed()){
        code.close();
      }
    }

    //ui.alert('Debug', debug.getMessage());

    return code.getCode();
}

function Point(rect, point, round) {
  this.hasTo = point.hasCurveTo();
  this.hasFrom = point.hasCurveFrom();
  this.x = rect.width() * point.point().x + rect.x();
  this.y = rect.height() * point.point().y + rect.y();
  this.toX = rect.width() * point.curveTo().x + rect.x();
  this.toY = rect.height() * point.curveTo().y + rect.y();
  this.fromX = rect.width() * point.curveFrom().x + rect.x();
  this.fromY = rect.height() * point.curveFrom().y + rect.y();

  round = false;
  if(round){
    this.x = Number(this.x).toFixed(0));
    this.y = Number(this.y).toFixed(0));
    this.toX = Number(this.toX).toFixed(0));
    this.toY = Number(this.toY).toFixed(0));
    this.fromX = Number(this.fromX).toFixed(0));
    this.fromY = Number(this.fromY).toFixed(0));
  }else{
    this.x = this.x + 'f';
    this.y = this.y + 'f';
    this.toX = this.toX + 'f';
    this.toY = this.toY + 'f';
    this.fromX = this.fromX + 'f';
    this.fromY = this.fromY + 'f';
  }
}

var CodeInit = function(name){
  this.name = name;
  this.code = sp2x + this.name + ' = new Path();\n';
}

CodeInit.prototype.cubicTo = function(x1, y1, x2, y2, x3, y3){
  this.code += sp2x + this.name + '.cubicTo(' + this.dp(x1) + ', ' + this.dp(y1) + ', ' + this.dp(x2) + ', ' + this.dp(y2) + ', ' + this.dp(x3) + ', ' + this.dp(y3) + ');\n';
}

CodeInit.prototype.moveTo = function(p1){
  this.code += sp2x + this.name + '.moveTo(' + this.dp(p1.x) + ', ' + this.dp(p1.y) + ');\n';
}

CodeInit.prototype.lineTo = function(p1){
  this.code += sp2x + this.name + '.lineTo(' + this.dp(p1.x) + ', ' + this.dp(p1.y) + ');\n';
}

CodeInit.prototype.close = function(){
  this.code += sp2x + this.name + '.close();\n';
}

CodeInit.prototype.getCode = function(){
  return this.code;
}

CodeInit.prototype.dp = function(px){
  return px + ' * density';
}

var Debug = function(){
  this.message = '';
}

Debug.prototype.add = function(i, p){
  this.message += '\n' + 'Point[' + i + ']';
  if(p.hasFrom) this.message += '\n' + 'from(' + p.fromX + ', ' + p.fromY + ')';
  if(p.hasTo) this.message += '\n' + 'to(' + p.toX + ', ' +  p.toY  +')';
  this.message += '\n' + 'point(' + p.x + ', ' + p.y + ')';
}

Debug.prototype.getMessage = function(){
  return this.message;
}
