import React from 'react';
import { Camera, Permissions } from 'expo';
import {
    StyleSheet, Text, View, ToastAndroid, ImageBackground, ListView, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity,
} from 'react-native';
import Display from 'react-native-display';
import Icon from 'react-native-vector-icons/FontAwesome';
import GridView from 'react-native-super-grid';
import ContentLoader from 'react-native-content-loader';
import { Rect } from 'react-native-svg';



const image1 = require('../assets/quickpicks/breakfast.png')
const image2 = require('../assets/quickpicks/snacks.png')
const image3 = require('../assets/quickpicks/lunch.png')
const image4 = require('../assets/quickpicks/dinner.png')
var data = [
    { title: "Breakfast", image: image1 }, { title: "Snacks", image: image2 }
    , { title: "Lunch", image: image3 }, { title: "Dinner", image: image4 }
]
const TopSellings = () => <ContentLoader height={200}
    primaryColor='#eeeeee'
    secondaryColor='#fff'
    speed={100}
>

    <Rect x="0" y="0" rx="0" ry="0" width="200" height="150" />
    <Rect x="5" y="155.27" rx="0" ry="0" width="72" height="9" />
    <Rect x="5" y="166.27" rx="0" ry="0" width="105" height="5" />
    <Rect x="5" y="176.27" rx="0" ry="0" width="45" height="15" />
    <Rect x="115" y="176.27" rx="0" ry="0" width="45" height="15" />
</ContentLoader>

export default class PhotoScreen extends React.Component {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

        this.state = {
            dataSource1: ds.cloneWithRows(['r1', 'r2', 'r3', 'r4']),
            dataSource2: ds.cloneWithRows(['r1', 'r2', 'r3', 'r4']),
            dataSource3: ds.cloneWithRows(data),
            dim: 150, topSellingLoader: true, trendingCategories: true, offers: true,
            Items: [
                { title: "Breakfast", image: image1 }, { title: "Snacks", image: image2 }
                , { title: "Lunch", image: image3 }, { title: "Dinner", image: image4 }
            ],

            hasCameraPermission: null,
            type: Camera.Constants.Type.back,
            hideCamera: true,
            showCamera: false,
            photoClicked: false,
            photo: {}, loader: false,
            cameraSwitch: true
        }

    }

    componentWillMount() {
        // this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
        //     BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid));

    }

    async camera() {
        console.log("Working")
        const { status } = await Permissions.askAsync(Permissions.CAMERA);

        console.log(status)
        this.setState({ hasCameraPermission: status === 'granted', showCamera: true, hideCamera: false, cameraSwitch: false, photoClicked: false, loader: false });
    }

    async  snap() {
        console.log("Async Working")
        this.state.photo = await this.camera.takePictureAsync();
        console.log(this.state.photo);
        this.setState({ photoClicked: true, showCamera: false, hideCamera: false, loader: false })


    };
    savePhoto() {

        console.log('savePhoto ()');
        this.setState({ showCamera: false, hideCamera: true, photoClicked: false, loader: false, cameraSwitch: true });
        ToastAndroid.show('Your Photo will be uploaded shortly', ToastAndroid.SHORT);
    }



    render() {


        return (

            <View style={styles.mainContainer}>
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    <Display enable={this.state.hideCamera}>
                        <GridView
                            spacing={5}
                            itemDimension={150}
                            items={this.state.Items}
                            renderItem={item => (

                                <View style={styles.photoContainer}>
                                    <ImageBackground source={require('../assets/quickpicks/breakfast.png')} style={styles.imageStyle}>
                                        <View style={styles.textStyle}>
                                            <Text style={{ fontSize: 16, color: '#fff', fontWeight: '300' }}>Delicious</Text>
                                        </View>
                                    </ImageBackground>
                                </View>
                            )} />

                    </Display>

                    <Display enable={this.state.showCamera} style={{ flex: 1, height: Dimensions.get('screen').height }}>

                        <Camera style={{ flex: 1 }} type={this.state.type} ref={ref => { this.camera = ref; }}>

                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: 'transparent',
                                    flexDirection: 'column',

                                }}>
                                <View style={styles.camerTop}>
                                    <TouchableOpacity onPress={() => this.setState({ showCamera: false, hideCamera: true, cameraSwitch: true })} >
                                        <Icon name="times" size={20} color="#cd2121" style={{}} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.cameraBottom}>
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        <TouchableOpacity style={{}}
                                            onPress={() => {
                                                this.setState({
                                                    type:
                                                        this.state.type === Camera.Constants.Type.back
                                                            ? Camera.Constants.Type.front
                                                            : Camera.Constants.Type.back,
                                                });
                                            }}>
                                            <Icon name="user-circle" size={22} color="#fff" />
                                            {/* <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> Flip </Text> */}
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ marginLeft: 12 }}>
                                            <Icon name="image" size={22} color="#fff" />
                                        </TouchableOpacity>
                                        {/* this.setState({ loader: true, showCamera: false }, () => */}
                                    </View>
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                                        <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => this.snap()}>
                                            <Icon name="camera" size={22} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                            </View>
                        </Camera>

                    </Display >

                    <Display enable={this.state.loader} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator color={"#cd2121"} size={"large"} />
                    </Display>

                    <Display enable={this.state.photoClicked} style={{ flex: 1, padding: 5 }}>
                        <ImageBackground source={{ uri: this.state.photo.uri }} style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height, padding: 10, flexDirection: 'row' }}>

                            <View style={{ flex: 1, justifyContent: 'flex-start', padding: 10 }}>
                                <TouchableOpacity style={{}} onPress={() => this.setState({ showCamera: true, photoClicked: false })}>
                                    <Icon name="times" size={22} color="#cd2121" />
                                </TouchableOpacity>

                                <TouchableOpacity style={{ marginTop: 8 }} onPress={() => this.savePhoto()}>
                                    <Icon name="check" size={22} color="green" />
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </Display>
                </ScrollView>
                <Display enable={this.state.cameraSwitch} style={{ position: 'absolute', bottom: 0, backgroundColor: 'transparent', justifyContent: 'flex-end', alignItems: 'flex-end', padding: 20, width: Dimensions.get('screen').width }}>
                    <TouchableOpacity style={[styles.button]} onPress={() => this.camera()}>
                        {/* <Text style={{ fontSize: 20, color: '#fff' }}>+</Text> */}
                        <Icon name="camera" size={20} color="#fff" />
                    </TouchableOpacity>
                </Display>
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
        backgroundColor: '#f8f8f8',
        flexDirection: 'column',
        // paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,

    },
    photoContainer:
    {
        flexDirection: 'column',
        borderRadius: 5,
        marginBottom: 5,
        borderRadius: 10,
        height: 200,
        backgroundColor: '#f9f9f9', shadowColor: '#000', shadowOffset: { width: 10, height: 10 }, shadowOpacity: 0.2,
        shadowRadius: 2, elevation: 2,

    },
    imageStyle:
    {
        flex: 3,
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        paddingTop: 10, paddingLeft: 5,
        backgroundColor: '#fff',
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        overflow: "hidden",
    },
    textStyle:
    {
        justifyContent: 'center', alignItems: 'center', padding: 10, bottom: 0
    },
    button:
    {
        backgroundColor: 'blue', width: 40, height: 40, borderRadius: 25, zIndex: 900,
        bottom: 0, justifyContent: 'center', alignItems: 'center', marginRight: 16
    },
    camerTop:
    {
        flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', paddingHorizontal: 15,
    },
    cameraBottom:
    {
        flex: 9, justifyContent: 'flex-start', alignItems: 'flex-end', padding: 20, flexDirection: 'row'

    }


});