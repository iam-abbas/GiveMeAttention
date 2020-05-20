import React from 'react';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import LoadingScreen from './src/screens/loading';
import LoginScreen from './src/screens/login';
import RegisterScreen from './src/screens/register';

import HomeScreen from './src/screens/home';
import AddFriendScreen from './src/screens/addfriends';
import RequestsScreen from './src/screens/requests';
import auth from '@react-native-firebase/auth';

signOutUser = () => {
  auth().signOut();
};
console.disableYellowBox = true;

const AppTabNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      headerShown: false,
      headerTintColor: '#fff',
    },
  },
  AddFriend: {
    screen: AddFriendScreen,
    navigationOptions: {
      headerShown: false,
      headerTintColor: '#fff',
    },
  },
  FriendRequests: {
    screen: RequestsScreen,
    navigationOptions: {
      headerShown: false,
      headerTintColor: '#fff',
    },
  },
});

const AuthStack = createStackNavigator({
  Login: {
    screen: LoginScreen,
    navigationOptions: {
      headerShown: false,
      headerTintColor: '#fff',
    },
  },
  Register: {
    screen: RegisterScreen,
    navigationOptions: {
      headerShown: false,
      headerTintColor: '#fff',
    },
  },
});

export default createAppContainer(
  createSwitchNavigator(
    {
      Loading: LoadingScreen,
      App: AppTabNavigator,
      Auth: AuthStack,
    },
    {
      initialRouteName: 'Loading',
    },
  ),
);
