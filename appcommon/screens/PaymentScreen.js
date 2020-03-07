import React from 'react';
import {
  StyleSheet, Text, View, ToastAndroid, Image, ListView, ScrollView, WebView, ActivityIndicator, Dimensions, TouchableOpacity, AsyncStorage
} from 'react-native';
import { Button, Icon as BaseIcon } from 'native-base'
import Icon from 'react-native-vector-icons/FontAwesome';
import Display from 'react-native-display';
import Modal from 'react-native-modal';
import Global from '../Urls/Global';
import RazorpayCheckout from 'react-native-razorpay';
const BASE_PATH = Global.BASE_PATH;
const IS_PRODUCTION = Global.PROD_VAR;

var cashOptions = [
  {
    "title": "Cash on Delivery",
    "value": "CASH",
    "icon": "https://files.slack.com/files-pri/T54BPBE57-FGK2ML9DM/cash.png",
    "subText": ""
  },
  {
    "title": "UPI on Delivery",
    "value": "UPI",
    "icon": "upiIcon.png",
    "subText": ""
  },
  {
    "title": "Paytm on Delivery",
    "value": "PAYTM",
    "icon": "paytmIcon.png",
    "subText": ""
  },
  {
    "title": "Pay Online",
    "value": "ONLINE",
    "icon": "onlinePay.png",
    "subText": "Debit/Credit Card, NetBanking, UPI, Wallets"
  }
];
export default class PaymentScreen extends React.Component {
  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      dataSource1: ds.cloneWithRows(cashOptions),
      checkoutObj: this.props.navigation.getParam("checkoutObj"),
      paymentMethod: { "title": "Cash on Delivery", "value": "CASH" },
      payableAmount: this.props.navigation.getParam("payableAmount").toFixed(2),
      calPayableAmt: this.props.navigation.getParam("payableAmount").toFixed(2),
      userData: {},
      loader: false,
      placeOrderText: "PLACE ORDER",
      visibleModal: null,
    }

  }

  async retrieveItem(key) {
    console.log("PaymentScreen retrieveItem() key: ", key);
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
    console.log("PaymentScreen storeItem() key: ", key);
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
    console.log("PaymentScreen removeItem() key: ", key);
    try {
      await AsyncStorage.removeItem(key);
      return true;
    }
    catch (exception) {
      return false;
    }
  }

  isEmptyObject(obj) {
    return (Object.keys(obj).length === 0 && obj.constructor == Object);
  }

  getUserData = () => {
    console.log("PaymentScreen getUserData()");
    this.retrieveItem('UserData').then((user) => {
      if (user != null) {
        this.setState({ userData: user });
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  showpopup = (paymentMethod) => {
    console.log("PaymentScreen showpopup() paymentMethod: ", paymentMethod);
    this.setState({ calPayableAmt: (paymentMethod.value == "CASH" ? Math.ceil(this.state.payableAmount) : this.state.payableAmount) })
    let btnText = "PLACE ORDER";
    if (paymentMethod.value == "ONLINE") {
      btnText = "PAY NOW";
    }
    if (this.state.checkoutObj.cartType == "R") {
      let cktObj = this.state.checkoutObj;
      cktObj.paymentMethod = paymentMethod.value;
      this.setState({ visibleModal: 7, paymentMethod: paymentMethod, checkoutObj: cktObj, placeOrderText: btnText });
    }
    else {
      if (paymentMethod.value == "ONLINE") {

        let cktObj = this.state.checkoutObj;
        cktObj.paymentMethod = paymentMethod.value;
        this.setState({ visibleModal: 7, paymentMethod: paymentMethod, checkoutObj: cktObj, placeOrderText: btnText, });
      }
      else {
        ToastAndroid.show("Only online payment is acceptable for bawarchi food.", ToastAndroid.show);
      }
    }
  }

  placeOrder() {
    console.log('Placing Order Loader ', this.state.loader)
    if (this.state.checkoutObj != null && JSON.stringify(this.state.checkoutObj) != JSON.stringify({})) {
      let type = "";
      let products = [];
      for (let i = 0; i < this.state.checkoutObj.items.length; i++) {
        if (this.state.checkoutObj.items[i].ProdType == "R") {
          let obj = { pid: this.state.checkoutObj.items[i].ProductId, vid: this.state.checkoutObj.items[i].VId, pt: "R", qty: this.state.checkoutObj.items[i].Qty, vs: this.state.checkoutObj.items[i].Variant, as: this.state.checkoutObj.items[i].Addons };
          products.push(obj);
          type = "R";
        }
        else if (this.state.checkoutObj.items[i].ProdType == "B") {
          for (let j = 0; j < this.state.checkoutObj.items[i].OrderedProducts.length; j++) {
            let obj = { pid: this.state.checkoutObj.items[i].OrderedProducts[j].ProductId, vid: this.state.checkoutObj.items[i].VId, qty: this.state.checkoutObj.items[i].OrderedProducts[j].Qty, ds: { Date: this.state.checkoutObj.items[i].OrderedProducts[j].SelectedDay }, ts: this.state.checkoutObj.items[i].OrderedProducts[j].SelectedTimeSlot, pt: "B" };
            products.push(obj);
          }
          type = "B";
        }
      }
      if (products.length > 0) {
        this.setState({ loader: true });
        let formValue = {
          cartType: type,
          products: JSON.stringify(products),
          locCode: this.state.checkoutObj.locCode,
          cityCode: this.state.checkoutObj.cityCode,
          uuid: this.state.checkoutObj.uuid,
          appliedCoupon: this.state.checkoutObj.appliedCoupon,
          useWallet: this.state.checkoutObj.useWallet,
          reqFrom: "APP"
        };
        console.log("calc amount formValue: ", JSON.stringify(formValue));
        fetch(BASE_PATH + Global.CALC_PAY_AMOUNT_URL, {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formValue)
        }).then((response) => response.json()).then((responseJson) => {
          console.log("response payable amount: ", responseJson);
          if (responseJson.Success == "Y") {
            let cartNetPayable = this.state.checkoutObj.paymentMethod == "CASH" ? Math.ceil(this.state.checkoutObj.netPayable.toFixed(2)) : this.state.checkoutObj.netPayable.toFixed(2);
            let respNetPayable = this.state.checkoutObj.paymentMethod == "CASH" ? Math.ceil(responseJson.NetPayable) : responseJson.NetPayable;
            console.log("NetPayableAmount : ", respNetPayable, cartNetPayable);
            if (cartNetPayable == respNetPayable) {
              let cktObj = this.state.checkoutObj;
              cktObj.reqFrom = "APP";
              cktObj.payId = responseJson.PayId;
              cktObj.cartType = type;
              for (let i = 0; i < cktObj.items.length; i++) {
                if (cktObj.items[i].ProdType == "B") {
                  for (let j = 0; j < cktObj.items[i].OrderedProducts.length; j++) {
                    cktObj.items[i].OrderedProducts[j].SelectedDay = { "Date": cktObj.items[i].OrderedProducts[j].SelectedDay };
                  }
                }
              }
              this.setState({ checkoutObj: cktObj }, () => {
                console.log("Payable Amount verified, PayId: ", this.state.checkoutObj.payId);
                if (this.state.checkoutObj.payId != "") {
                  if (this.state.checkoutObj.paymentMethod == "ONLINE") {
                    console.log("pay Online Now");
                    let razOpt = {
                      key: "rzp_live_LLz6cV8ORlX1wL",
                      amount: IS_PRODUCTION ? (this.state.checkoutObj.netPayable * 100) : 100, // 200 paise = INR 20
                      name: "Bringmyfood",
                      currency: "INR",
                      description: "For Order " + this.state.checkoutObj.payId,
                      prefill: {
                        contact: this.state.userData.CustomerPhone,
                        email: this.state.userData.CustomerEmail
                      }
                    };
                    RazorpayCheckout.open(razOpt).then((data) => {
                      console.log("payment response: ", data, typeof data);
                      // handle success
                      console.log(data.razorpay_payment_id);
                      if (data.razorpay_payment_id != "" && typeof data.razorpay_payment_id != 'undefined') {
                        let cktObj = this.state.checkoutObj;
                        cktObj.rzpPayId = data.razorpay_payment_id;
                        this.setState({ checkoutObj: cktObj }, () => {
                          if (this.state.checkoutObj.deliveryAddressId != "" && this.state.checkoutObj.paymentMethod != "" && this.state.checkoutObj.locCode != "" && typeof this.state.checkoutObj.locCode != 'undefined' && this.state.checkoutObj.cityCode != "" && typeof this.state.checkoutObj.cityCode != 'undefined') {
                            this.placeLoader = true;
                            this.state.checkoutObj.cartType = type;
                            let pofv = JSON.stringify({ checkoutObj: this.state.checkoutObj });
                            console.log("pofv: ", pofv);
                            fetch(BASE_PATH + Global.CREATE_ORDER_URL, {
                              method: "POST",
                              headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                              },
                              body: pofv
                            }).then((response) => response.json()).then((responseJson) => {
                              console.log("response: ", responseJson);
                              if (responseJson.Success == "Y") {
                                this.removeItem("CartItems");
                                // this.setState({ loader: false });
                                ToastAndroid.show("Order placed successfully", ToastAndroid.SHORT);
                                this.props.navigation.navigate('OrderPlaced', { payId: this.state.checkoutObj.payId });
                              }
                              else {
                                // this.setState({ loader: false });
                                ToastAndroid.show(responseJson.Message, ToastAndroid.LONG);
                              }
                            });
                          }
                          else {
                            ToastAndroid.show("Please select Payment Method", ToastAndroid.SHORT);
                          }
                        });

                      }
                      else {
                        ToastAndroid.show("There was some problem in processing payment. Please try again.", ToastAndroid.SHORT);
                      }
                    }).catch((error) => {
                      console.log("Payment Error: ", error);
                      this.setState({ loader: false });
                      if (error.code == 0) {
                        ToastAndroid.show("You cancelled the payment", ToastAndroid.SHORT);
                      } else {
                        ToastAndroid.show("Some problme occurred in payment processing.", ToastAndroid.SHORT);
                      }
                    });
                  }
                  else {
                    if (this.state.checkoutObj.deliveryAddressId != "" && this.state.checkoutObj.paymentMethod != "" && this.state.checkoutObj.locCode != "" && typeof this.state.checkoutObj.locCode != 'undefined' && this.state.checkoutObj.cityCode != "" && typeof this.state.checkoutObj.cityCode != 'undefined') {
                      let pofv = JSON.stringify({ checkoutObj: this.state.checkoutObj });
                      console.log("pofv: ", pofv);

                      fetch(BASE_PATH + Global.CREATE_ORDER_URL, {
                        method: "POST",
                        headers: {
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                        },
                        body: pofv
                      }).then((response) => response.json()).then((responseJson) => {
                        console.log("response create order: ", responseJson);
                        if (responseJson.Success == "Y") {
                          this.removeItem("CartItems");
                          this.setState({ loader: false });
                          ToastAndroid.show("Order placed successfully", ToastAndroid.SHORT);
                          this.props.navigation.navigate('OrderPlaced', { payId: this.state.checkoutObj.payId });
                        }
                        else {
                          this.setState({ loader: false });
                          ToastAndroid.show(responseJson.Message, ToastAndroid.LONG);
                        }
                      });
                    }
                    else {
                      this.setState({ loader: false });
                      ToastAndroid.show("Please select Payment Method", ToastAndroid.SHORT);
                    }
                  }
                }
                else {
                  this.setState({ loader: false });
                  ToastAndroid.show("There is some error in payment. Please refresh once.", ToastAndroid.SHORT);
                }
              });
            }
            else {
              ToastAndroid.show("The payable amount has been changed. Please refresh the page.", ToastAndroid.SHORT);
              this.setState({ loader: false });
            }
          }
          else {
            ToastAndroid.show(responseJson.Message, ToastAndroid.SHORT);
            this.setState({ loader: false });
          }
        }).catch((error) => {
          console.log("Error Calculate Amount: ", error);
          this.setState({ loader: false });
          ToastAndroid.show("There was some problem while calculating the payable amount.", ToastAndroid.SHORT);
        });
      }
      else {
        ToastAndroid.show("Please put some food in the plate.", ToastAndroid.SHORT);
      }
    }

  }

  timeOutFun() {
    console.log("PaymentScreen timeOutFun() loader : ", this.state.loader);
    setTimeout(() => {
      this.placeOrder();
    }, 3000);
  }
  componentWillMount() {
    console.log("PaymentScreen componentWillMount()");
    console.log("PayTotal ", this.state.calPayableAmt)
    // await Expo.Font.loadAsync({
    //   'Roboto': require('native-base/Fonts/Roboto.ttf'),
    //   'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
    //   'MyriadPro': require('../assets/fonts/MyriadPro-Regular.otf'),
    // });
  }

  componentDidMount() {
    console.log("PaymentScreen componentDidMount()");
    this.getUserData();
    console.log("checkoutObj in paymentScreen: ", this.state.checkoutObj);
  }

  render() {

    return (
      <View style={styles.mainContainer}>


        <View style={{ marginTop: 5, }}>
          <Text style={{ fontSize: 30, color: '#000', fontWeight: '500', marginTop: 4 }}> Pay ₹ {this.state.calPayableAmt} </Text>
          <Text style={{ fontSize: 15, marginLeft: 5 }}>You saved <Text style={{ color: 'green', fontSize: 25 }}>₹{eval(this.state.checkoutObj.offersDiscount) + eval(this.state.checkoutObj.couponDiscount) + eval(this.state.checkoutObj.walletDeduction)}</Text> on this order.</Text>
        </View>

        <View style={{ paddingHorizontal: 5, }}>
          <Text style={{ fontSize: 18, color: '#000', fontWeight: '500' }}>Saved Payment Methods</Text>
          <ListView
            enableEmptySections={true}
            dataSource={this.state.dataSource1}
            renderRow={(data) =>
              <TouchableOpacity onPress={this.showpopup.bind(this, data)} disabled={this.state.checkoutObj.cartType == "B" && data.value !== "ONLINE"}  >
                <View style={[styles.greentext, { borderTopWidth: 0 }]} opacity={(this.state.checkoutObj.cartType == "B" && data.value !== "ONLINE") ? .5 : 1}>
                  <View style={{ marginTop: 3, flex: 4, marginLeft: 3 }}>
                    <Text style={{ color: '#000', fontSize: 14 }}>{data.title}</Text>
                    <Display enable={data.subText != ""}>
                      <Text>{data.subText}</Text>
                    </Display>
                  </View>
                  <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end', flex: 1 }}>
                    <Icon name="angle-right" size={20} color="#cd2121" style={{ width: 20 }} />
                  </View>

                </View>
              </TouchableOpacity>
            } />
          <Display enable={this.state.checkoutObj.cartType == "B"} style={{ padding: 3, marginTop: 10, height: 60 }}
            enterDuration={50}
            exitDuration={150}
            exit="fadeOutRight"
            enter="fadeInLeft"
          >
            <View style={{ borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }}>
              <View style={{ height: 10, backgroundColor: '#f4dd0c', width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
              </View>
              <View style={{ flexDirection: 'row', height: 50, }}>
                <View style={{ flex: 2, backgroundColor: '#1929d6', justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: 4, }}>
                  <View>
                    <BaseIcon name={'ios-information-circle'} style={{ color: '#f4dd0c', fontSize: 30 }} />
                  </View>
                </View>
                <View style={{ flex: 8, backgroundColor: '#70abef', padding: 5, borderBottomRightRadius: 4 }}>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>PREPAID ORDER</Text>
                  <Text>Only online payment is applicable on bawarchi orders</Text>
                </View>
              </View>
            </View>
          </Display>
        </View>

        {/* <View style={{flexDirection:'column',justifyContent:'center',marginTop:15}}>
         <TouchableOpacity>
            <View style={[styles.greentext,{borderTopWidth:0}]}>
            <View><Icon name="plus" color="#cd2121" size={15}  /></View>
                 <View style={{marginLeft:6}}><Text style={{color:'#cd2121',fontSize:14}}>Add Payment Method</Text></View>
            </View>
        </TouchableOpacity>
        </View> */}

        <Display enable={this.state.visibleModal == 7}
          enterDuration={100}
          exitDuration={250}
          exit="fadeOutUp"
          enter="fadeInUp"
          style={{ flex: 1, position: 'absolute', bottom: 0, alignItems: 'flex-end' }}
        >
          <View style={styles.bottomFloat}>
            <View style={{ flexDirection: 'row', height: 50 }}>
              <View style={{ backgroundColor: "#ebebeb", justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                <Text style={{ fontSize: 10 }}>Payment Mode</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{this.state.paymentMethod.title}</Text>
              </View>
              <TouchableOpacity onPress={() => { this.placeOrder() }} disabled={this.state.loader}>
                <View style={{ backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                  <Display enable={this.state.loader} style={{ justifyContent: 'center' }}>
                    <ActivityIndicator size="small" color="#fff" />
                  </Display>
                  <Display enable={!this.state.loader} style={{ justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{this.state.placeOrderText}</Text>
                  </Display>
                </View>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#fff',
    flexDirection: 'column',
    //marginTop: Expo.Constants.statusBarHeight,
  },
  greentext:
  {
    flexDirection: 'row',
    paddingVertical: 15,
    //   borderTopWidth:1,
    borderBottomWidth: 1,
    borderColor: '#dbdbdb'
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  bottomFloat:
  {
    shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
    shadowRadius: 2, elevation: 2,
    backgroundColor: '#ebebeb', flexDirection: 'row',
    width: Dimensions.get('window').width, justifyContent: 'center', alignItems: 'center'
  },
  // online Payment Modal
  //Feedback Modal
  feedbackModalContainer:
  {
    width: null,
    backgroundColor: '#fff',
    flexDirection: 'column',
    padding: 0
  },
  mainHeaderContainer:
  {
    // marginTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomColor: '#d8d8d8',
    borderBottomWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.2,
    shadowRadius: 1, elevation: 1,

  },
  header: {
    padding: 10,
    height: 50,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalBody: {
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  textBig: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  textWhite: {
    color: '#fff'
  },
  itemItem: {
    flexDirection: 'row',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.3,
    shadowRadius: 2, elevation: 1,
    marginBottom: 5
  },
  modalFooter: {
    backgroundColor: '#cd2121',
  },
});