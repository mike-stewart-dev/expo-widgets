"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAppExtensions = void 0;
const withWidgetXCode_1 = require("./withWidgetXCode");
const withEntitlements_1 = require("./xcode/withEntitlements");
const withAppGroupPermissions_1 = require("./withAppGroupPermissions");
const target_1 = require("./xcode/target");
const withAppExtensions = (config, options) => {
    const targetName = (0, target_1.getTargetName)(config, options);
    const bundleIdentifier = (0, withWidgetXCode_1.getBundleIdentifier)(config, options);
    const entitlement = (0, withAppGroupPermissions_1.getAppGroupEntitlement)(config);
    const appGroupEntitlements = (config.ios?.entitlements && config.ios.entitlements['com.apple.security.application-groups']) || [];
    config.ios = {
        ...config.ios,
        entitlements: {
            ...(config.ios?.entitlements || {}),
            'com.apple.security.application-groups': [
                ...appGroupEntitlements,
                entitlement,
            ],
            'aps-environment': (0, withEntitlements_1.getPushNotificationsMode)(options)
        }
    };
    config.extra = {
        ...config.extra,
        eas: {
            ...config.extra?.eas,
            build: {
                ...config.extra?.eas?.build,
                experimental: {
                    ...config.extra?.eas?.build?.experimental,
                    ios: {
                        ...config.extra?.eas?.build?.experimental?.ios,
                        appExtensions: [
                            ...(config.extra?.eas?.build?.experimental?.ios?.appExtensions ?? []),
                            {
                                // keep in sync with native changes in NSE
                                targetName,
                                bundleIdentifier,
                                entitlements: {
                                    'com.apple.security.application-groups': [
                                        entitlement,
                                    ],
                                    'aps-environment': (0, withEntitlements_1.getPushNotificationsMode)(options)
                                },
                            }
                        ]
                    }
                }
            }
        }
    };
    return config;
};
exports.withAppExtensions = withAppExtensions;
