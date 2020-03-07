import React from 'react';
import {
  StyleSheet, Platform, Text, View, Image, ImageBackground, ActivityIndicator, Dimensions, TouchableOpacity, AsyncStorage
} from 'react-native';
import Timeline from 'react-native-timeline-listview'
import Icon from 'react-native-vector-icons/FontAwesome';
import Display from 'react-native-display';
import * as OpenAnything from 'react-native-openanything';

const aspectRatio = Dimensions.get('window').height / Dimensions.get('window').width;
export default class TrackOrderScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imageUrl: require('../assets/bringmyfood.png'),
      selected: null,
      customerId: "",
      loader: true,
      orderId: this.props.navigation.getParam("orderId"),
      data: []
    };

    this.onEventPress = this.onEventPress.bind(this);
    // this.renderSelected = this.renderSelected.bind(this)
    this.renderDetail = this.renderDetail.bind(this);
  }

  async retrieveItem(key) {
    console.log("TrackOrderScreen retrieveItem() key: ", key);
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
    console.log("TrackOrderScreen storeItem() key: ", key);
    try {
      var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
      return jsonOfItem;
    }
    catch (error) {
      console.log(error.message);
    }
  }

  getUserData() {
    console.log("TrackOrderScreen getUserData()");
    this.retrieveItem('UserData').then((user) => {
      this.setState({ customerId: user.CustomerId });
      this.fetchTrackOrderData();
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  fetchTrackOrderData = () => {

    console.log("TrackOrderScreen getUserData() customerId: ", this.state.customerId, " && orderId: ", this.state.orderId);
    fetch("https://www.bringmyfood.in/data/reactapp/userapp/trackorderapp.php", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "customerId": this.state.customerId,
        "orderId": this.state.orderId
      })
    }).then((response) => response.json()).then((responseJson) => {
      // console.log(responseJson)
      if (responseJson.Success == 'Y') {
        this.setState({ data: responseJson.Data, loader: false });
      }
    });
  }

  componentWillMount() {
    console.log("TrackOrderScreen componentWillMount()");
    this.getUserData();
  }

  onEventPress(data) {
    // this.setState({selected: data})
  }

  // renderSelected(){
  //     if(this.state.selected)
  //       return <Text style={{marginTop:10}}>Selected event: {this.state.selected.title} at {this.state.selected.time}</Text>
  // }

  renderDetail(rowData, sectionID, rowID) {
    // console.log(rowData)
    let title = <Text style={[styles.title]}>{rowData.title}</Text>
    var desc = null
    if (rowData.description) {
      desc = (
        <View style={styles.descriptionContainer}>
          <Text style={[styles.textDescription]}>{rowData.description}</Text>
        </View>
      )
    }
    if (rowData.imageUrl) {
      desc = (
        <View style={[styles.descriptionContainer, { marginTop: 5 }]}>
          <Image source={this.state.imageUrl} style={styles.image} />
          <View style={styles.imageContainer}>
            <Text style={[styles.textDescription, { marginLeft: 0 }]}>{rowData.DeliveryPersonName}{rowData.description}</Text>

            {/* <TouchableOpacity style={styles.call} onPress={() => OpenAnything.Call('')}>
                <Text style={{ color: '#cd2121' }}>CALL NOW</Text>
              </TouchableOpacity> */}

          </View>
        </View>
      )
    }
    if (rowData.button) {
      desc = (
        <View style={[styles.descriptionContainer, { marginTop: 5 }]}>
          <TouchableOpacity onPress={() => OpenAnything.Call('8339000801')}>
            <View style={styles.call}>
              <Text style={{ color: '#cd2121' }}>CALL US</Text>
            </View>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={{ flex: 1, marginTop: 0 }}>
        {title}
        {desc}
      </View>
    )
  }


  render() {

    return (
      <View style={styles.mainContainer}>
        <ImageBackground source={require('../assets/trackbg.jpg')} style={styles.background}>
          <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
            <Icon name='arrow-left' color='#000' size={15} style={{ marginTop: 10, marginLeft: 10 }} />
          </TouchableOpacity>
          <Display enable={this.state.loader} style={[styles.displayBox, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#cd2121" />
          </Display>
          <Display style={styles.displayBox} enable={!this.state.loader}>


            {/* <View style={styles.container}>  */}
            {/* {this.renderSelected()} */}
            <Timeline
              style={styles.list}
              data={this.state.data}
              circleSize={20}
              circleColor='#ebebeb'
              lineColor='rgb(45,156,219)'
              timeContainerStyle={{ minWidth: 52 }}
              timeStyle={{ textAlign: 'center', color: '#918f8f', }}
              descriptionStyle={{ color: 'gray' }}
              options={{
                // style:{paddingTop:5}
              }}
              // onEventPress={this.onEventPress}
              renderDetail={this.renderDetail}
            />
            <View style={styles.orderDetailsContainer}>
              <TouchableOpacity>
                <View style={styles.LowerContainer}>

                  {/* <Text style={{fontSize:12,color:'#8c8989',marginRight:5}}>Need Help ?</Text> */}
                  <Icon name='comments' color='#cd2121' size={18} />
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('HelpAndSupport')}>
                    <Text style={{ fontSize: 16, color: '#cd2121', fontWeight: '400', marginLeft: 5 }}>CHAT SUPPORT</Text>
                  </TouchableOpacity>

                </View>
              </TouchableOpacity>
            </View>

          </Display>

          {/* </View> */}
        </ImageBackground>
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
    backgroundColor: '#f8f8f8',
    flexDirection: 'column',
    // paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
  },
  background:
  {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },
  container: {
    flex: 1,


  },
  list: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#474545',
    justifyContent: 'flex-start', alignItems: 'flex-start'
  },
  descriptionContainer: {
    flexDirection: 'row',
    paddingRight: 50
  },
  imageContainer:
  {
    flexDirection: 'column',
    paddingLeft: 25
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginTop: 6
  },
  textDescription: {
    color: 'gray'
  },
  call:
  {
    borderColor: '#cd2121', marginTop: 5, justifyContent: 'center'
    , alignItems: 'center', padding: 10, borderWidth: 1, paddingVertical: 5
  },
  displayBox:
  {
    flex: 1, padding: 10, marginTop: Dimensions.get('window').height / 2 + 20,
    paddingTop: 10, marginBottom: 20, width: Dimensions.get('window').width,
    paddingLeft: Platform.OS === 'ios' ? aspectRatio > 1.6 ? 20 : 250 : 20
  },
  orderDetailsContainer:
  {

  },
  LowerContainer:
  {
    flexDirection: 'row',
    marginTop: 20,
    padding: 12,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#cd2121', borderWidth: 1
  },
});