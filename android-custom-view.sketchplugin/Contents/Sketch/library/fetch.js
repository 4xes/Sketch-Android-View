var f = {};
/*
It pulls out all figures of the selected object
@out
*/
f.fetch = function (obj, error){
    var figures = {};
    figures['paths'] = [];
    figures['texts'] = [];

    if(!obj){
        error('Nothing is fetching');
        return null;
    }

    f.fetching(figures, obj);

    if(figures['paths'].length == 0 && figures['texts'].length == 0){
        error('Can\'t find figures');
        return null;
    }
    return figures;
};

f.fetching = function (figures, obj) {
    switch ([obj class]) {
        case __NSArrayI:
            f.fetchArray(figures, obj);
            break;
        case MSLayerGroup:
        case MSShapeGroup:
            f.fetchArray(figures, [obj layers]);
            break;
        case MSShapePathLayer:
            figures['paths'].push(obj);
            break;
        case MSTextLayer:
            tools.dump(obj);
            figures['texts'].push(obj);
            break;
    }
};

f.fetchArray = function(figures, obj){
    if([obj count] == 0){
        return [];
    }else{
        for(var i = 0; i < [obj count]; i++){
            f.fetching(figures, [obj objectAtIndex:i]);
        }
    }
};
