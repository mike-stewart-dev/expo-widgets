"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withSourceFiles = void 0;
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
const fs_extra_1 = __importDefault(require("fs-extra"));
const config_plugins_1 = require("@expo/config-plugins");
const withSourceFiles = (config, options) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        'android',
        async (newConfig) => {
            const { modRequest } = newConfig;
            const projectRoot = modRequest.projectRoot;
            const platformRoot = modRequest.platformProjectRoot;
            const widgetFolderPath = path_1.default.join(projectRoot, options.src);
            const packageName = config_plugins_1.AndroidConfig.Package.getPackage(config);
            if (!packageName) {
                throw new Error(`ExpoWidgets:: app.(ts/json) must provide a value for android.package.`);
            }
            copyResourceFiles(widgetFolderPath, platformRoot);
            const sourceFiles = copySourceFiles(widgetFolderPath, platformRoot, packageName);
            modifySourceFiles(options.distPlaceholder, sourceFiles, packageName);
            return newConfig;
        },
    ]);
};
exports.withSourceFiles = withSourceFiles;
function copyResourceFiles(widgetFolderPath, platformRoot) {
    const resourcesFolder = path_1.default.join(widgetFolderPath, 'src/res');
    const destinationFolder = path_1.default.join(platformRoot, 'app/src/main/res');
    if (!fs_extra_1.default.existsSync(resourcesFolder)) {
        logger_1.Logging.logger.debug(`No resource "res" folder found in the widget source directory ${widgetFolderPath}. No resource files copied over.`);
        return;
    }
    logger_1.Logging.logger.debug(`Copying resources from ${resourcesFolder} to ${destinationFolder}`);
    safeCopy(resourcesFolder, destinationFolder);
}
function safeCopy(sourcePath, destinationPath) {
    try {
        if (!fs_extra_1.default.existsSync(destinationPath)) {
            fs_extra_1.default.mkdirSync(destinationPath);
        }
        fs_extra_1.default.copySync(sourcePath, destinationPath);
    }
    catch (e) {
        logger_1.Logging.logger.warn(e);
    }
}
function getSourceFileDestinationFolder(packageName, widgetFolderPath, platformRoot) {
    const packageNameAsPath = packageName?.replace(/\./g, '/');
    return path_1.default.join(platformRoot, 'app/src/main/java', packageNameAsPath);
}
function copySourceFiles(widgetFolderPath, platformRoot, packageName) {
    const originalSourceFolder = path_1.default.join(widgetFolderPath, 'src/main/java/package_name');
    const destinationFolder = getSourceFileDestinationFolder(packageName, widgetFolderPath, platformRoot);
    if (!fs_extra_1.default.existsSync(destinationFolder)) {
        fs_extra_1.default.mkdirSync(destinationFolder);
    }
    logger_1.Logging.logger.debug(`Copying source files from ${originalSourceFolder} to ${destinationFolder}`);
    const paths = fs_extra_1.default.readdirSync(originalSourceFolder);
    const sourceFiles = [];
    for (const relativePath of paths) {
        const sourcePath = path_1.default.join(originalSourceFolder, relativePath);
        const destinationPath = path_1.default.join(destinationFolder, relativePath);
        if (fs_extra_1.default.lstatSync(sourcePath).isDirectory()) {
            // If src is a directory it will copy everything inside of this directory, not the entire directory itself
            fs_extra_1.default.emptyDirSync(destinationPath);
        }
        const file = path_1.default.basename(relativePath);
        if (file === 'Module.kt') {
            logger_1.Logging.logger.debug('Module file skipped during source file copy.');
            continue;
        }
        logger_1.Logging.logger.debug(`Copying file ${sourcePath} to ${destinationPath}`);
        fs_extra_1.default.copySync(sourcePath, destinationPath);
        sourceFiles.push(destinationPath);
    }
    return sourceFiles;
}
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function replaceAll(source, find, replace) {
    return source.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
function modifySourceFiles(distPlaceholder, sourceFiles, packageName) {
    if (!distPlaceholder?.length) {
        logger_1.Logging.logger.debug('No distPlaceholder set. Modification of source files not required.');
        return;
    }
    else if (sourceFiles.length == 0) {
        logger_1.Logging.logger.debug('No source files provided for modification.');
        return;
    }
    logger_1.Logging.logger.debug(`Modifying source files with placeholder ${distPlaceholder} to package ${packageName}`);
    const packageSearchStr = `package ${distPlaceholder}`;
    const packageReplaceStr = `package ${packageName}`;
    const importSearchStr = `import ${distPlaceholder}`;
    const importReplaceStr = `import ${packageName}`;
    for (const filePath of sourceFiles) {
        const contents = fs_extra_1.default.readFileSync(filePath, { encoding: 'utf-8' });
        logger_1.Logging.logger.debug(contents);
        const withModulesFixed = replaceAll(contents, packageSearchStr, packageReplaceStr);
        const withImportsFixed = replaceAll(withModulesFixed, importSearchStr, importReplaceStr);
        fs_extra_1.default.writeFileSync(filePath, withImportsFixed);
    }
}
