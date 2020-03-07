import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
    StyleSheet, Text, View, BackHandler, Platform, ToastAndroid, Image, ImageBackground, ListView, Share, ScrollView, ActivityIndicator, Linking, Dimensions, TouchableOpacity, AsyncStorage, Alert, RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Modal from 'react-native-modal';
import { Container, Header, Left, Body, Right, Button, Radio, ListItem, CheckBox, Icon as BaseIcon, Title, Segment, Content, Text as BaseText, Textarea } from 'native-base'
import { Rating, AirbnbRating } from 'react-native-ratings';
import Display from 'react-native-display';
import TabHeaderScreen from '../screens/TabHeaderScreen';
import WarningScreen from '../screens/WarningScreen';
import { Web, Call } from 'react-native-openanything';
import ContentLoader from 'react-native-content-loader';
import { Rect } from 'react-native-svg';
import firebase from 'react-native-firebase';
//import Shimmer from 'react-native-shimmer';



import Global from '../Urls/Global';

const BASE_PATH = Global.BASE_PATH;

const Offers = () => <ContentLoader width={225} height={225}
    primaryColor='#eeeeee'
    secondaryColor='#fff'
    speed={100}
>

    <Rect x="0" y="0" rx="0" ry="0" height="225" width="225" />


</ContentLoader>
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

const TrendingCategories = () => <ContentLoader height={200}
    primaryColor='#eeeeee'
    secondaryColor='#fff'
    speed={100}
>

    <Rect x="0" y="0" rx="0" ry="0" width="90" height="120" />
    <Rect x="5" y="125" rx="0" ry="0" width="90" height="8" />

</ContentLoader>



const image1 = require('../assets/quickpicks/breakfast.png')
const image2 = require('../assets/quickpicks/snacks.png')
const image3 = require('../assets/quickpicks/lunch.png')
const image4 = require('../assets/quickpicks/dinner.png')

var data = [
    { title: "Breakfast", image: image1 }, { title: "Snacks", image: image2 }
    , { title: "Lunch", image: image3 }, { title: "Dinner", image: image4 }
]


