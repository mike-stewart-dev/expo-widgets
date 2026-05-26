"use strict";
// EAS fails without the info.plist file updated in the widget extension project
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withWidgetInfoPlist = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const target_1 = require("./target");
const getKeyValues = () => [
    { key: 'CFBundleDevelopmentRegion', value: '$(DEVELOPMENT_LANGUAGE)', tag: 'string', },
    { key: 'CFBundleDisplayName', value: 'ExpoWidgets', tag: 'string', },
    { key: 'CFBundleExecutable', value: '$(EXECUTABLE_NAME)', tag: 'string', },
    { key: 'CFBundleIdentifier', value: '$(PRODUCT_BUNDLE_IDENTIFIER)', tag: 'string', },
    { key: 'CFBundleInfoDictionaryVersion', value: '6.0', tag: 'string', },
    { key: 'CFBundleName', value: '$(PRODUCT_NAME)', tag: 'string', },
    { key: 'CFBundlePackageType', value: '$(PRODUCT_BUNDLE_PACKAGE_TYPE)', tag: 'string', },
    { key: 'CFBundleShortVersionString', value: '$(MARKETING_VERSION)', tag: 'string', },
    { key: 'CFBundleVersion', value: '$(CURRENT_PROJECT_VERSION)', tag: 'string', },
    { key: 'NSExtension', value: `<key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>`, tag: 'dict', },
];
const keyValueAsXml = ({ tag, key, value }) => {
    return `<key>${key}</key>
    <${tag}>${value}</${tag}>`;
};
const getKeyValuesAsXml = () => {
    return getKeyValues().reduce((xml, kv) => {
        return `${xml}
            ${keyValueAsXml(kv)}`;
    }, '');
};
const getPlistContents = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    </plist>
    `;
};
const withWidgetInfoPlist = (config, options) => {
    const targetName = (0, target_1.getTargetName)(config, options);
    const plistFilePath = path_1.default.join(config.modRequest.projectRoot, 'ios', targetName, 'Info.plist');
    const plistContents = getPlistContents();
    if (!fs_extra_1.default.existsSync(plistFilePath)) {
        fs_extra_1.default.writeFileSync(plistFilePath, plistContents);
    }
    const contents = fs_extra_1.default.readFileSync(plistFilePath, 'utf-8');
    let newContents = '';
    if (contents.indexOf('<dict>') > -1) {
        const keyValues = getKeyValues();
        let contentsToInsert = '';
        for (const kv of keyValues) {
            if (contents.indexOf(`<${kv.tag}>`) > -1) {
                continue;
            }
            contentsToInsert = `${contentsToInsert}
            ${keyValueAsXml(kv)}`;
        }
        const insertIndex = contents.indexOf('<dict>') + 6;
        newContents = contents.substring(0, insertIndex)
            + contentsToInsert
            + contents.substring(insertIndex);
    }
    else {
        const insertIndex = contents.indexOf('</plist>');
        if (insertIndex === -1) {
            throw new Error(`Info.plist is malformed and has no ending </plist> tag! Cannot insert required widget configuration.`);
        }
        newContents = `${contents.substring(0, insertIndex)}
        <dict>
            ${getKeyValuesAsXml()}
        </dict>
        </plist>`;
    }
    fs_extra_1.default.writeFileSync(plistFilePath, newContents);
};
exports.withWidgetInfoPlist = withWidgetInfoPlist;
