import React from 'react';
import {
    StyleSheet, Text, View, BackHandler, Image, Platform, ListView, ScrollView, StatusBar, ActivityIndicator, Dimensions, TouchableOpacity, AsyncStorage, ImageBackground, ToastAndroid, TextInput
} from 'react-native';
import { Container, Header, Left, Body, Right, Button, Radio, ListItem, CheckBox, Icon as BaseIcon, Title, Segment, Content, Text as BaseText } from 'native-base';
import Display from 'react-native-display';
//import { TextField } from 'react-native-material-textfield';
import Icon from 'react-native-vector-icons/FontAwesome';
import GridView from 'react-native-super-grid';
import Modal from 'react-native-modal';
import ContentLoader from 'react-native-content-loader';
import { Rect } from 'react-native-svg';
import Global from '../Urls/Global';

const BASE_PATH = Global.BASE_PATH;
const Categories = () => <ContentLoader height={150}
    primaryColor='#eeeeee'
    secondaryColor='#fff'
    speed={100}
>
    <Rect x="0" y="0" rx="0" ry="0" width="150" height="120" />
    <Rect x="5" y="125.27" rx="0" ry="0" width="80" height="15" />

</ContentLoader>
export default class SearchScreen extends React.Component {

    constructor(props) {
        super(props);

        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource1: [],
            customerId: "",
            Items: [],
            searchItems: [],
            categoryItems: ["r1", "r1", "r1", "r1"],
            chefItems: ["r1", "r1", "r1", "r1"],
            searchFood: "",
            searchStart: false,
            isSearching: false,
            showSearch: false,
            searchDisabled: true,
            locationObj: {},
            dim: 150,
            categories: false,
            networkRequest: false,
            noSearchProducts: false,
            replaceCartItems: false,
            customisationModal: null,
            visibleModal: null,
            itemCount: 0,
            payableAmount: 0.0,
            cartItems: [],
            cartTypeFlag: "",
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
            showChefSearch: false,
            searchChefData: [],
            chefItemLenght: 0,
            searchItemLength: 0,
            noChefItems: false,
        }
    }

    async retrieveItem(key) {
        console.log("SearchScreen retrieveItem() key: ", key);
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
        console.log("SearchScreen storeItem() key: ", key);
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
        console.log("SearchScreen removeItem() key: ", key);
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    startSearching = (search) => {
        console.log("SearchScreen startSearching() search: ", search);
        if (search.search == "") {
            //console.log("Search : ", search)
            this.setState({ showSearch: false, searchDisabled: true, noSearchProducts: false })
        }
        this.setState({ searchFood: search.search, searchStart: false });
        if (search.search.length > 2) {
            this.setState({ isSearching: true, noSearchProducts: false, searchDisabled: false });
            const formValue = JSON.stringify({
                "find": search.search,
                "cityCode": this.state.locationObj.cityCode,
                "locCode": this.state.locationObj.locCode,
                "reqFrom": "APP"
            })
            console.log("FIND_PRODUCTS formValue : ", formValue);
            fetch(BASE_PATH + Global.FIND_PRODUCTS, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: formValue
            }).then((response) => response.json()
            ).then((responseJson) => {
                console.log("FIND_PRODUCTS Response : ", responseJson);
                console.log("DATA length : ", responseJson.Data.length);
                console.log("CHEFDATA length :", responseJson.ChefData.length);

                if (responseJson.Data.length > 0 || responseJson.ChefData.length > 0) {
                    if (responseJson.ChefData.length > 0) {
                        this.setState({ showChefSearch: true, searchChefData: responseJson.ChefData, chefItemLenght: responseJson.ChefData.length })
                    }
                    else {
                        this.setState({ showChefSearch: false })
                    }
                    let matchedArr = this.matchWithCart(JSON.parse(JSON.stringify(responseJson.Data)));
                    this.setState({ searchItems: matchedArr, searchStart: true, isSearching: false, showSearch: true, searchItemLength: responseJson.Data.length });
                } if (responseJson.Data.length == 0 && responseJson.ChefData.length == 0) {
                    this.setState({
                        searchStart: true, isSearching: false, noSearchProducts: true, showSearch: false
                    })
                }
                else {
                    this.setState({ searchStart: true, isSearching: false });
                }
            });
        }
    }

    search = () => {
        console.log("SearchScreen search() search: ", this.state.searchFood);
        this.setState({ searchStart: false, isSearching: true, searchDisabled: true, noSearchProducts: false });
        const formValue = JSON.stringify({
            "find": this.state.searchFood,
            "cityCode": this.state.locationObj.cityCode,
            "locCode": this.state.locationObj.locCode,
            "reqFrom": "APP"
        })
        console.log("FIND_PRODUCTS formValue : ", formValue)
        if (this.state.searchFood.length > 2) {
            this.setState({ noSearchProducts: false, searchDisabled: false })
            fetch(BASE_PATH + Global.FIND_PRODUCTS, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: formValue
            }).then((response) => response.json()).then((responseJson) => {
                //console.log("FIND_PRODUCTS Response : ", responseJson);
                if (responseJson.Data.length > 0 || responseJson.ChefData.length > 0) {
                    if (responseJson.ChefData.length > 0) {
                        this.setState({ showChefSearch: true, searchChefData: responseJson.ChefData, chefItemLenght: responseJson.ChefData.length })
                    }
                    else {
                        this.setState({ showChefSearch: false })
                    }
                    let matchedArr = this.matchWithCart(JSON.parse(JSON.stringify(responseJson.Data)));
                    this.setState({ searchItems: matchedArr, searchStart: true, showSearch: true, isSearching: false, searchItemLength: responseJson.Data.length });
                } if (responseJson.Data.length == 0 && responseJson.ChefData.length == 0) {
                    this.setState({
                        searchStart: true, isSearching: false, noSearchProducts: true, showSearch: false
                    })
                }
                else {
                    this.setState({ searchStart: true, isSearching: false });
                }
            });
        }
    }

    selectFood = (data) => {
        console.log("SearchScreen selectFood() data: ", data);
        this.props.navigation.navigate('Products', { cId: data.CategoryId, cName: data.CategoryName, pId: data.FoodId })
    }

    getPincode = () => {
        console.log("SearchScreen getPincode()");
        this.retrieveItem('Address').then((data) => {
            this.setState({ locationObj: data, }, () => this.fetchCategories(), this.fetchChefs());
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    componentDidMount() {
        console.log("SearchScreen componentDidMount()");
        this.getPincode();
        this.props.navigation.addListener('didFocus', () => {
            this.initCartItems();
        });
    }

    fetchChefs = () => {
        console.log("SearchScreen fetchChefs(cityCode) ", this.state.locationObj.cityCode);
        this.setState({ networkRequest: false })
        fetch(BASE_PATH + Global.FETCH_PUSH_CHEFS_ON_SEARCH_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            // body: JSON.stringify({ cityCode: this.state.locationObj.cityCode })
        }).then((response) => response.json()).then((responseJson) => {

            console.log("FETCH_PUSH_CHEFS_ON_SEARCH_URL response : ", responseJson);
            if (responseJson.Success == 'Y') {
                this.setState({ chefItems: responseJson.Data, categoriesLoader: false, categories: true });
            }
            if (responseJson.Success == 'N') {
                this.setState({ noChefItems: true, categoriesLoader: false, categories: true });
            }
        }).catch((error) => {
            console.log("Error Fetching Chefs: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ networkRequest: true })
        });
    }

    fetchCategories = () => {
        console.log("SearchScreen fetchCategories(cityCode) ", this.state.locationObj.cityCode);
        this.setState({ networkRequest: false })
        // const formValue = JSON.stringify({
        //     'cityCode': this.state.locationObj.cityCode,
        //     'reqFrom': 'APP',
        // })
        //console.log("FETCH_PUSH_CATEGORIES_ON_SEARCH_URL ", formValue);
        fetch(BASE_PATH + Global.FETCH_PUSH_CATEGORIES_ON_SEARCH_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            // body: formValue
        }).then((response) => response.json()).then((responseJson) => {

            if (responseJson.Success == 'Y') {
                this.setState({ categoryItems: responseJson.Data, categoriesLoader: false, categories: true });
            }
        }).catch((error) => {
            console.log("Error Fetching Categories: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.setState({ networkRequest: true })
        });

    }

    showProducts = (categoryId, categoryName) => {
        console.log("SearchScreen showProducts() navigate categoryId: ", categoryId, " && categoryName: ", categoryName);
        this.props.navigation.navigate('Products', { cId: categoryId, cName: categoryName })
    }

    isEmptyObject(obj) {
        return (Object.keys(obj).length === 0 && obj.constructor == Object);
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
                tempArr[i].SelAdns = addons;
                tempArr[i].SelVar = vrnt;
            }
        }
        return JSON.parse(JSON.stringify(tempArr));
    }

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
    openCustomization = (item) => {
        console.log("SearchScreen openCustomization() item: ", item)
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

    addProductToCart = (item) => {
        console.log("SearchScreen addProductToCart() item:", item, this.state.cartTypeFlag);
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
            this.setState({ replaceCartItems: true, customisationModal: null })
            // ToastAndroid.show("Chef food cannot be added with other food. Please clear the cart and continue adding.", ToastAndroid.SHORT);
        }
    }

    emptyCart = () => {
        console.log("SearchScreen emptyCart()");
        this.setState({ cartItems: [], cartTypeFlag: 'R' });
        this.storeItem("CartItems", []);
        ToastAndroid.show("Cart emptied", ToastAndroid.SHORT);
        this.setState({ replaceCartItems: false })
        this.initCartItems();
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
                                for (let y = 0; y < cartObj.Addons.length; y++) {
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
                            for (let y = 0; y < cartObj.Variant.length; y++) {
                                if (cartObj.Variant[y].Id == cartItems[i].Addons[x].Id) {
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
            this.setState({ replaceCartItems: true, customisationModal: null })
            //  ToastAndroid.show("Chef food cannot be added with other food. Please clear the cart and continue adding.", ToastAndroid.SHORT);
        }
    }

    initCartItems = () => {
        console.log("SearchScreen initCartItems()");
        this.retrieveItem('CartItems').then((uCart) => {
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
            console.log("uCart: ", uCart);
            this.setState({ cartTypeFlag: type, payableAmount: total.toFixed(2), itemCount: uCart.length, cartItems: uCart });

        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
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
        console.log("SearchScreen updateProductList() prod: ", prod);
        let itemsArr = JSON.parse(JSON.stringify(this.state.searchItems));
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
        this.setState({ payableAmount: total.toFixed(2), searchItems: itemsArr });
        ToastAndroid.show(str, ToastAndroid.SHORT);
        this.storeItem("CartItems", JSON.stringify(this.state.cartItems));
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

    render() {
        return (
            <View style={styles.mainContainer}>
                <View style={styles.upperContainer}>
                    <View style={{ flex: 8, padding: 0 }}>
                        <TextInput style={{ paddingLeft: 10, height: 40, }}
                            placeholder="Kya Khaiyega .. ?"
                            placeholderTextColor="#adabab"
                            underlineColorAndroid='transparent'
                            returnKeyType="go"
                            keyboardType="default"
                            autoCorrect={false}
                            autoCapitalize='none'
                            onChangeText={(search) => this.startSearching({ search })}
                            onSubmitEditing={() => { this.search.bind(this); }}
                            ref={component => this._phoneInput = component}
                        />
                    </View>
                    <TouchableOpacity disabled={this.state.searchDisabled}>
                        <View style={[styles.applybutton, { backgroundColor: (this.state.searchDisabled == true) ? '#f26f6f' : '#cd2121' }]}>
                            <Display enable={!this.state.isSearching}>
                                <Icon name='search' color='#fff' size={15} /></Display>
                            <Display enable={this.state.isSearching}>
                                <ActivityIndicator color='#fff' />
                            </Display>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* <View style={[styles.lowerContainer, { marginBottom: (this.state.itemCount > 0) ? 50 : 0 }]}> */}
                <Display enable={!this.state.networkRequest} style={{ flex: 1, }}>
                    <Display enable={this.state.showSearch} style={{ marginBottom: (this.state.itemCount > 0) ? 50 : 0 }}>
                        <ScrollView style={styles.topSellingContainer}>
                            <View style={{ flexDirection: 'row', marginLeft: 10, marginTop: 5 }}>
                                <Icon name={'search'} size={16} color={'#6d6868'} />
                                <Text style={{ color: '#6d6868', fontSize: 16, marginLeft: 5, fontWeight: '500' }}>DISHES ({this.state.searchItemLength})</Text>
                            </View>
                            <GridView
                                spacing={10}
                                showVerticalScrolling={false}
                                itemDimension={this.state.dim}
                                items={this.state.searchItems}
                                renderItem={item => (
                                    <View style={styles.searchItemContainer}>
                                        {/* <Display enable={this.state.topSellingLoader}>
                                                <TopSellings />
                                            </Display> */}
                                        <Display enable={item.ImageAvailable} style={{
                                            flex: 3,
                                            justifyContent: 'flex-start',
                                            alignItems: 'flex-start',
                                        }}>
                                            <ImageBackground source={{ uri: BASE_PATH + item.ProductImage }} style={[styles.productImage, { opacity: (!item.Addable ? .6 : 1) }]}>
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
                                        <Display enable={!item.ImageAvailable} style={{
                                            flex: 3,
                                            justifyContent: 'flex-start',
                                            alignItems: 'flex-start',
                                        }}
                                        >
                                            <ImageBackground source={require('../assets/empty.jpg')} style={[styles.productImage, { opacity: (!item.Addable ? .6 : 1) }]}>
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
                                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                                <Display enable={item.OfferApplied == 'YES' && item.OfferText != ""} style={{ flex: (!item.Addable) ? 5 : 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                    <Text style={{ color: "#adabab", fontWeight: '600', fontSize: 12, textDecorationLine: 'line-through', marginTop: 3 }}>₹ {item.ProductPrice}</Text>
                                                    <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                </Display>
                                                <Display enable={item.OfferApplied == 'YES' && item.OfferText == ""} style={{ flex: (!item.Addable) ? 5 : 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                    <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                </Display>
                                                <Display enable={item.OfferApplied != 'YES'} style={{ flex: (!item.Addable) ? 5 : 7, backgroundColor: '#fff', flexDirection: 'row' }}>
                                                    <Text style={{ color: "#cd2121", fontSize: 15, fontWeight: '600', marginLeft: 4 }}>₹ {item.OfferPrice}</Text>
                                                </Display>
                                                <View style={{ flex: (!item.Addable) ? 5 : 3, borderWidth: 1, borderColor: (!item.Addable ? '#ada8a8' : "#2dbe60"), backgroundColor: (!item.Addable ? '#cd2121' : "#2dbe60"), justifyContent: 'center', alignItems: 'center', height: 20, borderRadius: 1, marginHorizontal: 5 }}>
                                                    <Display enable={item.Addable} style={{ flex: 1, flexDirection: 'row', }}>
                                                        <Display enable={item.VarLen > 0 || item.AdnLen > 0} style={{ flex: 1, flexDirection: 'row', }}>
                                                            <Display enable={item.Qty < 1} style={{ flex: 1, flexDirection: 'row' }}>
                                                                <TouchableOpacity onPress={this.openCustomization.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                                                    <Text style={{ color: "#fff", fontSize: 14, fontWeight: 'bold' }}>ADD</Text>
                                                                    <Text style={[{ color: "#fff" }, styles.superAdd]}>+</Text>
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
                                                    <Display enable={!item.Addable} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 4 }}>
                                                        <TouchableOpacity onPress={this.showmsg} style={{ flexDirection: 'row' }}>
                                                            <BaseIcon name={'ios-stopwatch'} style={{ color: '#fff', fontSize: 12 }} />
                                                            <Text style={{ color: "#fff", fontSize: 12, marginLeft: 3 }}>{item.AvailableIn}</Text>
                                                        </TouchableOpacity>
                                                    </Display>
                                                </View>
                                            </View>
                                        </View>

                                    </View>
                                )
                                }
                            />
                            <Display enable={this.state.showChefSearch}>
                                <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                                    <Icon name={'home'} size={20} color={'#6d6868'} />
                                    <Text style={{ color: '#6d6868', fontSize: 16, marginLeft: 5, fontWeight: '500' }}>YOUR BAWARCHIS ({this.state.chefItemLenght})</Text>
                                </View>
                                <GridView
                                    spacing={0}
                                    itemDimension={this.state.dim}
                                    items={this.state.searchChefData}
                                    renderItem={item => (
                                        <TouchableOpacity onPress={() => { this.props.navigation.navigate("ChefDishes", { vId: item.VId }) }}>
                                            <View style={styles.itemContainer}>
                                                <Display enable={!this.state.categories} style={{ flex: 1, padding: 4 }}>
                                                    <Categories />
                                                </Display>
                                                <Display enable={this.state.categories} style={{ flex: 1 }}>
                                                    <ImageBackground source={{ uri: BASE_PATH + item.ChefImage }} style={{ flex: 3, backgroundColor: 'transparent' }}>
                                                        {/* <View style={{ flex: 1, alignSelf: 'flex-end', paddingVertical: 4 }}>
                                                        <Display enable={item.OfferText != ''}>
                                                            <View style={{
                                                                width: 100, height: 25, marginRight: -8,
                                                                backgroundColor: '#cd2121',
                                                                justifyContent: 'center', alignItems: 'center',
                                                            }}>
                                                                <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 16, }}>{item.OfferText}</Text>
                                                            </View>
                                                        </Display>
                                                    </View> */}
                                                    </ImageBackground >
                                                    <View style={{ backgroundColor: '#fff', padding: 4 }}>
                                                        <Text style={{ fontSize: 14, color: '#999a95', fontWeight: 'bold' }}>{item.ChefKitchenName}</Text>
                                                    </View>
                                                </Display>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                    }
                                />
                            </Display>
                        </ScrollView>
                    </Display>

                    <Display enable={!this.state.showSearch} style={{ marginBottom: (this.state.itemCount > 0) ? 50 : 0 }}>
                        <ScrollView contentContainerStyle={{ padding: 10, backgroundColor: '#f3f7fa', justifyContent: 'center', alignItems: 'center', }} showsVerticalScrollIndicator={false}>
                            <Display enable={this.state.noSearchProducts} style={{ backgroundColor: '#f3f7fa' }}>
                                <View style={{ height: 30, borderRadius: 4, backgroundColor: '#000', width: '100%', marginBottom: 5, padding: 5, flexDirection: 'row', marginBottom: 4 }}>
                                    <View style={{ flex: 1.7 }}>
                                        <Text style={{ fontSize: 14, color: '#fff' }}>No such products are found.</Text>
                                    </View>
                                    <TouchableOpacity style={{ alignSelf: 'flex-end', flex: 1 }} onPress={() => this.setState({ noSearchProducts: false })}>
                                        <Icon name={'times'} size={20} color={"#fff"} style={{ alignSelf: 'flex-end' }} />
                                    </TouchableOpacity>
                                </View>
                            </Display>

                            <Display enable={true} style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                <Icon name={'spoon'} size={30} color={"#62696f"} />
                                <Text style={{ color: '#3d4047', fontSize: 22, fontWeight: "600", marginTop: 10 }}>FOOD TRENDS NEARBY!</Text>
                                <Text style={{ color: '#2e353b', fontSize: 15, fontWeight: "100", marginTop: 10 }}>DISCOVER YOUR FOOD FANTACIES AROUND YOU</Text>

                                <GridView
                                    spacing={0}
                                    itemDimension={this.state.dim}
                                    items={this.state.categoryItems}
                                    renderItem={item => (
                                        <TouchableOpacity onPress={this.showProducts.bind(this, item.CategoryId, item.CategoryName)}>
                                            <View style={styles.itemContainer}>
                                                <Display enable={!this.state.categories} style={{ flex: 1, padding: 4 }}>
                                                    <Categories />
                                                </Display>
                                                <Display enable={this.state.categories} style={{ flex: 1 }}>
                                                    <ImageBackground source={{ uri: BASE_PATH + item.CategoryImage }} style={{ flex: 3, backgroundColor: 'transparent' }}>
                                                        {/* <View style={{ flex: 1, alignSelf: 'flex-end', paddingVertical: 4 }}>
                                                        <Display enable={item.OfferText != ''}>
                                                            <View style={{
                                                                width: 100, height: 25, marginRight: -8,
                                                                backgroundColor: '#cd2121',
                                                                justifyContent: 'center', alignItems: 'center',
                                                            }}>
                                                                <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 16, }}>{item.OfferText}</Text>
                                                            </View>
                                                        </Display>
                                                    </View> */}
                                                    </ImageBackground >
                                                    <View style={{ backgroundColor: '#fff', padding: 4 }}>
                                                        <Text style={{ fontSize: 14, color: '#999a95', fontWeight: 'bold' }}>{item.CategoryName}</Text>
                                                    </View>
                                                </Display>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                    }
                                />
                            </Display>
                            <Display enable={!this.state.noChefItems} style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                <Icon name={'home'} size={30} color={"#62696f"} style={{ marginTop: 10 }} />
                                <Text style={{ color: '#3d4047', fontSize: 22, fontWeight: "600", marginTop: 10 }}>BMF EXCLUSIVE</Text>
                                <Text style={{ color: '#2e353b', fontSize: 15, fontWeight: "100", marginTop: 10, }}>FIND LOVE OF MOM'S COOKING</Text>

                                <GridView
                                    spacing={0}
                                    itemDimension={this.state.dim}
                                    items={this.state.chefItems}
                                    renderItem={item => (
                                        <TouchableOpacity onPress={() => { this.props.navigation.navigate("ChefDishes", { vId: item.VId }) }}>
                                            <View style={styles.itemContainer}>
                                                <Display enable={!this.state.categories} style={{ flex: 1, padding: 4 }}>
                                                    <Categories />
                                                </Display>
                                                <Display enable={this.state.categories} style={{ flex: 1 }}>
                                                    <ImageBackground source={{ uri: BASE_PATH + item.ChefImage }} style={{ flex: 3, backgroundColor: 'transparent' }}>
                                                        {/* <View style={{ flex: 1, alignSelf: 'flex-end', paddingVertical: 4 }}>
                                                        <Display enable={item.OfferText != ''}>
                                                            <View style={{
                                                                width: 100, height: 25, marginRight: -8,
                                                                backgroundColor: '#cd2121',
                                                                justifyContent: 'center', alignItems: 'center',
                                                            }}>
                                                                <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 16, }}>{item.OfferText}</Text>
                                                            </View>
                                                        </Display>
                                                    </View> */}
                                                    </ImageBackground >
                                                    <View style={{ backgroundColor: '#fff', padding: 4 }}>
                                                        <Text style={{ fontSize: 14, color: '#999a95', fontWeight: 'bold' }}>{item.ChefKitchenName}</Text>
                                                    </View>
                                                </Display>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                    }
                                />
                            </Display>
                        </ScrollView>
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
                        style={{ flex: 1, bottom: 0, position: 'absolute', width: '100%' }}
                    >
                        <View>
                            <View style={{ flexDirection: 'row', height: 50, zIndex: 50 }}>
                                <View style={{ backgroundColor: "#ebebeb", justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>₹ {this.state.payableAmount} | {this.state.itemCount} Item(s)</Text>
                                </View>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('Cart')}>
                                    <View style={{ backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>VIEW CART</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Display>

                </Display>
                <Modal isVisible={this.state.visibleModal === 7 && this.state.customisationModal == 7} style={styles.bottomModal} onBackButtonPress={() => this.setState({ visibleModal: null, customisationModal: null })}>
                    {this.__renderCustomisationContent()}
                </Modal>

                <Display enable={this.state.networkRequest} style={styles.networkRequest}>
                    <Image source={require("../assets/networkerror.png")} resizeMode={"center"} style={{ width: 200, height: 200 }} />
                    <Text style={{ marginTop: 3, fontSize: 12, color: '#a39f9f' }}>It seems to be a network error!</Text>
                    <TouchableOpacity style={{ backgroundColor: '#000', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 4, marginTop: 5 }} onPress={() => this.componentDidMount()}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '400', }}>Retry</Text>
                    </TouchableOpacity>
                </Display>
                {/* </View> */}
            </View >
        );
    }
}
const styles = StyleSheet.create({
    mainContainer:
    {
        // marginTop: Expo.Constants.statusBarHeight,
        flex: 1,
        width: null,
        height: null,
        backgroundColor: '#f3f7fa',
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
        padding: 10,
        width: 40
    },
    searchContainer:
    {
        flexDirection: 'row',
        padding: 5,
        marginTop: 5,
        marginBottom: 5,
        borderRadius: 4,
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
        paddingTop: 10,
        paddingHorizontal: 10,

    },
    text:
    {
        fontSize: 16, fontWeight: '500'
    },
    greentext:
    {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#dbdbdb',
        padding: 10
    },
    itemsView: {
    },
    searchItemContainer: {
        flexDirection: 'column',
        borderRadius: 5,
        marginBottom: 5,
        borderRadius: 10,
        marginLeft: 0,
        // marginRight: 5,
        height: 200,
        backgroundColor: '#f9f9f9', shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2,
    },
    productImage: {
        backgroundColor: '#fefefe',
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        overflow: "hidden",
        width: "100%",
        height: '100%'
    },
    itemContainer: {
        flexDirection: 'column',
        borderRadius: 5,
        margin: 10,
        height: 150,
        backgroundColor: '#f9f9f9', shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2,
    },
    networkRequest: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },


    topSellingContainer:
    {
        marginTop: 5,
        paddingTop: 0,
        paddingHorizontal: 0,
    },
    superAdd: {
        position: 'absolute',
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: 'transparent',
        right: 5,
        top: -1
    },
    modalContainer:
    {
        width: null,
        backgroundColor: '#fff',
        height: Dimensions.get('window').height / 2 + 100,
        flexDirection: 'column',
        padding: 0,
    },
    custHeader: {
        flex: 1, backgroundColor: '#f2f6fc',
        padding: 10,
        // paddingBottom: 0,
        height: 60
    },
    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
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
});
