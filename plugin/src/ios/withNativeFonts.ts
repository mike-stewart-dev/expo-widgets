import { ExportedConfigWithProps, XcodeProject } from "@expo/config-plugins"
import { WithExpoIOSWidgetsProps } from ".."
import * as path from "path"
import fsExtra from "fs-extra"
import { Logging } from "../utils/logger"
import { getTargetName } from "./xcode/target"

const getPBXTargetByName = (project: XcodeProject, name: string) => {
    const targetSection = project.pbxNativeTargetSection()

    for (const uuid in targetSection) {
        const target = targetSection[uuid]
        if (target.name === name) {
            return { uuid, target }
        }
    }

    return { target: null, uuid: null }
}

const getResourcesBuildPhaseForTarget = (project: XcodeProject, targetUuid: string) => {
    const target = project.pbxNativeTargetSection()[targetUuid]
    if (!target || !target.buildPhases) return null

    const pbxResourcesBuildPhaseSection = project.hash.project.objects['PBXResourcesBuildPhase']
    if (!pbxResourcesBuildPhaseSection) return null

    for (const phase of target.buildPhases) {
        const phaseUuid = phase.value
        if (pbxResourcesBuildPhaseSection[phaseUuid]) {
            return pbxResourcesBuildPhaseSection[phaseUuid]
        }
    }

    return null
}

const copyFontFilesToTarget = (
    config: ExportedConfigWithProps<XcodeProject>,
    options: WithExpoIOSWidgetsProps,
) => {
    const fontsConfig = options.fonts!
    const targetName = getTargetName(config, options)
    const { projectRoot } = config.modRequest
    const sourceDir = path.join(projectRoot, fontsConfig.srcFolder)
    const targetFontsDir = path.join(projectRoot, 'ios', targetName, 'Fonts')

    if (!fsExtra.existsSync(targetFontsDir)) {
        fsExtra.mkdirSync(targetFontsDir, { recursive: true })
    }

    for (const font of fontsConfig.fonts) {
        const src = path.join(sourceDir, font.filePath)
        const dest = path.join(targetFontsDir, font.filePath)
        const destDir = path.dirname(dest)

        if (!fsExtra.existsSync(destDir)) {
            fsExtra.mkdirSync(destDir, { recursive: true })
        }

        fsExtra.copySync(src, dest)
        Logging.logger.debug(`Copied font ${font.filePath} to ${targetName}/Fonts/`)
    }
}

const addFontsToXcodeProject = (
    config: ExportedConfigWithProps<XcodeProject>,
    options: WithExpoIOSWidgetsProps,
) => {
    const fontsConfig = options.fonts!
    const targetName = getTargetName(config, options)
    const project = config.modResults

    const { target, uuid: targetUuid } = getPBXTargetByName(project, targetName)

    if (!target || !targetUuid) {
        throw new Error(
            `expo-widgets:: Cannot find target "${targetName}" for font injection. ` +
            `Ensure the widget extension target is created before fonts are injected.`
        )
    }

    const resourcesBuildPhase = getResourcesBuildPhaseForTarget(project, targetUuid)

    for (const font of fontsConfig.fonts) {
        const fontPath = path.join('Fonts', font.filePath)
        const basename = path.basename(font.filePath)

        const fileRef = project.generateUuid()
        const buildFileUuid = project.generateUuid()

        const fileRefSection = project.pbxFileReferenceSection()
        fileRefSection[fileRef] = {
            isa: 'PBXFileReference',
            name: `"${basename}"`,
            path: `"${fontPath}"`,
            sourceTree: '"<group>"',
            lastKnownFileType: 'unknown',
            includeInIndex: 0,
        }
        fileRefSection[`${fileRef}_comment`] = basename

        const buildFileSection = project.pbxBuildFileSection()
        buildFileSection[buildFileUuid] = {
            isa: 'PBXBuildFile',
            fileRef: fileRef,
            fileRef_comment: basename,
        }
        buildFileSection[`${buildFileUuid}_comment`] = `${basename} in Resources`

        if (resourcesBuildPhase) {
            resourcesBuildPhase.files.push({
                value: buildFileUuid,
                comment: `${basename} in Resources`,
            })
        } else {
            project.addBuildPhase(
                [fontPath],
                'PBXResourcesBuildPhase',
                'Resources',
                targetUuid,
                'app_extension',
                '',
            )
        }

        const targetGroup = project.pbxGroupByName(targetName)
        if (targetGroup) {
            targetGroup.children.push({
                value: fileRef,
                comment: basename,
            })
        }

        Logging.logger.debug(`Added font ${basename} to Xcode project target ${targetName}`)
    }
}

const updateInfoPlistWithFonts = (
    config: ExportedConfigWithProps<XcodeProject>,
    options: WithExpoIOSWidgetsProps,
) => {
    const fontsConfig = options.fonts!
    const targetName = getTargetName(config, options)
    const { projectRoot } = config.modRequest
    const plistFilePath = path.join(projectRoot, 'ios', targetName, 'Info.plist')

    if (!fsExtra.existsSync(plistFilePath)) {
        Logging.logger.debug(`No Info.plist found at ${plistFilePath}, skipping font plist update`)
        return
    }

    const contents = fsExtra.readFileSync(plistFilePath, 'utf-8')
    const dictTag = '<dict>'
    const dictIndex = contents.indexOf(dictTag)

    if (dictIndex === -1) {
        Logging.logger.debug(`No <dict> tag found in ${plistFilePath}, skipping font plist update`)
        return
    }

    const insertIndex = dictIndex + dictTag.length
    const fontEntries = fontsConfig.fonts
        .map(f => `<string>${path.basename(f.filePath)}</string>`)
        .join('\n            ')

    const insertion = `
            <key>UIAppFonts</key>
            <array>
            ${fontEntries}
            </array>`

    const newContents = contents.slice(0, insertIndex) + insertion + contents.slice(insertIndex)
    fsExtra.writeFileSync(plistFilePath, newContents)
    Logging.logger.debug(`Added UIAppFonts to ${plistFilePath}`)
}

export const injectNativeFonts = (
    config: ExportedConfigWithProps<XcodeProject>,
    options: WithExpoIOSWidgetsProps,
) => {
    if (!options.fonts?.fonts?.length) return

    copyFontFilesToTarget(config, options)
    addFontsToXcodeProject(config, options)
    updateInfoPlistWithFonts(config, options)
}
