import React from 'react';
import {
  StyleSheet, Text, View, ImageBackground, ListView, ScrollView, TouchableOpacity, AsyncStorage,
} from 'react-native';
import Display from 'react-native-display';
import GridView from 'react-native-super-grid';
import Global from '../Urls/Global';
import { Header, Left, Body, Right, Button, Icon, Title } from 'native-base';
import ContentLoader from 'react-native-content-loader';
import { Rect } from 'react-native-svg';

const GLOBALURL = Global.BASE_PATH;

const Categories = () => <ContentLoader height={150}
  primaryColor='#eeeeee'
  secondaryColor='#fff'
  speed={100}
>
  <Rect x="0" y="0" rx="0" ry="0" width="150" height="120" />
  <Rect x="5" y="125.27" rx="0" ry="0" width="80" height="15" />

</ContentLoader>
export default class CategoriesScreen extends React.Component {
  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      dataSource: ds.cloneWithRows(['r1', 'r2', 'r1', 'r2', 'r1', 'r2', 'r1', 'r2']),
      dim: 150, categoriesLoader: true,
      Items: [],
    }

  }

  async retrieveItem(key) {
    console.log("CategoriesScreen retrieveItem() key: ", key);
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
    console.log("CategoriesScreen storeItem() key: ", key);
    try {
      var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
      return jsonOfItem;
    }
    catch (error) {
      console.log(error.message);
    }
  }

  fetchCategories = (cityCode) => {
    console.log("CategoriesScreen fetchCategories(cityCode) ", cityCode);
    fetch(GLOBALURL + Global.FETCH_ALL_CATEGORIES_URL, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cityCode: cityCode })
    }).then((response) => response.json()).then((responseJson) => {
      console.log("CategoriesScreen FETCH_ALL_CATEGORIES_URL response:", responseJson.Success, responseJson.Data.length);
      if (responseJson.Success == 'Y') {
        this.setState({ Items: responseJson.Data, categoriesLoader: false });
      }
    });
  }

  fetchCityCode = () => {
    console.log("CategoriesScreen fetchCityCode()");
    this.retrieveItem('Address').then((data) => {
      //this.setState({ cityCode: data.pincode });
      console.log("Address data: ", data);
      if (data != null) {
        this.fetchCategories(data.cityCode);
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  componentWillMount() {
    console.log("CategoriesScreen componentWillMount()");
    this.fetchCityCode();
  }

  showProducts = (categoryId, categoryName) => {
    console.log("CategoriesScreen showProducts() categoryId: ", categoryId, " && categoryName: ", categoryName);
    this.props.navigation.navigate('Products', { cId: categoryId, cName: categoryName })
  }

  render() {

    return (
      <View style={styles.mainContainer}>
        <Header style={styles.mainHeaderContainer}>
          <Left style={{ flex: 0.3 }}>
            <Button transparent onPress={() => {
              this.props.navigation.navigate('Home');
            }}>
              <Icon style={{ color: '#666' }} name='arrow-back' />
            </Button>
          </Left>
          <Body>
            <Title style={{ color: '#666' }}>All Categories</Title>
          </Body>
          <Right>
            <Display enable={false}>
              <Button transparent >
                <Icon style={{ color: '#cd2121' }} name='ios-heart' />
              </Button>
            </Display>
          </Right>
        </Header>
        <ScrollView showsHorizontalScrollIndicator={false}>
          <GridView
            spacing={0}
            itemDimension={this.state.dim}
            items={this.state.Items}
            renderItem={item => (
              <TouchableOpacity onPress={this.showProducts.bind(this, item.CategoryId, item.CategoryName)}>
                <View style={styles.itemContainer}>
                  <Display enable={this.state.categoriesLoader} style={{ flex: 1, padding: 4 }}>
                    <Categories />
                  </Display>
                  <Display enable={!this.state.categoriesLoader} style={{ flex: 1 }}>
                    <ImageBackground source={{ uri: GLOBALURL + item.CategoryImage }} style={{ flex: 3, backgroundColor: '#f9f9f9' }}>
                      <View style={{ flex: 1, alignSelf: 'flex-end', paddingVertical: 4 }}>
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
        </ScrollView>

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
  },
  itemContainer: {
    flexDirection: 'column',
    borderRadius: 5,
    margin: 10,
    height: 150,
    backgroundColor: '#f9f9f9', shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
    shadowRadius: 2, elevation: 2,
  },
  mainHeaderContainer:
  {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomColor: '#d8d8d8',
    borderBottomWidth: 1,
    // marginTop: Expo.Constants.statusBarHeight
  },

});
