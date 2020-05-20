import React, {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Button} from '../common/Button';
import {FormTextInput} from '../common/FormTextInput';
import {COLOURS} from '../config/colors';
import {ContactCard} from '../common/ContactCard';

export default class HomeScreen extends React.Component {
  state = {
    uid: auth().currentUser.uid,
    username: '',
    firendReq: [],
    friendsList: [],
    friendData: null,
  };
  constructor(props) {
    super(props);
    this.props.navigation.addListener('didFocus', payload => {
      this.fetchUserData();
    });
  }

  signOutUser = () => {
    auth()
      .signOut()
      .then(() => console.log('User signed out!'));
  };

  getProfileByUserID = async userid => {
    const user = await firestore()
      .collection('users')
      .doc(userid)
      .get();
    return user.data();
  };

  sendUserNotification = async userid => {
    const user_data = await this.getProfileByUserID(userid);
    fcm_token = user_data.fcmtoken;
    console.log(fcm_token);
    const FIREBASE_API_KEY =
      'AAAAU9pUIfA:APA91bFNiuUwGYRATBERB1T2F1fLOaYYl2cpJGPxdVufXdsut2jSTl1NquEeYAa73lIF1wekjundPbqt7eja4oxH8GXzU99GI_I281terZr5Soaa1UuKLtYNqoZHzJ-zk3jv6GYH9DBC';
    const message = {
      registration_ids: [fcm_token],
      notification: {
        title: 'Hello',
        body: 'Sup bruv',
        vibrate: 1,
        sound: 1,
        show_in_foreground: true,
        priority: 'high',
        content_available: true,
      },
    };
    let headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: 'key=' + FIREBASE_API_KEY,
    });

    let response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers,
      body: JSON.stringify(message),
    });
    response = await response.json();
  };

  fetchUserData = async () => {
    console.log('Loading data..');
    this.setState({friendData: null});
    const uid = this.state.uid;
    const userData = await firestore()
      .collection('users')
      .doc(uid)
      .get();
    this.setState({username: userData.data().username});
    this.setState({firendReq: userData.data().friendRequestsList});
    this.setState({friendsList: userData.data().friendsList});
    let friendData = {};
    for (var item of this.state.friendsList) {
      let data = await this.getProfileByUserID(item);
      friendData[item] = data;
    }
    this.setState({friendData});
  };

  async componentDidMount() {
    this.fetchUserData();
  }

  renderFriends = () => {
    console.log(this.state.friendsList);
    if (this.state.friendData === null) {
      return (
        <View
          style={{
            height: 200,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
          }}>
          <ActivityIndicator color={'#fff'} size="large" />
        </View>
      );
    } else {
      return (
        <View>
          {this.state.friendsList.map((fid, key) => {
            let friend = this.state.friendData[fid];
            return (
              <ContactCard
                key={key}
                imageURL="https://i.imgur.com/2D7TdPl.jpg"
                name={friend.username}
                onPress={() => {
                  this.sendUserNotification(fid);
                }}
                style={styles.contact}
              />
            );
          })}
        </View>
      );
    }
  };

  render() {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}>
        <View style={styles.banner}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('FriendRequests')}
              style={styles.topButton}>
              <Text style={styles.topButtonText}>Friend Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => console.log(2)}
              style={styles.topButton}>
              <Text style={styles.topButtonText}>Add Friend</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.needAttention}>give me attention!</Text>
          <Image
            source={{
              uri: 'https://i.imgur.com/2D7TdPl.jpg',
            }}
            style={[styles.dp, styles.dpLarge]}
          />
          <Text style={styles.username}>{this.state.username}</Text>
          <TouchableOpacity onPress={this.signOutUser}>
            <Text>Log Out</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <View style={styles.headerButtonContainer}>
            <Button
              style={styles.headerButton}
              label="Add BFFs"
              onPress={() => this.props.navigation.navigate('AddFriend')}
            />
          </View>
          <View style={styles.headerButtonContainer}>
            <Button
              style={styles.headerButton}
              label="Leaderboard"
              lightButton={true}
              onPress={() => console.log(3)}
            />
          </View>
        </View>
        <View style={styles.contacts}>{this.renderFriends()}</View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: COLOURS.DODGER_BLUE,
  },
  containerContent: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  banner: {
    height: Dimensions.get('window').height * 0.475,
    borderBottomLeftRadius: Dimensions.get('window').width,
    borderBottomRightRadius: Dimensions.get('window').width,
    backgroundColor: COLOURS.WHITE,
    width: '170%',
    alignItems: 'center',
  },
  needAttention: {
    color: COLOURS.DODGER_BLUE,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 36,
    letterSpacing: 2,
    marginTop: 40,
  },
  topBar: {
    flexDirection: 'row',
    width: Dimensions.get('window').width,
    justifyContent: 'space-between',
  },
  topButton: {
    padding: 15,
  },
  topButtonText: {
    color: COLOURS.DODGER_BLUE,
    fontWeight: 'bold',
  },
  dp: {
    width: Dimensions.get('window').width * 0.2,
    height: Dimensions.get('window').width * 0.2,
    borderRadius: Dimensions.get('window').width * 0.2,
  },
  dpLarge: {
    marginTop: 30,
  },
  username: {
    color: COLOURS.DODGER_BLUE,
    fontWeight: 'bold',
    marginTop: 25,
    fontSize: 25,
    letterSpacing: 1,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headerButtonContainer: {
    width: '40%',
    marginHorizontal: 10,
    marginTop: 20,
  },
  contacts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 30,
  },
});
