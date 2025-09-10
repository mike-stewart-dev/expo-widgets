import { ConfigPlugin } from '@expo/config-plugins';
import { WithExpoAndroidWidgetsProps } from '..';
import { withSourceFiles } from './withSourceFiles';
import { withGsonGradle, withWidgetAppBuildGradle } from './withAppBuildGradle';
import { withWidgetProjectBuildGradle } from './withProjectBuildGradle';
import { withWidgetManifest } from './withWidgetManifest';
import { withModule } from './withModule';

const DEFAULT_OPTIONS: WithExpoAndroidWidgetsProps = {
  src: 'widgets/android',
  widgets: [],
  distPlaceholder: '',
  includeDefaultModule: false,
};

function getDefaultedOptions(options: WithExpoAndroidWidgetsProps) {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
  };
}

export const withAndroidWidgets: ConfigPlugin<WithExpoAndroidWidgetsProps> = (
  config,
  userOptions
) => {
  const options = getDefaultedOptions(userOptions);

  config = withWidgetManifest(config, options);

  const sdkVersion = parseInt(config.sdkVersion?.split('.')[0] || '0', 10);
  if (sdkVersion <= 52) {
    config = withWidgetProjectBuildGradle(config);
  }
  config = withWidgetAppBuildGradle(config);
  config = withGsonGradle(config);
  config = withSourceFiles(config, options);

  if (options.includeDefaultModule) {
    config = withModule(config, options);
  }

  return config;
};
