package app.cuppazee.express

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetManager.*
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews
import androidx.work.*
import java.time.Duration
import java.util.concurrent.TimeUnit


/**
 * Implementation of App Widget functionality.
 */
class NewsWidget : AppWidgetProvider() {
    private var lastUpdated: Long = 0
    override fun onReceive(context: Context?, intent: Intent?) {
        super.onReceive(context, intent)
        if(lastUpdated < System.currentTimeMillis() - 10000) {
            lastUpdated = System.currentTimeMillis()
            if(intent?.action.equals(ACTION_APPWIDGET_UPDATE) || intent?.action.equals(ACTION_APPWIDGET_BIND) || intent?.action.equals(ACTION_APPWIDGET_OPTIONS_CHANGED) || intent?.action.equals(ACTION_APPWIDGET_CONFIGURE) || intent?.action.equals(ACTION_APPWIDGET_ENABLED))
            {
                val appWidgetManager = getInstance(context)
                val thisAppWidgetComponentName = ComponentName(context!!.packageName, javaClass.name)
                val appWidgetIds = appWidgetManager.getAppWidgetIds(thisAppWidgetComponentName)


                val constraints = Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()
                val uploadWorkRequest: OneTimeWorkRequest =
                    OneTimeWorkRequestBuilder<NewsWidgetWorker>()
                        .setConstraints(constraints)
                        .setBackoffCriteria(
                            BackoffPolicy.LINEAR,
                            30,
                            TimeUnit.SECONDS)
                        .setInputData(workDataOf(
                            "APP_WIDGET_IDS" to appWidgetIds
                        ))
                        .build()
                WorkManager
                    .getInstance(context)
                    .enqueueUniqueWork("NewsWidget", ExistingWorkPolicy.REPLACE, uploadWorkRequest)
//                val uploadWorkRequest: WorkRequest =
//                        OneTimeWorkRequestBuilder<NewsWidgetWorker>()
//                                .setInputData(workDataOf(
//                                        "APP_WIDGET_IDS" to appWidgetIds
//                                ))
//                                .build()
//                WorkManager
//                        .getInstance(context)
//                        .enqueue(uploadWorkRequest)
                Log.i("CZNewsWidget", "Queueing Update")
            }
        }
    }
}