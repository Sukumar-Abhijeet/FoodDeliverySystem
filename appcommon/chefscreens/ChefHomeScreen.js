import React from 'react';
import { Container, Header, Left, Body, Badge, Button, Icon as BaseIcon, Title, Segment, Content, Text as BaseText } from 'native-base'
import { withNavigation } from 'react-navigation';
import Modal from 'react-native-modal';
import {
    StyleSheet, Text, View, Switch, ToastAndroid, Image, ImageBackground, ListView, ScrollView, RefreshControl, ActivityIndicator, Dimensions, TouchableOpacity, AsyncStorage, Platform, StatusBar
} from 'react-native';
import Display from 'react-native-display';
import GridView from 'react-native-super-grid';
import ContentLoader from 'react-native-content-loader';
import { Rect } from 'react-native-svg';


import TabHeaderScreen from '../screens/TabHeaderScreen';
import Icon from 'react-native-vector-icons/FontAwesome';


import Global from '../Urls/Global';


const BASE_PATH = Global.BASE_PATH;
const image1 = require('../assets/quickpicks/breakfast.png')
const image2 = require('../assets/quickpicks/snacks.png')
const image3 = require('../assets/quickpicks/lunch.png')
const image4 = require('../assets/quickpicks/dinner.png')
const day = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
var data = [

]
const TopSellings = () => <ContentLoader height={200}
    primaryColor='#eeeeee'
    secondaryColor='#fff'
    speed={100}
>
    <Rect x="0" y="0" rx="0" ry="0" width="200" height="150" />
    <Rect x="5" y="155.27" rx="0" ry="0" width="72" height="9" />
    <Rect x="5" y="166.27" rx="0" ry="0" width="105" height="5" />
    <Rect x="5" y="176.27" rx="0" ry="0" width="45" height="15" />
    <Rect x="115" y="176.27" rx="0" ry="0" width="45" height="15" />
</ContentLoader>

export class ChefHomeScreen extends React.Component {
    constructor(props) {
        super(props);
        global.prop = this.props;
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        // this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
        // BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid));
        this.state = {
            dataSource1: [],
            dataSource2: [],
            dataSource3: ds.cloneWithRows(data),
            dim: 150, topSellingLoader: true, trendingCategories: true, offers: true,
            Items: [
                { name: 'TURQUOISE', code: '#1abc9c' }, { name: 'EMERALD', code: '#2ecc71' },
            ],
            value: 0,
            notLoggedIn: false,
            userData: {},
            selectedDate: "",
            dateSelected: 0,
            selectedSlot: "",
            activeSlotProducts: -1,
            dates: [],
            slots: [],
            isReady: false,
            locCode: '',
            cityCode: '',
            loader: true,
            noChefsAvail: false,
            smallLoader: false,
            cartTypeFlag: "",
            cartItems: [],
            payableAmount: 0.0,
            itemCount: 0,
            chefList: [],
            chefResponse: [],
            visibleModal: null,
            replaceCartItems: false,
            updatedeliveryPreference: false,
            breakfastSlots: [
                {
                    "time": "8 AM - 9 AM",
                    "value": false
                },
                {
                    "time": "9 AM  - 10 AM",
                    "value": false
                },

            ],
            lunchSlots: [
                {
                    "time": "12 PM - 1 PM",
                    "value": false
                },
                {
                    "time": "1 PM  - 2 PM",
                    "value": false
                },

            ],
            dinnerSlots: [
                {
                    "time": "8 PM - 9 PM",
                    "value": false
                },
                {
                    "time": "9 PM  - 10 PM",
                    "value": false
                },

            ],
            delTimeObj: {
                "brkfstTime": "",
                "lnchTime": "",
                "dnrTime": ""
            }

        };
        this._renderScreen = this._renderScreen.bind(this);
    }

