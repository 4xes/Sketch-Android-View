var f = {};
/*
It pulls out all shapes of the selected object
@out
*/
f.fetch = function (obj, error){
    var shapes = [];
    if(!obj){
      error('Nothing is fetching');
      return null;
    }

    f.fetching(shapes, obj);

    if(shapes.length == 0){
      error('Can\'t find shapes');
      return null;
    }
    return shapes;
};

f.fetching = function (shapes, obj) {
  switch ([obj class]) {
    case __NSArrayI:
      f.fetch_NSArrayI(shapes, obj);
      break;
    case MSLayerGroup:
      f.fetch_NSArrayI(shapes, [obj layers])
      break;
    case MSShapeGroup:
      f.fetch_NSArrayI(shapes, [obj layers]);
      break;
    case MSShapePathLayer:
      //фигура
      shapes.push(obj);
      break;

    default:
      break;
  }
};

f.fetch_NSArrayI = function(shapes, obj){
  if([obj count] == 0){
    return [];
  }else{
    for(var i = 0; i < [obj count]; i++){
      f.fetching(shapes, [obj objectAtIndex:i]);
    }
  }
};
