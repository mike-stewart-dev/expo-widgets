"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withWidgetProjectBuildGradle = void 0;
const config_plugins_1 = require("@expo/config-plugins");
/**
 * Add configuration of kotlin-gradle-plugin
 * @param config
 * @returns
 */
const withWidgetProjectBuildGradle = config => {
    return (0, config_plugins_1.withProjectBuildGradle)(config, async (newConfig) => {
        const buildGradle = newConfig.modResults.contents;
        const search = /dependencies\s?{/;
        const replace = `dependencies {
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:\${project.ext.kotlinVersion}"`;
        const newBuildGradle = buildGradle.replace(search, replace);
        newConfig.modResults.contents = newBuildGradle;
        return newConfig;
    });
};
exports.withWidgetProjectBuildGradle = withWidgetProjectBuildGradle;
