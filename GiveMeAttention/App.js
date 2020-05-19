import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import {
  View,
  Text,
} from 'react-native';


const App = () => {
  useEffect(() => {
  // Get the device token
  messaging()
    .getToken()
    .then(token => {
      console.log(token);
    });

  // Listen to whether the token changes
  return messaging().onTokenRefresh(token => {
    console.log(token);
  });
}, []);
  return (
    <View>
      <Text>Hi, Sup BRO</Text>
    </View>
  );
};


export default App;
