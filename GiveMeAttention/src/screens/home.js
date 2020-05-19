import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';


export default class HomeScreen extends React.Component {
    componentDidMount() {
      console.log("Working")
    }
  
    render() {
      return (
        <View style={styles.container}>
          <Text>Hello</Text>
        </View>
      );
    }
  }
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });