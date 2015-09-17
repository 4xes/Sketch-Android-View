@import 'library/common.js'
@import 'library/fetch.js'
@import 'library/shape.js'
@import 'library/devel-tools.js'
@import 'library/tinytim.js'
@import 'options.js'

var onRun = function (context) {
	var doc = context.document;
	var selection = context.selection;

	var figures = f.fetch(selection, function(message) {
    	ui.alert('Error', 'Fetch: ' + message);
	});

	if(!figures){
		return;
	}

	var message = 'Paths ' + figures['paths'].length + ', texts ' + figures['texts'].length;
	ui.alert('Shapes', message);

	var surficeSize = '(int)((' + selection[0].frame().x() + 'f * 2f + ' + selection[0].frame().width() + 'f) * density), '
									+ '(int)((' + selection[0].frame().y() + 'f * 2f + ' + selection[0].frame().height() + 'f) * density)';

	var data = {
		viewName: options.out.viewName,
		packageName: options.out.packageName,
		shapesProperties: "",
		paintsProperties: "",
		paintInit: "",
		shapesInit: "",
		regionsInit: "",
		draw: "",
		sizeView: surficeSize
	};

	var paints = new Paints();
	for(var i = 0; i < figures['paths'].length; i++){
		var figure = figures['paths'][i];
		paints.addPaint(figure);
		var shape = new Shape(figure);

		data.shapesProperties += shape.getProperty();
		data.shapesInit += shape.getShapeInit();
		data.regionsInit += shape.getRegionInit();
		data.draw += shape.getDraw(paints);
	}

	for(var i = 0; i < figures['texts'].length; i++){
		var figure = figures['texts'][i];
		paints.addPaint(figure);
		var text = new Text(figure);
		data.draw += text.draw(paints);
	}

	paints.properties().forEach(function(item, i, arr) {
  		data.paintsProperties += item;
	});

	paints.inits().forEach(function(item, i, arr) {
  		data.paintInit += item;
	});

	out(data);
};

function readTemplate(){
	var tmplPath = options.plugin.templatePath + options.plugin.template;
	return [NSString stringWithContentsOfFile:tmplPath
                                           encoding:NSUTF8StringEncoding
                                              error:null];
}

function writeView(layout){
	var outPath = options.out.path + options.out.viewName + '.java';
	[[NSString stringWithString:layout] writeToFile:outPath atomically:false];
}

function out(locals){
	locals = locals || {}
	var template = readTemplate();
	var layout = tim(template, locals);
  	writeView(layout);
}
