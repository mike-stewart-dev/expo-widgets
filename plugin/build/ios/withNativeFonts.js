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
exports.injectNativeFonts = void 0;
const path = __importStar(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const logger_1 = require("../utils/logger");
const target_1 = require("./xcode/target");
const getPBXTargetByName = (project, name) => {
    const targetSection = project.pbxNativeTargetSection();
    for (const uuid in targetSection) {
        const target = targetSection[uuid];
        if (target.name === name) {
            return { uuid, target };
        }
    }
    return { target: null, uuid: null };
};
const getResourcesBuildPhaseForTarget = (project, targetUuid) => {
    const target = project.pbxNativeTargetSection()[targetUuid];
    if (!target || !target.buildPhases)
        return null;
    const pbxResourcesBuildPhaseSection = project.hash.project.objects['PBXResourcesBuildPhase'];
    if (!pbxResourcesBuildPhaseSection)
        return null;
    for (const phase of target.buildPhases) {
        const phaseUuid = phase.value;
        if (pbxResourcesBuildPhaseSection[phaseUuid]) {
            return pbxResourcesBuildPhaseSection[phaseUuid];
        }
    }
    return null;
};
const copyFontFilesToTarget = (config, options) => {
    const fontsConfig = options.fonts;
    const targetName = (0, target_1.getTargetName)(config, options);
    const { projectRoot } = config.modRequest;
    const sourceDir = path.join(projectRoot, fontsConfig.srcFolder);
    const targetFontsDir = path.join(projectRoot, 'ios', targetName, 'Fonts');
    if (!fs_extra_1.default.existsSync(targetFontsDir)) {
        fs_extra_1.default.mkdirSync(targetFontsDir, { recursive: true });
    }
    for (const font of fontsConfig.fonts) {
        const src = path.join(sourceDir, font.filePath);
        const dest = path.join(targetFontsDir, font.filePath);
        const destDir = path.dirname(dest);
        if (!fs_extra_1.default.existsSync(destDir)) {
            fs_extra_1.default.mkdirSync(destDir, { recursive: true });
        }
        fs_extra_1.default.copySync(src, dest);
        logger_1.Logging.logger.debug(`Copied font ${font.filePath} to ${targetName}/Fonts/`);
    }
};
const addFontsToXcodeProject = (config, options) => {
    const fontsConfig = options.fonts;
    const targetName = (0, target_1.getTargetName)(config, options);
    const project = config.modResults;
    const { target, uuid: targetUuid } = getPBXTargetByName(project, targetName);
    if (!target || !targetUuid) {
        throw new Error(`expo-widgets:: Cannot find target "${targetName}" for font injection. ` +
            `Ensure the widget extension target is created before fonts are injected.`);
    }
    const resourcesBuildPhase = getResourcesBuildPhaseForTarget(project, targetUuid);
    for (const font of fontsConfig.fonts) {
        const fontPath = path.join('Fonts', font.filePath);
        const basename = path.basename(font.filePath);
        const fileRef = project.generateUuid();
        const buildFileUuid = project.generateUuid();
        const fileRefSection = project.pbxFileReferenceSection();
        fileRefSection[fileRef] = {
            isa: 'PBXFileReference',
            name: `"${basename}"`,
            path: `"${fontPath}"`,
            sourceTree: '"<group>"',
            lastKnownFileType: 'unknown',
            includeInIndex: 0,
        };
        fileRefSection[`${fileRef}_comment`] = basename;
        const buildFileSection = project.pbxBuildFileSection();
        buildFileSection[buildFileUuid] = {
            isa: 'PBXBuildFile',
            fileRef: fileRef,
            fileRef_comment: basename,
        };
        buildFileSection[`${buildFileUuid}_comment`] = `${basename} in Resources`;
        if (resourcesBuildPhase) {
            resourcesBuildPhase.files.push({
                value: buildFileUuid,
                comment: `${basename} in Resources`,
            });
        }
        else {
            project.addBuildPhase([fontPath], 'PBXResourcesBuildPhase', 'Resources', targetUuid, 'app_extension', '');
        }
        const targetGroup = project.pbxGroupByName(targetName);
        if (targetGroup) {
            targetGroup.children.push({
                value: fileRef,
                comment: basename,
            });
        }
        logger_1.Logging.logger.debug(`Added font ${basename} to Xcode project target ${targetName}`);
    }
};
const updateInfoPlistWithFonts = (config, options) => {
    const fontsConfig = options.fonts;
    const targetName = (0, target_1.getTargetName)(config, options);
    const { projectRoot } = config.modRequest;
    const plistFilePath = path.join(projectRoot, 'ios', targetName, 'Info.plist');
    if (!fs_extra_1.default.existsSync(plistFilePath)) {
        logger_1.Logging.logger.debug(`No Info.plist found at ${plistFilePath}, skipping font plist update`);
        return;
    }
    const contents = fs_extra_1.default.readFileSync(plistFilePath, 'utf-8');
    const dictTag = '<dict>';
    const dictIndex = contents.indexOf(dictTag);
    if (dictIndex === -1) {
        logger_1.Logging.logger.debug(`No <dict> tag found in ${plistFilePath}, skipping font plist update`);
        return;
    }
    const insertIndex = dictIndex + dictTag.length;
    const fontEntries = fontsConfig.fonts
        .map(f => `<string>${path.basename(f.filePath)}</string>`)
        .join('\n            ');
    const insertion = `
            <key>UIAppFonts</key>
            <array>
            ${fontEntries}
            </array>`;
    const newContents = contents.slice(0, insertIndex) + insertion + contents.slice(insertIndex);
    fs_extra_1.default.writeFileSync(plistFilePath, newContents);
    logger_1.Logging.logger.debug(`Added UIAppFonts to ${plistFilePath}`);
};
const injectNativeFonts = (config, options) => {
    if (!options.fonts?.fonts?.length)
        return;
    copyFontFilesToTarget(config, options);
    addFontsToXcodeProject(config, options);
    updateInfoPlistWithFonts(config, options);
};
exports.injectNativeFonts = injectNativeFonts;
