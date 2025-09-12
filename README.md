# expo-widgets

An expo module that allows you to make native widgets in iOS and android.

## Installation

Use v1 packages for expo 49, or v2 for expo 51+.

```npx expo install @bittingz/expo-widgets```

## Build Fix for Android

A previous version of this library included the Android native module as a source dependency, which could cause a `Duplicate class...ExpoWidgetsModule...` error during the Android build process. This issue has been resolved by removing the manual source dependency and relying on Expo's autolinking.

If you are upgrading from a previous version, you may need to run `npx expo prebuild --clean` to ensure the fix is applied correctly.

## Setup

See the example project for more clarity. You can omit the android or ios folders and setup if you only wish to support one platform.

1.  Create a folder where you want to store your widget files.
2.  In your plugins array (app.config.{js/ts} add:

```
[
    "@bittingz/expo-widgets",
    {
        ios: {
            src: "./src/my/path/to/ios/widgets/folder",
            devTeamId: "your apple dev team ID",
            mode: "production",                        
            moduleDependencies: [],
            useLiveActivities: false,
            frequentUpdates: false,
            entitlements: {
                "any xcode entitlement the widget needs": "entitlement value"
            }
        },
        android: {
            src: "./widgets/android",
            widgets: [
                {
                    "name": "SampleWidget",
                    "resourceName": "@xml/sample_widget_info"
                }
            ]
        }                      
    }
],
```

3.  Within your iOS widget folder create a Module.swift file, Widget Bundle, Assets.xcassets, and Widget swift files.
4.  Your android folder should mimic android studio setup, so it has two subfolder paths: /android/main/java/package_name and /android/res/.... The package_name is currently being worked on for adjusting the name. Inside you place your widget.kt files. The res folder should contain your assets, the same as in android studio.
5.  If you have any swift files you need to use within Module.swift, simply add them to the moduleDependencies array in your app.config. This is particularly useful for data models between the module and widget.
6.  To share data between your app and widgets you can use a variety of methods, but the easiest way is to use UserPreferences. This plugin automatically handles it for you, so all you have to do is make sure to use a suiteName with the correct format. See the example project.
7.  If you want to use custom fonts in your iOS widget, use my expo-native-fonts package; see the example project for usage. Android widgets work well with resource folders and don't require additional dependencies.
8.  For android, set resourceName to your file name in /res/xml/***_info.xml

### Supporting Multiple Widgets on Android

To support multiple widgets on Android, you need to manually add a `<receiver>` for each widget to your `AndroidManifest.xml`.

1.  In your `app.json`, add a `widgets` array to the `android` configuration, with an entry for each widget:

```json
"android": {
    "src": "./widgets/android",
    "widgets": [
        {
            "name": "SampleWidget",
            "resourceName": "@xml/sample_widget_info"
        },
        {
            "name": "AnotherWidget",
            "resourceName": "@xml/another_widget_info"
        }
    ]
}
```

2.  Create the corresponding native files for each widget (`.kt`, layout `.xml`, and info `.xml`).

3.  Manually add a `<receiver>` for each widget to your `android/app/src/main/AndroidManifest.xml`:

```xml
<receiver
    android:name=".SampleWidget"
    android:exported="false">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>

    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/sample_widget_info" />
</receiver>

<receiver
    android:name=".AnotherWidget"
    android:exported="false">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>

    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/another_widget_info" />
</receiver>
```

## API

### `setWidgetData(data: object, packageName: string): void`

Updates the data for all widgets of a given package.

-   `data`: A JSON object containing the data to be sent to the widget.
-   `packageName`: The package name of your Android app.

### `updateWidgetData(widgetId: string, data: object, packageName: string): void`

Updates the data for a specific widget instance.

-   `widgetId`: The ID of the widget to update.
-   `data`: A JSON object containing the data to be sent to the widget.
-   `packageName`: The package name of your Android app.

## Overriding xcode options

You can override xcode options in app.json (all props are optional):

```
"@bittingz/expo-widgets",
{
    "ios": {
        ...
        xcode: {
            appExtAPI: true, // sets APP_EXTENSION_API_ONLY in the podfile
            configOverrides: {
                // key value pairs e.g. SWIFT_VERSION: '5.0',
            },
            entitlements: {}, // key value pairs
        },
    }
}
```

The configOverrides properties are the xcodeproj values and must match case exactly.

## Running the example project

```
cd example
npm run prebuild:ios
npm run ios
OR
npm run prebuild:android
npm run android
```

## Troubleshooting Android

If you use R in your widget kotlin file to get layouts, you may get an unresolved reference error for R. In this case, simply add "package your.appconfig.packageid.R", delete your android folder and rebuild.

## Need Custom Fonts?

Give my [other expo module a try](https://github.com/gitn00b1337/expo-native-fonts). You'll need to put the fonts config before the widgets config.

## Need Development?

If you need widgets designed & developed, reach out for more details. 

## Thanks!

A huge thanks to [gashimo](https://github.com/gaishimo/eas-widget-example) for a great baseline to start from.
