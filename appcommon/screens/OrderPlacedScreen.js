import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
    StyleSheet, Text, View, BackHandler, TouchableOpacity, ToastAndroid, Image, ListView, ScrollView, ActivityIndicator, AsyncStorage, Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Header, Left, Body, Right, Button, Title } from 'native-base';
import Display from 'react-native-display';
import Global from '../Urls/Global';
import ContentLoader from 'react-native-content-loader';
import { Rect } from 'react-native-svg';
import * as OpenAnything from 'react-native-openanything';

const BASE_PATH = Global.BASE_PATH;
const BillContainer = () => <ContentLoader height={300}
    primaryColor='#eeeeee'
    secondaryColor='#fff'
    speed={100}
>
    <Rect x="19.5" y="31.27" rx="0" ry="0" width="112" height="26" />
    <Rect x="27.5" y="70.27" rx="0" ry="0" width="74" height="10" />
    <Rect x="28.5" y="91.27" rx="0" ry="0" width="70" height="8" />
    <Rect x="29.5" y="109.27" rx="0" ry="0" width="19" height="7" />
    <Rect x="261.5" y="74.27" rx="0" ry="0" width="42" height="8" />
    <Rect x="260.5" y="93.27" rx="0" ry="0" width="40" height="8" />
    <Rect x="262.5" y="112.27" rx="0" ry="0" width="38" height="7" />
