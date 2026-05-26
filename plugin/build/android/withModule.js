"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withModule = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const config_plugins_1 = require("@expo/config-plugins");
const module_template_1 = require("./module-template");
const logger_1 = require("../utils/logger");
const withModule = (config, options) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "android",
        async (newConfig) => {
            const { modRequest } = newConfig;
            const projectRoot = modRequest.projectRoot;
            const platformRoot = modRequest.platformProjectRoot;
            const widgetFolderPath = path_1.default.join(modRequest.projectRoot, options.src);
            const packageName = config_plugins_1.AndroidConfig.Package.getPackage(config);
            if (!packageName) {
                throw new Error(`ExpoWidgets:: app.(ts/json) must provide a value for android.package.`);
            }
            const packageNameAsPath = packageName?.replace(/\./g, "/");
            const moduleSourcePath = path_1.default.join(widgetFolderPath, 'src/main/java/package_name/Module.kt');
            logger_1.Logging.logger.debug('moduleSourcePath: ', moduleSourcePath);
            const moduleDestinationPath = path_1.default.join(projectRoot, 'android/app/src/main/java', packageNameAsPath, 'Module.kt');
            if (!fs_extra_1.default.existsSync(moduleSourcePath)) {
                logger_1.Logging.logger.debug('No module file found. Adding template...');
                const contents = (0, module_template_1.getTemplate)(packageName);
                logger_1.Logging.logger.debug('Writing contents');
                fs_extra_1.default.writeFileSync(moduleDestinationPath, contents);
            }
            else {
                fs_extra_1.default.copyFileSync(moduleSourcePath, moduleDestinationPath);
            }
            return newConfig;
        }
    ]);
};
exports.withModule = withModule;
