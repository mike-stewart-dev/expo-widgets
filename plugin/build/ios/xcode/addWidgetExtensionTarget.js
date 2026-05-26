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
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWidgetExtensionTarget = void 0;
const util = __importStar(require("util"));
const logger_1 = require("../../utils/logger");
const productType_1 = require("./productType");
const buildConfiguration_1 = require("./buildConfiguration");
const addWidgetExtensionTarget = (project, config, options, name, bundleId) => {
    const targetType = 'app_extension';
    const groupName = 'Embed Foundation Extensions';
    // Setup uuid and name of new target
    var targetUuid = project.generateUuid(), targetName = name.trim(), targetBundleId = bundleId;
    // Check type against list of allowed target types
    if (!targetName) {
        throw new Error("Target name missing.");
    }
    // Check type against list of allowed target types
    if (!targetType) {
        throw new Error("Target type missing.");
    }
    // Check type against list of allowed target types
    if (!(0, productType_1.getProductTypeForTargetType)(targetType)) {
        throw new Error("Target type invalid: " + targetType);
    }
    const settings = (0, buildConfiguration_1.getDefaultBuildConfigurationSettings)(options, config);
    // Build Configuration: Create
    var buildConfigurationsList = [
        {
            name: 'Debug',
            isa: 'XCBuildConfiguration',
            buildSettings: {
                GCC_PREPROCESSOR_DEFINITIONS: ['"DEBUG=1"', '"$(inherited)"'],
                ...settings
            }
        },
        {
            name: 'Release',
            isa: 'XCBuildConfiguration',
            buildSettings: {
                ...settings
            }
        }
    ];
    // Add optional bundleId to build configuration
    if (targetBundleId) {
        buildConfigurationsList = buildConfigurationsList.map((elem) => {
            elem.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = '"' + targetBundleId + '"';
            return elem;
        });
    }
    // Build Configuration: Add
    var buildConfigurations = project.addXCConfigurationList(buildConfigurationsList, 'Release', 'Build configuration list for PBXNativeTarget "' + targetName + '"');
    // Product: Create
    var productName = targetName, productType = (0, productType_1.getProductTypeForTargetType)(targetType), productFileType = fileTypeForProductType(productType);
    logger_1.Logging.logger.debug(`Adding product file`);
    const productFile = project.addProductFile(productName, {
        basename: `${targetName}.appex`,
        group: groupName,
        target: targetUuid,
        explicitFileType: productFileType,
        settings: {
            ATTRIBUTES: ["RemoveHeadersOnCopy"],
        },
        includeInIndex: 0,
        path: `${targetName}.appex`,
        sourceTree: 'BUILT_PRODUCTS_DIR',
    });
    // Product: Add to build file list
    project.addToPbxBuildFileSection(productFile);
    // Target: Create
    var target = {
        uuid: targetUuid,
        pbxNativeTarget: {
            isa: 'PBXNativeTarget',
            name: targetName,
            productName: '"' + targetName + '"',
            productReference: productFile.fileRef,
            productType: '"' + (0, productType_1.getProductTypeForTargetType)(targetType) + '"',
            buildConfigurationList: buildConfigurations.uuid,
            buildPhases: [],
            buildRules: [],
            dependencies: []
        }
    };
    // Target: Add to PBXNativeTarget section
    project.addToPbxNativeTargetSection(target);
    project.addTargetAttribute('DevelopmentTeam', options.devTeamId, target);
    project.addTargetAttribute('DevelopmentTeam', options.devTeamId);
    // This has 'Copy Files' hardcoded. instead adjust to groupName
    //project.addToPbxCopyfilesBuildPhase(productFile)
    logger_1.Logging.logger.debug(`Adding PBXCopyFilesBuildPhase`);
    project.addBuildPhase([], 'PBXCopyFilesBuildPhase', groupName, project.getFirstTarget().uuid, targetType, '');
    logger_1.Logging.logger.debug(`Fixing PBXCopyFilesBuildPhase`);
    project.buildPhaseObject('PBXCopyFilesBuildPhase', groupName, targetUuid)
        .files
        .push({
        value: productFile.uuid,
        comment: util.format("%s in %s", productFile.basename, productFile.group),
    });
    // Target: Add uuid to root project
    logger_1.Logging.logger.debug(`Adding target to project section`);
    project.addToPbxProjectSection(target);
    // Return target on success
    return target;
};
exports.addWidgetExtensionTarget = addWidgetExtensionTarget;
const fileTypeForProductType = (productType) => {
    const FILETYPE_BY_PRODUCTTYPE = {
        'com.apple.product-type.application': '"wrapper.application"',
        'com.apple.product-type.app-extension': '"wrapper.app-extension"',
        'com.apple.product-type.bundle': '"wrapper.plug-in"',
        'com.apple.product-type.tool': '"compiled.mach-o.dylib"',
        'com.apple.product-type.library.dynamic': '"compiled.mach-o.dylib"',
        'com.apple.product-type.framework': '"wrapper.framework"',
        'com.apple.product-type.library.static': '"archive.ar"',
        'com.apple.product-type.bundle.unit-test': '"wrapper.cfbundle"',
        'com.apple.product-type.application.watchapp': '"wrapper.application"',
        'com.apple.product-type.application.watchapp2': '"wrapper.application"',
        'com.apple.product-type.watchkit-extension': '"wrapper.app-extension"',
        'com.apple.product-type.watchkit2-extension': '"wrapper.app-extension"'
    };
    return FILETYPE_BY_PRODUCTTYPE[productType];
};
