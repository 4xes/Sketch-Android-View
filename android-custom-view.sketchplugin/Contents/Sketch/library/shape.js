@import 'library/common.js'
@import 'library/devel-tools.js'
@import 'library/string.js'

var code = {};

var sp = '    ';
var sp2x = sp + sp;

var Paints = function(){
    this.db = {};
    this.db['paint'] = {};
    this.db['names'] = {};
    this.db['properties'] = [];
    this.db['inits'] = [];
    this.count = 0;
}

Paints.prototype.properties = function(){
    return this.db['properties'];
}

Paints.prototype.inits = function(){
    return this.db['inits'];
}

Paints.prototype.newTextName = function(){
    return 'paintText' + (this.count++);
}

Paints.prototype.newFillName = function(){
    return 'paintFill' + (this.count++);
}

Paints.prototype.newBorderName = function(){
    return 'paintBorder' + (this.count++);
}

Paints.prototype.newProperty = function(name){
    return sp + 'private Paint ' + name + ';\n';
}

Paints.prototype.addPaint = function(item){
    if(item.className() == 'MSTextLayer'){
        var property = item.style().sharedObjectID();
        if (!this.db['paint'].hasOwnProperty(property)) {
            this.db['paint'][property] = item.style();

            var textName = this.newTextName();
            this.db['names'][property] = textName;
            this.db['properties'].push(this.newProperty(textName));
            this.db['inits'].push(this.createInitTextPaint(item, textName));
        }
    }

    if(item.className() == 'MSShapePathLayer'){
        var parent = item.parentGroup();
        var property = parent.style().objectID();

        if (!this.db['paint'].hasOwnProperty(property)) {
            this.db['paint'][property] = parent.style();

            var fill = [[parent style] fill];
            var border = [[parent style] border];

            var nameFill = fill? this.newFillName(): null;
            var nameBorder = border? this.newBorderName(): null;

            this.db['names'][property] = {'fill': nameFill, 'border': nameBorder};

            if(fill){
                this.db['properties'].push(this.newProperty(nameFill));
                this.db['inits'].push(this.newInitFillPaint(parent, nameFill));
            }
            if(border){
                this.db['properties'].push(this.newProperty(nameBorder));
                this.db['inits'].push(this.newInitBorderPaint(parent, nameBorder));
            }
        }
    }
}

Paints.prototype.newInitBorderPaint = function(parent, name){
    var color = [[[parent style] border] color];
    var thickness = [[[parent style] border] thickness];
    return sp2x + name + ' = new Paint();\n' +
         sp2x + name + '.setAntiAlias(true);\n' +
         sp2x + name + '.setColor(' + this.parseFullColor(color) + ');\n' +
         sp2x + name + '.setStyle(Paint.Style.STROKE);\n' +
         sp2x + name + '.setStrokeWidth(' + thickness + 'f * density);\n';
}

Paints.prototype.newInitFillPaint = function(parent, name){
    var color = [[[parent style] fill] color];
    return sp2x + name + ' = new Paint();\n' +
         sp2x + name + '.setAntiAlias(true);\n' +
         sp2x + name + '.setColor(' + this.parseFullColor(color) + ');\n' +
         sp2x + name + '.setStyle(Paint.Style.FILL);\n';
}

Paints.prototype.createInitTextPaint = function(item, name){
    return sp2x + name + ' = new Paint();\n' +
         sp2x + name + '.setAntiAlias(true);\n' +
        sp2x + name + '.setTextSize(' + item.fontSize() + ' * density);\n' +
        sp2x + name + '.setTextAlign(Paint.Align.CENTER);\n' +
        sp2x + name + '.setColor(' + this.parseFullColor(item.textColor()) + ');\n';
}

Paints.prototype.parseFullColor = function(color){
    var hexAlpha = Math.floor(color.alpha() * 255).toString(16).toUpperCase();
    hexAlpha = hexAlpha.length == 2? hexAlpha: hexAlpha + '0';
    return '0x' + hexAlpha + color.hexValue().toString();
}

Paints.prototype.parseColor = function(item){
    return '0x' + item.textColor().hexValue().toString();
}

Paints.prototype.getTextPaintName = function(item){
    return this.db['names'][item.style().sharedObjectID()];
}

Paints.prototype.getPathPaintName = function(item){
    return this.db['names'][item.parentGroup().style().objectID()];
}

var Text = function(layer){
  [layer makeNameUnique];
  this.layer = layer;

  var indexOptions = [layer name].indexOf('#');
  var options = indexOptions != -1? [layer name].substr(indexOptions+1): null;
  var clearName = (options ? [layer name].substr(0, indexOptions): [layer name]).replace(/\s+/g, '');
  if(/^\d+$/.test(clearName.substr(0,1))){
    clearName = 'text' + clearName;
  }
  this.name = clearName;
  this.onClick = options != null? options.indexOf('noclick') == -1: true;
}

Text.prototype.draw = function(paints){
    var textLayer = this.layer;
    var rect = [textLayer absoluteRect];
    return sp2x + 'canvas.drawText(\"' + textLayer.stringValue() + '\", ' + (rect.midX()) +  'f * density, ' + (rect.midY() + (rect.height() /2)) + 'f * density, ' + paints.getTextPaintName(textLayer) + ');\n';
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

    this.path = this.getBezierPath(this._layer);
    this.property = this.getProperty();
    this.regionPropery = this.getPropertyRegion();
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

Shape.prototype.getDraw = function(paints){
  var paintsName = paints.getPathPaintName(this._layer);
  var draw = '';
  if(paintsName['fill']){
      draw += sp2x + 'canvas.drawPath(' + this.name + ',' + paintsName['fill']  + ');\n';
  }
  if(paintsName['border']){
      draw += sp2x + 'canvas.drawPath(' + this.name + ',' + paintsName['border']  + ');\n';
  }
  return draw;
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
