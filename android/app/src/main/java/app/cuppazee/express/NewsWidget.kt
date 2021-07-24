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
    override fun onReceive(context: Context?, intent: Intent?) {
        if(intent?.action.equals(ACTION_APPWIDGET_UPDATE) || intent?.action.equals(ACTION_APPWIDGET_BIND) || intent?.action.equals(ACTION_APPWIDGET_OPTIONS_CHANGED) || intent?.action.equals(ACTION_APPWIDGET_CONFIGURE) || intent?.action.equals(ACTION_APPWIDGET_ENABLED))
        {
            if(context != null) {
                val fakeWorkRequest: OneTimeWorkRequest =
                    OneTimeWorkRequestBuilder<ActivityWidgetWorker>()
                        .setInitialDelay(100000, TimeUnit.DAYS)
                        .setInputData(workDataOf(
                            "APP_WIDGET_ID" to -1
                        ))
                        .build();
                WorkManager
                    .getInstance(context)
                    .enqueueUniqueWork("FakeActivityWork", ExistingWorkPolicy.REPLACE, fakeWorkRequest)
            }

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
            Log.i("CZNewsWidget", "Queueing Update")
        }
        super.onReceive(context, intent)
    }
}