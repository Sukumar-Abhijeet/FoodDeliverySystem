import React from 'react';
import { StyleSheet, View, Image, AsyncStorage, ImageBackground, TouchableOpacity, Text, AppState, Dimensions, Linking, ToastAndroid } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Global from '../Urls/Global.js';
import Display from 'react-native-display';
import { registerAppListener } from "./Listener";
import firebase from 'react-native-firebase';

const BASEPATH = Global.BASE_PATH;

class AppLoader extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            appState: '',
            latestVersion: false,
            token: "",
            tokenCopyFeedback: ""
        };
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.log("PresentApp State : ", this.state.appState);
            console.log("NextApp State : ", this.state.nextAppState);
            // this.retrieveItem('ResumeScreen').then((data) => {
            //     if (data == null) {

            //         this.checkHelperScreen();
            //     }
            //     else {
            //         console.log("Data :", data);
            //         // this.props.navigation.navigate('Authentication');
            //     }
            // }).catch((error) => {
            //     console.log('Promise is rejected with error: ' + error);
            // });

        }
        this.setState({ appState: nextAppState });
    }

    async retrieveItem(key) {
        console.log("AppLoader retrieveItem() key: ", key);
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
        console.log("AppLoader storeItem() key: ", key);
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
        console.log("AppLoader removeItem() key: ", key);
        try {
            await AsyncStorage.removeItem(key);
            return true;
        }
        catch (exception) {
            return false;
        }
    }

    checkHelperScreen = () => {
        console.log("AppLoader checkHelperScreen()");
        this.retrieveItem('HelperScreenData').then((data) => {
            if (data == null) {
                this.props.navigation.navigate('Authentication');
            }
            else {
                this.checkLocation();
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    checkKitchenStatus = () => {
        console.log("AppLoader checkKitchenStatus()");
        fetch(BASEPATH + Global.FETCH_KITCHEN_STATUS_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reqFrom: "APP" })
        }).then((response) => response.json()
        ).then((responseData) => {
            let status = "CLOSED";
            if (responseData.Success == "Y") {
                status = responseData.Status;
            }
            console.log("Kitchen Status: ", status);
            this.storeItem("KitchenStatus", status);
            this.checkHelperScreen();
        }).catch((error) => {
            console.log("Error Kitchen Status: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.checkHelperScreen();
        });
    }

    checkLocation = () => {
        console.log("AppLoader checkLocation()");
        this.retrieveItem('Address').then((data) => {
            console.log("AppLoaded checkLocation data : ", data);
            if (data == null) {
                this.props.navigation.navigate('Location');
            }
            else {
                this.checkServicesAvailabilityByLocality(data);
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });

    }

    checkServicesAvailabilityByLocality = (data) => {
        if (data.locCode != "" && typeof data.locCode != 'undefined') {
            console.log("AppLoader checkServicesAvailabilityByLocality() locCode: ", data.locCode);
            fetch(BASEPATH + Global.CHECK_SERVICES_BY_LOCALITY_URL, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ locCode: data.locCode })
            }).then((response) => response.json()).then((responseData) => {
                console.log("AppLoade response locality services: ", responseData);
                data.fAvail = false;
                data.bAvail = false;
                if (responseData.Success == "Y") {
                    data.fAvail = responseData.fAvail;
                    data.bAvail = responseData.bAvail;
                }
                else {
                    ToastAndroid.show(responseData.Message, ToastAndroid.SHORT);
                }
                this.storeItem("Address", data);
                this.props.navigation.navigate('Tabs');
            }).catch((error) => {
                console.log("Error App Version: ", error);
                ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            });
        }
        else {
            this.props.navigation.navigate('Location');
        }
    }

    checkAppVersionCode = () => {
        console.log("AppLoader checkAppVersionCode()");
        let pack = require('../../app.json');
        let appVersion = pack.android.versionCode;
        console.log("Device App VersionCode : ", appVersion);
        fetch(BASEPATH + Global.VERSION_CHECK_URL, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => response.json()).then((responseData) => {
            console.log("Latest App VersionCode", responseData.Version);
            if (appVersion == responseData.Version) {
                this.setState({ latestVersion: false });
                this.checkKitchenStatus();
            }
            else {
                this.setState({ latestVersion: true });
                console.log("New update available. Please update.");
            }
        }).catch((error) => {
            console.log("Error App Version: ", error);
            ToastAndroid.show("We could not find an active internet connection.", ToastAndroid.SHORT);
            this.checkKitchenStatus();
        });

    }

    showLocalNotification() {
        console.log("App.js showLocalNotification()");
        const channel = new firebase.notifications.Android.Channel('BMF-Employee-Info', 'BMF Employee', firebase.notifications.Android.Importance.Max)
            .setDescription('BMF-Employee-Notifications')
            .enableVibration(true)
            .setVibrationPattern([1000, 2000, 2000])
        //.setSound("plucky.mp3");
        firebase.notifications().android.createChannel(channel);

        let notification = new firebase.notifications.Notification();
        notification = notification.setNotificationId(new Date().valueOf().toString())
            .setTitle("Test Notification with action")
            .setBody("Force touch to reply")
            .setSound("bell.mp3")
            .setData({
                key1: 'value1',
                key2: 'value2'
            });
        notification.ios.badge = 10
        notification.android.setAutoCancel(true);

        notification.android.setBigPicture("https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_120x44dp.png", "https://image.freepik.com/free-icon/small-boy-cartoon_318-38077.jpg", "content title", "summary text")
        notification.android.setColor("red")
        notification.android.setColorized(true)
        notification.android.setOngoing(true)
        notification.android.setPriority(firebase.notifications.Android.Priority.High)
        notification.android.setSmallIcon("ic_launcher")
        notification.android.setVibrate([300])
        notification.android.addAction(new firebase.notifications.Android.Action("view", "ic_launcher", "VIEW"))
        notification.android.addAction(new firebase.notifications.Android.Action("dismiss", "ic_launcher", "DISMISS"))
        notification.android.setChannelId("BMF-Channel")

        firebase.notifications().displayNotification(notification)
    }

    scheduleLocalNotification() {
        console.log("App.js scheduleLocalNotification()");
        let notification = new firebase.notifications.Notification();
        notification = notification.setNotificationId(new Date().valueOf().toString())
            .setTitle("Test Notification with action")
            .setBody("Force touch to reply")
            .setSound("bell.mp3")
            .setData({
                key1: 'value1',
                key2: 'value2'
            });
        notification.android.setChannelId("BMF-Channel")
        notification.android.setPriority(firebase.notifications.Android.Priority.High)
        notification.android.setSmallIcon("ic_launcher")

        firebase.notifications().scheduleNotification(notification, { fireDate: new Date().getTime() + 5000 })
    }

    sendRemoteNotification(token) {
        console.log("App.js sendRemoteNotification()");
        let body;
        if (Platform.OS === 'android') {
            body = {
                "to": token,
                "data": {
                    "custom_notification": {
                        "title": "Simple FCM Client",
                        "body": "Click me to go to detail",
                        data: { targetScreen: 'detail' }
                    }
                },
                "priority": 10
            }
        } else {
            body = {
                "to": token,
                "notification": {
                    "title": "Simple FCM Client",
                    "body": "Click me to go to detail",
                    "sound": "default"
                },
                data: {
                    targetScreen: 'detail'
                },
                "priority": 10
            }
        }

        // firebaseClient.send(JSON.stringify(body), "notification");
    }


    componentWillUnmount() {
        console.log("ApploaderScreen componentWillUnmount()");
        AppState.removeEventListener('change', this._handleAppStateChange);
        this.onTokenRefreshListener();
        this.notificationOpenedListener();
        this.messageListener();
        // this.removeItem("CartItems");
    }

    async componentDidMount() {
        console.log("AppLoader componentDidMount()");
        console.log("Apploader Screen Props: ", this.props)
        // const channel = new firebase.notifications.Android.Channel('BMF-Channel-Info', 'BMF User', firebase.notifications.Android.Importance.Max)
        //     .setDescription('BMF-User-Notifications')
        //     .enableVibration(true)
        //     .setVibrationPattern([1000, 2000, 2000])
        //     .setSound("plucky.mp3");
        // firebase.notifications().android.createChannel(channel);

        registerAppListener(this.props.navigation);
        firebase.notifications().getInitialNotification()
            .then((notificationOpen) => {
                if (notificationOpen) {
                    const notif = notificationOpen.notification;
                    // if (notif && notif.targetScreen === 'detail') {
                    //    setTimeout(() => {
                    //       this.props.navigation.navigate('Detail')
                    //    }, 500)
                    // }
                }
            });

        if (!await firebase.messaging().hasPermission()) {
            try {
                await firebase.messaging().requestPermission();
            } catch (e) {
                alert("Failed to grant permission")
            }
        }
        AppState.addEventListener('change', this._handleAppStateChange);
        this.props.navigation.addListener('didFocus', () => { this.checkAppVersionCode(); })

    }

    render() {

        return (
            <ImageBackground source={require('../assets/splash.png')} style={styles.mainContainer}>
                {/* <View style={styles.upperContainer}>
                    <Image source={require('../assets/bringmyfood.png')} style={{ width: 80, height: 80 }} />
                    <Text style={{ color: '#fff', justifyContent: 'center', alignItems: 'center', paddingTop: 10, fontSize: 18 }}>BringMyFood</Text>
                </View > */}
                <Display enable={this.state.latestVersion} style={styles.update}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: '200', color: '#aaa7a7' }}>Please Update To Continue</Text>
                    </View>
                    <TouchableOpacity onPress={() => Linking.openURL("https://play.google.com/store/apps/details?id=in.bringmyfood&hl=en")} style={{ flex: 1, backgroundColor: '#2dbe60', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Update Now</Text>
                    </TouchableOpacity>
                </Display>
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end'
    },
    upperContainer: {
        backgroundColor: 'transparent',
        flex: 9,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    update:
    {
        alignSelf: 'flex-end',
        flexDirection: 'row',
        backgroundColor: '#fff',
        width: Dimensions.get('window').width,
        bottom: 0,
        height: 50
    }
});

export default AppLoader;