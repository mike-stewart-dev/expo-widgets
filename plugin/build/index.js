"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const withIOSWidgets_1 = require("./ios/withIOSWidgets");
const withAndroidWidgets_1 = require("./android/withAndroidWidgets");
const withExpoWidgets = (config, options) => {
    if (options.android) {
        config = (0, withAndroidWidgets_1.withAndroidWidgets)(config, options.android);
    }
    if (options.ios) {
        config = (0, withIOSWidgets_1.withIOSWidgets)(config, options.ios);
    }
    return config;
};
exports.default = withExpoWidgets;
