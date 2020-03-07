import React from 'react';
import {
    View, Dimensions, TouchableOpacity, Image, StyleSheet, Keyboard, Alert, ScrollView, Text, AsyncStorage, ActivityIndicator
} from 'react-native';
import Display from 'react-native-display';
import { TextField } from 'react-native-material-textfield';
import CodeInput from 'react-native-confirmation-code-input';
// import { Permissions, Notifications } from 'expo';
import Global from '../Urls/Global.js';
import firebase from 'react-native-firebase';

const BASE_PATH = Global.BASE_PATH;

class OtpVerifyScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            signUpData: this.props.navigation.getParam("signUpData"),
            text: 'VERIFY',
            disabled: true,
            isValid: false,
            loader: false,
            otpVerify: true,
            newPass: "",
            passwordChange: false,
            verificationType: "SIGNUP",
            signUpData: {},
            phoneNumber: "",
            codeValue: "",
            enteredCode: "",
            number: "",
            change: 0,
            fcmToken: '',
        }

    }

    async storeItem(key, item) {
        console.log("OtpVerifyScreen storeItem() key: ", key);
        let jsonItem = null;
        try {
            jsonItem = await AsyncStorage.setItem(key, JSON.stringify(item));
        }
        catch (error) {
            console.log(error.message);
        }
        return jsonItem;
    }

    // registerForPushNotifications = async () => {
    //     console.log("LoginScreen registerForPushNotifications() Expo Token");
    //     const { status: existingStatus } = await Permissions.getAsync(
    //         Permissions.NOTIFICATIONS
    //     );
    //     let finalStatus = existingStatus;
    //     if (existingStatus !== 'granted') {
    //         const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    //         finalStatus = status;
    //     }
    //     if (finalStatus !== 'granted') {
    //         return;
    //     }
    //     global.token = await Notifications.getExpoPushTokenAsync();
    //     console.log("Fetched Token " + global.token);
    // }

    onFinishCheckingCode(code) {
        console.log("OtpVerifyScreen onFinishCheckingCode() Code ", code);
        this.setState({ enteredCode: code });
        if (code == this.state.codeValue) {
            if (this.state.verificationType == "SIGNUP") {
                let suData = this.state.signUpData;
                suData.code = code;
                this.setState({ text: "VERIFY & SIGNUP", disabled: false, isValid: true, signUpData: suData });
            }
            else if (this.state.verificationType == "RESETPASS") {
                this.setState({ text: "VERIFY & SET PASSWORD", disabled: false, isValid: true, loader: false });
            }
        }
        else {
            this.setState({ text: "VERIFY", disabled: true });
            Alert.alert("Invalid OTP. Please re-enter.");
            this.refs.codeInputRef.clear();
        }
    }

    resendCode = () => {
        console.log("OtpVerifyScreen resendCode()");
        let url = BASE_PATH + Global.RESEND_SIGNUP_OTP_URL;
        let bodyData = JSON.stringify({ 'phoneNumber': this.state.signUpData.number, "reqFrom": "APP" });
        if (this.state.verificationType == "RESETPASS") {
            url = BASE_PATH + Global.RESEND_RESET_OTP_URL;
            bodyData = JSON.stringify({ 'phoneNumber': this.state.phoneNumber, "reqFrom": "APP" });
        }
        console.log("URL: ", url, " && bodyData: ", bodyData);
        fetch(url, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: bodyData
        }).then((response) => response.json()).then((responseData) => {
            this.setState({ disabled: true });
            if (responseData.Success == "Y") {
                console.log("resendCode() response : ", responseData)
                this.setState({ codeValue: responseData.Code, disabled: true, enteredCode: "" });
                this.refs.codeInputRef.clear();
                Alert.alert("OTP has been resent");

            }
            else if (responseData.Success == "I") {
                console.log("User account is not active");
                Alert.alert("", "This account is not active");
            }
            else {
                console.log("Some problem occurred. ", responseData.Message);
                Alert.alert("", responseData.Message);
            }
        }).catch((error) => {
            console.log("Error Resend Code: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
        });
    }

    async getToken() {
        console.log("LoginScreen getToken(FIREBASE)");
        let fcmToken = await firebase.messaging().getToken();
        if (fcmToken) {
            console.log("Token generated : ", fcmToken);
            this.state.fcmToken = fcmToken;
            this.storeItem("fcmToken", fcmToken);
        }
    }

    verifyOTP = () => {
        this.setState({ loader: true })
        console.log("OtpVerifyScreen verifyOTP() text: ", this.state.text);
        if (this.state.text == "VERIFY & SIGNUP") {
            let suData = this.state.signUpData;
            suData.token = global.token;
            this.setState({ signUpData: suData });
            if (JSON.stringify(this.state.signUpData) != JSON.stringify({})) {
                this.state.signUpData.from = "p+E6FypG/Na3DYVUakO42Q==";
                this.state.signUpData.token = this.state.fcmToken;
                let bodyData = JSON.stringify(this.state.signUpData);
                console.log("BodyData: ", bodyData);
                fetch(BASE_PATH + Global.VERIFY_SIGNUP_OTP_URL, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: bodyData
                }).then((response) => response.json()).then((responseData) => {
                    console.log("OtpVerifyScreen verifyOTP() response : ", responseData)
                    this.setState({ loader: false });
                    if (responseData.Success == "Y") {
                        this.storeItem('UserData', responseData.Customer);
                        this.props.navigation.push("Tabs");
                    }
                    else {
                        console.log("Some problem occurred. ", responseData.Message);
                        Alert.alert("", responseData.Message);
                    }
                }).catch((error) => {
                    console.log("Error Signup User: ", error);
                    ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
                });
            }
        }
        else if (this.state.text == "VERIFY & SET PASSWORD") {
            this.setState({ otpVerify: false, passwordChange: true, loader: false });
        }
    }

    getNewPassFunction = (PassHolder) => {
        console.log("OtpVerifyScreen getNewPassFunction() PassHolder: ", PassHolder);
        if (PassHolder.length > 3) {
            this.setState({ newPass: PassHolder, disabled: false });
        }
        else {
            this.setState({ newPass: PassHolder, disabled: true });
        }
    }

    changePassword = () => {
        this.setState({ loader: true })
        console.log("OtpVerifyScreen changePassword() NewPass: ", this.state.newPass, " && PhoneNumber: ", this.state.phoneNumber);
        if (this.state.newPass.length > 3 && this.state.phoneNumber.length == 10) {
            fetch(BASE_PATH + Global.RESET_USER_PASS_URL, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'customerPhone': this.state.phoneNumber,
                    'password': this.state.newPass,
                    'token': global.token
                })
            }).then((response) => response.json()).then((responseData) => {
                this.setState({ loader: false });
                if (responseData.Success == "Y") {
                    this.storeItem('UserData', responseData.Customer);
                    this.props.navigation.push("Tabs");
                }
                else if (responseData.Success == "I") {
                    console.log("User account is not active");
                    Alert.alert("", "This account is not active");
                }
                else {
                    console.log("Some problem occurred. ", responseData.Message);
                    Alert.alert("", responseData.Message);
                }
            }).catch((error) => {
                console.log("Error Change Password: ", error);
                ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            });
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
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    componentDidMount() {
        console.log("OtpVerifyScreen componentDidMount()");
        this.getToken();
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
        // this.registerForPushNotifications();
        let verificationType = this.props.navigation.getParam("verifyType");
        let receivedData = this.props.navigation.getParam("inputData");
        let codeValue = this.props.navigation.getParam("codeValue");
        console.log("verificationType: ", verificationType, " && receivedData: ", receivedData, " && codeValue: ", codeValue);
        if (typeof verificationType != 'undefined' && typeof receivedData != 'undefined' && typeof codeValue != 'undefined') {
            if (verificationType == "SIGNUP") {
                this.setState({ verificationType: "SIGNUP", signUpData: receivedData, number: receivedData.number, codeValue: codeValue });
            }
            else if (verificationType == "RESETPASS") {
                this.setState({ verificationType: "RESETPASS", phoneNumber: receivedData, number: receivedData, codeValue: codeValue });
            }
        }
    }

    render() {


        return (

            <ScrollView contentContainerStyle={[styles.mainContainer, { marginTop: -this.state.change }]}
                keyboardShouldPersistTaps={'always'}
            >
                <View style={styles.upperContainer}>
                    <Image source={require('../assets/company-logos/otp-graphic.jpg')} style={{ width: 150, height: 150 }} />
                </View >
                <View style={{ flex: 1 }}>
                    <View style={styles.middleContainer}>
                        <Display enable={this.state.otpVerify}>
                            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: "#3a3939", fontSize: 17, fontWeight: '800' }}>Complete Verification</Text>
                                <Text style={{ color: "#706d6d", fontSize: 10 }}>We have sent an OTP to {this.state.number} </Text>
                                <Text style={{ color: "#706d6d", fontSize: 12, marginTop: 6 }}>To complete verification enter OTP here</Text>
                            </View>
                            <View style={{ height: 90 }}>
                                <CodeInput
                                    ref="codeInputRef"
                                    secureTextEntry={false}
                                    codeLength={6}
                                    activeColor='rgba(49, 180, 4, 1)'
                                    inactiveColor='rgba(49, 180, 4, 1.3)'
                                    autoFocus={false}
                                    keyboardType="numeric"
                                    ignoreCase={true}
                                    inputPosition='center'
                                    size={50}
                                    onFulfill={(code) => this.onFinishCheckingCode(code)}
                                    containerStyle={{ marginTop: 30 }}
                                    codeInputStyle={{ borderWidth: 1.5 }}
                                />
                            </View>
                            <Display enable={!this.state.isValid}>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                                    <Text style={{ fontSize: 8, marginTop: 3, color: '#92939e' }}>Didn't received SMS? </Text>
                                    <TouchableOpacity onPress={this.resendCode.bind(this)}>
                                        <Text style={{ fontSize: 11, color: '#cd2121' }}>Resend OTP</Text>
                                    </TouchableOpacity>
                                </View>
                            </Display>
                        </Display>
                        <Display enable={this.state.passwordChange}>
                            <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: "#3a3939", fontSize: 17, fontWeight: '800' }}>Set New Password</Text>
                            </View>
                            <View style={{ height: 80 }}>
                                <TextField
                                    label="New Password"
                                    // title="NAME"
                                    placeholderTextColor="#fff"
                                    underlineColorAndroid='transparent'
                                    returnKeyType="go"
                                    fontSize={20}
                                    secureTextEntry={false}
                                    returnKeyLabel="go"
                                    style={{ letterSpacing: 3 }}
                                    keyboardType="default"
                                    autoCorrect={false}
                                    autoCapitalize='none'
                                    onChangeText={PassHolder => this.getNewPassFunction(PassHolder)}
                                    ref={component => this._phoneInput = component}
                                    onSubmitEditing={() => { this.changePassword(); }}
                                />
                            </View>
                        </Display>
                    </View>
                    <View style={styles.lowerContainer}>
                        <View style={{ backgroundColor: '#cd2121', height: 50, width: Dimensions.get('window').width - 20, justifyContent: 'center', alignItems: 'center' }}>
                            <Display enable={this.state.loader} style={{ height: Dimensions.get('window').height, justifyContent: 'center' }}>
                                <ActivityIndicator size="small" color="#fff" />
                            </Display>
                            <TouchableOpacity disabled={this.state.disabled} onPress={this.verifyOTP.bind(this)} style={{ opacity: (this.state.disabled ? .6 : 1) }}>
                                <Display enable={!this.state.loader && this.state.otpVerify} style={{ height: Dimensions.get('window').height, justifyContent: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>{this.state.text}</Text>
                                </Display>
                            </TouchableOpacity>
                            <TouchableOpacity disabled={this.state.disabled} onPress={this.changePassword.bind(this)} style={{ opacity: (this.state.disabled ? .6 : 1) }}>
                                <Display enable={!this.state.loader && this.state.passwordChange} style={{ height: Dimensions.get('window').height, justifyContent: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>{this.state.text}</Text>
                                </Display>
                            </TouchableOpacity>
                        </View>
                    </View>
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
        backgroundColor: '#f2f7f4'
    },
    upperContainer:
    {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    middleContainer:
    {
        flex: 4,
        alignItems: 'center',
    },
    lowerContainer:
    {
        borderColor: '#c6c4c4',
        borderTopWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff'
    },


});

export default OtpVerifyScreen;