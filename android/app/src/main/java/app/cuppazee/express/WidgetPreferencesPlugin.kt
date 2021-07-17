package app.cuppazee.express

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin


@CapacitorPlugin(name = "WidgetPreferences")
class WidgetPreferencesPlugin : Plugin() {
    @PluginMethod
    fun set(call: PluginCall) {
        val key = call.getString("key")
        val value = call.getString("value")
        val editor =
            context.getSharedPreferences("WIDGET_PREFERENCES", Context.MODE_PRIVATE).edit()
        editor.putString(key, value)
        editor.commit()

        val intent =
            Intent(this.context.applicationContext, ActivityWidget::class.java)
        intent.action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        val ids = AppWidgetManager.getInstance(this.context.applicationContext)
            .getAppWidgetIds(
                ComponentName(
                    this.context.applicationContext,
                    ActivityWidget::class.java
                )
            )
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        this.context.applicationContext.sendBroadcast(intent)

        call.resolve(null)
    }

    @PluginMethod
    fun get(call: PluginCall) {
        val key = call.getString("key")
        val defaultValue = call.getString("defaultValue")
        val pref = context.getSharedPreferences("WIDGET_PREFERENCES", Context.MODE_PRIVATE)
        val ret = JSObject()
        ret.put("value", pref.getString(key, defaultValue))
        call.resolve(ret)
    }
}