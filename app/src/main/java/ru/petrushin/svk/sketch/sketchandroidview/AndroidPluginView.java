package ru.petrushin.svk.sketch.sketchandroidview;

import android.annotation.TargetApi;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.Point;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Region;
import android.os.Build;
import android.support.annotation.NonNull;
import android.support.design.widget.Snackbar;
import android.support.v4.util.ArrayMap;
import android.support.v4.view.GestureDetectorCompat;
import android.support.v4.view.ViewCompat;
import android.util.AttributeSet;
import android.view.GestureDetector;
import android.view.MotionEvent;
import android.view.View;
import android.widget.OverScroller;

import java.util.ArrayList;
import java.util.List;

public class AndroidPluginView extends View {
    public static final String TAG = "AndroidPluginView";

    public OnScrollListener getScrollListener() {
        return mScrollListener;
    }

    public void setScrollListener(OnScrollListener mScrollListener) {
        this.mScrollListener = mScrollListener;
        if (mScrollListener != null) {
            mScrollListener.onChangeSize(mSize.x, mSize.y);
            mScrollListener.onChangeContent(mContent.width(), mContent.height());
            mScrollListener.onChangeScroll(mScroll.x, mScroll.y);
        }
    }

    public interface OnScrollListener {
        void onChangeScroll(final int x, final int y);

        void onChangeContent(final int width, final int height);

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

    private Path shape0;
    private Path Path;

    private Paint paintFill0;
    private Paint paintFill1;
    private Paint paintBorder2;
    private Paint paintText3;
    private Paint paintText4;

    public class PointClick {
        Point point;
        boolean inTarget;

        public PointClick(Point point, boolean inTarget) {
            this.point = point;
            this.inTarget = inTarget;
        }
    }

    //for demo
    List<PointClick> clicksList = new ArrayList<>();
    //paint demo
    private Paint paintDemoInTarget;
    private Paint paintDemoInOut;


    public AndroidPluginView(Context context) {
        super(context);
        init(context);
    }

    public AndroidPluginView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public AndroidPluginView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    public AndroidPluginView(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
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
        mSize.set((int) ((60f * 2f + 240.1643993145264f) * density),
                (int) ((46f * 2f + 236.15048683552618f) * density));

        if (mScrollListener != null) {
            mScrollListener.onChangeSize(mSize.x, mSize.y);
        }

        paintFill0 = new Paint();
        paintFill0.setAntiAlias(true);
        paintFill0.setColor(0xFFDF1515);
        paintFill0.setStyle(Paint.Style.FILL);
        paintFill1 = new Paint();
        paintFill1.setAntiAlias(true);
        paintFill1.setColor(0xFF3771F8);
        paintFill1.setStyle(Paint.Style.FILL);

        //demo paints
        paintDemoInTarget = new Paint();
        paintDemoInTarget.setAntiAlias(true);
        paintDemoInTarget.setColor(Color.CYAN);
        paintDemoInTarget.setStyle(Paint.Style.FILL);
        paintDemoInOut = new Paint();
        paintDemoInOut.setAntiAlias(true);
        paintDemoInOut.setColor(Color.YELLOW);
        paintDemoInOut.setStyle(Paint.Style.FILL);

        paintBorder2 = new Paint();
        paintBorder2.setAntiAlias(true);
        paintBorder2.setColor(0xFF979797);
        paintBorder2.setStyle(Paint.Style.STROKE);
        paintBorder2.setStrokeWidth(1f * density);
        paintText3 = new Paint();
        paintText3.setAntiAlias(true);
        paintText3.setTextSize(24 * density);
        paintText3.setTextAlign(Paint.Align.CENTER);
        paintText3.setColor(0xFFFFFFFF);
        paintText4 = new Paint();
        paintText4.setAntiAlias(true);
        paintText4.setTextSize(24 * density);
        paintText4.setTextAlign(Paint.Align.CENTER);
        paintText4.setColor(0xFF099CFF);

        shape0 = new Path();
        shape0.moveTo(154.078075f * density, 196.018193f * density);
        shape0.cubicTo(140.17113999999998f * density, 199.54633f * density, 193.192787f * density,
                282.132745f * density, 193.192787f * density, 282.132745f * density);
        shape0.cubicTo(193.192787f * density, 282.132745f * density, 125.269656f * density,
                199.049927f * density, 113.497578f * density, 199.650798f * density);
        shape0.cubicTo(87.38287199999999f * density, 200.983746f * density, 126.218452f * density,
                279.832675f * density, 126.218452f * density, 279.832675f * density);
        shape0.cubicTo(126.218452f * density, 279.832675f * density, 82.017668f * density,
                215.140878f * density, 65.840749f * density, 169.178151f * density);
        shape0.cubicTo(60.375304f * density, 153.64943499999998f * density, 58.108662f * density,
                140.258561f * density, 61.826142f * density, 132.222626f * density);
        shape0.cubicTo(68.440832f * density, 117.923903f * density, 97.222905f * density,
                106.188846f * density, 129.216407f * density, 98.830171f * density);
        shape0.cubicTo(131.684775f * density, 98.262433f * density, 173.287927f * density,
                49.774962f * density, 218.580464f * density, 46.05207f * density);
        shape0.cubicTo(263.873001f * density, 42.329177f * density, 240.962761f * density,
                239.46888f * density, 242.413518f * density, 243.269083f * density);
        shape0.cubicTo(243.61287f * density, 246.410741f * density, 230.823288f * density,
                275.66839f * density, 224.824064f * density, 282.132738f * density);
        shape0.cubicTo(222.684962f * density, 284.437686f * density, 252.448017f * density,
                61.470843f * density, 218.580464f * density, 61.470843f * density);
        shape0.cubicTo(184.71291100000002f * density, 61.470844f * density, 144.410284f * density,
                95.690227f * density, 146.108632f * density, 95.382957f * density);
        shape0.cubicTo(181.299057f * density, 89.016213f * density, 215.227887f * density,
                87.424365f * density, 215.227887f * density, 87.424365f * density);
        shape0.cubicTo(215.227887f * density, 87.424365f * density, 157.389902f * density,
                104.19494f * density, 169.30952200000002f * density, 126.077519f * density);
        shape0.cubicTo(173.272137f * density, 133.35226699999998f * density, 300.164399f * density,
                180.802195f * density, 300.164399f * density, 180.802195f * density);
        shape0.cubicTo(300.164399f * density, 180.802195f * density, 166.34282000000002f * density,
                150.363058f * density, 166.84143699999998f * density, 159.062573f * density);
        shape0.cubicTo(167.738271f * density, 174.709915f * density, 277.059412f * density,
                243.26909f * density, 277.059412f * density, 243.26909f * density);
        shape0.cubicTo(277.059412f * density, 243.26909f * density, 179.689625f * density,
                189.52064f * density, 154.078075f * density, 196.018193f * density);
        shape0.close();
        Path = new Path();
        Path.moveTo(193f * density, 138.717913f * density);
        Path.lineTo(206.34182f * density, 78f * density);
        Path.lineTo(236f * density, 132.50115399999999f * density);
        Path.lineTo(193f * density, 138.717913f * density);
        Path.close();

        RectF bounds = new RectF();
        shape0.computeBounds(bounds, true);
        Region regionShape0 = new Region();
        regionShape0.setPath(shape0,
                new Region((int) bounds.left, (int) bounds.top, (int) bounds.right, (int) bounds.bottom));
        mRegions.put("shape0", regionShape0);
        Path.computeBounds(bounds, true);
        Region regionPath = new Region();
        regionPath.setPath(Path,
                new Region((int) bounds.left, (int) bounds.top, (int) bounds.right, (int) bounds.bottom));
        mRegions.put("Path", regionPath);
    }

