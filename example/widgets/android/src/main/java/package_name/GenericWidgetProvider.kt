package expo.modules.widgets.example

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import android.content.SharedPreferences
import java.util.logging.Logger
import org.json.JSONException
import org.json.JSONObject

class GenericWidgetProvider : AppWidgetProvider() {
    private val Log: Logger = Logger.getLogger(GenericWidgetProvider::class.java.name)

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        try {
            val providerInfo = appWidgetManager.getAppWidgetInfo(appWidgetId)
            val sharedPreferences = context.getSharedPreferences("${context.packageName}.widgetdata", Context.MODE_PRIVATE)
            var jsonData = sharedPreferences.getString("widgetdata_$appWidgetId", null)

            if (jsonData == null) {
                jsonData = sharedPreferences.getString("widgetdata", "{}")
            }

            val data = JSONObject(jsonData)
            val layoutId = providerInfo.initialLayout
            val views = RemoteViews(context.packageName, layoutId)

            views.setTextViewText(R.id.appwidget_text, data.getString("message"))

            appWidgetManager.updateAppWidget(appWidgetId, views)
        } catch (e: JSONException) {
            Log.warning("An error occurred parsing widget json!")
            Log.warning(e.message)
        }
    }
}