</ContentLoader>
export default class OrderPlacedScreen extends React.Component {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource1: ds.cloneWithRows(['r1', 'r2']),
            switch1Value: true,
            switch2Value: true,
            loggedIn: false,
            customerId: "",
            loader: true,
            cancelLoader: false,
            orderSummary: {},
            payId: this.props.navigation.getParam("payId"),
            orderDetails: {
                EstdDeliveryTime: "--",
                OrderCustomerName: "--",
                OrderPlacedDate: "--",
                OrderDeliveryAddress: "--",
                OrderDetails: [],
                OrderNetPayable: "--"
            },
            isReady: false,
            suggestionBox: true
        }

    }

    async retrieveItem(key) {
        console.log("OrderPlacedScreen retrieveItem() key: ", key);
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
        console.log("OrderPlacedScreen storeItem() key: ", key);
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
        console.log("OrderPlacedScreen removeItem() key: ", key);
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    getUserData = () => {
        console.log("OrderPlacedScreen getUserData()");
        this.retrieveItem('UserData').then((user) => {
            if (user != null) {
                this.setState({ loggedIn: true, customerId: user.uuid });
            }
            this.fetchOrderPlacedData();
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    fetchOrderPlacedData = () => {
        this.setState({ loader: true });
        console.log("OrderPlacedScreen fetchOrderPlacedData() customerId: ", this.state.customerId, " && payId: ", this.state.payId);
        let formValue = { "uuid": this.state.customerId, "payId": this.state.payId };
        console.log("formValue: ", formValue);
        fetch(BASE_PATH + Global.FETCH_ORDER_SUMMARY_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formValue)
        }).then((response) => response.json()).then((responseJson) => {
            console.log("response order summary: ", responseJson);
            if (responseJson.Success == 'Y') {
                this.setState({ orderSummary: responseJson.Summary, isReady: true, loader: false });
            }
        }).catch((error) => {
            console.log("Error Order Summary: ", error);
            ToastAndroid.show("There was some problem while fetching order summary.", ToastAndroid.SHORT);
        });
    }

    trackOrder = () => {
        console.log("OrderPlacedScreen trackOrder() payId: ", this.state.orderId);
        this.props.navigation.navigate("TrackOrder", { orderId: this.state.orderId, navigatedFrom: 'OrderPlaced' });
    }

    cancelOrder = () => {
        console.log("OrderPlacedScreen cancelOrder() customerId: ", this.state.customerId, " && payId: ", this.state.payId);
        Alert.alert("Cancel Order", "Do you want to cancel this order?", [
            {
                text: 'OK', onPress: () => {
                    this.setState({ cancelLoader: true })
                    let formValue = { "uuid": this.state.customerId, "payId": this.state.payId };
                    console.log("formValue: ", formValue);
                    fetch(BASE_PATH + Global.CANCEL_ORDER_URL, {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formValue)
                    }).then((response) => response.json()).then((responseJson) => {
                        if (responseJson.Success == 'Y') {
                            this.setState({ cancelLoader: false })
                            ToastAndroid.show('Order Cancelled Successfully ', ToastAndroid.LONG);
                            this.props.navigation.push('OrderHistory');
                        }
                        else {
                            this.setState({ cancelLoader: false })
                            ToastAndroid.show(responseJson.Message, ToastAndroid.LONG);
                        }
                    });
                }
            },
            {
                text: 'Cancel', onPress: () => { }
            }
        ]);
    }

    getOrderTotalPrice(arr) {
        let total = 0;
        for (let i = 0; i < arr.length; i++) {
            total += ((eval(arr[i].UnitPrice) * eval(arr[i].Qty)));
        }
        return total.toFixed(2);
    }

    componentWillMount() {
        console.log("OrderPlacedScreen componentWillMount");
        // await Expo.Font.loadAsync({
        //     'Roboto': require('native-base/Fonts/Roboto.ttf'),
        //     'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
        //     'MyriadPro': require('../assets/fonts/MyriadPro-Regular.otf'),
        // });
    }

    componentDidMount() {
        console.log("OrderPlacedScreen componentDidMount()");
        this.getUserData();
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.navigate('OrderHistory', { navigatedFrom: "OrderPlaced" }); // works best when the goBack is async
            return true;
        });
    }

    componentWillUnmount() {
        this.backHandler.remove();
    }
    render() {
        {
            if (!this.state.isReady) {
                return (
                    <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                        {/* <BodyIndicator /> */}
                        <Image source={require('../assets/mascot.jpg')} />
                    </View>

                )
            }
        }
        return (
            <View style={styles.mainContainer}>
                <Header style={styles.mainHeaderContainer}>
                    <Left>
                        <Button transparent onPress={() => this.props.navigation.navigate('OrderHistory', { navigatedFrom: "OrderPlaced" })}>
                            <Icon name='arrow-left' color='#666' size={20} />
                        </Button>
                    </Left>
                    <Body>
                        <Title style={{ color: '#666', marginLeft: 0 }}>Order Summary</Title>
                    </Body>
                    <Right>
                        <Display enable={true}>
                            <Button transparent onPress={() => this.props.navigation.navigate('HelpAndSupport')}>
                                <Icon name='user-md' color='#cd2121' size={25} />
                            </Button>
                        </Display>
                    </Right>
                </Header>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <LinearGradient colors={['#cb2d3e', '#ef473a']}
                        style={[styles.mainContainer, styles.padding10]}>

                        <View style={styles.upperContainer}>
                            <View style={{ justifyContent: "center", alignItems: 'center' }}>
                                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#026d1b', justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name='check' color='#fff' size={25} />
                                </View>
                                <Text style={{ fontSize: 16, color: '#fff', marginTop: 15 }}>Success! Your order is placed</Text>
                                <Text style={{ fontSize: 14, color: '#999999', fontWeight: '200', marginTop: 5 }}>Pay ID : #{this.state.payId} </Text>
                            </View>
                        </View>
                        <Display style={[styles.middleContainer, { height: 300, justifyContent: 'center', alignItems: 'center' }]} enable={this.state.loader}>
                            {/* <BillContainer /> */}
                            <ActivityIndicator size="large" color="#fff" />
                        </Display>
                        <Display style={styles.middleContainer} enable={!this.state.loader}>
                            {/* <Display enable={this.state.orderSummary.OrderOf == "BMFFOOD"} style={{ flex: 1, borderRadius: 4, padding: 6, backgroundColor: '#fff', flexDirection: 'row' }}>
                                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 4 }}>
                                </View>
                                <View style={{ justifyContent: 'center', alignItems: 'flex-end', flex: 2 }}>
                                    <TouchableOpacity onPress={this.trackOrder.bind(this)}>
                                        <View style={{ backgroundColor: '#cd2121', padding: 10, borderRadius: 4 }}>
                                            <Text style={{ color: '#fff', fontWeight: '600' }}>TRACK NOW</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </Display> */}
                            {
                                this.state.orderSummary.OrderDetails.map((item, index) => (
                                    <View style={{ flex: 8, marginTop: 5, backgroundColor: '#fff', borderRadius: 4 }} key={index}>
                                        {/* Order Iterator View */}
                                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#ebebeb', padding: 10 }}>
                                            <Text style={{ color: '#000', fontSize: 16 }}>Order ID # {item.OrderId}</Text>
                                            <Display enable={item.OrderSchedulable == "YES"}>
                                                <Text style={{ color: '#000', color: '#8c8a8a' }}>Estd. Delivery Time : {item.ScheduleDate}</Text>
                                            </Display>
                                        </View>
                                        <View style={{ flex: 8 }}>
                                            <View style={{ flex: 5, borderBottomWidth: 1, borderBottomColor: '#ebebeb' }}>
                                                <View style={{ flexDirection: 'column', padding: 10, flex: 3 }}>
                                                    {
                                                        item.OrderItemDetails.map((itm, idx) => (
                                                            <View style={{ flex: 1, flexDirection: 'row', padding: 5 }} key={idx}>
                                                                <View style={{ flex: 4, justifyContent: 'center', alignItems: "flex-start", }}>
                                                                    <Text>{itm.ProductName}</Text>
                                                                    <Text style={{ fontSize: 10 }}>{itm.Variant}</Text>
                                                                </View>
                                                                <View style={{ flex: 3, justifyContent: 'center', alignItems: "flex-start", flexDirection: 'row' }}>
                                                                    <View style={{ flex: 1 }}><Text>₹{itm.UnitPrice} X {itm.Qty}</Text></View>
                                                                </View>

                                                                <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'center', flexDirection: 'row', }}>
                                                                    <View style={{ flex: 1, }}><Text>₹</Text></View>
                                                                    <View style={{ flex: 2 }}><Text>{eval(itm.UnitPrice) * eval(itm.Qty)}</Text></View>
                                                                </View>
                                                            </View>
                                                        ))
                                                    }
                                                </View>

                                                <View style={{ flexDirection: 'row', paddingHorizontal: 5, flex: 2 }}>
                                                    <View style={{ flex: 1, padding: 5 }}>
                                                        <View style={styles.box}>
                                                            <Text style={{ color: '#cd2121', fontSize: 14 }}>PRICE</Text>
                                                            <Text>₹{this.getOrderTotalPrice(item.OrderItemDetails)}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={{ flex: 1, padding: 5 }}>
                                                        <View style={styles.box}>
                                                            <Text style={{ color: '#cd2121', fontSize: 14 }}>TOTAL ITEMS</Text>
                                                            <Text>{item.OrderItemDetails.length}</Text>
                                                        </View>
                                                    </View>
                                                </View>

                                            </View>

                                        </View>
                                    </View>
                                ))
                            }

                            <View style={{ flex: 3, padding: 10, backgroundColor: '#fff', marginTop: 5, borderRadius: 4 }}>
                                <View style={{ flexDirection: 'row', paddingHorizontal: 5, flex: 2 }}>
                                    <View style={{ flex: 1, padding: 5 }}>
                                        <View style={styles.box}>
                                            <Text style={{ color: '#cd2121', fontSize: 14 }}>Delivery Charge</Text>
                                            <Text>₹{this.state.orderSummary.DeliveryCharge}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flex: 1, padding: 5 }}>
                                        <View style={styles.box}>
                                            <Text style={{ color: '#cd2121', fontSize: 14 }}>Packaging Charge</Text>
                                            <Text>₹{this.state.orderSummary.PackingCharge}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', paddingHorizontal: 5, flex: 2 }}>
                                    <View style={{ flex: 1, padding: 5 }}>
                                        <View style={styles.box}>
                                            <Text style={{ color: '#cd2121', fontSize: 14 }}>Tax</Text>
                                            <Text>₹{this.state.orderSummary.TaxCharge}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flex: 1, padding: 5 }}>
                                        <View style={styles.box}>
                                            <Text style={{ color: '#cd2121', fontSize: 14 }}>Coupon Discount</Text>
                                            <Text>₹{this.state.orderSummary.CouponSave}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', paddingHorizontal: 5, flex: 2 }}>
                                    <View style={{ flex: 1, padding: 5 }}>
                                        <View style={styles.box}>
                                            <Text style={{ color: '#cd2121', fontSize: 14 }}>Wallet Deduction</Text>
                                            <Text>₹{this.state.orderSummary.WalletDeduction}</Text>
                                        </View>
                                    </View>
                                    <Display style={{ flex: 1, padding: 5 }} enable={eval(this.state.orderSummary.SurCharge) > 0}>
                                        <View style={styles.box}>
                                            <Text style={{ color: '#cd2121', fontSize: 14 }}>Surplus Charge</Text>
                                            <Text>₹{this.state.orderSummary.SurCharge}</Text>
                                        </View>
                                    </Display>
                                </View>
                            </View>

                            <View style={{ flex: 3, padding: 10, backgroundColor: '#fff', marginTop: 5, borderRadius: 4 }}>
                                <View style={{ flex: 3, flexDirection: 'row', paddingLeft: 20, paddingRight: 20 }}>
                                    <Icon name='map-marker' size={30} color='#cd2121' />
                                    <Text style={{ fontSize: 14, color: '#8e8b8b', marginLeft: 5, justifyContent: 'center', textAlign: 'center' }}>{this.state.orderSummary.DeliveryAddress}</Text>
                                </View>

                                <View style={{ flex: 1, flexDirection: 'row', marginTop: 5 }}>
                                    <TouchableOpacity style={[styles.buttons, { marginRight: 3 }]} onPress={this.cancelOrder.bind(this)}>
                                        <Display enable={this.state.cancelLoader} style={{ justifyContent: 'center' }}>
                                            <ActivityIndicator size="small" color="#cd2121" />
                                        </Display>
                                        <Display enable={!this.state.cancelLoader} style={{ justifyContent: 'center', flexDirection: 'row' }}>
                                            <Icon name='times' color='#cd2121' size={20} />
                                            <Text style={styles.buttonText}>Cancel</Text>
                                        </Display>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.buttons, { marginLeft: 3 }]} onPress={() => OpenAnything.Call('8339000801')}>
                                        <Icon name='phone' color='#000' size={20} />
                                        <Text style={styles.buttonText}>Call Us</Text>
                                    </TouchableOpacity>

                                </View>
                            </View>

                        </Display>

                        {/* <View style={styles.lowerContainer}>
                    <Text style={styles.lasttext}>Made In </Text>
                    <Icon name='heart' color='#fff' size={12} />
                    <Text style={styles.lasttext}> With Food</Text>
                </View> */}
                    </LinearGradient>
                    <View style={{ width: '100%', backgroundColor: '#fff', padding: 10, marginTop: 10 }}>
                        {/* Suggestion Box*/}
                        <Display enable={this.state.suggestionBox} >

                            <LinearGradient colors={['#005C97', '#363795']} style={[styles.timelyOffersContainer, { height: 240, borderRadius: 6, flexDirection: 'column', padding: 0 }]}>
                                <View style={{ flex: 4 }}>
                                    <TouchableOpacity onPress={() => { this.setState({ suggestionBox: false }) }} style={{ justifyContent: 'center', alignItems: 'flex-end', padding: 5, marginRight: 3 }}><Icon name={'times'} size={20} color={'#f9f9f9'} /></TouchableOpacity>
                                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                        <Image source={require('../assets/fireworks.png')} style={{ width: 100, height: 100 }} />
                                        <Text style={{ color: '#fff' }}>How was your ordering experience?</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', flex: 1, marginTop: 15, borderTopColor: '#f9f9f9', borderTopWidth: 1 }}>
                                    <TouchableOpacity style={{ backgroundColor: 'transparent', flex: 1, justifyContent: 'center', alignItems: 'center', marginRight: .5, borderBottomLeftRadius: 6, borderRightColor: '#fefefe', borderRightWidth: 1 }}>
                                        <Text style={{ color: "#fff", fontSize: 16 }}>Bad</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { this.setState({ suggestionBox: false }) }} style={{ backgroundColor: 'transparent', flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: .5, borderBottomRightRadius: 6 }}>
                                        <Text style={{ color: "#fff", fontSize: 16 }}>Great</Text>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </Display>
                    </View>
                </ScrollView>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    mainContainer:
    {
        flex: 1,
        backgroundColor: '#fff',
        padding: 0,
        // paddingTop: Platform.OS === 'ios' ? 5 : StatusBar.currentHeight
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
    padding10: {
        padding: 10,
    },
    upperContainer:
    {
        paddingTop: 30,
        flex: 2
    },
    middleContainer:
    {
        marginTop: 8,
        flex: 8
    },

    lowerContainer:
    {
        flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', bottom: 0, backgroundColor: 'cyan'
    },
    box:
    {
        backgroundColor: '#ebebeb', justifyContent: 'center', alignItems: 'center', borderRadius: 4, padding: 15
    },
    lasttext:
    {
        fontSize: 10, color: '#fff'
    },
    buttons:
    {
        flex: 1, borderWidth: 1, borderRadius: 15,
        borderColor: '#ebebeb', padding: 10, paddingHorizontal: 30,
        justifyContent: 'center', alignItems: 'center', flexDirection: 'row'
    },
    buttonText:
    {
        color: '#000', fontSize: 15, fontWeight: '300', marginLeft: 5
    }
});