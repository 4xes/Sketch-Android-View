@import 'library/common.js'
@import 'library/fetch.js'
@import 'library/shape.js'
@import 'library/devel-tools.js'
@import 'library/tinytim.js'

var PLUGIN_PATH = '/Users/alex/Library/Application\ Support/com.bohemiancoding.sketch3/Plugins/android-custom-view.sketchplugin/Contents/Sketch/';
var OUT_DIR = '/Users/alex/Documents/Projects/Plugin/out/';

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
		fileName: "CustomVectorView",
		shapesProperties: "",
		paintsProperties: "",
		paintInit: "",
		shapesInit: "",
		regionsInit: "",
		draw: "",
		SurficeSize: surficeSize
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

	log(paints);
	writeTemplate("view.java", OUT_DIR + data.className + '.java', data);
};

function writeTemplate(tmpl, path, locals){
  locals = locals || {}

  var filePath = PLUGIN_PATH + '/templates/' + tmpl
  var template = [NSString stringWithContentsOfFile:filePath
                                           encoding:NSUTF8StringEncoding
                                              error:null]
  var layout = tim(template, locals);
  layout = [NSString stringWithString:layout]
  [layout writeToFile:path atomically:false]
	log("complete");
}
