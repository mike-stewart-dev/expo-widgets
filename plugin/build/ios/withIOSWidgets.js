"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withIOSWidgets = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const withWidgetXCode_1 = require("./withWidgetXCode");
const withConfig_1 = require("./withConfig");
const withPodfile_1 = require("./withPodfile");
const withModule_1 = require("./withModule");
const withEntitlements_1 = require("./xcode/withEntitlements");
const withWidgetInfoPlist_1 = require("./xcode/withWidgetInfoPlist");
const withNativeFonts_1 = require("./withNativeFonts");
const defaultOptions = () => {
    return {
        src: 'widgets/ios',
        deploymentTarget: '16.2',
        useLiveActivities: false,
        frequentUpdates: false,
        devTeamId: '',
        moduleDependencies: [],
        mode: 'production',
        widgetExtPlugins: [],
        xcode: {
            appExtAPI: false,
        }
    };
};
const withIOSWidgets = (config, options) => {
    const { src, deploymentTarget, useLiveActivities, frequentUpdates, moduleDependencies, mode, widgetExtPlugins, xcode, } = defaultOptions();
    const defaultedOptions = {
        src: options.src || src,
        deploymentTarget: options.deploymentTarget || deploymentTarget,
        useLiveActivities: options.useLiveActivities || useLiveActivities,
        frequentUpdates: options.frequentUpdates || frequentUpdates,
        devTeamId: options.devTeamId,
        moduleDependencies: options.moduleDependencies || moduleDependencies,
        mode: options.mode || mode,
        widgetExtPlugins: options.widgetExtPlugins || widgetExtPlugins,
        fonts: options.fonts,
        xcode: {
            widgetBundleIdentifier: options.xcode?.widgetBundleIdentifier || xcode?.widgetBundleIdentifier,
            appGroupId: options.xcode?.appGroupId || xcode?.appGroupId,
            entitlements: options.xcode?.entitlements || xcode?.entitlements,
            configOverrides: options.xcode?.configOverrides || xcode?.configOverrides,
            appExtAPI: options.xcode?.appExtAPI || xcode?.appExtAPI,
        }
    };
    config = (0, withConfig_1.withConfig)(config, defaultedOptions);
    return (0, config_plugins_1.withXcodeProject)(config, config => {
        (0, withModule_1.withModule)(config, defaultedOptions);
        (0, withWidgetXCode_1.withWidgetXCode)(config, defaultedOptions);
        (0, withEntitlements_1.withEntitlements)(config, options);
        (0, withWidgetInfoPlist_1.withWidgetInfoPlist)(config, options);
        (0, withNativeFonts_1.injectNativeFonts)(config, defaultedOptions);
        (0, withPodfile_1.withPodfile)(config, defaultedOptions);
        return config;
    });
};
exports.withIOSWidgets = withIOSWidgets;
