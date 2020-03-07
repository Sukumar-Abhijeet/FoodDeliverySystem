import React from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity, Image,
    ListView, Share, ActivityIndicator, AsyncStorage
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Display from 'react-native-display';
import ContentLoader from 'react-native-content-loader';
import { Rect } from 'react-native-svg';

const OfferImage = () => <ContentLoader height={150}
    primaryColor='#eeeeee'
    secondaryColor='#fff'
    speed={100}
>

    <Rect x="0" y="0" rx="0" ry="0" height="150" width="300" />


</ContentLoader>
export default class WalletScressn extends React.Component {

    constructor(props) {
        super(props);

        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource1: ds.cloneWithRows(['r1', 'r2', 'r3', 'r4']),
            notificationState: true,
            Money: 0,
            Code: 'BMFBBS',
            Sending: true,
            loadImg: true,
        }
    }
    shareCode = () => {
        this.setState({ Sending: true })
        Share.share(
            {
                title: "Free Meal Invite",
                message: "Hey! I'm inviting you to download BringMyFood, the best food ordering & delivery app. Here's my code " + this.state.Code + " - just enter it while signup and get ₹250 in your wallet. Once you've placed your first order I get ₹250!. Download here http://onelink.to/bmfapp"
                , url: 'http://onelink.to/bmfapp'
            }).then(result => console.log(result)).catch(errorMsg => console.log(errorMsg));
    }
    async retrieveItem(key) {
        console.log("Walletcreen retrieveItem() key: ", key);
        try {
            const retrievedItem = await AsyncStorage.getItem(key);
            const item = JSON.parse(retrievedItem);
            console.log(item)
            return item;

        } catch (error) {
            console.log(error.message);
        }
        return
    }
    componentWillMount() {
        this.setState({ loadImg: true })

        this.retrieveItem('UserData').then((data) => {
            // this.setState({ Items: data.CategoryData,});
            console.log(data.WalletMoney);
            this.setState({ Money: data.WalletMoney, Code: data.CustomerReferralCode.toUpperCase() })
            this.setState({ loadImg: false })

        }).catch((error) => {
            console.log('Promise is rejected with error: ' + error);
        });
    }

    render() {

        return (
            <View style={styles.mainContainer}>
                <View style={styles.upperContainer}>
                    <View style={[styles.upperDesign, { justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }]}>
                        <Icon name="suitcase" size={50} color='#cd2121' />
                        <Text style={{ fontWeight: '300', fontSize: 25, color: '#7c7676' }}>{this.state.Money}</Text>
                    </View>
                    <View style={[styles.upperDesign]}>
                        <View style={styles.textLeftView}><Text style={styles.textLeft}>Validity</Text></View>
                        <View style={styles.textRightView}><Text style={styles.textRight}>Lifetime</Text></View>
                    </View>
                    <View style={[styles.upperDesign]}>
                        <View style={styles.textLeftView}><Text style={styles.textLeft}> Allowed Usage Per Order</Text></View>
                        <View style={styles.textRightView}><Text style={styles.textRight}>10% or ₹25</Text></View>
                    </View>
                    <View style={[styles.upperDesign]}>
                        <View style={styles.textLeftView}><Text style={styles.textLeft}>Usable Next Order</Text></View>
                        <View style={styles.textRightView}><Text style={styles.textRight}> ₹ {(this.state.Money > 0) ? ((this.state.Money < 25) ? (0.1 * this.state.Money) : 25) : 0}</Text></View>
                    </View>

                </View>
                <View style={styles.middleContainer}>
                    <Display enable={this.state.loadImg}>
                        <OfferImage />
                    </Display>

                    <Display enable={!this.state.loadImg}>
                        <Image source={require('../assets/share.png')} style={{ width: 450, height: 150 }} />
                    </Display>


                </View>
                <TouchableOpacity onPress={this.shareCode}>
                    <View style={styles.LowerContainer}>
                        <Icon name='share-alt' color='#fff' size={18} />
                        <Display
                            enable={this.state.Sending}>
                            <Text style={{ fontSize: 16, color: '#fff', fontWeight: '400', marginLeft: 5 }}>SHARE YOUR CODE</Text>
                        </Display>
                        <Display
                            enable={!this.state.Sending}>
                            <ActivityIndicator color='#fff' />
                        </Display>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('TermsAndConditions')}>
                    <Text style={{ fontSize: 14, color: '#cd2121', marginTop: 8, textAlign: 'center' }}>Read Terms & Conditions</Text>
                </TouchableOpacity>
            </View>
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
        padding: 10,
        //  marginTop: Expo.Constants.statusBarHeight,
    },
    upperDesign:
    {
        borderWidth: 1,
        borderRadius: 4,
        padding: 15,
        borderColor: '#c4c2c2',
        flexDirection: 'row',
        marginBottom: 5
    },
    textLeftView:
    {
        flex: 1, justifyContent: 'center', alignItems: 'flex-start'
    },
    textLeft:
    {
        color: '#7f7e7e', fontSize: 14
    },
    textRightView:
    {
        flex: 1, justifyContent: 'center', alignItems: 'flex-end'
    },
    textRight:
    {
        fontWeight: '100', fontSize: 16
    },
    middleContainer:
    {
        height: 150,
        marginTop: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    LowerContainer:
    {
        flexDirection: 'row',
        marginTop: 20,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#cd2121'
    }
});
