package org.armstrong.arena;

import android.annotation.TargetApi;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.Point;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Region;
import android.os.Build;
import android.support.annotation.NonNull;
import android.support.v4.util.ArrayMap;
import android.support.v4.view.GestureDetectorCompat;
import android.support.v4.view.ViewCompat;
import android.util.AttributeSet;
import android.util.Log;
import android.view.GestureDetector;
import android.view.MotionEvent;
import android.view.View;
import android.widget.OverScroller;

public class {{fileName}} extends View{
  public static final String TAG = "{{fileName}}";
  private GestureDetectorCompat mGestureDetector;
  private OverScroller mScroller;
  private ArrayMap<String, Region> mRegions = new ArrayMap<>();

  private Rect mContentRect = new Rect();
  private Point mSurfaceSize = new Point();
  private Point mStartViewPort = new Point();
  private Point mPoint = new Point();


  private Paint mPaint;

{{shapesProperties}}
{{paintsProperties}}



    public {{fileName}}(Context context) {
        super(context);
        init(context);
    }

    public {{fileName}}(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public {{fileName}}(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    public {{fileName}}(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
        init(context);
    }

    public void init(Context context){
      float density = context.getResources().getDisplayMetrics().density;

      mGestureDetector = new GestureDetectorCompat(context, mGestureListener);
      mScroller = new OverScroller(context);
      mSurfaceSize.set({{SurficeSize}});

      mPaint = new Paint();
      mPaint.setAntiAlias(true);
      mPaint.setColor(0xFFC9CDD0);
      mPaint.setStyle(Paint.Style.FILL);

{{paintInit}}
{{shapesInit}}

        RectF bounds = new RectF();
{{regionsInit}}
    }


    @Override
    public void onDraw(Canvas canvas) {
      canvas.translate(-mStartViewPort.x, -mStartViewPort.y);
{{draw}}
    }

    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        mContentRect.set(
                getPaddingLeft(),
                getPaddingTop(),
                getWidth() - getPaddingRight(),
                getHeight() - getPaddingBottom());
    }

    @Override
    public void computeScroll() {
        super.computeScroll();

        if (mScroller.computeScrollOffset()) {
            // The scroller isn't finished, meaning a fling or programmatic pan operation is
            // currently active.

            int currX = mScroller.getCurrX();
            int currY = mScroller.getCurrY();

            float currXRange = currX - mStartViewPort.x;
            float currYRange = currY - mStartViewPort.y;
            setViewportBottomLeft(currXRange, currYRange);
        }
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int minSize = (int) (200 * getContext().getResources().getDisplayMetrics().density);
        setMeasuredDimension(
                Math.max(getSuggestedMinimumWidth(),
                        resolveSize(minSize + getPaddingLeft() + getPaddingRight(),
                                widthMeasureSpec)),
                Math.max(getSuggestedMinimumHeight(),
                        resolveSize(minSize + getPaddingTop() + getPaddingBottom(),
                                heightMeasureSpec)));
    }

    @Override
    public boolean onTouchEvent(@NonNull MotionEvent event) {
        return mGestureDetector.onTouchEvent(event);
    }

    private final GestureDetector.SimpleOnGestureListener mGestureListener = new GestureDetector.SimpleOnGestureListener(){
        @Override
        public boolean onFling(MotionEvent e1, MotionEvent e2, float velocityX, float velocityY) {
            fling((int) -velocityX, (int) -velocityY);
            return true;
        }

        @Override
        public boolean onScroll(MotionEvent e1, MotionEvent e2, float distanceX, float distanceY) {
            setViewportBottomLeft((int) distanceX, (int) distanceY);
            return true;
        }

        @Override
        public boolean onDown(MotionEvent e) {
            mScroller.forceFinished(true);
            ViewCompat.postInvalidateOnAnimation(CustomVectorView.this);
            return true;
        }



        @Override
        public boolean onSingleTapConfirmed(MotionEvent e) {
            mPoint.x = (int)e.getX() + mStartViewPort.x;
            mPoint.y = (int)e.getY() + mStartViewPort.y;

            for(int i = 0; i< mRegions.size(); i++){
                if(mRegions.valueAt(i).contains(mPoint.x, mPoint.y)){
                    Log.d(TAG, "Touch inside " + mRegions.keyAt(i));
                }
            }
            return true;
        }
    };

    private void setViewportBottomLeft(float dx, float dy) {
        float x = mStartViewPort.x + dx < 0 ? 0:
                mStartViewPort.x + dx + mContentRect.width() < mSurfaceSize.x ? mStartViewPort.x + dx: mSurfaceSize.x - mContentRect.width();
        float y  = mStartViewPort.y + dy < 0 ? 0:
                mStartViewPort.y + dy + mContentRect.height() < mSurfaceSize.y ? mStartViewPort.y + dy: mSurfaceSize.y - mContentRect.height();
        if(!mStartViewPort.equals((int)x, (int)y)) {
            mStartViewPort.set((int)x, (int)y);
            ViewCompat.postInvalidateOnAnimation(this);
        }
    }


    private void fling(int velocityX, int velocityY) {
        mScroller.forceFinished(true);
        mScroller.fling(
                mStartViewPort.x,
                mStartViewPort.y,
                velocityX/2,
                velocityY/2,
                0, mSurfaceSize.x - mContentRect.width(),
                0, mSurfaceSize.y - mContentRect.height(),
                mContentRect.width() / 2,
                mContentRect.height() / 2);
        ViewCompat.postInvalidateOnAnimation(this);
    }
}
