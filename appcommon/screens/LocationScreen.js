import React from 'react';
import {
    KeyboardAvoidingView, ToastAndroid, Dimensions, TouchableOpacity, View, Image, StyleSheet, Platform, Alert, ScrollView,
    Text, TextInput, AsyncStorage, ActivityIndicator, PermissionsAndroid
} from 'react-native';
import Display from 'react-native-display';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { TabIcon } from '../vectoricons/TabIcon';
import { TextField } from 'react-native-material-textfield';
import Global from '../Urls/Global';
import Icon from 'react-native-vector-icons/FontAwesome';
import ContentLoader from 'react-native-content-loader';
import { Rect } from 'react-native-svg';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import Geolocation from 'react-native-geolocation-service';
import { Row } from 'native-base';

const BASE_PATH = Global.BASE_PATH;
const BodyIndicator = () => <ContentLoader height={200}
    primaryColor='#ebebeb'
    secondaryColor='#fff'
    speed={100}
>

    <Rect x="37.5" y="26.27" rx="0" ry="0" width="22.2" height="20.72" />
    <Rect x="101.5" y="22.27" rx="0" ry="0" width="135" height="29" />
    <Rect x="5" y="57.27" rx="0" ry="0" width="600" height="30" />
    <Rect x="36.5" y="99.27" rx="0" ry="0" width="135.3" height="124.46" />
    <Rect x="197.5" y="98.27" rx="0" ry="0" width="144" height="126" />
