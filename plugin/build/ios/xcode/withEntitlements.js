"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppGroupId = exports.getPushNotificationsMode = exports.withEntitlements = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../utils/logger");
const fs_extra_1 = __importDefault(require("fs-extra"));
const fs = __importStar(require("fs"));
const plist = __importStar(require("plist"));
const target_1 = require("./target");
const createEntitlementXML = (appGroupId, mode, entitlements) => {
    const finalEntitlements = {
        ...entitlements || {},
        'aps-environment': mode,
        'com.apple.security.application-groups': [appGroupId],
    };
    return plist.build(finalEntitlements);
};
const withEntitlements = (config, options) => {
    const { platformProjectRoot, } = config.modRequest;
    const widgetProjectName = (0, target_1.getTargetName)(config, options);
    const appGroupId = (0, exports.getAppGroupId)(config, options);
    logger_1.Logging.logger.debug(`AppGroupId:: ${appGroupId}`);
    const widgetProjectPath = path_1.default.join(platformProjectRoot, widgetProjectName);
    const widgetProjectEntitlementFile = path_1.default.join(widgetProjectPath, `${widgetProjectName}.entitlements`);
    logger_1.Logging.logger.debug(`WidgetProjectEntitlementFile:: ${widgetProjectEntitlementFile}`);
    fs.mkdirSync(widgetProjectPath, { recursive: true });
    fs_extra_1.default.writeFileSync(widgetProjectEntitlementFile, createEntitlementXML(appGroupId, options.mode || 'production', options.xcode?.entitlements));
    return config;
};
exports.withEntitlements = withEntitlements;
const getPushNotificationsMode = (options) => {
    return options.mode || 'production';
};
exports.getPushNotificationsMode = getPushNotificationsMode;
const getAppGroupId = (config, options) => {
    if (options.xcode?.appGroupId) {
        return options.xcode?.appGroupId;
    }
    const projectName = config_plugins_1.IOSConfig.XcodeUtils.sanitizedName(config.name);
    if (config.ios?.bundleIdentifier) {
        return `group.${config.ios?.bundleIdentifier}.expowidgets`;
    }
    else {
        throw new Error(`Cannot generate application group. Either app.json/expo.ios.bundleIdentifier or pluginoptions/xcode.appGroupId must be set.`);
    }
};
exports.getAppGroupId = getAppGroupId;
