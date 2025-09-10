import {
    AndroidConfig,
    ConfigPlugin,
    withAndroidManifest,
  } from "@expo/config-plugins"
import { AndroidWidgetProjectSettings, WithExpoAndroidWidgetsProps } from "..";

  export const withWidgetManifest: ConfigPlugin<WithExpoAndroidWidgetsProps> = (config, options) => {
    return withAndroidManifest(config, async newConfig => {
      const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
        newConfig.modResults,
      )
      const widgetReceivers = buildWidgetsReceivers(options)

      if (!mainApplication.receiver) {
        mainApplication.receiver = []
      }

      const existingReceivers = new Set(mainApplication.receiver.map(r => r.$['android:name']))

      for (const receiver of widgetReceivers) {
        if (!existingReceivers.has(receiver.$['android:name'])) {
            mainApplication.receiver.push(receiver)
            existingReceivers.add(receiver.$['android:name'])
        }
      }
  
      return newConfig
    })
  }
  
  function buildWidgetReceiver(op: AndroidWidgetProjectSettings) {
    return {
      $: {
        "android:name": `.${op.name}`,
        "android:exported": "false" as const,
      },
      "intent-filter": [
        {
          action: [
            {
              $: {
                "android:name": "android.appwidget.action.APPWIDGET_UPDATE",
              },
            },
          ],
        },
      ],
      "meta-data": [
        {
          $: {
            "android:name": "android.appwidget.provider",
            "android:resource": op.resourceName,
          },
        },
      ],
    }
  }

  function buildWidgetsReceivers(options: WithExpoAndroidWidgetsProps) {
    return options.widgets.map(op => buildWidgetReceiver(op));
  }