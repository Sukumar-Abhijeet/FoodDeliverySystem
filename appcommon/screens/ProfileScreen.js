import React from 'react';
import {
  StyleSheet, Text, View, Share, Image, Dimensions, TouchableOpacity, AsyncStorage,
} from 'react-native';
import Display from 'react-native-display';
import Icon from 'react-native-vector-icons/FontAwesome';
export default class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      customerName: "",
      referralCode: "",
      gender: "",
      showProfile: false,
      Sending: true
    }

  }

  async retrieveItem(key) {
    console.log("ProfileScreen retrieveItem() key: ", key);
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
    console.log("ProfileScreen storeItem() key: ", key);
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
    console.log("ProfileScreen removeItem() key: ", key);
    try {
      await AsyncStorage.removeItem(key);
      return true;
    }
    catch (exception) {
      return false;
    }
  }

  orderHistory = () => {
    this.props.navigation.navigate("OrderHistory");
  }
  walletBalance = () => {
    this.props.navigation.navigate("Wallet");
  }

  editProfile = () => {
    this.props.navigation.navigate("EditProfile");
  }

  getUserData() {
    this.retrieveItem('UserData').then((user) => {
      if (user == null) {
        this.setState({ showProfile: false });
      }
      else {
        this.setState({ showProfile: true, customerName: user.CustomerName, referralCode: user.CustomerReferralCode.toUpperCase(), gender: user.CustomerGender });
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  logout = () => {
    this.removeItem("UserData");
    this.removeItem("fcmToken");
    this.props.navigation.navigate("Login");
  }

  login = () => {
    this.props.navigation.navigate("Login");
  }

  componentWillMount() {
    console.log("Fetching Profile Screen Data");
    this.props.navigation.addListener('didFocus', () => { this.getUserData(); })
  }
  shareCode = () => {
    this.setState({ Sending: true })
    Share.share(
      {
        title: "Free Meal Invite",
        message: "Hey! I'm inviting you to download BringMyFood, the best food ordering & delivery app. Here's my code " + this.state.referralCode + " - just enter it while signup and get ₹250 in your wallet. Once you've placed your first order I get ₹250!. Download here http://onelink.to/bmfapp"
        , url: 'http://onelink.to/bmfapp'
      }).then(result => console.log(result)).catch(errorMsg => console.log(errorMsg));
  }

  render() {

    return (
      <View style={styles.mainContainer}>
        <Display enable={this.state.showProfile}>
          <View style={styles.upperContainer}>
            <View style={{ justifyContent: "center", alignItems: 'center' }}>
              <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center' }}>
                <Display enable={this.state.gender == "M"}>
                  <Image source={require('../assets/app-images/boy.png')} style={{ width: 80, height: 80 }} />
                </Display>
                <Display enable={this.state.gender == "F"}>
                  <Image source={require('../assets/app-images/girl.png')} style={{ width: 80, height: 80 }} />
                </Display>
              </View>
              <Text style={{ fontSize: 20, color: '#5f4c48', fontWeight: 'bold' }}>{this.state.customerName}</Text>
              {/* <Text style={{ marginTop: 0, fontSize: 10, color: '#292525' }}>Current Location - Chandrasekharpur </Text> */}
              <View style={{ marginTop: 6, width: 200, height: 40, borderRadius: 6, backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, color: '#292525', color: '#fff' }}>{this.state.referralCode}</Text>
              </View>
              <TouchableOpacity onPress={this.shareCode}>
                <View style={{ marginTop: 6, width: Dimensions.get('window').width, height: 50, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, color: '#292525', color: '#fff' }}>INVITE & EARN</Text>
                  <Text style={{ marginTop: 0, fontSize: 10, color: '#fff' }}>Your friend gets ₹ 250 & you get ₹ 250 on his first order</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.middleContainer}>
            <View style={styles.itemContainer}>
              <TouchableOpacity onPress={this.orderHistory}>
                <View style={styles.viewEdit}>
                  <Icon name='history' color='#a09d9d' size={18} />
                  <Text style={styles.textEdit}>Order History</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.editProfile}>
                <View style={styles.viewEdit}>
                  <Icon name='user' color='#a09d9d' size={18} />
                  <Text style={styles.textEdit}>Edit Profile</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("HelpAndSupport")}>
                <View style={styles.viewEdit}>
                  <Icon name='comments' color='#a09d9d' size={18} />
                  <Text style={styles.textEdit}>Help & Support</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.props.navigation.navigate('SavedAddress')}>
                <View style={styles.viewEdit}>
                  <Icon name='map-signs' color='#a09d9d' size={18} />
                  <Text style={styles.textEdit}>Saved Address</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.walletBalance}>
                <View style={styles.viewEdit}>
                  <Icon name='suitcase' color='#a09d9d' size={18} />
                  <Text style={styles.textEdit}>Wallet</Text>
                </View>
              </TouchableOpacity>

            </View>
          </View>
          <View style={styles.lowerContainer}>
            <View style={{ justifyContent: "center", alignItems: 'center' }}>
              <Text style={[styles.textEdit, { fontSize: 8, marginTop: 5 }]}>Version 5.0</Text>
              <TouchableOpacity onPress={this.logout}><Text style={{ fontSize: 24, color: '#cd2121', fontWeight: 'bold' }}>LOGOUT</Text></TouchableOpacity>
            </View>
          </View>
        </Display>
        <Display enable={!this.state.showProfile}>
          <View style={styles.lowerContainer}>
            <View>
              <Image source={require('../assets/toplogin.jpg')} style={{ width: Dimensions.get('window').width, height: 300 }} />
            </View>
            <View style={{ marginBottom: 15, justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 15 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>ACCOUNT</Text>
              <Text style={{ fontSize: 12, color: '#b5b1b1' }}>Login / Create Account quickly to manage orders</Text>
            </View>
            <TouchableOpacity onPress={this.login} style={{ width: Dimensions.get('window').width, padding: 10, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, color: '#cd2121', fontWeight: 'bold' }}>LOGIN</Text>
            </TouchableOpacity>
            <Text style={[styles.textEdit, { fontSize: 10, marginTop: 8 }]}>Version 6.0.0</Text>

          </View>
        </Display>
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
    //marginTop: Expo.Constants.statusBarHeight,
  },
  upperContainer:
  {
    padding: 10
  },
  middleContainer:
  {
    marginTop: 5,
    paddingHorizontal: 10
  },
  itemContainer: {
    flexDirection: 'column',
    borderRadius: 5,
    backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
    shadowRadius: 2, elevation: 2,
  },
  viewEdit:
  {
    padding: 10,
    borderBottomColor: '#ebebeb',
    borderBottomWidth: 1,
    flexDirection: 'row'
  },
  textEdit:
  {
    fontSize: 15, color: '#757575', marginLeft: 5
  },
  lowerContainer:
  {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'flex-start', alignItems: 'center',

  },
});