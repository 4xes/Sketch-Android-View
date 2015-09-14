@import 'library/common.js'
@import 'library/devel-tools.js'

var code = {};

var sp = '    ';
var sp2x = sp + sp;

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

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
    this.path = this.getBezierPath(this._layer);
    this.property = this.getProperty();
    this.regionPropery = this.getPropertyRegion();
  }
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

Shape.prototype.getBezierPath = function(layer){
  var bezier = [layer bezierPath].toString().split('\n');
  var rect = [[layer parentGroup] absoluteRect];

  var code = new CodeInit(this.name);

  for(var i = 3; i < bezier.length; i++){
    var line = bezier[i].replace(/\s+/g, " ").split(' ');
    if(i != bezier.length - 1){
      var endLine = line[line.length-1];
      switch (endLine) {
        case 'moveto':
          code.moveTo(line[1] - 0 + rect.x(), line[2] - 0 + rect.y());
          break;
        case 'lineto':
          code.lineTo(line[1] - 0 + rect.x(), line[2] - 0 + rect.y());
          break;
        case 'curveto':
          code.cubicTo(line[1] - 0 + rect.x(), line[2] - 0 + rect.y(), line[3] - 0 + rect.x(), line[4] - 0 + rect.y(), line[5] - 0 + rect.x(), line[6] - 0 + rect.y());
          break;
        case 'closepath':
          code.close();
          break;
      }
    }
  }
  return code.getCode();
}

var CodeInit = function(name){
  this.name = name;
  this.code = sp2x + this.name + ' = new Path();\n';
}

CodeInit.prototype.cubicTo = function(x1, y1, x2, y2, x3, y3){
  this.code += sp2x + this.name + '.cubicTo(' + this.dp(x1) + ', ' + this.dp(y1) + ', ' + this.dp(x2) + ', ' + this.dp(y2) + ', ' + this.dp(x3) + ', ' + this.dp(y3) + ');\n';
}

CodeInit.prototype.moveTo = function(x, y){
  this.code += sp2x + this.name + '.moveTo(' + this.dp(x) + ', ' + this.dp(y) + ');\n';
}

CodeInit.prototype.lineTo = function(x, y){
  this.code += sp2x + this.name + '.lineTo(' + this.dp(x) + ', ' + this.dp(y) + ');\n';
}

CodeInit.prototype.close = function(){
  this.code += sp2x + this.name + '.close();\n';
}

CodeInit.prototype.getCode = function(){
  return this.code;
}

CodeInit.prototype.dp = function(px){
  return px + 'f * density';
}
