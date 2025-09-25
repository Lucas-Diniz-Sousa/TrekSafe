/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App'; // <--- Aponta para o novo App.js em src
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);