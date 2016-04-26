package {{packageName}};

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

public class {{viewName}} extends View {
    public static final String TAG = "{{viewName}}";


    public OnScrollListener getScrollListener() {
        return mScrollListener;
    }

    public void setScrollListener(OnScrollListener mScrollListener) {
        this.mScrollListener = mScrollListener;
        if(mScrollListener != null){
            mScrollListener.onChangeSize(mSize.x, mSize.y);
            mScrollListener.onChangeContent(mContent.width(), mContent.height());
            mScrollListener.onChangeScroll(mScroll.x, mScroll.y);
        }
    }

    public interface OnScrollListener {
        void onChangeScroll(final int x, final int y);

        void onChangeContent(final int width,final int height);

        void onChangeSize(final int maxWidth, final int maxHeight);
    }

    private OnScrollListener mScrollListener;
    private GestureDetectorCompat mGestureDetector;
    private OverScroller mScroller;
    private ArrayMap<String, Region> mRegions = new ArrayMap<>();

    /**
     * mContent is visible space
     */
    private Rect mContent = new Rect();
    /**
     * mSize is full size drawing space
     * .x - right side
     * .y - bottom side
     */
    private Point mSize = new Point();

    /**
     * mScroll current offset scroll
     * .x - between 0 and mSize.x
     * .y - between 0 and mSize.y
     */
    private Point mScroll = new Point();
    private Point mPoint = new Point();
    protected boolean hasVerticalScroll;
    protected boolean hasHorizontalScroll;

    private float density;

{{shapesProperties}}
{{paintsProperties}}

    public {{viewName}}(Context context) {
        super(context);
        init(context);
    }

    public {{viewName}}(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public {{viewName}}(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    public {{viewName}}(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
        init(context);
    }

    public void init(Context context) {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.JELLY_BEAN) {
            setLayerType(View.LAYER_TYPE_SOFTWARE, null);
        }
        density = context.getResources().getDisplayMetrics().density;

        mGestureDetector = new GestureDetectorCompat(context, mGestureListener);
        mScroller = new OverScroller(context);
        mSize.set({{sizeView}});

        if (mScrollListener != null) {
            mScrollListener.onChangeSize(mSize.x, mSize.y);
        }

{{paintInit}}
{{shapesInit}}
        RectF bounds = new RectF();
{{regionsInit}}
    }

    @Override
    public void onDraw(Canvas canvas) {
        canvas.translate(-mScroll.x, -mScroll.y);
{{draw}}
    }

    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        mContent.set(
                getPaddingLeft(),
                getPaddingTop(),
                getWidth() - getPaddingRight(),
                getHeight() - getPaddingBottom());

        hasHorizontalScroll = mContent.width() < mSize.x;
        hasVerticalScroll = mContent.height() < mSize.y;

        if(mScrollListener != null){
            mScrollListener.onChangeContent(mContent.width(), mContent.height());
        }
    }

    @Override
    public void computeScroll() {
        super.computeScroll();

        if (mScroller.computeScrollOffset()) {
            // The scroller isn't finished, meaning a fling or programmatic pan operation is
            // currently active.

            int currX = mScroller.getCurrX();
            int currY = mScroller.getCurrY();

            float currXRange = currX - mScroll.x;
            float currYRange = currY - mScroll.y;
            setViewportBottomLeft(currXRange, currYRange);
        }
    }

@Override protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
    int minSizeWidth = mSize.x;
    int minSizeHeight = mSize.y;

    setMeasuredDimension(Math.max(getSuggestedMinimumWidth(),
    resolveSize(minSizeWidth + getPaddingLeft() + getPaddingRight(), widthMeasureSpec)),
    Math.max(getSuggestedMinimumHeight(),
    resolveSize(minSizeHeight + getPaddingTop() + getPaddingBottom(), heightMeasureSpec)));
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
            ViewCompat.postInvalidateOnAnimation({{viewName}}.this);
            return true;
        }


        //handle clicks
        @Override
        public boolean onSingleTapConfirmed(MotionEvent e) {
            mPoint.x = (int)e.getX() + mScroll.x;
            mPoint.y = (int)e.getY() + mScroll.y;

            boolean handled = false;
            //check in all shapes
            for(int i = 0; i< mRegions.size(); i++){
                //check i touched shape[i]
                if(mRegions.valueAt(i).contains(mPoint.x, mPoint.y)){
                    Log.d(TAG, "Touch inside " + mRegions.keyAt(i));
                    handled = true;
                }
            }
            return handled;
        }
    };

    private void setViewportBottomLeft(float dx, float dy) {
        float x = 0;
        float y = 0;
        if (hasHorizontalScroll) {
            x = mScroll.x + dx < 0 ? 0 : mScroll.x + dx + mContent.width() < mSize.x ? mScroll.x + dx
            : mSize.x - mContent.width();
        }
        if (hasVerticalScroll) {
            y = mScroll.y + dy < 0 ? 0 : mScroll.y + dy + mContent.height() < mSize.y ? mScroll.y + dy
            : mSize.y - mContent.height();
        }
        if(!mScroll.equals((int)x, (int)y)) {
            mScroll.set((int)x, (int)y);
            ViewCompat.postInvalidateOnAnimation(this);

            if(mScrollListener != null){
                mScrollListener.onChangeScroll(mScroll.x, mScroll.y);
            }
        }
    }


    private void fling(int velocityX, int velocityY) {
        mScroller.forceFinished(true);
        mScroller.fling(
                mScroll.x,
                mScroll.y,
                velocityX/2,
                velocityY/2,
                0, mSize.x - mContent.width(),
                0, mSize.y - mContent.height(),
                mContent.width() / 2,
                mContent.height() / 2);
        ViewCompat.postInvalidateOnAnimation(this);
    }
}
