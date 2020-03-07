import React from 'react';
import {
    CheckBox, Dimensions, TouchableOpacity, View,
    StyleSheet, Keyboard, Alert, ScrollView, Text,
    AsyncStorage, ActivityIndicator
} from 'react-native';
import Display from 'react-native-display';
import { TextField } from 'react-native-material-textfield';
import Global from '../Urls/Global.js';

const BASE_PATH = Global.BASE_PATH;

class SignUpScreen extends React.Component {
    constructor(props) {
        super(props);
        console.log("Received Phone: ", this.props.navigation.getParam("phoneNumber"));
        this.state = {
            name: '',
            email: '',
            number: this.props.navigation.getParam("phoneNumber"),
            password: '',
            checked: false,
            referral: '',
            loader: false,
            addressType: "",
            pincode: ""
        }
    }

    async retrieveItem(key) {
        console.log("SignUpScreen retrieveItem() key: ", key);
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
        console.log("SignUpScreen storeItem() key: ", key);
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
        console.log("SignUpScreen removeItem() key: ", key);
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    fetchAddressType = () => {
        console.log("SignUpScreen fetchAddressType()");
        this.retrieveItem('AddressType').then((data) => {
            if (data != null) {
                this.setState({ addressType: data });
            }
            this.fetchAddressPincode();
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    fetchAddressPincode = () => {
        console.log("SignUpScreen fetchAddressPincode()");
        this.retrieveItem('Address').then((data) => {
            if (data != null) {
                this.setState({ pincode: data.pincode });
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    verifyOtp = () => {
        console.log("SignUpScreen verifyOtp() ", this.state);
        if (this.state.name.trim() != "" && this.state.email.trim() != "" && this.state.number.trim() != "" && this.state.number.length == 10 && this.state.password.trim() != "" && this.state.password.length >= 4) {
            let flag = true;
            if (this.state.checked) {
                if (this.state.referral.trim() == "") {
                    flag = false;
                }
            }
            if (flag) {
                this.setState({ loader: true });
                fetch(BASE_PATH + Global.GEN_SIGNUP_OTP_URL, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'mobileNum': this.state.number,
                        'emailId': this.state.email
                    })
                }).then((response) => response.json()).then((responseData) => {
                    console.log("response: ", responseData);
                    if (responseData.Success == "Y") {
                        this.storeItem('SignUpData', this.state);
                        this.props.navigation.navigate('OtpVerify', { verifyType: "SIGNUP", inputData: this.state, codeValue: responseData.Code });
                    }
                    else if (responseData.Success == "E") {
                        console.log("User account is not active");
                        Alert.alert("", responseData.Message);
                    }
                    else {
                        console.log("Some problem occurred. ", responseData.Message);
                    }
                    this.setState({ loader: false })
                }).catch((error) => {
                    console.log("Error Signup User: ", error);
                    ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
                });
            }
            else {
                Alert.alert("", "You have marked referral field as required. Please fill.");
            }
        }
        else {
            Alert.alert("", "Please fill all fields.");
        }
    }
    _keyboardDidShow = (event) => {
        console.log("LoginScreen _keyboardDidSchow() :");
        const keyboardHeight = event.endCoordinates.height;
        // this.ScrollView.scrollToEnd({ animated: true });
        console.log("KeyboardHeight : ", keyboardHeight)
        this.setState({ change: keyboardHeight })
    }
    _keyboardDidHide = () => {
        console.log("LoginScreen _keyboardDidHide() :");
        this.setState({ change: 0 })
    }
    componentWillUnmount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    componentDidMount() {
        console.log("SignUpScreen componentDidMount()");
        this.fetchAddressType();
    }

    render() {
        return (

            <ScrollView contentContainerStyle={[styles.mainContainer, { marginTop: -this.state.change }]}
                keyboardShouldPersistTaps={'always'}
            >
                <View style={styles.upperContainer}>
                    <Text style={{ color: "#3a3939", fontSize: 15, fontWeight: '800' }}>SIGN UP</Text>
                    <Text style={{ color: "#706d6d", fontSize: 12 }}>Create an account with your phone number</Text>
                </View>
                <View style={{ flex: 1 }} >
                    <View style={styles.middleContainer}>
                        <ScrollView key={'signupInput'} style={styles.formContainer}>
                            <TextField
                                label="Mobile Number"
                                editable={false}
                                value={this.state.number}
                                placeholderTextColor="#fff"
                                underlineColorAndroid='transparent'
                                returnKeyType="next"
                                keyboardType="default"
                                autoCorrect={false}
                                autoCapitalize='none'
                                onChangeText={(number) => this.setState({ number })}
                                ref={component => this._phoneInput = component}
                            />
                            <TextField
                                label="Name"
                                placeholderTextColor="#fff"
                                underlineColorAndroid='transparent'
                                returnKeyType="next"
                                keyboardType="default"
                                autoCorrect={false}
                                autoCapitalize='none'
                                onChangeText={(name) => this.setState({ name })}
                                onSubmitEditing={() => { this.emailInput.focus(); }}
                            />
                            <TextField
                                label="Email"
                                placeholderTextColor="#fff"
                                underlineColorAndroid='transparent'
                                returnKeyType="next"
                                keyboardType="default"
                                autoCorrect={false}
                                autoCapitalize='none'
                                onChangeText={(email) => this.setState({ email })}
                                ref={(input) => { this.emailInput = input; }}
                                onSubmitEditing={() => { this.passwordInput.focus(); }}
                            />
                            <TextField
                                label="Password"
                                placeholderTextColor="#fff"
                                underlineColorAndroid='transparent'
                                returnKeyType="go"
                                keyboardType="default"
                                autoCorrect={false}
                                autoCapitalize='none'
                                secureTextEntry={true}
                                onChangeText={(password) => this.setState({ password })}
                                ref={(input) => { this.passwordInput = input; }}
                                onSubmitEditing={() => { this.verifyOtp(); }}
                            />
                            <View style={{ flexDirection: 'column', paddingTop: 15, }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <CheckBox
                                        value={this.state.checked}
                                        onValueChange={() => this.setState({ checked: !this.state.checked })}
                                    />
                                    <Text style={{ marginTop: 5, color: '#777a82' }}> Got any Referral Code?</Text>
                                </View>
                                <Display enable={this.state.checked}
                                    enterDuration={500}
                                    exitDuration={250}
                                    exit="fadeOutLeft"
                                    enter="fadeInLeft"
                                >
                                    <TextField
                                        label="Referral Code"
                                        placeholderTextColor="#fff"
                                        underlineColorAndroid='transparent'
                                        returnKeyType="go"
                                        keyboardType="default"
                                        autoCorrect={false}
                                        autoCapitalize='none'
                                        onChangeText={(referral) => this.setState({ referral })}
                                        ref={component => this._phoneInput = component}
                                    />

                                </Display>
                                <View style={{ flexDirection: 'row', }}>
                                    <Text style={{ fontSize: 8, marginTop: 3, color: '#92939e' }}>By creating an account, I accept the </Text><Text style={{ fontSize: 11, color: '#020af7' }}>Terms & Conditions</Text>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                    <TouchableOpacity onPress={this.verifyOtp}>
                        <View style={styles.lowerContainer}>
                            <View style={{ backgroundColor: '#cd2121', height: 50, width: Dimensions.get('window').width - 20, justifyContent: 'center', alignItems: 'center' }}>
                                <Display enable={this.state.loader} style={{ height: Dimensions.get('window').height, justifyContent: 'center' }}>
                                    <ActivityIndicator size="small" color="#fff" />
                                </Display>
                                <Display enable={!this.state.loader} style={{ height: Dimensions.get('window').height, justifyContent: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>SIGN UP</Text>
                                </Display>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

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
        // marginTop: Expo.Constants.statusBarHeight,
    },
    upperContainer:
    {

        backgroundColor: '#ebebeb',
        padding: 20,
        paddingTop: 35,
        height: 90
    },
    middleContainer:
    {
        flex: 6,
    },
    imageContainer:
    {
        alignItems: 'center',
        paddingTop: 10
    },
    formContainer:
    {
        paddingHorizontal: 10
    },
    lowerContainer:
    {
        borderColor: '#c6c4c4',
        borderTopWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff'
    }
});

export default SignUpScreen;