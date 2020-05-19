import React, {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import auth from '@react-native-firebase/auth';

export default class HomeScreen extends React.Component {
  signOutUser = () => {
    auth()
      .signOut()
      .then(() => console.log('User signed out!'));
  };
  componentDidMount() {
    console.log('Working');
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Hello</Text>
        <TouchableOpacity onPress={this.signOutUser}>
          <Text>Sign Out</Text>
        </TouchableOpacity>
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
