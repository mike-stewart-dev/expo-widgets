import { ExportedConfigWithProps, XcodeProject, } from "@expo/config-plugins"
import fs from "fs"
import fsExtra from "fs-extra"
import path from "path"
import { WithExpoIOSWidgetsProps } from ".."
import { getTemplate } from "./module-template"
import { Logging } from "../utils/logger"

export const withModule = (
    props: ExportedConfigWithProps<XcodeProject>,
    options: WithExpoIOSWidgetsProps,
) => {
    try {
        const {
            projectRoot,
        } = props.modRequest

        const widgetFolderPath = path.join(projectRoot, options.src)

        Logging.logger.debug(`Current directory::: ${__dirname}`)
        const expoModulePath = path.join(__dirname, '../../../ios/ExpoWidgetsModule.swift')
        Logging.logger.debug(`Expo module path: ${expoModulePath}`)

        const moduleFile = path.join(widgetFolderPath, 'Module.swift')

        if (!fs.existsSync(moduleFile)) {
            Logging.logger.debug(`No Module.swift provided. Using template.`)

            const contents = getTemplate()
            fsExtra.outputFileSync(expoModulePath, contents)
        }
        else {
            const contents = fs.readFileSync(moduleFile)
            fsExtra.outputFileSync(expoModulePath, contents)
        }

        const writtenContent = fsExtra.readFileSync(expoModulePath, 'utf-8')
        Logging.logger.debug(`Module.swift contents::`)
        Logging.logger.debug(writtenContent)

        return props
    }
    catch (e) {
        console.error(e)
        throw e
    }
}