export default class HomeScreen extends React.Component {
    _didFocusSubscription;
    _willBlurSubscription;
    constructor(props) {
        super(props);
        this.TimeLineData = [
            { status: '' },
            { status: '' },
            { status: '' },
            { status: '' },
        ]
        global.prop = props;
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
            BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid));
        this.state = {
            dataSource1: ds.cloneWithRows(['r1', 'r2', 'r3', 'r4']),
            tendingCategoriesSource: [],
            topSellingSource: [],
            newArrivalSource: [],
            onOffersSource: [],
            comboMealsForYouSource: [],
            dataSource3: ds.cloneWithRows(data),
            recommendedSource: [],
            newChefsSource: [],
            bestChefsSource: [],
            dim: 150, topSellingLoader: true, trendingCategories: true, offers: true,
            Items: [
                { name: 'TURQUOISE', code: '#1abc9c' }, { name: 'EMERALD', code: '#2ecc71' },
                { name: 'PETER RIVER', code: '#3498db' }, { name: 'AMETHYST', code: '#9b59b6' }
            ],
            greetings: "",
            imgLoad: require('../assets/BreakfastBg.jpg'),
            walletMoney: 0.0,
            referralCode: '',
            pincode: "",
            foodService: false,
            specifyReason: false,
            bawarchiService: false,
            serviceAvailable: false,
            kitchenClosed: false,
            cartItems: [],
            replaceCartItems: false,
            minOrderChargeForDelivery: 0,
            deliveryCharge: 0,
            payableAmount: 0.0,
            avgCookingTime: 0,
            itemCount: 0,
            countback: true,
            ifnotLoggedIn: false,
            Code: 'BMFBBS',
            timelyOffers: true,
            entries: data,
            visibleModal: null,
            customisationModal: null,
            exitModal: null,
            locCode: '',
            cityCode: '',
            customerName: '...',
            suggestionBox: true,
            cartArr: [],
            cartTypeFlag: "",
            prodList: [],
            pastOrders: ["O1", "O2", "3"],
            custProd: {
                ProductName: "Loading...",
                OfferPrice: "0.0",
                Vrnts: [],
                Adns: [],
                Variants: ds.cloneWithRows([]),
                Addons: ds.cloneWithRows([]),
                vLen: 0,
                aLen: 0,
                itemCustomization: "No extra selected",
                ProductVeganType: ""
            },
            custProdTotal: "0",
            selVar: {},
            selAdn: [],
            isReady: false,
            orderFeedback: {
                "OrderId": "",
                "ItemDetails": []
            },
            feedback: "",
            rating: "3",
            feedbackLoader: false,
            customerId: "",
            itemToBeAdded: {},
            trackOrder: {},
            orderDetails: {
                Items: []
            },
            showLiveOrders: false,
            ongoingOrdersData: [],
            currentOngoingOrder: {
                Items: []
            },
            refreshing: false,
            onGoingOrders: [
                {
                    OrderStatus: 'ORDER PLACED'
                },
                {
                    OrderStatus: 'ORDER CONFIRMED'
                },
                {
                    OrderStatus: 'COOKING'
                },
                {
                    OrderStatus: 'OUT FOR DELIVERY'
                }
            ],
            rejectionReasons: [
                {
                    "Reason": "No Offers",
                    "Value": false,
                },
                {
                    "Reason": "High Price",
                    "Value": false,
                },
                {
                    "Reason": "Network Issue",
                    "Value": false,
                },
                {
                    "Reason": "Too Complicated UI",
                    "Value": false,
                },
                {
                    "Reason": "Doesn't look tasty!",
                    "Value": false,
                },
                {
                    "Reason": "Not in a mood",
                    "Value": false,
                },
                {
                    "Reason": "Less Cusines",
                    "Value": false,
                },
                {
                    "Reason": "Not found the item",
                    "Value": false,
                },
                {
                    "Reason": "Confused Ordering",
                    "Value": false,
                },
                {
                    "Reason": "Found a better app",
                    "Value": false,
                },

            ],
        }

    }

    scrollToTop() {
        console.log("HomeScreen ScrollToTop()");
        this.refs._mainScrollView.scrollTo(0);
    }

    async retrieveItem(key) {
        console.log("HomeScreen retrieveItem() key: ", key);
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
        console.log("HomeScreen storeItem() key: ", key);
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
        console.log("HomeScreen removeItem() key: ", key);
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

    onBackButtonPressAndroid = () => {
        console.log("back handling");
        if (this.state.countback) {
            if (this.state.itemCount > 0) {
                this.setState({ exitModal: 1 });
            }
            else {
                ToastAndroid.show("Double tap to close.", ToastAndroid.SHORT);
                this.setState({ countback: false, });
                setTimeout(() => {
                    this.setState({ countback: true })
                    console.log("Clearing Count after 3 secs.")
                }, 3000);
            }
            return true;
        }
        else {
            ToastAndroid.show("Closing the app.", ToastAndroid.SHORT);
            this.setState({ countback: true });
            BackHandler.exitApp();
            //return false;
        }
    };

    getGreetings = () => {
        console.log("HomeScreen getGreetings()");
        let date = new Date();
        if (date.getHours() < 12) {
            this.setState({ greetings: "Good morning.", imgLoad: require('../assets/BreakfastBg.jpg') });
        }
        if (date.getHours() >= 12 && date.getHours() < 16) {
            this.setState({ greetings: "Good afternoon.", imgLoad: require('../assets/LunchBg.jpg') });
        }
        else if (date.getHours() >= 16) {
            this.setState({ greetings: "Good evening.", imgLoad: require('../assets/DinnerBg.png') });
        }


    }

    getUserData = () => {
        console.log("HomeScreen getUserData()");
        this.retrieveItem('UserData').then((user) => {
            if (user == null) {
                this.setState({ ifnotLoggedIn: true });
            }
            else if (user != null) {
                // console.log("USer Data", user);
                this.setState({ Code: user.CustomerReferralCode.toUpperCase(), walletMoney: user.WalletMoney, customerName: user.CustomerName, customerId: user.uuid, ifnotLoggedIn: false, referralCode: user.CustomerReferralCode }, () => this.fetchOngoingOrders());
                fetch(BASE_PATH + Global.FETCH_USER_DATA_URL, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ uuid: user.uuid })
                }).then((response) => response.json()).then((responseJson) => {
                    if (responseJson.Success == 'Y') {
                        if (user.WalletMoney != responseJson.CustomerWalletMoney) {
                            this.setState({ walletMoney: responseJson.CustomerWalletMoney });
                            user.WalletMoney = responseJson.CustomerWalletMoney;
                            this.storeItem("UserData", user);
                        }
                    }
                }).catch((error) => {
                    console.log("Error Wallet Update: ", error);
                    ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
                });
            }
            this.setState({ isReady: true });
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    checkLastOrder = () => {
        console.log("HomeScreen checkLastOrder()");
        this.retrieveItem('UserData').then((user) => {
            if (user != null) {
                fetch(BASE_PATH + Global.USER_LAST_ORDER_URL, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'uuid': user.uuid
                    })
                }).then((response) => response.json()
                ).then((responseData) => {
                    if (responseData.Success == "Y") {
                        this.setState({ visibleModal: 10, orderFeedback: responseData.OrderInfo });
                    }
                }).catch((error) => {
                    console.log("Error Last Order: ", error);
                    ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
                });
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    getTrendingCategories = () => {
        console.log("HomeScreen getTrendingCategories()");
        fetch(BASE_PATH + Global.FETCH_TRENDING_CATEGORIES_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => response.json()).then((responseJson) => {
            if (responseJson.Success == 'Y') {
                this.setState({ tendingCategoriesSource: responseJson.Data, trendingCategories: false });
            }
            else {
                this.setState({ tendingCategoriesSource: [], trendingCategories: false });
            }
        }).catch((error) => {
            console.log("Error Trending Categories: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
        });
    }

    // fetchTopSellings = () => {
    //     console.log("HomeScreen fetchTopSellings()");
    //     fetch(BASE_PATH + Global.FETCH_TOPS_SELLING_PRODUCST, {
    //         method: "POST",
    //         headers: {
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //             "cityCode": this.state.cityCode,
    //             "locCode": this.state.locCode,
    //             "reqFrom": "APP",
    //         })
    //     }).then((response) => response.json()).then((responseJson) => {
    //         console.log("HomeScreen fetchTopSellings response : ", responseJson);
    //         if (responseJson.Success == 'Y') {
    //             this.setState({ topSellingSource: responseJson.Data, trendingCategories: false });
    //         }
    //         else {
    //             this.setState({ topSellingSource: [], trendingCategories: false });
    //         }
    //     }).catch((error) => {
    //         console.log("Error Top Sellings: ", error);
    //         ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
    //     });
    // }


    getPincode = () => {
        console.log("HomeScreen getPincode()");
        this.retrieveItem('Address').then((data) => {
            console.log("Showing for pincode", data.pincode, data.bAvail);
            this.setState({ pincode: data.pincode, cityCode: data.cityCode, locCode: data.locCode });
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    initCartItems = () => {
        console.log("HomeScreen initCartItems()");
        this.retrieveItem('CartItems').then((uCart) => {
            console.log("Type of uCart: ", typeof uCart, uCart);
            let type = "R";
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

        // if (Object.keys(this.state.itemToBeAdded).length != 0) {
        //     console.log("Item Is Not Empty");
        //     this.addProductToCart(this.state.itemToBeAdded);
        //     this.setState({ itemToBeAdded: {} })
        // }
        // else {
        //     console.log("Item Is empty");
        // }

    }

    getNewBawarchies = () => {
        console.log("HomeScreen getNewBawarchies()", this.state.cityCode);
        let formValue = JSON.stringify({
            "cityCode": this.state.cityCode,
            "locCode": this.state.locCode,
            "reqFrom": "APP",
        });
        console.log("getNewBawarchies() formValue : ", formValue);
        fetch(BASE_PATH + Global.FETCH_NEW_CHEFS_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseJson) => {
            console.log("getNewBawarchies() response : ", responseJson);
            if (responseJson.Success == 'Y') {
                this.setState({ newChefsSource: responseJson.Data, offers: false });
            }
        }).catch((error) => {
            console.log("Error getNewBawarchies : ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
        });
    }

    getBestChefs = () => {
        console.log("HomeScreen getBestChefs()", this.state.cityCode);
        let formValue = JSON.stringify({
            "cityCode": this.state.cityCode,
            "locCode": this.state.locCode,
            "reqFrom": "APP",
        });
        console.log("getBestChefs() formValue : ", formValue);
        fetch(BASE_PATH + Global.FETCH_BEST_CHEFS_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseJson) => {
            console.log("getBestChefs() response : ", responseJson);
            if (responseJson.Success == 'Y') {
                this.setState({ bestChefsSource: responseJson.Data, offers: false });
            }
        }).catch((error) => {
            console.log("Error getBestChefs: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
        });
    }

    fetchDashBoardOffers = () => {
        console.log("HomeScreen fetchDashBoardOffers()", this.state.cityCode);
        fetch(BASE_PATH + Global.FETCH_DASHBOARD_OFFERS_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "cityCode": this.state.cityCode,
                "reqFrom": "APP"
            })
        }).then((response) => response.json()).then((responseJson) => {
            if (responseJson.Success == 'Y') {
                const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
                this.setState({ dataSource1: ds.cloneWithRows(responseJson.Data), offers: false });
            }
        }).catch((error) => {
            console.log("Error Dashboard Offers: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
        });
    }

    fetchOngoingOrders = () => {
        console.log("HomeScreen fetchOngoingOrders()");
        if (this.state.customerId != "") {

            const formValue = JSON.stringify({
                "reqFrom": "APP",
                "uuid": this.state.customerId,
            });
            console.log("FETCH_ONGOING_ORDERS_URL formValue : ", formValue);
            fetch(BASE_PATH + Global.FETCH_ONGOING_ORDERS_URL, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: formValue,
            }).then((response) => response.json()).then((responseJson) => {
                console.log("FETCH_ONGOING_ORDERS_URL response : ", responseJson)
                if (responseJson.Success == 'Y') {
                    this.setState({ ongoingOrdersData: responseJson.Data, showLiveOrders: true });
                }
            }).catch((error) => {
                console.log("Error Ongoing Orders: ", error);
                ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            });
        }

    }


    fetchRecommendedProducts = () => {
        console.log("HomeScreen fetchRecommendedProducts()");
        fetch(BASE_PATH + Global.FETCH_RECOMMENDED_PRODUCT_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "cityCode": this.state.cityCode,
                "locCode": this.state.locCode,
                "reqFrom": "APP",
            })
        }).then((response) => response.json()).then((responseJson) => {
            if (responseJson.Success == 'Y') {
                let matchedArr = this.matchWithCart(JSON.parse(JSON.stringify(responseJson.Data)));
                this.setState({ recommendedSource: matchedArr, topSellingLoader: false });
            }
        }).catch((error) => {
            console.log("Error Recommended Products: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
        });
    }

    fetchNewArrivals = () => {
        console.log("HomeScreen fetchNewArrivals()");
        let formValue = JSON.stringify({
            "cityCode": this.state.cityCode,
            "locCode": this.state.locCode,
            "reqFrom": "APP",
        });
        console.log("HomeScreen fetchnewArrivals formvalue :", formValue);
        fetch(BASE_PATH + Global.FETCH_NEW_ARRIVAL_PRODUCTS, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseJson) => {
            console.log("HomeScreen fetchNewArrivals response : ", responseJson);
            if (responseJson.Success == 'Y') {
                let matchedArr = this.matchWithCart(JSON.parse(JSON.stringify(responseJson.Data)));
                this.setState({ newArrivalSource: matchedArr, trendingCategories: false });
            }
            else {
                this.setState({ newArrivalSource: [], trendingCategories: false });
            }
        }).catch((error) => {
            console.log("Error New Arrivals: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
        });
    }

    fetchOnOffers = () => {
        console.log("HomeScreen fetchOnOffers()");
        let formValue = JSON.stringify({
            "cityCode": this.state.cityCode,
            "locCode": this.state.locCode,
            "reqFrom": "APP",
        });
        console.log("HomeScreen fetchOnOffers formvalue :", formValue);
        fetch(BASE_PATH + Global.FETCH_ON_OFFER_PRODUCTS, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseJson) => {
            console.log("HomeScreen fetchOnOffers response : ", responseJson);
            if (responseJson.Success == 'Y') {
                let matchedArr = this.matchWithCart(JSON.parse(JSON.stringify(responseJson.Data)));
                this.setState({ onOffersSource: matchedArr, trendingCategories: false });
            }
            else {
                this.setState({ onOffersSource: [], trendingCategories: false });
            }
        }).catch((error) => {
            console.log("Error On Offers: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
        });
    }

    fetchComboMealsForYou = () => {
        console.log("HomeScreen fetchComboMealsForYou()");
        let formValue = JSON.stringify({
            "cityCode": this.state.cityCode,
            "locCode": this.state.locCode,
            "reqFrom": "APP",
        });
        console.log("HomeScreen fetchComboMealsForYou formvalue :", formValue);
        fetch(BASE_PATH + Global.FETCH_COMBO_MEALS_FOR_YOU_PRODUCTS, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: formValue
        }).then((response) => response.json()).then((responseJson) => {
            console.log("HomeScreen fetchComboMealsForYou response : ", responseJson);
            if (responseJson.Success == 'Y') {
                let matchedArr = this.matchWithCart(JSON.parse(JSON.stringify(responseJson.Data)));
                this.setState({ comboMealsForYouSource: matchedArr, trendingCategories: false });
            }
            else {
                this.setState({ comboMealsForYouSource: [], trendingCategories: false });
            }
        }).catch((error) => {
            console.log("Error Combo Meals For You: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
        });
    }


    matchWithCart = (tempArr) => {
        //console.log("initCart called cart lenght: ", this.state.cartItems, tempArr);
        for (let i = 0; i < tempArr.length; i++) {
            let qty = 0;
            let addons = [];
            let vrnt = {};
            let ctr = 0;
            if (this.state.cartTypeFlag == "R") {
                for (let j = 0; j < this.state.cartItems.length; j++) {
                    if (typeof this.state.cartItems[j].ProdType != 'undefined' && this.state.cartItems[j].ProdType == "R") {
                        if (tempArr[i].ProductId == this.state.cartItems[j].ProductId && tempArr[i].VId == this.state.cartItems[j].VId) {
                            qty += this.state.cartItems[j].Qty;
                            addons = this.state.cartItems[j].Addons;
                            vrnt = this.state.cartItems[j].Variant;
                            ctr++;
                        }
                    }
                }
            }
            tempArr[i].Qty = qty;
            tempArr[i].VarLen = tempArr[i].Variants.length;
            tempArr[i].AdnLen = tempArr[i].Addons.length;
            if (ctr == 1) {
                tempArr[i].Addons = addons;
                tempArr[i].Variant = vrnt;
            }
        }
        return JSON.parse(JSON.stringify(tempArr));
    }

    openCustomization = (item) => {
        console.log("ProductScreen openCustomization() item: ", item)
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        console.log("Variants length", item.Variants.length);
        console.log("Addons length", item.Addons.length);
        let obj = JSON.parse(JSON.stringify(item));
        for (let i = 0; i < obj.Variants.length; i++) {
            obj.Variants[i].Selected = false;
        }
        for (let i = 0; i < obj.Addons.length; i++) {
            obj.Addons[i].Selected = false;
        }
        obj.aLen = obj.Addons.length;
        obj.vLen = obj.Variants.length;
        obj.Adns = JSON.parse(JSON.stringify(obj.Addons));
        obj.Vrnts = JSON.parse(JSON.stringify(obj.Variants));
        obj.Variants = ds.cloneWithRows(obj.Variants);
        obj.Addons = ds.cloneWithRows(obj.Addons);

        this.setState({
            custProd: obj, custProdTotal: obj.OfferPrice, visibleModal: 7, customisationModal: 7
        });
    }

    selectVariant = (vrnt, custProd, str) => {
        console.log("selectVariant() vrnt: ", vrnt, " && custProd: ", custProd, " && str: ", str);
        let varArr = custProd.Vrnts;
        let idx = -1;
        let vidx = -1;
        if (str == "YES") {
            for (let i = 0; i < varArr.length; i++) {
                if (varArr[i].Id == vrnt.Id) {
                    vidx = i;
                    break;
                }
            }
        }
        console.log("vidx: ", vidx, " && idx: ", idx);
        let vp = 0;
        if (str == "YES") {
            this.setState({ selVar: JSON.parse(JSON.stringify(vrnt)) });
            vp = eval(vrnt.Price);
        }
        else {
            this.setState({ selVar: JSON.parse(JSON.stringify({})) });
        }
        for (let i = 0; i < varArr.length; i++) {
            varArr[i].Selected = (i == vidx);
        }
        console.log("selVar: ", this.state.selVar);
        let adnTotal = 0;
        for (let i = 0; i < this.state.selAdn.length; i++) {
            adnTotal += eval(this.state.selAdn[i].Price);
        }
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        custProd.Vrnts = JSON.parse(JSON.stringify(varArr));
        custProd.Variants = ds.cloneWithRows(JSON.parse(JSON.stringify(varArr)));
        this.setState({ custProdTotal: (eval(custProd.OfferPrice) + adnTotal + vp).toFixed(2), custProd: custProd });
    }

    selectAddon = (adn, custProd) => {
        console.log("selectAddon() adn: ", adn);
        let selAdn = this.state.selAdn;
        let adnArr = custProd.Adns;
        let idx = -1;
        let vidx = -1;
        for (let i = 0; i < adnArr.length; i++) {
            if (adnArr[i].Id == adn.Id) {
                vidx = i;
                break;
            }
        }

        for (let i = 0; i < selAdn.length; i++) {
            if (selAdn[i].Id == adn.Id) {
                idx = i;
                break;
            }
        }
        // console.log("vidx: ", vidx, " && idx: ", idx);
        if (idx > -1) {
            selAdn.splice(idx, 1);
            if (vidx > -1) {
                adnArr[vidx].Selected = false;
            }
        }
        else {
            selAdn.push(adn);
            if (vidx > -1) {
                adnArr[vidx].Selected = true;
            }
        }
        let adnTotal = 0;
        for (let i = 0; i < selAdn.length; i++) {
            adnTotal += eval(selAdn[i].Price);
        }
        let vp = 0;
        if (!this.isEmptyObject(this.state.selVar)) {
            vp = eval(this.state.selVar.Price);
        }
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        // console.log("adnArr: ", adnArr);
        custProd.Adns = JSON.parse(JSON.stringify(adnArr));
        custProd.Addons = ds.cloneWithRows(JSON.parse(JSON.stringify(adnArr)));
        this.setState({ custProdTotal: (eval(custProd.OfferPrice) + adnTotal + vp).toFixed(2), selAdn: selAdn, custProd: custProd });
    }

    emptyCart = () => {
        console.log("CartScreen emptyCart()");
        this.setState({ cartItems: [], cartTypeFlag: 'R' });
        this.storeItem("CartItems", []);
        ToastAndroid.show("Cart emptied", ToastAndroid.SHORT);
        this.setState({ replaceCartItems: false })
        this.initCartItems();
    }

    addProductToCart = (item) => {
        console.log("ProductScreen addProductToCart() item:", item, this.state.cartTypeFlag);
        // this.setState({ itemToBeAdded: item })
        if (this.state.cartTypeFlag == "R") {
            let cartItems = this.state.cartItems;
            let cartObj = this.createCartObject(item, "ADD");
            console.log("cartObj: ", cartObj);
            let cIdx = -1;
            for (let i = 0; i < cartItems.length; i++) {
                if (cartItems[i].VId == cartObj.VId && cartItems[i].ProductId == cartObj.ProductId) {
                    if (!this.isEmptyObject(cartObj.Variant) && !this.isEmptyObject(cartItems[i].Variant)) {
                        console.log("Not empty variant");
                        if (cartObj.Variant.Id == cartItems[i].Variant.Id) {
                            let ctr = 0;
                            for (let x = 0; x < cartItems[i].Addons.length; x++) {
                                for (let y = 0; y < cartObj.Addons.length; y++) {
                                    if (cartObj.Addons[y].Id == cartItems[i].Addons[x].Id) {
                                        ctr++;
                                        break;
                                    }
                                }
                            }
                            if (ctr == cartObj.Addons.length) {
                                cIdx = i;
                                break;
                            }
                        }
                    }
                    else if (this.isEmptyObject(cartObj.Variant) && this.isEmptyObject(cartItems[i].Variant)) {
                        console.log("Empty variant");
                        let ctr = 0;
                        for (let x = 0; x < cartItems[i].Addons.length; x++) {
                            for (let y = 0; y < cartObj.Addons.length; y++) {
                                if (cartObj.Addons[y].Id == cartItems[i].Addons[x].Id) {
                                    ctr++;
                                    break;
                                }
                            }
                        }
                        if (ctr == cartObj.Addons.length) {
                            cIdx = i;
                            break;
                        }
                    }
                }
            }
            console.log("cIdx: ", cIdx);
            let str = "Item added";
            if (cIdx > -1) {
                item.Qty += 1;
                cartItems[cIdx].Qty += 1;
                str = "Item updated";
            }
            else {
                item.Qty = 1;
                cartObj.Qty = item.Qty;
                cartItems.push(JSON.parse(JSON.stringify(cartObj)));
            }
            this.setState({ itemCount: cartItems.length, cartItems: cartItems, visibleModal: null });
            this.updateProductList(item, str);
        }
        else {
            // ToastAndroid.show("Chef food cannot be added with other food. Please clear the cart and continue adding.", ToastAndroid.SHORT);
            this.setState({ replaceCartItems: true, customisationModal: null })
        }
    }

    removeProductFromCart = (item) => {
        console.log("ProductScreen removeProductFromCart() item: ", item, this.state.cartTypeFlag);
        if (this.state.cartTypeFlag == "R") {
            let cartItems = this.state.cartItems;
            let cartObj = this.createCartObject(item, "REM");
            console.log("cartObj: ", cartObj);
            let cIdx = -1;
            let ctr = 0;
            for (let i = 0; i < cartItems.length; i++) {
                if (cartItems[i].VId == cartObj.VId && cartItems[i].ProductId == cartObj.ProductId) {
                    console.log(cartObj.Variant, cartItems[i].Variant);
                    if (!this.isEmptyObject(cartObj.Variant) && !this.isEmptyObject(cartItems[i].Variant)) {
                        if (cartObj.Variant.Id == cartItems[i].Variant.Id) {
                            let cntr = 0;
                            for (let x = 0; x < cartItems[i].Addons.length; x++) {
                                for (let y = 0; y < cartObj.SelAdns.length; y++) {
                                    if (cartObj.Addons[y].Id == cartItems[i].Addons[x].Id) {
                                        cntr++;
                                        break;
                                    }
                                }
                            }
                            if (cntr == cartItems[i].Addons.length) {
                                cIdx = i;
                            }
                        }
                    }
                    else if (this.isEmptyObject(cartObj.Variant) && this.isEmptyObject(cartItems[i].Variant)) {
                        let cntr = 0;
                        for (let x = 0; x < cartItems[i].Addons.length; x++) {
                            for (let y = 0; y < cartObj.SelAdns.length; y++) {
                                if (cartObj.SelAdns[y].Id == cartItems[i].Addons[x].Id) {
                                    cntr++;
                                    break;
                                }
                            }
                        }
                        if (cntr == cartItems[i].Addons.length) {
                            cIdx = i;
                        }
                    }
                    ctr++;
                }
            }
            console.log("cIdx: ", cIdx, ctr);
            let str = "Item updated";
            if (cIdx > -1 && ctr == 1) {
                item.Qty -= 1;
                if (item.Qty > 0) {
                    cartItems[cIdx].Qty -= 1;
                }
                else {
                    cartItems.splice(cIdx, 1);
                    str = "Item removed";
                }
                this.setState({ itemCount: cartItems.length, cartItems: cartItems });
                this.updateProductList(item, str);
            }
            else {
                ToastAndroid.show("More than one variant is added for this item. Please remove from cart.", ToastAndroid.SHORT);
            }
        }
        else {
            // ToastAndroid.show("Chef food cannot be added with other food. Please clear the cart and continue adding.", ToastAndroid.SHORT);
            this.setState({ replaceCartItems: true, })
        }
    }

    createCartObject = (pd, str) => {
        let prod = JSON.parse(JSON.stringify(pd));
        let obj = {
            VId: prod.VId,
            ProductId: prod.ProductId,
            ProdType: prod.ProdType,
            ProductName: prod.ProductName,
            ProductPrice: prod.ProductPrice,
            ProductPackingCharge: prod.ProductPackingCharge,
            ProductVeganType: prod.ProductVeganType,
            ProductAvgCookingTime: prod.ProductAvgCookingTime,
            ProductRestaurantRating: prod.ProductRestaurantRating,
            ProductRestaurantAvailabilityTime: prod.ProductRestaurantAvailabilityTime,
            ProductDescription: prod.ProductDescription,
            ImageAvailable: prod.ImageAvailable,
            ProductImage: prod.ProductImage,
            TimeSlot: prod.TimeSlot,
            OfferPrice: prod.OfferPrice,
            Addable: prod.Addable,
            OfferApplied: prod.OfferApplied,
            AvailableIn: prod.AvailableIn,
            Variant: {},
            Addons: []
        };
        if (str == "ADD") {
            obj.Variant = JSON.parse(JSON.stringify(this.state.selVar));
            obj.Addons = JSON.parse(JSON.stringify(this.state.selAdn));
        }
        else if (str == "REM") {
            if (typeof prod.Variant != 'undefined') {
                obj.Variant = JSON.parse(JSON.stringify(prod.Variant));
            }
            obj.Addons = JSON.parse(JSON.stringify(prod.Addons));
        }
        return JSON.parse(JSON.stringify(obj));
    }

    updateProductList(prod, str) {
        console.log("ProductScreen updateProductList() prod: ", prod);
        let itemsArr = JSON.parse(JSON.stringify(this.state.recommendedSource));
        for (let i = 0; i < itemsArr.length; i++) {
            if (itemsArr[i].ProductId == prod.ProductId && itemsArr[i].VId == prod.VId) {
                let qty = 0;
                /*let addons = [];
                let vrnt = {};
                let ctr = 0;*/
                for (let j = 0; j < this.state.cartItems.length; j++) {
                    if (typeof this.state.cartItems[j].ProdType != 'undefined' && this.state.cartItems[j].ProdType == "R") {
                        if (prod.ProductId == this.state.cartItems[j].ProductId && prod.VId == this.state.cartItems[j].VId) {
                            qty += eval(this.state.cartItems[j].Qty);
                            /*addons = Object.assign([], this.state.cartItems[j].Addons);
                            vrnt = Object.assign({}, this.state.cartItems[j].Variant);
                            ctr++;*/
                        }
                    }
                }
                itemsArr[i].Qty = qty;
                /*if (ctr == 1) {
                  this.prodList[i].Addons = Object.assign([], addons);
                  this.prodList[i].Variant = Object.assign({}, vrnt);
                }*/
                console.log("Category Products Updated");
                break;
            }
        }

        // for Newarrivals
        let itemsArrNewArrival = JSON.parse(JSON.stringify(this.state.newArrivalSource));
        for (let i = 0; i < itemsArrNewArrival.length; i++) {
            if (itemsArrNewArrival[i].ProductId == prod.ProductId && itemsArrNewArrival[i].VId == prod.VId) {
                let qty = 0;
                /*let addons = [];
                let vrnt = {};
                let ctr = 0;*/
                for (let j = 0; j < this.state.cartItems.length; j++) {
                    if (typeof this.state.cartItems[j].ProdType != 'undefined' && this.state.cartItems[j].ProdType == "R") {
                        if (prod.ProductId == this.state.cartItems[j].ProductId && prod.VId == this.state.cartItems[j].VId) {
                            qty += eval(this.state.cartItems[j].Qty);
                            /*addons = Object.assign([], this.state.cartItems[j].Addons);
                            vrnt = Object.assign({}, this.state.cartItems[j].Variant);
                            ctr++;*/
                        }
                    }
                }
                itemsArrNewArrival[i].Qty = qty;
                /*if (ctr == 1) {
                  this.prodList[i].Addons = Object.assign([], addons);
                  this.prodList[i].Variant = Object.assign({}, vrnt);
                }*/
                console.log("Category Products Updated");
                break;
            }
        }



        // for OnOffers
        let itemsArrOnOffer = JSON.parse(JSON.stringify(this.state.onOffersSource));
        for (let i = 0; i < itemsArrOnOffer.length; i++) {
            if (itemsArrOnOffer[i].ProductId == prod.ProductId && itemsArrOnOffer[i].VId == prod.VId) {
                let qty = 0;
                /*let addons = [];
                let vrnt = {};
                let ctr = 0;*/
                for (let j = 0; j < this.state.cartItems.length; j++) {
                    if (typeof this.state.cartItems[j].ProdType != 'undefined' && this.state.cartItems[j].ProdType == "R") {
                        if (prod.ProductId == this.state.cartItems[j].ProductId && prod.VId == this.state.cartItems[j].VId) {
                            qty += eval(this.state.cartItems[j].Qty);
                            /*addons = Object.assign([], this.state.cartItems[j].Addons);
                            vrnt = Object.assign({}, this.state.cartItems[j].Variant);
                            ctr++;*/
                        }
                    }
                }
                itemsArrOnOffer[i].Qty = qty;
                /*if (ctr == 1) {
                  this.prodList[i].Addons = Object.assign([], addons);
                  this.prodList[i].Variant = Object.assign({}, vrnt);
                }*/
                console.log("Category Products Updated");
                break;
            }
        }



        // for comboMealsforYou
        let itemsArrComboMeals = JSON.parse(JSON.stringify(this.state.comboMealsForYouSource));
        for (let i = 0; i < itemsArrComboMeals.length; i++) {
            if (itemsArrComboMeals[i].ProductId == prod.ProductId && itemsArrComboMeals[i].VId == prod.VId) {
                let qty = 0;
                /*let addons = [];
                let vrnt = {};
                let ctr = 0;*/
                for (let j = 0; j < this.state.cartItems.length; j++) {
                    if (typeof this.state.cartItems[j].ProdType != 'undefined' && this.state.cartItems[j].ProdType == "R") {
                        if (prod.ProductId == this.state.cartItems[j].ProductId && prod.VId == this.state.cartItems[j].VId) {
                            qty += eval(this.state.cartItems[j].Qty);
                            /*addons = Object.assign([], this.state.cartItems[j].Addons);
                            vrnt = Object.assign({}, this.state.cartItems[j].Variant);
                            ctr++;*/
                        }
                    }
                }
                itemsArrComboMeals[i].Qty = qty;
                /*if (ctr == 1) {
                  this.prodList[i].Addons = Object.assign([], addons);
                  this.prodList[i].Variant = Object.assign({}, vrnt);
                }*/
                console.log("Category Products Updated");
                break;
            }
        }

        let total = 0;
        for (let i = 0; i < this.state.cartItems.length; i++) {
            let vrntPrice = 0;
            if (!this.isEmptyObject(this.state.cartItems[i].Variant)) {
                vrntPrice = eval(this.state.cartItems[i].Variant.Price);
            }
            let adnPrice = 0;
            for (let j = 0; j < this.state.cartItems[i].Addons.length; j++) {
                adnPrice += eval(this.state.cartItems[i].Addons[j].Price);
            }
            total += (this.state.cartItems[i].Qty * (eval(this.state.cartItems[i].OfferPrice) + vrntPrice + adnPrice));
        }
        this.setState({ payableAmount: total.toFixed(2), recommendedSource: itemsArr, newArrivalSource: itemsArrNewArrival, onOffersSource: itemsArrOnOffer, comboMealsForYouSource: itemsArrComboMeals });
        ToastAndroid.show(str, ToastAndroid.SHORT);
        this.storeItem("CartItems", JSON.stringify(this.state.cartItems));
    }

    allCategories = () => {
        console.log("HomeScreen allCategories()");
        this.props.navigation.navigate("Categories");
    }

    checkServiceAvailable = () => {
        console.log("HomeScreen checkServiceAvailable()");
        this.retrieveItem('Address').then((data) => {
            if (data == null) {
                this.props.navigation.navigate('Location');
            }
            else {
                // console.log("HomeScreen checkServiceAvailable() Address :", data);
                this.setState({ cityCode: data.cityCode, locCode: data.locCode });
                if (data.fAvail && data.bAvail) {
                    this.setState({ foodService: true, bawarchiService: true }, () => {
                        this.getGreetings();
                        this.getUserData();
                        this.fetchDashBoardOffers();
                        this.getTrendingCategories();
                        //this.fetchTopSellings();
                        this.fetchNewArrivals();
                        this.getNewBawarchies();
                        this.getBestChefs();
                        this.fetchOnOffers();
                        this.fetchComboMealsForYou();
                        this.fetchRecommendedProducts();
                        // this.fetchOngoingOrders();
                    });
                }
                else if (data.bAvail) {
                    this.setState({ bawarchiService: true, foodService: false }, () => {
                        this.getGreetings();
                        this.getUserData();
                        this.getNewBawarchies();
                        this.getBestChefs();
                        this.fetchDashBoardOffers();
                    });
                }
                else if (data.fAvail) {
                    this.setState({ bawarchiService: false, foodService: true }, () => {
                        this.getGreetings();
                        this.getUserData();
                        this.fetchDashBoardOffers();
                        this.getTrendingCategories();
                        //this.fetchTopSellings();
                        this.fetchNewArrivals();
                        this.fetchOnOffers();
                        this.fetchComboMealsForYou();
                        this.fetchRecommendedProducts();
                    });
                }
                else {
                    this.setState({ bawarchiService: false, foodService: false });
                }
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    checkKitchenStatus = () => {
        console.log("HomeScreen checkKitchenStatus()");
        this.retrieveItem('KitchenStatus').then((data) => {
            console.log("Data: ", data);
            if (data != null) {
                if (data != "OPEN") {
                    this.setState({ kitchenClosed: true });
                }
                else {
                    this.setState({ kitchenClosed: false });
                }
            }
            else {
                this.setState({ kitchenClosed: false });
            }
            this.checkServiceAvailable();
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
            this.checkServiceAvailable();
        });
    }

    showProducts = (categoryId, categoryName) => {
        console.log("HomeScreen showProducts() categoryId: ", categoryId, " && categoryName: ", categoryName);
        this.props.navigation.navigate('Products', { cId: categoryId, cName: categoryName })
    }

    showQuickPickProducts = (quickPickType) => {
        console.log("HomeScreen showQuickPickProducts() QuickPickType: ", quickPickType);
        this.props.navigation.navigate('QuickPickProducts', { quickPickType: quickPickType, cId: quickPickType, cName: quickPickType })
    }

    shareCode = () => {
        this.setState({ Sending: true })
        Share.share(
            {
                title: "Free Meal Invite",
                message: "Hey! I'm inviting you to download BringMyFood, the best food ordering & delivery app. Here's my code " + this.state.Code + " - just enter it while signup and get ₹250 in your wallet. Once you've placed your first order I get ₹250!. Download here http://onelink.to/bmfapp"
                , url: 'http://onelink.to/bmfapp'
            }).then(result => console.log(result)).catch(errorMsg => console.log(errorMsg));
    }

    captureProductFeedback = (item, str) => {
        console.log("HomeScreen captureProductFeedback() str: ", str);
        let orderFeedback = this.state.orderFeedback;
        let idx = orderFeedback.ItemDetails.indexOf(item);
        console.log("Idx found: ", idx);
        if (idx > -1) {
            orderFeedback.ItemDetails[idx].Liked = str;
            this.setState({ orderFeedback: orderFeedback });
        }
    }

    saveFeedback = () => {
        console.log("FeedbackScreen saveFeedback() rating: ", this.state.rating, " && cutomerId: ", this.state.customerId);
        let products = [];
        for (let i = 0; i < this.state.orderFeedback.ItemDetails.length; i++) {
            if (this.state.orderFeedback.ItemDetails[i].Liked != "") {
                let obj = { pid: this.state.orderFeedback.ItemDetails[i].PId, vid: this.state.orderFeedback.ItemDetails[i].VId, liked: this.state.orderFeedback.ItemDetails[i].Liked };
                products.push(obj);
            }
        }
        if (this.state.orderFeedback.ItemDetails.length == products.length) {
            if (this.state.rating != "" && this.state.customerId != "" && this.state.orderFeedback.OrderId != "" && products.length > 0 && !this.state.feedbackLoader) {
                this.setState({ feedbackLoader: true });
                let formValue = { products: JSON.stringify(products), orderId: this.state.orderFeedback.OrderId, uuid: this.state.customerId, orderRating: this.state.rating, orderFeedback: this.state.feedback, reqFrom: "APP" };
                console.log("formValue: ", JSON.stringify(formValue));
                fetch(BASE_PATH + Global.RATE_ORDER_URL, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formValue)
                }).then((response) => response.json()).then((responseData) => {
                    if (responseData.Success == "Y") {
                        ToastAndroid.show("Thanks for the feedback.", ToastAndroid.SHORT);
                        this.setState({ visibleModal: null, feedbackLoader: false });
                        this.checkLastOrder();
                    }
                    else {
                        ToastAndroid.show(responseData.Message, ToastAndroid.SHORT);
                        this.setState({ feedbackLoader: true });
                    }
                }).catch((error) => {
                    console.log("Error Feedback Save: ", error);
                    ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
                });
            }
        }
        else {
            ToastAndroid.show("Please rate each food.", ToastAndroid.SHORT);
        }
    }

    showTrackDetails(mode, item) {
        console.log("HomeScreen showTrackDetails() : ", mode);
        if (mode == "TRACK") {
            // this.setState({ visibleModal: 7 })
        }

        if (mode == "VIEW") {
            console.log("currentOngoingOrder : ", item);
            this.setState({ currentOngoingOrder: item, visibleModal: 12 })
        }
    }

    changeRejectionReason(reason) {
        console.log("Reason Selected", reason.Reason);
        this.setState({ exitModal: null, specifyReason: false })
        if (this.state.ifnotLoggedIn == false && this.state.customerId != "") {
            const formValue = JSON.stringify({
                "uuid": this.state.customerId,
                "reason": reason.Reason
            })
            console.log("APP_EXIT_REASON formValue :", formValue)
            fetch(BASE_PATH + Global.APP_EXIT_REASON, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: formValue
            }).then((response) => response.json()).then((responseJson) => {
                if (responseJson.Success == 'Y') {

                }
            }).catch((error) => {
                console.log("Error Updating Reason: ", error);
                // ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            });
        }
        BackHandler.exitApp();
    }

    navigateToOffer = (offerData) => {
        console.log("HomeScreen navigateToOffer() :", offerData);
        if (offerData.BannerText != "") {
            if (offerData.BannerText.substring(0, 3) == "LNK") {
                let type = offerData.BannerText.substring(5, 8);
                console.log("Type : ", type);
                let link = offerData.BannerText.substring(10, offerData.BannerText.length);
                if (type == "SHR") {
                    if (this.state.customerId != "") {
                        Share.share(
                            {
                                title: "Free Meal Invite",
                                message: "Hey! I'm inviting you to download BringMyFood, the best food ordering & delivery app. Here's my code " + this.state.referralCode + " - just enter it while signup and get ₹250 in your wallet. Once you've placed your first order I get ₹250!. Download here http://onelink.to/bmfapp"
                                , url: link
                            }).then(result => console.log(result)).catch(errorMsg => console.log(errorMsg));
                    } else {
                        Alert.alert("Please login to share");
                    }

                }
                else {
                    console.log("Open Link : ", link);
                    Web(link);
                }
            }
            else {
                let ar = offerData.BannerText.split("^^");
                if (ar[0] == "CAT") {
                    console.log("Category Found");
                    this.props.navigation.navigate('Products', { cId: ar[1], cName: ar[2] })
                }
                if (ar[0] == "SCR") {
                    console.log("Screen Found");
                    this.props.navigation.navigate(ar[1]);
                }
            }
        } else {
            console.log("No banner text");
        }


    }
    __renderOrderDetails = () => (
        <View style={styles.detailModalContainer}>
            <View style={[styles.mainHeaderContainer, styles.header]}>
                <Text style={[styles.textBig]}>Order Details {this.state.currentOngoingOrder.OrderId}</Text>
                <View style={{ alignSelf: 'flex-end', padding: 5, backgroundColor: '#2dbe60', borderRadius: 4 }}>
                    <Text style={{ fontSize: (this.state.currentOngoingOrder.OTP == "N/A" ? 14 : 18), fontWeight: (this.state.currentOngoingOrder.OTP == "N/A" ? '100' : '500'), color: '#fff' }}> {this.state.currentOngoingOrder.OTP == "N/A" ? "Otp Not Available" : this.state.currentOngoingOrder.OTP} </Text>
                </View>
            </View>
            <ScrollView >
                <View style={styles.modalBody}>
                    <View style={[styles.itemList]}>
                        {
                            this.state.currentOngoingOrder.Items.map((item, index) => (
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
                                <Text>₹{this.state.currentOngoingOrder.OrderDeliveryCharge}</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1, }}>
                            <View style={styles.box}>
                                <Text style={{ color: '#cd2121', fontSize: 14 }}>Packaging Charge</Text>
                                <Text>₹{this.state.currentOngoingOrder.OrderPackingCharge}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 0, flex: 2 }}>
                        <View style={{ flex: 1, }}>
                            <View style={styles.box}>
                                <Text style={{ color: '#cd2121', fontSize: 14 }}>Tax</Text>
                                <Text>₹{this.state.currentOngoingOrder.TaxCharge}</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1, }}>
                            <View style={styles.box}>
                                <Text style={{ color: '#cd2121', fontSize: 14 }}>Coupon Discount</Text>
                                <Text>₹{this.state.currentOngoingOrder.CouponSave}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 0, flex: 2 }}>
                        <View style={{ flex: 1, }}>
                            <View style={styles.box}>
                                <Text style={{ color: '#cd2121', fontSize: 14 }}>Wallet Deduction</Text>
                                <Text>₹{this.state.currentOngoingOrder.WalletDeduction}</Text>
                            </View>
                        </View>
                        <Display style={{ flex: 1, padding: 5 }} enable={eval(this.state.currentOngoingOrder.SurplusCharge) > 0}>
                            <View style={{ flex: 1, }}>
                                <View style={styles.box}>
                                    <Text style={{ color: '#cd2121', fontSize: 14 }}>Surplus Charge</Text>
                                    <Text>₹{this.state.currentOngoingOrder.SurplusCharge}</Text>
                                </View>
                            </View>
                        </Display>
                    </View>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 0, flex: 2 }}>
                        <View style={{ flex: 1, }}>
                            <View style={styles.box}>
                                <Text style={{ color: '#cd2121', fontSize: 14 }}>Net Payble</Text>
                                <Text style={{ fontSize: 20, fontWeight: '400' }}>₹{this.state.currentOngoingOrder.NetPayable}</Text>
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
                <Text>{this.state.orderDetails.OrderStatus}</Text>
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
                    <View style={{ flexDirection: 'row', paddingHorizontal: 0, flex: 2 }}>
                        <View style={{ flex: 1, }}>
                            <View style={styles.box}>
                                <Text style={{ color: '#cd2121', fontSize: 14 }}>Order Delivered</Text>
                                <Text style={{ fontSize: 20, fontWeight: '400' }}>@{this.state.trackOrder.DeliveredTime}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 0, flex: 2 }}>
                        <View style={{ flex: 1, }}>
                            <View style={styles.box}>
                                <Text style={{ color: '#cd2121', fontSize: 14 }}>Order Cancelled</Text>
                                <Text style={{ fontSize: 20, fontWeight: '400' }}>@{this.state.trackOrder.CancelledTime}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
    __renderExitModalContent = () => (
        <View style={styles.exitModalContainer}
        >
            <Display enable={!this.state.specifyReason} enter={'fadeIn'}
                exit={'fadeOut'} style={{ flex: 1.5, }}>
                <View style={{ flex: 1.5, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#cd2121', fontSize: 20, fontWeight: '300', }}>What went wrong ?</Text>
                    <Text style={{ color: '#3f3f3e', fontSize: 10, marginTop: 5, }}>You have left food items  in your cart ..</Text>
                    <TouchableOpacity style={{ backgroundColor: '#2dbe60', padding: 5, marginTop: 4 }} onPress={() => { this.setState({ exitModal: null }), this.props.navigation.navigate('Cart') }}>
                        <Text style={{ color: '#fff', fontWeight: '400', fontSize: 15 }}>ORDER NOW</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', marginTop: 3 }}>
                        <TouchableOpacity style={{ backgroundColor: '#cd2121', padding: 5, marginTop: 4, flexDirection: 'row' }} onPress={() => { this.setState({ exitModal: null }), this.props.navigation.navigate('HelpAndSupport') }} >
                            <Icon name='user-md' color='#fff' size={15} />
                            <Text style={{ color: '#fff', fontWeight: '400', fontSize: 15, marginLeft: 3 }}>CHAT</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ backgroundColor: '#cd2121', padding: 5, marginTop: 4, marginLeft: 5, flexDirection: 'row' }} onPress={() => { this.setState({ exitModal: null, }), Call('8339000801') }} >
                            <Icon name='phone' color='#fff' size={15} />
                            <Text style={{ color: '#fff', fontWeight: '400', fontSize: 15, marginLeft: 3 }}>CALL</Text>
                        </TouchableOpacity>
                    </View>
                    {/* <Text style={{ marginTop: 4, color: '#4f4f4d' }}>OR</Text>
                    <TouchableOpacity onPress={() => this.setState({ specifyReason: true })}>
                        <Text style={{ textDecorationLine: 'underline', marginTop: 2, color: '#999995', fontSize: 13 }}>Specify a Reason</Text>
                    </TouchableOpacity> */}
                </View>
                <View style={{ flex: 1, backgroundColor: '#f4ebbe', justifyContent: 'center', alignItems: 'center', padding: 10 }}>
                    <TouchableOpacity style={{ backgroundColor: '#efc200', alignSelf: 'center', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }} onPress={() => this.setState({ specifyReason: true })}>
                        <Text style={{ fontSize: 18, fontWeight: '600' }}>EXIT</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', marginTop: 6 }}>
                        <Text style={{ fontSize: 8, color: '#373131' }}>Have 2 mins in Improving us ?</Text>
                        <TouchableOpacity onPress={() => Linking.openURL("https://play.google.com/store/apps/details?id=in.bringmyfood&hl=en")}>
                            <Text style={{ textDecorationLine: 'underline', fontSize: 10, color: '#373131' }}> Review</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Display>
            <Display enable={this.state.specifyReason}
                enter={'fadeIn'}
                exit={'fadeOut'}
                style={{ flex: 1.5 }}
            >
                <View style={{ flexDirection: 'row', borderBottomColor: '#d6d4d4', borderBottomWidth: 1, padding: 6 }}>
                    <TouchableOpacity style={{ alignSelf: 'flex-start', }} onPress={() => this.setState({ specifyReason: false })}>
                        <Icon name={'arrow-left'} color='#000' size={20} />
                    </TouchableOpacity>
                    <Text style={{ marginLeft: 6, fontSize: 15, alignSelf: 'flex-start', color: '#968e8e' }}>Help Us Improving</Text>

                </View>
                <ScrollView style={{ paddingTop: 5 }}>
                    {this.state.rejectionReasons.map((item, index) => (
                        <View style={{ flexDirection: 'row', marginTop: 5, marginBottom: 5 }} key={index}>
                            <CheckBox checked={item.Value}
                                onPress={() => this.changeRejectionReason(item)}
                                color="#2dbe60"
                            />
                            <Text style={{ marginLeft: 12 }}>{item.Reason}</Text>
                        </View>
                    ))}
                </ScrollView>

            </Display>
            <View style={{ flex: 1 }}>
                <ImageBackground resizeMode={"cover"} source={require('../assets/fc.jpg')} style={{ width: "100%", height: 250, }}>
                    <TouchableOpacity style={{ alignSelf: 'flex-end', padding: 6 }} onPress={() => this.setState({ exitModal: null })}>
                        <Icon name={'times'} color='#fff' size={20} />
                    </TouchableOpacity>

                </ImageBackground>
            </View>


        </View>
    )
    __renderFeedbackContent = () => (
        <View style={styles.feedbackModalContainer}>
            <View style={[styles.mainHeaderContainer, styles.header]}>
                <Text style={[styles.textBig]}>How was your last meal?</Text>
                <Text>#{this.state.orderFeedback.OrderId}</Text>
            </View>
            <ScrollView >
                <View style={styles.modalBody}>
                    <View style={[styles.itemList]}>
                        {
                            this.state.orderFeedback.ItemDetails.map((item, index) => (
                                <View style={styles.itemItem} key={index}>
                                    {/* Veg and Non veg Here */}
                                    <Display enable={item.ProductVeganType == "VEG"} style={{ padding: 12, paddingRight: 0 }}>
                                        <View style={{ borderColor: '#008000', width: 16, height: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                            <View style={{ backgroundColor: '#008000', borderRadius: 10, width: 8, height: 8 }} ></View>
                                        </View>
                                    </Display>
                                    <Display enable={item.ProductVeganType == "NON-VEG"} style={{ justifyContent: 'center' }}>
                                        <View style={{ borderColor: '#cd2121', width: 10, height: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                                            <View style={{ backgroundColor: '#cd2121', borderRadius: 10, width: 6, height: 6 }} ></View>
                                        </View>
                                    </Display>
                                    <View style={{ flexDirection: 'column', padding: 10, opacity: (!true ? .3 : 1), flex: 2 }}>
                                        <Text style={{ fontSize: 16, color: '#262626' }}>{item.ProductName}</Text>
                                        <Display enable={item.VariantName != ""} style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 12, color: '#a4a4a4' }}>{item.VariantName}</Text></Display>
                                    </View>
                                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                        <View style={{ borderWidth: 1, borderColor: "transparent", backgroundColor: "transparent", justifyContent: 'center', alignItems: 'center', width: 100, height: 40, borderRadius: 1 }}>
                                            <Display enable={true} style={{ flex: 1, flexDirection: 'row', }}>
                                                <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={this.captureProductFeedback.bind(this, item, "N")}>
                                                    <Icon style={{ color: '#cd2121', fontSize: (item.Liked == "N" ? 24 : 16) }} name={item.Liked == "N" ? 'thumbs-down' : 'thumbs-o-down'} />
                                                </TouchableOpacity>

                                                <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={this.captureProductFeedback.bind(this, item, "Y")}>
                                                    <Icon style={{ color: '#cd2121', fontSize: (item.Liked == "Y" ? 24 : 16) }} name={item.Liked == "Y" ? 'thumbs-up' : 'thumbs-o-up'} />
                                                </TouchableOpacity>
                                            </Display>
                                        </View>
                                    </View>
                                </View>
                            ))
                        }

                    </View>
                    <View style={styles.ratingArea}>
                        <AirbnbRating
                            showRating
                            imageSize={40}
                            onFinishRating={(num) => { this.setState({ rating: num }) }}
                            style={{ paddingVertical: 10 }}
                            ratingColor='#3498db'
                        />
                    </View>
                    <View style={styles.textArea}>
                        <Textarea rowSpan={3} transparent placeholder="Your Feedback" onChangeText={(text) => { this.setState({ feedback: text }) }} />
                    </View>
                </View>
                <View style={[styles.modalFooter]}>
                    <Button full style={{ backgroundColor: '#cd2121', height: 50, justifyContent: 'center', alignItems: 'center' }} onPress={this.saveFeedback.bind(this)}>
                        <Display enable={!this.state.feedbackLoader}>
                            <Text style={[styles.textBig, styles.textWhite]}>Submit Feedback</Text>
                        </Display>
                        <Display enable={this.state.feedbackLoader}>
                            <ActivityIndicator color="white" />
                        </Display>
                    </Button>
                </View>
            </ScrollView>
        </View>
    )

    __renderCustomisationContent = () => (
        <View style={styles.modalContainer}>
            <View style={styles.custHeader}>
                <View style={{ flexDirection: 'row', padding: 0 }}>
                    <TouchableOpacity onPress={() => { this.setState({ visibleModal: null }) }} style={{ padding: 5 }}>
                        <BaseIcon style={{ color: '#4286f4', fontSize: 20 }} name='arrow-back' />
                    </TouchableOpacity>
                    <Display enable={this.state.custProd.ProductVeganType == 'VEG'} style={{ justifyContent: 'center' }}>
                        <View style={{ borderColor: '#008000', width: 20, height: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ backgroundColor: '#008000', borderRadius: 10, width: 15, height: 15 }} ></View>
                        </View>
                    </Display>
                    <Display enable={this.state.custProd.ProductVeganType == 'NON-VEG'} style={{ justifyContent: 'center' }}>
                        <View style={{ borderColor: '#cd2121', width: 20, height: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ backgroundColor: '#cd2121', borderRadius: 10, width: 15, height: 15 }} ></View>
                        </View>
                    </Display>
                    <View style={{ marginTop: 0, marginLeft: 5, justifyContent: 'center', alignItems: 'flex-start' }}>
                        <Text style={{ fontSize: 16, fontWeight: '600' }}>Customize "{this.state.custProd.ProductName}"</Text>
                        <Text style={{ marginLeft: 0, color: '#535766', textAlign: 'left' }}>Price ₹{this.state.custProd.OfferPrice}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.body}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 10, marginBottom: 5 }}>Variants ({this.state.custProd.vLen})</Text>
                    <Content>
                        <ListItem selected={this.isEmptyObject(this.state.selVar) ? true : false}
                            onPress={() => { this.selectVariant(null, this.state.custProd, 'NO'); }}
                        >
                            <Left>
                                <Text>None</Text>
                            </Left>
                            <Right>
                                <Radio
                                    color={"#222222"}
                                    selectedColor={"#2dbe60"}
                                    selected={this.isEmptyObject(this.state.selVar) ? true : false}
                                />
                            </Right>
                        </ListItem>
                    </Content>
                    <ListView
                        enableEmptySections={true}
                        dataSource={this.state.custProd.Variants}
                        renderRow={(item) =>
                            <Content>
                                <ListItem selected={item.Selected}
                                    onPress={() => { this.selectVariant(item, this.state.custProd, 'YES'); }}
                                >
                                    <Left>
                                        <Text>{item.Name}  ₹{item.Price}</Text>
                                    </Left>
                                    <Right>
                                        <Radio
                                            color={"#222222"}
                                            selectedColor={"#2dbe60"}
                                            selected={item.Selected}
                                            onPress={() => { this.selectVariant(item, this.state.custProd, 'YES'); }}
                                        />
                                    </Right>
                                </ListItem>
                            </Content>
                        } />

                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginLeft: 10, marginTop: 5 }}>Addons ({this.state.custProd.aLen})</Text>
                    <ListView
                        enableEmptySections={true}
                        dataSource={this.state.custProd.Addons}
                        renderRow={(item) =>
                            <View style={{ flexDirection: 'row' }}>
                                <Content>
                                    <ListItem onPress={() => this.selectAddon(item, this.state.custProd)}>
                                        <Body>
                                            <Text>{item.Name} ₹{item.Price}</Text>
                                        </Body>
                                        <CheckBox checked={item.Selected}
                                            onPress={() => this.selectAddon(item, this.state.custProd)}
                                            color="#2dbe60"
                                        />
                                    </ListItem>
                                </Content>
                            </View>
                        } />
                </ScrollView>
            </View>
            <View style={styles.customisationButton}>
                {/* <Text>{this.state.custProd.itemCustomization}</Text> */}
                <TouchableOpacity onPress={this.addProductToCart.bind(this, this.state.custProd)}>
                    <View style={{ flexDirection: 'row', padding: 15, backgroundColor: '#2dbe60', marginTop: 15 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.textVIew}>Item Total ₹{this.state.custProdTotal}</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <Text style={styles.textVIew}>ADD</Text>
                        </View>
                    </View>
                    {/* <View style={{ height: 15 }}>
              {this._renderButton('', 'close', '#555', () => this.setState({ visibleModal: null }))}
            </View> */}
                </TouchableOpacity>
            </View>

        </View>
    )

    componentWillMount() {
        console.log("HomeScreen componentWillMount()");
        // await Expo.Font.loadAsync({
        //     'Roboto': require('native-base/Fonts/Roboto.ttf'),
        //     'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
        //     'MyriadPro': require('../assets/fonts/MyriadPro-Regular.otf'),
        // });
        this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
            BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid));
    }
    componentWillUnmount() {
        // this._willBlurSubscription = false;
        // this._didFocusSubscription = false;
    }

    componentDidMount() {
        console.log("HomeScreen componentDidMount()");
        firebase.notifications().onNotification(receivedNotification => {
            // receivedNotification.android.setChannelId('BMF-Channel-Info');
            console.log("HomeScreen notificationListener()", receivedNotification);
            if (this.props.navigation.state.routeName == "Home" && receivedNotification.title == "Order Update") {
                this.fetchOngoingOrders();
            }
            //firebase.notifications().displayNotification(receivedNotification);
        })
        this.props.navigation.addListener('didFocus', () => {
            this.initCartItems();
            this.checkKitchenStatus();
            this.checkLastOrder();
            this.getUserData();
        });
    }

    showmsg() {
        ToastAndroid.show('Sorry item is not available now', ToastAndroid.SHORT);
    }

    _renderItem({ item, index }) {
        return (
            <View style={styles.superChefBox}>
                <View style={{ flex: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ed008c', borderTopLeftRadius: 10, borderTopRightRadius: 10, }}>
                    <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                        <Image source={require('../assets/app-images/girl.png')} style={{ width: 80, height: 80 }} />
                    </View>
                    <Text style={{ fontSize: 16, color: '#fff', marginTop: 15, fontWeight: 'bold' }}>SuperChef  {item.title}</Text>
                    <View style={{ flexDirection: 'row', marginTop: 6 }}>
                        <Image source={require('../assets/chef.png')} style={{ width: 16, height: 18 }} />
                        <Text style={{ color: "#fff", marginLeft: 6 }}>North Indian | Roti | Partha | Veg </Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 6 }}>
                        <Image source={require('../assets/fireworks.png')} style={{ width: 20, height: 20 }} />
                        <Text style={{ color: "#fff", marginLeft: 4, fontWeight: '300', fontSize: 17 }}>Top Rated Chef </Text>
                        <View style={{ backgroundColor: '#fad84b', justifyContent: 'center', alignItems: 'center', width: 30, borderRadius: 10, padding: 2 }}>
                            <Text style={{ color: "#626263", fontSize: 15 }}>3.5</Text>
                        </View>
                    </View>

                </View>

                <TouchableOpacity style={{ flex: 2, backgroundColor: '#45cb46', borderTopWidth: 2, borderTopColor: '#fff', justifyContent: 'center', alignItems: 'center' }} onPress={() => global.prop.navigation.navigate('ChefHome')}>
                    <Text style={{ fontSize: 20, color: '#fff', fontWeight: 'bold' }}>VIEW MENU</Text>
                </TouchableOpacity>
            </View>
        );
    }

    _onRefresh = () => {
        console.log("HomeScreen _onRefresh()")
        this.setState({ refreshing: true });
        if (this.state.foodService && this.state.bawarchiService) {
            this.fetchDashBoardOffers();
            this.getTrendingCategories();
            this.fetchNewArrivals();
            this.getNewBawarchies();
            this.getBestChefs();
            this.fetchOnOffers();
            this.fetchComboMealsForYou();
            this.fetchRecommendedProducts();
        }
        else if (this.state.bawarchiService) {
            this.getNewBawarchies();
            this.getBestChefs();
            this.fetchDashBoardOffers();
        }
        else if (this.state.foodService) {
            this.fetchDashBoardOffers();
            this.getTrendingCategories();
            this.fetchNewArrivals();
            this.fetchOnOffers();
            this.fetchComboMealsForYou();
            this.fetchRecommendedProducts();
        }
        this.setState({ refreshing: false });
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
        let count = 0
        return (
            <View style={styles.mainContainer}>
                <TabHeaderScreen />

                <WarningScreen />

                <Display enable={!this.state.kitchenClosed} style={{ flex: 1 }}>
                    <View style={{ flex: 9, marginTop: 0, marginBottom: (this.state.itemCount > 0 ? 50 : 0) }}>

                        <Display enable={this.state.foodService || this.state.bawarchiService}>
                            <ScrollView
                                ref="_mainScrollView"
                                showsVerticalScrollIndicator={false} refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshing}
                                        onRefresh={this._onRefresh}
                                    />
                                }>

                                {/* For Offers */}
                                <View style={styles.offerContainer}>

                                    <Display enable={this.state.timelyOffers}>
                                        <ImageBackground resizeMode={"stretch"} source={this.state.imgLoad} style={[styles.headGreetinContainer, { padding: 10 }]}>
                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end', }}>
                                                <Image source={require('../assets/afternoon.png')} style={{ width: 60, height: 60 }} />
                                            </View>
                                            <View style={{ flex: 2, justifyContent: 'center', alignItems: 'flex-start', marginLeft: 10 }}>
                                                <Text style={{ fontSize: 14, color: (this.state.greetings != "Good afternoon.") ? "#fff" : '#000', paddingBottom: 3 }}>Hi! {this.state.customerName}</Text>
                                                <Text style={{ fontSize: 17, color: (this.state.greetings != "Good afternoon.") ? "#fff" : '#000', paddingBottom: 5, fontWeight: 'bold' }}>{this.state.greetings} </Text>
                                                <Text style={{ fontSize: 10, color: (this.state.greetings != "Good afternoon.") ? (this.state.greetings == "Good morning") ? "#f2eded" : "#d3d1d1" : '#555', paddingBottom: 5 }}>We've covered all your favorite meals and dishes, order now. </Text>
                                            </View>
                                        </ImageBackground>
                                    </Display>

                                    <View style={styles.topbarOffers}>
                                        <ScrollView horizontal={true}
                                            showsHorizontalScrollIndicator={false}
                                        >
                                            <ListView horizontal={true}
                                                enableEmptySections={true}
                                                dataSource={this.state.dataSource1}
                                                renderRow={(data) =>
                                                    <TouchableOpacity onPress={() => this.navigateToOffer(data)}>
                                                        <View style={{ flexDirection: 'row', backgroundColor: '#ebebeb', marginRight: 8, height: 225, width: 225, }}>
                                                            <Display enable={this.state.offers}>
                                                                <Offers />
                                                            </Display>
                                                            <Display enable={!this.state.offers}>
                                                                <Image source={{ uri: BASE_PATH + data.BannerImage }} style={{ height: 225, width: 225, borderRadius: 4 }} />
                                                            </Display>
                                                        </View>
                                                    </TouchableOpacity>
                                                } />
                                        </ScrollView>
                                    </View>
                                </View>
                                {/* Show Live Orders */}
                                <Display enable={this.state.showLiveOrders}>
                                    <LinearGradient colors={['#fff', '#ADA996']} style={[styles.ongoingOrderContainer, { flexDirection: 'column', paddingHorizontal: 5, paddingVertical: 10 }]}>
                                        <Text style={{ color: "#636363", fontWeight: '300', fontSize: 16 }}> #Ongoing Order(s)</Text>

                                        <ScrollView style={{ flexDirection: 'row' }} contentContainerStyle={{ padding: 5, justifyContent: 'flex-end', alignItems: 'center' }} horizontal={true} showsHorizontalScrollIndicator={false}>
                                            {this.state.ongoingOrdersData.map((item, index) => (

                                                <View style={{
                                                    height: 150, width: 300, shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
                                                    shadowRadius: 2, elevation: 2, backgroundColor: '#fff', borderRadius: 4, marginTop: 8,
                                                    bottom: 5, marginRight: 8,
                                                }} key={index}>
                                                    <View style={{ flexDirection: 'row', flex: 2, borderBottomColor: '#e5e5e9', borderBottomWidth: 1 }}>
                                                        <View style={{ flex: 1, borderRightColor: '#e5e5e9', borderRightWidth: 1, justifyContent: 'center', alignItems: 'center', padding: 10 }}>
                                                            <Text style={{ color: '#b3b3c4', fontSize: 13 }}>ORDER TIME</Text>
                                                            <Text style={{ color: '#383822', fontSize: 18, marginTop: 6, fontWeight: '500' }}>TODAY</Text>
                                                            <Text style={{ color: '#77778d', fontSize: 16, marginTop: 6 }}>{item.OrderPlacedDate}</Text>
                                                        </View>
                                                        <View style={{ flex: 1, borderRightColor: '#e5e5e9', borderRightWidth: 1, padding: 10, justifyContent: 'center', alignItems: 'center' }}>
                                                            <Text style={{ color: '#b3b3c4', fontSize: 13, alignSelf: 'center' }}>ORDER STATUS</Text>
                                                            <Text style={{ color: '#383822', fontSize: 18, alignSelf: 'center', marginTop: 6, fontWeight: '500' }}>{(item.OrderStatus == "ORDER PLACED" ? "PLACED" : (
                                                                item.OrderStatus == "ORDER CONFIRMED" ? "CONFIRMED" : (
                                                                    item.OrderStatus == "COOKING" ? "COOKING" : (
                                                                        (item.OrderStatus == "OUT FOR DELIVERY") ? "ON WAY" : 'loading..'
                                                                    )
                                                                )
                                                            ))}</Text>
                                                            <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 6 }}>
                                                                {
                                                                    this.state.onGoingOrders.map((itm, idx) => (
                                                                        // console.log("Order Status", item.OrderStatus, idx),
                                                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                                                                            key={idx}>
                                                                            <View style={{
                                                                                borderColor: '#ebebeb', width: 20, height: 20, borderRadius: 10, borderWidth: 1, backgroundColor: (idx < (item.OrderStatus == "ORDER PLACED" ? 1 : (
                                                                                    item.OrderStatus == "ORDER CONFIRMED" ? 2 : (
                                                                                        item.OrderStatus == "COOKING" ? 3 : (
                                                                                            (item.OrderStatus == "OUT FOR DELIVERY") ? 4 : 0
                                                                                        )
                                                                                    )
                                                                                ))) ? '#2dbe60' : '#ebebeb',
                                                                            }}>
                                                                            </View>
                                                                            <Display enable={itm.OrderStatus != "OUT FOR DELIVERY"} style={{
                                                                                backgroundColor: (idx < (item.OrderStatus == "OREDER PLACED" ? 1 : (
                                                                                    item.OrderStatus == "ORDER CONFIRMED" ? 2 : (
                                                                                        item.OrderStatus == "COOKING" ? 3 : (
                                                                                            (item.OrderStatus == "OUT FOR DELIVERY") ? 4 : 0
                                                                                        )
                                                                                    )
                                                                                ))) ? '#2dbe60' : '#ebebeb', width: 15, height: 2
                                                                            }}></Display >
                                                                        </View>

                                                                    ))
                                                                }

                                                            </View>
                                                        </View>
                                                    </View>
                                                    <TouchableOpacity style={{ flex: .8, justifyContent: 'center', alignItems: 'center' }} onPress={() => this.showTrackDetails("VIEW", item)}>
                                                        <Text style={{ color: '#e35947', fontSize: 20, fontWeight: '500' }}>View Details</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    </LinearGradient>
                                </Display>


                                {/* Trending Categories */}
                                <Display enable={this.state.foodService && this.state.tendingCategoriesSource.length > 0}>
                                    <View style={styles.trendingCategoryContainer}>
                                        <Text style={{ fontSize: 12, color: '#a6a6a6' }}>Trending Categories</Text>
                                        <View style={{ flexDirection: 'row', marginTop: 5, marginBottom: 5 }}>
                                            <ScrollView horizontal={true}
                                                showsHorizontalScrollIndicator={false}>
                                                {
                                                    this.state.tendingCategoriesSource.map((data, index) => (
                                                        <TouchableOpacity onPress={this.showProducts.bind(this, data.CategoryId, data.CategoryName)} key={index}>
                                                            <View style={{
                                                                flexDirection: 'column', backgroundColor: '#ebebeb', marginRight: 5, marginBottom: 5, width: 90, height: 120, borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
                                                                borderTopRightRadius: 4, borderBottomRightRadius: 4,
                                                                overflow: "hidden",
                                                                shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
                                                                shadowRadius: 2, elevation: 2,
                                                            }}>
                                                                <Display enable={this.state.trendingCategories}>
                                                                    <TrendingCategories />
                                                                </Display>
                                                                <ImageBackground
                                                                    source={{
                                                                        uri: BASE_PATH + data.CategoryIcon
                                                                    }}
                                                                    style={{ flex: 1 }}
                                                                >
                                                                    {/* <Text style={{fontSize:10,color:'#262424',marginLeft:10 }}>{data.CategoryName}</Text> */}
                                                                </ImageBackground>
                                                                <View style={{ backgroundColor: '#fff', padding: 4, justifyContent: 'center', alignItems: 'center' }}>
                                                                    <Text style={{ fontSize: 10, color: '#999a95', fontWeight: 'bold' }}>{data.CategoryName}</Text>
                                                                </View>

                                                            </View>
                                                        </TouchableOpacity>
                                                    ))
                                                }
                                                <TouchableOpacity onPress={this.allCategories.bind(this)}>
                                                    <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 35 }}>
                                                        <Icon name="angle-right" size={50} color="#cd2121" style={{ width: 20 }} />
                                                    </View>
                                                </TouchableOpacity>
                                            </ScrollView>
                                        </View>

                                    </View>
                                </Display>

                                {/* Login To Reveal */}
                                <Display style={styles.loginRevealContainer} enable={this.state.ifnotLoggedIn}>
                                    <Text style={{ fontSize: 12, color: '#a6a6a6' }}>Exclusive On BMF !</Text>
                                    <LinearGradient colors={['#ffa38a', '#fd8488']} style={[styles.timelyOffersContainer, { height: 140, marginTop: 5, margin: 0 }]}>
                                        <View style={{ flexDirection: 'row', flex: 1 }}>
                                            <View style={{ flex: 3, paddingLeft: 15 }}>
                                                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 17, marginTop: 15 }}>Special offers packages</Text>
                                                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 17 }}>for New Users</Text>
                                                <TouchableOpacity style={{ padding: 10, borderRadius: 4, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginTop: 15 }} onPress={() => this.props.navigation.navigate('Login')}>
                                                    <Text style={{ color: '#ffa38a', fontSize: 15, fontWeight: '400' }}>Login to reveal</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <View style={{ flex: 2, marginLeft: 5 }}>
                                                <Image source={require('../assets/revealbox.png')} resizeMode={'contain'} style={{ flex: 1 }} width={120} />
                                            </View>
                                        </View>
                                    </LinearGradient>
                                </Display>

                                {/* Super Chefs */}
                                <Display enable={this.state.bawarchiService}>
                                    <LinearGradient colors={['#8e2de2', '#4a00e0', '#24243e']} style={[styles.timelyOffersContainer, { flexDirection: 'column', height: 300, }]}>
                                        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                                            <Image source={require('../assets/chef.png')} style={{ width: 300, height: 240 }} />
                                        </View>
                                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', padding: 10 }}>

                                            <TouchableOpacity style={{ backgroundColor: '#007bff', padding: 10, width: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 4 }} onPress={() => this.props.navigation.navigate("ChefExplore")}>
                                                <Text style={{ fontWeight: '600', color: '#fff', fontSize: 18 }}>Explore Now</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </LinearGradient>
                                </Display>

                                {/*NewBawarchis*/}
                                <Display enable={this.state.bawarchiService && this.state.newChefsSource.length > 0}>
                                    <LinearGradient colors={['#fff', '#512dae']} style={[styles.timelyOffersContainer, { flexDirection: 'column', height: 275, paddingHorizontal: 5, paddingVertical: 10 }]}>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 4 }}>
                                                <Text style={{ color: "#636363", fontWeight: '300', fontSize: 16 }}> #NewBawarchis</Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 4, marginBottom: 5 }}>
                                            <ScrollView horizontal={true}
                                                showsHorizontalScrollIndicator={false}>
                                                {
                                                    this.state.newChefsSource.map((item, index) => (

                                                        <View style={styles.recitemContainer} key={index}>
                                                            <Display enable={this.state.topSellingLoader}>
                                                                <TopSellings />
                                                            </Display>
                                                            <Display enable={item.ImageAvailable} style={{
                                                                flex: 3,
                                                                justifyContent: 'flex-start',
                                                                alignItems: 'flex-start',
                                                            }}>
                                                                <ImageBackground source={{ uri: BASE_PATH + item.ChefImage }} style={[styles.recproductImage,]}>

                                                                </ImageBackground >
                                                            </Display>
                                                            <Display enable={!item.ImageAvailable} style={{
                                                                flex: 3,
                                                                justifyContent: 'flex-start',
                                                                alignItems: 'flex-start',
                                                            }}
                                                            >
                                                                <ImageBackground source={require('../assets/empty.jpg')} style={[styles.recproductImage,]}>

                                                                </ImageBackground >
                                                            </Display>
                                                            <View style={{ backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }} >
                                                                <Text style={{ fontSize: 14, color: '#999a95', fontWeight: 'bold', fontFamily: 'MyriadPro' }}>{item.ChefName}</Text>
                                                                <Text style={{ fontSize: 9, color: '#999a95' }}>{item.Cuisines}</Text>
                                                                <TouchableOpacity onPress={() => { this.props.navigation.navigate("ChefDishes", { vId: item.VId }) }} style={{ alignSelf: 'center', padding: 3 }}>
                                                                    <Text style={{ color: '#cd2121', fontSize: 18, fontWeight: '600' }}>ORDER NOW</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    ))
                                                }
                                            </ScrollView>
                                        </View>
                                    </LinearGradient>
                                </Display>

                                {/*BestBawarchis*/}
                                <Display enable={this.state.bawarchiService && this.state.bestChefsSource.length > 0}>
                                    <LinearGradient colors={['#fff', '#7b4397']} style={[styles.timelyOffersContainer, { flexDirection: 'column', height: 275, paddingHorizontal: 5, paddingVertical: 10 }]}>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 4 }}>
                                                <Text style={{ color: "#636363", fontWeight: '300', fontSize: 16 }}> #BestBawarchis</Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 4, marginBottom: 5 }}>
                                            <ScrollView horizontal={true}
                                                showsHorizontalScrollIndicator={false}>
                                                {
                                                    this.state.bestChefsSource.map((item, index) => (

                                                        <View style={styles.recitemContainer} key={index}>
                                                            <Display enable={this.state.topSellingLoader}>
                                                                <TopSellings />
                                                            </Display>
                                                            <Display enable={item.ImageAvailable} style={{
                                                                flex: 3,
                                                                justifyContent: 'flex-start',
                                                                alignItems: 'flex-start',
                                                            }}>
                                                                <ImageBackground source={{ uri: BASE_PATH + item.ChefImage }} style={[styles.recproductImage,]}>
                                                                    <View style={{ flexDirection: 'row', }}>

                                                                        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', paddingVertical: 4 }}>
                                                                            <Display enable={item.Count != ''}>
                                                                                <View style={{
                                                                                    width: 100, height: 25, marginRight: -8,
                                                                                    backgroundColor: '#cd2121',
                                                                                    justifyContent: 'center', alignItems: 'center',
                                                                                }}>
                                                                                    {/* <Shimmer> */}
                                                                                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 16, }}>{item.Count}</Text>
                                                                                    {/* </Shimmer> */}
                                                                                </View>
                                                                            </Display>
                                                                        </View>
                                                                    </View>
                                                                </ImageBackground >
                                                            </Display>
                                                            <Display enable={!item.ImageAvailable} style={{
                                                                flex: 3,
                                                                justifyContent: 'flex-start',
                                                                alignItems: 'flex-start',
                                                            }}
                                                            >
                                                                <ImageBackground source={require('../assets/empty.jpg')} style={[styles.recproductImage,]}>
                                                                    <View style={{ flexDirection: 'row', }}>

                                                                        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', paddingVertical: 4 }}>
                                                                            <Display enable={item.Count != ''}>
                                                                                <View style={{
                                                                                    width: 100, height: 25, marginRight: -8,
                                                                                    backgroundColor: '#cd2121',
                                                                                    justifyContent: 'center', alignItems: 'center',
                                                                                }}>
                                                                                    {/* <Shimmer> */}
                                                                                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 16, }}>{item.Count}</Text>
                                                                                    {/* </Shimmer> */}
                                                                                </View>
                                                                            </Display>
                                                                        </View>
                                                                    </View>
                                                                </ImageBackground >
                                                            </Display>
                                                            <View style={{ backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }} >
                                                                <Text style={{ fontSize: 14, color: '#999a95', fontWeight: 'bold', fontFamily: 'MyriadPro' }}>{item.ChefName}</Text>
                                                                <Text style={{ fontSize: 9, color: '#999a95' }}>{item.Cuisines}</Text>
                                                                <TouchableOpacity onPress={() => { this.props.navigation.navigate("ChefDishes", { vId: item.VId }) }} style={{ alignSelf: 'center', padding: 3 }}>
                                                                    <Text style={{ color: '#cd2121', fontSize: 18, fontWeight: '600' }}>ORDER NOW</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    ))
                                                }
                                            </ScrollView>
                                        </View>
                                    </LinearGradient>
                                </Display>

                                {/*Recommended*/}
                                <Display enable={this.state.timelyOffers && this.state.foodService && this.state.recommendedSource.length > 0}>
                                    <LinearGradient colors={['#fff', '#abbaab']} style={[styles.timelyOffersContainer, { flexDirection: 'column', height: 275, paddingHorizontal: 5, paddingVertical: 10 }]}>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 4 }}>
                                                <Text style={{ color: "#636363", fontWeight: '300', fontSize: 16 }}> #Recommended</Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 4, marginBottom: 5 }}>
                                            <ScrollView horizontal={true}
                                                showsHorizontalScrollIndicator={false}>
                                                {
                                                    this.state.recommendedSource.map((item, index) => (

                                                        <View style={styles.recitemContainer} key={index}>
                                                            <Display enable={this.state.topSellingLoader}>
                                                                <TopSellings />
                                                            </Display>
                                                            <Display enable={item.ImageAvailable} style={{
                                                                flex: 3,
                                                                justifyContent: 'flex-start',
                                                                alignItems: 'flex-start',
                                                            }}>
                                                                <ImageBackground source={{ uri: BASE_PATH + item.ProductImage }} style={[styles.recproductImage, { opacity: (!item.Addable ? .6 : 1) }]}>
                                                                    <View style={{ flexDirection: 'row', }}>
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
                                                                    <Display enable={!item.Addable} style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}><View style={{ zIndex: 500, alignSelf: 'center', backgroundColor: '#fff', width: '100%', padding: 10, }}>
                                                                        <Text style={{ color: '#cd2121', fontWeight: '800', alignSelf: 'center' }}>KITCHEN CLOSED!</Text>
                                                                    </View>
                                                                        {/* <Image source={require('../assets/unavailable.png')} style={{ width: '80%', height: 100 }} resizeMode={'contain'} /> */}

                                                                    </Display>
                                                                </ImageBackground >
                                                            </Display>
                                                            <Display enable={!item.ImageAvailable} style={{
                                                                flex: 3,
                                                                justifyContent: 'flex-start',
                                                                alignItems: 'flex-start',
                                                            }}
                                                            >
                                                                <ImageBackground source={require('../assets/empty.jpg')} style={[styles.recproductImage, { opacity: (!item.Addable ? .6 : 1) }]}>
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
                                                                    <Display enable={!item.Addable} style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}><View style={{ zIndex: 500, alignSelf: 'center', backgroundColor: '#fff', width: '100%', padding: 10, }}>
                                                                        <Text style={{ color: '#cd2121', fontWeight: '800', alignSelf: 'center' }}>KITCHEN CLOSED!</Text>
                                                                    </View>
                                                                        {/* <Image source={require('../assets/unavailable.png')} style={{ width: '80%', height: 100 }} resizeMode={'contain'} /> */}

                                                                    </Display>
                                                                </ImageBackground >
                                                            </Display>
                                                            <View style={{ backgroundColor: '#fff', padding: 4 }}>
                                                                <Text style={{ fontSize: 14, color: '#999a95', fontWeight: 'bold', fontFamily: 'MyriadPro' }}>{item.ProductName}</Text>
                                                                <Text style={{ fontSize: 9, color: '#999a95' }}>{item.ProductDescription}</Text>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                                                                    <Display enable={item.OfferApplied == 'YES' && item.OfferText != ""} style={{ flex: 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                                        <Text style={{ color: "#adabab", fontWeight: '600', fontSize: 12, textDecorationLine: 'line-through', marginTop: 3 }}>₹ {item.ProductPrice}</Text>
                                                                        <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                                    </Display>
                                                                    <Display enable={item.OfferApplied == 'YES' && item.OfferText == ""} style={{ flex: 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                                        <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                                    </Display>
                                                                    <Display enable={item.OfferApplied != 'YES'} style={{ flex: (!item.Addable) ? 5 : 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                                        <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                                    </Display>
                                                                    <View style={{ flex: (!item.Addable) ? 9 : 3, borderWidth: 1, borderColor: (!item.Addable ? '#ada8a8' : "#2dbe60"), backgroundColor: (!item.Addable ? '#cd2121' : "#2dbe60"), justifyContent: 'center', alignItems: 'center', height: 20, borderRadius: 1, marginHorizontal: 5 }}>
                                                                        <Display enable={item.Addable} style={{ flex: 1, flexDirection: 'row', }}>
                                                                            <Display enable={item.VarLen > 0 || item.AdnLen > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                <Display enable={item.Qty < 1} style={{ flex: 1, flexDirection: 'row' }}>
                                                                                    <TouchableOpacity onPress={this.openCustomization.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>ADD</Text>
                                                                                        <Text style={[{ color: "#fff" }, styles.recsuperAdd]}>+</Text>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                                <Display enable={item.Qty > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                    <TouchableOpacity onPress={this.removeProductFromCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, }}>-</Text>
                                                                                    </TouchableOpacity>
                                                                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                                                                        <Text style={{ color: "#555", fontSize: 12, }}>{item.Qty}</Text>
                                                                                    </View>
                                                                                    <TouchableOpacity onPress={this.openCustomization.bind(this, item)} style={{ flex: 1, }}>
                                                                                        <View style={{ flex: .4, alignSelf: 'flex-end', marginTop: -5 }}>
                                                                                            <Text style={{ color: "#fff", fontSize: 12, alignSelf: 'flex-end' }}>+</Text>
                                                                                        </View>
                                                                                        <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                                                                                            <Text style={{ color: "#fff", fontSize: 14, }}>+</Text>
                                                                                        </View>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                            </Display>
                                                                            <Display enable={item.VarLen < 1 && item.AdnLen < 1} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                <Display enable={item.Qty < 1} style={{ flex: 1 }}>
                                                                                    <TouchableOpacity onPress={this.addProductToCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>ADD</Text>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                                <Display enable={item.Qty > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                    <TouchableOpacity onPress={this.removeProductFromCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>-</Text>
                                                                                    </TouchableOpacity>
                                                                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                                                                        <Text style={{ color: "#555", fontSize: 12, fontWeight: 'bold' }}>{item.Qty}</Text>
                                                                                    </View>
                                                                                    <TouchableOpacity onPress={this.addProductToCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>+</Text>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                            </Display>
                                                                        </Display>
                                                                        <Display enable={!item.Addable} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 4 }}>
                                                                            <TouchableOpacity onPress={this.showmsg} style={{ flexDirection: 'row' }}>
                                                                                <BaseIcon name={'ios-stopwatch'} style={{ color: '#fff', fontSize: 12 }} />
                                                                                <Text style={{ color: "#fff", fontSize: 12, marginLeft: 3 }}>{item.AvailableIn}</Text>
                                                                            </TouchableOpacity>
                                                                        </Display>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            {/* </HomeLoader> */}
                                                        </View>
                                                    ))
                                                }
                                            </ScrollView>
                                        </View>
                                    </LinearGradient>
                                </Display>


                                {/*Top Sellings*/}
                                {/* <Display enable={this.state.timelyOffers && this.state.foodService && this.state.topSellingSource.length > 0}>
                                    <LinearGradient colors={['#fff', '#004e92']} style={[styles.timelyOffersContainer, { flexDirection: 'column', height: 275, paddingHorizontal: 5, paddingVertical: 10 }]}>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 4 }}>
                                                <Text style={{ color: "#636363", fontWeight: '300', fontSize: 16 }}> #TopSellings</Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 4, marginBottom: 5 }}>
                                            <ScrollView horizontal={true}
                                                showsHorizontalScrollIndicator={false}>
                                                {
                                                    this.state.topSellingSource.map((item, index) => (

                                                        <View style={styles.recitemContainer} key={index}>
                                                            <Display enable={this.state.topSellingLoader}>
                                                                <TopSellings />
                                                            </Display>
                                                            <Display enable={item.ImageAvailable} style={{
                                                                flex: 3,
                                                                justifyContent: 'flex-start',
                                                                alignItems: 'flex-start',
                                                            }}>
                                                                <ImageBackground source={{ uri: BASE_PATH + item.ProductImage }} style={[styles.recproductImage, { opacity: (!item.Addable ? .6 : 1) }]}>
                                                                    <View style={{ flexDirection: 'row', }}>
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
                                                                                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 16, }}>{item.OfferText}</Text>
                                                                                </View>
                                                                            </Display>
                                                                        </View>
                                                                    </View>
                                                                    <Display enable={!item.Addable} style={{ position: 'absolute', zIndex: 500 }}>
                                                                        <Image source={require('../assets/unavailable.png')} style={{ width: 50, height: 40 }} />
                                                                    </Display>
                                                                </ImageBackground >
                                                            </Display>
                                                            <Display enable={!item.ImageAvailable} style={{
                                                                flex: 3,
                                                                justifyContent: 'flex-start',
                                                                alignItems: 'flex-start',
                                                            }}
                                                            >
                                                                <ImageBackground source={require('../assets/empty.jpg')} style={[styles.recproductImage, { opacity: (!item.Addable ? .6 : 1) }]}>
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
                                                                                    <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 16, }}>{item.OfferText}</Text>
                                                                                </View>
                                                                            </Display>
                                                                        </View>
                                                                    </View>
                                                                    <Display enable={!item.Addable} style={{ position: 'absolute', zIndex: 500 }}>
                                                                        <Image source={require('../assets/unavailable.png')} style={{ width: 50, height: 40 }} />
                                                                    </Display>
                                                                </ImageBackground >
                                                            </Display>
                                                            <View style={{ backgroundColor: '#fff', padding: 4 }}>
                                                                <Text style={{ fontSize: 14, color: '#999a95', fontWeight: 'bold', fontFamily: 'MyriadPro' }}>{item.ProductName}</Text>
                                                                <Text style={{ fontSize: 9, color: '#999a95' }}>{item.ProductDescription}</Text>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                                                                    <Display enable={item.OfferApplied == 'YES' && item.OfferText != ""} style={{ flex: 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                                        <Text style={{ color: "#adabab", fontWeight: '600', fontSize: 12, textDecorationLine: 'line-through', marginTop: 3 }}>₹ {item.ProductPrice}</Text>
                                                                        <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                                    </Display>
                                                                    <Display enable={item.OfferApplied == 'YES' && item.OfferText == ""} style={{ flex: 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                                        <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                                    </Display>
                                                                    <Display enable={item.OfferApplied != 'YES'} style={{ flex: 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                                        <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                                    </Display>
                                                                    <View style={{ flex: 3, borderWidth: 1, borderColor: (!item.Addable ? '#ada8a8' : "#2dbe60"), backgroundColor: (!item.Addable ? '#ada8a8' : "#2dbe60"), justifyContent: 'center', alignItems: 'center', height: 20, borderRadius: 1, marginHorizontal: 5 }}>
                                                                        <Display enable={item.Addable} style={{ flex: 1, flexDirection: 'row', }}>
                                                                            <Display enable={item.VarLen > 0 || item.AdnLen > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                <Display enable={item.Qty < 1} style={{ flex: 1, flexDirection: 'row' }}>
                                                                                    <TouchableOpacity onPress={this.openCustomization.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>ADD</Text>
                                                                                        <Text style={[{ color: "#fff" }, styles.recsuperAdd]}>+</Text>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                                <Display enable={item.Qty > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                    <TouchableOpacity onPress={this.removeProductFromCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, }}>-</Text>
                                                                                    </TouchableOpacity>
                                                                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                                                                        <Text style={{ color: "#555", fontSize: 12, }}>{item.Qty}</Text>
                                                                                    </View>
                                                                                    <TouchableOpacity onPress={this.openCustomization.bind(this, item)} style={{ flex: 1, }}>
                                                                                        <View style={{ flex: .4, alignSelf: 'flex-end', marginTop: -5 }}>
                                                                                            <Text style={{ color: "#fff", fontSize: 12, alignSelf: 'flex-end' }}>+</Text>
                                                                                        </View>
                                                                                        <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                                                                                            <Text style={{ color: "#fff", fontSize: 14, }}>+</Text>
                                                                                        </View>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                            </Display>
                                                                            <Display enable={item.VarLen < 1 && item.AdnLen < 1} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                <Display enable={item.Qty < 1} style={{ flex: 1 }}>
                                                                                    <TouchableOpacity onPress={this.addProductToCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>ADD</Text>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                                <Display enable={item.Qty > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                    <TouchableOpacity onPress={this.removeProductFromCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>-</Text>
                                                                                    </TouchableOpacity>
                                                                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                                                                        <Text style={{ color: "#555", fontSize: 12, fontWeight: 'bold' }}>{item.Qty}</Text>
                                                                                    </View>
                                                                                    <TouchableOpacity onPress={this.addProductToCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>+</Text>
                                                                                    </TouchableOpacity>
                                                                                </Display>
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
                                                        </View>
                                                    ))
                                                }
                                            </ScrollView>
                                        </View>
                                    </LinearGradient>
                                </Display> */}

                                {/*New Arrivals*/}
                                <Display enable={this.state.timelyOffers && this.state.foodService && this.state.newArrivalSource.length > 0}>
                                    <LinearGradient colors={['#fff', '#ba5370']} style={[styles.timelyOffersContainer, { flexDirection: 'column', height: 275, paddingHorizontal: 5, paddingVertical: 10 }]}>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 4 }}>
                                                <Text style={{ color: "#636363", fontWeight: '300', fontSize: 16 }}> #NewArrivals</Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 4, marginBottom: 5 }}>
                                            <ScrollView horizontal={true}
                                                showsHorizontalScrollIndicator={false}>
                                                {
                                                    this.state.newArrivalSource.map((item, index) => (

                                                        <View style={styles.recitemContainer} key={index}>
                                                            <Display enable={this.state.topSellingLoader}>
                                                                <TopSellings />
                                                            </Display>
                                                            <Display enable={item.ImageAvailable} style={{
                                                                flex: 3,
                                                                justifyContent: 'flex-start',
                                                                alignItems: 'flex-start',
                                                            }}>
                                                                <ImageBackground source={{ uri: BASE_PATH + item.ProductImage }} style={[styles.recproductImage, { opacity: (!item.Addable ? .6 : 1) }]}>
                                                                    <View style={{ flexDirection: 'row', }}>
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
                                                                    <Display enable={!item.Addable} style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}><View style={{ zIndex: 500, alignSelf: 'center', backgroundColor: '#fff', width: '100%', padding: 10, }}>
                                                                        <Text style={{ color: '#cd2121', fontWeight: '800', alignSelf: 'center' }}>KITCHEN CLOSED!</Text>
                                                                    </View>
                                                                        {/* <Image source={require('../assets/unavailable.png')} style={{ width: '80%', height: 100 }} resizeMode={'contain'} /> */}

                                                                    </Display>
                                                                </ImageBackground >
                                                            </Display>
                                                            <Display enable={!item.ImageAvailable} style={{
                                                                flex: 3,
                                                                justifyContent: 'flex-start',
                                                                alignItems: 'flex-start',
                                                            }}
                                                            >
                                                                <ImageBackground source={require('../assets/empty.jpg')} style={[styles.recproductImage, { opacity: (!item.Addable ? .6 : 1) }]}>
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
                                                                    <Display enable={!item.Addable} style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}><View style={{ zIndex: 500, alignSelf: 'center', backgroundColor: '#fff', width: '100%', padding: 10, }}>
                                                                        <Text style={{ color: '#cd2121', fontWeight: '800', alignSelf: 'center' }}>KITCHEN CLOSED!</Text>
                                                                    </View>
                                                                        {/* <Image source={require('../assets/unavailable.png')} style={{ width: '80%', height: 100 }} resizeMode={'contain'} /> */}

                                                                    </Display>
                                                                </ImageBackground >
                                                            </Display>
                                                            <View style={{ backgroundColor: '#fff', padding: 4 }}>
                                                                <Text style={{ fontSize: 14, color: '#999a95', fontWeight: 'bold', fontFamily: 'MyriadPro' }}>{item.ProductName}</Text>
                                                                <Text style={{ fontSize: 9, color: '#999a95' }}>{item.ProductDescription}</Text>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                                                                    <Display enable={item.OfferApplied == 'YES' && item.OfferText != ""} style={{ flex: 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                                        <Text style={{ color: "#adabab", fontWeight: '600', fontSize: 12, textDecorationLine: 'line-through', marginTop: 3 }}>₹ {item.ProductPrice}</Text>
                                                                        <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                                    </Display>
                                                                    <Display enable={item.OfferApplied == 'YES' && item.OfferText == ""} style={{ flex: 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                                        <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                                    </Display>
                                                                    <Display enable={item.OfferApplied != 'YES'} style={{ flex: (!item.Addable) ? 5 : 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                                        <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                                    </Display>
                                                                    <View style={{ flex: (!item.Addable) ? 9 : 3, borderWidth: 1, borderColor: (!item.Addable ? '#ada8a8' : "#2dbe60"), backgroundColor: (!item.Addable ? '#cd2121' : "#2dbe60"), justifyContent: 'center', alignItems: 'center', height: 20, borderRadius: 1, marginHorizontal: 5 }}>
                                                                        <Display enable={item.Addable} style={{ flex: 1, flexDirection: 'row', }}>
                                                                            <Display enable={item.VarLen > 0 || item.AdnLen > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                <Display enable={item.Qty < 1} style={{ flex: 1, flexDirection: 'row' }}>
                                                                                    <TouchableOpacity onPress={this.openCustomization.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>ADD</Text>
                                                                                        <Text style={[{ color: "#fff" }, styles.recsuperAdd]}>+</Text>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                                <Display enable={item.Qty > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                    <TouchableOpacity onPress={this.removeProductFromCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, }}>-</Text>
                                                                                    </TouchableOpacity>
                                                                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                                                                        <Text style={{ color: "#555", fontSize: 12, }}>{item.Qty}</Text>
                                                                                    </View>
                                                                                    <TouchableOpacity onPress={this.openCustomization.bind(this, item)} style={{ flex: 1, }}>
                                                                                        <View style={{ flex: .4, alignSelf: 'flex-end', marginTop: -5 }}>
                                                                                            <Text style={{ color: "#fff", fontSize: 12, alignSelf: 'flex-end' }}>+</Text>
                                                                                        </View>
                                                                                        <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                                                                                            <Text style={{ color: "#fff", fontSize: 14, }}>+</Text>
                                                                                        </View>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                            </Display>
                                                                            <Display enable={item.VarLen < 1 && item.AdnLen < 1} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                <Display enable={item.Qty < 1} style={{ flex: 1 }}>
                                                                                    <TouchableOpacity onPress={this.addProductToCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>ADD</Text>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                                <Display enable={item.Qty > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                    <TouchableOpacity onPress={this.removeProductFromCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>-</Text>
                                                                                    </TouchableOpacity>
                                                                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                                                                        <Text style={{ color: "#555", fontSize: 12, fontWeight: 'bold' }}>{item.Qty}</Text>
                                                                                    </View>
                                                                                    <TouchableOpacity onPress={this.addProductToCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>+</Text>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                            </Display>
                                                                        </Display>
                                                                        <Display enable={!item.Addable} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 4 }}>
                                                                            <TouchableOpacity onPress={this.showmsg} style={{ flexDirection: 'row' }}>
                                                                                <BaseIcon name={'ios-stopwatch'} style={{ color: '#fff', fontSize: 12 }} />
                                                                                <Text style={{ color: "#fff", fontSize: 12, marginLeft: 3 }}>{item.AvailableIn}</Text>
                                                                            </TouchableOpacity>
                                                                        </Display>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            {/* </HomeLoader> */}
                                                        </View>
                                                    ))
                                                }
                                            </ScrollView>
                                        </View>
                                    </LinearGradient>
                                </Display>

                                {/*On Offers*/}
                                <Display enable={this.state.timelyOffers && this.state.foodService && this.state.onOffersSource.length > 0}>
                                    <LinearGradient colors={['#fff', '#d04ed6']} style={[styles.timelyOffersContainer, { flexDirection: 'column', height: 275, paddingHorizontal: 5, paddingVertical: 10 }]}>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 4 }}>
                                                <Text style={{ color: "#636363", fontWeight: '300', fontSize: 16 }}> #OnOffers</Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 4, marginBottom: 5 }}>
                                            <ScrollView horizontal={true}
                                                showsHorizontalScrollIndicator={false}>
                                                {
                                                    this.state.onOffersSource.map((item, index) => (

                                                        <View style={styles.recitemContainer} key={index}>
                                                            <Display enable={this.state.topSellingLoader}>
                                                                <TopSellings />
                                                            </Display>
                                                            <Display enable={item.ImageAvailable} style={{
                                                                flex: 3,
                                                                justifyContent: 'flex-start',
                                                                alignItems: 'flex-start',
                                                            }}>
                                                                <ImageBackground source={{ uri: BASE_PATH + item.ProductImage }} style={[styles.recproductImage, { opacity: (!item.Addable ? .6 : 1) }]}>
                                                                    <View style={{ flexDirection: 'row', }}>
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
                                                                    <Display enable={!item.Addable} style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}><View style={{ zIndex: 500, alignSelf: 'center', backgroundColor: '#fff', width: '100%', padding: 10, }}>
                                                                        <Text style={{ color: '#cd2121', fontWeight: '800', alignSelf: 'center' }}>KITCHEN CLOSED!</Text>
                                                                    </View>
                                                                        {/* <Image source={require('../assets/unavailable.png')} style={{ width: '80%', height: 100 }} resizeMode={'contain'} /> */}

                                                                    </Display>
                                                                </ImageBackground >
                                                            </Display>
                                                            <Display enable={!item.ImageAvailable} style={{
                                                                flex: 3,
                                                                justifyContent: 'flex-start',
                                                                alignItems: 'flex-start',
                                                            }}
                                                            >
                                                                <ImageBackground source={require('../assets/empty.jpg')} style={[styles.recproductImage, { opacity: (!item.Addable ? .6 : 1) }]}>
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
                                                                    <Display enable={!item.Addable} style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}><View style={{ zIndex: 500, alignSelf: 'center', backgroundColor: '#fff', width: '100%', padding: 10, }}>
                                                                        <Text style={{ color: '#cd2121', fontWeight: '800', alignSelf: 'center' }}>KITCHEN CLOSED!</Text>
                                                                    </View>
                                                                        {/* <Image source={require('../assets/unavailable.png')} style={{ width: '80%', height: 100 }} resizeMode={'contain'} /> */}

                                                                    </Display>
                                                                </ImageBackground >
                                                            </Display>
                                                            <View style={{ backgroundColor: '#fff', padding: 4 }}>
                                                                <Text style={{ fontSize: 14, color: '#999a95', fontWeight: 'bold', fontFamily: 'MyriadPro' }}>{item.ProductName}</Text>
                                                                <Text style={{ fontSize: 9, color: '#999a95' }}>{item.ProductDescription}</Text>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                                                                    <Display enable={item.OfferApplied == 'YES' && item.OfferText != ""} style={{ flex: 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                                        <Text style={{ color: "#adabab", fontWeight: '600', fontSize: 12, textDecorationLine: 'line-through', marginTop: 3 }}>₹ {item.ProductPrice}</Text>
                                                                        <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                                    </Display>
                                                                    <Display enable={item.OfferApplied == 'YES' && item.OfferText == ""} style={{ flex: 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                                        <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                                    </Display>
                                                                    <Display enable={item.OfferApplied != 'YES'} style={{ flex: (!item.Addable) ? 5 : 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                                        <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                                    </Display>
                                                                    <View style={{ flex: (!item.Addable) ? 9 : 3, borderWidth: 1, borderColor: (!item.Addable ? '#ada8a8' : "#2dbe60"), backgroundColor: (!item.Addable ? '#cd2121' : "#2dbe60"), justifyContent: 'center', alignItems: 'center', height: 20, borderRadius: 1, marginHorizontal: 5 }}>
                                                                        <Display enable={item.Addable} style={{ flex: 1, flexDirection: 'row', }}>
                                                                            <Display enable={item.VarLen > 0 || item.AdnLen > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                <Display enable={item.Qty < 1} style={{ flex: 1, flexDirection: 'row' }}>
                                                                                    <TouchableOpacity onPress={this.openCustomization.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>ADD</Text>
                                                                                        <Text style={[{ color: "#fff" }, styles.recsuperAdd]}>+</Text>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                                <Display enable={item.Qty > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                    <TouchableOpacity onPress={this.removeProductFromCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, }}>-</Text>
                                                                                    </TouchableOpacity>
                                                                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                                                                        <Text style={{ color: "#555", fontSize: 12, }}>{item.Qty}</Text>
                                                                                    </View>
                                                                                    <TouchableOpacity onPress={this.openCustomization.bind(this, item)} style={{ flex: 1, }}>
                                                                                        <View style={{ flex: .4, alignSelf: 'flex-end', marginTop: -5 }}>
                                                                                            <Text style={{ color: "#fff", fontSize: 12, alignSelf: 'flex-end' }}>+</Text>
                                                                                        </View>
                                                                                        <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                                                                                            <Text style={{ color: "#fff", fontSize: 14, }}>+</Text>
                                                                                        </View>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                            </Display>
                                                                            <Display enable={item.VarLen < 1 && item.AdnLen < 1} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                <Display enable={item.Qty < 1} style={{ flex: 1 }}>
                                                                                    <TouchableOpacity onPress={this.addProductToCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>ADD</Text>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                                <Display enable={item.Qty > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                    <TouchableOpacity onPress={this.removeProductFromCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>-</Text>
                                                                                    </TouchableOpacity>
                                                                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                                                                        <Text style={{ color: "#555", fontSize: 12, fontWeight: 'bold' }}>{item.Qty}</Text>
                                                                                    </View>
                                                                                    <TouchableOpacity onPress={this.addProductToCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>+</Text>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                            </Display>
                                                                        </Display>
                                                                        <Display enable={!item.Addable} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 4 }}>
                                                                            <TouchableOpacity onPress={this.showmsg} style={{ flexDirection: 'row' }}>
                                                                                <BaseIcon name={'ios-stopwatch'} style={{ color: '#fff', fontSize: 12 }} />
                                                                                <Text style={{ color: "#fff", fontSize: 12, marginLeft: 3 }}>{item.AvailableIn}</Text>
                                                                            </TouchableOpacity>
                                                                        </Display>
                                                                    </View>




                                                                </View>
                                                            </View>
                                                            {/* </HomeLoader> */}
                                                        </View>
                                                    ))
                                                }
                                            </ScrollView>
                                        </View>
                                    </LinearGradient>
                                </Display>

                                {/*Combo meals for you*/}
                                <Display enable={this.state.timelyOffers && this.state.foodService && this.state.comboMealsForYouSource.length > 0}>
                                    <LinearGradient colors={['#fff', '#8e0e00']} style={[styles.timelyOffersContainer, { flexDirection: 'column', height: 275, paddingHorizontal: 5, paddingVertical: 10 }]}>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 4 }}>
                                                <Text style={{ color: "#636363", fontWeight: '300', fontSize: 16 }}> #ComboMealsForYou</Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 4, marginBottom: 5 }}>
                                            <ScrollView horizontal={true}
                                                showsHorizontalScrollIndicator={false}>
                                                {
                                                    this.state.comboMealsForYouSource.map((item, index) => (

                                                        <View style={styles.recitemContainer} key={index}>
                                                            <Display enable={this.state.topSellingLoader}>
                                                                <TopSellings />
                                                            </Display>
                                                            <Display enable={item.ImageAvailable} style={{
                                                                flex: 3,
                                                                justifyContent: 'flex-start',
                                                                alignItems: 'flex-start',
                                                            }}>
                                                                <ImageBackground source={{ uri: BASE_PATH + item.ProductImage }} style={[styles.recproductImage, { opacity: (!item.Addable ? .6 : 1) }]}>
                                                                    <View style={{ flexDirection: 'row', }}>
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
                                                                    <Display enable={!item.Addable} style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}><View style={{ zIndex: 500, alignSelf: 'center', backgroundColor: '#fff', width: '100%', padding: 10, }}>
                                                                        <Text style={{ color: '#cd2121', fontWeight: '800', alignSelf: 'center' }}>KITCHEN CLOSED!</Text>
                                                                    </View>
                                                                        {/* <Image source={require('../assets/unavailable.png')} style={{ width: '80%', height: 100 }} resizeMode={'contain'} /> */}

                                                                    </Display>
                                                                </ImageBackground >
                                                            </Display>
                                                            <Display enable={!item.ImageAvailable} style={{
                                                                flex: 3,
                                                                justifyContent: 'flex-start',
                                                                alignItems: 'flex-start',
                                                            }}
                                                            >
                                                                <ImageBackground source={require('../assets/empty.jpg')} style={[styles.recproductImage, { opacity: (!item.Addable ? .6 : 1) }]}>
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
                                                                    <Display enable={!item.Addable} style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}><View style={{ zIndex: 500, alignSelf: 'center', backgroundColor: '#fff', width: '100%', padding: 10, }}>
                                                                        <Text style={{ color: '#cd2121', fontWeight: '800', alignSelf: 'center' }}>KITCHEN CLOSED!</Text>
                                                                    </View>
                                                                        {/* <Image source={require('../assets/unavailable.png')} style={{ width: '80%', height: 100 }} resizeMode={'contain'} /> */}

                                                                    </Display>
                                                                </ImageBackground >
                                                            </Display>
                                                            <View style={{ backgroundColor: '#fff', padding: 4 }}>
                                                                <Text style={{ fontSize: 14, color: '#999a95', fontWeight: 'bold', fontFamily: 'MyriadPro' }}>{item.ProductName}</Text>
                                                                <Text style={{ fontSize: 9, color: '#999a95' }}>{item.ProductDescription}</Text>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                                                                    <Display enable={item.OfferApplied == 'YES' && item.OfferText != ""} style={{ flex: 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                                        <Text style={{ color: "#adabab", fontWeight: '600', fontSize: 12, textDecorationLine: 'line-through', marginTop: 3 }}>₹ {item.ProductPrice}</Text>
                                                                        <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                                    </Display>
                                                                    <Display enable={item.OfferApplied == 'YES' && item.OfferText == ""} style={{ flex: 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                                        <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                                    </Display>
                                                                    <Display enable={item.OfferApplied != 'YES'} style={{ flex: (!item.Addable) ? 5 : 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                                        <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                                    </Display>
                                                                    <View style={{ flex: (!item.Addable) ? 9 : 3, borderWidth: 1, borderColor: (!item.Addable ? '#ada8a8' : "#2dbe60"), backgroundColor: (!item.Addable ? '#cd2121' : "#2dbe60"), justifyContent: 'center', alignItems: 'center', height: 20, borderRadius: 1, marginHorizontal: 5 }}>
                                                                        <Display enable={item.Addable} style={{ flex: 1, flexDirection: 'row', }}>
                                                                            <Display enable={item.VarLen > 0 || item.AdnLen > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                <Display enable={item.Qty < 1} style={{ flex: 1, flexDirection: 'row' }}>
                                                                                    <TouchableOpacity onPress={this.openCustomization.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>ADD</Text>
                                                                                        <Text style={[{ color: "#fff" }, styles.recsuperAdd]}>+</Text>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                                <Display enable={item.Qty > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                    <TouchableOpacity onPress={this.removeProductFromCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, }}>-</Text>
                                                                                    </TouchableOpacity>
                                                                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                                                                        <Text style={{ color: "#555", fontSize: 12, }}>{item.Qty}</Text>
                                                                                    </View>
                                                                                    <TouchableOpacity onPress={this.openCustomization.bind(this, item)} style={{ flex: 1, }}>
                                                                                        <View style={{ flex: .4, alignSelf: 'flex-end', marginTop: -5 }}>
                                                                                            <Text style={{ color: "#fff", fontSize: 12, alignSelf: 'flex-end' }}>+</Text>
                                                                                        </View>
                                                                                        <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                                                                                            <Text style={{ color: "#fff", fontSize: 14, }}>+</Text>
                                                                                        </View>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                            </Display>
                                                                            <Display enable={item.VarLen < 1 && item.AdnLen < 1} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                <Display enable={item.Qty < 1} style={{ flex: 1 }}>
                                                                                    <TouchableOpacity onPress={this.addProductToCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>ADD</Text>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                                <Display enable={item.Qty > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                    <TouchableOpacity onPress={this.removeProductFromCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>-</Text>
                                                                                    </TouchableOpacity>
                                                                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                                                                        <Text style={{ color: "#555", fontSize: 12, fontWeight: 'bold' }}>{item.Qty}</Text>
                                                                                    </View>
                                                                                    <TouchableOpacity onPress={this.addProductToCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>+</Text>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                            </Display>
                                                                        </Display>
                                                                        <Display enable={!item.Addable} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 4 }}>
                                                                            <TouchableOpacity onPress={this.showmsg} style={{ flexDirection: 'row' }}>
                                                                                <BaseIcon name={'ios-stopwatch'} style={{ color: '#fff', fontSize: 12 }} />
                                                                                <Text style={{ color: "#fff", fontSize: 12, marginLeft: 3 }}>{item.AvailableIn}</Text>
                                                                            </TouchableOpacity>
                                                                        </Display>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                            {/* </HomeLoader> */}
                                                        </View>
                                                    ))
                                                }
                                            </ScrollView>
                                        </View>
                                    </LinearGradient>
                                </Display>

                                {/*Your Past Orders*/}
                                {/* <Display enable={this.state.timelyOffers && this.state.foodService}>
                                    <LinearGradient colors={['#fff', '#abbaab']} style={[styles.timelyOffersContainer, { flexDirection: 'column', height: 250, paddingHorizontal: 5, paddingVertical: 10 }]}>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flex: 7, }}>
                                                <Text style={{ color: "#636363", fontWeight: '300', fontSize: 16 }}> #Your Past Orders</Text>
                                            </View>
                                            <View style={{ flex: 3, alignItems: 'flex-end' }}>
                                                <TouchableOpacity >
                                                    <Text style={{ color: "#7c7777", fontWeight: '200' }}>View More</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View style={{ flex: 4, marginBottom: 5 }}>
                                            <ScrollView horizontal={true}
                                                showsHorizontalScrollIndicator={false}>
                                                {
                                                    this.state.pastOrders.map((item, index) => (
                                                        <View key={index} style={styles.PastOrders}>
                                                            <ScrollView>
                                                                {this.state.pastOrders.map((item, index) => (
                                                                    <ScrollView contentContainerStyle={{ flex: 1, padding: 10, flexDirection: 'row' }} key={index}>
                                                                        <View style={{ flexDirection: 'row', flex: 6, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                                                                            <View style={{ borderWidth: 1, borderColor: (item.ProductVeganType == "VEG") ? "#2dbe60" : "#cd2121", width: 12, height: 12, justifyContent: 'center', alignItems: 'center' }}>
                                                                                <View style={{ backgroundColor: (item.ProductVeganType == "VEG") ? "#00800" : "#cd2121", width: 8, height: 8, borderRadius: 5 }}>
                                                                                </View>
                                                                            </View>
                                                                            <View style={{ height: 12, justifyContent: 'center', }}>
                                                                                <Text style={{ marginLeft: 8, fontSize: 14, fontWeight: '300', color: '#474545', }}>Product 1</Text>
                                                                            </View>
                                                                        </View>
                                                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: 3, height: 20 }}>
                                                                            <View style={{ flex: 3, borderWidth: 1, borderColor: (!item.Addable ? '#ada8a8' : "#2dbe60"), backgroundColor: (!item.Addable ? '#ada8a8' : "#2dbe60"), justifyContent: 'center', alignItems: 'center', borderRadius: 1, marginHorizontal: 5 }}>
                                                                                <Display enable={item.Addable} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                    <Display enable={item.VarLen > 0 || item.AdnLen > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                        <Display enable={item.Qty < 1} style={{ flex: 1, flexDirection: 'row' }}>
                                                                                            <TouchableOpacity onPress={this.openCustomization.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                                <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>ADD</Text>
                                                                                                <Text style={[{ color: "#fff" }, styles.recsuperAdd]}>+</Text>
                                                                                            </TouchableOpacity>
                                                                                        </Display>
                                                                                        <Display enable={item.Qty > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                            <TouchableOpacity onPress={this.removeProductFromCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                                <Text style={{ color: "#fff", fontSize: 14, }}>-</Text>
                                                                                            </TouchableOpacity>
                                                                                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                                                                                <Text style={{ color: "#555", fontSize: 12, }}>{item.Qty}</Text>
                                                                                            </View>
                                                                                            <TouchableOpacity onPress={this.openCustomization.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                                <Text style={{ color: "#fff", fontSize: 14, }}>+</Text>
                                                                                                <Text style={{ color: "#fff", fontSize: 13, marginTop: -5, marginLeft: -5 }}>+</Text>
                                                                                            </TouchableOpacity>
                                                                                        </Display>
                                                                                    </Display>
                                                                                    <Display enable={item.VarLen < 1 && item.AdnLen < 1} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                        <Display enable={item.Qty < 1} style={{ flex: 1, flexDirection: 'row' }}>
                                                                                            <TouchableOpacity onPress={this.addProductToCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                                                                                <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>ADD  </Text>
                                                                                            </TouchableOpacity>
                                                                                        </Display>
                                                                                        <Display enable={item.Qty > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                            <TouchableOpacity onPress={this.removeProductFromCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                                <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>-</Text>
                                                                                            </TouchableOpacity>
                                                                                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                                                                                <Text style={{ color: "#555", fontSize: 12, fontWeight: 'bold' }}>{item.Qty}</Text>
                                                                                            </View>
                                                                                            <TouchableOpacity onPress={this.addProductToCart.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                                                                <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>+</Text>
                                                                                            </TouchableOpacity>
                                                                                        </Display>
                                                                                    </Display>
                                                                                </Display>
                                                                                <Display enable={!item.Addable} style={{ flex: 1, flexDirection: 'row', }}>
                                                                                    <TouchableOpacity onPress={this.showmsg}>
                                                                                        <Text style={{ color: "#fff", fontSize: 14, marginBottom: (Platform.OS === 'ios' ? 0 : 5) }}>ADD</Text>
                                                                                    </TouchableOpacity>
                                                                                </Display>
                                                                            </View>
                                                                        </View>
                                                                        <View style={{ flex: 1 }}>
                                                                            <CheckBox checked={true}
                                                                                onPress={() => this.selectAddon(item, this.state.custProd)}
                                                                                color="#2dbe60"
                                                                            />
                                                                        </View>
                                                                    </ScrollView>
                                                                ))}
                                                            </ScrollView>
                                                            <TouchableOpacity style={{ height: 35, flexDirection: 'row', bottom: 0, backgroundColor: '#2dbe60' }}>
                                                                <View style={{ flex: 8, justifyContent: 'center', justifyContent: 'center', alignItems: 'center' }}>
                                                                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>REPEAT ORDER</Text>
                                                                </View>
                                                                <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                                                                    <Text style={{ color: '#e2e0e0', fontSize: 15, fontWeight: '200' }}>₹ 300.00</Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                        </View>
                                                    ))
                                                }
                                            </ScrollView>
                                        </View>
                                    </LinearGradient>
                                </Display> */}

                                {/* Quick Picks */}
                                <Display enable={this.state.foodService}>
                                    <View style={styles.quickPicksContainer}>
                                        <Text style={{ fontSize: 12, color: '#a6a6a6' }}>Quick Picks!</Text>
                                        <View style={styles.quickPicksInner}>
                                            <ScrollView horizontal={true}
                                                showsHorizontalScrollIndicator={false}>
                                                <ListView horizontal={true}
                                                    enableEmptySections={true}
                                                    dataSource={this.state.dataSource3}
                                                    renderRow={(data) =>
                                                        <TouchableOpacity onPress={this.showQuickPickProducts.bind(this, data.title)}>
                                                            <ImageBackground source={data.image} style={styles.quickpicks}>
                                                                <Text style={{ fontSize: 14, color: '#fff', marginBottom: 5 }}> {data.title}</Text>
                                                            </ImageBackground>
                                                        </TouchableOpacity>
                                                    } />
                                            </ScrollView>
                                        </View>
                                    </View>
                                </Display>

                                {/* Suggestion Box*/}
                                <Display enable={this.state.suggestionBox}>
                                    <LinearGradient colors={['#000', '#434343']} style={[styles.timelyOffersContainer, { height: 240, borderRadius: 6, flexDirection: 'column', padding: 0 }]}>
                                        <View style={{ flex: 4 }}>
                                            <TouchableOpacity onPress={() => { this.setState({ suggestionBox: false }) }} style={{ justifyContent: 'center', alignItems: 'flex-end', padding: 5, marginRight: 3 }}><Icon name={'times'} size={20} color={'#545454'} /></TouchableOpacity>
                                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                                <Image source={require('../assets/talkingimg.png')} width={30} />
                                                <Text style={{ color: '#fff' }}>Suggest Us to Your Friends and get exciting Offers</Text>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', flex: 1, marginTop: 15 }}>
                                            <TouchableOpacity style={{ backgroundColor: '#383838', flex: 1, justifyContent: 'center', alignItems: 'center', marginRight: .5, borderBottomLeftRadius: 6 }} onPress={this.shareCode}>
                                                <Text style={{ color: "#fff", fontSize: 16 }}>Suggest</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => { this.setState({ suggestionBox: false }) }} style={{ backgroundColor: '#383838', flex: 1, justifyContent: 'center', alignItems: 'center', marginLeft: .5, borderBottomRightRadius: 6 }}>
                                                <Text style={{ color: "#fff", fontSize: 16 }}>Later</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </LinearGradient>
                                </Display>

                                {/* Timely Offers */}
                                {/* <Display enable={this.state.timelyOffers}>

                                    <LinearGradient colors={['#ea384d', '#d31027']} style={styles.timelyOffersContainer}>
                                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end', }}>
                                            <Image source={require('../assets/catering.png')} style={{ width: 60, height: 60 }} />
                                        </View>
                                        <View style={{ flex: 2, justifyContent: 'center', alignItems: 'flex-start', marginLeft: 10 }}>
                                            <Text style={{ fontSize: 14, color: '#fff', paddingBottom: 3 }}>Looking for bulk order & catering? </Text>
                                            <Text style={{ fontSize: 17, color: '#fff', paddingBottom: 5, fontWeight: 'bold' }}>Extra Discounts & Offers</Text>
                                            <Text style={{ fontSize: 10, color: '#ebebeb', paddingBottom: 5 }}>Call us on 8339000801</Text>
                                        </View>
                                    </LinearGradient>
                                </Display> */}

                                {/* BMF Wallet */}
                                <Display style={styles.walletContainer} enable={!this.state.ifnotLoggedIn}>
                                    <View style={{ flexDirection: 'row', flex: 4 }}>
                                        <View style={{ flex: 7, backgroundColor: '#fff', flexDirection: 'row', padding: 10 }}>
                                            <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                                                <Icon name="suitcase" size={30} color="#cd2121" style={{ width: 35 }} />
                                            </View>
                                            <View style={{ marginTop: 6 }}>
                                                <TouchableOpacity onPress={() => this.props.navigation.navigate('Wallet')}>
                                                    <Text style={{ fontSize: 12 }} >BMF Wallet Balance</Text>
                                                </TouchableOpacity>
                                                <Text style={{ fontSize: 8 }}>Expires till you stop eating!</Text>
                                            </View>
                                        </View>
                                        <View style={{ flex: 3, justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Wallet')} style={{ borderWidth: 2, borderColor: '#cd2121', justifyContent: 'center', alignItems: 'center', width: 60, borderRadius: 10, padding: 2 }}>
                                                <Text style={{ color: "#000", fontSize: 12 }}>₹ {this.state.walletMoney}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1, padding: 4, borderColor: '#f9f9f9', borderTopWidth: 1, marginTop: 4, }}>
                                        <TouchableOpacity onPress={this.shareCode}>
                                            <Text style={{ fontSize: 12, color: '#cd2121' }}>Invite & Earn More</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Display>
                                {/* Feedback Modal */}
                                <Modal isVisible={this.state.visibleModal === 10} style={styles.bottomModal} onBackButtonPress={() => this.setState({ visibleModal: null })}>
                                    {this.__renderFeedbackContent()}
                                </Modal>
                                <Modal isVisible={this.state.visibleModal === 7 && this.state.customisationModal == 7} style={styles.bottomModal} onBackButtonPress={() => this.setState({ visibleModal: null, customisationModal: null })}>
                                    {this.__renderCustomisationContent()}
                                </Modal>
                                <Modal isVisible={this.state.exitModal === 1} style={styles.exitModal} onBackButtonPress={() => this.setState({ exitModal: null })}>
                                    {this.__renderExitModalContent()}
                                </Modal>
                            </ScrollView>
                        </Display>
                    </View>

                    {/* Replace cart Items */}
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
                    <Modal isVisible={this.state.visibleModal === 8} style={styles.bottomModal} onBackButtonPress={() => this.setState({ visibleModal: null })}>
                        {this.__renderTrackOrder()}
                    </Modal>
                    <Modal isVisible={this.state.visibleModal === 12} style={styles.bottomModal} onBackButtonPress={() => this.setState({ visibleModal: null })}>
                        {this.__renderOrderDetails()}
                    </Modal>

                    {/* <Display enable={this.state.showLiveOrders}
                        style={{ bottom: (this.state.itemCount > 0) ? 50 : 0, }}
                    >
                        <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: -10, zIndex: 100, }} onPress={() => this.setState({ showLiveOrders: false })}>
                            <Icon name={'times'} color={"#cd2121"} size={25} />
                        </TouchableOpacity>
                        <ScrollView style={{ flexDirection: 'row' }} style={{ height: 65, padding: 5 }}>
                            {this.state.recommendedSource.map((item, index) => (
                                <View style={{
                                    flexDirection: 'row', height: 55, shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
                                    shadowRadius: 2, elevation: 2, backgroundColor: '#fff', borderRadius: 4, marginTop: 8
                                }} key={index}>
                                    <View style={{ flex: 7, padding: 5, paddingBottom: 0 }}>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <View style={{ flexDirection: 'row', flex: 1, }}>
                                                <Text style={{ color: '#212020' }}>#34271</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ borderColor: '#cd2121', borderWidth: 1, paddingVertical: 2, paddingHorizontal: 3, alignSelf: 'flex-end', borderRadius: 4 }}>
                                                    <Text style={{ color: '#cd2121', fontWeight: '300', fontSize: 9 }}>COOKING</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{ flex: 2, paddingTop: 8, flexDirection: 'row' }}>
                                            <TouchableOpacity style={{ backgroundColor: '#cd2121', alignSelf: 'flex-start', borderRadius: 4, padding: 3 }} onPress={() => this.showTrackDetails("TRACK")}>
                                                <Text style={{ fontSize: 12, fontWeight: '300', color: '#fff' }}>TRACK NOW</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={{ backgroundColor: '#666262', alignSelf: 'flex-start', borderRadius: 4, padding: 3, marginLeft: 5 }} onPress={() => this.showTrackDetails("VIEW")}>
                                                <Text style={{ fontSize: 12, fontWeight: '300', color: '#fff' }}>View Details</Text>
                                            </TouchableOpacity>
                                            <Text style={{ marginLeft: 5, fontSize: 8, color: '#5b5858', fontWeight: '300', marginTop: 10 }}>Give OTP to delivery person</Text>
                                        </View>
                                    </View>
                                    <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2dbe60', borderRadius: 4 }}>
                                        <Text style={{ fontSize: 12 }}>OTP</Text>
                                        <Text style={{ fontSize: 25, color: '#fff', fontWeight: '500' }}>7913</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </Display> */}
                    {/* Added to cart Display */}
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
                </Display>
            </View >
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
        padding: 0
    },
    offerContainer:
    {
        marginTop: 0,

    },
    topbarOffers:
    {
        padding: 0,
        paddingTop: 5,
        marginLeft: 5,
        backgroundColor: '#fff',
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    trendingCategoryContainer:
    {
        marginTop: 5,
        padding: 5,
    },
    ifNotLoggedInContainer:
    {
        margin: 5,
        // padding: 5,
        height: 100,
        backgroundColor: '#f7f8f7',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#d8d8d8'
    },
    loginRevealContainer: {
        flex: 1,
        padding: 5
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
    ongoingOrderContainer: {
        margin: 5,
        padding: 5,
        backgroundColor: '#2dbe60',
        height: 210,
        borderRadius: 4,
        flexDirection: 'row'
    },
    headGreetinContainer:
    {
        // margin: 5,
        // padding: 5,
        // backgroundColor: '#2dbe60',
        // height: 100,
        // borderRadius: 4,
        height: 100,
        width: Dimensions.get('window').width, flex: 1, padding: 10,
        flexDirection: 'row'
    },


    topSellingContainer:
    {
        marginTop: 5,
        padding: 0,
    },
    innerContainer:
    {

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
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingTop: 10, paddingLeft: 5,
        backgroundColor: '#fff',
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        overflow: "hidden",

    },
    quickPicksContainer:
    {
        marginTop: 5,
        padding: 10,
    },
    walletContainer:
    {
        marginTop: 10,
        flexDirection: 'column',
        height: 60,
        backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.6,
        shadowRadius: 3, elevation: 2,
        marginBottom: 10,
    },
    quickpicks:
    {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
        backgroundColor: '#fff', borderColor: '#fff', borderWidth: 1, marginRight: 8,
        width: 120, height: 180, borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
        borderTopRightRadius: 4, borderBottomRightRadius: 4,
        overflow: "hidden",
        shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2,
    },
    quickPicksInner:
    {
        marginTop: 5,
        paddingVertical: 10,
        borderTopColor: '#eaeaea',
        borderTopWidth: 1,
        borderBottomColor: '#eaeaea',
        borderBottomWidth: 1,
        backgroundColor: '#fff',
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    superChefBox:
    {
        height: 300,
        width: Dimensions.get('window').width - 120,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    superChefContainer:
    {
        marginTop: 5,
        padding: 5,
    },

    //Recommended Products

    custHeader: {
        flex: 1, backgroundColor: '#f2f6fc',
        padding: 10,
        // paddingBottom: 0,
        height: 60
    },
    recitemContainer: {
        flexDirection: 'column',
        borderRadius: 5,
        marginBottom: 5,
        borderRadius: 10,
        marginLeft: 0,
        // marginRight: 5,
        height: 200, marginRight: 5,
        width: 180,
        backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2,
    },
    recproductImage: {
        backgroundColor: '#fefefe',
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        overflow: "hidden",
        width: "100%",
        height: '100%'
    },
    recactionButton: {
        width: 100,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#2dbe60',
        //position: 'absolute',
        //bottom: 65,
        zIndex: 999,
        //left:130,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#2dbe60',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.9,
        shadowRadius: 1,
        elevation: 1,
    },
    recsuperAdd: {
        position: 'absolute',
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: 'transparent',
        right: 5,
        top: -1
    },

    //Customisation modal
    modalContainer:
    {
        width: null,
        backgroundColor: '#fff',
        height: Dimensions.get('window').height / 2 + 100,
        flexDirection: 'column',
        padding: 0
    },
    body: {
        flex: 7, padding: 10
    },
    customisationButton: {
        flex: 2, padding: 10, borderTopWidth: 1, borderColor: '#e9e9eb',
    },
    textVIew: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500'
    },

    //Feedback Modal
    feedbackModalContainer:
    {
        width: null,
        backgroundColor: '#fff',
        flexDirection: 'column',
        padding: 0
    },
    exitModalContainer: {
        width: "80%",
        backgroundColor: '#fff',
        flexDirection: 'row',
        padding: 0,
        borderRadius: 4,
        shadowColor: '#000', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.2,
        shadowRadius: 1, elevation: 1,
        height: 250,
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
    exitModal: {
        justifyContent: 'center', alignItems: 'center',
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
    PastOrders: {
        borderRadius: 4,
        backgroundColor: '#fff',
        shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.3,
        shadowRadius: 2, elevation: 1,
        marginBottom: 5, height: 180, width: 290, marginRight: 8
    }, detailModalContainer:
    {
        width: null,
        backgroundColor: '#fff',
        flexDirection: 'column',
        padding: 0
    },
    box: {
        backgroundColor: '#ebebeb', justifyContent: 'center', alignItems: 'center', borderRadius: 4, padding: 10, margin: 5
    },

});


