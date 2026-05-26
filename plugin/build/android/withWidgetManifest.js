"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withWidgetManifest = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const withWidgetManifest = (config, options) => {
    return (0, config_plugins_1.withAndroidManifest)(config, async (newConfig) => {
        const mainApplication = config_plugins_1.AndroidConfig.Manifest.getMainApplicationOrThrow(newConfig.modResults);
        const widgetReceivers = buildWidgetsReceivers(options);
        mainApplication.receiver = widgetReceivers;
        return newConfig;
    });
};
exports.withWidgetManifest = withWidgetManifest;
function buildWidgetReceiver(op) {
    return {
        $: {
            "android:name": `.${op.name}`,
            "android:exported": "false",
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
    };
}
function buildWidgetsReceivers(options) {
    return options.widgets.map(op => buildWidgetReceiver(op));
}
