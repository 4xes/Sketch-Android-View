@import 'library/common.js'
@import 'library/devel-tools.js'
@import 'library/string.js'

var code = {};

var sp = '    ';
var sp2x = sp + sp;

var Paints = function(){
    this.styles = {};
    this.styles['textPaint'] = {};
    this.styles['namePaint'] = {};
    this.styles['propertiesPaint'] = {};
    this.styles['initPaint'] = {};
    this.numberPaint = 0;
}

Paints.prototype.addPaint = function(item){
    if(item.className() == 'MSTextLayer'){
        var property = item.style().sharedObjectID();
        if (!this.styles['textPaint'].hasOwnProperty(property)) {
            this.styles['textPaint'][property] = item.style();
            var name = 'paint' + this.numberPaint;
            this.styles['namePaint'][property] = name;
            this.styles['propertiesPaint'][property] = sp + 'private Paint ' + name + ';';
            this.styles['initPaint'][property] = this.createInitTextPaint(item, name);
            this.numberPaint++;
        }
    }
}

Paints.prototype.createInitTextPaint = function(item, name){
    tools.dump(item.textColor());
    return sp2x + 'Paint ' + name + ' = new Paint();\n' +
        name + '.setAntiAlias(true);\n' +
        name + '.setTextSize(' + item.fontSize() + ' * density);\n' +
        name + '.setTextAlign(Paint.Align.CENTER);\n' +
        name + '.setColor(' + this.parseColor(item) + ');\n';
}

Paints.prototype.parseColor = function(item){
    var color = item.textColor().hexValue().toString();
    if(color.length() == 6){
        return '0xFF' + color;
    }else{
        return color;
    }
}

Paints.prototype.getPaintName = function(item){
    return this.styles['namePaint'][item.style().sharedObjectID()];
}

var Text = function(layer){
  [layer makeNameUnique];
  this._layer = layer;

  var indexOptions = [layer name].indexOf('#');
  var options = indexOptions != -1? [layer name].substr(indexOptions+1): null;
  var clearName = (options ? [layer name].substr(0, indexOptions): [layer name]).replace(/\s+/g, '');
  if(/^\d+$/.test(clearName.substr(0,1))){
    clearName = 'text' + clearName;
  }
  this.name = clearName;
  this.onClick = options != null? options.indexOf('noclick') == -1: true;


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

  var code = new ShapeInit(this.name);

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
  return code.getString();
}

var ShapeInit = function(name){
  this.name = name;
  this.code = sp2x + this.name + ' = new Path();\n';
}

ShapeInit.prototype.cubicTo = function(x1, y1, x2, y2, x3, y3){
  this.code += sp2x + this.name + '.cubicTo(' + this.dp(x1) + ', ' + this.dp(y1) + ', ' + this.dp(x2) + ', ' + this.dp(y2) + ', ' + this.dp(x3) + ', ' + this.dp(y3) + ');\n';
}

ShapeInit.prototype.moveTo = function(x, y){
  this.code += sp2x + this.name + '.moveTo(' + this.dp(x) + ', ' + this.dp(y) + ');\n';
}

ShapeInit.prototype.lineTo = function(x, y){
  this.code += sp2x + this.name + '.lineTo(' + this.dp(x) + ', ' + this.dp(y) + ');\n';
}

ShapeInit.prototype.close = function(){
  this.code += sp2x + this.name + '.close();\n';
}

ShapeInit.prototype.getString = function(){
  return this.code;
}

ShapeInit.prototype.dp = function(px){
  return px + 'f * density';
}
