import React from 'react';
import Image from 'react-native';
import { createStackNavigator } from 'react-navigation';
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import HungryScreen from '../screens/HUngryScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SignUpScreen from '../screens/SignUpScreen';
import LoginScreen from '../screens/LoginScreen';
import HelpAndSupportScreen from '../screens/HelpAndSupportScreen';
import LocationScreen from '../screens/LocationScreen';
import NotificationScreen from '../screens/NotificationScreen';
import LocationSearchScreen from '../screens/LocationSearchScreen';
import TrackOrderScreen from '../screens/TrackOrderScreen';
import SearchScreen from '../screens/SearchScreen';
import SavedAddressScreen from '../screens/SavedAddressScreen';
import AddAddressScreen from '../screens/AddAddressScreen';
import OtpVerifyScreen from '../screens/OtpVerifyScreen';
import CouponScreen from '../screens/CouponScreen';
import OrderPlacedScreen from '../screens/OrderPlacedScreen';
import WalletScreen from '../screens/WalletScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import TabHeaderScreen from '../screens/TabHeaderScreen'
import AuthenticationScreen from '../screens/AuthenticationScreen';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import { TabIcon } from '../vectoricons/TabIcon';


// CHEFSCREENS
import ChefHomeScreen from '../chefscreens/ChefHomeScreen';
import ChefDetailScreen from '../chefscreens/ChefDetailScreen';
import ChefRegistrationScreen from '../chefscreens/ChefRegistrationScreen';
import ChefExploreScreen from '../chefscreens/ChefExploreScreen';
import ProductScreen from '../screens/ProductScreen';
import QuickPickProductScreen from '../screens/QuickPickProductScreen';
import ChefDishesScreen from '../chefscreens/ChefDishesScreen';

import AppLoader from '../screens/AppLoader';
import PaymentScreen from '../screens/PaymentScreen';


export const Tabs = createMaterialBottomTabNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => (
        <TabIcon
          iconDefault='ios-home-outline'
          iconFocused='ios-home'
          focused={focused}
          activeTintColor={"#cd2121"}
          inactiveTintColor={"#9f9fa0"}
          size={25}
        />
      ),
      labeled: true,
      activeTintColor: '#cd2121',
      inactiveTintColor: '#999999',
      tabBarColor: "#fff"
    }
  },
  Categories: {
    screen: CategoriesScreen,
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => (
        <TabIcon
          iconDefault='ios-archive-outline'
          iconFocused='ios-archive'
          focused={focused}
          activeTintColor={"#cd2121"}
          inactiveTintColor={"#9f9fa0"}
          size={25}
        />
      ),
      labeled: true,
      activeTintColor: '#cd2121',
      inactiveTintColor: '#999999',
      tabBarColor: "#fff"
    }
  },
  FeelingHungry: {
    screen: ChefExploreScreen,
    navigationOptions: {
      tabBarLabel: "Bawarchi",
      tabBarIcon: ({ focused, tintColor }) => (
        <TabIcon
          iconDefault='ios-restaurant-outline'
          iconFocused='ios-restaurant'
          focused={focused}
          activeTintColor={"#FFF"}
          inactiveTintColor={"#9f9fa0"}
          size={30}
        />
        // <Image style={{ width: 20, height: 20 }}
        //   source={require('../assets/chef.png')}
        // />
      ),
      labeled: true,
      activeTintColor: '#cd2121',
      inactiveTintColor: '#999999',
      tabBarColor: "#fff"
    }
  },
  Find: {
    screen: SearchScreen,
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => (
        <TabIcon
          iconDefault='ios-search-outline'
          iconFocused='ios-search'
          focused={focused}
          activeTintColor={"#cd2121"}
          inactiveTintColor={"#9f9fa0"}
          size={25}
        />
      ),
      labeled: true,
      activeTintColor: '#cd2121',
      inactiveTintColor: '#999999',
      tabBarColor: "#fff"
    }
  },
  Profile: {
    screen: ProfileScreen,
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => (
        <TabIcon
          iconDefault='ios-contact-outline'
          iconFocused='ios-contact'
          focused={focused}
          size={25}
          style={{ padding: 50 }}
        />
      ),
      labeled: true,
      activeTintColor: '#cd2121',
      inactiveTintColor: '#999999',
      tabBarColor: "#fff",
      height: 20,
      width: 20
    },
    activeTintColor: "#cd2121",
    inactiveTintColor: "#9f9fa0"
  },
},
  {
    animationEnabled: true,
    tabStyle: {
      width: 2,
      height: 2
    },
    swipeEnabled: true,
    barStyle: { paddingBottom: 0, }
  });
