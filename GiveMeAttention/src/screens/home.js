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
  SafeAreaView
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
    name: '',
    avatar: 'https://i.imgur.com/wA1GJTg.png',
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

  sendUserNotification = async username => {
    const user_prof = await firestore()
      .collection('usernames')
      .doc(username)
      .get();
    var f_id = user_prof.data().uid;
    const user_data = await this.getProfileByUserID(f_id);
    var fcm_token = user_data.fcmtoken;
    const FIREBASE_API_KEY =
      'AAAAU9pUIfA:APA91bFNiuUwGYRATBERB1T2F1fLOaYYl2cpJGPxdVufXdsut2jSTl1NquEeYAa73lIF1wekjundPbqt7eja4oxH8GXzU99GI_I281terZr5Soaa1UuKLtYNqoZHzJ-zk3jv6GYH9DBC';
    const message = {
      registration_ids: [fcm_token],
      notification: {
        title: 'GiveMeAttention',
        body: this.state.name + ' needs attention!',
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
    await firestore()
      .collection('users')
      .doc(f_id)
      .update('points', firestore.FieldValue.increment(1))
      .then(() => {
        console.log('Increased points');
      });
  };

  fetchUserData = async QuerySnapshot => {
    console.log('Loading data..');
    if (QuerySnapshot) {
      // this.setState({friendData: null});
      const uid = this.state.uid;
      let userData = QuerySnapshot;
      if (userData.exists) {
        this.setState({username: userData.data().username});
        this.setState({name: userData.data().name});
        this.setState({firendReq: userData.data().friendRequestsList});
        this.setState({friendsList: userData.data().friendsList});
        this.setState({avatar: userData.data().avatar});

        let friendData = {};
        for (var item of this.state.friendsList) {
          let data = await this.getProfileByUserID(item);
          friendData[item] = data;
        }
        this.setState({friendData});
      } else {
        this.fetchUserData();
      }
    }
  };

  onError = error => {
    console.log(error);
  };
  async componentDidMount() {
    const uid = this.state.uid;
    firestore()
      .collection('users')
      .doc(uid)
      .onSnapshot(this.fetchUserData, this.onError);
    this.fetchUserData();
  }

  renderFriends = () => {
    if (this.state.friendData === null) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
          }}>
          <ActivityIndicator color={'#fff'} size="large" />
        </View>
      );
    } else {
      var key = 0;
      var output = [];
      for (var fid in this.state.friendData) {
        key++;
        let friend = this.state.friendData[fid];
        var tempItem = (
          <View key={key}>
            <ContactCard
              key={key}
              imageURL={friend.avatar}
              name={friend.username}
              onPress={() => {
                this.sendUserNotification(friend.username);
              }}
              style={styles.contact}
            />
          </View>
        );
        output[key] = tempItem;
      }
      return output;
    }
  };
  render() {
    if (this.state.username == '') {
      return (
        <View
          style={{
            backgroundColor: '#fff',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}>
        <View style={styles.banner}>
        <SafeAreaView>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('FriendRequests')}
              style={styles.topButton}>
              <Text style={styles.topButtonText}>Friend Requests</Text>
              {
                this.state.firendReq.length ?
                <View style={styles.newIndicator} /> :
                null
              }
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.signOutUser}
              style={styles.topButton}>
              <Text style={styles.topButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
          </SafeAreaView>
          <Text style={styles.needAttention}>Give Me Attention</Text>
          <Image
            source={{
              uri: this.state.avatar,
            }}
            style={[styles.dp, styles.dpLarge]}
          />
          <Text style={styles.username}>{this.state.name}</Text>
          <Text>{this.state.username}</Text>
        </View>
        <View style={styles.header}>
          <View style={styles.headerButtonContainer}>
            <Button
              style={styles.headerButton}
              label="Add Friends"
              onPress={() => this.props.navigation.navigate('AddFriend')}
            />
          </View>
          <View style={styles.headerButtonContainer}>
            <Button
              style={styles.headerButton}
              label="Leaderboard"
              lightButton={true}
              onPress={() => this.props.navigation.navigate('Leaderboard')}
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
    height: Dimensions.get('window').height * 0.5,
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
    flexDirection: 'row',
  },
  topButtonText: {
    color: COLOURS.DODGER_BLUE,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  dp: {
    width: Dimensions.get('window').width * 0.4,
    height: Dimensions.get('window').width * 0.4,
    borderRadius: Dimensions.get('window').width * 0.4,
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
  newIndicator: {
    height: 10,
    width: 10,
    margin: 5,
    borderRadius: 12,
    backgroundColor: COLOURS.ROYAL_RED
  }
});
