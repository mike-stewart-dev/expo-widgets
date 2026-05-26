"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withWidgetXCode = exports.getBundleIdentifier = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const fs_1 = __importDefault(require("fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const addWidgetExtensionTarget_1 = require("./xcode/addWidgetExtensionTarget");
const logger_1 = require("../utils/logger");
const widgetProjectFileCollection_1 = require("./widgetProjectFileCollection");
const framework_1 = require("./xcode/framework");
const target_1 = require("./xcode/target");
const getBundleIdentifier = (config, options) => {
    if (options.xcode?.widgetBundleIdentifier) {
        return options.xcode.widgetBundleIdentifier;
    }
    const targetName = (0, target_1.getTargetName)(config, options);
    return `${config.ios?.bundleIdentifier}.${targetName}`;
};
exports.getBundleIdentifier = getBundleIdentifier;
const copyFilesToWidgetProject = (widgetFolderPath, targetPath) => {
    if (!fs_extra_1.default.lstatSync(widgetFolderPath).isDirectory()) {
        throw new Error(`The provided iOS src is not a directory. This value must be the directory of your widget files.`);
    }
    if (!fs_extra_1.default.existsSync(targetPath)) {
        logger_1.Logging.logger.debug(`Creating widget extension directory ${targetPath}`);
        fs_extra_1.default.mkdirSync(targetPath, { recursive: true });
    }
    fs_extra_1.default.copySync(widgetFolderPath, targetPath, {
        filter: (name) => {
            const fileName = path_1.default.basename(name);
            if (name.endsWith('Module.swift') || fileName.startsWith('.')) {
                return false;
            }
            logger_1.Logging.logger.debug(`Copying ${name}`);
            return true;
        }
    });
};
const copyModuleDependencies = (options, widgetFolderPath) => {
    const iosFolder = path_1.default.join(__dirname, '../../../ios');
    if (!options.moduleDependencies) {
        return;
    }
    for (const dep of options.moduleDependencies) {
        const filePath = path_1.default.join(widgetFolderPath, dep);
        const destination = path_1.default.join(iosFolder, path_1.default.basename(dep));
        logger_1.Logging.logger.debug(`Copying ${filePath} to ${destination}`);
        fs_extra_1.default.copyFileSync(filePath, destination);
    }
};
const withWidgetXCode = (props, options) => {
    try {
        const { projectName, projectRoot, platformProjectRoot, } = props.modRequest;
        const widgetFolderPath = path_1.default.join(projectRoot, options.src);
        const project = props.modResults;
        const targetUuid = project.generateUuid();
        const targetName = (0, target_1.getTargetName)(props, options);
        const targetPath = path_1.default.join(platformProjectRoot, targetName);
        const iosProjectPath = config_plugins_1.IOSConfig.Paths.getSourceRoot(projectRoot);
        // copy widget files over
        copyFilesToWidgetProject(widgetFolderPath, targetPath);
        copyModuleDependencies(options, widgetFolderPath);
        addFilesToWidgetProject(project, { widgetFolderPath, iosProjectPath, targetUuid, targetName, projectName: projectName || 'MyProject', expoConfig: props, options });
        return props;
    }
    catch (e) {
        console.error(e);
        throw e;
    }
};
exports.withWidgetXCode = withWidgetXCode;
const addFilesToWidgetProject = (project, { widgetFolderPath, iosProjectPath, targetUuid, targetName, projectName, expoConfig, options, }) => {
    const iterateFiles = (relativePath, isBaseDirectory, parentGroup, widgetTargetUuid) => {
        const directory = path_1.default.join(widgetFolderPath, relativePath);
        const folderName = relativePath.split(/[\\\/]/).at(-1);
        const fileCollection = widgetProjectFileCollection_1.WidgetProjectFileCollection.fromFiles([]);
        logger_1.Logging.logger.debug(`Reading directory:: ${directory}`);
        logger_1.Logging.logger.debug(`Relative path is:: ${relativePath}`);
        logger_1.Logging.logger.debug(`Folder name:: ${folderName}`);
        const items = fs_1.default.readdirSync(directory);
        let directoriesToIterate = [];
        for (const item of items) {
            const fullPath = path_1.default.join(directory, item);
            const itemRelPath = path_1.default.join(relativePath, item);
            if (item === 'Assets.xcassets') {
                fileCollection.addFile(item);
            }
            else if (fs_extra_1.default.lstatSync(fullPath).isDirectory()) {
                directoriesToIterate.push(itemRelPath);
            }
            else {
                fileCollection.addFile(item);
            }
        }
        // all files for current directory now in collection, time to add them to xcode proj
        const filesByType = fileCollection.getFiltered();
        const allFiles = fileCollection.getBundled();
        logger_1.Logging.logger.debug(`Item count: ${items.length}`);
        logger_1.Logging.logger.debug(`Adding ${filesByType.swift.length} swift files...`);
        logger_1.Logging.logger.debug(`Adding ${filesByType.xcassets.length} asset files...`);
        logger_1.Logging.logger.debug(`Creating PBX group for the widget project:: ${targetName}`);
        logger_1.Logging.logger.debug(`Adding ${allFiles.length} files...`);
        // for each level of files in the directory add a new group, 
        // and then add this group to the parent directory
        const groupTarget = isBaseDirectory ? targetName : folderName;
        const groupPath = isBaseDirectory ? targetName : relativePath;
        const pbxGroup = project.addPbxGroup([...allFiles, `${targetName}.entitlements`, `Info.plist`], groupTarget, // name 
        groupPath, // the path is the folder name. For top level files this is the project name.
        '"<group>"');
        const shouldAddResourcesBuildPhase = () => {
            const googleServicePlistPath = path_1.default.join(iosProjectPath, 'GoogleService-Info.plist');
            return fs_1.default.existsSync(googleServicePlistPath) || filesByType.xcassets?.length > 0 || filesByType.strings?.length > 0;
        };
        const getResourceFiles = () => {
            const resources = [...(filesByType.xcassets || []), ...(filesByType.strings || [])];
            const googleServicePlistPath = path_1.default.join(iosProjectPath, 'GoogleService-Info.plist');
            if (fs_1.default.existsSync(googleServicePlistPath)) {
                resources.push(googleServicePlistPath);
            }
            return resources;
        };
        if (isBaseDirectory) {
            // add to top project (main) group
            const projectInfo = project.getFirstProject();
            //Logging.logger.debug(projectInfo)
            const mainGroup = projectInfo.firstProject.mainGroup;
            logger_1.Logging.logger.debug(`Adding new group to main group: ${mainGroup}`);
            project.addToPbxGroup(pbxGroup.uuid, mainGroup);
            logger_1.Logging.logger.debug(`Adding build phase for PBXSourcesBuildPhase ${groupTarget} to widget target ${widgetTargetUuid}`);
            project.addBuildPhase([...filesByType.swift, ...filesByType.intentdefinition], "PBXSourcesBuildPhase", groupName, widgetTargetUuid, "app_extension", // folder type
            "");
            logger_1.Logging.logger.debug(`Adding PBXCopyFilesBuildPhase to project ${project.getFirstTarget().uuid}`);
            project.addBuildPhase([], 'PBXCopyFilesBuildPhase', groupName, project.getFirstTarget().uuid, 'app_extension', '');
            if (shouldAddResourcesBuildPhase()) {
                logger_1.Logging.logger.debug(`Adding PBXResourcesBuildPhase to target ${widgetTargetUuid}`);
                project.addBuildPhase(getResourceFiles(), "PBXResourcesBuildPhase", groupName, widgetTargetUuid, "app_extension", "");
            }
            else {
                logger_1.Logging.logger.debug('No asset or GoogleService-Info.plist files detected');
            }
        }
        else {
            // add to parent pbx group
            project.addToPbxGroup(pbxGroup.uuid, parentGroup.uuid);
        }
        if (filesByType.xcassets) {
            for (const assetFile of filesByType.xcassets) {
                logger_1.Logging.logger.debug(`Adding asset file:: ${assetFile} to target ${targetUuid}`);
                project.addResourceFile(assetFile, {
                    target: targetUuid,
                });
            }
        }
        if (filesByType.strings) {
            for (const stringFile of filesByType.strings) {
                logger_1.Logging.logger.debug(`Adding string file:: ${stringFile} to target ${targetUuid}`);
                project.addResourceFile(stringFile, {
                    target: targetUuid,
                });
            }
        }
        for (const d of directoriesToIterate) {
            iterateFiles(d, false, pbxGroup, widgetTargetUuid);
        }
    };
    project.getFirstProject().firstProject.compatibilityVersion = '"Xcode 14.0"';
    const groupName = "Embed Foundation Extensions";
    const nativeTargets = project.pbxNativeTargetSection();
    let projectTarget = null;
    for (const uuid in nativeTargets) {
        const pbxNativeTarget = nativeTargets[uuid];
        if (pbxNativeTarget.name === projectName) {
            projectTarget = {
                uuid,
                pbxNativeTarget,
            };
            break;
        }
    }
    logger_1.Logging.logger.debug(projectTarget);
    if (!projectTarget) {
        logger_1.Logging.logger.debug(`No project target! Adding...`);
        projectTarget = project.addTarget(projectName, 'application', '');
        logger_1.Logging.logger.debug(projectTarget);
    }
    logger_1.Logging.logger.debug(`Adding extension target`);
    const extensionTarget = (0, addWidgetExtensionTarget_1.addWidgetExtensionTarget)(project, expoConfig, options, `${targetName}`);
    logger_1.Logging.logger.debug(`Adding project target ${projectTarget?.uuid} to extension target ${extensionTarget.uuid}`);
    const projectObjects = project.hash.project.objects;
    const dodgyKeys = ["PBXTargetDependency", "PBXContainerItemProxy"];
    for (const key of dodgyKeys) {
        logger_1.Logging.logger.debug(`Fixing key ${key}`);
        if (!projectObjects[key]) {
            projectObjects[key] = {};
        }
    }
    const projectSectionItem = project.pbxProjectSection()[project.getFirstProject().uuid];
    if (!projectSectionItem.attributes.TargetAttributes) {
        projectSectionItem.attributes.TargetAttributes = {};
    }
    projectSectionItem.attributes.TargetAttributes[extensionTarget.uuid] = {
        LastSwiftMigration: 1250
    };
    project.addTargetDependency(projectTarget?.uuid, [extensionTarget.uuid]);
    // this does everything incl adding to frameworks pbx group
    (0, framework_1.addFrameworksToWidgetProject)(project, extensionTarget);
    const pbxProjectSection = project.pbxProjectSection();
    const projectUuid = Object.keys(pbxProjectSection)
        .filter(id => id.indexOf('comment') === -1)[0];
    logger_1.Logging.logger.debug('proj section uuid::' + projectUuid);
    iterateFiles('', true, undefined, extensionTarget.uuid);
    return {
        extensionTarget,
    };
};
