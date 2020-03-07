import React from 'react';
import {
    StyleSheet, Text, View, Image, ListView, ScrollView, TouchableOpacity,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

export default class OrderSummaryScreen extends React.Component {

    constructor(props) {
        super(props);

        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource1: ds.cloneWithRows(['r1', 'r2', 'r3', 'r4']),
            orderDetails: this.props.navigation.getParam("orderData"),
            name: '',
            phone: '',
            address: '',
            orderid: '',
            orderdate: '',
            totalamount: 0,
            packgingcharge: 0,
            deliverycharge: 0,
            couponsave: 0,
            walletdeduction: 0,
            orderprice: 0,
            paymentmode: ""
        }

    }

    fetchOrderDetails() {
        console.log("OrderSummaryScreen fetchOrderDetails()");
        this.setState({ dataSource1: this.state.dataSource1.cloneWithRows(this.state.orderDetails.OrderDetails) });
        this.setState({
            name: this.state.orderDetails.OrderCustomerName,
            phone: this.state.orderDetails.OrderDeliveredByPhone,
            address: this.state.orderDetails.OrderDeliveryAddress,
            packgingcharge: this.state.orderDetails.OrderPackingCharge,
            deliverycharge: this.state.orderDetails.OrderDeliveryCharge,
            couponsave: this.state.orderDetails.OrderCouponSave,
            walletdeduction: this.state.orderDetails.OrderWalletDeduction,
            orderprice: this.state.orderDetails.OrderPrice,
            orderid: this.state.orderDetails.OrderId,
            orderdate: this.state.orderDetails.OrderPlacedDate,
            paymentmode: this.state.orderDetails.PaymentMode
        });
    }

    componentWillMount() {
        console.log("OrderSummaryScreen componentWillMount()");
        console.log("Received Data: ", this.state.orderDetails);
        // fetch Orders Details
        this.fetchOrderDetails();
    }

    render() {

        return (
            <View style={styles.mainContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 15 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={require('../assets/app-images/boy.png')} style={{ width: 40, height: 40 }} />
                        </View>
                        <Text style={{ fontSize: 18, color: '#fff', fontWeight: 'bold' }}>For: {this.state.name}</Text>
                        <Text style={{ marginTop: 0, fontSize: 10, color: '#b2abab' }}> {this.state.phone} </Text>
                        <Text style={{ marginTop: 0, fontSize: 11, color: '#f9f9f9', width: 300, textAlign: 'center', alignContent: 'center' }}> {this.state.address} </Text>
                    </View>

                    <View style={styles.middleContainer}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ borderColor: '#fff', borderWidth: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#3bb97a' }}></View>
                            </View>
                            <View style={{ flex: 2, justifyContent: 'center' }}><Text style={{ fontWeight: "bold" }}>#Order ID</Text></View>
                            <View style={{ flex: 7, justifyContent: 'center', alignItems: 'flex-end' }}><Text>#{this.state.orderid}</Text></View>
                        </View>

                        <View style={{ flexDirection: 'row', marginTop: 20 }}>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ borderColor: '#fff', borderWidth: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#ccc5fc' }}></View>
                            </View>
                            <View style={{ flex: 2, justifyContent: 'center', }}><Text style={{ fontWeight: "bold" }}>Payment</Text></View>
                            <View style={{ flex: 7, justifyContent: 'center', alignItems: 'flex-end' }}><Text>{this.state.paymentmode}</Text></View>
                        </View>

                        <View style={{ flexDirection: 'row', marginTop: 20 }}>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ borderColor: '#fff', borderWidth: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#bdbdbd' }}></View>
                            </View>
                            <View style={{ flex: 2, justifyContent: 'center', }}><Text style={{ fontWeight: "bold" }}>Time</Text></View>
                            <View style={{ flex: 7, justifyContent: 'center', alignItems: 'flex-end' }}><Text>{this.state.orderdate}</Text></View>
                        </View>
                    </View>

                    <View style={styles.lowerContainer}>
                        {/* <View style={{flexDirection:'row'}}>
                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                    <Icon name="bell" size={20} color={'#cd2121'} />
                </View>
                <View style={{flex:2}}>
                <Text style={{fontSize:11,color:'#595958'}}> Order Total </Text>
                    <Text  style={{fontSize:14,color:'#232322'}}>₹ 120.00</Text>

                </View>
            </View> */}

                        <View style={styles.showItemContainer}>
                            <Text style={{ fontSize: 13, color: "#a5a0a0" }}>ITEMS :</Text>
                            <ListView
                                enableEmptySections={true}
                                dataSource={this.state.dataSource1}
                                renderRow={(data) =>
                                    <View style={{ flexDirection: 'row', padding: 10, paddingLeft: 0 }}>
                                        <View style={{ flex: 4 }}><Text>{data.ProductName}</Text></View>
                                        <View style={{ flex: 3, justifyContent: 'flex-start', alignItems: "flex-start", flexDirection: 'row', marginRight: 20 }}>
                                            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', }}>
                                                <Text style={{ color: '#938b8b' }}>₹</Text></View>
                                            <View style={{ flex: 2, justifyContent: 'flex-end', alignItems: 'flex-end', }}>
                                                <Text style={{ color: '#938b8b' }}>{data.ProductUnitPrice} X {data.ProductQty}</Text></View>
                                        </View>

                                        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', flexDirection: 'row' }}>
                                            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}><Text>₹</Text></View>
                                            <View style={{ flex: 2 }}><Text>{data.ProductUnitPrice * data.ProductQty}</Text></View>
                                        </View>
                                        {/* {this.setState({totalamount:this.state.totalamount+(data.ProductUnitPrice*data.ProductQty)})} */}
                                    </View>
                                } />
                        </View>
                        <View style={styles.bordering}>
                            <View style={{ flex: 1 }}><Text>Order Price</Text></View>
                            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}><Text> ₹ {this.state.orderprice}</Text></View>
                        </View>
                        <View style={styles.bordering}>
                            <View style={{ flex: 1 }}><Text>Delivery Charges</Text></View>
                            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}><Text> ₹ {this.state.deliverycharge}</Text></View>
                        </View>
                        <View style={styles.bordering}>
                            <View style={{ flex: 1 }}><Text>Packaging Charges</Text></View>
                            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}><Text> ₹ {this.state.packgingcharge}</Text></View>
                        </View>
                        <View style={styles.bordering}>
                            <View style={{ flex: 1 }}><Text>Coupon Save</Text></View>
                            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}><Text> ₹ {this.state.couponsave}</Text></View>
                        </View>
                        <View style={styles.bordering}>
                            <View style={{ flex: 1 }}><Text>Wallet Deduction</Text></View>
                            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}><Text> ₹ {this.state.walletdeduction}</Text></View>
                        </View>
                        <View style={styles.bordering}>
                            <View style={{ flex: 1 }}><Text style={{ color: "#cd2121", fontWeight: 'bold' }}>TOTAL AMOUNT</Text></View>
                            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                <Text style={{ fontSize: 16, color: '#cd2121', fontWeight: 'bold' }}> ₹ {parseInt(this.state.orderprice) + parseInt(this.state.packgingcharge) + parseInt(this.state.deliverycharge) - parseInt(this.state.couponsave) - parseInt(this.state.walletdeduction)}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.orderDetailsContainer}>
                        <TouchableOpacity>
                            <View style={styles.LowerContainer}>

                                {/* <Text style={{fontSize:12,color:'#8c8989',marginRight:5}}>Need Help ?</Text> */}
                                <Icon name='comments' color='#cd2121' size={18} />
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('HelpAndSupport')}>
                                    <Text style={{ fontSize: 16, color: '#cd2121', fontWeight: '400', marginLeft: 5 }}>CHAT SUPPORT</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
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
        backgroundColor: '#cd2121',
        flexDirection: 'column',
        padding: 0
    },
    middleContainer:
    {
        flexDirection: 'column',
        // paddingHorizontal:10,
        paddingRight: 10,
        paddingVertical: 20,
        margin: 10,
        marginBottom: 5,
        borderRadius: 4,
        backgroundColor: '#fff', shadowColor: '#000',
        shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2,
    },
    lowerContainer:
    {
        flexDirection: 'column',
        margin: 10,
        padding: 10,
        marginBottom: 5,
        borderRadius: 4,
        backgroundColor: '#fff', shadowColor: '#000',
        shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2,
    },
    showItemContainer:
    {

    },
    orderDetailsContainer:
    {

    },
    LowerContainer:
    {
        flexDirection: 'row',
        marginTop: 20,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    bordering:
    {
        borderColor: '#cccccc', borderTopWidth: 1, padding: 10, flexDirection: 'row'
    }

});
