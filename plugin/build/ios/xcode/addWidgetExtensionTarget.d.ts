import { XcodeProject } from "@expo/config-plugins";
import { WithExpoIOSWidgetsProps } from "../..";
import { ExpoConfig } from "@expo/config-types";
export declare const addWidgetExtensionTarget: (project: XcodeProject, config: ExpoConfig, options: WithExpoIOSWidgetsProps, name: string, bundleId?: string) => {
    uuid: any;
    pbxNativeTarget: {
        isa: string;
        name: string;
        productName: string;
        productReference: any;
        productType: string;
        buildConfigurationList: any;
        buildPhases: never[];
        buildRules: never[];
        dependencies: never[];
    };
};
