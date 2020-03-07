import React, { Component } from 'react';
import { Container, Header, Left, Body, Button, Icon, Title, Segment, Text } from 'native-base'
import { StyleSheet, Dimensions, StatusBar, Platform, View, ActivityIndicator } from 'react-native'
import { withNavigation } from 'react-navigation';
class ProductSegmentHeaderScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
      categoryId: this.props.navigation.getParam('cId'),
    }
  }
  componentWillMount() {
    console.log('InSection' + this.state.categoryId)
    // await Expo.Font.loadAsync({
    //   'Roboto': require('native-base/Fonts/Roboto.ttf'),
    //   'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),

    // });
    this.setState({ isReady: true });
  }

  render() {
    if (!this.state.isReady) {
      return <ActivityIndicator />;
    }
    return (
      <View style={styles.mainHeaderConatiner}>
        <Container style={{ flex: 1, height: null }}>
          <Header hasSegment style={{ backgroundColor: '#fff' }}>
            <Left>
              <Button transparent onPress={() => this.props.navigation.navigate('Categories')}>
                <Icon name="arrow-back" style={{ color: '#555' }} />
              </Button>
            </Left>
            <Body>
              <Title style={{ color: '#cd2121', marginLeft: -40, paddingLeft: 0, }}>{this.props.navigation.getParam('cName')}</Title>
            </Body>
          </Header>
          <Segment style={{ backgroundColor: '#cd1020' }}>
            <Button first active={this.state.selected === 'Good'} onPress={() => this.setState({ selected: 'Good' })}>
              <Text>Good</Text>
            </Button>
            <Button active={this.state.selected === 'Better'} onPress={() => this.setState({ selected: 'Better' })}>
              <Text>Better</Text>
            </Button>
            <Button last active={this.state.selected === 'Best'} onPress={() => this.setState({ selected: 'Best' })}>
              <Text>Best</Text>
            </Button>

          </Segment>
        </Container>
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
    marginTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    zIndex: 999,

  }
});
export default withNavigation(ProductSegmentHeaderScreen);