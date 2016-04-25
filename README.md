# Sketch-Android-View
## This plugin will help you create view with shape's path and all styles.

### Why this need?
1. If you want determine click on very complex form view 
2. 

### What's support?
1. Text
2. Rectangle
3. Circle
4. VectorPath
5. Borders
6. Styles


### How to use?
1. Determine layers, rect, circle and other with names with '#'
2. Default all shapes adding to onclick listener. [In default template.](../master/android-custom-view.sketchplugin/Contents/Sketch/templates/scrollView.java)
  ```java
          @Override
          //listener click on shapes
          public boolean onSingleTapConfirmed(MotionEvent e) {
              mPoint.x = (int)e.getX() + mScroll.x;
              mPoint.y = (int)e.getY() + mScroll.y;
  
              for(int i = 0; i< mRegions.size(); i++){
                  if(mRegions.valueAt(i).contains(mPoint.x, mPoint.y)){
                      //logging click
                      Log.d(TAG, "Touch inside " + mRegions.keyAt(i));
                  }
              }
              return true;
          }
  ```
3. You can determine custom template for class view.
4. Also need change settings for saving class in [options.js](../master/android-custom-view.sketchplugin/Contents/Sketch/options.js)

[How to install](http://developer.sketchapp.com/introduction/)
