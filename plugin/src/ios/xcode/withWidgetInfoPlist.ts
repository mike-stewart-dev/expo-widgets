

// EAS fails without the info.plist file updated in the widget extension project

import { ExportedConfigWithProps } from "@expo/config-plugins";
import { WithExpoIOSWidgetsProps } from "../..";
import path from "path";
import fsExtra from "fs-extra"
import { getTargetName } from "./target";

type PlistKeyValue = {
    key: string
    value: string
    tag: string
}

const getKeyValues = (): PlistKeyValue[] => [
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
    <string>com.apple.widgetkit-extension</string>`,  tag: 'dict', },
]

const keyValueAsXml = ({ tag, key, value }: PlistKeyValue) => {
    return `<key>${key}</key>
    <${tag}>${value}</${tag}>`
}

const getKeyValuesAsXml = () => {
    return getKeyValues().reduce((xml, kv) => {
        return `${xml}
            ${keyValueAsXml(kv)}`
    }, '')
}

const getPlistContents = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    </plist>
    `;
}

export const withWidgetInfoPlist = (config: ExportedConfigWithProps<unknown>, options: WithExpoIOSWidgetsProps) => {
    const targetName = getTargetName(config, options)
    const plistFilePath = path.join(config.modRequest.projectRoot, 'ios', targetName, 'Info.plist')
    const plistContents = getPlistContents()

    if (!fsExtra.existsSync(plistFilePath)) {
        fsExtra.writeFileSync(plistFilePath, plistContents)
    }

    const contents = fsExtra.readFileSync(plistFilePath, 'utf-8')
    let newContents = ''

    if (contents.indexOf('<dict>') > -1) {
        const keyValues = getKeyValues()

        let contentsToInsert = ''

        for (const kv of keyValues) {
            if (contents.indexOf(`<${kv.tag}>`) > -1) {
                continue
            }

            contentsToInsert = `${contentsToInsert}
            ${keyValueAsXml(kv)}`
        }

        const insertIndex = contents.indexOf('<dict>') + 6
        newContents = contents.substring(0, insertIndex)
            + contentsToInsert
            + contents.substring(insertIndex)

    }
    else {
        const insertIndex = contents.indexOf('</plist>')

        if (insertIndex === -1) {
            throw new Error(`Info.plist is malformed and has no ending </plist> tag! Cannot insert required widget configuration.`)
        }

        newContents = `${contents.substring(0, insertIndex)}
        <dict>
            ${ getKeyValuesAsXml()}
        </dict>
        </plist>`
    }

    fsExtra.writeFileSync(plistFilePath, newContents)
}