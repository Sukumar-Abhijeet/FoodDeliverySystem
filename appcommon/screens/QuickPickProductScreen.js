import React from 'react';
import { Container, Header, Left, Body, Right, Button, Radio, ListItem, CheckBox, Icon as BaseIcon, Title, Segment, Content, Text as BaseText } from 'native-base'
import {
  Dimensions, ImageBackground, View, Image, Alert,
  StyleSheet, ScrollView, TouchableOpacity, ListView, Text, ToastAndroid, AsyncStorage, Platform, StatusBar
} from 'react-native';
import Display from 'react-native-display';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/FontAwesome';
import GridView from 'react-native-super-grid';
import ContentLoader from 'react-native-content-loader';
import { Rect } from 'react-native-svg';
import Global from '../Urls/Global';

const BASE_PATH = Global.BASE_PATH;

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
const BodyIndicator = () => <ContentLoader height={200}
  primaryColor='#ebebeb'
  secondaryColor='#fff'
  speed={100}
>

  <Rect x="37.5" y="26.27" rx="0" ry="0" width="22.2" height="20.72" />
  <Rect x="101.5" y="22.27" rx="0" ry="0" width="135" height="29" />
  <Rect x="5" y="57.27" rx="0" ry="0" width="600" height="30" />
  <Rect x="36.5" y="99.27" rx="0" ry="0" width="135.3" height="124.46" />
  <Rect x="197.5" y="98.27" rx="0" ry="0" width="144" height="126" />
