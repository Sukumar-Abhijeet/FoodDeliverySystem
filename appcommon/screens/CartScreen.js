import React from 'react';
import {
    StyleSheet, Text, View, BackHandler, ToastAndroid, Image, ImageBackground, Keyboard,
    ListView, ScrollView, KeyboardAvoidingView, Platform, TextInput, ActivityIndicator, Dimensions, TouchableOpacity, AsyncStorage, Alert
} from 'react-native';
import Modal from 'react-native-modal';
import { Header, Left, Body, Right, Button, Icon, Title, Content, ListItem, Radio } from 'native-base';
import Display from 'react-native-display';
import { TextField } from 'react-native-material-textfield';
import { TabIcon } from '../vectoricons/TabIcon';
import ContentLoader from 'react-native-content-loader';
import { Rect } from 'react-native-svg';
import Global from '../Urls/Global';

const BASE_PATH = Global.BASE_PATH;

const Cart = () => <ContentLoader height={105}
    primaryColor='#eeeeee'
    secondaryColor='#fff'
    speed={100}
>
    <Rect x="0" y="0" rx="0" ry="0" width="100" height="104" />
    <Rect x="105.5" y="19.27" rx="0" ry="0" width="121" height="4.5" />
    <Rect x="106.5" y="29.27" rx="0" ry="0" width="106" height="8" />
    <Rect x="108.5" y="44.27" rx="0" ry="0" width="48.720000000000006" height="16.33" />
    <Rect x="109.5" y="74.27" rx="0" ry="0" width="27.599999999999998" height="6.93" />

</ContentLoader >

const AddressContainer = () => <ContentLoader height={105}
    primaryColor='#eeeeee'
    secondaryColor='#fff'
    speed={100}
>

    <Rect x="59.5" y="148.27" rx="0" ry="0" width="212" height="26" />
    <Rect x="22.5" y="28.27" rx="0" ry="0" width="278" height="39" />
    <Rect x="80.5" y="93.27" rx="0" ry="0" width="159" height="28" />

</ContentLoader >

const BillContainer = () => <ContentLoader height={105}
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

</ContentLoader >

export default class CartScreen extends React.Component {

