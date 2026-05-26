import { ExportedConfigWithProps, XcodeProject } from "@expo/config-plugins";
import { ExpoConfig } from "@expo/config-types";
import { WithExpoIOSWidgetsProps } from "..";
export declare const getBundleIdentifier: (config: ExpoConfig, options: WithExpoIOSWidgetsProps) => string;
export declare const withWidgetXCode: (props: ExportedConfigWithProps<XcodeProject>, options: WithExpoIOSWidgetsProps) => ExportedConfigWithProps<XcodeProject>;
