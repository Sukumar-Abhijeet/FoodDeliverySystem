import React from 'react';
import {
  StyleSheet, Text, View,
  ToastAndroid, ListView, ScrollView, Dimensions, TouchableOpacity, AsyncStorage
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Display from 'react-native-display';
import Global from '../Urls/Global';
const BASE_PATH = Global.BASE_PATH;


const aspectRatio = Dimensions.get('window').height / Dimensions.get('window').width;
export default class SavedAddressScreen extends React.Component {

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      savedAddresses: [],
      customerId: "",

    }

  }

  async retrieveItem(key) {
    console.log("SavedAddressScreen retrieveItem()");
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
    console.log("SavedAddressScreen StoreItem() key: ", key);
    try {
      var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
      return jsonOfItem;
    }
    catch (error) {
      console.log(error.message);
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    }
    catch (exception) {
      return false;
    }
  }

  getUserData = () => {
    console.log("SavedAddressScreen getUserData()");
    this.retrieveItem('UserData').then((user) => {
      this.setState({ customerId: user.uuid });
      this.fetchSavedAddress();
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  fetchSavedAddress = () => {
    console.log("SavedAddressScreen fetchSavedAddress()");
    let formValue = { "uuid": this.state.customerId };
    console.log("URL and Data: ", (BASE_PATH + Global.FETCH_SAVED_ADDRESS_URL), formValue);
    fetch(BASE_PATH + Global.FETCH_SAVED_ADDRESS_URL, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formValue)
    }).then((response) => response.json()).then((responseJson) => {
      console.log("response: ", responseJson);
      if (responseJson.Success == 'Y') {
        this.setState({ savedAddresses: responseJson.SavedAddress });
      }
      else {
        ToastAndroid.show("No saved address present.", ToastAndroid.SHORT);
      }
    }).catch((error) => {
      console.log("Error Saved Address: ", error);
      ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
    });
  }

  checkSavedAddress = (data) => {
    console.log("SavedAddressScreen checkSavedAddress() data: ", data);
    let address = {
      houseNo: data.HouseNo, streetName: data.StreetName, landmark: data.Landmark, locCode: data.LocalityCode, id: data.Id, locName: data.Locality, cityCode: data.CityCode, cityName: data.City,
      pincode: data.Pincode, type: data.Type, latLng: data.GeoLoc, fAvail: data.fAvail, bAvail: data.bAvail
    };
    this.storeItem("Address", address);
    setTimeout(() => {
      this.props.navigation.navigate('Home');
    });

  }

  componentDidMount() {
    console.log("SavedAddressScreen componentDidMount()");
    this.props.navigation.addListener('didFocus', () => {
      this.getUserData();
    });
  }

  render() {

    return (
      <View style={styles.mainContainer}>
        <ScrollView>
          <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Address Book</Text>
          {
            this.state.savedAddresses.map((data, index) => (
              <TouchableOpacity onPress={this.checkSavedAddress.bind(this, data)} key={index}>
                <View style={[styles.greentext, { borderTopWidth: 0, flexDirection: 'row' }]}>
                  <View style={{ flex: 9 }}>
                    <Text style={{ fontSize: 16, fontWeight: '300' }}>{data.Type}</Text>
                    <Text style={{ color: '#000', fontSize: 14, color: '#7a7a7a' }}>{data.FormattedAddress}</Text>
                  </View>
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 2 }}>
                    <Icon name='ellipsis-v' color='#dbdbdb' size={16} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          }
          <Display enable={this.state.savedAddresses.length == 0}>
            <Text style={{ color: '#000', fontSize: 14 }}>No saved addresses are present</Text>
          </Display>
          {/* <TouchableOpacity onPress={() => this.props.navigation.navigate('AddAddress')}>
            <View style={[styles.greentext, { borderTopWidth: 0, }]}>
              <View><Icon name="plus" color="#079613" size={15} /></View>
              <View style={{ marginLeft: 6 }}><Text style={{ color: '#079613', fontSize: 14 }}>Add Address</Text></View>
            </View>
          </TouchableOpacity> */}
        </ScrollView>
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
    backgroundColor: '#fff',
    flexDirection: 'column',
    // marginTop: Expo.Constants.statusBarHeight,
    paddingHorizontal: 5
  },
  greentext:
  {
    flexDirection: 'row',
    paddingVertical: 10,
    //   borderTopWidth:1,
    borderBottomWidth: 1,
    borderColor: '#e8e8e8'
  }

});