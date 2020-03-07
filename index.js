/** @format */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import Listener from './appcommon/screens/Listener';
// import fireBaseBackgroundMessaging from './appcommon/screens/fireBaseBackgroundMessaging';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => Listener);