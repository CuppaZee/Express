package app.cuppazee.express

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.util.Log
import android.view.View
import android.widget.RemoteViews
import androidx.concurrent.futures.CallbackToFutureAdapter.getFuture
import androidx.work.ListenableWorker
import androidx.work.WorkerParameters
import com.android.volley.Request
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley.newRequestQueue
import com.google.common.util.concurrent.ListenableFuture
import com.squareup.picasso.Picasso
import jp.wasabeef.picasso.transformations.CropCircleTransformation
import org.json.JSONException
import java.text.SimpleDateFormat
import java.util.*


class ActivityWidgetWorker(appContext: Context, workerParams: WorkerParameters):
        ListenableWorker(appContext, workerParams) {

    override fun startWork(): ListenableFuture<Result> {
        return getFuture {
            // Do the work here--in this case, upload the images.
            val appWidgetId = inputData.getInt("APP_WIDGET_ID", -1)
            val appWidgetManager = AppWidgetManager.getInstance(applicationContext)

            val sharedPref: SharedPreferences =
                applicationContext.getSharedPreferences("WIDGET_PREFERENCES", Context.MODE_PRIVATE)
            val username = sharedPref.getString("activity_widget_$appWidgetId", "Tap to Setup")

            Log.i("CZActivityWidget", "Updating $appWidgetId with Username $username")

            if(appWidgetId >= 0) {
                val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
                val minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH)
                val minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT)

                val calendar: Calendar = Calendar.getInstance()
                val formatter = SimpleDateFormat("HH:mm")

                if(username == "Tap to Setup") {
                    val views = getRemoteViews(applicationContext, minWidth, minHeight)
                    views.setViewVisibility(R.id.activity_widget_image_avatar, 0)
                    views.setTextViewText(R.id.activity_widget_text_daily_points, username)
                    views.setTextViewText(R.id.activity_widget_text_username, "")
                    views.setTextViewText(R.id.activity_widget_text_captures, "")
                    views.setTextViewText(R.id.activity_widget_text_deploys, "")
                    views.setTextViewText(R.id.activity_widget_text_passive, "")
                    views.setTextViewText(R.id.activity_widget_text_capon, "")
                    views.setTextViewText(R.id.activity_widget_text_total_points, "")
                    views.setTextViewText(
                        R.id.activity_widget_text_time,
                        formatter.format(calendar.getTime())
                    )
                    val intent = Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("app.cuppazee.express://widget_configure_activity_widget/$appWidgetId")
                    )
                    val pendingIntent = PendingIntent.getActivity(applicationContext, 0, intent, 0)
                    views.setOnClickPendingIntent(R.id.activity_widget, pendingIntent)
                    appWidgetManager.updateAppWidget(appWidgetId, views)
                    it.set(Result.success())
                } else {
                    val queue = newRequestQueue(applicationContext)

                    val url =
                        "https://server.cuppazee.app/widget/activity/v2?timestamp=${System.currentTimeMillis()}&username=${username}"

                    val jsonObjectRequest = JsonObjectRequest(Request.Method.GET, url, null,
                        { response ->
                            Log.i("CZActivityWidget", response.toString())
                            val views = getRemoteViews(applicationContext, minWidth, minHeight)

                            try {
                                val data = response.getJSONObject("data")
                                val overview = data.getJSONObject("overview")
                                views.setViewVisibility(
                                    R.id.activity_widget_image_avatar,
                                    View.VISIBLE
                                )
                                Picasso.get().load(
                                    "https://munzee.global.ssl.fastly.net/images/avatars/ua" + data.getInt(
                                        "user_id"
                                    ).toString(36) + ".png"
                                ).transform(CropCircleTransformation()).into(
                                    views,
                                    R.id.activity_widget_image_avatar,
                                    intArrayOf(appWidgetId)
                                )
                                views.setTextViewText(
                                    R.id.activity_widget_text_daily_points,
                                    data.getInt("daily_points").toString() + " Pts"
                                )
                                views.setTextViewText(
                                    R.id.activity_widget_text_username,
                                    data.getString("username")
                                )
                                val capture = overview.getJSONObject("capture")
                                views.setTextViewText(
                                    R.id.activity_widget_text_captures,
                                    capture.getInt("count")
                                        .toString() + " Caps  (" + capture.getInt("points") + " Pts)"
                                )
                                val deploy = overview.getJSONObject("deploy")
                                views.setTextViewText(
                                    R.id.activity_widget_text_deploys,
                                    deploy.getInt("count")
                                        .toString() + " Deps  (" + deploy.getInt("points") + " Pts)"
                                )
                                val passiveDeploy = overview.getJSONObject("passive_deploy")
                                views.setTextViewText(
                                    R.id.activity_widget_text_passive,
                                    passiveDeploy.getInt("count")
                                        .toString() + " Pass Deps  (" + passiveDeploy.getInt("points") + " Pts)"
                                )
                                val capon = overview.getJSONObject("capon")
                                views.setTextViewText(
                                    R.id.activity_widget_text_capon,
                                    capon.getInt("count")
                                        .toString() + " Capons  (" + capon.getInt("points") + " Pts)"
                                )
                                views.setTextViewText(
                                    R.id.activity_widget_text_total_points,
                                    data.getInt("total_points").toString() + " Pts"
                                )
                                views.setTextViewText(
                                    R.id.activity_widget_text_time,
                                    formatter.format(calendar.getTime())
                                )
                                val intent = Intent(
                                    Intent.ACTION_VIEW,
                                    Uri.parse("app.cuppazee.express://player/" + data.getString("username"))
                                )
                                val pendingIntent =
                                    PendingIntent.getActivity(applicationContext, 0, intent, 0)
                                views.setOnClickPendingIntent(R.id.activity_widget, pendingIntent)
                                appWidgetManager.updateAppWidget(appWidgetId, views)
                                it.set(Result.success())
                            } catch (error: JSONException) {
                                views.setViewVisibility(
                                    R.id.activity_widget_image_avatar,
                                    View.INVISIBLE
                                );
                                views.setTextViewText(
                                    R.id.activity_widget_text_daily_points,
                                    "JSON Error"
                                );
                                views.setTextViewText(R.id.activity_widget_text_username, "");
                                views.setTextViewText(
                                    R.id.activity_widget_text_captures,
                                    "Please report this to CuppaZee: $error"
                                );
                                views.setTextViewText(R.id.activity_widget_text_deploys, "");
                                views.setTextViewText(R.id.activity_widget_text_passive, "");
                                views.setTextViewText(R.id.activity_widget_text_capon, "");
                                views.setTextViewText(R.id.activity_widget_text_total_points, "");
                                views.setTextViewText(
                                    R.id.activity_widget_text_time,
                                    formatter.format(calendar.time)
                                );
                                appWidgetManager.updateAppWidget(appWidgetId, views);
                                it.set(Result.failure())
                            }
                        },
                        { error ->
                            Log.e("CZActivityWidget", "Failed getting activity data for $appWidgetId: $error")
                            it.set(Result.retry())
                        }
                    )

                    queue.add(jsonObjectRequest)
                }
            }
        }
    }
}

internal fun getRemoteViews(context: Context, minWidth: Int, minHeight: Int): RemoteViews {
    // First find out rows and columns based on width provided.
    val rows = getCellsForSize(minHeight)
    val columns = getCellsForSize(minWidth)
    return when (columns) {
        1 -> RemoteViews(context.packageName, R.layout.activity_widget_vertical)
        2 -> RemoteViews(context.packageName, R.layout.activity_widget_vertical)
        else -> RemoteViews(context.packageName, R.layout.activity_widget)
    }
}

internal fun getCellsForSize(size: Int): Int {
    var n = 2
    while (70 * n - 30 < size) {
        ++n
    }
    return n - 1
}