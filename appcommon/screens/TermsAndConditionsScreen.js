import React from 'react';
import {
  StyleSheet, View, WebView,
} from 'react-native';
export default class TermsAndConditionsScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    }

  }


  render() {

    return (
      <View style={styles.mainContainer}>
        {/* <KeyboardAvoidingView behaviour='height'> */}
        {/* <Display enable={this.state.webviewLoaded}> */}
        <WebView
          source={{ uri: 'https://www.bringmyfood.in/terms' }}
          style={[styles.webview, { marginBottom: this.state.change }]}
        ></WebView>
        {/* </Display> */}

        {/* </KeyboardAvoidingView> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer:
  {
    flex: 1,
    width: null,
    height: null,
    backgroundColor: '#f8f8f8',
    flexDirection: 'column',
    // paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,

  },

});