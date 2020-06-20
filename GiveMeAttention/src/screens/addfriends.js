import * as React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Text,
  SafeAreaView,
} from 'react-native';
import {COLOURS} from '../config/colors';
import {FormTextInput} from '../common/FormTextInput';
import {Button} from '../common/Button';
import {ContactCard} from '../common/ContactCard';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default class AddFriendScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userid: auth().currentUser.uid,
      friendUsername: '',
      message: '',
    };
  }

  addFriend = async () => {
    let username = this.state.friendUsername;
    const user_data = await firestore()
      .collection('usernames')
      .doc(username)
      .get();
    if (user_data.exists) {
      const uid = user_data.data().uid;
      const friends_profile = await firestore()
        .collection('users')
        .doc(uid)
        .get();
      let friendsArray = friends_profile.data().friendsList;
      let blocklist = friends_profile.data().BlockList;
      let friendsList = friendsArray.flatMap(x => Object.keys(x));
      if (uid == this.state.userid) {
        return this.setState({message: 'You cannot add yourself.'});
      }
      if (friendsList.includes(auth().currentUser.uid)) {
        return this.setState({message: 'This user is already your friend'});
      }
      if (blocklist && blocklist.includes(auth().currentUser.uid)) {
        return this.setState({
          message:
            'You have been blocked by this user! Only they can send you friend request!',
        });
      }


      firestore()
        .collection('users')
        .doc(uid)
        .update({
          friendRequestsList: firestore.FieldValue.arrayUnion(
            auth().currentUser.uid,
          ),
        })
        .then(() => {
          this.setState({message: 'Friend request sent'});
          // Send notification to person who received a request
          this.sendFriendRequestNotif(uid);
        });
      firestore()
        .collection('users')
        .doc(auth().currentUser.uid)
        .update({
          BlockList: firestore.FieldValue.arrayRemove(uid),
        });
    } else {
      this.setState({message: 'Username does not exists.'});
    }

    this.setState({friendUsername:null})
  };


 getProfileByUserID = async userid => {
    const user = await firestore()
      .collection('users')
      .doc(userid)
      .get();
    return user.data();
  };


  sendFriendRequestNotif = async (uid) => {

    const user_data = await this.getProfileByUserID(uid);
    var fcm_token = user_data.fcmtoken;
    const FIREBASE_API_KEY =
      'AAAAU9pUIfA:APA91bFNiuUwGYRATBERB1T2F1fLOaYYl2cpJGPxdVufXdsut2jSTl1NquEeYAa73lIF1wekjundPbqt7eja4oxH8GXzU99GI_I281terZr5Soaa1UuKLtYNqoZHzJ-zk3jv6GYH9DBC';
    const message = {
      registration_ids: [fcm_token],
      notification: {
        title: 'GiveMeAttention',
        body: 'You received a new friend request!',
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
  }

  render() {
    return (
      <ScrollView
        keyboardShouldPersistTaps={'handled'}
        style={styles.container}
        contentContainerStyle={styles.containerContent}>
        <SafeAreaView>
          <View style={styles.banner}>
            <Text style={styles.bannerHeading}>Add Friend</Text>
          </View>
        </SafeAreaView>
        <View style={styles.form}>
          <Text>{this.state.message}</Text>
          <FormTextInput
            value={this.state.friendUsername}
            onChangeText={friendUsername => {
              this.setState({friendUsername});
            }}
            returnKeyType="done"
            label={'Friend Username'}
          />
          <Button label="Add Friend" onPress={() => {
            this.addFriend()
          }
        } />
        </View>
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
    height: 450,
    marginTop: -300,
    paddingTop: 300,
    borderBottomLeftRadius: Dimensions.get('window').width,
    borderBottomRightRadius: Dimensions.get('window').width,
    backgroundColor: COLOURS.WHITE,
    width: Dimensions.get('window').width * 1.75,
    alignItems: 'center',
  },
  bannerHeading: {
    color: COLOURS.DODGER_BLUE,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 36,
    letterSpacing: 2,
    marginTop: 40,
  },
  form: {
    width: '80%',
    marginTop: 20,
  },
});
