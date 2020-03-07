import React from 'react';
import {
    StyleSheet, Text, View, BackHandler, Platform, ToastAndroid, TouchableHighlight, Image, ImageBackground, ListView, ScrollView, RefreshControl, ActivityIndicator, Dimensions, TouchableOpacity, Animated, AsyncStorage
} from 'react-native';
import Display from 'react-native-display';
import GridView from 'react-native-super-grid';
import Icon from 'react-native-vector-icons/FontAwesome';
import ContentLoader from 'react-native-content-loader';
import { Rect } from 'react-native-svg';
import Global from '../Urls/Global';
const GLOBALURL = Global.BASE_PATH;
const Hunger = () => <ContentLoader height={300}
    primaryColor='#eeeeee'
    secondaryColor='#fff'
    speed={100}
>

    <Rect x="0" y="0" rx="0" ry="0" height="250" width='300' />
    <Rect x="5" y="255.27" rx="0" ry="0" width="100" height="9" />
    <Rect x="5" y="265.27" rx="0" ry="0" width="145" height="5" />
    <Rect x="5" y="278.27" rx="0" ry="0" width="45" height="15" />
    <Rect x="255" y="278.27" rx="0" ry="0" width="45" height="15" />

</ContentLoader>

export default class HungryScreen extends React.Component {
    constructor(props) {
        super(props);
        // this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
        //   BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
        // );

        this.state = {
            dim: 300,
            noMeals: false,
            hungerLoader: true,
            Items: [],
            pincode: "",
            minOrderChargeForDelivery: 0,
            deliveryCharge: 0,
            payableAmount: 0.0,
            avgCookingTime: 0,
            itemCount: 0,
            cartItems: [],
            kitchenClosed: false
        }

    }

    async retrieveItem(key) {
        console.log("HungryScreen retrieveItem() key: ", key);
        try {
            const retrievedItem = await AsyncStorage.getItem(key);
            const item = JSON.parse(retrievedItem);
            return item;
        } catch (error) {
            console.log(error.message);
        }
        return
    }

    async storeItem(key, item) {
        console.log("HungryScreen storeItem() key: ", key);
        try {
            var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
            return jsonOfItem;
        }
        catch (error) {
            console.log(error.message);
        }
    }