</ContentLoader>
class LocationScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            navigatedFrom: this.props.navigation.getParam("navigatedFrom"),
            permission: false,
            houseno: '',
            street: '',
            isReady: false,
            landmark: '',
            text: 'ENTER HOUSE/FLAT NO.',
            locationstatus: true,
            save: '',
            fetchedAddress: 'Fetching',
            address: {
                label: 'Fetching',
                value: '',
                pincode: '',
                type: ''
            },
            addressType: 'AUTOMATIC',
            disabled: true,
            loader: false,
            tryManual: false,
            error: '',
            mapRegion: {
                latitude: 20.3011504,
                longitude: 85.6803644,
                latitudeDelta: 0.012,
                longitudeDelta: 0.023,
            },
            lastLat: 0,
            lastLong: 0,
            pincodeServiceObject: {},
        }

    }

    async retrieveItem(key) {
        console.log("LocationScreen retrieveItem() key: ", key);
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
        console.log("LocationScreen storeItem() key: ", key);
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
        console.log("LocationScreen removeItem() key: ", key);
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    addMore = () => {
        console.log("LocationScreen addMore()");
        this.setState({ locationstatus: false });
    }

    hideMoreDetails = () => {
        console.log("LocationScreen hideMoreDetails()");
        this.setState({ locationstatus: true });
    }

    fetchAddress() {
        console.log("LocationScreen fetchAddress() MapRegion: ", this.state.mapRegion);
        this.setState({ tryManual: false })
        fetch('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + this.state.mapRegion.latitude + ',' + this.state.mapRegion.longitude + '&key=AIzaSyC4hC-Svfjb89mTn0lMX0wvxPezlxG1uOI')
            .then((response) => response.json())
            .then((responseJson) => {
                console.log("ResponseJSON :", responseJson.status);
                if (responseJson.status == "OK") {
                    let location = responseJson.results[0].address_components;
                    console.log("location", location.length, location);
                    let localityName = "";
                    let localityPincode = "";
                    let cityName = "";
                    let subLocFlag = true;
                    for (let i = 0; i < location.length; i++) {
                        let addressComponentsType = location[i].types;
                        for (let j = 0; j < addressComponentsType.length; j++) {
                            let typeName = addressComponentsType[j];
                            if (typeName == "sublocality_level_2") {
                                localityName = location[i].long_name;
                                subLocFlag = false;
                            }
                            if (typeName == "sublocality_level_1" && subLocFlag) {
                                localityName = location[i].long_name;
                            }
                            if (typeName == "postal_code") {
                                localityPincode = location[i].long_name;
                            }
                            if (typeName == "administrative_area_level_2") {
                                cityName = location[i].long_name;
                            }
                        }
                        if (localityName != "" && localityPincode != "" && cityName != "") {
                            break;
                        }
                    }
                    console.log("Locality : LPincode : cityName : ", localityName, localityPincode, cityName);
                    if (localityName != "" || localityPincode != "" || cityName != "") {
                        console.log("Checking pincode Service ()");
                        this.setState({ permission: true, loader: false, tryManual: false })
                        this.checkPincodeService(localityName, localityPincode);
                    }
                    else {
                        ToastAndroid.show('Unable to detect location properly, try manually or restarting', ToastAndroid.SHORT);
                        this.setState({ loader: false, tryManual: true });
                    }
                }
                else {
                    ToastAndroid.show('Unable to detect location, enter manually', ToastAndroid.SHORT);
                    this.props.navigation.push("LocationSearch", { navigatedFrom: 'Location' });
                    this.setState({ loader: false, tryManual: true });
                }
            }).catch((error) => {
                console.log("Error Location Fetch: ", error);
                ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            });
        this.setState({ loader: false })
    }

    getHouseFunction = (valueHolder) => {
        console.log("LocationScreen getHouseFunction()");
        this.setState({ houseno: valueHolder });
        if (valueHolder.length < 5) {
            this.setState({ text: "ENTER HOUSE/FLAT NO." });
        }
        else {
            if (this.state.street.trim() == "") {
                this.setState({ text: "ENTER STREET NAME" });
            }
            else if (this.state.save.trim() == "") {
                this.setState({ text: "SELECT SAVE AS" });
            }
        }
    }

    getStreetName = (streetname) => {
        console.log("LocationScreen getStreetName()");
        this.setState({ street: streetname });
        if (streetname.length < 5) {
            this.setState({ text: "ENTER STREET NAME" });
        }
        else {
            if (this.state.houseno.trim() == "") {
                this.setState({ text: "ENTER HOUSE/FLAT NO." });
            }
            else if (this.state.save.trim() == "") {
                this.setState({ text: "SELECT SAVE AS" });
            }
        }
    }

    getLandmarkFunction = (lm) => {
        console.log("LocationScreen getLandmarkFunction()");
        this.setState({ landmark: lm });
    }

    saveas = (saveas) => {
        console.log("LocationScreen saveas() saveas: ", saveas);
        this.setState({ save: saveas });
        if (this.state.houseno.trim() != "" && this.state.street.trim() != "" && this.state.save.trim() != "") {
            this.setState({ disabled: false, text: "CONTINUE" });
        }
        else {
            if (this.state.houseno.trim() == "") {
                this.setState({ text: "ENTER HOUSE/FLAT NO." });
            }
            else if (this.state.street.trim() == "") {
                this.setState({ text: "ENTER STREET NAME" });
            }
            if (this.state.save.trim() == "") {
                this.setState({ text: "SELECT SAVE AS" });
            }
        }
    }

    confirmLocation = () => {
        console.log("LocationScreen confirmLocation()");
        let address = {
            houseNo: "", streetName: "", landmark: "", locCode: this.state.pincodeServiceObject.LocCode, locName: this.state.pincodeServiceObject.LocName, cityCode: this.state.pincodeServiceObject.CityCode, cityName: this.state.pincodeServiceObject.CityName,
            pincode: this.state.pincodeServiceObject.Pincode, type: "", latLng: "" + this.state.mapRegion.latitude + "," + this.state.mapRegion.longitude,
            fAvail: this.state.pincodeServiceObject.fAvail, bAvail: this.state.pincodeServiceObject.bAvail
        };
        console.log("Generated Address : ", address);

        if (this.state.fetchedAddress != 'Fetching') {
            this.setState({ loader: true });
            this.storeItem("AddressType", this.state.addressType);
            this.storeItem("Address", address);
            //this.storeItem("Pincode", address.Pincode);
            this.props.navigation.navigate('Tabs');
        }
        else {
            ToastAndroid.show('Please wait while we are detecting location.', ToastAndroid.SHORT);
        }
    }

    modifyAddress = () => {
        console.log("LocationScreen modifyAddress()");
        if (this.state.text == "CONTINUE") {
            this.setState({ loader: true });
            let address = {
                houseNo: this.state.houseno, streetName: this.state.street, landmark: this.state.landmark, locCode: this.state.pincodeServiceObject.LocCode, locName: this.state.pincodeServiceObject.LocName, cityCode: this.state.pincodeServiceObject.CityCode, cityName: this.state.pincodeServiceObject.CityName,
                pincode: this.state.pincodeServiceObject.Pincode, type: this.state.save, latLng: "" + this.state.mapRegion.latitude + "," + this.state.mapRegion.longitude,
                fAvail: this.state.pincodeServiceObject.fAvail, bAvail: this.state.pincodeServiceObject.bAvail
            };
            console.log("Modified Address : ", address);

            /*this.retrieveItem('SavedAddress').then((data) => {
                if (data != null) {
                    data.push(address);
                    this.storeItem("SavedAddress", data);
                }
                else {
                    let addr = [];
                    addr.push(address);
                    this.storeItem("SavedAddress", addr);
                }
            }).catch((error) => {
                console.log('Promise is rejected with error: ' + error);
            });*/

            this.storeItem("AddressType", this.state.addressType);
            this.storeItem("Address", address);
            //this.storeItem("Pincode", address.Pincode);
            this.setState({ loader: false, locationstatus: true });
            this.props.navigation.navigate('Tabs');
        }
        else {
            if (this.state.houseno.trim() == "") {
                this.setState({ text: "ENTER HOUSE/FLAT NO." });
            }
            else if (this.state.street.trim() == "") {
                this.setState({ text: "ENTER STREET NAME" });
            }
            else if (this.state.street.trim() == "") {
                this.setState({ text: "ENTER STREET NAME" });
            }
        }
    }

    checkPincodeService = (localityName, localityPincode) => {
        console.log("LocationScreen checkPincodeService() Pin: ", localityPincode, localityName);
        this.setState({ tryManual: false })
        fetch(BASE_PATH + Global.CHECK_SERVICE_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'pincode': localityPincode,
                'locality': localityName
            })
        }).then((response) => response.json()).then((responseJson) => {
            console.log("pincode service Response: ", responseJson);
            if (responseJson.Success == 'Y') {
                let fetchAddress = responseJson.LocName + ", " + responseJson.CityName + ", " + responseJson.Pincode;
                console.log("New Address : ", fetchAddress);
                this.setState({ fetchedAddress: fetchAddress });
                this.storeItem("ServiceAvailable", "Y");
                this.setState({ pincodeServiceObject: responseJson });
            }
            else {
                this.storeItem("ServiceAvailable", "N");
                this.setState({ fetchedAddress: "We do not serve in this locality", tryManual: true });
            }
            // this.props.navigation.navigate("Tabs");
        }).catch((error) => {
            console.log("Error Pincode Check: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
        });

    }



    changeMarkerPosition() {
        console.log("locationScreen changeMarkerPosition()");
        const duration = 100;
        if (Platform.OS === 'android') {
            if (this.marker) {
                this.marker._component.animateMarkerToCoordinate(
                    this.state.mapRegion,
                    duration
                );
            }
        } else {
            console.log("Platform Change Detected. ");
        }
    }
    onRegionChange(region) {
        console.log("Region Change detected : ", region);
        this.setState({
            mapRegion: {
                latitude: region.latitude,
                longitude: region.longitude,
                latitudeDelta: region.latitudeDelta,
                longitudeDelta: region.longitudeDelta
            },
        }, () => { this.fetchAddress(); });
    }


    checkNavigation = () => {
        console.log("Navigated From", this.state.navigatedFrom);
        if (this.state.navigatedFrom == "LocationSearchScreen") {
            this.setState({
                loader: true,
            }, () => { this.autoDetect(); });

        }
    }

    autoDetect = () => {
        console.log("LocationScreen autoDetect()");
        this.setState({ loader: true });
        Geolocation.getCurrentPosition((position) => {
            var position = position.coords;
            console.log("Position: ", position);
            this.setState({
                mapRegion: {
                    latitude: position.latitude,
                    longitude: position.longitude,
                    latitudeDelta: 0.0092,
                    longitudeDelta: 0.0042
                },
            }, () => { this.fetchAddress(); });
        }, (error) => {
            this.setState({ loader: false })
            if (error.message == "No location provider available.") {
                LocationServicesDialogBox.checkLocationServicesIsEnabled({
                    message: "<h2 style='color: #0af13e'>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
                    ok: "YES",
                    cancel: "NO",
                    enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
                    showDialog: true, // false => Opens the Location access page directly
                    openLocationServices: true, // false => Directly catch method is called if location services are turned off
                    preventOutSideTouch: false, // true => To prevent the location services window from closing when it is clicked outside
                    preventBackClick: true, // true => To prevent the location services popup from closing when it is clicked back button
                    providerListener: false // true ==> Trigger locationProviderStatusChange listener when the location state changes
                }).then(function (success) {
                    console.log(success); // success => {alreadyEnabled: false, enabled: true, status: "enabled"}
                }).catch((error) => {
                    console.log(error.message); // error.message => "disabled"
                })
            } else {
                alert("Error: " + error.message)
            }
        },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }

    async checkLocationPermissions() {
        console.log("LocationScreen checkLocationPermissions()");
        try {
            if (Platform.OS === 'android') {
                console.log("Platform is ANDROID");
                const granted = await PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                )
                console.log("Permission for location : ", granted);
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    // console.log("You can use the camera")
                } else {
                    console.log("Requesting Permission for location");
                    PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                        {
                            'title': 'Cool Photo App Camera Permission',
                            'message': 'Cool Photo App needs access to your camera ' +
                                'so you can take awesome pictures.'
                        }
                    )
                }
            }

        } catch (err) {
            console.warn(err)
        }
    }

    componentWillMount() {
        console.log("LocationScreen componentWillMount()");
        this.checkLocationPermissions();
        // await Expo.Font.loadAsync({
        //     'Roboto': require('native-base/Fonts/Roboto.ttf'),
        //     'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
        // });
        this.setState({ isReady: true });
    }

    componentDidMount() {
        console.log("LocationScreen componentDidMount()");
        this.props.navigation.addListener('didFocus', () => { this.checkNavigation(); this.setState({ loader: false }) })
    }

    componentWillUnmount() {
        console.log("LocationScreen componentWillUnmount()");
        //Geolocation.clearWatch(this.watchID)
    }

    render() {
        if (!this.state.isReady) {
            return (
                <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                    {/* <BodyIndicator /> */}
                    <Image source={require('../assets/mascot.jpg')} />
                </View>

            )
        }

        return (

            <View style={styles.mainContainer}>
                <Display style={{ flex: 1 }} enable={this.state.permission}>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.mapContainer}
                        region={this.state.mapRegion}
                        showsUserLocation={true}
                        followUserLocation={true}
                        onRegionChangeComplete={this.onRegionChange.bind(this)}
                    // annotations={markers}
                    // onRegionChange={this.onRegionChange.bind(this)}
                    // onPress={this.onMapPress.bind(this)}
                    >
                        {/* 
                        <MapView.Marker
                            image={require('../assets/marker.png')}
                            coordinate={this.state.mapRegion}
                            style={{ position: 'absolute' }}
                            draggable={false}
                            ref={marker => { this.marker = marker }}
                        // onDragEnd={
                        //     (position) => {
                        //         console.log("Drag Working")
                        //         var position = position.nativeEvent.coordinate;
                        //         this.setState({
                        //             mapRegion: {
                        //                 latitude: position.latitude,
                        //                 longitude: position.longitude,
                        //                 latitudeDelta: 0.0092,
                        //                 longitudeDelta: 0.0042
                        //             }
                        //         }, () => {
                        //             this.fetchAddress();
                        //         });
                        //     }
                        // }
                        >
                        </MapView.Marker> */}
                    </MapView>
                    <View style={styles.markerFixed}>
                        <Image source={require('../assets/marker.png')} style={styles.marker} />
                    </View>
                    <Display enable={this.state.locationstatus}
                        enterDuration={100}
                        exitDuration={250}
                        exit="fadeOutUp"
                        enter="fadeInUp" style={styles.detailsContainer}>
                        <View style={{ flex: 2, marginBottom: 10 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Set Delivery Location</Text>
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ fontSize: 10, color: '#9b9ba2' }}>LOCATION</Text>
                                <View style={{ paddingTop: 8, paddingBottom: 4, borderBottomColor: '#969696', borderBottomWidth: 1, }}>
                                    <Text style={{ color: (this.state.fetchedAddress == "We do not serve in this locality" ? "#cd2121" : '#c9c9cc') }}>{this.state.fetchedAddress}</Text>
                                </View>

                                {/* <TextInput
                                    style={{ marginTop: 0, paddingBottom: 10, marginBottom: 10 }}
                                    // title="NAME"
                                    value={this.state.fetchedAddress}
                                    multiline={true}
                                    editable={false}
                                    placeholderTextColor={}
                                    underlineColorAndroid='#a09d9d'
                                    ref={component => this._phoneInput = component}
                                /> */}
                            </View>
                        </View>
                        <View
                            style={{ flex: 2, flexDirection: 'row', marginTop: 5 }}>
                            <Display enable={!this.state.tryManual} style={{ flexDirection: 'row', flex: 1 }}>
                                <View style={{ flex: 2, flexDirection: 'column', marginRight: 5, }}>
                                    <TouchableOpacity onPress={this.addMore} disabled={this.state.tryManual} opacity={(this.state.tryManual === "true" ? .5 : 1)}>
                                        <View style={{ borderColor: '#cd2121', borderWidth: 2, height: 50, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: '#cd2121', fontSize: 15, fontWeight: 'bold' }}>ADD DETAILS NOW</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 10, color: '#9b9ba2', marginLeft: 40, marginTop: 5 }}>for faster checkout</Text>
                                </View>
                                <View style={{ flex: 2, flexDirection: 'column', marginLeft: 5 }}>
                                    <TouchableOpacity onPress={this.confirmLocation} disabled={this.state.tryManual}>
                                        <View style={{ backgroundColor: '#cd2121', height: 50, justifyContent: 'center', alignItems: 'center' }}>
                                            <Display enable={this.state.loader} style={{ height: Dimensions.get('window').height, justifyContent: 'center' }}>
                                                <ActivityIndicator size="small" color="#fff" />
                                            </Display>
                                            <Display enable={!this.state.loader} style={{ height: Dimensions.get('window').height, justifyContent: 'center' }}>
                                                <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>ADD DETAILS LATER</Text>
                                            </Display>

                                        </View>
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 10, color: '#9b9ba2', marginLeft: 30, marginTop: 5 }}>to quickly see your food!</Text>
                                </View>
                            </Display>
                            <Display enable={this.state.tryManual} style={{ height: 40 }}>
                                <TouchableOpacity style={{
                                    flex: 1, padding: 10, justifyContent: 'center', alignItems: 'center',
                                    width: Dimensions.get('window').width - 40, backgroundColor: '#cd2121', borderRadius: 4
                                }} onPress={() => this.props.navigation.navigate('LocationSearch')}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>ENTER MANUALLY</Text>
                                </TouchableOpacity>
                            </Display>
                        </View>
                    </Display>
                    <Display enable={!this.state.locationstatus}
                        enterDuration={100}
                        exitDuration={250}
                        exit="fadeOutUp"
                        enter="fadeInUp" style={styles.detailsContainer2}>
                        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: "row" }}>
                                    <View style={{ flex: 9 }}>
                                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Add Details</Text>
                                    </View>
                                    <TouchableOpacity onPress={this.hideMoreDetails}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 15, color: '#5e8fd1', fontWeight: '200' }}>SKIP </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text style={{ fontSize: 10, color: '#9b9ba2' }}>LOCATION </Text>
                                    <TextInput
                                        style={{ marginTop: 0, paddingBottom: 10 }}
                                        // title="NAME"
                                        value={this.state.fetchedAddress}
                                        multiline={true}
                                        editable={false}
                                        placeholderTextColor="#fff"
                                        underlineColorAndroid='#a09d9d'
                                        ref={component => this._phoneInput = component}
                                    />
                                </View>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <TextField
                                        label="HOUSE/FLAT NO"
                                        placeholderTextColor="#fff"
                                        underlineColorAndroid='transparent'
                                        returnKeyType="next"
                                        keyboardType="default"
                                        autoCorrect={false}
                                        autoCapitalize='none'
                                        onChangeText={houseno => this.getHouseFunction(houseno)}
                                        ref={component => this._phoneInput = component}
                                    />

                                    <TextField
                                        label="STREET NAME"
                                        placeholderTextColor="#fff"
                                        underlineColorAndroid='transparent'
                                        returnKeyType="next"
                                        keyboardType="default"
                                        autoCorrect={false}
                                        autoCapitalize='none'
                                        onChangeText={streetname => this.getStreetName(streetname)}
                                        ref={component => this._phoneInput = component}
                                    />

                                    <TextField
                                        label="LANDMARK"
                                        placeholderTextColor="#fff"
                                        underlineColorAndroid='transparent'
                                        returnKeyType="next"
                                        keyboardType="default"
                                        autoCorrect={false}
                                        autoCapitalize='none'
                                        onChangeText={landmark => this.getLandmarkFunction(landmark)}
                                        ref={component => this._phoneInput = component}
                                    />
                                    <Text style={{ fontSize: 14, color: '#9b9ba2' }}>SAVE AS</Text>
                                    <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingTop: 5 }}>
                                        <TouchableOpacity onPress={this.saveas.bind(this, "HOME")}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <TabIcon
                                                    iconDefault='ios-home-outline'
                                                    size={16}
                                                    opacity={.6}
                                                /><Text style={{ fontSize: 16, color: (this.state.save == "HOME") ? '#000' : '#b3b3b5', marginBottom: 2, marginLeft: 2 }}>Home</Text>
                                            </View>
                                        </TouchableOpacity >
                                        <TouchableOpacity onPress={this.saveas.bind(this, "OFFICE")}>
                                            <View style={{ flexDirection: 'row', marginLeft: 60, marginRight: 60 }}>
                                                <TabIcon size={16} iconDefault='ios-briefcase-outline' /><Text style={{ fontSize: 16, color: (this.state.save == "OFFICE") ? '#000' : '#b3b3b5', marginBottom: 2, marginLeft: 2 }}>Office</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={this.saveas.bind(this, "OTHERS")}>
                                            <View style={{ flexDirection: 'row' }}>
                                                <TabIcon size={16} iconDefault='ios-cube-outline' /><Text style={{ fontSize: 16, color: (this.state.save == "OTHERS") ? '#000' : '#b3b3b5', marginBottom: 2, marginLeft: 2 }}>Other</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                                <TouchableOpacity onPress={this.modifyAddress} style={{ opacity: (this.state.disabled ? .7 : 1) }}>
                                    <View style={styles.lowerContainer}>
                                        <View style={{ backgroundColor: '#cd2121', height: 50, width: Dimensions.get('window').width, justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold' }}>{this.state.text}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>

                    </Display>
                </Display>
                <Display style={styles.permissionContainer} enable={!this.state.permission}
                    enterDuration={10}
                    exitDuration={250}
                    exit="fadeOutUp"
                    enter="fadeInUp"
                >
                    <View style={{ flex: 8 }}>
                        <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center', }}>
                            <Text style={{ color: '#57585a', fontSize: 28, fontWeight: 'bold' }}>We Need Your </Text>
                            <Text style={{ color: '#57585a', fontSize: 28, fontWeight: 'bold' }}> Location</Text>
                            <Text style={{ color: '#919294', fontSize: 12, }}>we will locate the best available </Text>
                            <Text style={{ color: '#919294', fontSize: 12, }}> dishes and chefs near you.</Text>
                        </View>
                        <View style={{ height: 200, alignItems: 'center', justifyContent: 'center', marginTop: 15, }}>
                            <Image source={require('../assets/locationpermission.jpg')} style={{ height: 250, width: 250 }} resizeMode={'contain'} />
                        </View>
                        <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center', }}>
                            <Text style={{ color: '#7f7f81', fontSize: 12, fontWeight: '300' }}>Your location will be used </Text>
                            <Text style={{ color: '#7f7f81', fontSize: 12, fontWeight: '300' }}> only while using the app.</Text>
                        </View>
                    </View>

                    <View style={styles.modalBox}>
                        <TouchableOpacity style={{
                            flex: 1, padding: 10, justifyContent: 'center', alignItems: 'center',
                            width: Dimensions.get('window').width - 40
                        }} onPress={() => this.props.navigation.navigate('LocationSearch')}>
                            <Text style={{ color: '#cd2121', fontWeight: 'bold' }}>ENTER MANUALLY</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={{ marginTop: 14, paddingHorizontal: 15, paddingVertical: 15, width: Dimensions.get('window').width - 60, borderRadius: 8, backgroundColor: '#cd2121', justifyContent: 'center', alignItems: 'center', marginBottom: 25, }} onPress={() => { this.setState({ loader: true }, () => { this.autoDetect() }) }} disabled={this.state.loader}>
                            <Display enable={this.state.loader} style={{ justifyContent: 'center' }}>
                                <ActivityIndicator size="small" color="#fff" />
                            </Display>
                            <Display enable={!this.state.loader} style={{ justifyContent: 'center' }}>
                                <View style={{ flexDirection: 'row', width: Dimensions.get("window").width, justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name="crosshairs" color={'#fff'} size={16} />
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 5 }}>Auto Detect</Text>
                                </View>
                            </Display>
                        </TouchableOpacity>
                    </View>
                </Display>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        width: null,
        height: null,
        backgroundColor: '#fff',
        //marginTop: Expo.Constants.statusBarHeight,
    },
    mapContainer:
    {
        flex: 7,
        width: Dimensions.get('window').width,
        alignItems: 'center',
        justifyContent: 'center'
    },
    detailsContainer:
    {
        flex: 3,
        padding: 15
    },
    detailsContainer2:
    {
        flex: 10,
        padding: 15,
        paddingBottom: 0

    },
    lowerContainer:
    {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff'
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center'
    },
    modalBox: {
        width: Dimensions.get('screen').width,
        flex: 2,
        justifyContent: 'center', alignItems: 'center',

    },
    markerFixed: {
        left: '50%',
        //backgroundColor: 'blue',
        marginLeft: -10,
        marginTop: -50,
        position: 'absolute',
        top: (0.7 * Dimensions.get('window').height) / 2,
    },
    marker: {
        height: 35,
        width: 20
    },
});

export default LocationScreen;