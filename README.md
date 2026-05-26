# expo-widgets

An expo module that allows you to make native widgets in iOS and android.

## Installation

Use v1 packages for expo 49, v2 for expo 51-52, v3 for expo 53-54, or v4 for expo 55+.

```
npx expo install @bittingz/expo-widgets
```

## Setup

See the example project for more clarity. You can omit the android or ios folders and setup if you only wish to support one platform.

1. Create a folder where you want to store your widget files.
2. In your plugins array (app.config.{js/ts}) add:

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
            src: "./src/my/path/to/android/widgets/folder",
            widgets: [
                {
                    "name": "MyWidgetProvider",
                    "resourceName": "@xml/my_widget_info"
                }
            ],
            distPlaceholder: "optional.placeholder"
        }                      
    }
],
```

3. Within your iOS widget folder create a Module.swift file, Widget Bundle, Assets.xcassets, and Widget swift files.
4. Your android folder should mimic android studio setup, so it has two subfolder paths: /android/main/java/package_name and /android/res/.... The package_name is currently being worked on for adjusting the name. Inside you place your widget.kt files. The res folder should contain your assets, the same as in android studio.
5. If you have any swift files you need to use within Module.swift, simply add them to the moduleDependencies array in your app.config. This is particularly useful for data models between the module and widget.
6. To share data between your app and widgets you can use a variety of methods, but the easiest way is to use UserPreferences. This plugin automatically handles it for you, so all you have to do is make sure to use a suiteName with the correct format. See the example project.
7. For android, set resourceName to your file name in /res/xml/***_info.xml
8. For android apps which require multiple distributions with different package names you can use distPlaceholder which will replace all instances of the provided placeholder in widget source files with your app.config.(json/ts/js). So if your source files include "package com.company.app" and "import com.company.app" and you have two distributions (com.company.app for prod and dev.company.app for dev) then setting distPlaceholder to com.company.app will replace all package and import references to the correct distribution each build. You can omit this field if it's not relevant to you. iOS requires no configuration for multiple distribution apps.

## Custom Fonts for iOS Widgets

You can add custom fonts (e.g. .ttf files) directly to your widget extension without a separate package. Add a `fonts` config to your iOS options:

```
[
    "@bittingz/expo-widgets",
    {
        ios: {
            src: "./widgets/ios",
            devTeamId: "YOUR_TEAM_ID",
            fonts: {
                srcFolder: "./fonts",
                fonts: [
                    { filePath: "Montserrat/Montserrat-Bold.ttf" },
                    { filePath: "Montserrat/Montserrat-Regular.ttf" }
                ]
            }
        }
    }
]
```

- `srcFolder` is the path from your project root to the folder containing your font files.
- Each entry in `fonts` specifies a `filePath` relative to `srcFolder`.
- Optionally include a `name` field if you want a custom display name for the font.

The plugin will copy the font files into the widget extension, add them to the Xcode project, and register them in the widget's Info.plist (`UIAppFonts`).

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

## Need Development?

If you need widgets designed & developed, reach out for more details. 

## Thanks!

A huge thanks to [gashimo](https://github.com/gaishimo/eas-widget-example) for a great baseline to start from. 
