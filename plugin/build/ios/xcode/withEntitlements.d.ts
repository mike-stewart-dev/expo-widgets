import { ExportedConfigWithProps } from "@expo/config-plugins";
import { WithExpoIOSWidgetsProps } from "../..";
import { ExpoConfig } from "@expo/config-types";
export declare const withEntitlements: (config: ExportedConfigWithProps<unknown>, options: WithExpoIOSWidgetsProps) => ExportedConfigWithProps<unknown>;
export declare const getPushNotificationsMode: (options: WithExpoIOSWidgetsProps) => "development" | "production";
export declare const getAppGroupId: (config: ExpoConfig, options: WithExpoIOSWidgetsProps) => string;
