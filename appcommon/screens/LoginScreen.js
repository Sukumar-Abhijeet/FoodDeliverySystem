import React from 'react';
import {
	ToastAndroid, Dimensions, TouchableOpacity, View, Image,
	StyleSheet, Alert, ScrollView, Text,
	AsyncStorage, ActivityIndicator, Keyboard
} from 'react-native';
import Display from 'react-native-display';
import { TextField } from 'react-native-material-textfield';
// import { Permissions, Notifications } from 'expo';
import Global from '../Urls/Global.js';
import firebase from 'react-native-firebase';

const BASE_PATH = Global.BASE_PATH;

class LoginScreen extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			phoneNumber: '',
			disabled: true,
			text: "Enter Phone Number",
			numberstatus: true,
			password: "",
			loader: false,
			navigatedFrom: "",
			change: 0,
			fcmToken: '',
		}
	}

	async storeItem(key, item) {
		console.log("LoginScren storeItem() key: ", key);
		let jsonItem = null;
		try {
			jsonItem = await AsyncStorage.setItem(key, JSON.stringify(item));
		}
		catch (error) {
			console.log(error.message);
		}
		return jsonItem;
	}

	async retrieveItem(key) {
		console.log("LoginScreen retrieveItem() key: ", key);
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

	async checkPermission() {
		console.log("LoginScreen checkPermission(FIREBASE)");
		const enabled = await firebase.messaging().hasPermission();
		if (enabled) {
			this.getToken();
		} else {
			this.requestPermission();
		}
	}

	async requestPermission() {
		console.log("LoginScreen requestPermission(FIREBASE)");
		try {
			await firebase.messaging().requestPermission();
			this.getToken();
		} catch (error) {
			console.log('permission rejected');
		}
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

	getPhoneNumber = (valueHolder) => {
		//console.log("LoginScreen getPhoneNumber() valueHolder: ", valueHolder);
		this.setState({ phoneNumber: valueHolder })
		if (valueHolder.length == 10) {
			this.setState({ disabled: false, text: "GET STARTED" });
		}
		else {
			this.setState({ disabled: true, text: "Enter Phone Number" });
		}
	}

	getPassFunction = (passHolder) => {
		//console.log("LoginScreen getPassFunction() passHolder: ", passHolder);
		var Value = passHolder.length.toString();
		if (Value >= 4) {
			this.setState({ disabled: false, password: passHolder, text: 'LOGIN' });
		}
		else {
			this.setState({ disabled: true, text: "Enter Password" });
		}
	}

	checklogin = () => {
		console.log("LoginScreen checklogin() text: ", this.state.text, " && token: ", this.state.fcmToken);
		if ((this.state.phoneNumber.length == 10 && this.state.text == "GET STARTED") || (this.state.text == "LOGIN" && this.state.password.length >= 4)) { this.setState({ loader: true }) }
		if (this.state.text == "LOGIN") {
			fetch(BASE_PATH + Global.AUTHENTICATE_USER_URL, {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					'phoneNumber': this.state.phoneNumber,
					'password': this.state.password,
					"token": this.state.fcmToken,
					"reqFrom": "APP"
				})
			}).then((response) => response.json()).then((responseData) => {
				this.setState({ loader: false });
				if (responseData.Success == "Y") {
					this.setState({ numberstatus: true })
					this.storeItem('UserData', responseData.Customer);
					if (this.state.navigatedFrom == "CART") {
						this.props.navigation.push("Cart");
					}
					else {
						this.props.navigation.push("Tabs");
					}
				}
				else if (responseData.Success == "I") {
					//console.log("User account is not active");
					Alert.alert("", "This account is not active");
				}
				else {
					Alert.alert("Invalid Password");
					//console.log("Some problem occurred. ", responseData.Message);
				}
			}).catch((error) => {
				console.log("Error Authenticate User: ", error);
				ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
				this.setState({ loader: false });
			});
		}
		else if (this.state.text == "GET STARTED") {
			this.setState({ loader: true })
			fetch(BASE_PATH + Global.CHECK_USER_PHONE_URL, {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					'mobileNum': this.state.phoneNumber
				})
			}).then((response) => response.json()).then((responseData) => {
				this.setState({ loader: false });
				if (responseData.Success == "Y") {
					this.setState({ numberstatus: false, text: 'Enter Password', disabled: true });
				}
				else if (responseData.Success == "I") {
					Alert.alert("", "This account is not active");
				}
				else if (responseData.Success == "N") {
					Alert.alert("Welcome", "Do you want to signup with " + this.state.phoneNumber + "?", [
						{
							text: 'Ok', onPress: () => {
								this.props.navigation.navigate('SignUp', { phoneNumber: this.state.phoneNumber });
							}
						},
						{
							text: 'Cancel', onPress: () => { }
						}
					]);
				}
				else {
					console.log("Some problem occurred. ", responseData.Message);
				}
			}).catch((error) => {
				console.log("Error Check User Phone: ", error);
				ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
				this.setState({ loader: true });
			});
		}
	}

	forgotPassword = () => {
		console.log("LoginScreen forgotPassword() phoneNumber: ", this.state.phoneNumber);
		if (this.state.phoneNumber != "" && this.state.phoneNumber.length == 10) {
			this.setState({ loader: true });
			fetch(BASE_PATH + Global.FORGOT_PASSWORD_URL, {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					'mobile': this.state.phoneNumber
				})
			}).then((response) => response.json()).then((responseData) => {
				this.setState({ loader: false });
				if (responseData.Success == "Y") {
					this.props.navigation.navigate('OtpVerify', { verifyType: "RESETPASS", inputData: this.state.phoneNumber, codeValue: responseData.Code });
				}
				else if (responseData.Success == "I") {
					//	console.log("User account is not active");
					ToastAndroid
					Alert.alert("", "This account is not active");
				}
				else {
					//	console.log("Some problem occurred. ", responseData.Message);
					Alert.alert("", responseData.Message);
				}
			}).catch((error) => {
				console.log("Error Forgot Password: ", error);
				ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
				this.setState({ loader: false });
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

	checkExistingToken() {
		console.log("LoginScreen checkExistingToken()");
		this.retrieveItem('fcmToken').then((Token) => {
			if (Token != null) {
				console.log("Async fcmToken : ", Token);
				this.setState({ fcmToken: Token });
			}
			else {
				console.log("No Token generated");
				this.checkPermission();
			}
		}).catch((error) => {
			console.log('Promise is rejected with error: ' + error);
		});
	}

	componentDidMount() {
		console.log("LoginScreen componentDidMount()");
		this.checkExistingToken();
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
		this.props.navigation.addListener('didFocus', () => {
			this.setState({ numberstatus: true });
		});
		let navigatedFrom = this.props.navigation.getParam("navigatedFrom");
		//this.registerForPushNotifications();
		console.log("NaviagtedFrom: ", navigatedFrom);
		if (typeof navigatedFrom != 'undefined') {
			this.setState({ navigatedFrom: navigatedFrom });
		}
	}

	render() {
		return (
			<ScrollView contentContainerStyle={[styles.mainContainer, { marginTop: -this.state.change }]}
				keyboardShouldPersistTaps={'always'}
			>
				<View style={styles.upperContainer}>
					<Image source={require('../assets/company-logos/loginPg.jpg')} style={{ width: 150, height: 200 }} />
				</View >
				<View style={{ flex: 1 }} behavior="padding" enabled>
					<View style={styles.middleContainer}>

						{/* Number Field */}

						<Display style={{ flex: 1 }}
							enable={this.state.numberstatus}
							enterDuration={100}
							exitDuration={250}
							exit="fadeOutLeft"
							enter="fadeInLeft"
						>
							<View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
								<Text style={{ color: "#3a3939", fontSize: 17, fontWeight: '800' }}>Verify your mobile number</Text>
								<Text style={{ color: "#706d6d", fontSize: 10 }}>We will send an OTP to your number</Text>
								<Text style={{ color: "#706d6d", fontSize: 12, marginTop: 6 }}>Enter your current active number to get started</Text>
							</View>
							<View style={{ justifyContent: 'center', height: 100, flexDirection: 'row', marginTop: 5, width: Dimensions.get('window').width, paddingHorizontal: 50 }}>
								<View style={{ marginTop: 40 }}>
									<Text style={{ fontSize: 18, fontWeight: 'bold' }}>+91</Text>
								</View>
								<View style={{ width: 200, marginLeft: 5 }}>
									<TextField
										label="Mobile Number"
										// title="NAME"
										placeholderTextColor="#fff"
										underlineColorAndroid='transparent'
										returnKeyType="next"
										maxLength={10}
										fontSize={22}
										returnKeyLabel="next"
										style={{ letterSpacing: 3 }}
										keyboardType="numeric"
										autoCorrect={false}
										autoCapitalize='none'
										onChangeText={ValueHolder => this.getPhoneNumber(ValueHolder)}
										ref={component => this._phoneInput = component}
										onSubmitEditing={() => { this.checklogin(); }}
									/>
								</View>
							</View>

						</Display>

						{/* Password Display	 */}

						<Display style={{ flex: 1 }}
							enable={!this.state.numberstatus}
							enterDuration={100}
							exitDuration={250}
							exit="fadeOutLeft"
							enter="fadeInLeft"
						>
							<View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
								<Text style={{ color: "#3a3939", fontSize: 17, fontWeight: '800' }}>Enter password</Text>
								<Text style={{ color: "#706d6d", fontSize: 10 }}>We are happy to see you again! </Text>
								<Text style={{ color: "#706d6d", fontSize: 12, marginTop: 6 }}>Enter your password to get started</Text>
							</View>
							<View style={{ justifyContent: 'center', alignItems: 'center', height: 100, flexDirection: 'column', marginTop: 5, width: Dimensions.get('window').width, paddingHorizontal: 50 }}>

								<View style={{ width: 200, marginLeft: 5 }}>
									<TextField
										label="Password"
										// title="NAME"
										placeholderTextColor="#fff"
										underlineColorAndroid='transparent'
										returnKeyType="go"
										fontSize={20}
										secureTextEntry={true}
										returnKeyLabel="go"
										style={{ letterSpacing: 3 }}
										keyboardType="default"
										autoCorrect={false}
										autoCapitalize='none'
										onChangeText={PassHolder => this.getPassFunction(PassHolder)}
										ref={component => this._phoneInput = component}
										onSubmitEditing={() => { this.checklogin(); }}
									/>
								</View>
								<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
									<Text style={{ color: '#8e8d8d' }}>Forgot Password ? </Text>
									<TouchableOpacity onPress={this.forgotPassword.bind(this)}>
										<Text style={{ color: '#cd2121' }}> Reset now</Text>
									</TouchableOpacity>
								</View>
							</View>

						</Display>

					</View>
					<TouchableOpacity onPress={this.checklogin} disabled={this.state.disabled} style={{ opacity: (this.state.disabled ? .6 : 1) }}>
						<View style={styles.lowerContainer}>
							<View style={{ backgroundColor: '#cd2121', height: 50, width: Dimensions.get('window').width - 20, justifyContent: 'center', alignItems: 'center' }}>
								<Display enable={this.state.loader} style={{ height: Dimensions.get('window').height, justifyContent: 'center' }}>
									<ActivityIndicator size="small" color="#fff" />
								</Display>
								<Display enable={!this.state.loader} style={{ height: Dimensions.get('window').height, justifyContent: 'center' }}>
									<Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>{this.state.text}</Text>
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
		backgroundColor: '#fff'
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

export default LoginScreen;