    public void showMessage(String message) {
        Snackbar.make((View) getParent(), message, Snackbar.LENGTH_SHORT).show();
    }

    @Override
    public void onDraw(Canvas canvas) {
        canvas.translate(-mScroll.x, -mScroll.y);
        canvas.drawPath(shape0, paintFill0);
        canvas.drawPath(Path, paintFill1);
        canvas.drawPath(Path, paintBorder2);
        canvas.drawText("Figure 1", 116f * density, 164f * density, paintText3);
        canvas.drawText("Sample text", 83.5f * density, 90f * density, paintText4);

        for(PointClick point: clicksList){
            canvas.drawCircle(point.point.x, point.point.y, 3 * density, point.inTarget? paintDemoInTarget: paintDemoInOut);
        }
    }

    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        mContent.set(getPaddingLeft(), getPaddingTop(), getWidth() - getPaddingRight(),
                getHeight() - getPaddingBottom());

        hasHorizontalScroll = mContent.width() < mSize.x;
        hasVerticalScroll = mContent.height() < mSize.y;

        if (mScrollListener != null) {
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

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
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

    private final GestureDetector.SimpleOnGestureListener mGestureListener =
            new GestureDetector.SimpleOnGestureListener() {
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
                    ViewCompat.postInvalidateOnAnimation(AndroidPluginView.this);
                    return true;
                }

                //handle clicks
                @Override
                public boolean onSingleTapConfirmed(MotionEvent e) {
                    mPoint.x = (int) e.getX() + mScroll.x;
                    mPoint.y = (int) e.getY() + mScroll.y;

                    boolean handled = false;
                    //check in all shapes
                    for (int i = 0; i < mRegions.size(); i++) {
                        //check i touched shape[i]
                        if (mRegions.valueAt(i).contains(mPoint.x, mPoint.y)) {
                            showMessage("Click on " + mRegions.keyAt(i));

                            clicksList.add(new PointClick(new Point(mPoint), true));
                            handled = true;
                        }
                    }
                    if (!handled) {
                        clicksList.add(new PointClick(new Point(mPoint), false));
                        showMessage("Not in shape");
                    }
                    invalidate();
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

        if (!mScroll.equals((int) x, (int) y)) {
            mScroll.set((int) x, (int) y);
            ViewCompat.postInvalidateOnAnimation(this);

            if (mScrollListener != null) {
                mScrollListener.onChangeScroll(mScroll.x, mScroll.y);
            }
        }
    }

    private void fling(int velocityX, int velocityY) {
        mScroller.forceFinished(true);
        mScroller.fling(mScroll.x, mScroll.y, velocityX / 2, velocityY / 2, 0,
                mSize.x - mContent.width(), 0, mSize.y - mContent.height(), mContent.width() / 2,
                mContent.height() / 2);
        ViewCompat.postInvalidateOnAnimation(this);
    }
}
