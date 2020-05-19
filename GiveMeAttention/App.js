import React from 'react';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import LoadingScreen from './src/screens/loading';
import LoginScreen from './src/screens/login';
import RegisterScreen from './src/screens/register';

import HomeScreen from './src/screens/home';

import auth from '@react-native-firebase/auth';

signOutUser = () => {
  auth().signOut();
};

const AppTabNavigator = createStackNavigator({
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      headerShown: false,
      // headerStyle: {
      //   backgroundColor: "#ff8566",
      //   elevation: 0,
      //   shadowOpacity: 0,
      // },
      headerTintColor: '#fff',
    },
  },
});

const AuthStack = createStackNavigator({
  Login: {
    screen: LoginScreen,
    navigationOptions: {
      headerShown: false,
      // headerStyle: {
      //   backgroundColor: "#ff8566",
      //   elevation: 0,
      //   shadowOpacity: 0,
      // },
      headerTintColor: '#fff',
    },
  },
  Register: {
    screen: RegisterScreen,
    navigationOptions: {
      headerShown: false,
      // headerStyle: {
      //   backgroundColor: "#ff8566",
      //   elevation: 0,
      //   shadowOpacity: 0,
      // },
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
      initialRouteName: "Loading",
    }
  )
);