import React from 'react';
import {
  StyleSheet, Text, View, BackHandler, ToastAndroid, Image, Platform, StatusBar, ListView, ScrollView, TouchableOpacity, AsyncStorage,
} from 'react-native';
import { TextField } from 'react-native-material-textfield';
import Icon from 'react-native-vector-icons/FontAwesome';
import Display from 'react-native-display';
import Global from '../Urls/Global';

const BASE_PATH = Global.BASE_PATH;
export default class LoactionSearchScreen extends React.Component {
  _didFocusSubscription;
  _willBlurSubscription;
  constructor(props) {
    super(props);



    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid));
    this.state = {
      dataSource1: ds.cloneWithRows([]),
      dataSource2: ds.cloneWithRows([]),
      recentLocations: [],
      savedAddresses: [],
      fetchAddressLoader: false,
      uuid: "",
      locationSearch: '',
      searchresults: false,
      navigatedFrom: this.props.navigation.getParam("navigatedFrom"),
      pincode: "",
      address: "",
      addressType: "",
      countback: true,
      latLng: ""
    }

  }

  onBackButtonPressAndroid = () => {
    console.log(this.state.navigatedFrom)

    if (this.state.navigatedFrom == "Location") {
      console.log("Navigate To Authentication");
      if (this.state.countback) {
        ToastAndroid.show("Press again to close the app.", ToastAndroid.SHORT);
        this.setState({ countback: false });
        return true;
      }
      else {
        ToastAndroid.show("Closing the app.", ToastAndroid.SHORT);
        this.setState({ countback: true });
        BackHandler.exitApp();
        //return false;
      }
    }

    if (this.state.navigatedFrom == "undefined") {
      console.log("Navigate To BackStack");
      this.props.navigation.goBack();
    }

  };

  async retrieveItem(key) {
    console.log("LocationSearchScreen retrieveItem() key: ", key);
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
    console.log("LocationSearchScreen storeItem() key: ", key);
    let jsonItem = null;
    try {
      jsonItem = await AsyncStorage.setItem(key, JSON.stringify(item));
    }
    catch (error) {
      console.log(error.message);
    }
    return jsonItem;
  }

  async removeItem(key) {
    console.log("LocationSearchScreen removeItem() key: ", key);
    try {
      await AsyncStorage.removeItem(key);
      return true;
    }
    catch (exception) {
      return false;
    }
  }

  getUserData = () => {
    console.log("LocationSearchScreen getUserData()");
    this.retrieveItem('UserData').then((user) => {
      if (user != null) {
        console.log("User is logged in");
        this.setState({ uuid: user.uuid });
        this.fetchSavedAddress();
      }
      else {
        console.log("User is not logged in");
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  fetchSavedAddress = () => {
    console.log("LocationSearchScreen fetchSavedAddress()");
    if (this.state.savedAddresses.length < 1) {
      this.setState({ fetchAddressLoader: true });
      let formValue = { uuid: this.state.uuid };
      fetch(BASE_PATH + Global.FETCH_USER_SAVED_ADDRESS_URL, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formValue)
      }).then((response) => response.json()).then((responseJson) => {
        console.log("fetchSavedAddress response: ", responseJson.Success);
        if (responseJson.Success == "Y") {
          this.setState({ savedAddresses: responseJson.SavedAddress });
        }
        this.setState({ fetchAddressLoader: false });
      }).catch((error) => {
        console.log("Error Fetch Saved Address: ", error);
        ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
      });
    }
  }

  fetchRecentLocations = () => {
    console.log("LoactionSearchScreen fetchRecentLocations()");
    this.retrieveItem('RecentLocations').then((data) => {
      if (data != null) {
        this.setState({ recentLocations: data });
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  getLocations = (locationSearch) => {
    console.log("LoactionSearchScreen getLocations() locationSearch: ", locationSearch);
    let ls = locationSearch.locationSearch;
    fetch("https://maps.googleapis.com/maps/api/place/autocomplete/json?input=" + ls + "&key=AIzaSyC4hC-Svfjb89mTn0lMX0wvxPezlxG1uOI&region=in", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((response) => response.json()).then((responseJson) => {
      const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.setState({ dataSource2: ds.cloneWithRows(responseJson.predictions) });
      this.setState({ searchresults: true });
    });
  }

  checkSavedAddress = (data) => {
    console.log("LoactionSearchScreen checkSavedAddress() data: ", data);
    let locAddr = {};
    locAddr.id = data.Id;
    locAddr.houseNo = data.HouseNo;
    locAddr.streetName = data.StreetName;
    locAddr.landmark = data.Landmark;
    locAddr.cityCode = data.CityCode;
    locAddr.cityName = data.City;
    locAddr.latLng = data.GeoLoc;
    locAddr.locCode = data.LocalityCode;
    locAddr.locName = data.Locality;
    locAddr.pincode = data.Pincode;
    locAddr.type = data.Type;
    locAddr.fAvail = data.fAvail;
    locAddr.bAvail = data.bAvail;
    this.storeItem("AddressType", "MANUAL");
    this.storeItem("Address", locAddr);
    this.checkServicesAvailabilityByLocality(locAddr);
  }

  checkRecentLocation = (data) => {
    console.log("LoactionSearchScreen checkRecentLocation() data: ", data);
    fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + data + '&key=AIzaSyC4hC-Svfjb89mTn0lMX0wvxPezlxG1uOI&region=in').then((response) => response.json()).then((responseJson) => {
      if (responseJson.status == "OK") {
        let ac = responseJson.results[0];
        let position = ac.geometry.location;
        console.log("Postion: ", position);
        if (typeof position.lat != 'undefined' && typeof position.lng != 'undefined') {
          this.setState({ latLng: position.lat + "," + position.lng });
        }
        this.checkPincodeService(data, "");
      }
    }).catch((error) => {
      console.log("Error Pincode Check: ", error);
      ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
      this.checkPincodeService(data, "");
    });
  }

  checkPlaces = (data) => {
    console.log("LoactionSearchScreen checkPlaces() data: ", data);
    this.retrieveItem('RecentLocations').then((dataArr) => {
      if (dataArr != null) {
        let flag = true;
        for (let i = 0; i < dataArr.length; i++) {
          if (dataArr[i].toLowerCase() == data.toLowerCase()) {
            flag = false;
            break;
          }
        }
        if (flag) {
          dataArr.unshift(data);
          if (dataArr.length > 5) {
            dataArr.splice(5, dataArr.length);
          }
          this.storeItem("RecentLocations", dataArr);
        }
      }
      else {
        let arr = [];
        arr.push(data);
        this.storeItem("RecentLocations", arr);
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
    fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + data + '&key=AIzaSyC4hC-Svfjb89mTn0lMX0wvxPezlxG1uOI').then((response) => response.json()).then((responseJson) => {
      if (responseJson.status == "OK") {
        let ac = responseJson.results[0];
        let position = ac.geometry.location;
        console.log("Postion: ", position);
        if (typeof position.lat != 'undefined' && typeof position.lng != 'undefined') {
          this.setState({ latLng: position.lat + "," + position.lng });
        }
      }
      this.checkPincodeService(data, "");
    }).catch((error) => {
      console.log("Error Pincode Check: ", error);
      ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
      this.checkPincodeService(data, "");
    });
  }

  checkPincodeService = (localityName, localityPincode) => {
    console.log("LocationSearchScreen checkPincodeService() Pin: ", localityPincode, localityName);
    let formValue = { 'pincode': localityPincode, 'locality': localityName };
    console.log("formValue: ", formValue);
    fetch(BASE_PATH + Global.CHECK_SERVICE_URL, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formValue)
    }).then((response) => response.json()).then((responseJson) => {
      console.log("pincode Response: ", responseJson);
      let address = {
        houseNo: "", streetName: "", landmark: "", locCode: responseJson.LocCode, locName: responseJson.LocName, cityCode: responseJson.CityCode, cityName: responseJson.CityName,
        pincode: responseJson.Pincode, type: "OTHERS", latLng: "" + this.state.latLng,
        fAvail: responseJson.fAvail, bAvail: responseJson.bAvail
      };
      if (responseJson.Success == 'Y') {
        address = {
          houseNo: "", streetName: "", landmark: "", locCode: responseJson.LocCode, locName: responseJson.LocName, cityCode: responseJson.CityCode, cityName: responseJson.CityName,
          pincode: responseJson.Pincode, type: "OTHERS", latLng: "" + this.state.latLng,
          fAvail: responseJson.fAvail, bAvail: responseJson.bAvail
        };
      }
      else {
        ToastAndroid.show(responseJson.Message, ToastAndroid.SHORT);
        address = {
          houseNo: "", streetName: "", landmark: "", locCode: "", locName: responseJson.Locality, cityCode: "", cityName: "",
          pincode: responseJson.Pincode, type: "OTHERS", latLng: "" + this.state.latLng,
          fAvail: false, bAvail: false
        };
      }
      this.storeItem("AddressType", "MANUAL");
      this.storeItem("Address", address);
      this.props.navigation.navigate("Tabs");
    }).catch((error) => {
      console.log("Error Pincode Check: ", error);
      ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
    });

  }

  checkServicesAvailabilityByLocality = (data) => {
    console.log("LocationSearchScreen checkServicesAvailabilityByLocality() locCode: ", data);
    fetch(BASE_PATH + Global.CHECK_SERVICES_BY_LOCALITY_URL, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ locCode: data.locCode })
    }).then((response) => response.json()).then((responseData) => {
      console.log("response locality services: ", responseData);
      data.fAvail = false;
      data.bAvail = false;
      if (responseData.Success == "Y") {
        data.fAvail = responseData.fAvail;
        data.bAvail = responseData.bAvail;
      }
      else {
        ToastAndroid.show(responseData.Message, ToastAndroid.SHORT);
      }
      this.storeItem("AddressType", "MANUAL");
      this.storeItem("Address", data);
      this.props.navigation.navigate('Tabs');
    }).catch((error) => {
      console.log("Error Services Availability: ", error);
      ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
    });
  }

  componentWillMount() {
    console.log("LoactionSearchScreen componentWillMount()");
    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid));
  }

  componentDidMount() {
    console.log("LoactionSearchScreen componentDidMount()");
    this.getUserData();
    this.fetchRecentLocations();
  }

  render() {

    return (
      <View style={styles.mainContainer}>
        <View style={{ marginTop: 0 }}>
          <TextField
            label="Type a locality..."
            editable={true}
            placeholderTextColor="#fff"
            underlineColorAndroid='transparent'
            returnKeyType="next"
            keyboardType="default"
            autoCorrect={false}
            autoCapitalize='none'
            onChangeText={(locationSearch) => this.getLocations({ locationSearch })}
            ref={component => this._phoneInput = component}
          />
        </View>
        <Text style={{ marginTop: -4, color: '#777a82', fontSize: 11 }}> E.G. Railway Station,Bhubaneshwar</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
          <Display enable={this.state.searchresults}>
            <View>
              <Text style={{ fontSize: 15, color: '#000', fontWeight: '500' }}>Showing Search Results</Text>
              <ListView
                enableEmptySections={true}
                dataSource={this.state.dataSource2}
                renderRow={(data) =>
                  <TouchableOpacity onPress={this.checkPlaces.bind(this, data.description)}>
                    <View style={[styles.greentext, { borderTopWidth: 0 }]}>
                      <View><Text style={{ color: '#000', fontSize: 14 }}>{data.description}</Text></View>
                    </View>
                  </TouchableOpacity>
                } />
              <View style={{ padding: 3 }}>
                <Image source={require('../assets/app-images/pwdbygoogle.png')} />
              </View>
            </View>
          </Display>
          <View style={{ flexDirection: 'column', justifyContent: 'center', marginTop: 15 }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('Location', { navigatedFrom: 'LocationSearchScreen' })}>
              <View style={styles.greentext}>
                <View><Icon name="crosshairs" color="#079613" size={15} /></View>
                <View style={{ marginLeft: 6 }}><Text style={{ color: '#079613', fontSize: 14 }}>Use Current Location</Text></View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('AddAddress')}>
              <View style={[styles.greentext, { borderTopWidth: 0 }]}>
                <View><Icon name="plus" color="#079613" size={15} /></View>
                <View style={{ marginLeft: 6 }}><Text style={{ color: '#079613', fontSize: 14 }}>Add Address</Text></View>
              </View>
            </TouchableOpacity>
          </View>
          {/* <View style={{ marginTop: 15 }}>
              <Text style={{ fontSize: 15, color: '#000',fontWeight:'500' }}>Popular Locations In Bhubaneshwar</Text>
              <ListView
                    enableEmptySections={true}
                    dataSource={this.state.dataSource1}
                    renderRow={(data) =>
                      <TouchableOpacity>
                           <View style={[styles.greentext,{borderTopWidth:0}]}>
                        <View><Text style={{color:'#000',fontSize:14}}>data</Text></View>
                        </View>
                      </TouchableOpacity>
             } />
        </View> */}
          <Display enable={this.state.recentLocations.length > 0}>
            <View style={{ marginTop: 15 }}>
              <Text style={{ fontSize: 15, color: '#000', fontWeight: '500' }}>Recent Locations</Text>
              {
                this.state.recentLocations.map((data, index) => (
                  <TouchableOpacity onPress={this.checkRecentLocation.bind(this, data)} key={index}>
                    <View style={[styles.greentext, { borderTopWidth: 0 }]}>
                      <View><Text style={{ color: '#000', fontSize: 14 }}>{data}</Text></View>
                    </View>
                  </TouchableOpacity>
                ))
              }
            </View>
          </Display>
          <Display enable={this.state.savedAddresses.length > 0}>
            <View style={{ marginTop: 15 }}>
              <Text style={{ fontSize: 15, color: '#000', fontWeight: '500' }}>Saved Addresses</Text>
              {
                this.state.savedAddresses.map((data, index) => (
                  <TouchableOpacity onPress={this.checkSavedAddress.bind(this, data)} key={index}>
                    <View style={[styles.greentext, { borderTopWidth: 0 }]}>
                      <View><Text style={{ color: '#000', fontSize: 14 }}>{data.FormattedAddress}</Text></View>
                    </View>
                  </TouchableOpacity>
                ))
              }
            </View>
          </Display>
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
    paddingHorizontal: 10
  },
  greentext:
  {
    flexDirection: 'row',
    paddingVertical: 10,
    //   borderTopWidth:1,
    borderBottomWidth: 1,
    borderColor: '#dbdbdb'
  }
});