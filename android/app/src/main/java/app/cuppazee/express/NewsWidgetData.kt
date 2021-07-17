package app.cuppazee.express

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
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
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

class NewsWidgetWorker(appContext: Context, workerParams: WorkerParameters):
        ListenableWorker(appContext, workerParams) {

    override fun startWork(): ListenableFuture<Result> {
        return getFuture {
            // Do the work here--in this case, upload the images.
            val appWidgetIds = inputData.getIntArray("APP_WIDGET_IDS")
            val appWidgetManager = AppWidgetManager.getInstance(applicationContext)

            if(appWidgetIds != null) {
                val queue = newRequestQueue(applicationContext)

                val url = "https://server.cuppazee.app/widget/news?timestamp=" + System.currentTimeMillis()

                val jsonObjectRequest = JsonObjectRequest(Request.Method.GET, url, null,
                    { response ->
                        Log.i("CZNewsWidget", response.toString())
                        val views = RemoteViews(applicationContext.packageName, R.layout.news_widget)

                        try {
                            val data: JSONArray = response.getJSONArray("data")
                            val news_a: JSONObject = data.getJSONObject(0)
                            val news_b: JSONObject = data.getJSONObject(1)

                            // Entry A
                            views.setViewVisibility(R.id.news_widget_image_a, View.VISIBLE)
                            Picasso.get().load(news_a.getString("image_url")).into(views, R.id.news_widget_image_a, appWidgetIds)
                            views.setTextViewText(R.id.news_widget_text_a, news_a.getString("title"))
                            // OnClick
                            val intent_a = Intent(Intent.ACTION_VIEW, Uri.parse(news_a.getString("blog_url")))
                            val pendingIntent_a = PendingIntent.getActivity(applicationContext, 0, intent_a, 0)
                            views.setOnClickPendingIntent(R.id.news_widget_a, pendingIntent_a)

                            // Entry B
                            views.setViewVisibility(R.id.news_widget_image_b, View.VISIBLE)
                            Picasso.get().load(news_b.getString("image_url")).into(views, R.id.news_widget_image_b, appWidgetIds)
                            views.setTextViewText(R.id.news_widget_text_b, news_b.getString("title"))
                            // OnClick
                            val intent_b = Intent(Intent.ACTION_VIEW, Uri.parse(news_b.getString("blog_url")))
                            val pendingIntent_b = PendingIntent.getActivity(applicationContext, 0, intent_b, 0)
                            views.setOnClickPendingIntent(R.id.news_widget_b, pendingIntent_b)
                            appWidgetManager.updateAppWidget(appWidgetIds, views)
                            it.set(Result.success())
                        } catch (error: JSONException) {
                            views.setViewVisibility(R.id.news_widget_image_a, View.INVISIBLE)
                            views.setViewVisibility(R.id.news_widget_image_b, View.INVISIBLE)
                            views.setTextViewText(R.id.news_widget_text_a, "JSON Error")
                            views.setTextViewText(R.id.news_widget_text_b, "Please report this to CuppaZee: $error")
                            appWidgetManager.updateAppWidget(appWidgetIds, views)
                            it.set(Result.failure())
                        }
                    },
                    { _ ->
                        it.set(Result.retry())
                    }
                )

                queue.add(jsonObjectRequest)
            }
        }
    }
}
