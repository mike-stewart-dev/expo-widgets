import { ConfigPlugin } from "expo/config-plugins";
import { WithExpoIOSWidgetsProps } from "..";
import { ExpoConfig } from "@expo/config-types";
export declare const getAppGroupEntitlement: (config: ExpoConfig) => string;
export declare const withAppGroupPermissions: ConfigPlugin<WithExpoIOSWidgetsProps>;
