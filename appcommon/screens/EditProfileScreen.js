import React from 'react';
import {
    StyleSheet, Alert, Text, View, BackHandler, Keyboard, Image, ImageBackground, ListView, ScrollView, RefreshControl, ActivityIndicator, Dimensions, TouchableOpacity, AsyncStorage
} from 'react-native';
import Display from 'react-native-display';
import { TextField } from 'react-native-material-textfield';
import CircleCheckBox, { LABEL_POSITION } from 'react-native-circle-checkbox';
import HeaderImageScrollView, { TriggeringView } from 'react-native-image-header-scroll-view';
import Global from '../Urls/Global';

const BASE_PATH = Global.BASE_PATH;

export default class EditProfileScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            firstname: "",
            lastname: "",
            gender: "",
            password: "",
            phoneNumber: "",
            emailAddress: "youremail@example.com",
            customerId: "",
            userData: "",
            emailEditable: false,
            editPasswordField: true,
            currentPassword: "",
            disabled: true,
            changeBtnText: "Enter Current Password"
        }

    }
    _keyboardDidShow = () => {
        this.setState({ change: 280 })
        // Alert.alert("Working");
    }

    _keyboardDidHide = () => {
        this.setState({ change: 0 })
        // Alert.alert("Working");
    }
    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }


    async retrieveItem(key) {
        console.log("EditProfileScreen retrieveItem() key: ", key);
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
        console.log("EditProfileScreen storeItem() key: ", key);
        try {
            var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
            return jsonOfItem;
        }
        catch (error) {
            console.log(error.message);
        }
    }

    getUserData = () => {
        console.log("EditProfileScreen getUserData()");
        this.retrieveItem('UserData').then((user) => {
            console.log("USer", user)
            if (user != null) {
                let firstName = "";
                let lastName = "";
                if (user.CustomerName.lastIndexOf(" ") !== -1) {
                    firstName = user.CustomerName.substring(0, user.CustomerName.lastIndexOf(" "));
                    lastName = user.CustomerName.substring(user.CustomerName.lastIndexOf(" ") + 1, user.CustomerName.length);
                }
                else {
                    firstName = user.CustomerName;
                    lastName = user.CustomerName;
                }
                let gender = "M";
                if (user.CustomerGender != "" && user.CustomerGender != null) {
                    gender = user.CustomerGender;
                }
                this.setState({
                    userData: user,
                    firstname: firstName,
                    lastname: lastName,
                    gender: gender,
                    password: "",
                    phoneNumber: user.CustomerPhone,
                    emailAddress: user.CustomerEmail,
                    emailEditable: (user.CustomerEmail == ""),

                    customerId: user.CustomerId,
                    change: 0
                });
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    checkGender = (checked, gender) => {
        console.log("EditProfileScreen checkGender() checked: ", checked, " && gender: ", gender);
        this.setState({ gender: gender });
    }

    getCurrentPassword = (password) => {
        console.log("EditProfileScreen getCurrentPassword() password: ", password);
        if (password.length > 0) {
            this.setState({ disabled: false, currentPassword: password, changeBtnText: 'Save the changes' });
        }
        else {
            this.setState({ disabled: true, currentPassword: "", changeBtnText: "Enter Current Password" });
        }
    }

    saveChanges = () => {
        console.log("EditProfileScreen saveChanges() state: ", this.state);
        let body = JSON.parse(JSON.stringify(this.state));
        delete body["phoneNumber"];
        delete body["userData"];
        delete body["genderUpdate"];
        console.log("body: ", body);
        let formValue = JSON.stringify(body);
        if (body.firstname == "" || body.lastname == "" || (body.emailEditable && body.emailAddress == "")) {
            Alert.alert("", "First Name, Last Name, Email ID are mandatory fields.");
        }
        else {
            Alert.alert("Save Changes", "Do you want to save the changes?", [
                {
                    text: 'OK', onPress: () => {
                        fetch(BASE_PATH + Global.SAVE_PROFILE_CHANGES_URL, {
                            method: "POST",
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: formValue
                        }).then((response) => response.json()).then((responseJson) => {
                            if (responseJson.Success == 'Y') {
                                let ud = this.state.userData;
                                ud.CustomerName = body.firstname + " " + body.lastname;
                                ud.CustomerGender = body.gender;
                                ud.CustomerEmail = body.emailAddress;
                                this.storeItem("UserData", ud);
                                this.setState({ userData: ud });
                                Alert.alert("Save Changes", "Profile updated.");
                            }
                            else {
                                Alert.alert("", responseJson.Message);
                            }
                        });
                    }
                },
                {
                    text: 'Cancel', onPress: () => { }
                }
            ]);
        }
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }
    componentWillMount() {
        console.log("EditProfileScreen componentWillMount()");
        this.getUserData();

    }

    passwordChange = () => {
        Alert.alert('Enter Current Password To change');
        this.setState({ editPasswordField: true })
    }

    render() {

        return (
            <HeaderImageScrollView
                style={{ marginBottom: this.state.change }}
                maxHeight={200}
                minHeight={60}
                headerImage={require('../assets/company-logos/background.jpg')}
                fadeOutForeground={true}
                foregroundParallaxRatio={-1}
                renderHeader={() =>
                    <View style={{ backgroundColor: '#fff' }}>
                        <Text style={{ fontSize: 20 }}>Edit Profile</Text>
                    </View>
                }
                renderForeground={() => (
                    <View style={{ height: 150, justifyContent: 'center', alignItems: 'center', marginTop: 10, paddingTop: 15 }}>
                        <TouchableOpacity onPress={() => console.log('tap!!')}>
                            <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                                <Display enable={this.state.gender == 'F'}>
                                    <Image source={require('../assets/app-images/girl.png')} style={{ width: 80, height: 80 }} />
                                </Display>
                                <Display enable={this.state.gender == 'M'}>
                                    <Image source={require('../assets/app-images/boy.png')} style={{ width: 80, height: 80 }} />
                                </Display>
                            </View>
                        </TouchableOpacity>
                        <Text style={{ fontSize: 16, color: '#fff', marginTop: 5, fontWeight: '300' }}>Edit Profile</Text>
                    </View>
                )}
            >
                <View style={{ width: Dimensions.get('window').width, borderRadius: 4, backgroundColor: '#ebebeb' }}>
                    {/* <TriggeringView onHide={() => console.log('text hidden')} >
            <Text>Scroll Me!</Text>
          </TriggeringView> */}
                    <View style={{ width: Dimensions.get('window').width, justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
                        <Text>Basic Details</Text>
                    </View>
                    <View style={styles.detailContainer}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 2, padding: 5 }}>
                                <TextField
                                    label="First Name"
                                    editable={true}
                                    value={this.state.firstname}
                                    placeholderTextColor="#fff"
                                    underlineColorAndroid='transparent'
                                    returnKeyType="next"
                                    keyboardType="default"
                                    autoCorrect={false}
                                    autoCapitalize='none'
                                    onChangeText={(firstname) => this.setState({ firstname })}
                                    ref={component => this._phoneInput = component}
                                />
                            </View>
                            <View style={{ flex: 2, padding: 5 }}>
                                <TextField
                                    label="Last Name"
                                    editable={true}
                                    value={this.state.lastname}
                                    placeholderTextColor="#fff"
                                    underlineColorAndroid='transparent'
                                    returnKeyType="next"
                                    keyboardType="default"
                                    autoCorrect={false}
                                    autoCapitalize='none'
                                    onChangeText={(lastname) => this.setState({ lastname })}
                                    ref={component => this._phoneInput = component}
                                />
                            </View>
                        </View>
                        <View style={{ padding: 5 }}>
                            <View>
                                <Text>Gender</Text>
                                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                                    <CircleCheckBox
                                        key={'M'}
                                        checked={'M' == this.state.gender}
                                        color="#cd2121"
                                        onToggle={(checked) => this.checkGender(checked, "M")}
                                        label='Male'
                                    />
                                    <CircleCheckBox
                                        key={'F'}
                                        checked={'F' == this.state.gender}
                                        color="#cd2121"
                                        onToggle={(checked) => this.checkGender(checked, "F")}
                                        label='Female'
                                    />
                                </View>
                                {/* <View style={styles.upperContainer}>
                                    <View style={{ flex: 8 }}>
                                        <TextField
                                            label="Password"
                                            editable={this.state.editPasswordField}
                                            secureTextEntry={true}
                                            placeholderTextColor="#fff"
                                            underlineColorAndroid='transparent'
                                            returnKeyType="next"
                                            keyboardType="default"
                                            autoCorrect={false}
                                            autoCapitalize='none'
                                            onChangeText={(password) => this.setState({ password })}
                                            ref={component => this._phoneInput = component}
                                        />
                                        <Text style={{ fontSize: 8, color: '#9b9b9b' }}>Just Type New Password To Change</Text>
                                    </View>
                                    <TouchableOpacity style={styles.applybutton} onPress={this.passwordChange}>
                                        <View style={{ backgroundColor: '#cd2121', padding: 5 }}>
                                            <Text style={{ fontSize: 14, color: '#fff' }}>Change</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View> */}
                            </View>
                        </View>
                        <View>
                        </View>
                    </View>
                    <View style={{ width: Dimensions.get('window').width, justifyContent: 'center', alignItems: 'center' }}>
                        <Text>Contact Details</Text>
                    </View>
                    <View style={styles.detailContainer}>
                        <View style={{ padding: 5 }}>
                            <TextField
                                label="Phone Number"
                                editable={false}
                                value={this.state.phoneNumber}
                                placeholderTextColor="#fff"
                                textColor='#9b9b9b'
                                underlineColorAndroid='transparent'
                                returnKeyType="next"
                                keyboardType="default"
                                autoCorrect={false}
                                autoCapitalize='none'
                                onChangeText={(phoneNumber) => this.setState({ phoneNumber })}
                                ref={component => this._phoneInput = component}
                            />
                            <TextField
                                label="Email ID"
                                editable={this.state.emailEditable}
                                value={this.state.emailAddress}
                                placeholderTextColor="#fff"
                                underlineColorAndroid='transparent'
                                textColor='#9b9b9b'
                                returnKeyType="next"
                                keyboardType="default"
                                autoCorrect={false}
                                autoCapitalize='none'
                                onChangeText={(emailAddress) => this.setState({ emailAddress })}
                                ref={component => this._phoneInput = component}
                            />
                        </View>
                    </View>
                    <TouchableOpacity onPress={this.saveChanges.bind(this)}>
                        <View style={styles.call}>
                            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '200' }}>Save Changes</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </HeaderImageScrollView>
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
        flexDirection: 'column',
        padding: 0,
        // marginTop: Expo.Constants.statusBarHeight,
    },
    upperContainer:
    {

        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: '#fff',

    },
    applybutton:
    {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2
    },
    detailContainer:
    {
        flexDirection: 'column',
        padding: 10,
        margin: 10,
        marginBottom: 5,
        borderRadius: 4,
        backgroundColor: '#fff', shadowColor: '#000',
        shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2,
    },
    call:
    {
        backgroundColor: '#cd2121', marginTop: 20, justifyContent: 'center'
        , alignItems: 'center', padding: 15
    },
    modalContent: {
        height: Dimensions.get('window').height / 2 + 20,
        backgroundColor: 'white',
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    }
});
