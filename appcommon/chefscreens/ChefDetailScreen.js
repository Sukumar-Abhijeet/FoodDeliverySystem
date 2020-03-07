import React from 'react';
import {
  StyleSheet, Text, View,
  SafeAreaView, ToastAndroid, Image, ImageBackground, ListView, ScrollView, RefreshControl, ActivityIndicator, Dimensions, TouchableOpacity, AsyncStorage, Platform, StatusBar
} from 'react-native';
import { Header, Left, Body, Right, Button, Icon, Title, Fab, Textarea } from 'native-base';
import { withNavigation } from 'react-navigation';
import Display from 'react-native-display';
import { Rating, AirbnbRating } from 'react-native-ratings';
import ContentLoader from 'react-native-content-loader';
import { Rect } from 'react-native-svg';
import Global from '../Urls/Global';
import Modal from 'react-native-modal';

const BASE_PATH = Global.BASE_PATH;
const image1 = require('../assets/quickpicks/breakfast.png')
const image2 = require('../assets/quickpicks/snacks.png')
const image3 = require('../assets/quickpicks/lunch.png')
const image4 = require('../assets/quickpicks/dinner.png')
var data = [
  { title: "Breakfast", image: image1 },
];

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

export class ChefDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      dataSource1: ds.cloneWithRows(['r1', 'r2', 'r3', 'r4']),
      visibleModal: null,
      modalItems: [],
      payableAmount: 0.0,
      itemCount: 0,
      isReady: false,
      chefObj: {},
      chefHighlightsInfo: {
        Rating: "",
        ReviewList: [],
        KitchenPhotos: []
      },
      rating: 4,
      chefProfileName: this.props.navigation.getParam('chefProfileName'),
      chefId: this.props.navigation.getParam('chefId'),
      userId: "",
      fabActive: false,
      review: '',
      reviewModal: null,
      loader: false,
    }

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

  getUserData = () => {
    console.log("ChefDetailScreen getUserData()");
    this.retrieveItem('UserData').then((user) => {
      if (user != null) {
        console.log("User is logged in");
        this.setState({ userId: user.uuid });
      }
      else {
        console.log("User is not logged in");
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  getBawarchiInfo = () => {
    console.log("ChefDetailScreen getBawarchiInfo()");
    fetch(BASE_PATH + Global.FETCH_CHEF_INFO_URL, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'profileName': this.state.chefProfileName
      })
    }).then((response) => response.json()).then((responseJson) => {
      console.log("response bawarchi info: ", responseJson);
      if (responseJson.Success == "Y") {
        this.setState({ chefObj: responseJson.Data });
        this.getBawarchiHighlightsInfo();
      }
      else {
        ToastAndroid.show("Sorry. We could not fetch the bawarchi profile. Try again.", ToastAndroid.SHORT);
      }
    }).catch((error) => {
      console.log("Error Bawarchi Info: ", error);
      ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
    });
  }

  getBawarchiHighlightsInfo = () => {
    console.log("ChefDetailScreen getBawarchiHighlightsInfo()");
    fetch(BASE_PATH + Global.FETCH_CHEF_HIGHLIGHTS_INFO_URL, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'vid': this.state.chefId
      })
    }).then((response) => response.json()).then((responseJson) => {
      console.log("response bawarchi highlights: ", responseJson);
      if (responseJson.Success == "Y") {
        this.setState({ chefHighlightsInfo: responseJson.Data });
      }
      else {
        ToastAndroid.show("Sorry. We could not fetch the bawarchi info. Try again.", ToastAndroid.SHORT);
      }
    }).catch((error) => {
      console.log("Error Bawarchi Highlights Info: ", error);
      ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
    });
  }

  componentWillMount() {
    console.log("ChefDetailScreen componentWillMount");
    // await Expo.Font.loadAsync({
    //   'Roboto': require('native-base/Fonts/Roboto.ttf'),
    //   'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
    //   'MyriadPro': require('../assets/fonts/MyriadPro-Regular.otf'),
    // });
    this.setState({ isReady: true });
  }

  componentDidMount() {
    console.log("ChefDetailScreen componentDidMount()");
    this.getBawarchiInfo();
    this.getUserData();
  }

  postReview() {
    console.log("ChefDetailScreen postReview", this.state.rating, this.state.review);
    if (this.state.rating == 0 || this.state.review == '') {
      ToastAndroid.show("Minimum 50 characters of review required", ToastAndroid.SHORT);
    }
    else {
      if (this.state.review.length > 50) {
        if (this.state.userId == "") {
          ToastAndroid.show("Please Login to Post review", ToastAndroid.SHORT);
        }
        else {
          this.setState({ loader: true })
          let formValue = JSON.stringify({
            'vid': this.state.chefId,
            'uuid': this.state.userId,
            'reviewRating': this.state.rating,
            'reviewText': this.state.review,
          });
          console.log("ChefDetailScreen postReview formvalue : ", formValue);
          fetch(BASE_PATH + Global.SUBMIT_CHEF_REVIEW_URL, {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: formValue
          }).then((response) => response.json()).then((responseJson) => {
            console.log(" ChefDetailScreen postReview response : ", responseJson);
            this.setState({ loader: false });
            if (responseJson.Success == "Y") {
              this.setState({ review: "", reviewModal: null });
            } else if (responseJson.Success == "N") {
              ToastAndroid.show(responseJson.Message, ToastAndroid.SHORT);
            }
            else {
              ToastAndroid.show("Sorry,network issue occured. Try again.", ToastAndroid.SHORT);
            }
          }).catch((error) => {
            console.log("Error ", error);
            this.setState({ loader: false });
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
          });
        }
      } else {
        ToastAndroid.show("Minimum 50 characters of review required", ToastAndroid.SHORT);
      }
    }
  }


  _renderButton = (text, icon, clr, onPress) => (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.button, { padding: (text == '') ? 5 : 10 }]}>
        <Icon name={icon} size={20} color={clr} style={{ height: 20, marginRight: 5 }} />
        <Text style={{ color: '#fff' }} >{text}</Text>
      </View>
    </TouchableOpacity>
  );

  _renderModalContent = () => (
    <View style={styles.modalContent}>
      <Text sty={{ fontSize: 14, color: '#a8a4a4' }}>All Categories</Text>
      <GridView
        spacing={8}
        showVerticalScrolling={false}
        itemDimension={100}
        items={this.state.modalItems}
        renderItem={item => (
          <TouchableOpacity onPress={this.showProducts.bind(this, item.CategoryId, item.CategoryName)}>
            <View style={styles.categortItemContainer}>
              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 2, }}>
                <ImageBackground source={{ uri: item.CategoryImage }} style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', width: 15, height: 15 }}>
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
      <View style={{ height: 15 }}>
        {this._renderButton('', 'close', '#555', () => this.setState({ visibleModal: null }))}
      </View>
    </View>
  );
  _renderItem({ item, index }) {
    return (
      <View style={styles.superChefBox}>
        <View style={styles.upperContainer}>
          <View style={{ flex: 3, padding: 10 }}>
            <View style={{ width: 110, height: 110, borderRadius: 60, backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center' }}>
              <Image source={require('../assets/chef.png')} style={{ width: 80, height: 80 }} />
            </View>
          </View>
          <View style={{ flex: 6, marginLeft: 25, padding: 10 }}>
            <Text style={{ fontSize: 16, color: '#393939', fontWeight: 'bold', }}>Mrs.{item.title}</Text>
            <Text style={{ fontSize: 12, color: '#393939', fontWeight: 'bold', }}>Cusines : Indian | Chinese</Text>
            <View style={{ marginTop: 3, flexDirection: 'row', backgroundColor: '#5cde63', justifyContent: 'center', alignItems: 'center', width: 120, borderRadius: 10, }}>
              <View style={{ backgroundColor: '#f7b620', paddingHorizontal: 5, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: 'bold' }}>5.0</Text>
              </View>
              <Text style={{ color: "#fff", fontSize: 15, marginLeft: 4 }}>Top Rated</Text>
            </View>
            <Text style={{ fontSize: 15, color: '#7e7e7e', fontWeight: 'bold', marginTop: 5 }}> About Superchef</Text>
            <Text style={{ fontSize: 10, color: '#919191', }}>
              shfgshjgfhjgdhjfsdhjfghsdgfjhsdghfgsdhjfghsdgfjhsdgfhjsdgjhfgsdjhfgjhsdgf
                     </Text>

          </View>
          <View style={{ flex: 1 }}>
            <Icon name='heart' color="#cd2121" size={20} />
          </View>
        </View>

      </View>
    );
  }

  __renderReviewContent = () => (
    <View style={styles.reviewModalContent}>
      <View style={styles.reviewBox}>
        <View style={{ width: 60, height: 60, borderRadius: 30, borderColor: '#ebebeb', borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image source={require('../assets/chefhat.png')} style={{ width: 55, height: 55 }} resizeMode={'contain'} />
        </View>
        <Text style={{ fontSize: 22, fontWeight: '800', marginTop: 10, color: '#000', marginBottom: 10 }}>{this.state.chefProfileName}</Text>
        <AirbnbRating
          showRating={false}
          defaultRating={4}
          size={17}
          onFinishRating={(num) => { this.setState({ rating: num }) }}
          style={{ paddingVertical: 10, flex: 1 }}
          ratingColor='#cd2121'
        />
        <View style={{ width: '85%', marginTop: 10 }}>
          <Textarea rowSpan={5} bordered placeholder="Write a review .."
            onChangeText={(text) => { this.setState({ review: text }), console.log("textArea length : ", text.length) }}
          />
        </View>
        <TouchableOpacity style={{ marginTop: 12 }} onPress={() => this.postReview()}>
          <Display enable={!this.state.loader}>
            <Text style={{ fontSize: 18, color: '#518def', fontWeight: '500' }}>DONE</Text>
          </Display>
          <Display enable={this.state.loader}>
            <ActivityIndicator size={"small"} color={'#cd2121'} />
          </Display>
        </TouchableOpacity>
      </View>
    </View>
  )


  render() {
    // if (!this.state.isReady) {
    //   return (
    //     <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
    //       <Image source={require('../assets/mascot.jpg')} />
    //     </View>

    //   )
    // }

    return (
      <View style={styles.mainContainer}>
        <View style={{}}>
          <Header style={styles.mainHeaderContainer}>
            <Left>
              <Button transparent onPress={() => { this.props.navigation.goBack(null) }}>
                <Icon style={{ color: '#4286f4' }} name='arrow-back' />
              </Button>
            </Left>
            <Body>
              <Title style={{ color: '#666', marginLeft: 0 }}>See Your Chef</Title>
            </Body>
            <Right>
              <Display enable={false}>
                <Button transparent >
                  <Icon style={{ color: '#cd2121' }} name='ios-heart' />
                </Button>
              </Display>
            </Right>
          </Header>

        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.superChefBox}>
            <View style={styles.upperContainer}>
              <View style={{ flex: 3, padding: 10, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: 110, height: 110, }}>
                  <Display enable={!this.state.chefObj.ImageAvailable} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../assets/chef.png')} style={{ width: 100, height: 100, borderRadius: 60, padding: 10 }} />
                  </Display>
                  <Display enable={this.state.chefObj.ImageAvailable} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={{ uri: BASE_PATH + this.state.chefObj.BawarchiImage }} style={{ width: 100, height: 100, borderRadius: 60, padding: 10 }} />
                  </Display>
                </View>
              </View>
              <View style={{ flex: 6, marginLeft: 25, padding: 10 }}>
                <Text style={{ fontSize: 20, color: '#393939', fontWeight: 'bold', }}>{this.state.chefObj.KitchenName}</Text>
                <Text style={{ fontSize: 14, color: '#393939', fontWeight: 'bold', }}>{this.state.chefObj.BawarchiName}</Text>
                <Text style={{ fontSize: 14, color: '#393939', fontWeight: 'bold', }}>Cuisines: {this.state.chefObj.Cuisines}</Text>
                <Text style={styles.redRating}>{this.state.chefHighlightsInfo.Rating}</Text>

              </View>
            </View>

          </View>

          <View style={styles.rateChef}>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{
                flex: 1, textAlign: 'left', fontSize: 20, color: '#000', fontWeight: "bold"
              }}>Rate this chef!</Text>
              <AirbnbRating
                showRating={false}
                imageSize={40}
                onFinishRating={(num) => { this.setState({ rating: num }) }}
                style={{ paddingVertical: 10, flex: 1 }}
                ratingColor='#cd2121'
              />
            </View>
            <Display enable={'Only when rated'} enterDuration={500}
              exitDuration={250}
              exit="fadeOutDown"
              enter="fadeInUp"
              style={{ flex: 1, flexDirection: 'row' }}
            >
              <TouchableOpacity style={styles.writeReviewBtn} onPress={() => this.setState({ reviewModal: 1 })}><Text style={styles.writeReviewBtnText}>Write a review</Text></TouchableOpacity>
              <TouchableOpacity style={styles.resetReviewBtn}><Text style={styles.resetReviewBtnText}>Reset</Text></TouchableOpacity>

            </Display>
          </View>
          <View style={styles.topDishesChef}>
            <Text style={{ paddingHorizontal: 10, paddingVertical: 0, fontSize: 12, fontWeight: '300', color: '#999' }}>
              <Icon style={{ color: '#999', fontSize: 12 }} name='md-restaurant' />
              &nbsp;FREQUENTLY ORDERED DISHES</Text>
            <View style={{ paddingHorizontal: 10, flexDirection: 'row' }}>
              <Text style={styles.dishName}>{this.state.chefObj.FreqOrderDishes}</Text>
            </View>
          </View>
          <View style={styles.topDishesChef}>
            <Text style={{ paddingHorizontal: 10, paddingVertical: 0, fontSize: 12, fontWeight: '300', color: '#999' }}>
              <Icon style={{ color: '#999', fontSize: 12 }} name='ios-pricetag' />
              &nbsp;BUDGET PER MEAL</Text>
            <View style={{ paddingHorizontal: 10, flexDirection: 'row' }}>
              <Text style={styles.dishName}>₹{this.state.chefObj.MealBudget} for one person (approx.)</Text>
            </View>
          </View>
          <View style={styles.reviewsChef}>
            <Text style={{ paddingVertical: 0, fontSize: 12, fontWeight: '300', color: '#999' }}>
              <Icon style={{ color: '#999', fontSize: 12 }} name='ios-star' />
              &nbsp;TRUSTED REVIEWS</Text>
            {
              this.state.chefHighlightsInfo.ReviewList.map((item, index) => (
                <View style={{ marginTop: 5, flexDirection: 'column', padding: 5, borderColor: '#eee', borderWidth: 1, borderRadius: 4 }} key={index}>
                  <Text style={{ fontSize: 16, color: '#555' }}>
                    {item.UserName}
                    <Icon style={{ color: 'green', fontSize: 12 }} name='md-checkmark-circle' /> <Text style={{ color: '#999', fontSize: 12, justifyContent: 'center', alignItems: 'center' }}>Verified</Text>
                  </Text>
                  <Text style={{ backgroundColor: 'green', color: '#fff', fontSize: 14, fontWeight: 'bold', borderRadius: 20, width: 40, textAlign: 'center', padding: 2 }}> {item.Rating}<Icon style={{ color: '#fff', fontSize: 14 }} name='ios-star' /> </Text>
                  <Text style={{ color: '#666' }}>{item.ReviewText.replace(/<br \/>/g, " ")}</Text>
                </View>
              ))
            }
            <Display enable={this.state.chefHighlightsInfo.ReviewList.length < 1}>
              <Text style={{ fontSize: 14, color: '#999' }}>No reviews found</Text>
            </Display>
          </View>
          <View style={styles.reviewsChef}>
            <Text style={{ paddingVertical: 0, fontSize: 12, fontWeight: '300', color: '#999' }}>
              <Icon style={{ color: '#999', fontSize: 14 }} name='md-camera' />
              &nbsp;PHOTOS & POSTS</Text>
            <Display enable={this.state.chefHighlightsInfo.KitchenPhotos.length > 0}>
              <View style={{ marginTop: 5, flexDirection: 'row', padding: 5, borderColor: '#eee', borderWidth: 1, borderRadius: 4 }}>
                <ScrollView showsHorizontalScrollIndicator={false} horizontal={true}>
                  {
                    this.state.chefHighlightsInfo.KitchenPhotos.map((item, index) => (
                      <Display enable={item.ImageAvailable}>
                        <Image source={{ uri: BASE_PATH + item.Image }} style={styles.reviewImage} key={index} />
                      </Display>
                    ))
                  }
                </ScrollView>
              </View>
            </Display>
            <Display enable={this.state.chefHighlightsInfo.KitchenPhotos.length < 1}>
              <Text style={{ fontSize: 14, color: '#999' }}>No photos found</Text>
            </Display>
          </View>
          <Text style={{ padding: 10, justifyContent: 'center', alignItems: 'center', textAlign: 'center', margin: 10, fontStyle: 'italic', fontSize: 24, color: '#999' }}>FSSAI No.
          <Text style={{ fontSize: 16, fontStyle: 'normal' }}>{this.state.chefObj.LicNum}</Text></Text>
        </ScrollView>
        <Fab
          active={this.state.fabActive}
          direction="up"
          containerStyle={{}}
          style={{ backgroundColor: '#cd2121' }}
          position="bottomRight"
          onPress={() => this.setState({ fabActive: !this.state.fabActive })}>
          <Icon name="add" />
          <Button style={{ backgroundColor: 'green' }} onPress={() => this.setState({ reviewModal: 1 })}>
            <Icon name="ios-star" />
          </Button>
          {/* <Button style={{ backgroundColor: '#3B5998' }}>
            <Icon name="image" />
          </Button> */}
        </Fab>
        <Modal isVisible={this.state.reviewModal === 1} style={styles.bottomModal} onBackButtonPress={() => this.setState({ reviewModal: null })}>
          {this.__renderReviewContent()}
        </Modal>
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
    backgroundColor: '#ebebeb',
    flexDirection: 'column',
    paddingHorizontal: 5,
    // paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,

  },
  superChefBox:
  {
    paddingTop: 5,
    //   paddingHorizontal:5,
    backgroundColor: '#ebebeb'
  },
  upperContainer:
  {

    flexDirection: 'row',
    padding: 5,
    marginTop: 0,
    marginBottom: 5,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2,
    shadowRadius: 2, elevation: 1,
  },
  actionButton: {
    width: 100,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2dbe60',
    //position: 'absolute',                                          
    bottom: 65,
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
  button:
  {
    backgroundColor: 'transparent',
    padding: 12,
    flexDirection: 'row',
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
  reviewModalContent: {
    height: Dimensions.get('window').height / 2 + 20,
    backgroundColor: 'transparent',
    padding: 6,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  reviewBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 6,
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center',
    height: 330,
    marginTop: 20
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
  lowerContainer:
  {

    justifyContent: 'center', alignItems: 'center',
    padding: 5,
    height: 300,
    marginTop: 5,
    // marginBottom: 5,
    borderRadius: 4,
    backgroundColor: '#fff', shadowColor: '#000',
    shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
    shadowRadius: 2, elevation: 2,
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
  redRating: {
    backgroundColor: '#cd2121',
    color: '#fff',
    fontWeight: 'bold',
    width: 60,
    fontSize: 16,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    textAlign: 'center'
  },
  textBig: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  textWhite: {
    color: 'white'
  },
  rateChef: {
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'column',
    paddingHorizontal: 10
  },
  writeReviewBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  writeReviewBtnText: {
    color: 'green',
    fontWeight: '400',
    fontSize: 18
  },
  resetReviewBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  resetReviewBtnText: {
    color: '#999',
    fontWeight: '300',
    fontSize: 12,
    paddingRight: 10
  },
  topDishesChef: {
    marginTop: 5,
    backgroundColor: '#fff',
    borderRadius: 4, paddingVertical: 10
  },
  reviewsChef: {
    marginTop: 5,
    backgroundColor: '#fff',
    borderRadius: 4, padding: 10
  },
  dishName: {
    fontSize: 16,
    color: '#555'
  },
  reviewImage: {
    width: 150,
    height: 100,
    marginRight: 5
  },
});
export default withNavigation(ChefDetailScreen)