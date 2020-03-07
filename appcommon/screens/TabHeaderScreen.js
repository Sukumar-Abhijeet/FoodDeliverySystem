import React from 'react';
import {
  AsyncStorage, TouchableOpacity, View, StyleSheet, Text, StatusBar, Platform, NativeModules
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { withNavigation } from 'react-navigation';
import HomeScreen from './HomeScreen';
const { StatusBarManager } = NativeModules;
//import HS from './HomeScreen';
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 30 : StatusBarManager.HEIGHT;
//  const { navigate } = this.props.navigation;
class TabHeaderScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: 'Loading'
    }
    //console.warn(this.props.navigation.getParam('address'));
  }

  async retrieveItem(key) {
    console.log("TabHeaderScreen retrieveItem() key: ", key);
    try {
      const retrievedItem = await AsyncStorage.getItem(key);
      const item = JSON.parse(retrievedItem);
      return item;
    } catch (error) {
      console.log(error.message);
    }
    return
  }

  getLocation = () => {
    console.log("TabHeaderScreen getLocation()");
    this.retrieveItem('Address').then((address) => {
      console.log("TabHeaderScreen getLocation Address : ", address)
      if (address != null) {
        let str = "";
        // str += (typeof address.houseNo != 'undefined' && address.houseNo != "") ? address.houseNo + ", " : "";
        //str += (typeof address.streetName != 'undefined' && address.streetName != "") ? address.streetName + ", " : "";
        // str += (typeof address.landmark != 'undefined' && address.landmark != "") ? address.landmark + ", " : "";
        str += (typeof address.locName != 'undefined' && address.locName != "") ? address.locName + ", " : "";
        str += (typeof address.cityName != 'undefined' && address.cityName != "") ? address.cityName : "";
        // str += (typeof address.pincode != 'undefined' && address.pincode != "") ? address.pincode : "";
        str = (str.length > 30) ? str.substr(0, 30) + "..." : str;
        this.setState({ location: str });
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  checkTONav() {
    console.log('TabHeaderSceen :checkTONav()', this.props.navigation.state.routeName)
    if (this.props.navigation.state.routeName != "Home") {
      this.props.navigation.navigate("Home");
    }
    setTimeout(() => {
      // new HomeScreen().scrollToTop();
    });
  }

  myLocation = () => {
    console.log("TabHeaderScreen myLocation()");
    this.props.navigation.navigate("LocationSearch");
  }

  componentDidMount() {
    console.log("TabHeaderScreen componentDidMount()");
    this.getLocation();
    this.props.navigation.addListener('didFocus', () => { this.setState({ location: "Checking Location" }, () => { this.getLocation(); }); })
  }

  render() {
    return (
      <View style={styles.mainHeaderConatiner}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => this.checkTONav()}>
            <Icon name="home" size={20} color="#cd2121" style={{ height: 20 }} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'column', marginLeft: 10 }}>
          <Text style={{ fontSize: 12, color: '#000', fontWeight: 'bold' }}>LOCATION</Text>
          <TouchableOpacity onPress={this.myLocation}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ fontSize: 13, color: '#7c7575' }}>{this.state.location}</Text>
              <Icon name="sort-down" size={15} color="#cd2121" style={{ height: 15, marginLeft: 5 }} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 'auto' }}>
          <TouchableOpacity onPress={() => { this.props.navigation.navigate('Notification') }}>
            <Icon name="bell" size={20} color="#cd2121" style={{ height: 20 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  mainHeaderConatiner:
  {
    // marginTop: STATUSBAR_HEIGHT,
    flexDirection: 'row', backgroundColor: '#fff',
    padding: 10,
    borderBottomColor: '#d8d8d8',
    borderBottomWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.2,
    shadowRadius: 1, elevation: 1,

  }
});

export default withNavigation(TabHeaderScreen);