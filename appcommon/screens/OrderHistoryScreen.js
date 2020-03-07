import React from 'react';
import {
  StyleSheet, Text, View, BackHandler, ToastAndroid, Image, ListView, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity, AsyncStorage,
} from 'react-native';
import Display from 'react-native-display';
import Modal from 'react-native-modal';
import Global from '../Urls/Global';
import { Icon } from 'native-base';
import ContentLoader from 'react-native-content-loader';
import { Rect } from 'react-native-svg';
import firebase from 'react-native-firebase';

const BASE_PATH = Global.BASE_PATH;

const OrderHistoryList = () => <ContentLoader height={200}
  primaryColor='#eeeeee'
  secondaryColor='#fff'
  speed={100}
>
  <Rect x="23.5" y="24.27" rx="0" ry="0" width="148" height="18" />
  <Rect x="272.5" y="25.27" rx="0" ry="0" width="50" height="21" />
  <Rect x="26.5" y="67.27" rx="0" ry="0" width="176" height="36" />
  <Rect x="29.5" y="122.27" rx="0" ry="0" width="115.61999999999999" height="24" />
  <Rect x="210.5" y="126.27" rx="0" ry="0" width="115" height="23.20000000" />
  {/* <Rect x="12.5" y="12.27" rx="0" ry="0" width="320" height="150" /> */}
