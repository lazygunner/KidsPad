import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const PRIVACY_URL = 'https://www.kidsrkidschina.com/#/other/privacy';

const WebScreen: React.FC = () => (
  <View style={styles.container}>
    <WebView source={{ uri: PRIVACY_URL }} startInLoadingState />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WebScreen;
