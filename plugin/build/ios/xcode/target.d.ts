import { XcodeProject } from "expo/config-plugins";
import { ExpoConfig } from "@expo/config-types";
import { WithExpoIOSWidgetsProps } from "../..";
export declare const getPBXTargetByName: (project: XcodeProject, name: string) => {
    uuid: string;
    target: any;
} | {
    target: null;
    uuid: null;
};
/**
 * Gets the target name either via a sanitised config.name + Widgets or if provided options.xcode.targetName
 * @param config The expo config
 * @param options The ios config options
 * @returns The target name
 */
export declare const getTargetName: (config: ExpoConfig, options: WithExpoIOSWidgetsProps) => string;