    async retrieveItem(key) {
        console.log("ChefHomeScreen retrieveItem() key: ", key);
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
        console.log("ChefHomeScreen storeItem() key: ", key);
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
        console.log("ChefHomeScreen removeItem() key: ", key);
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

    capitalizeWords = (str) => {
        let ar = str.split(" ");
        for (let i = 0; i < ar.length; i++) {
            let j = ar[i].charAt(0).toUpperCase();
            ar[i] = j + ar[i].substr(1).toLowerCase();
        }
        return ar.join(" ");
    }

    splitWord = (string) => {
        console.log("Splitting", string);
        return string.split(",");
    }

    initCartItems = () => {
        console.log("ChefHomeScreen initCartItems()");
        this.retrieveItem('CartItems').then((uCart) => {
            let type = "B";
            let total = 0;
            if (uCart != null) {
                if (typeof uCart == 'string') {
                    uCart = JSON.parse(uCart);
                }
                for (let i = 0; i < uCart.length; i++) {
                    if (uCart[i].ProdType == "R") {
                        let vrntPrice = 0;
                        if (!this.isEmptyObject(uCart[i].Variant)) {
                            vrntPrice = eval(uCart[i].Variant.Price);
                        }
                        let adnPrice = 0;
                        for (let j = 0; j < uCart[i].Addons.length; j++) {
                            adnPrice += eval(uCart[i].Addons[j].Price);
                        }
                        total += (uCart[i].Qty * (eval(uCart[i].OfferPrice) + vrntPrice + adnPrice));
                        type = "R";
                    }
                    else if (uCart[i].ProdType == "B") {
                        for (let j = 0; j < uCart[i].OrderedProducts.length; j++) {
                            total += (uCart[i].OrderedProducts[j].Qty * uCart[i].OrderedProducts[j].OfferPrice);
                        }
                        type = "B";
                    }
                }
            }
            else {
                uCart = JSON.parse("[]");
            }
            this.setState({ cartTypeFlag: type, payableAmount: total.toFixed(2), itemCount: uCart.length, cartItems: uCart });

        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    getFormattedDate = (dateObj) => {
        // console.log("ChefHomeScreen getFormattedDate() dateObj: ", dateObj);
        let datePart = dateObj.getDate();
        let monthPart = dateObj.getMonth() + 1;
        if (monthPart < 10) {
            monthPart = "0" + monthPart;
        }
        if (datePart < 10) {
            datePart = "0" + datePart;
        }
        let yearPart = dateObj.getFullYear();
        return (yearPart + "-" + monthPart + "-" + datePart);
    }

    fetchDate = () => {
        console.log("ChefHomeScreen fetchDate()");
        let datesArr = [];
        let selectedDate = "";
        for (let i = 0; i < 7; i++) {
            let newDate = new Date();
            newDate.setDate(newDate.getDate() + i);
            if (i == 0) {
                selectedDate = this.getFormattedDate(newDate);
            }
            datesArr.push(newDate);
        }
        this.setState({ dates: datesArr, selectedDate: selectedDate });
    }

    getLocation = () => {
        console.log("ChefHomeScreen getLocation()");
        this.retrieveItem('Address').then((data) => {
            this.setState({ locCode: data.locCode, cityCode: data.cityCode }, () => { this.fetchChefs(); });
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    selectDay = (item) => {
        console.log("ChefHomeScreen selectDay() ");
        let selDate = this.getFormattedDate(item);
        this.setState({ selectedDate: selDate }, () => { this.fetchChefs(); });
    }

    selectSlot = (slot) => {
        console.log("ChefHomeScreen selectSlot() slot: ", slot);
        this.setState({ selectedSlot: slot }, () => {
            let dataArr = JSON.parse(JSON.stringify(this.state.chefResponse));
            let sortedArr = this.sortByActiveSlot(dataArr, "M");
            let matchedArr = this.initCart(sortedArr);
            this.setState({ chefList: JSON.parse(JSON.stringify(matchedArr)) });
            const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
            this.setState({ value: this.state.value + 1, dataSource1: matchedArr, loader: false });
        });
    }

    selectBreakfastSlot = (slot) => {
        let delTime = "";
        console.log("ChefHomeScreen selectBreakfastSlot() slot: ", slot);
        let bfArr = this.state.breakfastSlots;
        for (i = 0; i < bfArr.length; i++) {
            if (bfArr[i].time == slot.time) {
                delTime = slot.time;
                bfArr[i].value = true
            } else {
                bfArr[i].value = false
            }
        }
        let bfDelTime = "";
        if (delTime == "8 AM - 9 AM") {
            bfDelTime = "08:00-09:00";
        }
        if (delTime == "9 AM  - 10 AM") {
            bfDelTime = "09:00-10:00";
        }

        this.selectDeliveryTime("BRKFST", bfDelTime)
        //console.log("Array", bfArr)
        this.setState({ breakfastSlots: bfArr })
    }

    selectLunchSlot = (slot) => {
        console.log("ChefHomeScreen selectLunchSlot() slot: ", slot);
        let delTime = "";
        let lnArr = this.state.lunchSlots;
        for (i = 0; i < lnArr.length; i++) {
            if (lnArr[i].time == slot.time) {
                delTime = slot.time;
                lnArr[i].value = true
            } else {
                lnArr[i].value = false
            }
        }
        let lnDelTime = "";
        if (delTime == "12 PM - 1 PM") {
            lnDelTime = "12:00-13:00";
        }
        if (delTime == "1 PM  - 2 PM") {
            lnDelTime = "13:00-14:00";
        }
        this.selectDeliveryTime("LNCH", lnDelTime)
        // console.log("Array", lnArr)
        this.setState({ lunchSlots: lnArr })
    }

    selectDinnerSlot = (slot) => {
        console.log("ChefHomeScreen selectDinnerSlot() slot: ", slot);
        let delTime = "";
        let dnArr = this.state.dinnerSlots;
        for (i = 0; i < dnArr.length; i++) {
            if (dnArr[i].time == slot.time) {
                delTime = slot.time;
                dnArr[i].value = true
            } else {
                dnArr[i].value = false
            }
        }
        let dnDelTime = ""
        if (delTime == "8 PM - 9 PM") {
            dnDelTime = "20:00-21:00";
        }
        if (delTime == "9 PM  - 10 PM") {
            dnDelTime = "21:00-22:00";
        }
        this.selectDeliveryTime("DNR", dnDelTime)
        // console.log("Array", dnArr)
        this.setState({ dinnerSlots: dnArr })
    }

    selectDeliveryTime(str, time) {
        console.log("chefHomeScreen selectDeliveryTime () : ", str, time);
        if (str == "BRKFST") {
            this.state.delTimeObj.brkfstTime = time;
        }
        else if (str == "LNCH") {
            this.state.delTimeObj.lnchTime = time;
        }
        else if (str == "DNR") {
            this.state.delTimeObj.dnrTime = time;
        }
    }


    saveDeliveryPreference() {
        console.log("ChefHomeScreen saveDeliveryPreference()");
        if (this.state.delTimeObj.brkfstTime != "" && this.state.delTimeObj.lnchTime != "" && this.state.delTimeObj.dnrTime != "") {
            this.setState({ smallLoader: true })
            this.storeItem("DelTmgs", this.state.delTimeObj);
            if (this.state.userData.uuid != "") {
                let formValue = this.state.delTimeObj;
                formValue.uuid = this.state.userData.uuid;
                console.log("SET_USER_DELIVERY_TIMESLOT formValue", JSON.stringify(formValue));
                fetch(BASE_PATH + Global.SET_USER_DELIVERY_TIMESLOT, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formValue)
                }).then((response) => response.json()).then((responseJson) => {
                    console.log("saveDeliveryPreference SET_USER_DELIVERY_TIMESLOT response : ", responseJson);
                    if (responseJson.Success == "Y") {
                        this.setState({ smallLoader: false, visibleModal: null, updatedeliveryPreference: true })
                        ToastAndroid.show("Selected Preferences are saved", ToastAndroid.SHORT);
                    }
                }).catch((error) => {
                    console.log("Error Saving Preferences: ", error);
                    this.setState({ smallLoader: false })
                    ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
                });
            }
            else {
                ToastAndroid.show("Please Login To save Preferences", ToastAndroid.LONG);
                this.props.navigation.navigate("Login")
            }

        }
        else {
            ToastAndroid.show("Please set all preferences ", ToastAndroid.LONG);
        }
    }

    getDeliveryPreferences() {
        console.log("ChefHomeScreen getDeliveryPreferences():");
        this.retrieveItem('DelTmgs').then((DelTmgsData) => {
            if (DelTmgsData == null) {
                console.log("No Delivery Preferences Set");
            }
            else {
                console.log("SavedDeliveryPreferences :", DelTmgsData);
                this.setState({ delTimeObj: DelTmgsData })
                //Setting Breakfast saved Preferences
                let bf = DelTmgsData.brkfstTime;
                if (bf == "08:00-09:00") {
                    bf = "8 AM - 9 AM";
                }
                if (bf == "09:00-10:00") {
                    bf = "9 AM  - 10 AM";
                }
                let bfArr = this.state.breakfastSlots;
                for (i = 0; i < bfArr.length; i++) {
                    if (bfArr[i].time == bf) {
                        bfArr[i].value = true
                    } else {
                        bfArr[i].value = false
                    }
                }
                this.setState({ breakfastSlots: bfArr })

                //Setting Lunch saved Preferences
                let nch = DelTmgsData.lnchTime;
                if (nch == "12:00-13:00") {
                    nch = "12 PM - 1 PM";
                }
                if (nch == "13:00-14:00") {
                    nch = "1 PM  - 2 PM";
                }
                let lnArr = this.state.lunchSlots;
                for (i = 0; i < lnArr.length; i++) {
                    if (lnArr[i].time == nch) {
                        lnArr[i].value = true
                    } else {
                        lnArr[i].value = false
                    }
                }
                this.setState({ lunchSlots: lnArr })

                //Setting Dinner saved Preferences
                let dnr = DelTmgsData.dnrTime;
                if (dnr == "20:00-21:00") {
                    dnr = "8 PM - 9 PM";
                }
                if (dnr == "21:00-22:00") {
                    dnr = "9 PM  - 10 PM";
                }
                let dnArr = this.state.dinnerSlots;
                for (i = 0; i < dnArr.length; i++) {
                    if (dnArr[i].time == dnr) {
                        dnArr[i].value = true
                    } else {
                        dnArr[i].value = false
                    }
                }
                this.setState({ dinnerSlots: dnArr })

                this.setState({ updatedeliveryPreference: true })
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });

    }

    changeSlot(tempArr) {
        console.log("changeSlot()");
        if (this.state.selectedSlot == "BREAKFAST") {
            this.setState({ selectedSlot: "LUNCH" }, () => {
                this.sortByActiveSlot(tempArr, "A");
            });
        }
        else if (this.state.selectedSlot == "LUNCH") {
            this.setState({ selectedSlot: "DINNER" }, () => {
                this.sortByActiveSlot(tempArr, "A");
            });
        }
        else if (this.state.selectedSlot == "DINNER") {
            let ctr = 0;
            for (let i = 0; i < this.state.dates.length; i++) {
                if (this.state.selectedDate == this.getFormattedDate(this.state.dates[i])) {
                    ctr = i;
                    break;
                }
            }
            if ((ctr + 1) < this.state.dates.length) {
                console.log("calling fetchcefs");
                this.setState({ selectedDate: this.getFormattedDate(this.state.dates[ctr + 1]) }, () => {
                    this.fetchChefs();
                });
            }
        }
        ToastAndroid.show("New Date/Slot is set", ToastAndroid.LONG);
    }

    fetchChefs() {
        this.setState({ loader: true, value: 0, slots: [], noChefsAvail: false });
        console.log("ChefHomeScreen - fetchChefs()");
        const formValue = JSON.stringify({
            'date': this.state.selectedDate,
            'locCode': this.state.locCode,
            'cityCode': this.state.cityCode,
            'reqFrom': "APP"
        });
        console.log("FETCH_CHEF_LIST_URL formValue : ", formValue);
        fetch(BASE_PATH + Global.FETCH_CHEF_LIST_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseJson) => {
            console.log("response fetchChefs: ", responseJson);
            if (responseJson.Success == "Y") {
                let availableSlots = this.splitWord(responseJson.DayAvailableSlots);
                let dataArr = JSON.parse(JSON.stringify(responseJson.Data));
                this.setState({ slots: availableSlots, selectedSlot: responseJson.ActiveSlot, chefResponse: JSON.parse(JSON.stringify(dataArr)) });
                let sortedArr = this.sortByActiveSlot(dataArr, "A");
                let matchedArr = this.initCart(sortedArr);
                this.setState({ chefList: JSON.parse(JSON.stringify(matchedArr)) });
                const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
                this.setState({ value: this.state.value + 1, dataSource1: matchedArr, loader: false, noChefsAvail: false });
            } else if (responseJson.Success == "N") {
                console.log("N - response fetchChefs: ", responseJson);
                this.setState({ loader: false, noChefsAvail: true })
            }

            else {
                //console.log("response fetchChefs: ", responseJson);
            }
        }).catch((error) => {
            console.log("Error Chef Products: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
        });

    }

    sortByActiveSlot = (tempArr, type) => {
        console.log("ChefHomeScreen sortByActiveSlot() selectedSlot: ", this.state.selectedSlot, type);
        let cCtr = 0;
        for (let i = 0; i < tempArr.length; i++) {
            let count = 0;
            for (let k = (tempArr[i].ChefProducts.length - 1); k > -1; --k) {
                let obj = tempArr[i].ChefProducts[k];
                // console.log("AAT: ", obj.AdjustedAvailabilityTime, " && SS: ", this.state.selectedSlot, " && ?: ", (obj.AdjustedAvailabilityTime.includes(this.state.selectedSlot)));
                if (obj.AdjustedAvailabilityTime.includes(this.state.selectedSlot)) {
                    tempArr[i].ChefProducts[k].DisplayInActiveSlot = true;
                    count++;
                    cCtr++;
                    if (this.state.selectedSlot == "BREAKFAST") {
                        tempArr[i].ChefProducts[k].AvailCount = tempArr[i].ChefProducts[k].MaxQty - tempArr[i].ChefProducts[k].BreakfastOrderCount;
                    }
                    else if (this.state.selectedSlot == "LUNCH") {
                        tempArr[i].ChefProducts[k].AvailCount = tempArr[i].ChefProducts[k].MaxQty - tempArr[i].ChefProducts[k].LunchOrderCount;
                    }
                    else if (this.state.selectedSlot == "DINNER") {
                        tempArr[i].ChefProducts[k].AvailCount = tempArr[i].ChefProducts[k].MaxQty - tempArr[i].ChefProducts[k].DinnerOrderCount;
                    }
                }
                else {
                    tempArr[i].ChefProducts[k].DisplayInActiveSlot = false;
                    tempArr[i].ChefProducts.splice(k, 1);
                }

            }
            tempArr[i].DisplayInActiveSlot = count > 0;
        }
        this.setState({ activeSlotProducts: cCtr });
        if (cCtr < 1 && type == "A") {
            this.changeSlot(tempArr);
        }
        console.log("arr after sorting: ", tempArr);
        return tempArr;
    }

    initCart = (tempArr) => {
        console.log("ChefHomeSCreen initCart()");
        for (let i = 0; i < tempArr.length; i++) {
            for (let k = 0; k < tempArr[i].ChefProducts.length; k++) {
                let qty = 0;
                let obj = tempArr[i].ChefProducts[k];
                for (let j = 0; j < this.state.cartItems.length; j++) {
                    if (this.state.cartItems[j].ProdType == 'B') {
                        if (tempArr[i].VId == this.state.cartItems[j].VId) {
                            for (let l = 0; l < this.state.cartItems[j].OrderedProducts.length; l++) {
                                let prod = this.state.cartItems[j].OrderedProducts[l];
                                if (obj.ProductId == prod.ProductId && prod.SelectedDay == this.state.selectedDate && prod.SelectedTimeSlot == this.state.selectedSlot) {
                                    console.log("matched");
                                    qty = prod.Qty;
                                    break;
                                }
                            }
                        }
                    }
                }
                tempArr[i].ChefProducts[k].Qty = qty;
            }
        }
        // console.log("arr after init: ", tempArr);
        return tempArr;
    }

    addToCart = (prod, chef) => {
        console.log("ChefHomeScreen addToCart() prod: ", prod, this.state.cartTypeFlag);
        let actionMsgType = "";
        if (this.state.updatedeliveryPreference) {
            if (this.state.cartTypeFlag == "B") {
                let cartItems = this.state.cartItems;
                let cIdx = -1;
                for (let i = 0; i < this.state.chefList.length; i++) {
                    if (chef.VId == this.state.chefList[i].VId) {
                        cIdx = i;
                        break;
                    }
                }
                console.log("Chef Index: ", cIdx);
                let ctCidx = -1;
                let ctPidx = -1;
                for (let i = 0; i < cartItems.length; i++) {
                    if (prod.ProdType == "B") {
                        if (cartItems[i].VId == chef.VId) {
                            ctCidx = i;
                            for (let j = 0; j < cartItems[i].OrderedProducts.length; j++) {
                                let obj = cartItems[i].OrderedProducts[j];
                                if (prod.ProductId == obj.ProductId && obj.SelectedDay == this.state.selectedDate && obj.SelectedTimeSlot == this.state.selectedSlot) {
                                    ctPidx = j;
                                }
                            }
                        }
                    }
                }
                console.log("ctIdx: ", ctCidx, " && ctPidx: ", ctPidx);
                let str = "Item added";
                if (ctCidx > -1) {
                    if (ctPidx > -1) {
                        if (prod.Qty < prod.AvailCount) {
                            prod.Qty += 1;
                            cartItems[ctCidx].OrderedProducts[ctPidx].Qty = prod.Qty;
                            str = " Item updated";
                        } else {
                            str = "Only " + prod.Qty + " quantity is available for now.";
                            actionMsgType = "Error";
                        }
                    }
                    else {
                        if (prod.Qty < prod.AvailCount) {
                            prod.Qty = 1;
                            prod.SelectedDay = (" " + this.state.selectedDate).slice(1);
                            prod.SelectedTimeSlot = (" " + this.state.selectedSlot).slice(1);
                            cartItems[ctCidx].OrderedProducts.push(JSON.parse(JSON.stringify(prod)));
                        }
                        else {
                            str = "No quantity is available for now.", ToastAndroid.LONG;
                            actionMsgType = "Error";
                        }
                    }
                }
                else {
                    if (prod.Qty < prod.AvailCount) {
                        let cObj = JSON.parse(JSON.stringify(chef));
                        cObj.OrderedProducts = [];
                        delete cObj.ChefProducts;
                        prod.Qty = 1;
                        prod.SelectedDay = (" " + this.state.selectedDate).slice(1);
                        prod.SelectedTimeSlot = (" " + this.state.selectedSlot).slice(1);
                        cObj.OrderedProducts.push(JSON.parse(JSON.stringify(prod)));
                        cartItems.push(cObj);
                    }
                    else {
                        str = "No quantity for this item is available for now.";
                        actionMsgType = "Error";
                    }
                }
                console.log("cartArr: ", cartItems);
                console.log("errorType & str : ", actionMsgType, str);
                if (actionMsgType == "Error") {
                    actionMsgType = "";
                    ToastAndroid.show(str, ToastAndroid.LONG);
                } else {
                    this.setState({ itemCount: cartItems.length, cartItems: cartItems });
                    this.updateProductList(prod, cIdx, str);
                }

            }
            else {
                this.setState({ replaceCartItems: true })
                // ToastAndroid.show("Chef food cannot be added with other food. Please clear the cart and continue adding.", ToastAndroid.SHORT);
            }
        } else {
            ToastAndroid.show("Please set delivery Preferences to add.", ToastAndroid.LONG);
        }
    }

    removeFromCart = (prod, chef) => {
        console.log("ChefHomeScreen removeFromCart() prod: ", prod, this.state.cartTypeFlag);
        if (this.state.cartTypeFlag == "B") {
            let cartItems = this.state.cartItems;
            let cIdx = -1;
            for (let i = 0; i < this.state.chefList.length; i++) {
                if (chef.VId == this.state.chefList[i].VId) {
                    cIdx = i;
                    break;
                }
            }
            console.log("Chef Index: ", cIdx);
            let ctCidx = -1;
            let ctPidx = -1;
            for (let i = 0; i < cartItems.length; i++) {
                if (prod.ProdType == "B") {
                    if (cartItems[i].VId == chef.VId) {
                        ctCidx = i;
                        for (let j = 0; j < cartItems[i].OrderedProducts.length; j++) {
                            let obj = cartItems[i].OrderedProducts[j];
                            if (prod.ProductId == obj.ProductId && obj.SelectedDay == this.state.selectedDate && obj.SelectedTimeSlot == this.state.selectedSlot) {
                                ctPidx = j;
                            }
                        }
                    }
                }
            }
            console.log("ctIdx: ", ctCidx, " && ctPidx: ", ctPidx);
            let str = "Item updated";
            if (ctCidx > -1 && ctPidx > -1) {
                prod.Qty -= 1;
                if (prod.Qty > 0) {
                    cartItems[ctCidx].OrderedProducts[ctPidx].Qty = prod.Qty;
                }
                else {
                    cartItems[ctCidx].OrderedProducts.splice(ctPidx, 1);
                    if (cartItems[ctCidx].OrderedProducts.length < 1) {
                        cartItems.splice(ctCidx, 1);
                    }
                    str = "Item removed";
                }
            }
            this.setState({ itemCount: cartItems.length, cartItems: cartItems });
            this.updateProductList(prod, cIdx, str);
        }
        else {
            this.setState({ replaceCartItems: true, })
            // ToastAndroid.show("Chef food cannot be added with other food. Please clear the cart and continue adding.", ToastAndroid.SHORT);
        }
    }

    updateProductList(prod, cIdx, str) {
        console.log("ChefHomeScreen updateProductList() prod: ", prod, str);
        let dataArr = this.state.chefList;
        if (cIdx > -1) {
            console.log("chefList: ", dataArr[cIdx])
            for (let k = 0; k < dataArr[cIdx].ChefProducts.length; k++) {
                let obj = dataArr[cIdx].ChefProducts[k];
                if (obj.ProductId == prod.ProductId) {
                    dataArr[cIdx].ChefProducts[k].Qty = prod.Qty;
                    console.log("Products Updated");
                    break;
                }
            }
        }
        let total = 0;
        let itmCtr = 0;
        for (let i = 0; i < this.state.cartItems.length; i++) {
            for (let j = 0; j < this.state.cartItems[i].OrderedProducts.length; j++) {
                let obj = this.state.cartItems[i].OrderedProducts[j];
                total += (obj.Qty * obj.OfferPrice);
                itmCtr++;
            }
        }
        this.setState({ chefList: JSON.parse(JSON.stringify(dataArr)) });
        this.setState({ payableAmount: total.toFixed(2), itemCount: itmCtr, dataSource1: dataArr });
        ToastAndroid.show(str, ToastAndroid.SHORT);
        this.storeItem("CartItems", JSON.stringify(this.state.cartItems));
    }

    showmsg() {
        ToastAndroid.show('Sorry! Item is unavailable now.', ToastAndroid.SHORT);
    }

    getUserData() {
        this.retrieveItem('UserData').then((user) => {
            if (user == null) {
                this.setState({ notLoggedIn: true });
            }
            else {
                this.setState({ userData: user });
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    componentWillMount() {
        console.log("ChefHomeScreen componentWillMount()");
        this.fetchDate();
        this.getUserData();
        this.getDeliveryPreferences();
        // await Expo.Font.loadAsync({
        //     'Roboto': require('native-base/Fonts/Roboto.ttf'),
        //     'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
        //     'MyriadPro': require('../assets/fonts/MyriadPro-Regular.otf'),
        // });
        this.setState({ isReady: true });
    }
    emptyCart = () => {
        console.log("CartScreen emptyCart()");
        this.setState({ cartItems: [], cartTypeFlag: 'B', });
        this.storeItem("CartItems", []);
        ToastAndroid.show("Cart emptied", ToastAndroid.SHORT);
        this.setState({ replaceCartItems: false })
        this.initCartItems();
    }

    componentDidMount() {
        console.log("ChefHomeScreen componentDidMount()");
        this.props.navigation.addListener('didFocus', () => {
            this.initCartItems();
            this.getLocation();
            this.getUserData();
        });
        // this.removeItem("CartItems");

    }

    setDeliverySlots(selectedSlot) {
        console.log("ChefHomeScreen setDeliverySlots() : ", selectedSlot);
        this.setState({ visibleModal: 1 })

    }
    __renderDeliverySlotsContent = () => (
        <View style={styles.DeliverySlots}>
            <View style={{ height: 50, borderBottomColor: '#b5b1b1', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', padding: 5 }}>
                <View style={{ flex: 7, alignItems: 'flex-start', justifyContent: 'flex-start', }}>
                    <Text style={{ fontWeight: '400', fontSize: 18 }}> Choose Preferences</Text>
                    <Text style={{ fontWeight: '100', fontSize: 8, color: '#bfbbbb', paddingLeft: 3 }}> Please set the available slot preferences for faster checkout</Text>
                </View>
                <View style={{ flex: 3, }}>
                    <TouchableOpacity style={{ backgroundColor: '#2dbe60', padding: 4, borderRadius: 4, alignSelf: 'flex-end' }} onPress={() => this.saveDeliveryPreference()}>
                        <Display enable={this.state.smallLoader}>
                            <ActivityIndicator size={"small"} color={"#fff"} />
                        </Display>
                        <Display enable={!this.state.smallLoader}>
                            <Text style={{ color: 'white', fontSize: 12 }}>Save Preferences</Text>
                        </Display>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ flex: 1, padding: 0 }}>
                <ImageBackground resizeMode={"stretch"} source={require('../assets/BreakfastBg.jpg')} style={{ width: Dimensions.get('window').width, flex: 1, padding: 10 }}>
                    <Text style={{ color: '#fff', fontWeight: '600' }}>BreakFast</Text>

                    <Segment style={{ backgroundColor: "transparent" }} >
                        {this.state.breakfastSlots.map((item, index) => (
                            <Button first active={item.value == true} style={{ padding: 10 }} onPress={this.selectBreakfastSlot.bind(this, item)} key={index}>
                                <Text style={{ color: (item.value == true) ? "#cd2121" : "#fff" }}>{item.time}</Text>
                            </Button>
                        ))}
                    </Segment>

                </ImageBackground>
                <ImageBackground resizeMode={"stretch"} source={require('../assets/LunchBg.jpg')} style={{ width: Dimensions.get('window').width, flex: 1, padding: 10 }}>
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Lunch</Text>

                    <Segment style={{ backgroundColor: "transparent" }} >
                        {this.state.lunchSlots.map((item, index) => (
                            <Button first active={item.value == true} style={{ padding: 10 }} onPress={this.selectLunchSlot.bind(this, item)} key={index}>
                                <Text style={{ color: (item.value == true) ? "#cd2121" : "#fff" }}>{item.time}</Text>
                            </Button>
                        ))}
                    </Segment>

                </ImageBackground>
                <ImageBackground resizeMode={"stretch"} source={require('../assets/DinnerBg.png')} style={{ width: Dimensions.get('window').width, flex: 1, padding: 10 }}>
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Dinner</Text>

                    <Segment style={{ backgroundColor: "transparent" }} >
                        {this.state.dinnerSlots.map((item, index) => (
                            <Button first active={item.value == true} style={{ padding: 10 }} onPress={this.selectDinnerSlot.bind(this, item)} key={index}>
                                <Text style={{ color: (item.value == true) ? "#cd2121" : "#fff" }}>{item.time}</Text>
                            </Button>
                        ))}
                    </Segment>

                </ImageBackground>
            </View>
        </View>
    )

    _renderScreen = () => (
        // console.log("Working Re Render For Date", this.state.selectedDate),
        <ScrollView style={{ marginBottom: (this.state.itemCount > 0 ? 50 : 0) }}
            showsVerticalScrollIndicator={false}>
            <View style={styles.productContainer}>
                <Segment style={{ backgroundColor: '#007bff' }}>
                    {this.state.slots.map((item, index) => (
                        <Button first active={this.state.selectedSlot === item} onPress={this.selectSlot.bind(this, item)} key={index}>
                            <BaseText>{item}</BaseText>
                        </Button>
                    ))}
                </Segment>
                <Display enable={true} style={{ flex: 1, padding: 5, paddingBottom: 0 }}>
                    <View style={{ flexDirection: 'row', flex: 1, backgroundColor: '#fed444', padding: 8, borderRadius: 4, justifyContent: 'center', alignItems: 'center' }}>

                        <Display enable={!this.state.notLoggedIn} style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 7 }}>
                                <Text>Your
                            <Text style={{ fontWeight: '300', fontStyle: "italic" }}> {this.state.selectedSlot.toLowerCase()} </Text>
                                    <Text >delivery Time slot is {this.state.updatedeliveryPreference ? "set" : "not set"}  </Text>
                                </Text>
                            </View>
                            <View style={{ flex: 3, alignItems: 'flex-end' }}>
                                <TouchableOpacity onPress={() => this.setDeliverySlots(this.state.selectedSlot)} style={{ backgroundColor: '#000', padding: 4, borderRadius: 4 }}>
                                    <Text style={{ color: 'white' }}>{this.state.updatedeliveryPreference ? "Update Now" : "Set Now"}</Text>
                                </TouchableOpacity>
                            </View>
                        </Display>
                        <Display enable={this.state.notLoggedIn}>
                            <Text >Please Login To set Delivery Preferences </Text>
                        </Display>
                    </View>
                </Display>
                <Modal isVisible={this.state.visibleModal === 1} style={styles.bottomModal} onBackButtonPress={() => this.setState({ visibleModal: null })}>
                    {this.__renderDeliverySlotsContent()}
                </Modal>
                {
                    this.state.dataSource1.map((data, index) => (
                        <Display enable={data.DisplayInActiveSlot} key={index}>
                            <View style={{ marginTop: 5 }}>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('ChefDetail', { chefId: data.VId, chefProfileName: data.ChefProfileName })} style={{ alignSelf: 'auto', backgroundColor: '#fff', padding: 5, borderTopColor: '#ebebeb', borderTopWidth: 1, borderBottomColor: '#ebebeb', borderBottomWidth: 1 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center' }}>
                                        <Image source={require('../assets/chefhat.png')} style={{ width: 30, height: 30 }} />
                                        <View style={{ flex: 1, alignSelf: 'auto' }}>
                                            <Text style={{ fontSize: 12, color: '#656565', fontWeight: 'bold', marginLeft: 5 }}>{data.ChefName}</Text>
                                            <Text style={{ fontSize: 12, color: '#a6a6a6', marginLeft: 5 }}>{data.ChefKitchenName}</Text>
                                        </View>
                                        <View style={{ flex: 1, alignItems: 'flex-end', marginTop: 5 }}>

                                            <Icon name="arrow-right" style={{ fontSize: 18, color: '#999' }} />

                                        </View>
                                    </View>

                                </TouchableOpacity>
                                <GridView
                                    spacing={5}
                                    itemDimension={this.state.dim}
                                    items={data.ChefProducts}
                                    renderItem={item => (
                                        <Display enable={item.DisplayInActiveSlot}>
                                            <View style={styles.itemContainer}>
                                                <ImageBackground source={{ uri: BASE_PATH + item.ProductImage }} resizeMode={'contain'} style={[styles.productImage, { opacity: (!item.Addable ? .6 : 1) }]}>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <View style={{ flex: 1 }}>
                                                            <View style={{ borderColor: '#fff', marginLeft: 5, marginTop: 5, borderWidth: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: (item.ProductVeganType == 'VEG') ? '#3bb97a' : '#cd2121' }}>
                                                            </View>
                                                        </View>
                                                        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', paddingVertical: 4 }}>
                                                            <Display enable={item.OfferText != ''}>
                                                                <View style={{
                                                                    width: 100, height: 25, marginRight: -8,
                                                                    backgroundColor: '#cd2121',
                                                                    justifyContent: 'center', alignItems: 'center',
                                                                }}>
                                                                    {/* <Shimmer> */}
                                                                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 16, }}>{item.OfferText}</Text>
                                                                    {/* </Shimmer> */}
                                                                </View>
                                                            </Display>
                                                        </View>
                                                    </View>
                                                </ImageBackground >
                                                <View style={{ backgroundColor: '#fff', padding: 4 }}>
                                                    <Text style={{ fontSize: 14, color: '#999a95', fontWeight: 'bold' }}>{item.ProductName}</Text>
                                                    <Text style={{ fontSize: 9, color: '#999a95' }}>{item.ProductDescription}</Text>
                                                    <View style={{ flexDirection: 'row' }}>
                                                        <Display enable={item.OfferApplied == 'YES' && item.OfferText != ""} style={{ flex: 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                            <Text style={{ color: "#adabab", fontWeight: '600', fontSize: 12, textDecorationLine: 'line-through', marginTop: 4 }}>₹ {item.ProductPrice}</Text>
                                                            <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                        </Display>
                                                        <Display enable={item.OfferApplied == 'YES' && item.OfferText == ""} style={{ flex: 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                            <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                        </Display>
                                                        <Display enable={item.OfferApplied != 'YES'} style={{ flex: 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                            <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                        </Display>
                                                        <View style={{ flex: 5, borderWidth: 1, borderColor: (!item.Addable ? '#ada8a8' : "#2dbe60"), backgroundColor: (!item.Addable ? '#ada8a8' : "#2dbe60"), justifyContent: 'center', alignItems: 'center', width: 160, borderRadius: 1 }}>
                                                            <Display enable={item.Addable} style={{ flex: 1, flexDirection: 'row', }}>
                                                                <Display enable={item.Qty > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                    <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={this.removeFromCart.bind(this, item, data)}>
                                                                        <Text style={{ color: "#fff", fontSize: 14, }}>-</Text>
                                                                    </TouchableOpacity>

                                                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                                                        <Text style={{ color: "#555", fontSize: 12, }}>{item.Qty}</Text>
                                                                    </View>

                                                                    <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={this.addToCart.bind(this, item, data)}>
                                                                        <Text style={{ color: "#fff", fontSize: 14, }}>+</Text>
                                                                    </TouchableOpacity>
                                                                </Display>

                                                                <Display enable={item.Qty < 1} style={{ flex: 1, flexDirection: 'row', }}>
                                                                    <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={this.addToCart.bind(this, item, data)}>
                                                                        <Text style={{ color: "#fff", fontSize: 14 }}>ADD</Text>
                                                                    </TouchableOpacity>
                                                                </Display>
                                                            </Display>
                                                            <Display enable={!item.Addable} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                                <TouchableOpacity onPress={this.showmsg}>
                                                                    <Text style={{ color: "#fff", fontSize: 14, marginBottom: (Platform.OS === 'ios' ? 0 : 5) }}>ADD</Text>
                                                                </TouchableOpacity>
                                                            </Display>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </Display>
                                    )}
                                />
                            </View>
                        </Display>
                    ))}
            </View>
        </ScrollView>
    );

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

                <TabHeaderScreen />

                <View style={styles.dateHeader}>
                    {this.state.dates.map((item, index) => (
                        <TouchableOpacity onPress={() => this.selectDay(item)} style={[styles.marginBox, this.state.selectedDate == this.getFormattedDate(item) ? styles.underlineActiveColor : '']} key={index}>
                            <Text style={[styles.dayBox, { color: this.state.selectedDate == this.getFormattedDate(item) ? "#007bff" : "#bab8b8" }]}>{day[item.getDay()]}</Text>
                            <Text style={[styles.dateBox]}>{item.getDate()}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Display enable={this.state.noChefsAvail} style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <Image source={require('../assets/cooknotavail.png')} resizeMode={'contain'} style={{ width: '50%', height: 150 }} />
                    <Text style={{ fontSize: 15, color: '#bcbaba' }}>No Chefs available right now..</Text>
                </Display>
                <Display enable={!this.state.noChefsAvail} style={{ flex: 1 }}>
                    <Display enable={this.state.value > 0 || (this.state.loader == "false")} style={{ flex: 1 }}>
                        {this._renderScreen()}
                    </Display>
                </Display>



                <Display enable={this.state.replaceCartItems} enterDuration={100}
                    exitDuration={100}
                    exit="fadeOutDown"
                    enter="fadeInUp"
                    style={{ flex: 1, bottom: 0, position: 'absolute', width: '100%', zIndex: 100 }}>
                    <View style={{ flex: 1, backgroundColor: '#fff', padding: 15 }}>
                        <View>
                            <Text style={{ fontSize: 18, fontWeight: '300' }}>
                                Chef food cannot be added with other food.
                            </Text>
                            <Text style={{ fontSize: 14, fontWeight: '100', color: '#bcbaba' }}>
                                Want to clear the cart and continue adding ?
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', height: 30, justifyContent: 'space-between', paddingTop: 5 }}>
                            <TouchableOpacity style={{ flex: 1, borderColor: '#cd2121', borderWidth: 1, justifyContent: 'center', alignItems: 'center' }} onPress={() => this.setState({ replaceCartItems: false })}>
                                <Text style={{ color: '#cd2121', fontSize: 15, fontWeight: '400' }}>NO</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flex: 1, backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center' }} onPress={() => this.emptyCart()} >
                                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '400' }}>YES</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Display>

                <Display
                    enable={this.state.itemCount > 0}
                    enterDuration={100}
                    exitDuration={100}
                    exit="fadeOutDown"
                    enter="fadeInUp"
                    style={{ flex: 1, bottom: 0, position: 'absolute', backgroundColor: 'red', zIndex: 50 }}
                >
                    <View style={{ flexDirection: 'row', }}>
                        <View style={{ backgroundColor: "#ebebeb", justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>₹ {this.state.payableAmount} | {this.state.itemCount} Item(s)</Text>
                            {/* <Text style={{ fontSize: 10 }}>ESTIMATED DELIVERY TIME :{this.state.avgCookingTime + 20} MINS</Text> */}
                        </View>
                        <TouchableOpacity onPress={() => { this.props.navigation.navigate('Cart') }}>
                            <View style={{ backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>VIEW CART</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Display>
                <Display enable={this.state.loader}
                    enterDuration={100}
                    exitDuration={100}
                    exit="fadeOutDown"
                    enter="fadeInUp"
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                >
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        {/* <Text>Please Select a Date</Text> */}
                        <ActivityIndicator size={"large"} color={"#cd2121"}></ActivityIndicator>
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
        // padding: 5,
        width: null,
        height: null,
        backgroundColor: '#f8f8f8',
        flexDirection: 'column',
        //marginTop: Expo.Constants.statusBarHeight,
    },
    headContainer:
    {
        // flex:1,
        flexDirection: 'row',
        height: 50,
        paddingHorizontal: 5,
        paddingTop: 15,
        backgroundColor: '#ebebeb',
        borderBottomWidth: 1,
        borderBottomColor: '#bcbaba'
    },
    superChefContainer:
    {
        marginTop: 5,

        flex: 6
    },
    dateHeader:
    {
        justifyContent: 'flex-start', alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 10,
        backgroundColor: "#fff",
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2,
        // borderBottomColor:'#'
    },
    underlineActiveColor: {
        borderBottomColor: '#007bff',
        borderBottomWidth: 3
    },
    superChefBox:
    {
        flex: 4,
        height: 300,
        width: Dimensions.get('window').width - 120,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    itemContainer: {
        flexDirection: 'column',
        borderRadius: 5,
        marginBottom: 5,
        borderRadius: 10,
        height: 200,
        backgroundColor: '#f9f9f9', shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2,
    },
    productImage: {
        flex: 3,
        padding: 5,
        backgroundColor: '#fff',
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
    productContainer:
    {
        flex: 4,
        marginTop: 5,
        // padding: 5,
    },
    marginBox:
    {
        flex: 1,
        padding: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    dayBox:
    {
        fontSize: 12,
        // color: '#bab8b8'
    },
    dateBox:
    {
        fontSize: 18,
    },
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    DeliverySlots: {
        height: Dimensions.get('window').height / 2,
        backgroundColor: "#fff"
    }

});
export default withNavigation(ChefHomeScreen)