export const LoginStack = createStackNavigator({
  Header:
  {
    screen: TabHeaderScreen,
    navigationOptions: {
      header: null,
    }
  },
  AppLoader: {
    screen: AppLoader,
    navigationOptions: {
      header: null
    }
  },
  Authentication:
  {
    screen: AuthenticationScreen,
    navigationOptions: {
      header: null
    }
  },
  SignUp:
  {
    screen: SignUpScreen,
    navigationOptions: {
      header: null
    }
  },
  Location:
  {
    screen: LocationScreen,
    navigationOptions: {
      header: null
    }
  },
  LocationSearch:
  {
    screen: LocationSearchScreen,
    navigationOptions: {
      // header: null
      headerTitle: "Search Location",
      headerStyle: {
        // marginTop: Expo.Constants.statusBarHeight,
      }
    }
  },
  OtpVerify:
  {
    screen: OtpVerifyScreen,
    navigationOptions: {
      header: null
    }
  },
  TrackOrder:
  {
    screen: TrackOrderScreen,
    navigationOptions: {
      header: null
    }
  },
  Login:
  {
    screen: LoginScreen,
    navigationOptions: {
      header: null
    }
  },
  Coupon:
  {
    screen: CouponScreen,
    navigationOptions: {
      // header: null,
      headerTitle: "Ongoing Offers"
    }
  },
  OrderHistory:
  {
    screen: OrderHistoryScreen,
    navigationOptions: {
      //header: null,
      headerTitle: "Order History",
      headerStyle: {
        // marginTop: Expo.Constants.statusBarHeight,
      }
    }
  },
  EditProfile:
  {
    screen: EditProfileScreen,
    navigationOptions: {
      header: null,
    }
  },
  OrderSummary:
  {
    screen: OrderSummaryScreen,
    navigationOptions: {
      // header: null,
      headerTitle: 'Order Details',
      backgroundColor: '#cd2121'
    }

  },
  Products:
  {
    screen: ProductScreen,
    navigationOptions: {
      header: null
    },

  },
  QuickPickProducts:
  {
    screen: QuickPickProductScreen,
    navigationOptions: {
      header: null
    },

  },
  Payment:
  {
    screen: PaymentScreen,
    navigationOptions: {
      // header:null
      headerTitle: "Choose Payment"
    },

  },
  FeedBack:
  {
    screen: FeedbackScreen,
    navigationOptions: {
      header: null
    },


  },
  Cart:
  {
    screen: CartScreen,
    navigationOptions: {
      header: null
    },
  },
  OrderPlaced:
  {
    screen: OrderPlacedScreen,
    navigationOptions: {
      header: null
    },

  },
  HelpAndSupport:
  {
    screen: HelpAndSupportScreen,
    navigationOptions: {
      // header: null
      headerTitle: "Chat Support"
    },

  },
  SavedAddress:
  {
    screen: SavedAddressScreen,
    navigationOptions: {
      // header: null
      headerTitle: "Saved Address"
    },

  },
  AddAddress:
  {
    screen: AddAddressScreen,
    navigationOptions: {
      // header: null
    },

  },
  Notification:
  {
    screen: NotificationScreen,
    navigationOptions: {
      // header:null
      headerStyle: {
        backgroundColor: '#fbfbfb'
      },
      title: 'Notifications',
      headerTintColor: '#555',
    },

  },
  Wallet:
  {
    screen: WalletScreen,
    navigationOptions: {
      // header:null
      headerStyle: {
        backgroundColor: '#fff'
      },
      title: 'BMF MONEY',
      headerTintColor: '#000',
    },

  },
  Tabs: {
    screen: Tabs,
    navigationOptions:
    {
      header:
        null

    }
  },

  TermsAndConditions:
  {
    screen: TermsAndConditionsScreen,
    navigationOptions: {
      // header:null
      headerTitle: "Terms & Conditions"
    },

  },
  // CHEFSCREENS
  ChefHome:
  {
    screen: ChefHomeScreen,
    navigationOptions: {
      header: null
    },

  },
  ChefDishes:
  {
    screen: ChefDishesScreen,
    navigationOptions: {
      header: null
    },

  },
  ChefDetail:
  {
    screen: ChefDetailScreen,
    navigationOptions: {
      header: null
    },

  },
  ChefRegistration:
  {
    screen: ChefRegistrationScreen,
    navigationOptions: {
      header: null
    },

  },
  ChefExplore: {
    screen: ChefExploreScreen,
    navigationOptions: {
      header: null
    }
  }
},

  {
    initialRouteName: 'AppLoader'
  });
export default LoginStack;
