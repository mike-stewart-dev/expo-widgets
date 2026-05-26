import { mergeContents } from "@expo/config-plugins/build/utils/generateCode"
import { ExportedConfigWithProps, XcodeProject, } from "expo/config-plugins"
import * as fs from "fs"
import * as path from "path"
import { Logging } from "../utils/logger"
import { WithExpoIOSWidgetsProps } from ".."
import { getTargetName } from "./xcode/target"

export const withPodfile = (config: ExportedConfigWithProps<XcodeProject>, options: WithExpoIOSWidgetsProps) => {
  const targetName = `${getTargetName(config, options)}`
  const AppExtAPIOnly = options.xcode?.appExtAPI ?? false;
  const AppExtValue = AppExtAPIOnly ? 'YES' : 'No';

  const podFilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
  let podFileContent = fs.readFileSync(podFilePath).toString();

  const podInstaller = `
target '${targetName}' do
  use_expo_modules!
  config = use_native_modules!

  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
  use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => podfile_properties['expo.jsEngine'] == nil || podfile_properties['expo.jsEngine'] == 'hermes',
    # An absolute path to your application root.
    :app_path => "#{Pod::Config.instance.installation_root}/..",
    :privacy_file_aggregation_enabled => podfile_properties['apple.privacyManifestAggregationEnabled'] != 'false',
  )
end
`;

  let updatedContent = podFileContent;

  const hasResourceBundleTarget = /resource_bundle_target.build_configurations.each do \|config\|/.test(podFileContent);
  if (hasResourceBundleTarget) {
    const withAppExtFix = mergeContents({
      tag: "app_ext_fix",
      src: updatedContent,
      newSrc: `
        config.build_settings['APPLICATION_EXTENSION_API_ONLY'] = 'No'
        `,
      anchor: /resource_bundle_target.build_configurations.each do \|config\|/,
      offset: 1,
      comment: "#",
    })
    updatedContent = withAppExtFix.contents;
  }

  const hasPostInstall = /post_install do \|installer\|/.test(updatedContent);
  if (hasPostInstall) {
    const withAppExtFixPt2 = mergeContents({
      tag: 'fix2',
      src: updatedContent,
      newSrc: ` installer.pods_project.targets.each do |target|
        target.build_configurations.each do |config|
          config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
          config.build_settings['APPLICATION_EXTENSION_API_ONLY'] = 'No'
        end
      end`,
      anchor: /post_install do \|installer\|/,
      offset: 1,
      comment: "#",
    })
    updatedContent = withAppExtFixPt2.contents;
  }

  Logging.logger.debug('Updating podfile')

  fs.writeFileSync(podFilePath, [
    updatedContent,
    podInstaller
  ].join('\n'));

  return config;
}