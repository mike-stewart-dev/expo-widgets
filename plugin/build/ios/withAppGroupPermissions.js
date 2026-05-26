"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAppGroupPermissions = exports.getAppGroupEntitlement = void 0;
const config_plugins_1 = require("expo/config-plugins");
const logger_1 = require("../utils/logger");
const withEntitlements_1 = require("./xcode/withEntitlements");
const APP_GROUP_KEY = "com.apple.security.application-groups";
const getAppGroupEntitlement = (config) => {
    return `group.${config?.ios?.bundleIdentifier || ""}.expowidgets`;
};
exports.getAppGroupEntitlement = getAppGroupEntitlement;
const withAppGroupPermissions = (config, options) => {
    return (0, config_plugins_1.withEntitlementsPlist)(config, newConfig => {
        if (!Array.isArray(newConfig.modResults[APP_GROUP_KEY])) {
            newConfig.modResults[APP_GROUP_KEY] = [];
        }
        const modResultsArray = newConfig.modResults[APP_GROUP_KEY];
        const entitlement = (0, exports.getAppGroupEntitlement)(config);
        if (modResultsArray.indexOf(entitlement) !== -1) {
            logger_1.Logging.logger.debug(`Adding entitlement ${entitlement} to config`);
            return newConfig;
        }
        modResultsArray.push(entitlement);
        newConfig.modResults['aps-environment'] = (0, withEntitlements_1.getPushNotificationsMode)(options);
        return newConfig;
    });
};
exports.withAppGroupPermissions = withAppGroupPermissions;
