import React from 'react';
import {
  StyleSheet, WebView, View,
  ListView, ScrollView,
} from 'react-native';


export default class HelpAndSupportScreen extends React.Component {
  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      dataSource1: ds.cloneWithRows(['r1']),
      text: 'Loading Chat...',
      webviewLoaded: false, change: 0
    }
  }
  onLoadEnd() {
    console.log("Working");
    this.setState({ webviewLoaded: true, text: 'Made In Love With Food' });
  }
  render() {

    return (
      <ScrollView contentContainerStyle={[styles.mainContainer]}
      >
        <View style={{ flex: 1 }}>
          <WebView onLoadEnd={this.onLoadEnd.bind(this)}
            source={{ uri: 'https://tawk.to/chat/578fea66660462dd70bb51f2/default' }}
            style={[styles.webview]}
          ></WebView>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer:
  {
    flex: 1,
    //marginTop: Expo.Constants.statusBarHeight,
    width: null,
    height: null,
    backgroundColor: '#fff',
    flexDirection: 'column',
  },
  webview:
  {
    backgroundColor: '#fff',
    flex: 1
  }

});
