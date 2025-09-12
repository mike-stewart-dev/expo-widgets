import { Button, Platform, StyleSheet, Text, View } from 'react-native';
import { setWidgetData, updateWidgetData } from '@bittingz/expo-widgets';
import Constants from 'expo-constants';

/*
  A super simple example of using widgets

  For multiple widget support, the android setWidgetData now needs a package
  parameter passed as the second argument.

  To run this locally you can do the following in the example project folder

  > npm run prebuild:ios
  > npm run ios
  
  and
  > npm run prebuild:android
  > npm run android
*/
export default function App() {
  function sendGenericWidgetData() {
    const androidPackage = Constants.expoConfig?.android?.package;

    if (Platform.OS === 'ios') {
      setWidgetData({ message: 'Hello from app!' });
    } else if (androidPackage) {
        setWidgetData({ message: 'Hello from app!' }, androidPackage);
    }
  }

  function sendSpecificWidgetData() {
    const androidPackage = Constants.expoConfig?.android?.package;

    if (Platform.OS === 'ios') {
        updateWidgetData("MyWidgets", { message: 'Hello from updated widget!' });
    } else if (androidPackage) {
        // NOTE: You'll need to get the widgetId from your native code.
        // This is just an example with a hardcoded widgetId.
        const widgetId = "1";
        updateWidgetData(widgetId, { message: 'Hello from updated widget!' }, androidPackage);
    }
  }

  return (
    <View style={styles.container}>
      <Text>Example App!</Text>
      <Button
        title='Send Generic Widget Data!'
        onPress={sendGenericWidgetData}
      />
      <Button
        title='Send Specific Widget Data!'
        onPress={sendSpecificWidgetData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