    getPincode = () => {
        console.log("HungryScreen getPincode()");
        this.retrieveItem('Address').then((data) => {
            this.setState({ pincode: data.pincode });
            this.fetchDeliveryCharge();
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    fetchDeliveryCharge = () => {
        console.log("HungryScreen fetchDeliveryCharge()");
        this.retrieveItem('DeliveryCharge').then((data) => {
            if (data == null) {
                fetch(GLOBALURL + Global.FETCH_DELIVERY_CHARGES_URL, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "pincode": this.state.pincode
                    })
                }).then((response) => response.json()).then((responseJson) => {
                    responseJson.Date = new Date().getDate();
                    this.storeItem("DeliveryCharge", responseJson);
                    this.setState({ minOrderChargeForDelivery: responseJson.MinOrderCharge, deliveryCharge: responseJson.DeliveryCharge });
                    this.initCartItems();
                });
            }
            else {
                if (data.Date == new Date().getDate()) {
                    this.setState({ minOrderChargeForDelivery: data.MinOrderCharge, deliveryCharge: data.DeliveryCharge });
                    this.initCartItems();
                }
                else {
                    fetch(GLOBALURL + Global.FETCH_DELIVERY_CHARGES_URL, {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "pincode": this.state.pincode
                        })
                    }).then((response) => response.json()).then((responseJson) => {
                        responseJson.Date = new Date().getDate();
                        this.storeItem("DeliveryCharge", responseJson);
                        this.setState({ minOrderChargeForDelivery: responseJson.MinOrderCharge, deliveryCharge: responseJson.DeliveryCharge });
                        this.initCartItems();
                    });
                }
            }
        });
    }

    initCartItems = () => {
        console.log("HungryScreen initCartItems()");
        this.retrieveItem('CartItems').then((dataArr) => {
            if (dataArr != null) {
                let itemTotal = 0;
                let packagingTotal = 0;
                let avgCookingTime = 0;
                let itemFlag = false;
                let deliveryTotal = 0;
                for (let i = 0; i < dataArr.length; i++) {
                    itemTotal += dataArr[i].Qty * (eval(dataArr[i].OfferPrice) + eval(dataArr[i].ProductDeliveryCharge));
                    packagingTotal += dataArr[i].Qty * eval(dataArr[i].ProductPackingCharge);
                    avgCookingTime = (avgCookingTime < eval(dataArr[i].ProductAvgCookingTime)) ? eval(dataArr[i].ProductAvgCookingTime) : avgCookingTime;
                    itemFlag = true;
                }
                if ((itemTotal + packagingTotal) < this.state.minOrderChargeForDelivery && itemFlag) {
                    deliveryTotal = this.state.deliveryCharge;
                    avgCookingTime += 19;
                }
                this.setState({
                    payableAmount: (eval(itemTotal) + eval(deliveryTotal) + eval(packagingTotal)).toFixed(2),
                    avgCookingTime: avgCookingTime,
                    itemCount: dataArr.length,
                    cartItems: dataArr
                });
                console.log("Items in cart = " + this.state.itemCount)
            }
            this.fetchCategoryProducts();
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    fetchCategoryProducts = () => {
        console.log("HungryScreen fetchCategoryProducts() ");
        this.retrieveItem('HungerScreenData').then((data) => {
            console.log("Pincode: ", this.state.pincode);
            if (data != null) {
                this.matchWithCart(data.Data);
            }
            fetch("https://www.bringmyfood.in/data/reactapp/userapp/fetch-products-for-hungry-screen.php", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "pincode": this.state.pincode
                })
            }).then((response) => response.json()).then((responseJson) => {
                responseJson.Date = new Date().getDate();
                if (responseJson.Success == 'Y') {
                    this.storeItem("HungerScreenData", responseJson);
                    this.matchWithCart(responseJson.Data);
                    this.setState({ noMeals: false });
                }
                else {
                    this.setState({ noMeals: true });
                }
            });
        });
    }

    matchWithCart = (dataArray) => {
        console.log("HungryScreen matchWithCart()");
        if (this.state.cartItems.length > 0) {
            let data = this.state.cartItems;
            for (let j = 0; j < dataArray.length; j++) {
                let qty = 0;
                for (let i = 0; i < data.length; i++) {
                    if (data[i].RestaurantId == dataArray[j].RestaurantId && data[i].ProductId == dataArray[j].ProductId) {
                        qty = data[i].Qty;
                    }
                }
                dataArray[j].Qty = eval(qty);
            }
        }
        else {
            for (let j = 0; j < dataArray.length; j++) {
                dataArray[j].Qty = 0;
            }
        }
        this.setState({ Items: dataArray, hungerLoader: false });
    }

    addProductToCart = (item) => {
        console.log("HungryScreen addProductToCart() item:", item);
        let products = this.state.Items;
        let idx = this.state.Items.indexOf(item);
        console.log("index found: ", idx);
        if (this.state.Items.indexOf(item) !== -1) {
            products[idx].Qty += 1;
        }
        this.retrieveItem('CartItems').then((dataArr) => {
            if (dataArr == null) {
                item.Qty = 1;
                let cartArray = [];
                cartArray.push(item);
                this.storeItem("CartItems", cartArray);
            }
            else {
                let flag = true;
                for (let i = 0; i < dataArr.length; i++) {
                    if (dataArr[i].ProductId == item.ProductId && dataArr[i].RestaurantId == item.RestaurantId) {
                        dataArr[i].Qty++;
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    dataArr.push(item);
                }
                this.storeItem("CartItems", dataArr);
                let itemTotal = 0;
                let packagingTotal = 0;
                let avgCookingTime = 0;
                let itemFlag = false;
                let deliveryTotal = 0;
                for (let i = 0; i < dataArr.length; i++) {
                    itemTotal += dataArr[i].Qty * (eval(dataArr[i].OfferPrice) + eval(dataArr[i].ProductDeliveryCharge));
                    packagingTotal += dataArr[i].Qty * eval(dataArr[i].ProductPackingCharge);
                    avgCookingTime = (avgCookingTime < eval(dataArr[i].ProductAvgCookingTime)) ? eval(dataArr[i].ProductAvgCookingTime) : avgCookingTime;
                    itemFlag = true;
                }
                if ((itemTotal + packagingTotal) < this.state.minOrderChargeForDelivery && itemFlag) {
                    deliveryTotal = this.state.deliveryCharge;
                    avgCookingTime += 19;
                }
                this.setState({
                    payableAmount: (eval(itemTotal) + eval(deliveryTotal) + eval(packagingTotal)).toFixed(2),
                    avgCookingTime: avgCookingTime,
                    itemCount: dataArr.length,
                    Items: products
                });
            }
        });
    }

    removeProductFromCart = (item) => {
        console.log("HungryScreen removeProductFromCart() item: ", item);
        let idx = this.state.Items.indexOf(item);
        let products = this.state.Items;
        if (this.state.Items[idx].Qty > 0) {
            products[idx].Qty -= 1;
        }
        this.retrieveItem('CartItems').then((dataArr) => {
            if (dataArr != null) {
                let index = -1;
                for (let i = 0; i < dataArr.length; i++) {
                    if (dataArr[i].ProductId == item.ProductId && dataArr[i].RestaurantId == item.RestaurantId) {
                        dataArr[i].Qty--;
                        if (dataArr[i].Qty < 1) {
                            index = i;
                        }
                        break;
                    }
                }
                if (index > -1) {
                    dataArr.splice(index, 1);
                }
                this.storeItem("CartItems", dataArr);
                let itemTotal = 0;
                let packagingTotal = 0;
                let avgCookingTime = 0;
                let itemFlag = false;
                let deliveryTotal = 0;
                for (let i = 0; i < dataArr.length; i++) {
                    itemTotal += dataArr[i].Qty * (eval(dataArr[i].OfferPrice) + eval(dataArr[i].ProductDeliveryCharge));
                    packagingTotal += dataArr[i].Qty * eval(dataArr[i].ProductPackingCharge);
                    avgCookingTime = (avgCookingTime < eval(dataArr[i].ProductAvgCookingTime)) ? eval(dataArr[i].ProductAvgCookingTime) : avgCookingTime;
                    itemFlag = true;
                }
                if ((itemTotal + packagingTotal) < this.state.minOrderChargeForDelivery && itemFlag) {
                    deliveryTotal = this.state.deliveryCharge;
                    avgCookingTime += 19;
                }
                this.setState({
                    payableAmount: (eval(itemTotal) + eval(deliveryTotal) + eval(packagingTotal)).toFixed(2),
                    avgCookingTime: avgCookingTime,
                    itemCount: dataArr.length,
                    Items: products
                });
            }
        });
    }

    checkKitchenStatus = () => {
        console.log("HungryScreen checkKitchenStatus()");
        this.retrieveItem('KitchenStatus').then((data) => {
            if (data != null) {
                if (data != "OPEN") {
                    this.setState({ kitchenClosed: true });
                }
                else {
                    this.setState({ kitchenClosed: false });
                    this.getPincode();
                }
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    componentWillMount() {
        console.log("HungryScreen componentWillMount()");
        this.props.navigation.addListener('didFocus', () => { this.checkKitchenStatus(); })

    }
    showmsg() {
        ToastAndroid.show('Sorry Item Is unavailable Now!', ToastAndroid.SHORT);
    }
    render() {

        return (
            <View style={styles.mainContainer}>

                <Display enable={this.state.noMeals} style={{ flex: 1 }}>
                    <View style={{ height: Dimensions.get('window').height, justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={require('../assets/emptyplate.png')} style={[styles.image]} />
                        <Text style={{ fontSize: 18, marginTop: 5 }}>No All In On Meals  Available At Your Location</Text>
                        <Text style={{ fontSize: 14, color: '#bab8b8' }}>Something Great is always cooking</Text>
                        <Text style={{ fontSize: 14, color: '#bab8b8' }}>Checkout other categories to find out </Text>
                    </View>
                </Display>

                <Display enable={this.state.kitchenClosed} style={{ flex: 1 }}>
                    <View style={{ height: Dimensions.get('window').height, justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={require('../assets/app-images/kitchen-closed.png')} style={[styles.image]} />
                        <Text style={{ fontSize: 12, marginTop: 5, padding: 4, backgroundColor: '#000', color: '#fff' }}>Sorry! Kitchen is closed right now.</Text>
                        <Text style={{ color: "#000", fontSize: 10, padding: 4, margin: 5, marginTop: 10, textAlign: 'center' }}>Please knock after some time</Text>

                    </View>
                </Display>

                <Display enable={!this.state.noMeals && !this.state.kitchenClosed} style={styles.mainContainer}>
                    <View style={{ flex: 9, marginTop: 0, marginBottom: (this.state.itemCount > 0 ? 50 : 0) }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.upperContainer}>
                                <View style={{ width: Dimensions.get('window').width - 290, backgroundColor: '#fff', height: 75, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
                                    <Image source={require('../assets/app-images/meal.png')} style={{ width: 73, height: 70 }} />
                                </View>
                                <View style={{ flex: 3, justifyContent: "center", alignItems: 'center' }}>
                                    <View style={{ position: 'relative', top: -30, zIndex: -100, width: 150, height: 150, borderRadius: 90, backgroundColor: '#cd2121' }}>
                                        <View style={{ marginTop: 50 }}>
                                            <View style={{ backgroundColor: '#fff09a', height: 5, }}></View>
                                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                <Text style={{ color: '#fff09a', fontSize: 16 }}>ALL-IN-ONE</Text>
                                                <Text style={{ color: '#fff09a', fontSize: 16 }}>MEALS</Text>
                                            </View>
                                            <View style={{ backgroundColor: '#fff09a', height: 5, }}></View>
                                        </View>
                                    </View>
                                    <Text style={{ color: '#cd2121', fontSize: 10, marginTop: -15 }}>PACKED | FASTER DELIVERY | NO EXTRA CHARGES</Text>
                                </View>
                                <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 5 }}>
                                    <Icon name="sort-up" size={50} color="#cd2121" style={{ height: 20 }} />
                                </View>
                            </View>
                            <View style={styles.lowerContainer}>

                                <ScrollView showsHorizontalScrollIndicator={false}>
                                    <GridView
                                        itemDimension={this.state.dim}
                                        items={this.state.Items}
                                        renderItem={item => (

                                            <View style={styles.itemContainer}>
                                                <Display enable={this.state.hungerLoader} style={{ flex: 1, padding: 4 }}>
                                                    <Hunger />
                                                </Display>
                                                <Display enable={!this.state.hungerLoader} style={{ flex: 1 }}>
                                                    <ImageBackground source={{ uri: item.ProductImage }} style={{ flex: 3, opacity: (!item.Addable ? .6 : 1), backgroundColor: '#f9f9f9' }}>
                                                        <View style={{ borderColor: '#fff', marginLeft: 5, marginTop: 5, borderWidth: 1, width: 14, height: 14, borderRadius: 7, backgroundColor: (item.ProductVeganType == 'VEG') ? '#3bb97a' : 'red' }}>
                                                        </View>
                                                        <Display enable={!item.Addable} style={{ position: 'absolute', zIndex: 500 }}>
                                                            <Image source={require('../assets/unavailable.png')} style={{ width: 100, height: 80 }} />
                                                        </Display>
                                                    </ImageBackground >
                                                    <View style={{ backgroundColor: '#fff', padding: 4 }}>
                                                        <Text style={{ fontSize: 14, color: '#999a95', fontWeight: 'bold' }}>{item.ProductName}</Text>
                                                        <Text style={{ fontSize: 9, color: '#999a95' }}>{item.ProductDescription}</Text>
                                                        <View style={{ flexDirection: 'row' }}>
                                                            <View style={{ flex: 7, backgroundColor: '#fff' }}>
                                                                <Text style={{ color: "#cd2121", fontSize: 16, fontWeight: '600' }}>₹ {item.OfferPrice}</Text>
                                                            </View>
                                                            <View style={{ flex: 5, borderWidth: 1, borderColor: (!item.Addable ? '#ada8a8' : "#2dbe60"), backgroundColor: (!item.Addable ? '#ada8a8' : "#2dbe60"), justifyContent: 'center', alignItems: 'center', width: 160, borderRadius: 1 }}>
                                                                <Display enable={item.Addable} style={{ flex: 1, flexDirection: 'row', }}>
                                                                    <Display enable={item.Qty > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                        <TouchableOpacity onPress={this.removeProductFromCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                            <Text style={{ color: "#fff", fontSize: 14, }}>-</Text>
                                                                        </TouchableOpacity>
                                                                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                                                            <Text style={{ color: "#555", fontSize: 12, }}>{item.Qty}</Text>
                                                                        </View>
                                                                        <TouchableOpacity onPress={this.addProductToCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                            <Text style={{ color: "#fff", fontSize: 14, }}>+</Text>
                                                                        </TouchableOpacity>
                                                                    </Display>
                                                                    <Display enable={item.Qty < 1} style={{ flex: 1, flexDirection: 'row', }}>
                                                                        <TouchableOpacity onPress={this.addProductToCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                            <Text style={{ color: "#fff", fontSize: 14 }}>ADD</Text>
                                                                        </TouchableOpacity>
                                                                    </Display>
                                                                </Display>
                                                                <Display enable={!item.Addable} style={{ flex: 1, flexDirection: 'row', }}>
                                                                    <TouchableOpacity onPress={this.showmsg}>
                                                                        <Text style={{ color: "#fff", fontSize: 14, marginBottom: (Platform.OS === 'ios' ? 0 : 5) }}>ADD</Text>
                                                                    </TouchableOpacity>
                                                                </Display>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </Display>
                                            </View>
                                        )
                                        }
                                    />
                                </ScrollView>
                            </View>

                        </ScrollView>
                    </View>
                    <Display
                        enable={this.state.itemCount > 0}
                        enterDuration={100}
                        exitDuration={100}
                        exit="fadeOutDown"
                        enter="fadeInUp"
                        style={{ flex: 1, bottom: 0, position: 'absolute' }}
                    >
                        <View style={{ flexDirection: 'row', }}>
                            <View style={{ backgroundColor: "#ebebeb", justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>₹ {this.state.payableAmount} | {this.state.itemCount} Items</Text>
                                <Text style={{ fontSize: 10 }}>ESTIMATED DELIVERY TIME :{this.state.avgCookingTime} MINS</Text>
                            </View>
                            <TouchableOpacity onPress={() => { this.props.navigation.navigate('Cart') }}>
                                <View style={{ backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>VIEW CART</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Display>

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
       // marginTop: Expo.Constants.statusBarHeight,

    },
    upperContainer:
    {
        alignItems: 'center',
        justifyContent: 'center',
        // flex:1
        paddingTop: 30
    },
    lowerContainer:
    {
        paddingTop: 0
        // flex:2
    },
    itemContainer: {
        flexDirection: 'column',
        borderRadius: 5,
        margin: 10,
        height: 300,
        backgroundColor: '#ebebeb', shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2,
    },
    itemName: {
        fontSize: 10,
        color: '#5b5b59',
        fontWeight: '300',

    },
    image:
    {
        width: 80, height: 80,
    },
});