</ContentLoader>
export default class QuickPickProductScreen extends React.Component {
  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      quickPickType: this.props.navigation.getParam('quickPickType'),
      dim: 150,
      topSellingLoader: true,
      Items: [
        { productImage: '../assets/app-images/boy.png', code: '#1abc9c' }, { name: 'EMERALD', code: '#2ecc71' },
        { name: 'PETER RIVER', code: '#3498db' }, { name: 'AMETHYST', code: '#9b59b6' }
      ],
      tempItems: [],
      visibleModal: null,
      showRatings: true,
      noProducts: false,
      isReady: false,
      pincode: "",
      minOrderChargeForDelivery: 0,
      deliveryCharge: 0,
      payableAmount: 0.0,
      avgCookingTime: 0,
      itemCount: 0,
      cartItems: [],
      cartTypeFlag: "",
      Variants: [],
      Addons: [],
      selected: "",
      dim: 150,
      modalItems: [],
      locCode: '',
      cityCode: '',
      showGuide: true,
      kitchenClosed: false,
      vlength: 0,
      alenght: 0,
      productsResponse: "",

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
      selAdn: []
    }

  }

  async retrieveItem(key) {
    console.log("QuickPickProductScreen retrieveItem() key: ", key);
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
    console.log("QuickPickProductScreen storeItem() key: ", key);
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
    console.log("QuickPickProductScreen removeItem() key: ", key);
    try {
      await AsyncStorage.removeItem(key);
      return true;
    }
    catch (exception) {
      return false;
    }
  }

  checkKitchenStatus = () => {
    console.log("QuickPickProductScreen checkKitchenStatus()");
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

  getLocation = () => {
    console.log("QuickPickProductScreen getLocation()");
    this.retrieveItem('Address').then((data) => {
      //this.setState({ cityCode: data.pincode });
      if (data != null) {
        this.setState({ cityCode: data.cityCode, locCode: data.locCode });
        this.fetchCategories();
        this.fetchQuickPickProducts();
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  initCartItems = () => {
    console.log("QuickPickProductScreen initCartItems()");
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

  getPincode = () => {
    console.log("QuickPickProductScreen getPincode()");
    this.retrieveItem('Address').then((data) => {
      this.setState({ pincode: data.pincode });
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  fetchCategories = () => {
    console.log("QuickPickProductScreen fetchCategories()");
    this.retrieveItem('CategoryData').then((data) => {
      if (data != null) {
        this.setState({ modalItems: data, });
      }
      fetch(BASE_PATH + Global.FETCH_ALL_CATEGORIES_URL, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cityCode: this.state.cityCode })
      }).then((response) => response.json()).then((responseJson) => {
        if (responseJson.Success == 'Y') {
          this.setState({ modalItems: responseJson.Data });
          this.storeItem("CategoryData", responseJson.Data);
        }
      }).catch((error) => {
        console.log("Error All Categories: ", error);
        ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
      });
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  fetchQuickPickProducts = () => {
    console.log("QuickPickProductScreen fetchQuickPickProducts() quickPickType: " + this.state.quickPickType);
    if (this.state.quickPickType != null && this.state.quickPickType != "") {
      let formValue = {
        "quickPickType": this.state.quickPickType,
        "cityCode": this.state.cityCode,
        "locCode": this.state.locCode,
        "reqFrom": "APP"
      };
      console.log("formValue: ", JSON.stringify(formValue), " && URL: ", (BASE_PATH + Global.FETCH_QUICKPICK_PRODUCTS_URL));
      fetch(BASE_PATH + Global.FETCH_QUICKPICK_PRODUCTS_URL, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formValue)
      }).then((response) => response.json()).then((responseJson) => {
        if (responseJson.Success == 'Y') {
          this.setState({ productsResponse: JSON.stringify(responseJson), noProducts: false });
          let matchedArr = this.matchWithCart(JSON.parse(JSON.stringify(responseJson.Data)));
          this.setState({ Items: matchedArr, tempItems: matchedArr, topSellingLoader: false });
        }
        else {
          this.setState({ noProducts: true, productsResponse: JSON.stringify([]) });
        }
      }).catch((error) => {
        console.log("Error Quickpick Products: ", error);
        ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
      });
    }
    else {
      Alert.alert("", "Please try again.");
      this.props.navigation.navigate("Categories");
    }
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

  openCustomization = (item) => {
    console.log("QuickPickProductScreen openCustomization() item: ", item)
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
      custProd: obj, custProdTotal: obj.OfferPrice, visibleModal: 7
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
    console.log("vidx: ", vidx, " && idx: ", idx);
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
    console.log("adnArr: ", adnArr);
    custProd.Adns = JSON.parse(JSON.stringify(adnArr));
    custProd.Addons = ds.cloneWithRows(JSON.parse(JSON.stringify(adnArr)));
    this.setState({ custProdTotal: (eval(custProd.OfferPrice) + adnTotal + vp).toFixed(2), selAdn: selAdn, custProd: custProd });
  }

  isEmptyObject(obj) {
    return (Object.keys(obj).length === 0 && obj.constructor == Object);
  }

  addProductToCart = (item) => {
    console.log("QuickPickProductScreen addProductToCart() item:", item, this.state.cartTypeFlag);
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
      ToastAndroid.show("Chef food cannot be added with other food. Please clear the cart and continue adding.", ToastAndroid.SHORT);
    }
  }

  removeProductFromCart = (item) => {
    console.log("QuickPickProductScreen removeProductFromCart() item: ", item, this.state.cartTypeFlag);
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
      ToastAndroid.show("Chef food cannot be added with other food. Please clear the cart and continue adding.", ToastAndroid.SHORT);
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
    console.log("QuickPickProductScreen updateProductList() prod: ", prod);
    let itemsArr = JSON.parse(JSON.stringify(this.state.Items));
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
    this.setState({ payableAmount: total.toFixed(2), Items: itemsArr });
    ToastAndroid.show(str, ToastAndroid.SHORT);
    this.storeItem("CartItems", JSON.stringify(this.state.cartItems));
  }

  filterProductsByRating = (ratingType) => {
    console.log("QuickPickProductScreen filterProductsByRating() ratingType: ", ratingType);
    if (this.state.selected != ratingType) {
      this.setState({ selected: ratingType });
      console.log('this.state.tempItems.length', this.state.tempItems.length)
      if (this.state.tempItems.length > 0) {
        let newArr = [];
        for (let i = 0; i < this.state.tempItems.length; i++) {
          if (this.state.tempItems[i].ProductRestaurantRating.toLowerCase().includes(ratingType.toLowerCase())) {
            newArr.push(this.state.tempItems[i]);
          }
        }
        this.setState({ Items: newArr });
      }

    }
  }

  showProducts = (categoryId, categoryName) => {
    console.log("CategoriesScreen showProducts() categoryId: ", categoryId, " && categoryName: ", categoryName);
    this.setState({ visibleModal: null })
    this.props.navigation.push('Products', { cId: categoryId, cName: categoryName })
  }

  componentWillMount() {
    // await Expo.Font.loadAsync({
    //   'Roboto': require('native-base/Fonts/Roboto.ttf'),
    //   'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
    //   'MyriadPro': require('../assets/fonts/MyriadPro-Regular.otf'),
    // });
    this.setState({ isReady: true });
  }

  componentDidMount() {
    // this.props.navigation.addListener('didFocus', () => { this.initCartItems(); })
    console.log("QuickPickProductScreen componentDidMount()");
    this.getLocation();
    this.initCartItems();
    // this.checkKitchenStatus();
    // setTimeout(() => { this.setState({ showGuide: false }) }, 10000);
  }

  _renderButton = (text, icon, clr, onPress) => (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.button, { padding: (text == '') ? 5 : 10 }]}>
        <Icon name={icon} size={20} color={clr} style={{ height: 20, marginRight: 5 }} />
        <Text style={{ color: '#fff' }} >{text}</Text>
      </View>
    </TouchableOpacity>
  );



  __renderCustomisationContent = () => (
    <View style={styles.modalContainer}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', padding: 0 }}>
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
  );

  _renderModalContent = () => (
    <View style={styles.modalContent}>
      <Text style={{ fontSize: 14, color: '#a8a4a4' }}>All Categories</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        <GridView
          spacing={8}
          showVerticalScrolling={false}
          itemDimension={100}
          items={this.state.modalItems}
          renderItem={item => (
            <TouchableOpacity onPress={this.showProducts.bind(this, item.CategoryId, item.CategoryName)}>
              <View style={styles.categortItemContainer}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 2, }}>
                  <ImageBackground source={{ uri: BASE_PATH + item.CategoryImage }} style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', width: 15, height: 15 }}>
                  </ImageBackground >
                </View>
                <View style={{ flex: 7, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: '#999a95', fontWeight: '300' }}>{item.CategoryName}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Icon name='caret-right' size={14} color="#dddbdb" />
                </View>
              </View>
            </TouchableOpacity>
          )
          }
        />
      </ScrollView>
      <View style={{ height: 15 }}>
        {this._renderButton('', 'close', '#555', () => this.setState({ visibleModal: null }))}
      </View>
    </View>
  );

  showmsg() {
    ToastAndroid.show('Sorry! Item is unavailable now.', ToastAndroid.SHORT);
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
        {/* <ProductHeaderScreen/> */}
        <View style={styles.mainHeaderConatiner}>
          <Container style={{ flex: 1, height: null }}>
            <Header hasSegment style={{ backgroundColor: '#fff' }}>
              <Left>
                <Button transparent onPress={() => this.props.navigation.navigate('Categories')}>
                  <BaseIcon name="arrow-back" style={{ color: '#555' }} />
                </Button>
              </Left>
              <Body>
                <Title style={{ color: '#555', marginLeft: -40, paddingLeft: 0, }}>{this.props.navigation.getParam('cName')}</Title>
              </Body>
            </Header>
            <Segment>
              <Button first active={this.state.selected === 'budget'} onPress={this.filterProductsByRating.bind(this, 'budget')}>
                <BaseText>Budget</BaseText>
              </Button>
              <Button active={this.state.selected === 'economy'} onPress={this.filterProductsByRating.bind(this, 'economy')}>
                <BaseText>Economy</BaseText>
              </Button>
              <Button last active={this.state.selected === 'premium'} onPress={this.filterProductsByRating.bind(this, 'premium')}>
                <BaseText>Premium</BaseText>
              </Button>

            </Segment>
          </Container>
        </View>
        <Modal isVisible={this.state.visibleModal === 5} style={styles.bottomModal}>
          {this._renderModalContent()}
        </Modal>

        <Modal isVisible={this.state.visibleModal === 7} style={styles.bottomModal} onBackButtonPress={() => this.setState({ visibleModal: null })}>
          {this.__renderCustomisationContent()}
        </Modal>
        {/* <View style={styles.categoriesContainer}>
        </View> */}
        <Display
          enable={this.state.Items.length > 0}
          style={[styles.productContainer, { marginBottom: (this.state.noProducts || this.state.itemCount > 0) ? 50 : 0, }]}>
          <ScrollView style={styles.topSellingContainer}>
            {/* Timely Offers */}
            <Display style={styles.timelyOffersContainer} enable={this.state.showGuide}
              enterDuration={500}
              exitDuration={250}
              exit="fadeOutDown"
              enter="fadeInUp"
            >
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end', }}>
                <Image source={require('../assets/ratings.png')} style={{ width: 60, height: 60 }} />
              </View>
              <View style={{ flex: 3, justifyContent: 'center', alignItems: 'flex-start', marginLeft: 10 }}>
                <Text style={{ fontSize: 14, color: '#fff', paddingBottom: 3 }}>We try our best to match your taste! </Text>
                <Text style={{ fontSize: 17, color: '#fff', paddingBottom: 5, fontWeight: 'bold' }}>Now get rid of starred ratings!</Text>
                <Text style={{ fontSize: 10, color: '#ebebeb', paddingBottom: 5 }}>Ordering food just got easier by these three easy filters!</Text>
              </View>
            </Display>
            <GridView
              spacing={10}
              showVerticalScrolling={false}
              itemDimension={this.state.dim}
              items={this.state.Items}
              renderItem={item => (
                <View style={styles.itemContainer}>
                  <Display enable={this.state.topSellingLoader}>
                    <TopSellings />
                  </Display>
                  <Display enable={item.ImageAvailable} style={{
                    flex: 3,
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                  }}>
                    <ImageBackground source={{ uri: BASE_PATH + item.ProductImage }} style={[styles.productImage, { opacity: (!item.Addable ? .6 : 1) }]}>
                      <View style={{ borderColor: '#fff', marginLeft: 5, marginTop: 5, borderWidth: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: (item.ProductVeganType == 'VEG') ? '#3bb97a' : 'red' }}>
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
                      <View style={{ borderColor: '#fff', marginLeft: 5, marginTop: 5, borderWidth: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: (item.ProductVeganType == 'VEG') ? '#3bb97a' : 'red' }}>
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
                      <View style={{ flex: (!item.Addable) ? 5 : 7, backgroundColor: '#fff' }}>
                        <Text style={{ color: "#cd2121", fontSize: 14, fontWeight: '600' }}>₹ {item.OfferPrice}</Text>
                      </View>
                      <View style={{ flex: (!item.Addable) ? 5 : 3, borderWidth: 1, borderColor: (!item.Addable ? '#ada8a8' : "#2dbe60"), backgroundColor: (!item.Addable ? '#cd2121' : "#2dbe60"), justifyContent: 'center', alignItems: 'center', height: 20, borderRadius: 1, marginHorizontal: 5 }}>
                        <Display enable={item.Addable} style={{ flex: 1, flexDirection: 'row', }}>
                          <Display enable={item.VarLen > 0 || item.AdnLen > 0} style={{ flex: 1, flexDirection: 'row', }}>
                            <Display enable={item.Qty < 1} style={{ flex: 1, flexDirection: 'row' }}>
                              <TouchableOpacity onPress={this.openCustomization.bind(this, item)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
                        <Display enable={!item.Addable} style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 4 }}>
                          <TouchableOpacity onPress={this.showmsg} style={{ flexDirection: 'row' }}>
                            <BaseIcon name={'ios-stopwatch'} style={{ color: '#fff', fontSize: 12 }} />
                            <Text style={{ color: "#fff", fontSize: 12, marginLeft: 3 }}> {item.AvailableIn}</Text>
                          </TouchableOpacity>
                        </Display>
                      </View>
                    </View>
                  </View>
                  {/* </HomeLoader> */}
                </View>
              )
              }
            />
          </ScrollView>
        </Display>
        <Display enable={this.state.Items.length < 1 || this.state.noProducts} style={styles.noProduct}>
          <View style={[styles.noProductContainer, { marginBottom: 0, justifyContent: 'center', alignItems: 'center' }]}>
            <Image source={require('../assets/emptyplate.png')} style={[styles.image]} />
            <Text style={{ fontSize: 18, marginTop: 5 }}>Nothing Available</Text>
            <Text style={{ fontSize: 14, color: '#bab8b8' }}>Something Great is always cooking</Text>
            <Text style={{ fontSize: 14, color: '#bab8b8' }}>Checkout other categories to find out </Text>
          </View>
        </Display>
        <Display enable={this.state.kitchenClosed} style={styles.noProduct}>
          <View style={[styles.noProductContainer, { marginBottom: 0, justifyContent: 'center', alignItems: 'center' }]}>
            <Image source={require('../assets/app-images/kitchen-closed.png')} style={[styles.image]} />
            <Text style={{ fontSize: 18, marginTop: 5 }}>Sorry! Kitchen is closed right now. Please knock after some time.</Text>
          </View>
        </Display>
        <View style={{ position: 'absolute', bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ flex: 1, marginBottom: 25, width: Dimensions.get('window').width, justifyContent: 'center', alignItems: 'center' }}>
            <View style={styles.actionButton}>
              {this._renderButton('Categories', 'cutlery', '#fff', () => this.setState({ visibleModal: 5 }))}
            </View>
          </View>
          <Display
            enable={this.state.itemCount > 0}
            enterDuration={100}
            exitDuration={100}
            exit="fadeOutDown"
            enter="fadeInUp"
          >
            <View>
              <View style={{ flexDirection: 'row', height: 50 }}>
                <View style={{ backgroundColor: "#ebebeb", justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>₹ {this.state.payableAmount} | {this.state.itemCount} Item(s)</Text>
                  {/* <Text style={{ fontSize: 10 }}>ESTIMATED DELIVERY TIME :{this.state.avgCookingTime} MINS</Text> */}
                </View>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('Cart')}>
                  <View style={{ backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center', width: Dimensions.get('window').width / 2, height: 50 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>VIEW CART</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Display>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  mainHeaderConatiner:
  {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomColor: '#f9f9f9',
    borderBottomWidth: 1,
    backgroundColor: '#fbfbfb',
    position: 'absolute',
    width: Dimensions.get('window').width,
    //marginTop: Expo.Constants.statusBarHeight,
    zIndex: 999,

  },
  mainContainer:
  {
    flex: 1,
    flexDirection: 'row',
    width: null,
    height: null,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 80 : StatusBar.currentHeight + 80,
    // paddingTop:95
  },
  productContainer:
  {
    flex: 8,

  },
  topSellingContainer:
  {
    marginTop: 5,
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  noProductContainer:
  {
    marginBottom: 50,
    // width:Dimensions.get('window').width
  },
  colorBox:
  {
    flex: 2, width: Dimensions.get('window').width, height: 100,
    backgroundColor: '#fff', borderBottomLeftRadius: (Platform.OS === 'ios' ? 400 : 150)
    , borderBottomRightRadius: (Platform.OS === 'ios' ? 400 : 150), justifyContent: 'flex-end', alignItems: 'center',
    zIndex: -100
  },
  image:
  {
    width: 100, height: 100,
  },
  itemContainer: {
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
  actionButton: {
    width: 140,
    height: 40,
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
  button: {
    backgroundColor: 'transparent',
    padding: 12,
    flexDirection: 'row',
  },
  superAdd: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    right: 5,
    top: -1
  },
  modalContent: {
    height: Dimensions.get('window').height / 2 + 20,
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  categoryName: {
    color: '#cd2121',
    padding: 5,
    marginBottom: 3,
    borderBottomColor: '#fbfbfb',
    borderBottomWidth: 1,
    fontSize: 20,
    width: 150,
    textAlign: 'center',
  },
  noProduct:
  {
    justifyContent: 'center', alignItems: 'center',
    width: Dimensions.get('window').width
  },
  categortItemContainer: {
    borderWidth: 1,
    borderColor: '#ebebeb',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
    padding: 12
    // height: 30,

  },
  timelyOffersContainer:
  {
    marginTop: Platform.os === 'ios' ? 40 : 0,
    margin: 10,
    padding: 5,
    backgroundColor: '#2dbe60',
    borderRadius: 4,
    flexDirection: 'row',
    // left:0,
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
  header: {
    flex: 1, backgroundColor: '#f2f6fc',
    padding: 10,
    paddingBottom: 0
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
  }
});