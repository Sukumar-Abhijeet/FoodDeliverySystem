import React from 'react';
import {
    Dimensions, TouchableOpacity, View, Image, Picker,
    ImageBackground, StyleSheet, Alert, ScrollView, ToastAndroid, Text,
    AsyncStorage, ActivityIndicator
} from 'react-native';
import Display from 'react-native-display';
import { TextField } from 'react-native-material-textfield';
import Global from '../Urls/Global.js';
import { Call } from 'react-native-openanything';

const BASE_PATH = Global.BASE_PATH;
class ChefRegistrationScreen extends React.Component {
    constructor(props) {
        super(props);
        console.log("Received Phone: ", this.props.navigation.getParam("phoneNumber"));
        this.state = {
            name: '',
            email: '',
            number: '',
            age: '',
            checked: false,
            referral: '',
            loader: false,
            addressType: "",
            address: "",
            profession: "",
            networkRequest: false,
            customerId: '',
            regSuccess: false,
        }
    }


    async retrieveItem(key) {
        console.log("HomeScreen retrieveItem() key: ", key);
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
        console.log("HomeScreen storeItem() key: ", key);
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
        console.log("HomeScreen removeItem() key: ", key);
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    getUserData = () => {
        console.log("ChefRegistrationScreen getUserData()");
        this.retrieveItem('UserData').then((user) => {
            if (user == null) {
                Alert.alert("Please Login to continue Chef Registration.");
            }
            else if (user != null) {
                console.log(user);
                this.setState({ customerId: user.uuid, number: user.CustomerPhone, name: user.CustomerName, email: user.CustomerEmail });
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    componentDidMount() {
        console.log("ChefRegistrationScreen componentDidMount()");
        this.getUserData();
        this.setState({ regSuccess: false })
    }

    registerChef = () => {
        console.log("ChefRegistrationScreen registerChef() : ");
        this.setState({ networkRequest: false });
        if (this.state.customerId != "") {
            if (this.state.number != '' && this.state.name != "" && this.state.email != "" && this.state.address != "" && this.state.age != "" && this.state.addressType != '' && this.state.profession != "") {
                this.setState({ loader: true })
                const formValue = JSON.stringify({
                    'number': this.state.number,
                    'name': this.state.name,
                    'email': this.state.email,
                    'address': this.state.address,
                    'age': this.state.age,
                    'addressType': this.state.addressType,
                    'profession': this.state.profession,
                    'uuid': this.state.customerId,
                })
                console.log("ChefRegistration formValue : ", formValue);
                fetch(BASE_PATH + Global.CHEF_REGISTRATION_URL, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: formValue
                }).then((response) => response.json()).then((responseData) => {
                    if (responseData.Success == 'Y') {
                        ToastAndroid.show('You have been Successfully registered', ToastAndroid.LONG);
                        this.setState({ loader: false, number: '', name: '', email: '', address: '', age: '', addressType: '', profession: '', regSuccess: true });
                        // this.props.navigation.navigate('Tabs');
                    } else {
                        ToastAndroid.show(responseData.message, ToastAndroid.LONG);
                        this.setState({ loader: false })
                    }
                }).catch((error) => {
                    console.log("Error Registering Chefs: ", error);
                    ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
                    this.setState({ networkRequest: true })
                });


            } else {
                ToastAndroid.show("All fields are mandatory ", ToastAndroid.LONG);
            }
        } else {
            Alert.alert("Please Login to continue Chef Registration.");
        }

    }

    render() {
        return (

            <ScrollView contentContainerStyle={[styles.mainContainer, { marginTop: -this.state.change }]}
                keyboardShouldPersistTaps={'always'}
            >
                <View style={styles.upperContainer}>
                    <Text style={{ color: "#3a3939", fontSize: 15, fontWeight: '800' }}>SuperChef Registration</Text>
                    <Text style={{ color: "#706d6d", fontSize: 12 }}>We are looking for home based cooks to partner with us and start earning at zero registration cost.</Text>
                </View>
                <Display style={{ flex: 1 }} enable={!this.state.networkRequest}>
                    <Display enable={!this.state.regSuccess} style={{ flex: 1 }}>
                        <View style={styles.middleContainer} enable={!this.state.regSuccess}>
                            <ScrollView key={'signupInput'} style={styles.formContainer}>
                                <TextField
                                    label="Mobile Number"
                                    value={this.state.number}
                                    placeholderTextColor="#fff"
                                    underlineColorAndroid='transparent'
                                    returnKeyType="next"
                                    keyboardType="default"
                                    autoCorrect={false}
                                    autoCapitalize='none'
                                    onChangeText={(number) => this.setState({ number: number })}
                                    onSubmitEditing={() => { this.nameInput.focus(); }}
                                />
                                <TextField
                                    label="Name"
                                    value={this.state.name}
                                    placeholderTextColor="#fff"
                                    underlineColorAndroid='transparent'
                                    returnKeyType="next"
                                    keyboardType="default"
                                    autoCorrect={false}
                                    autoCapitalize='none'
                                    onChangeText={(name) => this.setState({ name: name })}
                                    ref={(input) => { this.nameInput = input; }}
                                    onSubmitEditing={() => { this.emailInput.focus(); }}
                                />
                                <TextField
                                    label="Email"
                                    value={this.state.email}
                                    placeholderTextColor="#fff"
                                    underlineColorAndroid='transparent'
                                    returnKeyType="next"
                                    keyboardType="default"
                                    autoCorrect={false}
                                    autoCapitalize='none'
                                    onChangeText={(email) => this.setState({ email: email })}
                                    ref={(input) => { this.emailInput = input; }}
                                    onSubmitEditing={() => { this.addressInput.focus(); }}
                                />
                                <TextField
                                    label="Address"
                                    placeholderTextColor="#fff"
                                    underlineColorAndroid='transparent'
                                    returnKeyType="next"
                                    keyboardType="default"
                                    autoCorrect={false}
                                    autoCapitalize='none'
                                    onChangeText={(address) => this.setState({ address: address })}
                                    ref={(input) => { this.addressInput = input; }}
                                    onSubmitEditing={() => { this.residenceInput.focus(); }}
                                />
                                <Picker
                                    selectedValue={this.state.age}
                                    style={{ height: 20, width: 200, marginTop: 20, marginLeft: -5, color: '#9e9e9e' }}
                                    onValueChange={(itemValue, itemIndex) => this.setState({ age: itemValue })}
                                    // ref={(input) => { this.ageInput = input; }}
                                    // onSubmitEditing={() => { this.residenceInput.focus(); }}
                                    returnKeyType="next"
                                >
                                    <Picker.Item label="Choose Age" value="" />
                                    <Picker.Item label="Below 18" value="18" />
                                    <Picker.Item label="18-25" value="25" />
                                    <Picker.Item label="25-40" value="40" />
                                    <Picker.Item label="40-60" value="60" />
                                    <Picker.Item label="Above 60" value="61" />

                                </Picker>

                                <TextField
                                    label="Residence Type : Flat/Villa/House/Bunglow/Hostel/Shared Living"
                                    placeholderTextColor="#fff"
                                    underlineColorAndroid='transparent'
                                    returnKeyType="next"
                                    keyboardType="default"
                                    autoCorrect={false}
                                    autoCapitalize='none'
                                    onChangeText={(residenceType) => this.setState({ addressType: residenceType })}
                                    ref={(input) => { this.residenceInput = input; }}
                                    onSubmitEditing={() => { this.professionInput.focus(); }}
                                />
                                <TextField
                                    label="Profession"
                                    placeholderTextColor="#fff"
                                    underlineColorAndroid='transparent'
                                    returnKeyType="go"
                                    keyboardType="default"
                                    autoCorrect={false}
                                    autoCapitalize='none'
                                    secureTextEntry={false}
                                    onChangeText={(profession) => this.setState({ profession: profession })}
                                    ref={(input) => { this.professionInput = input; }}
                                    onSubmitEditing={() => { this.registerChef(); }}
                                />
                            </ScrollView>
                        </View>
                        <TouchableOpacity onPress={() => this.registerChef()}>
                            <View style={styles.lowerContainer}>
                                <View style={{ backgroundColor: '#cd2121', height: 50, width: Dimensions.get('window').width - 20, justifyContent: 'center', alignItems: 'center' }}>
                                    <Display enable={this.state.loader} style={{ height: Dimensions.get('window').height, justifyContent: 'center' }}>
                                        <ActivityIndicator size="small" color="#fff" />
                                    </Display>
                                    <Display enable={!this.state.loader} style={{ height: Dimensions.get('window').height, justifyContent: 'center' }}>
                                        <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>REGISTER</Text>
                                    </Display>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Display>
                    <Display style={[styles.middleContainer, { justifyContent: 'center', alignItems: 'center' }]} enable={this.state.regSuccess}>
                        <View style={styles.successModal}>
                            <View style={{ flex: 1.5 }}>
                                <ImageBackground resizeMode={"cover"} source={require('../assets/fc.jpg')} style={{ width: "100%", height: 250 }}>
                                    {/* <Image resizeMode={"cover"} source={require('../assets/chefCooking.png')} style={{ width: 30, height: 30 }} /> */}
                                </ImageBackground>
                            </View>
                            <View style={{ flex: 3, padding: 5, backgroundColor: '#f4eff3' }}>
                                <Text style={{ color: '#2dbe60', fontSize: 18, fontWeight: '500' }}>REGISTRATION SUCCESS</Text>
                                <Text style={{ color: '#a8a6a6', fontSize: 10 }}>Your Bawarchi Pass will be generated soon</Text>
                                <Text style={{ color: '#4c4c4c', fontSize: 22, fontWeight: '100', marginTop: 20 }}>WE ARE DELIGHTED</Text>
                                <Text style={{ color: '#4c4c4c', fontSize: 22, fontWeight: '100' }}>TO TAKE YOU ONBOARD.</Text>

                                <Text style={{ marginTop: 10, color: '#6d6c6c', fontSize: 15 }}>We will contact you soon</Text>
                                <TouchableOpacity style={{ padding: 5, alignSelf: 'center', backgroundColor: '#2dbe60', marginTop: 15 }} onPress={() => Call('8339000801')}>
                                    <Text style={{ color: '#fff' }}>Contact Us</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Display>
                </Display>


                <Display enable={this.state.networkRequest} style={styles.networkRequest}>
                    <Image source={require("../assets/networkerror.png")} resizeMode={"center"} style={{ width: 200, height: 200 }} />
                    <Text style={{ marginTop: 3, fontSize: 12, color: '#a39f9f' }}>It seems to be a network error!</Text>
                    <TouchableOpacity style={{ backgroundColor: '#000', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 4, marginTop: 5 }} onPress={() => this.registerChef()}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '400', }}>Retry</Text>
                    </TouchableOpacity>
                </Display>
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
    },
    successModal: {
        flexDirection: 'row', width: '90%',
        height: 250,
    },
    networkRequest: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
});

export default ChefRegistrationScreen;