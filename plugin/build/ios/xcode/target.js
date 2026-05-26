"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTargetName = exports.getPBXTargetByName = void 0;
const config_plugins_1 = require("expo/config-plugins");
const getPBXTargetByName = (project, name) => {
    var targetSection = project.pbxNativeTargetSection();
    for (const uuid in targetSection) {
        const target = targetSection[uuid];
        if (target.name === name) {
            return {
                uuid,
                target,
            };
        }
    }
    return { target: null, uuid: null };
};
exports.getPBXTargetByName = getPBXTargetByName;
/**
 * Gets the target name either via a sanitised config.name + Widgets or if provided options.xcode.targetName
 * @param config The expo config
 * @param options The ios config options
 * @returns The target name
 */
const getTargetName = (config, options) => {
    if (options.targetName) {
        return config_plugins_1.IOSConfig.XcodeUtils.sanitizedName(options.targetName);
    }
    const cleanName = config_plugins_1.IOSConfig.XcodeUtils.sanitizedName(config.name);
    return `${cleanName}WidgetExtension`;
};
exports.getTargetName = getTargetName;
