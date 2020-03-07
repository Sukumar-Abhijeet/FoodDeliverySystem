import React from 'react';
import {
  StyleSheet, Text, Alert, View,
  ListView, Dimensions, TouchableOpacity, AsyncStorage
} from 'react-native';
import Timeline from 'react-native-timeline-listview'
import { TextField } from 'react-native-material-textfield';



const aspectRatio = Dimensions.get('window').height / Dimensions.get('window').width;
export default class AddAddressScreen extends React.Component {

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      dataSource1: ds.cloneWithRows(['Home', 'Work', 'Others']),
      completeaddress: '',
      deliveryinstruction: '',
      houseno: '',
      landmark: '',
      address: "",
      pincode: "",
      navigatedFrom: ""
    }

  }

  async retrieveItem(key) {
    console.log("AddAddressScreen retrieveItem() key: ", key);
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
    console.log("AddAddressScreen storeItem() key: ", key);
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
    console.log("AddAddressScreen removeItem() key: ", key);
    try {
      await AsyncStorage.removeItem(key);
      return true;
    }
    catch (exception) {
      return false;
    }
  }

  fetchAddress = () => {
    console.log("AddAddressScreen fetchAddress()");
    this.retrieveItem('Address').then((address) => {
      if (address != null) {
        console.log("address: ", address);
        if (address.addrContent == "DETAILED") {
          this.setState({ address: { label: address.label.substr(address.label.split(", ", 2).join(", ").length + 2), value: address.value.substr(address.value.split(", ", 2).join(", ").length + 2), pincode: address.pincode, addrContent: address.addrContent } });
        }
        else {
          this.setState({ address: address });
        }
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
    this.retrieveItem('Pincode').then((data) => {
      if (data != null) {
        this.setState({ pincode: data });
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  saveAddress = () => {
    console.log("AddAddressScreen saveAddress() houseno: ", this.state.houseno, " && landmark: ", this.state.landmark);
    if (this.state.houseno.trim() != "" && this.state.landmark.trim() != "") {
      let addressLabel = this.state.houseno + ", " + this.state.landmark + ", " + this.state.address.label;
      let addressValue = this.state.houseno + "^" + this.state.landmark + "^" + this.state.address.value;
      this.setState({ address: { label: addressLabel, value: addressValue, pincode: this.state.address.pincode, type: this.state.address.type, addrContent: "DETAILED" } });
      console.log("Address: ", this.state.address);
      this.retrieveItem('SavedAddress').then((data) => {
        if (data != null) {
          data.push(this.state.address);
          this.storeItem("SavedAddress", data);
        }
        else {
          let addr = [];
          addr.push(this.state.address);
          this.storeItem("SavedAddress", addr);
        }
      }).catch((error) => {
        console.log('Promise is rejected with error: ' + error);
      });
      this.storeItem("Address", this.state.address);
      this.storeItem("Pincode", this.state.pincode);
      if (this.state.navigatedFrom == "CART") {
        this.props.navigation.navigate("Cart");
      }
      else {
        this.props.navigation.navigate("SavedAddress");
      }
    }
    else {
      Alert.alert("Invalid Address", "Please fill both address fields");
    }
  }

  componentWillMount() {
    console.log("AddAddressScreen componentWillMount()");
  }

  componentDidMount() {
    console.log("AddAddressScreen componentDidMount()");
    let navigatedFrom = this.props.navigation.getParam("navigatedFrom");
    if (typeof navigatedFrom != 'undefined') {
      console.log("NavigatedFrom: ", navigatedFrom);
      this.setState({ navigatedFrom: navigatedFrom });
    }
    this.props.navigation.addListener('didFocus', () => {
      this.fetchAddress();
    });

  }

  render() {

    return (
      <View style={styles.mainContainer}>

        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Add Address</Text>

        <Text style={{ fontSize: 12, fontWeight: '300', color: '#7a7a7a', marginTop: 5 }}>DELIVERING FOOD TO </Text>
        <View style={[styles.greentext, { borderTopWidth: 0, flexDirection: 'row' }]}>
          <View style={{ flex: 10 }}>
            <Text style={{ color: '#000', fontSize: 14 }}>{this.state.address.label}</Text>
          </View>
        </View>

        <TextField
          label="HOUSE/FLAT NO"
          editable={true}
          placeholderTextColor="#fff"
          underlineColorAndroid='transparent'
          returnKeyType="next"
          keyboardType="default"
          maxLength={20}
          autoCorrect={false}
          autoCapitalize='none'
          onChangeText={(houseno) => this.setState({ houseno })}
          ref={component => this._phoneInput = component}
        />
        <TextField
          label="LANDMARK"
          editable={true}
          placeholderTextColor="#fff"
          underlineColorAndroid='transparent'
          returnKeyType="next"
          keyboardType="default"
          maxLength={30}
          autoCorrect={false}
          autoCapitalize='none'
          onChangeText={(landmark) => this.setState({ landmark })}
          ref={component => this._phoneInput = component}
        />

        <TouchableOpacity onPress={this.saveAddress.bind(this)}>
          <View style={styles.call}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '200' }}>Save Changes</Text>
          </View>
        </TouchableOpacity>
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
    //marginTop: Expo.Constants.statusBarHeight,
    paddingHorizontal: 5
  },
  greentext:
  {
    flexDirection: 'row',
    paddingVertical: 6,
    //   borderTopWidth:1,
    borderBottomWidth: 1,
    borderColor: '#dbdbdb'
  },
  nickname:
  {
    padding: 6, marginTop: 10,
    borderColor: '#cd2121', borderRadius: 10, borderWidth: 1,
    marginRight: 10, justifyContent: 'center', alignItems: 'center'
  },
  call:
  {
    backgroundColor: '#cd2121', justifyContent: 'center'
    , alignItems: 'center', padding: 15, marginBottom: 5
  },

});