import React from 'react';
import {
  View,
  StyleSheet, AppState, AsyncStorage, Platform, PermissionsAndroid
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

const styles = StyleSheet.create({
  image: {
    width: 320,
    height: 320,
  },

});
const slides = [
  {
    key: 'somethun',
    title: 'Best Food Nearby',
    text: 'We have curated only tasty and hygienic dishes for you',
    image: require('../assets/intro-slider-images/1st.png'),
    imageStyle: styles.image,
    backgroundColor: '#cd2121',
  },
  {
    key: 'somethun-dos',
    title: 'No Minimum Order',
    text: 'Order just your favourite sweet & we deliver it to you.',
    image: require('../assets/intro-slider-images/2nd.png'),
    imageStyle: styles.image,
    backgroundColor: '#febe29',
  },
  {
    key: 'somethun1',
    title: 'Superfast Delivery',
    text: 'Because food tastes the best when delivered hot',
    image: require('../assets/intro-slider-images/3rd.png'),
    imageStyle: styles.image,
    backgroundColor: '#22bcb5',
  }
];
class AuthenticationScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      appState: '',
    }
  }

  async retrieveItem(key) {
    console.log("AuthenticationScreen retrieveItem() key: ", key);
    let item = null;
    try {
      const retrievedItem = await AsyncStorage.getItem(key);
      item = JSON.parse(retrievedItem);
    }
    catch (error) {
      console.log(error.message);
    }
    return item;
  }

  async storeItem(key, item) {
    console.log("AuthenticationScreen storeItem() key: ", key);
    let jsonItem = null;
    try {
      jsonItem = await AsyncStorage.setItem(key, JSON.stringify(item));
    }
    catch (error) {
      console.log(error.message);
    }
    return jsonItem;
  }

  _onDone = () => {
    console.log("AuthenticationScreen _onDone()");
    this.storeItem('HelperScreenData', "Done");
    this.props.navigation.navigate('Location');
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
    }
    this.setState({ appState: nextAppState });
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  async accessMultiplePermissions() {
    console.log("Authentication Screen accessmultiplepermissions");
    if (Platform.OS === 'android') {
      console.log("Platform is ANDROID");
      try {
        let granted = {};
        var permissions = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ]
        granted = await PermissionsAndroid.requestMultiple(permissions)
        console.log("permissions array : ", granted);
      } catch (err) {
        console.warn(err)
      }
    }
    if (Platform.OS === 'ios') {
      console.log("Platform is IOS please add permission codes ");
    }
  }

  componentWillMount() {
    this.accessMultiplePermissions();
  }


  render() {

    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 9 }}>
          <AppIntroSlider
            slides={slides}
            activeDotColor={'#cd2121'}
            onDone={this._onDone}
            bottomButton={true}
            doneLabel={"SET DELIVERY ADDRESS"}
          />
        </View>
        {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', backgroundColor: '#fff' }}>
          <Text style={{ color: '#999797' }}>Already Registered ? </Text>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Login')}>
            <Text style={{ color: '#cd2121' }}>LOGIN</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    );
  }

}



export default AuthenticationScreen;