</ContentLoader>
export default class OrderHistoryScreen extends React.Component {
  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      dataSource1: [],
      customerId: "",
      walletMoney: 0.0,
      navigatedFrom: this.props.navigation.getParam("navigatedFrom"),
      loader: false,
      orderHistoryList: true,
      visibleModal: null,
      isReady: false,
      orderCount: 0,
      orderDetails: {
        Items: []
      },
      showLoadMoreBtn: true,
      trackOrder: {},
      viewOrder: {},
      loadMoreLoader: false,
      cityCode: "",
      locCode: ""
    }

  }
  // onBackButtonPressAndroid = () => {
  //   console.log(this.state.navigatedFrom)

  //   if (this.state.navigatedFrom == "OrderPlaced") {
  //     console.log("Navigate To Profile");
  //     this.props.navigation.navigate('Profile', { navigatedFrom: "OrderHistory" })
  //   }

  //   // if (this.state.navigatedFrom == "undefined") {
  //   //   console.log("Navigate To BackStack");
  //   //   this.props.navigation.navigate('Profile');
  //   // }

  // };



  async retrieveItem(key) {
    console.log("OrderHistoryScreen retrieveItem() key: ", key);
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
    console.log("OrderHistoryScreen storeItem() key: ", key);
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
    console.log("OrderHistoryScreen removeItem() key: ", key);
    try {
      await AsyncStorage.removeItem(key);
      return true;
    }
    catch (exception) {
      return false;
    }
  }

  __renderOrderDetails = () => (
    <View style={styles.detailModalContainer}>
      <View style={[styles.mainHeaderContainer, styles.header]}>
        <TouchableOpacity onPress={() => { this.setState({ visibleModal: null }) }} style={{ paddingLeft: 5 }}>
          <Icon style={{ color: '#4286f4', fontSize: 20 }} name='arrow-back' />
        </TouchableOpacity>
        <Text style={[styles.textBig]}>Order Details #{this.state.orderDetails.OrderId}</Text>
        <View style={{ alignSelf: 'flex-end', padding: 5, backgroundColor: '#2dbe60', borderRadius: 4 }}>
          <Text style={{ fontSize: (this.state.orderDetails.OTP == "N/A" ? 14 : 18), fontWeight: (this.state.orderDetails.OTP == "N/A" ? '100' : '500'), color: '#fff' }}> {this.state.orderDetails.OTP == "N/A" ? "Otp Not Available" : this.state.orderDetails.OTP} </Text>
        </View>
      </View>
      <ScrollView >
        <View style={styles.modalBody}>
          <View style={[styles.itemList]}>
            {
              this.state.orderDetails.Items.map((item, index) => (
                <View style={styles.itemItem} key={index}>
                  {/* Veg and Non veg Here */}
                  <Display enable={item.VeganType == "VEG"} style={{ padding: 12, paddingRight: 0, justifyContent: 'center' }}>
                    <View style={{ borderColor: '#008000', width: 16, height: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ backgroundColor: '#008000', borderRadius: 10, width: 8, height: 8 }} ></View>
                    </View>
                  </Display>
                  <Display enable={item.VeganType == "NON-VEG"} style={{ padding: 12, paddingRight: 0, justifyContent: 'center' }}>
                    <View style={{ borderColor: '#cd2121', width: 10, height: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ backgroundColor: '#cd2121', borderRadius: 10, width: 6, height: 6 }} ></View>
                    </View>
                  </Display>
                  <View style={{ flexDirection: 'column', padding: 10, opacity: (!true ? .3 : 1), flex: 2 }}>
                    <Text style={{ fontSize: 16, color: '#262626' }}>{item.Name}</Text>
                    <Display enable={false} style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: '#a4a4a4' }}>{item.Variant}</Text></Display>
                  </View>
                  <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <View style={{ borderWidth: 1, borderColor: "transparent", backgroundColor: "transparent", justifyContent: 'center', alignItems: 'center', width: 100, height: 40, borderRadius: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '500' }}>{item.Qty} X ₹{item.Price}</Text>
                    </View>
                  </View>
                </View>
              ))
            }
          </View>
          <View style={{ flexDirection: 'row', paddingHorizontal: 0, flex: 2 }}>
            <View style={{ flex: 1, }}>
              <View style={styles.box}>
                <Text style={{ color: '#cd2121', fontSize: 14 }}>Delivery Charge</Text>
                <Text>₹{this.state.orderDetails.OrderDeliveryCharge}</Text>
              </View>
            </View>
            <View style={{ flex: 1, }}>
              <View style={styles.box}>
                <Text style={{ color: '#cd2121', fontSize: 14 }}>Packaging Charge</Text>
                <Text>₹{this.state.orderDetails.OrderPackingCharge}</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', paddingHorizontal: 0, flex: 2 }}>
            <View style={{ flex: 1, }}>
              <View style={styles.box}>
                <Text style={{ color: '#cd2121', fontSize: 14 }}>Tax</Text>
                <Text>₹{this.state.orderDetails.TaxCharge}</Text>
              </View>
            </View>
            <View style={{ flex: 1, }}>
              <View style={styles.box}>
                <Text style={{ color: '#cd2121', fontSize: 14 }}>Coupon Discount</Text>
                <Text>₹{this.state.orderDetails.CouponSave}</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', paddingHorizontal: 0, flex: 2 }}>
            <View style={{ flex: 1, }}>
              <View style={styles.box}>
                <Text style={{ color: '#cd2121', fontSize: 14 }}>Wallet Deduction</Text>
                <Text>₹{this.state.orderDetails.WalletDeduction}</Text>
              </View>
            </View>
            <Display style={{ flex: 1, padding: 5 }} enable={eval(this.state.orderDetails.SurplusCharge) > 0}>
              <View style={{ flex: 1, }}>
                <View style={styles.box}>
                  <Text style={{ color: '#cd2121', fontSize: 14 }}>Surplus Charge</Text>
                  <Text>₹{this.state.orderDetails.SurplusCharge}</Text>
                </View>
              </View>
            </Display>
          </View>
          <View style={{ flexDirection: 'row', paddingHorizontal: 0, flex: 2 }}>
            <View style={{ flex: 1, }}>
              <View style={styles.box}>
                <Text style={{ color: '#cd2121', fontSize: 14 }}>Net Payble</Text>
                <Text style={{ fontSize: 20, fontWeight: '400' }}>₹{this.state.orderDetails.NetPayable}</Text>
              </View>
            </View>
          </View>
        </View>
        {/* <View style={[styles.modalFooter]}>
          <Button full style={{ backgroundColor: '#cd2121', height: 50, justifyContent: 'center', alignItems: 'center' }} >
            <Display enable={!false}>
              <Text style={[styles.textBig, styles.textWhite]}>Submit Feedback</Text>
            </Display>
            <Display enable={false}>
              <ActivityIndicator color="white" />
            </Display>
          </Button>
        </View> */}
      </ScrollView>
    </View>
  )

  __renderTrackOrder = () => (
    <View style={styles.detailModalContainer}>
      <View style={[styles.mainHeaderContainer, styles.header]}>
        <Text style={[styles.textBig]}>Track Details #{this.state.trackOrder.OrderId}</Text>
        <Text>{this.state.trackOrder.OTP}</Text>
      </View>
      <ScrollView >
        <View style={styles.modalBody}>
          <View style={{ flexDirection: 'row', paddingHorizontal: 0, flex: 2 }}>
            <View style={{ flex: 1, }}>
              <View style={styles.box}>
                <Text style={{ color: '#cd2121', fontSize: 14 }}>Order Placed</Text>
                <Text style={{ fontSize: 20, fontWeight: '400' }}>@{this.state.trackOrder.PlacedTime}</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', paddingHorizontal: 0, flex: 2 }}>
            <View style={{ flex: 1, }}>
              <View style={styles.box}>
                <Text style={{ color: '#cd2121', fontSize: 14 }}>Order Confirmed</Text>
                <Text style={{ fontSize: 20, fontWeight: '400' }}>@{this.state.trackOrder.ConfirmedTime}</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', paddingHorizontal: 0, flex: 2 }}>
            <View style={{ flex: 1, }}>
              <View style={styles.box}>
                <Text style={{ color: '#cd2121', fontSize: 14 }}>Cooking Started</Text>
                <Text style={{ fontSize: 20, fontWeight: '400' }}>@{this.state.trackOrder.CookingTime}</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', paddingHorizontal: 0, flex: 2 }}>
            <View style={{ flex: 1, }}>
              <View style={styles.box}>
                <Text style={{ color: '#cd2121', fontSize: 14 }}>Out for Delivery</Text>
                <Text style={{ fontSize: 20, fontWeight: '400' }}>@{this.state.trackOrder.OutTime}</Text>
              </View>
            </View>
          </View>
          <Display enable={this.state.trackOrder.CancelledTime == ""}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 0, flex: 2 }}>
              <View style={{ flex: 1, }}>
                <View style={styles.box}>
                  <Text style={{ color: '#cd2121', fontSize: 14 }}>Order Delivered</Text>
                  <Text style={{ fontSize: 20, fontWeight: '400' }}>@{this.state.trackOrder.DeliveredTime}</Text>
                </View>
              </View>
            </View>
          </Display>
          <Display enable={this.state.trackOrder.CancelledTime != ""}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 0, flex: 2 }}>
              <View style={{ flex: 1, }}>
                <View style={styles.box}>
                  <Text style={{ color: '#cd2121', fontSize: 14 }}>Order Cancelled</Text>
                  <Text style={{ fontSize: 20, fontWeight: '400' }}>@{this.state.trackOrder.CancelledTime}</Text>
                </View>
              </View>
            </View>
          </Display>
        </View>
      </ScrollView>
    </View>
  )

  getUserData = () => {
    console.log("OrderHistoryScreen getUserData()");
    this.retrieveItem('UserData').then((user) => {
      this.setState({ walletMoney: user.WalletMoney, customerId: user.uuid });
      this.getAddress();
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  getAddress = () => {
    console.log("OrderHistoryScreen getAddress()");
    this.retrieveItem('Address').then((data) => {
      this.setState({ cityCode: data.cityCode, locCode: data.locCode });
      this.fetchOrders();
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  fetchOrders() {
    console.log("OrderHistoryScreen fetchOrders()");
    this.setState({ loadMoreLoader: true });
    let formValue = { "uuid": this.state.customerId, count: this.state.orderCount };
    console.log("URL and Data: ", (BASE_PATH + Global.FETCH_ORDERS_URL), formValue);
    fetch(BASE_PATH + Global.FETCH_ORDERS_URL, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formValue)
    }).then((response) => response.json()).then((responseJson) => {
      if (responseJson.Success == 'Y') {
        let ds1 = this.state.dataSource1;
        ds1 = ds1.concat(responseJson.Data);
        this.setState({ dataSource1: ds1, orderHistoryList: false, isReady: true, loadMoreLoader: false });
        if (responseJson.Data.length % 6 == 0) {
          this.setState({ orderCount: this.state.orderCount + 6, showLoadMoreBtn: true });
        }
        else {
          this.setState({ showLoadMoreBtn: false, loadMoreLoader: false, isReady: true });
        }
      }
      else {
        this.setState({ showLoadMoreBtn: false, loadMoreLoader: false, isReady: true });
        if (this.state.orderCount < 1) {
          ToastAndroid.show("No order placed yet.", ToastAndroid.SHORT);
        }
        else {
          ToastAndroid.show("No more orders.", ToastAndroid.SHORT);
        }
      }
    }).catch((error) => {
      console.log("Error Orders: ", error);
      ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
    });
  }

  isEmptyObject(obj) {
    return (Object.keys(obj).length === 0 && obj.constructor == Object);
  }

  orderSummary = (order) => {
    console.log("OrderHistoryScreen orderSummary() order: ", order);
    this.setState({ visibleModal: 8, orderDetails: order });
  }

  // _handleNotification = (notification) => {
  //   console.log("OrderHistoryScreen _handleNotification() notifictaion: ", notification);
  //   if (!this.isEmptyObject(trackOrder)) {
  //     this.trackOrders(this.state.viewOrder);
  //   }
  //   else {
  //     this.fetchOrders();
  //   }
  // };

  trackOrders = (order) => {
    console.log("OrderHistoryScreen trackOrders() orderId: ", order.OrderId);
    this.setState({ viewOrder: order });
    let formValue = JSON.stringify({
      "uuid": this.state.customerId,
      "orderId": order.OrderId
    });
    console.log("formValue: ", formValue);
    fetch(BASE_PATH + Global.TRACK_ORDER_URL, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: formValue
    }).then((response) => response.json()).then((responseJson) => {
      console.log("Response Track:  ", responseJson);
      if (responseJson.Success == 'Y') {
        this.setState({ trackOrder: responseJson.TrackOrder, visibleModal: 7 });
      }
      else {
        this.setState({ trackOrder: {} });
        ToastAndroid.show("Something went wrong. Try again.", ToastAndroid.SHORT);
      }
    }).catch((error) => {
      console.log("Error Track Order: ", error);
      ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
    });
  }

  repeatOrder = (order) => {
    this.setState({ loader: true });
    console.log("OrderHistoryScreen repeatOrder() orderId: ", order.OrderId);
    let formValue = JSON.stringify({
      "uuid": this.state.customerId,
      "orderId": order.OrderId,
      "cityCode": this.state.cityCode,
      "locCode": this.state.locCode
    });
    console.log("formValue: ", formValue);
    fetch(BASE_PATH + Global.REPEAT_ORDER_URL, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: formValue
    }).then((response) => response.json()).then((responseJson) => {
      console.log("repeatOrder() response: ", responseJson);
      this.setState({ loader: false });
      if (responseJson.Success == 'Y') {
        this.storeItem("CartItems", responseJson.Data);
        setTimeout(() => {
          this.props.navigation.push("Cart");
        });
      }
      else {
        ToastAndroid.show("Some problem occurred. Try again.", ToastAndroid.SHORT);
      }
    }).catch((error) => {
      console.log("Error Repeat Order: ", error);
      ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
    });

  }

  componentWillMount() {
    console.log("OrderHistoryScreen componentWillMount");
    // await Expo.Font.loadAsync({
    //   'Roboto': require('native-base/Fonts/Roboto.ttf'),
    //   'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
    //   'MyriadPro': require('../assets/fonts/MyriadPro-Regular.otf'),
    // });
  }
  handleNotification() {
    firebase.notifications().onNotification(receivedNotification => {
      // receivedNotification.android.setChannelId('BMF-Channel-Info');
      console.log("OrderHistoryScreen handleNotification()", receivedNotification);
      if (receivedNotification.data.targetScreen == 'OrderHistory') {
        console.log("Before : ", this.state.orderCount)
        this.setState({ orderCount: 0 }, () => { this.fetchOrders(), console.log(this.state.orderCount) })
      }
      //firebase.notifications().displayNotification(receivedNotification);
    })
  }

  componentDidMount() {
    console.log("OrderHistoryScreen componentDidMount()");
    this.getUserData();
    this.handleNotification();
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      //this.goBack(); // works best when the goBack is async
      console.log(this.state.navigatedFrom)

      if (this.state.navigatedFrom == "OrderPlaced") {
        console.log("Navigate To Profile");
        this.props.navigation.navigate('Profile', { navigatedFrom: "OrderHistory" })
      }
      else {
        console.log("Navigate To BackStack");
        this.props.navigation.navigate('Profile');
      }
      return true;
    });
    // this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  render() {
    if (!this.state.isReady) {
      return (
        <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
          {/* <BodyIndicator /> */}
          <Image source={require('../assets/mascot.jpg')} />
        </View>

      )
    }

    return (
      <View style={styles.mainContainer}>
        <View style={{ backgroundColor: '#ebebeb', width: Dimensions.get('window').width }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {
              this.state.dataSource1.map((data, index) => (
                <View style={styles.historyContainer} key={index}>
                  <Display enable={this.state.orderHistoryList}>
                    <OrderHistoryList />
                  </Display>
                  <Display enable={!this.state.orderHistoryList}>
                    <View style={styles.idContainer}>
                      <View style={{ flex: 7 }}>
                        <Text style={{ color: '#777777', fontWeight: 'bold', fontSize: 16 }}>Order ID :{data.OrderId}</Text>
                      </View>
                      <View style={{ flex: 3, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold' }}>₹ {data.NetPayable}</Text>
                      </View>
                    </View>
                    <View style={styles.detailContainer}>
                      <View>
                        <Text style={{ color: '#c2c2c2', fontWeight: '400', fontSize: 14 }}>{data.OrderPlacedDate}</Text>
                        <Text style={{ color: (data.OrderStatus !== "ORDER PLACED") ? '#cd2121' : "#2dbe60", fontWeight: '400', fontSize: 14 }}>{data.OrderStatus}</Text>
                      </View>
                    </View>
                    <View style={styles.buttonContainer}>
                      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                        <TouchableOpacity onPress={this.orderSummary.bind(this, data)}>
                          <View style={{ backgroundColor: "#ebebeb", justifyContent: 'center', alignItems: 'center', height: 40, padding: 10, borderRadius: 4 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#8c8c8c' }}>View Details</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                      <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                        <Display enable={data.OrderStatus != "ORDER DELIVERED" && data.OrderStatus != "ORDER CANCELLED" && data.OrderStatus != "ORDER REJECTED"}>
                          <TouchableOpacity onPress={this.trackOrders.bind(this, data)}>
                            <View style={{ borderColor: '#cd2121', borderWidth: 1, justifyContent: 'center', alignItems: 'center', height: 40, padding: 10, borderRadius: 4 }}>
                              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, color: '#cd2121' }}>Track Order</Text>
                            </View>
                          </TouchableOpacity>
                        </Display>
                        <Display enable={data.OrderStatus == "ORDER DELIVERED"}>
                          <TouchableOpacity onPress={this.repeatOrder.bind(this, data)}>
                            <View style={{ borderColor: '#cd2121', borderWidth: 1, justifyContent: 'center', alignItems: 'center', height: 40, padding: 10, borderRadius: 4 }}>
                              <Display enable={this.state.loader} style={{ justifyContent: 'center' }}>
                                <ActivityIndicator size="small" color="#cd2121" />
                              </Display>
                              <Display enable={!this.state.loader} style={{ justifyContent: 'center' }}>
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, color: '#cd2121' }}>Repeat Order</Text>
                              </Display>
                            </View>
                          </TouchableOpacity>
                        </Display>
                      </View>
                    </View>
                  </Display>
                </View>
              ))
            }
            <Display enable={this.state.showLoadMoreBtn}>
              <TouchableOpacity onPress={this.fetchOrders.bind(this)}>
                <View style={{ justifyContent: 'center', alignItems: 'center', height: 40, padding: 10, borderRadius: 4 }}>
                  <Display enable={this.state.loadMoreLoader} style={{ justifyContent: 'center' }}>
                    <ActivityIndicator size="small" color="#cd2121" />
                  </Display>
                  <Display enable={!this.state.loadMoreLoader} style={{ justifyContent: 'center' }}>
                    <Text style={{ fontWeight: '300', fontSize: 16, color: '#cd2121' }}>Load More</Text>
                  </Display>
                </View>
              </TouchableOpacity>
            </Display>
          </ScrollView>
          {/* Order Details Modal; */}
          <Modal isVisible={this.state.visibleModal === 8} style={styles.bottomModal} onBackButtonPress={() => this.setState({ visibleModal: null })} animationType="slide">
            {this.__renderOrderDetails()}
          </Modal>

          {/* Track Order Modal; */}
          <Modal isVisible={this.state.visibleModal === 7} style={styles.bottomModal} onBackButtonPress={() => this.setState({ visibleModal: null })} animationType="slide">
            {this.__renderTrackOrder()}
          </Modal>
        </View>
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
    padding: 0,
  },
  innerContainer:
  {
    padding: 15,
  },
  historyContainer:
  {
    flexDirection: 'column',
    padding: 10,
    margin: 10,
    marginBottom: 5,
    backgroundColor: '#fff', shadowColor: '#000',
    shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
    shadowRadius: 2, elevation: 2,
  },
  idContainer:
  {
    borderBottomColor: '#f3f3f3', borderBottomWidth: 1, flexDirection: 'row', paddingVertical: 6
  },
  detailContainer:
  {
    borderBottomColor: '#f3f3f3', borderBottomWidth: 1, flexDirection: 'column', paddingVertical: 6
  },
  buttonContainer:
  {
    flexDirection: 'row', paddingTop: 10
  },
  //Order Detail Modal
  detailModalContainer:
  {
    width: null,
    backgroundColor: '#fff',
    flexDirection: 'column',
    padding: 0
  },
  mainHeaderContainer:
  {
    // marginTop: Expo.Constants.statusBarHeight,
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
    //marginTop: Expo.Constants.statusBarHeight,
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
  ratingArea: {
    borderTopColor: '#dddddd',
    borderTopWidth: 1,
    borderRadius: 4,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.3,
    shadowRadius: 2, elevation: 1,
    marginBottom: 5
  },
  textArea: {
    borderTopColor: '#dddddd',
    borderTopWidth: 1,
    borderRadius: 4,
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.3,
    shadowRadius: 2, elevation: 1,
    marginBottom: 5,
    padding: 10,
  },
  modalFooter: {
    backgroundColor: '#cd2121',
  },
  box: {
    backgroundColor: '#ebebeb', justifyContent: 'center', alignItems: 'center', borderRadius: 4, padding: 10, margin: 5
  },
});