import React from 'react';
import {
    StyleSheet, Text, View, Image, ListView,
    ScrollView, ActivityIndicator, Dimensions, TouchableOpacity, AsyncStorage
} from 'react-native';
import Display from 'react-native-display';
import Icon from 'react-native-vector-icons/FontAwesome';
import Global from '../Urls/Global';
const BASE_PATH = Global.BASE_PATH;

export default class NotificationScreen extends React.Component {

    constructor(props) {
        super(props);

        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource1: ds.cloneWithRows([]),
            notificationsArr: [],
            notificationState: false,
            customerId: "0",
            loader: true
        }
    }

    async retrieveItem(key) {
        console.log("NotificationScreen retrieveItem() key: ", key);
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
        console.log("NotificationScreen storeItem() key: ", key);
        try {
            var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
            return jsonOfItem;
        }
        catch (error) {
            console.log(error.message);
        }
    }

    getUserData = () => {
        console.log("NotificationScreen getUserData()");
        this.retrieveItem('UserData').then((user) => {
            console.log(user)
            if (user == null) {
                this.setState({ loader: false })
            }
            if (user != null) {
                this.setState({ customerId: user.uuid });
                this.fetchNotifications();
            }
        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    fetchNotifications = () => {
        console.log("NotificationScreen fetchNotifications() customerId: ", this.state.customerId);
        let date = new Date();
        let dateStr = date.getFullYear() + "-" + (((date.getMonth() + 1) > 9) ? (date.getMonth() + 1) : ("0" + (date.getMonth() + 1))) + "-" + ((date.getDate() > 9) ? date.getDate() : ("0" + date.getDate())) + " " + ((date.getHours() > 9) ? date.getHours() : ("0" + date.getHours())) + ":" + ((date.getMinutes() > 9) ? date.getMinutes() : ("0" + date.getMinutes())) + ":" + ((date.getSeconds() > 9) ? date.getSeconds() : ("0" + date.getSeconds()));
        console.log("dateStr: ", dateStr);
        this.retrieveItem('NotificationsData').then((dataArr) => {
            this.setState({ loader: false })
            if (dataArr != null) {
                const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
                this.setState({ notificationsArr: dataArr, dataSource1: ds.cloneWithRows(dataArr) });
            }
            fetch(BASE_PATH + Global.FETCH_NOTIFICATION_URL, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "uuid": this.state.customerId,
                    "date": dateStr
                })
            }).then((response) => response.json()).then((responseJson) => {
                responseJson.Date = dateStr;
                if (responseJson.Success == "Y") {
                    this.setState({ notificationState: true })
                    if (dataArr != null) {
                        dataArr = responseJson.Data.concat(dataArr);
                    }
                    else {
                        dataArr = responseJson.Data;
                    }
                    this.storeItem("NotificationsData", dataArr);
                    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
                    this.setState({ notificationsArr: dataArr, dataSource1: ds.cloneWithRows(dataArr) });
                }
                else {
                    this.setState({ notificationState: false })
                }

            });
        });
    }

    getTimeString = (data) => {
        let date = new Date(data.NotificationDate);
        let currentDate = new Date();
        let timeDiff = (currentDate.getTime() - date.getTime()) / 1000 * 60;
        if (timeDiff < 2) {
            return "Just Now";
        }
        else if (timeDiff < 56) {
            return timeDiff + " mins ago";
        }
        return data.NotificationFDate;
    }

    componentDidMount() {
        console.log("NotificationScreen componentDidMount()");
        this.getUserData();
    }



    render() {

        return (
            <View style={styles.mainContainer}>
                <Display enable={this.state.loader} style={{ height: Dimensions.get('window').height, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#cd2121" />
                </Display>
                <Display enable={!this.state.loader} style={{ flex: 1 }}>
                    <Display enable={this.state.notificationState} style={{ flex: 1 }}>
                        <ScrollView>

                            <ListView
                                enableEmptySections={true}
                                dataSource={this.state.dataSource1}
                                renderRow={(data) =>
                                    <TouchableOpacity style={styles.notificationContainer}>
                                        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 6 }}>
                                            <Icon name="bell" size={20} color="#cd2121" />
                                        </View>
                                        <View style={{ flex: 8 }}>
                                            <Text style={{ fontWeight: '500', fontSize: 16 }}>{data.NotificationTitle}</Text>
                                            <Text style={{ fontSize: 15, color: '#777676' }}>{data.NotificationMessage}</Text>
                                            <Text style={{ fontSize: 9, color: '#8e8e8e' }}>{data.NotificationFDate}</Text>
                                        </View>
                                    </TouchableOpacity>
                                } />

                        </ScrollView>
                    </Display>
                    <Display enable={!this.state.notificationState} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#ebebeb', justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={require('../assets/nonotificatio.png')} style={{ width: 80, height: 80 }} />
                        </View>
                        <Text style={{ fontSize: 14, color: '#a8a4a4', marginTop: 5 }}>No New Notifications </Text>
                        {/* <Text style={{ fontSize: 18, marginTop: 5 }}>Start Typing To Search</Text> */}
                    </Display>
                </Display>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    mainContainer:
    {
        flex: 1,
        backgroundColor: '#fff',
        flexDirection: 'column',
        padding: 0,
        // marginTop: Expo.Constants.statusBarHeight,
    },
    notificationContainer:
    {
        flexDirection: 'row',
        backgroundColor: '#ebebeb',
        width: Dimensions.get("window").width,
        padding: 10,
        borderBottomColor: '#adabab',
        borderBottomWidth: 1
    },

});