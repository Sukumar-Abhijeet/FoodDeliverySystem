import React from 'react';
import {
    StyleSheet, Text, View, ProgressBarAndroid, ImageBackground, ListView, ScrollView, Dimensions, TouchableOpacity,
} from 'react-native';
import StarRating from 'react-native-star-rating';

const image1 = require('../assets/quickpicks/breakfast.png')
const image2 = require('../assets/quickpicks/snacks.png')
const image3 = require('../assets/quickpicks/lunch.png')
const image4 = require('../assets/quickpicks/dinner.png')


var data = [
    { title: "Breakfast", image: image1 }, { title: "Snacks", image: image2 }
    , { title: "Lunch", image: image3 }, { title: "Dinner", image: image4 }
]


export default class RaingScreen extends React.Component {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

        this.state = {
            dataSource1: ds.cloneWithRows(['r1', 'r2', 'r3', 'r4']),

            dim: 150, topSellingLoader: true, trendingCategories: true, offers: true,
            Items: [
                { name: 'TURQUOISE', code: '#1abc9c' }, { name: 'EMERALD', code: '#2ecc71' },
                { name: 'PETER RIVER', code: '#3498db' }, { name: 'AMETHYST', code: '#9b59b6' }
            ],

        }

    }

    componentWillMount() {
        // this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
        //     BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid));
        console.log("Rating SCreen: ", this.props.navigation);
    }




    render() {

        return (
            <View style={styles.mainContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.ratings}>
                        <View style={styles.innerRating}>
                            <View style={styles.star}>
                                <ImageBackground source={require('../assets/star.png')} style={{ width: 80, height: 80, justifyContent: 'center', alignItems: 'center' }} >
                                    <Text style={{ fontSize: 16, color: '#fff', fontWeight: 'bold' }}>4.5</Text>
                                </ImageBackground>

                                <Text style={{ fontSize: 16, color: '#8798a1', fontWeight: '600', marginTop: 5 }}>Average Rating</Text>
                                <Text style={{ fontSize: 10, color: '#8798a1', }}>Based On 1200 ratings</Text>
                            </View>
                            <View style={styles.rightRating}>
                                <ListView
                                    enableEmptySections={true}
                                    dataSource={this.state.dataSource1}
                                    renderRow={(data) =>

                                        <View style={styles.barRating}>
                                            <View style={{ flex: 2, padding: 3 }}>
                                                <Text style={{ fontSize: 14, color: '#8798a1', fontWeight: '600', }}>5 stars</Text>
                                            </View>
                                            <View style={{ flex: 5, padding: 3 }}>
                                                <ProgressBarAndroid
                                                    styleAttr={"Horizontal"}
                                                    indeterminate={false}
                                                    progress={0.8}
                                                    color="#fecf3c"
                                                    height={15}

                                                />
                                            </View>
                                            <View style={{ flex: 1, padding: 3, marginTop: 3 }}>
                                                <Text style={{ fontSize: 7, color: '#8798a1', }}>14,170</Text>
                                            </View>
                                        </View>
                                    } />

                            </View>
                        </View>
                    </View>
                    <View style={styles.reviews}>
                        <ListView
                            enableEmptySections={true}
                            dataSource={this.state.dataSource1}
                            renderRow={(data) =>
                                <View style={styles.innerReviews}>
                                    <View style={styles.photo}>

                                    </View>
                                    <View style={styles.description}>
                                        <Text style={{ fontSize: 18, color: '#6d7d85', fontWeight: 'bold' }}>Barbara Hines</Text>
                                        <View style={{ width: 70 }}>
                                            <StarRating
                                                disabled={true}
                                                maxStars={5}
                                                rating={2.5}
                                                fullStarColor={"#ffd740"}
                                                starSize={15}
                                                emptyStarColor={'#ebebeb'}
                                            />
                                        </View>
                                        <Text style={{ fontSize: 12, color: '#8798a1', }}>ashvdhasdhjahhabdhagbshjdgbhjagdjhagjdasd</Text>
                                    </View>
                                </View>
                            } />
                    </View>
                </ScrollView>
                <View style={{ position: 'absolute', bottom: 0, backgroundColor: 'transparent', justifyContent: 'flex-end', alignItems: 'flex-end', padding: 20, width: Dimensions.get('screen').width }}>
                    <TouchableOpacity style={[styles.button]}>
                        <Text style={{ fontSize: 20, color: '#fff' }}>+</Text>
                    </TouchableOpacity>
                </View>
            </View >
        );
    }
}
const styles = StyleSheet.create({
    mainContainer:
    {
        flex: 1,
        width: null,
        height: null,
        backgroundColor: '#ebebeb',
        flexDirection: 'column',
        // paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,

    },
    ratings:
    {
        flex: 3,
        padding: 10,
    },
    innerRating:
    {
        padding: 10,
        backgroundColor: '#fff', shadowColor: '#000',
        shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2, flexDirection: 'row'
    },
    star:
    {
        justifyContent: 'center',
        alignItems: 'center', flex: 1

    },
    rightRating:
    {

        padding: 10, flex: 2,
        marginTop: 5
    },
    barRating:
    {
        justifyContent: 'space-evenly',
        flexDirection: 'row',

    },
    reviews:
    {
        flex: 7,
        padding: 10,
        backgroundColor: '#fff', shadowColor: '#000',
        shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2, flexDirection: 'row'
    },
    innerReviews:
    {
        flex: 1,
        borderBottomWidth: 1,
        padding: 20,
        borderBottomColor: '#d6d4d4',
        flexDirection: 'row'
    },
    photo:
    {
        backgroundColor: '#ebebeb', width: 60, height: 60, borderRadius: 15
    },
    button:
    {
        backgroundColor: 'blue', width: 40, height: 40, borderRadius: 25, zIndex: 900,
        bottom: 0, justifyContent: 'center', alignItems: 'center', marginRight: 16
    },
    description:
    {
        justifyContent: 'flex-start', paddingHorizontal: 8, flex: 6
    }

});