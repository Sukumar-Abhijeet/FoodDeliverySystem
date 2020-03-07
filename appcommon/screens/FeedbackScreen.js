import React from 'react';
import {
    StyleSheet, Text, View, ToastAndroid, BackHandler, Keyboard, Switch, Image, ImageBackground, ListView, ScrollView, RefreshControl, ActivityIndicator, Dimensions, TouchableOpacity, AsyncStorage, Platform, StatusBar, Alert
} from 'react-native';
import { Rating, AirbnbRating } from 'react-native-ratings';
import { TextField } from 'react-native-material-textfield';
import Display from 'react-native-display';
import Global from '../Urls/Global.js';

const BASEPATH = Global.BASE_PATH;

export default class FeedbackScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            switch1Value: true,
            switch2Value: true,
            feedback: "",
            rating: "3",
            disabled: true,
            customerId: "",
            change: 0,
            orderId: this.props.navigation.getParam("orderId")
        }

    }

    async retrieveItem(key) {
        console.log("FeedbackScreen retrieveItem() key: ", key);
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

    getUserData = () => {
        console.log("FeedbackScreen getUserData()");
        this.retrieveItem('UserData').then((user) => {
            if (user != null) {
                this.setState({ customerId: user.uuid });
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    ratingCompleted = (rating) => {
        console.log("FeedbackScreen ratingCompleted() rating: ", rating);
        this.setState({ rating: rating });
    }

    saveFeedback = () => {
        console.log("FeedbackScreen saveFeedback() rating: ", this.state.rating, " && cutomerId: ", this.state.customerId);
        if (this.state.rating != "" && this.state.customerId != "") {
            fetch(BASEPATH + Global.RATE_ORDER_URL, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'uuid': this.state.customerId,
                    'orderId': this.state.orderId,
                    'orderRating': this.state.rating,
                    'orderFeedback': this.state.feedback
                })
            }).then((response) => response.json()).then((responseData) => {
                if (responseData.Success == "Y") {
                    Alert.alert("Feedback", "Thanks for the feedback", [{
                        text: 'Ok', onPress: () => {
                            this.checkLocation();
                        }
                    }]);
                }
                else {
                    Alert.alert("Welcome", responseData.Message);
                }
            }).catch((error) => {
                console.log("Error Feedback Save: ", error);
                ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            });
        }
    }

    checkLocation = () => {
        console.log("FeedbackScreen checkLocation()");
        this.retrieveItem('Address').then((data) => {
            if (data == null) {
                this.props.navigation.navigate('Location');
            }
            else {
                this.props.navigation.navigate('Tabs');
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }


    componentDidMount() {
        console.log("FeedbackScreen componentDidMount()");
        this.getUserData();
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow = () => {
        this.setState({ change: 300 })
        // Alert.alert("Working");
    }

    _keyboardDidHide = () => {
        this.setState({ change: 0 })
        // Alert.alert("Working");
    }

    toggleSwitch1 = (value) => {
        this.setState({ switch1Value: value })
    }
    toggleSwitch2 = (value) => {
        this.setState({ switch2Value: value })
    }

    render() {

        return (
            <ImageBackground source={require('../assets/company-logos/background.jpg')} style={[styles.mainContainer, { marginBottom: this.state.change }]}>
                <View style={styles.upperContainer}>
                    <View style={{ justifyContent: "center", alignItems: 'center' }}>
                        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={require('../assets/app-images/boy.png')} style={{ width: 50, height: 50 }} />
                        </View>
                        <Text style={{ fontSize: 16, color: '#fff', fontWeight: 'bold', marginTop: 15 }}>Hope You Had Enjoyed Our Service! </Text>
                    </View>
                </View>
                <View style={styles.middleContainer}>
                    <View style={{ flex: 2, backgroundColor: '#ebebeb' }}>
                    </View>
                    <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, color: '#000', fontWeight: '400' }}>Slide To Rate</Text>
                        <Rating
                            showRating
                            imageSize={40}
                            onFinishRating={this.ratingCompleted}
                            style={{ paddingVertical: 10 }}
                        />
                    </View>
                </View>
                <View style={styles.lowerContainer}>

                    <View style={{ padding: 10 }}>
                        <TextField
                            label="Anything Else You Want To say!"
                            editable={true}
                            placeholderTextColor="#fff"
                            underlineColorAndroid='transparent'
                            returnKeyType="next"
                            keyboardType="default"
                            maxLength={100}
                            autoCorrect={false}
                            autoCapitalize='none'
                            onChangeText={(feedback) => this.setState({ feedback })}
                            ref={component => this._phoneInput = component}
                        />
                    </View>
                    <TouchableOpacity disabled={this.state.rating == ""} onPress={this.saveFeedback.bind(this)}>
                        <View style={{ padding: 10 }}>
                            <View style={styles.call}>
                                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '200' }}>Save Feedback</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    {/* <View style={{ padding: 10 }}>
            <Text style={{ fontSize: 14, color: '#f7f4f4', fontWeight: '300' }}>Make This Rating Visible To Friends ?</Text>
            <Text style={{ fontSize: 14, color: '#f7f4f4', fontWeight: '300', marginTop: 25 }}>Make Previous Ratings Visible To Friends</Text>
          </View>
          <View style={{ padding: 5 }}>
            <Switch
              onValueChange={this.toggleSwitch1}
              value={this.state.switch1Value} />
            <Switch style={{ marginTop: 15 }}
              onValueChange={this.toggleSwitch2}
              value={this.state.switch2Value} />
          </View> */}
                </View>
            </ImageBackground>
        );
    }
}
const styles = StyleSheet.create({
    mainContainer:
    {
        paddingHorizontal: 10,
        flex: 1,
        width: null,
        height: null,
        backgroundColor: '#f8f8f8',
        flexDirection: 'column',
        // marginTop: Expo.Constants.statusBarHeight,
    },
    upperContainer:
    {
        paddingTop: 30,
        flex: 2
    },
    middleContainer:
    {
        marginTop: 5,
        backgroundColor: '#fff',
        borderRadius: 4,
        flex: 3
    },

    lowerContainer:
    {
        marginTop: 20,
        flexDirection: 'column',
        flex: 2
    },
    call:
    {
        backgroundColor: '#cd2121', justifyContent: 'center'
        , alignItems: 'center', padding: 15, marginBottom: 5
    }
});
