"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withLiveActivities = void 0;
const withLiveActivities = (config, options) => {
    config.ios = {
        ...config.ios,
        infoPlist: {
            ...config.ios?.infoPlist,
            NSSupportsLiveActivities: options?.useLiveActivities || false,
            NSSupportsLiveActivitiesFrequentUpdates: options?.frequentUpdates || false,
        }
    };
    return config;
};
exports.withLiveActivities = withLiveActivities;
