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
class ActivityWidget : AppWidgetProvider() {
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
            val appWidgetIds = intent?.extras?.getIntArray("EXTRA_APPWIDGET_IDS") ?: appWidgetManager.getAppWidgetIds(thisAppWidgetComponentName)
            Log.i("CZActivityWidget", "Queueing Updates for $appWidgetIds")

            for(appWidgetId in appWidgetIds) {
                val constraints = Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()
                val uploadWorkRequest: OneTimeWorkRequest =
                    OneTimeWorkRequestBuilder<ActivityWidgetWorker>()
                        .setConstraints(constraints)
                        .setBackoffCriteria(
                            BackoffPolicy.LINEAR,
                            30,
                            TimeUnit.SECONDS)
                        .setInputData(workDataOf(
                            "APP_WIDGET_ID" to appWidgetId
                        ))
                        .build()
                WorkManager
                    .getInstance(context)
                    .enqueueUniqueWork("ActivityWidget$appWidgetId", ExistingWorkPolicy.REPLACE, uploadWorkRequest)
                Log.i("CZActivityWidget", "Queueing Update for $appWidgetId")
            }
        }
        super.onReceive(context, intent)
    }
}