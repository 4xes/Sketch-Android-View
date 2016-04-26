
# Sketch-Android-View
### This plugin allow you to generate Android graphics from sketch.
<img src="/art/demo.gif?raw=true" width=360 height=640 alt="Demo">

[How to install plugin](http://developer.sketchapp.com/introduction/)

### Why this need?
1. If you want determine click from not rectangle figures.
2. Create complicated custom view.

### What's support?
1. Text
2. Rectangle (Not supported, but you can convert it in vector path)
3. Circle
4. Vector
3. Line
5. Fill and border
6. Styles
7. Shadow (Not supported)


### How to use?
1. Change your paths in [options.js](../master/android-custom-view.sketchplugin/Contents/Sketch/options.js) 
    ```javascript
    
    var options = {
        template: {
            path: '/Users/{user}/Library/Application\ Support/com.bohemiancoding.sketch3/Plugins/android-custom-view.sketchplugin/Contents/Sketch/templates/ScrollView.java'
        },
        out:{
            path: '/Users/{user}/Documents/',
            packageName: 'com.example.plugin',
            viewName: 'CustomScrollView'
        }
    };
    
    ``` 
2. Create new sketch file, add artboard with positions (0,0).
3. Make names your shapes with '#'
4. Select your shapes.
    
  <img src="/art/screen0.png?raw=true" width=703 height=358 alt="Screen list">

5. Plugins -> AndroidVectorView -> Generate custom view.
6. Find you custom view in path witch your determine in (3).

### Also.
1. For default all shapes added for click listener. [Default template.](../master/android-custom-view.sketchplugin/Contents/Sketch/templates/CustomScrollView.java)
  ```java
    //handle clicks
    @Override public boolean onSingleTapConfirmed(MotionEvent e) {
      mPoint.x = (int) e.getX() + mScroll.x;
      mPoint.y = (int) e.getY() + mScroll.y;
      
      boolean handled = false;
      //check in all shapes
      for (int i = 0; i < mRegions.size(); i++) {
        //if touched any shape
        if (mRegions.valueAt(i).contains(mPoint.x, mPoint.y)) {
          showMessage("Click on " + mRegions.keyAt(i));
          handled = true;
        }
      }
    return handled;
    }
  ```
2. You can determine custom template for class view and set it in [options.js](../master/android-custom-view.sketchplugin/Contents/Sketch/options.js)

