import React from 'react';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import LoadingScreen from './src/screens/loading';
import LoginScreen from './src/screens/login';
import RegisterScreen from './src/screens/register';
import {COLOURS} from './src/config/colors';
import HomeScreen from './src/screens/home';
import AddFriendScreen from './src/screens/addfriends';
import RequestsScreen from './src/screens/requests';
import LeaderboardScreen from './src/screens/leaderboard';

import auth from '@react-native-firebase/auth';

signOutUser = () => {
  auth().signOut();
};
console.disableYellowBox = true;

const AppTabNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      headerShown: true,
      headerTintColor: COLOURS.DODGER_BLUE,
    },
  },
  AddFriend: {
    screen: AddFriendScreen,
    navigationOptions: {
      headerShown: true,
      headerTintColor: COLOURS.DODGER_BLUE,
    },
  },
  Friends: {
    screen: RequestsScreen,
    navigationOptions: {
      headerShown: true,
      headerTintColor: COLOURS.DODGER_BLUE,
    },
  },
  Leaderboard: {
    screen: LeaderboardScreen,
    navigationOptions: {
      headerShown: true,
      headerTintColor: COLOURS.DODGER_BLUE,
    },
  },
});

const AuthStack = createStackNavigator({
  Login: {
    screen: LoginScreen,
    navigationOptions: {
      headerShown: true,
      headerTintColor: COLOURS.DODGER_BLUE,
    },
  },
  Register: {
    screen: RegisterScreen,
    navigationOptions: {
      headerShown: true,
      headerTintColor: COLOURS.DODGER_BLUE,
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