    constructor(props) {
        super(props);

        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource1: ds.cloneWithRows(['r1', 'r2']),
            dim: 150,
            checkoutObj: {
                locCode: "",
                cityCode: "",
                payId: "",
                isReady: false,
                deliveryAddressId: "",
                uuid: "",
                paymentMethod: "CASH",
                instructions: "",
                useWallet: "YES",
                items: [],
                restItems: [],
                bawItems: [],
                itemTotal: 0.00,
                offersDiscount: 0.00,
                taxes: 0.00,
                delCharge: 0.00,
                packCharge: 0.00,
                appliedCoupon: "",
                couponDiscount: 0.00,
                surplusCharge: 0.00,
                walletDeduction: 0.00,
                netPayable: 0.00,
                cartType: ""
            },
            loggedIn: false,
            visibleModal: 0,
            applyCouponDisplay: false,
            houseno: '',
            street: '',
            landmark: '',
            addrBtnText: 'ENTER HOUSE/FLAT NO.',
            save: '',
            addrBtnDisabled: true,
            walletMoney: 0.0,
            locAddr: {},
            locData: {},
            minOrderChargeForDelivery: 0,
            deliveryCharge: 0,
            surplusCharge: 0,
            walletMoney: 0,
            savedAddress: [],
            fetchAddressLoader: false,
            couponList: [],
            couponLoader: false,
            couponSaveAmount: 0,
            bestOffer: false,
            cartItems: [],
            uiMsg: false,
            specialinstruction: '',
            checked: '',
            cartLoader: true,
            Items: [],
            itemTotal: 0.0,
            packagingTotal: 0.0,
            deliveryTotal: 0.0,
            taxesTotal: 0.0,
            discountTotal: 0.0,
            payableAmount: 0.0,
            taxStatus: "INACTIVE",
            pincode: "",
            wallet: 0,
            avgCookingTime: 0,
            cartLoaded: false,
            proceedToPay: true,
            dataSource2: ds.cloneWithRows([]),
            deliveryAddresses: [],
            location: '',
            deliveryAddress: {},
            selectedAddress: {},
            couponApplied: "NO",
            couponObj: {},
            navigatedFrom: this.props.navigation.getParam("navigatedFrom"),
            customerId: "",
            noProductsInCart: false,
            readyPay: true,
            kitchenClosed: false,
            change: 0,
            days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',],
            mnths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            noCoupon: true,
        }
    }

    async retrieveItem(key) {
        console.log("CartScreen retrieveItem() key: ", key);
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
        console.log("CartScreen storeItem() key: ", key);
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
        console.log("CartScreen removeItem() key: ", key);
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    isEmptyObject(obj) {
        return ((Object.keys(obj).length === 0 && obj.constructor == Object) || (obj.length < 1 && obj.constructor == Array));
    }

    getFormattedAddress(addr) {
        return ((addr.houseNo != "" ? addr.houseNo + ", " : "") + (addr.streetName != "" ? addr.streetName + ", " : "") + (addr.landmark != "" ? addr.landmark + ", " : "") + (addr.locName != "" ? addr.locName + ", " : "") + (addr.cityName != "" ? addr.cityName + ", " : "") + (addr.pincode != "" ? addr.pincode : ""));
    }

    getUserData = () => {
        console.log("CartScreen getUserData()");
        this.retrieveItem('UserData').then((user) => {
            if (user != null) {
                console.log("User is logged in");
                let cktObj = this.state.checkoutObj;
                cktObj.uuid = user.uuid;
                this.setState({ applyCouponDisplay: true, loggedIn: true, checkoutObj: cktObj, walletMoney: eval(user.WalletMoney) });
                this.saveDeliveryPreference();
            }
            else {
                console.log("User is not logged in");
                this.setState({ applyCouponDisplay: false });
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    saveDeliveryPreference() {
        console.log("CartScreen saveDeliveryPreference()");
        this.retrieveItem('DelTmgs').then((data) => {
            if (data != null) {
                if (this.state.checkoutObj.uuid != "") {
                    let formValue = data;
                    formValue.uuid = this.state.checkoutObj.uuid;
                    console.log("SET_USER_DELIVERY_TIMESLOT formValue", JSON.stringify(formValue));
                    fetch(BASE_PATH + Global.SET_USER_DELIVERY_TIMESLOT, {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formValue)
                    }).then((response) => response.json()).then((responseJson) => {
                        console.log("response saveDeliveryPreference: ", responseJson);
                        if (responseJson.Success == "Y") {
                            // this.setState({ value: this.state.value + 1, dataSource1: matchedArr, loader: false });
                        }
                    }).catch((error) => {
                        console.log("Error Saving Preferences: ", error);
                        ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
                    });
                }
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });




    }

    getLocation = () => {
        console.log("CartScreen getLocation()");
        this.retrieveItem('Address').then((data) => {
            if (data != null) {
                if (!this.isEmptyObject(data)) {
                    let cktObj = this.state.checkoutObj;
                    let locData = JSON.parse(JSON.stringify(data));
                    let locAddr = JSON.parse(JSON.stringify(data));
                    // delete locAddr['bAvail'];
                    // delete locAddr['fAvail'];
                    console.log("locAddr: ", locAddr['id']);
                    if (locAddr['id'] == "" || typeof locAddr['id'] == 'undefined') {
                        locAddr['id'] = "";
                    }
                    else {
                        cktObj.deliveryAddressId = locAddr['id'];
                        this.setState({ checkoutObj: cktObj });
                    }
                    if (locAddr['type'] == '') {
                        locAddr['type'] = 'OTHERS';
                    }
                    console.log("locAddr: ", locAddr);
                    this.setState({ locAddr: locAddr, locData: locData }, () => {
                        this.getCheckoutInfo();
                    });
                }
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    getCheckoutInfo() {
        console.log("CartScreen getCheckoutInfo()");
        let formValue = { locCode: this.state.locAddr.locCode, uuid: this.state.checkoutObj.uuid };
        fetch(BASE_PATH + Global.FETCH_CHECKOUT_INFO, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formValue)
        }).then((response) => response.json()).then((responseJson) => {
            console.log("checkkoutinfo response: ", responseJson);
            if (responseJson.Success == "Y") {
                this.setState({ minOrderChargeForDelivery: eval(responseJson.COInfo.MinOrderValue), deliveryCharge: eval(responseJson.COInfo.DelCharge), surplusCharge: eval(responseJson.COInfo.SurCharge), walletMoney: eval(responseJson.COInfo.WalletMoney), taxStatus: responseJson.COInfo.TaxStatus }, ()=> {
                    this.initCart();
                });
            }
            else {
                ToastAndroid.show("Some problem has been encountered while fetching information from server. Please try again.", ToastAndroid.SHORT);
                this.initCart();
            }
        }).catch((error) => {
            console.log("Error Checkout Info: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.initCart();
        });
    }

    initCart() {
        console.log("CartSCreen initCart()");
        this.retrieveItem('CartItems').then((uCart) => {
            let cartItems = uCart;
            if (cartItems == null) {
                cartItems = "[]";
            }
            if (typeof cartItems == "string") {
                cartItems = JSON.parse(cartItems);
            }
            console.log("CartScreen initCart() cartItems :", JSON.stringify(cartItems));
            let cktObj = this.state.checkoutObj;
            cktObj.items = JSON.parse(JSON.stringify(cartItems));
            this.setState({ checkoutObj: cktObj }, () => {
                this.checkCartProductsAvailability();
                this.calcCheckout();
            });
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    checkCartProductsAvailability() {
        console.log("ChefHomeScreen checkCartProductsAvailability()");
        let type = "";
        let products = [];
        if (!this.isEmptyObject(this.state.locAddr)) {
            for (let i = 0; i < this.state.checkoutObj.items.length; i++) {
                if (this.state.checkoutObj.items[i].ProdType == "R") {
                    let obj = { pid: this.state.checkoutObj.items[i].ProductId, vid: this.state.checkoutObj.items[i].VId, pt: "R", vs: this.state.checkoutObj.items[i].Variant, as: this.state.checkoutObj.items[i].Addons };
                    products.push(obj);
                    type = "R";
                }
                else if (this.state.checkoutObj.items[i].ProdType == "B") {
                    for (let j = 0; j < this.state.checkoutObj.items[i].OrderedProducts.length; j++) {
                        let obj = { pid: this.state.checkoutObj.items[i].OrderedProducts[j].ProductId, vid: this.state.checkoutObj.items[i].VId, ds: { Date: this.state.checkoutObj.items[i].OrderedProducts[j].SelectedDay }, ts: this.state.checkoutObj.items[i].OrderedProducts[j].SelectedTimeSlot, pt: "B", qty: this.state.checkoutObj.items[i].OrderedProducts[j].Qty };
                        products.push(obj);
                    }
                    type = "B";
                }
            }
            if (products.length > 0) {
                let formValue = {
                    cartType: type,
                    products: JSON.stringify(products),
                    locCode: this.state.locAddr.locCode,
                    cityCode: this.state.locAddr.cityCode,
                    reqFrom: "APP"
                };
                console.log("cart availability formValue: ", JSON.stringify(formValue));
                fetch(BASE_PATH + Global.CHECK_CART_AVAILABILITY_URL, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formValue)
                }).then((response) => response.json()).then((responseJson) => {
                    console.log("response avaialability: ", responseJson);
                    if (responseJson.Success == "Y") {
                        let cktObj = this.state.checkoutObj;
                        for (let k = 0; k < responseJson.Data.length; k++) {
                            for (let i = 0; i < cktObj.items.length; i++) {
                                if (cktObj.items[i].ProdType == "R") {
                                    if (cktObj.items[i].ProductId == responseJson.Data[k].ProductId && cktObj.items[i].VId == responseJson.Data[k].VId) {
                                        if (!this.isEmptyObject(responseJson.Data[k].vs) && !this.isEmptyObject(cktObj.items[i].Variant)) {
                                            // console.log("Not Empty variant");
                                            if (responseJson.Data[k].vs.Id == cktObj.items[i].Variant.Id) {
                                                let ctr = 0;
                                                for (let x = 0; x < cktObj.items[i].Addons.length; x++) {
                                                    for (let y = 0; y < responseJson.Data[k].as.length; y++) {
                                                        if (responseJson.Data[k].as[y].Id == cktObj.items[i].Addons[x].Id) {
                                                            ctr++;
                                                            break;
                                                        }
                                                    }
                                                }
                                                if (ctr == responseJson.Data[k].as.length) {
                                                    cktObj.items[i].Addable = responseJson.Data[k].Addable;
                                                }
                                            }
                                        }
                                        else if (this.isEmptyObject(responseJson.Data[k].vs) && this.isEmptyObject(cktObj.items[i].Variant)) {
                                            // console.log("Empty variant");
                                            let ctr = 0;
                                            for (let x = 0; x < cktObj.items[i].Addons.length; x++) {
                                                for (let y = 0; y < responseJson.Data[k].as.length; y++) {
                                                    if (responseJson.Data[k].as[y].Id == cktObj.items[i].Addons[x].Id) {
                                                        ctr++;
                                                        break;
                                                    }
                                                }
                                            }
                                            if (ctr == responseJson.Data[k].as.length) {
                                                cktObj.items[i].Addable = responseJson.Data[k].Addable;
                                            }
                                        }
                                    }
                                }
                                else if (cktObj.items[i].ProdType == "B") {
                                    for (let j = 0; j < cktObj.items[i].OrderedProducts.length; j++) {
                                        let prod = cktObj.items[i].OrderedProducts[j];
                                        if (cktObj.items[i].VId == responseJson.Data[k].VId && prod.ProductId == responseJson.Data[k].ProductId && prod.SelectedDay == responseJson.Data[k].ds.Date && prod.SelectedTimeSlot == responseJson.Data[k].ts) {
                                            cktObj.items[i].OrderedProducts[j].AvailCount = responseJson.Data[k].availqty;
                                            cktObj.items[i].OrderedProducts[j].Addable = responseJson.Data[k].Addable;
                                            cktObj.items[i].OrderedProducts[j].UiMsg = responseJson.Data[k].UiMsg;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        // console.log("cart items: ", cktObj.items);
                        this.setState({ checkoutObj: cktObj, fetchAddressLoader: false }, ()=> {
                            this.calcCheckout();
                        });
                    }
                }).catch((error) => {
                    console.log("Error Cart Availability: ", error);
                    ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
                });
            }
        }
    }

    calcCheckout() {
        console.log("CartScreen calcCheckout()");
        let type = "";
        let itemCtr = 0;
        let cartItemsTotal = 0;
        let itemTotal = 0;
        let itemOfferTotal = 0;
        let packingTotal = 0;
        let walletMoneyToBeDeducted = 0;
        let itemFlag = false;
        let unavailableItems = false;
        let cktObj = this.state.checkoutObj;
        // console.log("cartArr: ", cktObj.items, this.state.minOrderChargeForDelivery, this.state.deliveryCharge, this.state.surplusCharge, this.state.walletMoney);
        for (let i = 0; i < cktObj.items.length; i++) {
            if (cktObj.items[i].ProdType == "R") {
                if (cktObj.items[i].Addable) {
                    let vrntPrice = 0;
                    if (!this.isEmptyObject(cktObj.items[i].Variant)) {
                        vrntPrice = eval(cktObj.items[i].Variant.Price);
                    }
                    let adnPrice = 0;
                    for (let j = 0; j < cktObj.items[i].Addons.length; j++) {
                        adnPrice += eval(cktObj.items[i].Addons[j].Price);
                    }
                    itemOfferTotal += (cktObj.items[i].Qty * (eval(cktObj.items[i].OfferPrice) + vrntPrice + adnPrice));
                    itemTotal += (cktObj.items[i].Qty * (eval(cktObj.items[i].ProductPrice) + vrntPrice + adnPrice));
                    packingTotal += (cktObj.items[i].Qty * (eval(cktObj.items[i].ProductPackingCharge)));
                    itemFlag = true;
                }
                else {
                    unavailableItems = true;
                }
                itemCtr++;
                type = "R";
            }
            else if (cktObj.items[i].ProdType == "B") {
                for (let j = 0; j < cktObj.items[i].OrderedProducts.length; j++) {
                    if (cktObj.items[i].OrderedProducts[j].Addable) {
                        itemOfferTotal += (cktObj.items[i].OrderedProducts[j].Qty * cktObj.items[i].OrderedProducts[j].OfferPrice);
                        itemTotal += (cktObj.items[i].OrderedProducts[j].Qty * cktObj.items[i].OrderedProducts[j].ProductPrice);
                        packingTotal += (cktObj.items[i].OrderedProducts[j].Qty * (eval(cktObj.items[i].OrderedProducts[j].ProductPackingCharge)));
                        itemCtr++;
                        itemFlag = true;
                    }
                    else {
                        unavailableItems = true;
                    }
                }
                type = "B";
            }
        }
        if (this.state.checkoutObj.useWallet == "YES") {
            if (this.state.walletMoney > 25) {
                walletMoneyToBeDeducted = Math.ceil(0.1 * this.state.walletMoney);
                if (walletMoneyToBeDeducted > 25) {
                    walletMoneyToBeDeducted = 25;
                }
            }
            else {
                walletMoneyToBeDeducted = this.state.walletMoney;
            }
        }
        cktObj.itemTotal = itemTotal;
        if (cktObj.appliedCoupon == "") {
            cktObj.offersDiscount = (itemTotal - itemOfferTotal);
            cartItemsTotal = itemOfferTotal;
        }
        else {
            cktObj.offersDiscount = 0;
            cartItemsTotal = itemTotal;
        }
        if (this.state.taxStatus == "ACTIVE") {
            cktObj.taxes = 0.05 * cartItemsTotal;
        }
        cktObj.packCharge = packingTotal;
        console.log("offertotal: ", itemOfferTotal, " && packingTotal: ", packingTotal);
        if ((cartItemsTotal + packingTotal) < this.state.minOrderChargeForDelivery && itemFlag) {
            cktObj.delCharge = eval("" + this.state.deliveryCharge);
        }
        else {
            cktObj.delCharge = 0;
        }
        cktObj.surplusCharge = eval("" + this.state.surplusCharge);
        let payableAmount = (cartItemsTotal + packingTotal + eval(cktObj.taxes) + eval(cktObj.delCharge) + eval(cktObj.surplusCharge) - eval(cktObj.couponDiscount) - Math.ceil(walletMoneyToBeDeducted));
        cktObj.walletDeduction = Math.ceil(walletMoneyToBeDeducted);
        console.log("Payable Amount: ", payableAmount);
        cktObj.netPayable = payableAmount < 0 ? 0 : payableAmount;
        if (type == "B") {
            cktObj.paymentMethod = "ONLINE";
        }
        cktObj.cartType = type;
        if (type == "R") {
            cktObj.restItems = cktObj.items;
            cktObj.bawItems = [];
        }
        else if (type == "B") {
            cktObj.restItems = [];
            // cktObj.bawItems = cktObj.items;
            // console.log("Type B cktObj Items : ", cktObj.items)
            cktObj.bawItems = this.prepareChefCartArr(cktObj.items);
            console.log("Type B cktObj Items : ", cktObj.bawItems)

        }
        this.setState({ checkoutObj: cktObj, cartLoader: false, readyPay: false, isReady: true, proceedToPay: !unavailableItems });
        // console.log("cktObj: ", cktObj);
        this.storeItem("CartItems", cktObj.items);
    }

    prepareChefCartArr(chtObjArr) {
        let dtArr = [];
        console.log("chtObjArr: ", chtObjArr);
        for (let i = 0; i < chtObjArr.length; i++) {
            for (let j = 0; j < chtObjArr[i].OrderedProducts.length; j++) {
                let obj = chtObjArr[i].OrderedProducts[j];
                let flag = true;
                for (let k = 0; k < dtArr.length; k++) {
                    if (dtArr[k].SelectedDay == obj.SelectedDay) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    let dtObj = { "SelectedDay": obj.SelectedDay, OrderedProducts: [] };
                    dtArr.push(dtObj);
                }
            }
        }
        console.log("DtArr before:  ", JSON.parse(JSON.stringify(dtArr)));
        for (let i = 0; i < dtArr.length; i++) {
            for (let j = 0; j < chtObjArr.length; j++) {
                let obj = chtObjArr[j];
                for (let k = 0; k < obj.OrderedProducts.length; k++) {
                    let prod = obj.OrderedProducts[k];
                    if (prod.SelectedDay == dtArr[i].SelectedDay) {
                        let newObj = JSON.parse(JSON.stringify(prod));
                        newObj.VId = obj.VId;
                        newObj.ChefName = obj.ChefName;
                        newObj.ChefKitchenName = obj.ChefKitchenName;
                        newObj.ChefProfileName = obj.ChefProfileName;
                        dtArr[i].OrderedProducts.push(newObj);
                    }
                }
            }
        }
        console.log("DtArr after:  ", JSON.parse(JSON.stringify(dtArr)));
        return JSON.parse(JSON.stringify(dtArr));
    }

    changeDayFormat(selectedDay) {
        console.log("CartScreen changeDayFormat()", selectedDay);
        let dt = new Date(selectedDay);
        let day = this.state.days[dt.getDay()];
        let date = dt.getDate();
        let mnth = mnth = this.state.mnths[dt.getMonth()];

        return (
            <View style={{ flexDirection: 'row' }}>
                <Icon name={'ios-stopwatch'} style={{ color: '#4286f4', fontSize: 20 }} />
                <Text style={[styles.textBig, { color: '#4286f4', marginLeft: 5 }]}>{day} - {date} {mnth}</Text>
            </View>
        )
    }

    getItemPrice(item) {
        let total = eval(item.OfferPrice);
        if (!this.isEmptyObject(item.Variant)) {
            total += eval(item.Variant.Price);
        }
        for (let i = 0; i < item.Addons.length; i++) {
            total += eval(item.Addons[i].Price);
        }
        return total.toFixed(2);
    }

    updateCart = (item, str) => {
        console.log("CartScreen updateCart() item: ", item, str);
        let cktObj = this.state.checkoutObj;
        let idx = cktObj.items.indexOf(item);
        console.log("index found: ", idx);
        if (idx > -1) {
            let msg = "Item updated";
            if (str == "ADD") {
                item.Qty += 1;
                cktObj.items[idx].Qty = item.Qty;
            }
            else if (str == "REM") {
                item.Qty -= 1;
                if (item.Qty > 0) {
                    cktObj.items[idx].Qty = item.Qty;
                }
                else {
                    cktObj.items.splice(idx, 1);
                    msg = "Item removed";
                }
            }
            this.storeItem("CartItems", cktObj.items);
            this.setState({ checkoutObj: cktObj }, () => {
                this.calcCheckout();
            });
            ToastAndroid.show(msg, ToastAndroid.SHORT);
        }
        else {
            ToastAndroid.show("Some problem is there with your cart. Please refresh once.", ToastAndroid.SHORT);
        }
    }

    removeItemFromCart = (item) => {
        console.log("CartScreen removeItemFromCart()");
        let cktObj = this.state.checkoutObj;
        let idx = cktObj.items.indexOf(item);
        console.log("index found: ", idx);
        if (idx > -1) {
            cktObj.items.splice(idx, 1);
            this.storeItem("CartItems", cktObj.items);
            this.setState({ checkoutObj: cktObj }, ()=> {
                this.calcCheckout();
            });
            ToastAndroid.show("Item removed", ToastAndroid.SHORT);
        }
        else {
            ToastAndroid.show("Some problem is there with your cart. Please refresh once.", ToastAndroid.SHORT);
        }
    }

    updateChefCart = (item, chef, str) => {
        console.log("CartScreen updateChefCart() item: ", item, chef, str);
        let cktObj = this.state.checkoutObj;
        console.log("CartScreen", cktObj.items);
        // let cIdx = cktObj.items.indexOf(chef);
        // console.log("chef index found: ", cIdx);
        let cfIdx = -1;
        let msg = "Item updated";
        for (let i = 0; i < cktObj.items.length; i++) {
            if (item.VId == cktObj.items[i].VId) {
                let cFlag = false;
                for (let j = 0; j < cktObj.items[i].OrderedProducts.length; j++) {
                    let obj = cktObj.items[i].OrderedProducts[j];
                    if (item.ProductId == obj.ProductId && chef.SelectedDay == obj.SelectedDay && item.SelectedTimeSlot == obj.SelectedTimeSlot) {
                        if (str == "ADD") {
                            if (item.Qty < item.AvailCount) {
                                item.Qty += 1;
                                cktObj.items[i].OrderedProducts[j].Qty = item.Qty;
                            }
                            else {
                                msg = "Only " + item.Qty + " quantity is available for now.";
                                this.actionMsgType = "Error";
                            }
                        }
                        else if (str == "REM") {
                            item.Qty -= 1;
                            if (item.Qty > 0) {
                                cktObj.items[i].OrderedProducts[j].Qty = item.Qty;
                            }
                            else {
                                cktObj.items[i].OrderedProducts.splice(j, 1);
                                if (cktObj.items[i].OrderedProducts.length < 1) {
                                    cktObj.items.splice(i, 1);
                                }
                                msg = "Item removed";
                            }
                        }
                        cFlag = true;
                        break;
                    }
                }
                if (cFlag) {
                    cfIdx = i;
                    break;
                }
            }
        }
        // if (cIdx > -1) {
        //     let pIdx = cktObj.items[cIdx].OrderedProducts.indexOf(item);
        //     console.log("prod index found: ", pIdx);
        //     if (pIdx > -1) {
        //         let msg = "Item updated";
        //         if (str == "ADD") {
        //             item.Qty += 1;
        //             cktObj.items[cIdx].OrderedProducts[pIdx].Qty = item.Qty;
        //         }
        //         else if (str == "REM") {
        //             item.Qty -= 1;
        //             if (item.Qty > 0) {
        //                 cktObj.items[cIdx].OrderedProducts[pIdx].Qty = item.Qty;
        //             }
        //             else {
        //                 cktObj.items[cIdx].OrderedProducts.splice(pIdx, 1);
        //                 if (cktObj.items[cIdx].OrderedProducts.length < 1) {
        //                     cktObj.items.splice(cIdx, 1);
        //                 }
        //                 msg = "Item removed";
        //             }
        //         }
        //         this.setState({ checkoutObj: cktObj });
        //         this.storeItem("CartItems", cktObj.items);
        //         ToastAndroid.show(msg, ToastAndroid.SHORT);
        //         this.calcCheckout();
        //     }
        // }
        if (cfIdx < 0) {
            if (Platform.OS === "android")
                ToastAndroid.show("Some problem is there with your cart. Please refresh once.", ToastAndroid.SHORT);
        }
        else {
            this.storeItem("CartItems", cktObj.items);
            this.setState({ checkoutObj: cktObj }, () => {
                this.calcCheckout();
            });
            if (Platform.OS === "android")
                ToastAndroid.show(msg, ToastAndroid.SHORT);
        }
    }

    // removeChefFromCart = (item) => {
    //     console.log("CartSCreen removeChefFromCart() item: ", item);
    //     let cktObj = this.state.checkoutObj;
    //     let ctIdx = cktObj.items.indexOf(item);
    //     console.log("ctIdx: ", ctIdx);
    //     if (ctIdx > -1) {
    //         cktObj.items.splice(ctIdx, 1);
    //         this.setState({ checkoutObj: cktObj });
    //         this.storeItem("CartItems", cktObj.items);
    //         ToastAndroid.show("Item removed", ToastAndroid.SHORT);
    //         this.calcCheckout();
    //     }
    // }

    removeChefFromCart(item) {
        console.log("CartSCreen removeChefFromCart() item: ", item);
        let cktObj = this.state.checkoutObj;
        for (let i = (cktObj.items.length - 1); i >= 0; --i) {
            for (let j = (cktObj.items[i].OrderedProducts.length - 1); j >= 0; --j) {
                let obj = cktObj.items[i].OrderedProducts[j];
                if (obj.SelectedDay == item.SelectedDay) {
                    cktObj.items[i].OrderedProducts.splice(j, 1);
                }
            }
            if (cktObj.items[i].OrderedProducts.length < 1) {
                cktObj.items.splice(i, 1);
            }
        }
        this.storeItem("CartItems", cktObj.items);
        this.setState({ checkoutObj: cktObj }, () => {
            this.calcCheckout();
        });
        ToastAndroid.show("Item removed", ToastAndroid.SHORT);
    }

    reduceQtyFromChefCart = (prod, item) => {
        console.log("CartScreen reduceQtyFromChefCart() prod:  ", prod, " && Item: ", item);
        let cktObj = this.state.checkoutObj;
        let found = false;
        for (let i = (cktObj.items.length - 1); i >= 0; --i) {
            let flag = false;
            for (let j = (cktObj.items[i].OrderedProducts.length - 1); j >= 0; --j) {
                let obj = cktObj.items[i].OrderedProducts[j];
                if (cktObj.items[i].VId == prod.VId && prod.ProductId == obj.ProductId && item.SelectedDay == obj.SelectedDay && prod.SelectedTimeSlot == obj.SelectedTimeSlot) {
                    cktObj.items[i].OrderedProducts[j].Qty = cktObj.items[i].OrderedProducts[j].AvailCount;
                    cktObj.items[i].OrderedProducts[j].Addable = true;
                    delete cktObj.items[i].OrderedProducts[j].UiMsg;
                    flag = true;
                    found = true;
                    break;
                }
            }
            if (flag) {
                break;
            }
        }
        if (found) {
            ToastAndroid.show("Item count reduced", ToastAndroid.SHORT);
            this.setState({ checkoutObj: cktObj }, () => { this.checkCartProductsAvailability(); });
        }
        else {
            ToastAndroid.show("There is some problem with the cart.", ToastAndroid.SHORT);
        }
    }

    removeItemFromChefCart = (prod, item) => {
        console.log("CartScreen removeItemFromChefCart() prod:  ", prod, " && Item: ", item);
        let cktObj = this.state.checkoutObj;
        for (let i = (cktObj.items.length - 1); i >= 0; --i) {
            for (let j = (cktObj.items[i].OrderedProducts.length - 1); j >= 0; --j) {
                let obj = cktObj.items[i].OrderedProducts[j];
                if (cktObj.items[i].VId == prod.VId && prod.ProductId == obj.ProductId && item.SelectedDay == obj.SelectedDay && prod.SelectedTimeSlot == obj.SelectedTimeSlot) {
                    cktObj.items[i].OrderedProducts.splice(j, 1);
                }
            }
            if (cktObj.items[i].OrderedProducts.length < 1) {
                cktObj.items.splice(i, 1);
            }
        }
        this.storeItem("CartItems", cktObj.items);
        this.setState({ checkoutObj: cktObj }, () => {
            this.calcCheckout();
        });
        ToastAndroid.show("Item removed", ToastAndroid.SHORT);
    }

    emptyCart = () => {
        console.log("CartScreen emptyCart()");
        let cktObj = this.state.checkoutObj;
        cktObj.items = [];
        cktObj.cartType = "R";
        this.storeItem("CartItems", cktObj.items);
        this.setState({ checkoutObj: cktObj }, () => {
            this.calcCheckout();
        });
        ToastAndroid.show("Cart emptied", ToastAndroid.SHORT);
    }

    modifyAddress = (addr) => {
        console.log("CartScreen modifyAddress()");
        let addrBtnText = "DELIVER HERE";
        if (addr.houseNo == "") {
            addrBtnText = "ENTER HOUSE/FLAT NO.";
        }
        else if (addr.streetName == "") {
            addrBtnText = "ENTER STREET NAME";
        }
        else if (addr.type == "") {
            addrBtnText = "SELECT SAVE AS";
        }
        this.setState({ visibleModal: 9, houseno: addr.houseNo, street: addr.streetName, landmark: addr.landmark, save: addr.type, addrBtnText: addrBtnText, addrBtnDisabled: false });
    }

    getHouseFunction = (valueHolder) => {
        console.log("CartScreen getHouseFunction()");
        this.setState({ houseno: valueHolder });
        if (valueHolder.length < 5) {
            this.setState({ addrBtnText: "ENTER HOUSE/FLAT NO.", addrBtnDisabled: true });
        }
        else {
            if (this.state.street.trim() == "") {
                this.setState({ addrBtnText: "ENTER STREET NAME", addrBtnDisabled: true });
            }
            else if (this.state.save.trim() == "") {
                this.setState({ addrBtnText: "SELECT SAVE AS", addrBtnDisabled: true });
            }
            else {
                this.setState({ addrBtnText: "CONTINUE", addrBtnDisabled: false });
            }
        }
    }

    getStreetName = (streetname) => {
        console.log("CartScreen getStreetName()");
        this.setState({ street: streetname });
        if (streetname.length < 5) {
            this.setState({ addrBtnText: "ENTER STREET NAME", addrBtnDisabled: true });
        }
        else {
            if (this.state.houseno.trim() == "") {
                this.setState({ addrBtnText: "ENTER HOUSE/FLAT NO.", addrBtnDisabled: true });
            }
            else if (this.state.save.trim() == "") {
                this.setState({ addrBtnText: "SELECT SAVE AS", addrBtnDisabled: true });
            }
            else {
                this.setState({ addrBtnText: "CONTINUE", addrBtnDisabled: false });
            }
        }
    }

    getLandmarkFunction = (lm) => {
        console.log("CartScreen getLandmarkFunction()");
        this.setState({ landmark: lm });
    }

    saveas = (saveas) => {
        console.log("CartScreen saveas() saveas: ", saveas);
        this.setState({ save: saveas });
        if (this.state.houseno.trim() != "" && this.state.street.trim() != "" && this.state.save.trim() != "") {
            this.setState({ addrBtnDisabled: false, addrBtnText: "CONTINUE" });
        }
        else {
            if (this.state.houseno.trim() == "") {
                this.setState({ addrBtnText: "ENTER HOUSE/FLAT NO.", addrBtnDisabled: true });
            }
            else if (this.state.street.trim() == "") {
                this.setState({ addrBtnText: "ENTER STREET NAME", addrBtnDisabled: true });
            }
            if (this.state.save.trim() == "") {
                this.setState({ addrBtnText: "SELECT SAVE AS", addrBtnDisabled: true });
            }
        }
    }

    saveAddress = () => {
        console.log("CartScreen saveAddress()");
        if (this.state.houseno.trim() != "" && this.state.street.trim() != "" && this.state.save.trim() != "") {
            let cktObj = this.state.checkoutObj;
            let locAddr = this.state.locAddr;
            locAddr.houseNo = this.state.houseno;
            locAddr.streetName = this.state.street;
            locAddr.landmark = this.state.landmark;
            let formValue = { houseNo: this.state.houseno, streetName: this.state.street, landmark: this.state.landmark, locCode: this.state.locAddr.locCode, cityCode: this.state.locAddr.cityCode, pincode: this.state.locAddr.pincode, type: this.state.locAddr.type, latLng: this.state.locAddr.latLng, uuid: this.state.checkoutObj.uuid, addrId: locAddr.id };
            console.log("formValue: ", formValue);
            fetch(BASE_PATH + Global.SAVE_USER_ADDRESS_URL, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formValue)
            }).then((response) => response.json()).then((responseJson) => {
                console.log("saveAddress response: ", responseJson);
                if (responseJson.Success == "Y") {
                    ToastAndroid.show("Address saved successfully", ToastAndroid.SHORT);
                    locAddr['id'] = responseJson.Id;
                    cktObj.deliveryAddressId = responseJson.Id;
                    this.setState({ visibleModal: null, locAddr: locAddr, checkoutObj: cktObj });
                    this.storeItem("Address", locAddr);
                }
                else {
                    ToastAndroid.show(responseJson.Message, ToastAndroid.SHORT);
                }
            }).catch((error) => {
                console.log("Error Save Address: ", error);
                ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            });
        }
    }

    fetchSavedAddress = () => {
        console.log("CartScreen fetchSavedAddress()");
        this.setState({ visibleModal: 8 });
        if (this.state.savedAddress.length < 1) {
            this.setState({ fetchAddressLoader: true });
            let formValue = { uuid: this.state.checkoutObj.uuid };
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
                    for (let i = 0; i < responseJson.SavedAddress.length; i++) {
                        responseJson.SavedAddress[i].Selected = false;
                    }
                    this.setState({ savedAddress: responseJson.SavedAddress });
                }
                else {
                    ToastAndroid.show(responseJson.Message, ToastAndroid.SHORT);
                    this.setState({ visibleModal: null });
                }
                this.setState({ fetchAddressLoader: false });
            }).catch((error) => {
                console.log("Error Fetch Saved Address: ", error);
                ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            });
        }
    }

    selectDeliveryAddress = (item) => {
        console.log("CartScreen selectDeliveryAddress() item: ", item);
        let savedAddr = this.state.savedAddress;
        let idx = savedAddr.indexOf(item);
        console.log("Address Index found: ", idx);
        if (idx > -1) {
            for (let i = 0; i < savedAddr.length; i++) {
                savedAddr[i].Selected = (i == idx);
            }
            this.setState({ savedAddress: savedAddr });
        }
    }

    changeDeliveryAddress = () => {
        console.log("CartScreen changeDeliveryAddress()");
        let savedAddr = this.state.savedAddress;
        let selAddr = {};
        for (let i = 0; i < savedAddr.length; i++) {
            if (savedAddr[i].Selected) {
                selAddr = savedAddr[i];
                break;
            }
        }
        console.log("SelectedAddress: ", selAddr);
        if (!this.isEmptyObject(selAddr)) {
            let cktObj = this.state.checkoutObj;
            let locAddr = this.state.locAddr;
            locAddr.id = selAddr.Id;
            locAddr.houseNo = selAddr.HouseNo;
            locAddr.streetName = selAddr.StreetName;
            locAddr.landmark = selAddr.Landmark;
            locAddr.cityCode = selAddr.CityCode;
            locAddr.cityName = selAddr.City;
            locAddr.latLng = selAddr.GeoLoc;
            locAddr.locCode = selAddr.LocalityCode;
            locAddr.locName = selAddr.Locality;
            locAddr.pincode = selAddr.Pincode;
            locAddr.type = selAddr.Type;
            cktObj.deliveryAddressId = locAddr.id;
            this.setState({ locAddr: locAddr, fetchAddressLoader: true, visibleModal: null, checkoutObj: cktObj }, () => { this.checkCartProductsAvailability() });
            this.storeItem("Address", locAddr);
            ToastAndroid.show("Delivery address changed successfully.", ToastAndroid.SHORT);
        }
        else {
            ToastAndroid.show("There was some problem in changing delivery address. Try again", ToastAndroid.SHORT);
        }
    }

    fetchAvailableCoupons = () => {
        console.log("CartScreen fetchAvailableCoupons()");
        this.setState({ visibleModal: 7, noCoupon: false });
        if (this.state.couponList.length < 1) {
            this.setState({ couponLoader: true });
            let formValue = { uuid: this.state.checkoutObj.uuid, reqFrom: "APP", locCode: this.state.locAddr.locCode };
            console.log("FormValue: ", formValue);
            fetch(BASE_PATH + Global.FETCH_COUPONS_URL, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formValue)
            }).then((response) => response.json()).then((responseJson) => {
                console.log("fetchCoupons response: ", responseJson);
                if (responseJson.Success == "Y") {
                    for (let i = 0; i < responseJson.Data.length; i++) {
                        responseJson.Data[i].Selected = false;
                    }
                    this.setState({ couponList: responseJson.Data });
                }
                else {
                    //ToastAndroid.show("No coupons available for you now.", ToastAndroid.SHORT);
                    this.setState({ noCoupon: true })
                }
                this.setState({ couponLoader: false, });
            }).catch((error) => {
                console.log("Error Fetch Available Coupons: ", error);
                ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            });
        }
    }

    getOfferAmountDisplay(item) {
        let str = "Get ";
        if (item.OfferType == "PERCENT") {
            str += item.OfferAmount + "% OFF";
        }
        else if (item.OfferType == "AMOUNT") {
            str += "₹" + item.OfferAmount + "/- OFF";
        }
        else if (item.OfferType == "CASHBACK") {
            str += "₹" + item.OfferAmount + "/- cashback";
        }
        return str;
    }

    selectCoupon = (item) => {
        this.setState({ bestOffer: false })
        console.log("CartScreen selectCoupon() item: ", item);
        let couponArr = this.state.couponList;
        let idx = couponArr.indexOf(item);
        console.log("Coupon Index found: ", idx);
        if (idx > -1) {
            let couponSaveAmount = 0;
            let msg = "";
            let minimumCartValue = eval(couponArr[idx].OfferMinCartVal);
            let maxDiscount = eval(couponArr[idx].OfferMaxDiscount);
            let couponUsesCount = eval(couponArr[idx].OfferCodeUseCount);
            let couponUsedCount = eval(couponArr[idx].OfferCodeUsedCount);
            let newUserFlag = couponArr[idx].OfferNewUser;
            let orderCount = eval(couponArr[idx].OrderCount);
            let offerAmount = eval(couponArr[idx].OfferAmount);
            let cartTotal = this.state.checkoutObj.itemTotal + this.state.checkoutObj.packCharge;
            if (newUserFlag == "YES") {
                if (orderCount < 1) {
                    if (couponUsedCount < couponUsesCount) {
                        if (cartTotal >= minimumCartValue) {
                            if (couponArr[idx].OfferType == "AMOUNT") {
                                couponSaveAmount = offerAmount;
                            }
                            else if (couponArr[idx].OfferType == "PERCENT") {
                                let percentAmt = ((offerAmount / 100) * cartTotal);
                                percentAmt = (percentAmt > maxDiscount) ? maxDiscount : percentAmt;
                                couponSaveAmount = percentAmt;
                            }
                        }
                        else {
                            msg = "Minimum cart value must be ₹" + minimumCartValue.toFixed(2) + "/- to avail this offer";
                        }
                    }
                    else {
                        msg = "You have already used the coupon " + couponUsesCount + " time(s)";
                    }
                }
                else {
                    msg = "This coupon is for new users";
                }
            }
            else if (newUserFlag == "NO") {
                if (couponUsedCount < couponUsesCount) {
                    if (cartTotal >= minimumCartValue) {
                        if (couponArr[idx].OfferType == "AMOUNT") {
                            couponSaveAmount = offerAmount;
                        }
                        else if (couponArr[idx].OfferType == "PERCENT") {
                            let percentAmt = ((offerAmount / 100) * cartTotal);
                            percentAmt = (percentAmt > maxDiscount) ? maxDiscount : percentAmt;
                            couponSaveAmount = percentAmt;
                        }
                    }
                    else {
                        msg = "Minimum cart value must be ₹" + minimumCartValue.toFixed(2) + "/- to avail this offer";
                    }
                }
                else {
                    msg = "You have already used the coupon " + couponUsesCount + " time(s)";
                }
            }
            for (let i = 0; i < couponArr.length; i++) {
                couponArr[i].Selected = (i == idx);
            }
            if (couponSaveAmount < eval(this.state.checkoutObj.offersDiscount)) {
                this.setState({ bestOffer: true })
            }
            this.setState({ couponList: couponArr, couponSaveAmount: couponSaveAmount });
            if (msg != "") {
                ToastAndroid.show(msg, ToastAndroid.SHORT);
            }
        }
    }

    applyCoupon = () => {
        console.log("CartScreen applyCoupon: ");
        let couponArr = this.state.couponList;
        let selCoupon = {};
        for (let i = 0; i < couponArr.length; i++) {
            if (couponArr[i].Selected) {
                selCoupon = couponArr[i];
                break;
            }
        }
        console.log("SelectedCoupon: ", selCoupon);
        let msg = "";
        if (!this.isEmptyObject(selCoupon)) {
            let cktObj = this.state.checkoutObj;
            let minimumCartValue = eval(selCoupon.OfferMinCartVal);
            let maxDiscount = eval(selCoupon.OfferMaxDiscount);
            let couponUsesCount = eval(selCoupon.OfferCodeUseCount);
            let couponUsedCount = eval(selCoupon.OfferCodeUsedCount);
            let newUserFlag = selCoupon.OfferNewUser;
            let orderCount = eval(selCoupon.OrderCount);
            let offerAmount = eval(selCoupon.OfferAmount);
            let cartTotal = this.state.checkoutObj.itemTotal + this.state.checkoutObj.packCharge;
            if (newUserFlag == "YES") {
                if (orderCount < 1) {
                    if (couponUsedCount < couponUsesCount) {
                        if (cartTotal >= minimumCartValue) {
                            if (selCoupon.OfferType == "AMOUNT") {
                                cktObj.couponDiscount = offerAmount;
                            }
                            else if (selCoupon.OfferType == "PERCENT") {
                                let percentAmt = ((offerAmount / 100) * cartTotal);
                                percentAmt = (percentAmt > maxDiscount) ? maxDiscount : percentAmt;
                                cktObj.couponDiscount = percentAmt;
                            }
                            cktObj.appliedCoupon = selCoupon.OfferCode;
                            this.setState({ visibleModal: null, checkoutObj: cktObj }, () => { this.calcCheckout(); });
                            msg = "Coupon Applied Successfully";
                        }
                        else {
                            msg = "Minimum cart value must be ₹" + minimumCartValue.toFixed(2) + "/- to avail this offer";
                        }
                    }
                    else {
                        msg = "You have already used the coupon " + couponUsesCount + " time(s)";
                    }
                }
                else {
                    msg = "This coupon is for new users";
                }
            }
            else if (newUserFlag == "NO") {
                if (couponUsedCount < couponUsesCount) {
                    if (cartTotal >= minimumCartValue) {
                        if (selCoupon.OfferType == "AMOUNT") {
                            cktObj.couponDiscount = offerAmount;
                        }
                        else if (selCoupon.OfferType == "PERCENT") {
                            let percentAmt = ((offerAmount / 100) * cartTotal);
                            percentAmt = (percentAmt > maxDiscount) ? maxDiscount : percentAmt;
                            cktObj.couponDiscount = percentAmt;
                        }
                        cktObj.appliedCoupon = selCoupon.OfferCode;
                        this.setState({ visibleModal: null, checkoutObj: cktObj }, () => { this.calcCheckout(); });
                        msg = "Coupon Applied Successfully";
                    }
                    else {
                        msg = "Minimum cart value must be ₹" + minimumCartValue.toFixed(2) + "/- to avail this offer";
                    }
                }
                else {
                    msg = "You have already used the coupon " + couponUsesCount + " time(s)";
                }
            }
        }
        if (msg != "") {
            ToastAndroid.show(msg, ToastAndroid.SHORT);
        }
    }

    clearCoupon() {
        let cktObj = this.state.checkoutObj;
        let couponArr = this.state.couponList;
        for (let i = 0; i < couponArr.length; i++) {
            couponArr.Selected = false;
        }
        cktObj.appliedCoupon = "";
        cktObj.couponDiscount = 0;
        this.setState({ checkoutObj: cktObj, couponList: couponArr }, () => { this.calcCheckout(); });
    }

    setSpecialInstr = (instr) => {
        console.log("CartScreeen setSpecialInstr() instr: ", instr);
        let cktObj = this.state.checkoutObj;
        cktObj.instructions = instr;
        this.setState({ checkoutObj: cktObj });
    }

    login = () => {
        console.log("CartScreen login()");
        this.props.navigation.navigate('Login', { navigatedFrom: "CART" });
    }

    proceedToPay = () => {
        console.log("CartScreen proceedToPay()");
        let cktObj = this.state.checkoutObj;
        cktObj.locCode = this.state.locAddr.locCode;
        cktObj.cityCode = this.state.locAddr.cityCode;
        this.setState({ checkoutObj: cktObj }, () => {
            console.log("checkoutObj: ", this.state.checkoutObj);
            this.props.navigation.navigate('Payment', { checkoutObj: this.state.checkoutObj, payableAmount: this.state.checkoutObj.netPayable });
        });

    }

    _keyboardDidShow = (event) => {
        console.log("LoginScreen _keyboardDidSchow() :");
        const keyboardHeight = event.endCoordinates.height;
        // this.ScrollView.scrollToEnd({ animated: true });
        console.log("KeyboardHeight : ", keyboardHeight)
        this.setState({ change: keyboardHeight })
    }
    _keyboardDidHide = () => {
        console.log("LoginScreen _keyboardDidHide() :");
        this.setState({ change: 0 })
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }


    componentWillMount() {
        console.log("CartScreen componentWillMount");
        // await Expo.Font.loadAsync({
        //     'Roboto': require('native-base/Fonts/Roboto.ttf'),
        //     'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
        //     'MyriadPro': require('../assets/fonts/MyriadPro-Regular.otf'),
        // });
    }

    componentDidMount() {
        console.log("CartScreen componentDidMount");
        // this.storeItem("ResumeScreen", "Cart");
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
        this.props.navigation.addListener('didFocus', () => {
            console.log("didFocus called()");
            this.getUserData();
            this.getLocation();
        });
    }
    __renderCouponContent = () => (
        <View style={styles.modalContainer}>
            <View style={[styles.mainHeaderContainer, {
                padding: 10,
                height: 50,
            }]}>
                <TouchableOpacity onPress={() => { this.setState({ visibleModal: null }) }} style={{ padding: 5 }}>
                    <Icon style={{ color: '#4286f4', fontSize: 20 }} name='arrow-back' />
                </TouchableOpacity>
                <Text style={{ alignSelf: 'center' }}>Available Coupons</Text>
            </View>
            <Display enable={!this.state.couponLoader && this.state.checkoutObj.appliedCoupon == '' && this.state.couponList.length > 0} style={styles.body}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View>
                        <Display enable={this.state.bestOffer} style={{ padding: 3 }}
                            enterDuration={70}
                            exitDuration={20}
                            exit="fadeOutRight"
                            enter="fadeInLeft"
                        >
                            <View style={{ borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderRadius: 4 }}>
                                <View style={{ height: 10, backgroundColor: '#f4dd0c', width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
                                </View>
                                <View style={{ flexDirection: 'row', flex: 4, }}>
                                    <View style={{ flex: 2, backgroundColor: '#1929d6', justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: 4, }}>
                                        <View>
                                            <Icon name={'ios-information-circle'} style={{ color: '#f4dd0c', fontSize: 30 }} />
                                        </View>
                                    </View>
                                    <View style={{ flex: 8, backgroundColor: '#70abef', padding: 5, borderBottomRightRadius: 4 }}>
                                        <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>BEST OFFER APPLIED! </Text>
                                        <Text>You are already saving  ₹ <Text style={{ color: '#fff', fontSize: 20, fontWeight: '400' }}>{this.state.checkoutObj.offersDiscount}</Text></Text>
                                    </View>
                                </View>
                            </View>
                        </Display>
                        <Content>
                            {this.state.couponList.map((item, index) => (
                                <ListItem
                                    selected={item.Selected}
                                    onPress={this.selectCoupon.bind(this, item)}
                                    key={index}>
                                    <Text style={styles.couponCode}>{item.OfferCode}</Text>
                                    <Left style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ alignSelf: 'flex-start', }}>{this.getOfferAmountDisplay(item)}</Text>
                                        <Text style={{ fontSize: 8, alignSelf: 'flex-start' }}>{item.OfferDesc}</Text>
                                    </Left>
                                    <Right>
                                        <Radio
                                            onPress={this.selectCoupon.bind(this, item)}
                                            color={"#222222"}
                                            selectedColor={"#2dbe60"}
                                            selected={item.Selected}
                                        />
                                    </Right>
                                </ListItem>
                            ))}
                        </Content>
                    </View>
                </ScrollView>
            </Display>
            {console.log('noCouponState : ', this.state.noCoupon)}
            <Display enable={this.state.noCoupon} style={[styles.body, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }]}>
                <Image source={require('../assets/nooffers.png')} style={{ width: 150, height: 150, backgroundColor: 'red' }} resizeMode={'contain'} />
                <Text style={{ marginTop: 6, fontSize: 14, color: '#5b5858' }}>Currently there are no coupons available for you.</Text>
            </Display>
            <Display enable={this.state.couponLoader} style={{ justifyContent: 'center', alignItems: 'center', flex: 7 }}>
                <ActivityIndicator size='large' color='red' />
            </Display>
            <Display enable={this.state.checkoutObj.appliedCoupon != ''} style={{ justifyContent: 'center', alignItems: 'center', flex: 7 }}>
                <Image source={require('../assets/fireworks.png')} style={{ width: 60, height: 60 }} />
                <Text>Coupon Applied Successfully</Text>
                <Text>You saved ₹{this.state.checkoutObj.couponDiscount}</Text>
            </Display>
            <View style={styles.applyCouponButton}>
                {/* <Text>{this.state.custProd.itemCustomization}</Text> */}
                <TouchableOpacity onPress={this.applyCoupon.bind(this)} disabled={this.state.noCoupon}>
                    <View style={{ padding: 15, backgroundColor: '#2dbe60', marginTop: 0 }} opacity={this.state.noCoupon === true ? .7 : 1}>
                        <Display style={{ flexDirection: 'row' }} enable={this.state.checkoutObj.appliedCoupon == ''}>
                            <View style={{ flex: 1 }}>
                                <Display enable={this.state.couponSaveAmount > 0}>
                                    <Text style={styles.textWhite}>You will save ₹{this.state.couponSaveAmount}</Text>

                                </Display>
                            </View>
                            <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
                                <Text style={[styles.textWhite, styles.textBig]}>APPLY</Text>
                            </View>
                        </Display>
                        {/* <Display style={{ flexDirection: 'row' }} enable={this.state.couponLoader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.textWhite}>Applying coupon</Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <ActivityIndicator size='small' color="white" />
                            </View>
                        </Display> */}
                    </View>

                    {/* <View style={{ height: 15 }}>
          {this._renderButton('', 'close', '#555', () => this.setState({ visibleModal: null }))}
        </View> */}
                </TouchableOpacity>
            </View>
        </View>
    )
    __renderAddressContent = () => (
        <View style={styles.modalContainer}>
            <View style={[styles.mainHeaderContainer, {
                flexDirection: 'row', padding: 10,
                height: 50,
            }]}>
                <TouchableOpacity onPress={() => { this.setState({ visibleModal: null }) }} style={{ padding: 5 }}>
                    <Icon style={{ color: '#4286f4', fontSize: 20 }} name='arrow-back' />
                </TouchableOpacity>
                <Text style={{ alignSelf: 'center' }}>Saved Addresses</Text>
            </View>
            <Display enable={!this.state.fetchAddressLoader && this.state.savedAddress.length > 0} style={styles.body}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                >
                    <View>
                        <Content>
                            {
                                this.state.savedAddress.map((item, index) => (
                                    <ListItem selected={item.Selected}
                                        onPress={this.selectDeliveryAddress.bind(this, item)} key={index}>
                                        <View style={styles.addressType}>
                                            <TabIcon size={16} iconDefault={item.Type == 'HOME' ? 'ios-home-outline' : (item.Type == 'OFFICE' ? 'ios-briefcase-outline' : 'ios-cube-outline')} />
                                        </View>
                                        <Left style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ alignSelf: 'flex-start' }}>{item.Locality}</Text>
                                            <Text style={{ fontSize: 8, alignSelf: 'flex-start' }}>{item.FormattedAddress}</Text>
                                        </Left>
                                        <Right>
                                            <Radio
                                                color={"#222222"}
                                                selectedColor={"#2dbe60"}
                                                selected={item.Selected}
                                                onPress={this.selectDeliveryAddress.bind(this, item)}
                                            />
                                        </Right>
                                    </ListItem>
                                ))
                            }
                        </Content>
                    </View>
                </ScrollView>
            </Display>
            <Display enable={this.state.fetchAddressLoader} style={{ justifyContent: 'center', alignItems: 'center', flex: 7 }}>
                <ActivityIndicator size='large' color='red' />
            </Display>
            <View style={{ width: '100%' }}>
                {/* <Text>{this.state.custProd.itemCustomization}</Text> */}
                <TouchableOpacity style={{ padding: 15, backgroundColor: '#2dbe60', marginTop: 0, justifyContent: 'center', alignItems: 'center' }} onPress={this.changeDeliveryAddress.bind(this)}>
                    <Text style={[styles.textWhite, styles.textBig]}>Deliver Here</Text>
                </TouchableOpacity>
            </View>
            {/* {
                this.state.savedAddress.length > 0 ?
                     : ""
            } */}

        </View>
    )
    __renderNewAddressContent = () => (
        <View style={[styles.modalContainer, styles.autoHeight]}>
            <View style={[styles.mainHeaderContainer, {
                flexDirection: 'row', padding: 10,
                height: 50,
            }]}>
                <TouchableOpacity onPress={() => { this.setState({ visibleModal: null }) }} style={{ padding: 5 }}>
                    <Icon style={{ color: '#4286f4', fontSize: 20 }} name='arrow-back' />
                </TouchableOpacity>
                <Text style={{ alignSelf: 'center' }}>Modify Address</Text>
            </View>
            <Display enable={true} style={styles.body}>
                <View style={{ flex: 1 }} >
                    <View style={{ flex: 1, paddingHorizontal: 10 }}>
                        <View style={{ marginTop: 10 }}>
                            <Text style={{ fontSize: 10, color: '#9b9ba2' }}>LOCATION </Text>
                            <TextInput
                                style={{ marginTop: 0, paddingBottom: 10 }}
                                value={this.getFormattedAddress(this.state.locAddr)}
                                multiline={true}
                                editable={false}
                                placeholderTextColor="#fff"
                                underlineColorAndroid='#a09d9d'
                                ref={component => this._phoneInput = component}
                            />
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TextField
                                label="HOUSE/FLAT NO."
                                value={this.state.houseno}
                                placeholderTextColor="#fff"
                                underlineColorAndroid='transparent'
                                returnKeyType="next"
                                keyboardType="default"
                                autoCorrect={false}
                                autoCapitalize='none'
                                onChangeText={houseno => this.getHouseFunction(houseno)}
                                onSubmitEditing={() => { this.streetName.focus(); }}
                                ref={input => this.houseNo = input}
                            />

                            <TextField
                                label="STREET NAME"
                                value={this.state.street}
                                placeholderTextColor="#fff"
                                underlineColorAndroid='transparent'
                                returnKeyType="next"
                                keyboardType="default"
                                autoCorrect={false}
                                autoCapitalize='none'
                                onChangeText={streetname => this.getStreetName(streetname)}
                                onSubmitEditing={() => { this.landMark.focus(); }}
                                ref={(input) => { this.streetName = input; }}
                            />

                            <TextField
                                label="LANDMARK"
                                value={this.state.landmark}
                                placeholderTextColor="#fff"
                                underlineColorAndroid='transparent'
                                returnKeyType="next"
                                keyboardType="default"
                                autoCorrect={false}
                                autoCapitalize='none'
                                onChangeText={landmark => this.getLandmarkFunction(landmark)}
                                ref={(input) => { this.landMark = input; }}
                            />
                            <Text style={{ fontSize: 8, color: '#9b9ba2' }}>SAVE AS</Text>
                            <View style={{ flexDirection: 'row', paddingTop: 5 }}>
                                <TouchableOpacity onPress={this.saveas.bind(this, "HOME")} style={{ justifyContent: 'center', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TabIcon
                                            iconDefault='ios-home-outline'
                                            size={16}
                                            opacity={.6}
                                        /><Text style={{ fontSize: 16, color: (this.state.save == "HOME") ? '#000' : '#b3b3b5', marginBottom: 2, marginLeft: 2 }}>Home</Text>
                                    </View>
                                </TouchableOpacity >
                                <TouchableOpacity onPress={this.saveas.bind(this, "OFFICE")}>
                                    <View style={{ flexDirection: 'row', marginLeft: 60, marginRight: 60 }}>
                                        <TabIcon size={16} iconDefault='ios-briefcase-outline' /><Text style={{ fontSize: 16, color: (this.state.save == "OFFICE") ? '#000' : '#b3b3b5', marginBottom: 2, marginLeft: 2 }}>Office</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.saveas.bind(this, "OTHERS")}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TabIcon size={16} iconDefault='ios-cube-outline' /><Text style={{ fontSize: 16, color: (this.state.save == "OTHERS") ? '#000' : '#b3b3b5', marginBottom: 2, marginLeft: 2 }}>Other</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                    </View>
                    <TouchableOpacity onPress={this.saveAddress.bind(this)} style={{ opacity: (this.state.addrBtnDisabled ? .7 : 1) }}>
                        <View style={styles.lowerContainer}>
                            <View style={{ backgroundColor: '#cd2121', height: 50, width: Dimensions.get('window').width, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>{this.state.addrBtnText}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </Display>
            <Display enable={false} style={{ justifyContent: 'center', alignItems: 'center', flex: 7 }}>
                <ActivityIndicator size='large' color='red' />
            </Display>
        </View>
    )

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
        console.log("CartScreen: ", this.state.checkoutObj);
        return (
            <ScrollView contentContainerStyle={[styles.mainContainer, { marginTop: -this.state.change }]}
                keyboardShouldPersistTaps={'always'}
            >
                <Header style={styles.mainHeaderContainer}>
                    <Left>
                        <Button transparent onPress={() => { this.props.navigation.goBack(null) }}>
                            <Icon style={{ color: '#4286f4' }} name='arrow-back' />
                        </Button>
                    </Left>
                    <Body>
                        <Title style={{ color: '#666', marginLeft: 0 }}>Your Cart</Title>
                    </Body>
                    <Right>
                        <Display enable={this.state.checkoutObj.items.length > 0}>
                            <Button transparent onPress={this.emptyCart.bind(this)}>
                                <Icon style={{ color: '#4286f4' }} name='md-trash' />
                            </Button>
                        </Display>
                    </Right>
                </Header>
                <Display enable={true} style={{ flex: 1 }}>
                    <ScrollView style={{ flex: 9 }}>
                        <Display enable={this.state.checkoutObj.cartType == "R"}>
                            {/* Restaurant type products */}
                            {
                                this.state.checkoutObj.restItems.map((item, index) => (
                                    <View style={styles.cartContainer} key={index}>
                                        <Display enable={true} style={{ flex: 1, padding: 10 }}>
                                            <View style={{ flexDirection: 'row' }}>
                                                {/* Veg and Non veg Here */}
                                                <Display enable={item.ProductVeganType == "NON-VEG"} style={{ justifyContent: 'center' }}>
                                                    <View style={{ borderColor: '#cd2121', width: 16, height: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                        <View style={{ backgroundColor: '#cd2121', borderRadius: 10, width: 8, height: 8 }} ></View>
                                                    </View>
                                                </Display>
                                                <Display enable={item.ProductVeganType == "VEG"} style={{ justifyContent: 'center' }}>
                                                    <View style={{ borderColor: 'green', width: 16, height: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                        <View style={{ backgroundColor: 'green', borderRadius: 10, width: 8, height: 8 }} ></View>
                                                    </View>
                                                </Display>

                                                <View style={{ flexDirection: 'column', padding: 0, paddingLeft: 5, opacity: (!true ? .3 : 1), flex: 2 }}>
                                                    <Text style={{ fontSize: 16, color: '#262626' }}>{item.ProductName}</Text>
                                                    <Display enable={((!this.isEmptyObject(item.Variant)) || (item.Addons.length > 0))}>
                                                        <Text style={{ color: "#555656", fontSize: 12, fontWeight: 'bold' }}>
                                                            {(!this.isEmptyObject(item)) ? item.Variant.Name : ""}
                                                            {(!this.isEmptyObject(item) && item.Addons.length > 0) ? " | " : ""}
                                                            {
                                                                item.Addons.map((adn, idx) => (
                                                                    adn.Name + ", "
                                                                ))
                                                            }
                                                        </Text>
                                                    </Display>
                                                    <Display enable={this.state.checkoutObj.appliedCoupon !== ""}>
                                                        <Text style={styles.textBig}>₹ {item.ProductPrice}</Text>
                                                    </Display>
                                                    <Display enable={!(this.state.checkoutObj.appliedCoupon !== "")} style={{ flexDirection: 'row' }}>
                                                        <Display enable={eval(item.ProductPrice) != eval(this.getItemPrice(item))} style={{ alignSelf: 'flex-end', paddingRight: 5 }}>
                                                            <Text style={{ fontSize: 14, textDecorationLine: 'line-through' }}>₹ {item.ProductPrice}
                                                            </Text>
                                                        </Display>
                                                        <Text style={styles.textBig}>₹ {this.getItemPrice(item)}
                                                        </Text>

                                                    </Display>

                                                </View>
                                                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                                    <Display enable={item.Addable} style={{ borderWidth: 1, borderColor: "#2dbe60", backgroundColor: "#2dbe60", justifyContent: 'center', alignItems: 'center', width: 100, height: 20, borderRadius: 1 }}>
                                                        <View style={{ flex: 1, flexDirection: 'row', }}>
                                                            <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={this.updateCart.bind(this, item, "REM")}>
                                                                <Text style={{ color: "#fff", fontSize: 18, fontWeight: 'bold' }}>-</Text>
                                                            </TouchableOpacity>
                                                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                                                <Text style={{ color: "#555", fontSize: 12, fontWeight: 'bold' }}>{item.Qty}</Text>
                                                            </View>
                                                            <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={this.updateCart.bind(this, item, "ADD")}>
                                                                <Text style={{ color: "#fff", fontSize: 18, fontWeight: 'bold' }}>+</Text>
                                                            </TouchableOpacity>
                                                        </View>

                                                    </Display>
                                                    <Display enable={!item.Addable} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Text style={{ color: "#555", fontSize: 12, fontWeight: 'bold' }}>Not available now</Text>
                                                        <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={this.removeItemFromCart.bind(this, item)}>
                                                            <Icon style={{ color: '#F93943', fontSize: 18 }} name='ios-remove-circle' />
                                                        </TouchableOpacity>
                                                    </Display>
                                                </View>
                                            </View>
                                        </Display>
                                    </View>
                                ))
                            }
                        </Display>
                        <Display enable={this.state.checkoutObj.cartType == "B"}>
                            <View style={{ flexDirection: 'row', padding: 5 }}>
                                <Icon name={'ios-information-circle'} style={{ color: '#F93943', fontSize: 16 }} />
                                <Text style={{ marginLeft: 5 }}>Multiple orders will be created for different days and slots.</Text>
                            </View>
                            {
                                this.state.checkoutObj.bawItems.map((item, index) => (
                                    <View style={styles.cartContainer} key={index}>
                                        <View style={styles.kitchenNameHeader}>
                                            {this.changeDayFormat(item.SelectedDay)}
                                            <TouchableOpacity onPress={this.removeChefFromCart.bind(this, item)}>
                                                <Icon style={{ color: '#F93943', fontSize: 18 }} name='md-trash' />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={styles.bawarchiItemsContainer}>
                                            {
                                                item.OrderedProducts.map((itm, idx) => (
                                                    <View style={{ flexDirection: 'row', borderBottomColor: '#fff', borderBottomWidth: 1 }} key={idx}>
                                                        {/* Veg and Non veg Here */}
                                                        {/* <Display enable={true} style={{ padding: 12, paddingRight: 0 }}>
                                                    <View style={{ borderColor: '#008000', width: 16, height: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                        <View style={{ backgroundColor: '#008000', borderRadius: 10, width: 8, height: 8 }} ></View>
                                                    </View>
                                                </Display>
                                                <Display enable={false} style={{ justifyContent: 'center' }}>
                                                    <View style={{ borderColor: '#cd2121', width: 10, height: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                        <View style={{ backgroundColor: '#cd2121', borderRadius: 10, width: 6, height: 6 }} ></View>
                                                    </View>
                                                </Display> */}
                                                        <View style={{ flexDirection: 'column', padding: 10, opacity: (!true ? .3 : 1), flex: 2 }}>
                                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('ChefDetail', { chefId: itm.VId, chefProfileName: itm.ChefProfileName })} style={{ flex: 1 }}>
                                                                <Text style={{ fontSize: 12, color: '#4286f4' }}>{itm.ChefKitchenName}</Text>
                                                            </TouchableOpacity>
                                                            <Text style={{ fontSize: 16, color: '#262626' }}>{itm.ProductName}</Text>
                                                            <Text style={{ fontSize: 10, color: '#838787' }}>{itm.ProductDescription}</Text>
                                                            {/* <Text style={{ color: "#555656", fontSize: 12, fontWeight: 'bold' }}>2Pcs | Pudina Chutney </Text> */}
                                                            <View style={{ flexDirection: 'row' }}>
                                                                <Text style={{ textDecorationLine: 'line-through', fontSize: 12, alignSelf: 'flex-end', marginRight: 3 }}>₹ {itm.ProductPrice}</Text>
                                                                <Text>₹ {itm.OfferPrice}</Text>
                                                            </View>
                                                            <View style={{ borderColor: '#ebebeb', borderWidth: 1, padding: 4, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 2 }}>
                                                                <Text>{itm.SelectedTimeSlot}</Text>
                                                            </View>


                                                        </View>
                                                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                                            <View style={{ borderWidth: 1, borderColor: "#2dbe60", backgroundColor: "#2dbe60", justifyContent: 'center', alignItems: 'center', width: 100, height: 20, borderRadius: 1 }}>
                                                                <Display enable={itm.Addable} style={{ flex: 1, flexDirection: 'row', }}>
                                                                    <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={this.updateChefCart.bind(this, itm, item, "REM")}>
                                                                        <Text style={{ color: "#fff", fontSize: 18, fontWeight: 'bold' }}>-</Text>
                                                                    </TouchableOpacity>
                                                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                                                        <Text style={{ color: "#555", fontSize: 12, fontWeight: 'bold' }}>{itm.Qty}</Text>
                                                                    </View>
                                                                    <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={this.updateChefCart.bind(this, itm, item, "ADD")}>
                                                                        <Text style={{ color: "#fff", fontSize: 18, fontWeight: 'bold' }}>+</Text>
                                                                    </TouchableOpacity>
                                                                </Display>
                                                                <Display enable={!itm.Addable && itm.UiMsg == ''} style={{ flex: 1, flexDirection: 'row', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                                                                    <Text style={{ color: "#555", fontSize: 12, fontWeight: 'bold' }}>Not available now</Text>
                                                                    <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={this.removeItemFromChefCart.bind(this, itm, item)}>
                                                                        <Icon style={{ color: '#F93943', fontSize: 18 }} name='ios-remove-circle' />
                                                                    </TouchableOpacity>
                                                                </Display>
                                                                <Display enable={!itm.Addable && itm.UiMsg != ''} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                                                                    <Text style={{ color: "#555", fontSize: 8, fontWeight: 'bold' }}>Only {itm.UiMsg}</Text>
                                                                    <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={this.reduceQtyFromChefCart.bind(this, itm, item)}>
                                                                        <Icon style={{ color: '#F93943', fontSize: 18, marginLeft: 2 }} name='ios-remove-circle' />
                                                                    </TouchableOpacity>
                                                                </Display>
                                                            </View>
                                                        </View>
                                                    </View>
                                                ))
                                            }
                                        </View>
                                    </View>
                                ))
                            }
                        </Display>
                        {/* Apply Coupon */}
                        <Display enable={this.state.applyCouponDisplay}>
                            <View style={styles.cardCoupon}>
                                <Icon style={{ color: '#F93943', fontSize: 45 }} name='md-megaphone' />
                                <Display enable={this.state.checkoutObj.appliedCoupon == ""} style={{ width: '100%', flex: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <TouchableOpacity style={{ width: '100%', flex: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={this.fetchAvailableCoupons.bind(this)}>
                                        <Text style={{ color: '#666', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 10 }}>Available Coupons</Text>
                                        <Icon style={{ color: '#666' }} name='arrow-forward' />
                                    </TouchableOpacity>
                                </Display>
                                <Display enable={this.state.checkoutObj.appliedCoupon != ""} style={{ width: '100%', flex: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ width: '100%', flex: 6, justifyContent: 'flex-start', flexDirection: 'row' }}>
                                        <View>
                                            <Text style={{ color: '#666', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 10 }}>{this.state.checkoutObj.appliedCoupon}</Text>
                                            <Text style={{ color: '#666', fontSize: 12, paddingHorizontal: 10 }}>Coupon applied</Text>
                                        </View>
                                        <View style={{ padding: 5, borderRadius: 10, backgroundColor: '#2dbe60', height: 20, width: 20, justifyContent: 'center', alignItems: 'center' }}>
                                            <Icon style={{ color: '#fff', fontSize: 25, fontWeight: 'bold', }} name='ios-checkmark' />
                                        </View>
                                    </View>
                                    <Icon style={{ color: '#666', fontSize: 18, fontWeight: 'bold', marginRight: 10 }} name='close' onPress={this.clearCoupon.bind(this)} />
                                </Display>
                            </View>
                        </Display>
                        <Display enable={!this.state.applyCouponDisplay}>
                            <View style={styles.cardCoupon}>
                                <Icon style={{ color: '#F93943', fontSize: 45 }} name='md-megaphone' />
                                <Display enable={true} style={{ width: '100%', flex: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ width: '100%', flex: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ color: '#666', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 10 }}>Login for coupons</Text>
                                        <Icon style={{ color: '#666' }} name='arrow-forward' />
                                    </View>
                                </Display>
                            </View>
                        </Display>
                        <Modal isVisible={this.state.visibleModal === 7} style={styles.bottomModal} onBackButtonPress={() => this.setState({ visibleModal: null })}>
                            {this.__renderCouponContent()}
                        </Modal>
                        {/* Address Container */}
                        <View style={styles.cardAddress}>
                            <View style={{ flex: 1, flexDirection: 'row', padding: 5 }}>
                                {/* <Image source={require('../assets/marker.png')} style={{ height: 45, width: 45, padding: 5 }} /> */}
                                <Icon style={{ color: '#F93943', fontSize: 45 }} name='ios-pin' />
                                <View style={{ width: '100%', flex: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ width: '100%', flex: 6, flexDirection: 'column', justifyContent: 'flex-start' }}>
                                        <Text style={{ color: '#666', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 10 }}>Delivering To:</Text>
                                        <Text style={{ color: '#666', fontSize: 12, paddingHorizontal: 10 }}>{this.getFormattedAddress(this.state.locAddr)}</Text>

                                    </View>
                                    <Display enable={this.state.checkoutObj.uuid != ""} style={styles.addressButton}>
                                        <TouchableOpacity onPress={this.modifyAddress.bind(this, this.state.locAddr)}>
                                            {this.state.locAddr.id == "" ? <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}> Complete Address</Text> : <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}> Modify Address</Text>}
                                        </TouchableOpacity>
                                    </Display>
                                    <Display enable={this.state.checkoutObj.uuid == ""} style={styles.addressButton}>
                                        <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }} onPress={this.login.bind(this)}> Login</Text>
                                    </Display>
                                </View>
                            </View>
                            <Display enable={this.state.checkoutObj.uuid != ""}>
                                <TouchableOpacity style={styles.newAddressButton} onPress={this.fetchSavedAddress.bind(this)}>
                                    <Text style={{ color: '#999' }}>Change Address</Text>
                                </TouchableOpacity>
                            </Display>
                        </View>
                        <Modal isVisible={this.state.visibleModal === 8} style={styles.bottomModal} onBackButtonPress={() => this.setState({ visibleModal: null })}>
                            {this.__renderAddressContent()}
                        </Modal>
                        <Modal isVisible={this.state.visibleModal === 9} style={styles.bottomModal} onBackButtonPress={() => this.setState({ visibleModal: null })}>
                            {this.__renderNewAddressContent()}
                        </Modal>
                        {/* Special Instructions */}
                        <View style={styles.cardCoupon}>
                            <Icon style={{ color: '#F93943', fontSize: 45 }} name='ios-quote' />
                            <View style={{ width: '100%', flex: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ width: '100%', flex: 6, flexDirection: 'column', justifyContent: 'flex-start', paddingLeft: 10 }}>
                                    <TextInput
                                        style={{ borderColor: 'transparent', borderWidth: 0, }}
                                        onChangeText={(text) => this.setSpecialInstr(text)}
                                        placeholder="Any Special Instructions?"
                                        placeholderTextColor='#999'
                                        value={this.state.checkoutObj.instructions}
                                        underlineColorAndroid='transparent'
                                    />

                                </View>
                                <Icon style={{ color: '#666', fontSize: 18, fontWeight: 'bold', marginRight: 10 }} name='refresh' />
                            </View>
                        </View>

                        {/* Bill Container */}
                        <View style={styles.billContainer}>
                            <Display enable={this.state.cartLoader} style={{ flex: 1 }}>
                                <BillContainer />
                            </Display>
                            <Display enable={!this.state.cartLoader} style={{}}>
                                <Text style={{ fontSize: 12 }}>Billing Details</Text>
                                <View style={{ flexDirection: 'row', paddingBottom: 5, borderBottomColor: '#bdbdbd', borderBottomWidth: 0.2 }}>
                                    <View style={{ flex: 4 }}>
                                        <Text style={styles.editText}>Item Total</Text>
                                        <Text style={styles.editText}>Offer Discount</Text>
                                        <Text style={styles.editText}>Packaging Charge</Text>
                                        <Text style={styles.editText}>GST</Text>
                                    </View>

                                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                        <Text style={styles.editText}>₹ {this.state.checkoutObj.itemTotal}</Text>
                                        <Text style={styles.editText}>₹ {this.state.checkoutObj.offersDiscount}</Text>
                                        <Text style={styles.editText}>₹ {this.state.checkoutObj.packCharge}</Text>
                                        <Text style={styles.editText}>₹ {this.state.checkoutObj.taxes.toFixed(2)}</Text>
                                    </View>

                                </View>
                                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                    <View style={{ flex: 4 }}>
                                        <Text style={styles.editText}>Delivery Charges</Text>
                                        <Display enable={this.state.checkoutObj.surplusCharge > 0}>
                                            <Text style={styles.editText}>Surplus Charges</Text>
                                        </Display>
                                        <Text style={{ color: '#2dbe60', fontSize: 16 }}>Coupon Discount</Text>
                                        <Text style={styles.editText}>Wallet</Text>
                                        <Text style={[styles.editText, { fontSize: 20, color: '#616161', fontWeight: 'bold' }]}>To Pay</Text>
                                    </View>
                                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', paddingBottom: 50 }}>
                                        <Text style={styles.editText}>₹ {this.state.checkoutObj.delCharge}</Text>
                                        <Display enable={this.state.checkoutObj.surplusCharge > 0}>
                                            <Text style={styles.editText}>₹ {this.state.checkoutObj.surplusCharge}</Text>
                                        </Display>
                                        <Text style={{ color: '#2dbe60', fontSize: 16 }}>₹ {this.state.checkoutObj.couponDiscount}</Text>
                                        <Text style={styles.editText}>₹ {this.state.checkoutObj.walletDeduction}</Text>
                                        <Text style={[styles.editText, { fontSize: 20, color: '#616161', fontWeight: 'bold' }]}>₹ {this.state.checkoutObj.netPayable.toFixed(2)}</Text>
                                    </View>
                                </View>
                            </Display>
                        </View>

                    </ScrollView>
                    <Display enable={this.state.checkoutObj.items.length > 0} style={{ flexDirection: 'row', height: 50, flex: 1, position: 'absolute', bottom: 0 }}>
                        <View style={{ backgroundColor: "#ebebeb", justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', paddingLeft: 5, paddingRight: 5 }}>  ₹ {this.state.checkoutObj.netPayable.toFixed(2)}</Text>
                            </View>
                            <Text style={{ fontSize: 10 }}>Net Payable Amount</Text>
                        </View>
                        <Display enable={this.state.readyPay}>
                            <TouchableOpacity>
                                <View style={{ backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                                    <ActivityIndicator color="#fff" />
                                </View>
                            </TouchableOpacity>
                        </Display>
                        <Display enable={!this.state.readyPay && this.state.checkoutObj.items.length > 0}>
                            <Display enable={this.state.loggedIn && this.state.proceedToPay}>
                                <Display enable={this.state.checkoutObj.deliveryAddressId != ''}>
                                    <TouchableOpacity onPress={this.proceedToPay.bind(this)}>
                                        <View style={{ backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>PROCEED TO PAY</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Display>
                                <Display enable={this.state.checkoutObj.deliveryAddressId == ''}>
                                    <View style={{ backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12, paddingLeft: 5, paddingRight: 5 }}>Please complete your address.</Text>
                                    </View>
                                </Display>
                            </Display>
                            <Display enable={this.state.loggedIn && !this.state.proceedToPay}>
                                <View style={{ backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12, paddingLeft: 5, paddingRight: 5 }}>Some items are not available in cart. Please remove them.</Text>
                                </View>
                            </Display>
                            <Display enable={!this.state.loggedIn && this.state.proceedToPay}>
                                <TouchableOpacity onPress={this.login.bind(this)}>
                                    <View style={{ backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>LOGIN</Text>
                                    </View>
                                </TouchableOpacity>
                            </Display>
                            <Display enable={!this.state.loggedIn && !this.state.proceedToPay}>
                                <TouchableOpacity onPress={this.login.bind(this)}>
                                    <View style={{ backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>LOGIN</Text>
                                    </View>
                                </TouchableOpacity>
                            </Display>
                        </Display>
                    </Display>
                </Display>

                <Display enable={this.state.checkoutObj.items.length < 1}>
                    <View style={styles.noProductContainer}>
                        <Image source={require('../assets/emptycart.jpg')} style={[styles.image]} />

                        <Text style={{ fontSize: 18, marginTop: 5 }}>Nothing Added?</Text>

                        {/* <Text style={{ fontSize: 14, color: '#bab8b8',marginTop:10 }}>Something Great is always cooking</Text> */}
                        <Text style={{ fontSize: 14, color: '#bab8b8' }}>Explore categories to order tasty dishes available. </Text>

                        <TouchableOpacity onPress={() => this.props.navigation.navigate('Tabs')} style={{ backgroundColor: '#cd2121', padding: 10, marginTop: 25 }}>
                            <Text style={{ fontSize: 14, color: '#fff' }}>Start Adding </Text>
                        </TouchableOpacity>
                    </View>
                </Display>
                <Display enable={this.state.kitchenClosed}>
                    <View style={styles.noProductContainer}>
                        <Image source={require('../assets/app-images/kitchen-closed.png')} style={{ width: 80, height: 80 }} />
                        <Text style={{ fontSize: 12, marginTop: 5, padding: 4, backgroundColor: '#000', color: '#fff' }}>Sorry! Kitchen is closed right now.</Text>
                        <Text style={{ color: "#000", fontSize: 10, padding: 4, margin: 5, marginTop: 10, textAlign: 'center' }}>Please knock after some time</Text>


                    </View>
                </Display>

            </ScrollView >
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
    cartContainer: {
        alignSelf: 'center',
        borderRadius: 0,
        marginTop: 5,
        width: '98%',
        marginBottom: 5,
        backgroundColor: '#f9f9f9', shadowColor: '#000',
        shadowOffset: { width: 5, height: 5 }, shadowOpacity: 0.2,
        shadowRadius: 1, elevation: 1,
        flexDirection: 'column'
    },
    cardCoupon: {
        alignSelf: 'center',
        borderRadius: 0,
        marginTop: 5,
        width: '98%',
        marginBottom: 5,
        backgroundColor: '#f9f9f9', shadowColor: '#000',
        shadowOffset: { width: 5, height: 5 }, shadowOpacity: 0.2,
        shadowRadius: 1, elevation: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
    },
    cardAddress: {
        alignSelf: 'center',
        borderRadius: 0,
        marginTop: 5,
        width: '98%',
        marginBottom: 5,
        backgroundColor: '#f9f9f9', shadowColor: '#000',
        shadowOffset: { width: 5, height: 5 }, shadowOpacity: 0.2,
        shadowRadius: 1, elevation: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 5,
        flexDirection: 'column'
    },
    productName: {
        color: '#555',
        fontSize: 18,
        marginLeft: 0,
    },
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    addressButton: {
        width: 140,
        height: 30,
        backgroundColor: '#2dbe60',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5
    },
    newAddressButton: {
        width: '100%',
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderTopColor: '#fff',
        borderTopWidth: 1
    },
    modalContainer:
    {
        backgroundColor: 'white',
        height: 350,
        flexDirection: 'column',
        padding: 0,
    },
    autoHeight: {
        height: 450,
    },
    header: {
        padding: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    body: {
        flex: 7, padding: 0
    },
    couponCode: {
        fontSize: 18,
        width: 80,
        textAlign: 'center',
        fontWeight: 'bold',
        padding: 10,
        color: "#fff",
        backgroundColor: 'pink',
        borderRadius: 5,
        marginRight: 5
    },
    addressType: {
        marginRight: 5
    },
    blue: {
        backgroundColor: 'blue'
    },
    applyCouponButton: {

    },
    textWhite: {
        color: 'white'
    },
    textBig: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    addressContainer:
    {
        flexDirection: 'column', marginTop: 20,
    },
    addressContainerNew:
    {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#dbdbdb',
        padding: 10,
        marginBottom: 6,
        // paddingVertical: 01,
        paddingHorizontal: 5,
        backgroundColor: '#fff',
    },
    applybutton:
    {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2
    },
    addressboxContainer:
    {
        width: 150, height: 120, borderWidth: 2, padding: 5,
        borderColor: '#e1e1e1', marginRight: 5, backgroundColor: '#f8f8f8'

    },
    billContainer:
    {
        padding: 10, borderWidth: 2, borderStyle: 'dashed',
        borderColor: '#edd05b', borderLeftWidth: 0, borderRightWidth: 0,
        marginTop: 5,
    },
    editText:
    {
        color: '#585858',
        fontSize: 16
    },
    kitchenNameHeader: {
        backgroundColor: '#f9f9f9', shadowColor: '#000',
        shadowOffset: { width: 5, height: 5 }, shadowOpacity: 0.2,
        shadowRadius: 1, elevation: 1,
        flex: 1,
        padding: 10,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    bawarchiItemsContainer: {

    },
    noProductContainer:
    {
        justifyContent: "center", alignItems: 'center', height: Dimensions.get('window').height,
        width: Dimensions.get('window').width
    },
    image:
    {
        width: 300, height: 150,
    },
    greentext:
    {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#dbdbdb',
        padding: 10
    },
    timelyOffersContainer:
    {
        margin: 5,
        padding: 5,
        backgroundColor: '#2dbe60',
        height: 100,
        borderRadius: 4,
        flexDirection: 'row'
    },
});
