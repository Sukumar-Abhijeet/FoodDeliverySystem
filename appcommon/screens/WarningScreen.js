import React from 'react';
import {
  TouchableOpacity, View, Image, StyleSheet, Text, AsyncStorage, Dimensions,
} from 'react-native';
import Display from 'react-native-display';
import { withNavigation } from 'react-navigation';
//  const { navigate } = this.props.navigation;
class WarningScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      noNet: false,
      noService: false,
      kitchenClosed: false
    }

  }

  async retrieveItem(key) {
    console.log("WarningScreen retrieveItem() key: ", key);
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

  recheck = () => {
    console.log("WarningScreen recheck()");
    console.log("props: ", this.props);
    // this.props.navigation.navigate("Location");
  }

  changeLocation = () => {
    console.log("WarningScreen changeLocation()");
    this.props.navigation.navigate("LocationSearch");
  }

  checkServiceAvailable() {
    console.log("WarningScreen checkServiceAvailable()");
    this.retrieveItem('Address').then((data) => {
      console.log("Address Data in WarningScreen: ", data);
      if (data != null) {
        if (typeof data.fAvail != 'undefined' && data.fAvail && typeof data.bAvail != 'undefined' && data.bAvail) {
          console.log('WarningScreen checkServiceAvailable() : IF COND');
          this.setState({ noNet: false, noService: false, kitchenClosed: false });
        }
        else if ((typeof data.fAvail != 'undefined' && data.fAvail) || (typeof data.bAvail != 'undefined' && data.bAvail)) {
          console.log('WarningScreen checkServiceAvailable() : ELSE-IF COND');
          this.setState({ noNet: false, noService: false, kitchenClosed: false });
        }
        else {
          console.log('WarningScreen checkServiceAvailable() : ELSECOND');
          this.setState({ noNet: false, noService: true, kitchenClosed: false });
        }
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  checkKitchenStatus = () => {
    console.log("WarningScreen checkKitchenStatus()");
    this.retrieveItem('KitchenStatus').then((data) => {
      if (data != null) {
        if (data != "OPEN") {
          this.setState({ noService: false, noNet: false, kitchenClosed: true });
        }
        else {
          this.setState({ noNet: false, noService: false, kitchenClosed: false });
          this.checkServiceAvailable();
        }
      }
    }).catch((error) => {
      console.log('Promise is rejected with error: ' + error);
    });
  }

  componentDidMount() {
    console.log("WarningScreen componentDidMount()");
    this.checkKitchenStatus();
    this.props.navigation.addListener('didFocus', () => { this.checkKitchenStatus(); })

  }
  render() {
    return (
      <View style={styles.mainContainer} style={{ paddingTop: (this.state.noService) ? 50 : 0 }}>
        <Display enable={this.state.noNet}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#fbfbfb', justifyContent: 'center', alignItems: 'center' }}>
              <Image source={require('../assets/app-images/no-signal.png')} style={{ width: 80, height: 80 }} />
            </View>
            <Text style={{ color: "#cd2121", fontSize: 14 }}>OOPS! There's No Internet Connection</Text>

            <TouchableOpacity>
              <View style={{ height: 25, borderWidth: 1, marginTop: 20, borderColor: '#cd2121', justifyContent: 'center', alignItems: 'center', width: 160, borderRadius: 1 }}>
                <Text style={{ color: "#cd2121", fontSize: 14 }}>Refresh</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Display>
        <Display enable={this.state.kitchenClosed} style={{ marginTop: 100 }}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#fbfbfb', justifyContent: 'center', alignItems: 'center' }}>
              <Image source={require('../assets/app-images/kitchen-closed.png')} style={{ width: 80, height: 80 }} />
            </View>
            <Text style={{ color: "#fff", fontSize: 14, padding: 4, margin: 5, backgroundColor: '#000', textAlign: 'center' }}>Sorry! Kitchen is closed right now.</Text>
            <Text style={{ color: "#000", fontSize: 10, padding: 4, margin: 5, marginTop: 10, textAlign: 'center' }}>Please knock after some time</Text>

          </View>
        </Display>
        <Display enable={this.state.noService}
          enterDuration={500}
          exitDuration={100}
          exit="fadeOutDown"
          enter="fadeInUp"
        >
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ padding: 5, justifyContent: 'center', alignItems: 'center' }}>
              <Image source={require('../assets/app-images/no-service.jpg')} style={{ width: Dimensions.get('window').width, height: 350 }} resizeMode={'center'} />
            </View>
            <TouchableOpacity onPress={this.changeLocation}>
              <View style={{ height: 25, width: 150, borderWidth: 1, borderColor: '#cd2121', justifyContent: 'center', alignItems: 'center', borderRadius: 1 }}>
                <Text style={{ color: "#cd2121", fontSize: 14 }}>Change Location</Text>
              </View>
            </TouchableOpacity>


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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default withNavigation(WarningScreen);