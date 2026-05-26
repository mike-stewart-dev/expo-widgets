"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withConfig = void 0;
const withLiveActivities_1 = require("./withLiveActivities");
const withAppExtensions_1 = require("./withAppExtensions");
const withAppGroupPermissions_1 = require("./withAppGroupPermissions");
const withConfig = (config, options) => {
    (0, withAppGroupPermissions_1.withAppGroupPermissions)(config, options);
    (0, withAppExtensions_1.withAppExtensions)(config, options);
    (0, withLiveActivities_1.withLiveActivities)(config, options);
    return config;
};
exports.withConfig = withConfig;
