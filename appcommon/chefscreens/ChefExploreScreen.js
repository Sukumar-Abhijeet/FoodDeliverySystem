import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  StyleSheet, Text, View,
  Image, ListView, ScrollView, TouchableOpacity, AsyncStorage
} from 'react-native';
import { Header, Left, Body, Right, Button, Icon, Title, Fab } from 'native-base';
import { withNavigation } from 'react-navigation';
import Display from 'react-native-display';
import ContentLoader from 'react-native-content-loader';
import { Rect } from 'react-native-svg';
import Global from '../Urls/Global';

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

export class ChefExploreScreen extends React.Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      isReady: false,
      bawarchiService: false
    }

  }

  async retrieveItem(key) {
    console.log("PaymentScreen retrieveItem() key: ", key);
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
    console.log("PaymentScreen storeItem() key: ", key);
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
    console.log("PaymentScreen removeItem() key: ", key);
    try {
      await AsyncStorage.removeItem(key);
      return true;
    }
    catch (exception) {
      return false;
    }
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
    console.log("ChefExploreSCreen componentDidMount()"); this.props.navigation.addListener('didFocus', () => {
      this.checkServiceAvailable();
    });
  }

  checkServiceAvailable = () => {
    console.log("ChefExploreScreen checkServiceAvailable()");
    this.retrieveItem('Address').then((data) => {
      if (data == null) {
        this.props.navigation.navigate('Location');
      }
      else {
        if (data.fAvail && data.bAvail) {
          this.setState({ bawarchiService: true });
        }
        else if (data.bAvail) {
          this.setState({ bawarchiService: true });
        }
        else if (data.fAvail) {
          this.setState({ bawarchiService: false });
        }
        else {
          this.setState({ bawarchiService: false });
        }
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
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
        <View style={{}}>
          <Header style={styles.mainHeaderContainer}>
            <Left style={{ flex: 0.3 }}>
              <Button transparent>
                <Icon style={{ color: '#666' }} name='arrow-back' />
              </Button>
            </Left>
            <Body>
              <Title style={{ color: '#666' }}>Explore Bawarchi</Title>
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
        <LinearGradient colors={['#8e2de2', '#4a00e0', '#24243e']} style={styles.contentWrapper}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.introBanner}>
              <Image source={require('../assets/chef.png')} style={styles.introBannerImage} />
              <Text style={[styles.introBannerText, styles.textBig]}>
                Introducing Home Cooked Food by House Chefs
          </Text>
            </View>
            <View style={styles.highlightsBanner}>
              <View style={{ backgroundColor: '#fff', padding: 5, borderTopRightRadius: 60, borderBottomRightRadius: 60, flex: 0.8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'column', paddingHorizontal: 10, flex: 3 }}>
                  <Text style={[styles.textBig, { fontSize: 20, color: '#666' }]}>Fresh Ingredients</Text>
                  <Text style={[styles.textBig, { fontSize: 12, color: '#666', fontWeight: '200' }]}>Our chefs source the most fresh & organic ingredients for all the dishes.</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Image source={require('../assets/fresh.png')} style={[styles.highlightImage]} />
                </View>

              </View>

            </View>
            <View style={[styles.highlightsBanner, { alignSelf: 'flex-end' }]}>
              <View style={{ backgroundColor: '#fff', padding: 5, borderTopLeftRadius: 60, borderBottomLeftRadius: 60, flex: 0.8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                  <Image source={require('../assets/homecooked.png')} style={[styles.highlightImage]} />
                </View>
                <View style={{ flexDirection: 'column', paddingHorizontal: 10, flex: 3, alignItems: 'flex-end' }}>
                  <Text style={[styles.textBig, { fontSize: 20, color: '#666' }]}>Home cooked food</Text>
                  <Text style={[styles.textBig, { fontSize: 12, color: '#666', fontWeight: '200' }]}>Give up for home style preparation, you can enjoy home cooked food now.</Text>
                </View>
              </View>

            </View>
            <View style={styles.highlightsBanner}>
              <View style={{ backgroundColor: '#fff', padding: 5, borderTopRightRadius: 60, borderBottomRightRadius: 60, flex: 0.8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'column', paddingHorizontal: 10, flex: 3 }}>
                  <Text style={[styles.textBig, { fontSize: 20, color: '#666' }]}>Pocket Friendly Meals</Text>
                  <Text style={[styles.textBig, { fontSize: 12, color: '#666', fontWeight: '200' }]}>Budget meals to fit your daily requirements with free delivery and many offers.</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Image source={require('../assets/economymeal.png')} style={[styles.highlightImage]} />
                </View>

              </View>

            </View>
            <View style={{ backgroundColor: 'transparent', flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10, height: 300 }}>
              <Image source={require('../assets/howtoorder.png')} style={{ width: '100%', borderRadius: 4, backgroundColor: 'transparent' }} resizeMode={'contain'} />

            </View>

            <Display enable={this.state.bawarchiService}>
              <TouchableOpacity style={{ backgroundColor: '#fff', padding: 10, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 10 }} onPress={() => this.props.navigation.navigate("ChefHome")}>
                <Text style={[styles.textBig, { color: 'blue' }]}>START ORDERING</Text>
              </TouchableOpacity>
            </Display>
            <Display enable={!this.state.bawarchiService}>
              <View style={{ backgroundColor: '#fff', padding: 10, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 10 }} >
                <Text style={[styles.textBig, { color: 'blue' }]}>Coming Soon</Text>
              </View>
            </Display>
          </ScrollView>
        </LinearGradient>

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
    paddingHorizontal: 0,
    // paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,

  },
  mainHeaderContainer:
  {
    //marginTop: Expo.Constants.statusBarHeight,
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomColor: '#d8d8d8',
    borderBottomWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 8, height: 8 }, shadowOpacity: 0.2,
    shadowRadius: 1, elevation: 1,

  },
  contentWrapper: {
    flex: 1,
    minHeight: 100,
  },
  textBig: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  textWhite: {
    color: 'white'
  },
  introBanner: {
    justifyContent: 'center',
    alignItems: 'center',
    // borderBottomColor:'#fff',
    // borderBottomWidth:50,
    flexDirection: 'column'

  },
  introBannerImage: {
    width: 250,
    height: 202.25
  },
  introBannerText: {
    backgroundColor: '#fff',
    padding: 10,
    textAlign: 'center',
    color: '#666',
    width: '100%'
  },
  highlightsBanner: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  highlightImage: {
    width: 75,
    height: 75
  },
});
export default withNavigation(ChefExploreScreen)