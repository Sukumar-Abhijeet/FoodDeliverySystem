import React from 'react';
import {
    StyleSheet, Text, View, BackHandler, ToastAndroid, Image, ImageBackground, ListView, ScrollView, RefreshControl, ActivityIndicator, Dimensions, TouchableOpacity, AsyncStorage, Alert
} from 'react-native';
import Display from 'react-native-display';
import { TextField } from 'react-native-material-textfield';
import Icon from 'react-native-vector-icons/FontAwesome';
export default class CouponScreen extends React.Component {

    constructor(props) {
        super(props);

        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource1: ds.cloneWithRows([]),
            couponState: true,
            loader: false,
            navigatedFrom: this.props.navigation.getParam("navigatedFrom"),
            customerId: "",
            pincode: "",
            couponCode: "",
            couponArr: [],
            checkoutObj: this.props.navigation.getParam("checkoutObj")
        }
    }

    async retrieveItem(key) {
        console.log("CouponScreen retrieveItem() key: ", key);
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
        console.log("CouponScreen storeItem() key: ", key);
        try {
            var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
            return jsonOfItem;
        }
        catch (error) {
            console.log(error.message);
        }
    }

    async removeItem(key) {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    getUserData = () => {
        console.log("CouponScreen getUserData()");
        this.retrieveItem('UserData').then((user) => {
            this.setState({ customerId: user.CustomerId });
            this.getPincode();
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    getPincode = () => {
        console.log("CouponScreen getPincode()");
        this.retrieveItem('Pincode').then((data) => {
            this.setState({ pincode: data });
            this.fetchOffers();
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    fetchOffers = () => {
        console.log("CouponScreen fetchOffers()");
        this.retrieveItem('OffersData').then((data) => {
            this.setState({ loader: true })
            if (1) {
                fetch("https://www.bringmyfood.in/data/reactapp/userapp/fetchoffers.php", {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'customerId': this.state.customerId,
                        'pincode': this.state.pincode
                    })
                }).then((response) => response.json()).then((responseJson) => {
                    responseJson.Date = new Date().getDate();
                    if (responseJson.Success == 'Y') {
                        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
                        this.setState({ dataSource1: ds.cloneWithRows(responseJson.Data), couponArr: responseJson.Data });
                        this.storeItem("OffersData", responseJson);
                        this.setState({ loader: false })

                    }
                    else {
                        this.setState({ couponState: false });
                        this.setState({ loader: false })

                    }
                });
            }
            else {
                if (data.Date == new Date().getDate()) {
                    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
                    this.setState({ dataSource1: ds.cloneWithRows(data.Data), couponArr: data.Data });
                    this.setState({ loader: false })

                }
                else {
                    fetch("https://www.bringmyfood.in/data/reactapp/userapp/fetchoffers.php", {
                        method: "POST",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            'customerId': this.state.customerId,
                            'pincode': this.state.pincode
                        })
                    }).then((response) => response.json()).then((responseJson) => {
                        responseJson.Date = new Date().getDate();
                        if (responseJson.Success == 'Y') {
                            const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
                            this.setState({ dataSource1: ds.cloneWithRows(responseJson.Data), couponArr: responseJson.Data });
                            this.storeItem("OffersData", responseJson);
                            this.setState({ loader: false })

                        }
                        else {
                            this.setState({ couponState: false });
                            this.setState({ loader: false })

                        }
                    });
                }
            }

        });
    }

    filterCoupons = () => {
        console.log("CouponScreen filterCoupons() couponCode: ", this.state.couponCode);
        if (this.state.couponCode != "") {
            if (this.state.couponArr.length > 0) {
                let newArr = [];
                for (let i = 0; i < this.state.couponArr.length; i++) {
                    if (this.state.couponArr[i].OfferCode.toLowerCase().includes(this.state.couponCode.toLowerCase())) {
                        newArr.push(this.state.couponArr[i]);
                    }
                }
                const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
                this.setState({ dataSource1: ds.cloneWithRows(newArr) });
            }
        }
    }

    applyCoupon = (item) => {
        this.setState({ loader: true })
        console.log("CouponScreen applyCoupon() item: ", item);
        let coo = this.state.checkoutObj;
        // console.log("checkoutObj: ", coo);
        if (coo != null) {
            let minimumCartValue = eval(item.OfferMinCartVal);
            let maxDiscount = eval(item.OfferMaxDiscount);
            let couponUsesCount = eval(item.OfferCodeUseCount);
            let couponUsedCount = eval(item.OfferCodeUsedCount);
            let newUserFlag = item.OfferNewUser;
            let orderCount = eval(item.OrderCount);
            let offerAmount = eval(item.OfferAmount);
            let cartTotal = eval(coo.ItemTotal) + eval(coo.PackagingTotal);
            let newCartTotal = cartTotal;
            if (newUserFlag == "YES") {
                if (orderCount < 1) {
                    if (couponUsedCount < couponUsesCount) {
                        if (cartTotal >= minimumCartValue) {
                            let savedAmount = 0;
                            if (item.OfferType == "AMOUNT") {
                                savedAmount = offerAmount;
                                newCartTotal = (cartTotal - offerAmount);
                                if (newCartTotal < 0) {
                                    newCartTotal = 0;
                                }
                            }
                            else if (item.OfferType == "PERCENT") {
                                let percentAmt = ((offerAmount / 100) * cartTotal);
                                percentAmt = (percentAmt > maxDiscount) ? maxDiscount : percentAmt;
                                savedAmount = percentAmt;
                                newCartTotal = (cartTotal - percentAmt);
                                if (newCartTotal < 0) {
                                    newCartTotal = 0;
                                }
                            }
                            coo.couponApplied = "YES";
                            coo.CouponObj = item;
                            this.storeItem("AppliedCoupon", item);

                            this.props.navigation.push('Cart', { navigatedFrom: "COUPON", checkoutObj: coo });
                            ToastAndroid.show('Coupon Applied Successfully', ToastAndroid.LONG);

                            this.setState({ loader: false });
                        }
                        else {
                            this.setState({ loader: false });
                            Alert.alert("", "Minimum cart value must be ₹" + minimumCartValue.toFixed(2) + "/- to avail this offer");
                        }
                    }
                    else {
                        this.setState({ loader: false })

                        Alert.alert("", "You have already used the coupon " + couponUsesCount + " time(s)");
                    }
                }
                else {
                    this.setState({ loader: false })

                    Alert.alert("", "This coupon is for new users.");
                }
            }
            else if (newUserFlag == "NO") {
                if (couponUsedCount < couponUsesCount) {
                    if (cartTotal >= minimumCartValue) {
                        let savedAmount = 0;
                        if (item.OfferType == "AMOUNT") {
                            savedAmount = offerAmount;
                            newCartTotal = (cartTotal - offerAmount);
                            if (newCartTotal < 0) {
                                newCartTotal = 0;
                            }
                        }
                        else if (item.OfferType == "PERCENT") {
                            let percentAmt = ((offerAmount / 100) * cartTotal);
                            percentAmt = (percentAmt > maxDiscount) ? maxDiscount : percentAmt;
                            savedAmount = percentAmt;
                            newCartTotal = (cartTotal - percentAmt);
                            if (newCartTotal < 0) {
                                newCartTotal = 0;
                            }
                        }
                        coo.couponApplied = "YES";
                        coo.CouponObj = item;
                        this.storeItem("AppliedCoupon", item);
                        this.props.navigation.push('Cart', { navigatedFrom: "COUPON", checkoutObj: coo });
                        ToastAndroid.show('Coupon Applied Successfully', ToastAndroid.LONG);
                        this.setState({ loader: false });
                    }
                    else {
                        this.setState({ loader: false })

                        Alert.alert("", "Minimum cart value must be ₹" + minimumCartValue.toFixed(2) + "/- to avail this offer");
                    }
                }
                else {
                    this.setState({ loader: false })

                    Alert.alert("", "You have already used the coupon " + couponUsesCount + " time(s)");
                }
            }
        }
        else {
            this.setState({ loader: false })
            Alert.alert("", "No Cart data found");
        }
    }

    componentWillMount() {
        console.log("CouponScreen componentWillMount()");
        console.log("arrived here from ", this.state.navigatedFrom);
        this.getUserData();
    }

    render() {

        return (
            <View style={styles.mainContainer}>

                <Display enable={this.state.loader} style={{ height: Dimensions.get('window').height, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#cd2121" />
                </Display>
                <Display enable={!this.state.loader} style={{ flex: 1 }}>
                    <View style={styles.upperContainer}>
                        <View style={{ flex: 6 }}>
                            <TextField style={{ height: 30 }}
                                label="ENTER COUPON CODE"
                                placeholderTextColor="#fff"
                                underlineColorAndroid='transparent'
                                returnKeyType="next"
                                keyboardType="default"
                                autoCorrect={false}
                                labelHeight={10}
                                fontSize={12}
                                labelFontSize={8}
                                autoCapitalize='none'
                                onChangeText={(couponCode) => this.setState({ couponCode })}
                                ref={component => this._phoneInput = component}
                            />
                        </View>
                        <TouchableOpacity onPress={this.filterCoupons.bind(this)}>
                            <View style={styles.applybutton}>
                                <Text style={{ color: '#fff' }}>SEARCH COUPON</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.lowerContainer}>
                        <ScrollView>
                            <Display enable={this.state.couponState}>
                                <ListView
                                    enableEmptySections={true}
                                    dataSource={this.state.dataSource1}
                                    renderRow={(data) =>
                                        <View style={styles.couponContainer}>
                                            <View style={{ flexDirection: 'row', flex: 1 }}>
                                                <ImageBackground
                                                    source={{ uri: data.OfferBanner }}
                                                    style={{ flex: 2 }}>
                                                </ImageBackground>

                                                <View style={{ marginLeft: 10, flex: 6 }}>
                                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#818181' }}>{data.OfferDesc}</Text>
                                                    <Text style={styles.textEdit}>VALID UPTO {data.OfferEndDateDisplay}</Text>
                                                    <Text style={styles.textEdit}>MAX USE : {data.OfferCodeUseCount} TIME(s) </Text>
                                                    <Text style={styles.textEdit}>T&C - Applied  </Text>
                                                </View>

                                                <View style={{ flex: 2, justifyContent: 'flex-end' }}>
                                                    <Text style={[styles.textEdit, { color: '#cd2121' }]}> {data.OfferCode}</Text>
                                                    <TouchableOpacity onPress={this.applyCoupon.bind(this, data)}>
                                                        <View style={{ borderWidth: 1, borderColor: '#cd2121', justifyContent: 'center', alignItems: 'center', height: 15, borderRadius: 1, marginTop: 5 }}>
                                                            <Text style={{ color: "#cd2121", fontSize: 10 }}>APPLY</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    } />
                            </Display>
                            <Display enable={!this.state.couponState}>
                                <View style={{ paddingTop: 80, paddingHorizontal: 20 }}>
                                    <View style={{ marginTop: 6, height: 40, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 14, color: '#292525', color: '#fff' }}>Sorry No Offers For You at the Moment</Text>
                                    </View>
                                    <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
                                        <Icon name={"thumbs-down"} size={80} color="#cd2121" />
                                    </View>
                                    <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
                                        <Text style={{ fontSize: 10, color: '#292525' }}>Do You Know?</Text>
                                        <Text style={{ fontSize: 12, color: '#292525' }}>Frequent Buyers Get More Offers</Text>
                                    </View>
                                </View>
                            </Display>
                        </ScrollView>
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
        padding: 0
    },
    upperContainer:
    {
        height: 50,
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: '#fff', shadowColor: '#000',
        shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2,
    },
    applybutton:
    {
        flex: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#cd2121',
        borderRadius: 4,
        padding: 10
    },
    couponContainer:
    {
        flexDirection: 'row',
        padding: 5,
        marginBottom: 5,
        backgroundColor: '#fff', shadowColor: '#000',
        shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2,
    },
    textEdit:
    {
        fontSize: 12, color: '#757575'
    },
    lowerContainer:
    {
        height: Dimensions.get('window').height,
        backgroundColor: '#ebebeb',
        paddingTop: 15,
        paddingHorizontal: 5
    },

});