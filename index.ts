import { registerRootComponent } from 'expo';
import 'react-native-gesture-handler';
import App from './src/app/App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build
registerRootComponent(App);
