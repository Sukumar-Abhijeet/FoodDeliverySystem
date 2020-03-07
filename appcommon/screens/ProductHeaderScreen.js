import React from 'react';
import {
  Dimensions, TouchableOpacity, View, StyleSheet, Platform, StatusBar, Text,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import { withNavigation } from 'react-navigation';
//  const { navigate } = this.props.navigation;
class ProductHeaderScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    }

  }
  categoriesScreen = () => {
    console.log("categoriesScreen()");
    console.log("props: ", this.props);
    this.props.navigation.navigate("Categories");
  }
  componentDidMount() {
    console.log("Component called for TabHeader ");
  }
  render() {
    return (
      <View style={styles.mainHeaderConatiner}>
        {/* <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity>
            <Icon name="bars" size={20} color="#cd2121" style={{ height: 20 }} />
          </TouchableOpacity>
        </View> */}
        <View style={{ flexDirection: 'column', marginLeft: 5 }}>
          <Text style={{ fontSize: 10, color: '#000' }}>Currently Showing</Text>
          <TouchableOpacity onPress={this.categoriesScreen}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ fontSize: 15, color: 'red' }}>{this.props.navigation.getParam('cName')}</Text>
              <Icon name="sort-down" size={15} color="#cd2121" style={{ height: 15, marginLeft: 5 }} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 'auto', padding: 0 }}>
          <View style={{ height: 30, padding: 0, flexDirection: 'row', borderWidth: 1, borderColor: '#cd2121', justifyContent: 'center', alignItems: 'center', width: 170, borderRadius: 1 }}>
            <View style={{ display: 'flex', flexDirection: 'row', padding: 0 }}>
              <TouchableOpacity style={{ backgroundColor: '#cd2121' }}>
                <Text style={{ color: "#fff", fontSize: 15, width: 50, textAlign: 'center', borderRightColor: '#cd2121', borderRightWidth: 1, alignSelf: 'center' }}>GOOD</Text>
              </TouchableOpacity >
              <Text style={{ color: "#cd2121", fontSize: 15, width: 70, alignSelf: 'center', borderRightColor: '#cd2121', borderRightWidth: 1, textAlign: 'center' }}>BETTER</Text>
              <TouchableOpacity>
                <Text style={{ color: "#cd2121", fontSize: 15, width: 50, textAlign: 'center', alignSelf: 'center' }}>BEST</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  mainHeaderConatiner:
  {
    height: 50,
    flexDirection: 'row', backgroundColor: '#fff',
    padding: 10,
    borderBottomColor: '#f9f9f9',
    borderBottomWidth: 1,
    backgroundColor: '#fbfbfb',
    position: 'absolute',
    width: Dimensions.get('window').width,
    top: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    zIndex: 999,

  }
});

export default withNavigation(ProductHeaderScreen);