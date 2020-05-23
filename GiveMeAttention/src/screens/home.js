import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Vibration,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Button} from '../common/Button';
import {COLOURS} from '../config/colors';
import {ContactCard} from '../common/ContactCard';
import ImagePicker from 'react-native-image-picker';
import {check, PERMISSIONS, request} from 'react-native-permissions';
import storage from '@react-native-firebase/storage';

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
    this.props.navigation.addListener('didFocus', () => {
      this.fetchUserData();
    });
  }

  signOutUser = () => {
    auth()
      .signOut()
      .then(() => console.log('User signed out!'));
  };

  uploadPhoto = async (user_id, uri) => {
    const path = `users/${user_id}/avatar/profile_pic.jpg`;
    return new Promise(async (res, rej) => {
      const response = await fetch(uri);
      const file = await response.blob();
      let upload = storage()
        .ref(path)
        .put(file);
      upload.on(
        'state_changed',
        () => {},
        err => {
          rej(err);
        },
        async () => {
          const url = await upload.snapshot.ref.getDownloadURL();
          res(url);
        },
      );
    });
  };

  updateAvatar = async req_uri => {
    let avatar = await this.uploadPhoto(this.state.uid, req_uri);
    await firestore()
      .collection('users')
      .doc(this.state.uid)
      .update('avatar', avatar)
      .then(() => {
        console.log('Updated Avatar');
      });
  };

  handlePickAvatar = async () => {
    // Get permission
    check(PERMISSIONS.IOS.PHOTO_LIBRARY)
      .then(RESULTS => {
        console.log(RESULTS);
        switch (RESULTS) {
          case RESULTS.UNAVAILABLE:
            console.log(
              'This feature is not available (on this device / in this context)',
            );
            break;
          case RESULTS.DENIED:
            'The permission has not been requested / is denied but requestable',
              request(
                Platform.select({
                  android: PERMISSIONS.ANDROID.CAMERA,
                  ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
                }),
              );
            break;
          case RESULTS.GRANTED:
            console.log('The permission is granted');
            break;
          case RESULTS.BLOCKED:
            console.log('The permission is denied and not requestable anymore');
            break;
        }
      })
      .catch(error => {
        console.log(error);
      });

    // Get the image
    const options = {
      title: 'Select Avatar',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.showImagePicker(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        this.setState({avatar: response.uri});
        this.updateAvatar(response.uri);
      }
    });
  };

  getProfileByUserID = async userid => {
    const user = await firestore()
      .collection('users')
      .doc(userid)
      .get();
    return user.data();
  };

  checkNotification = (notif_map, k) => {
    if (!notif_map[k]) {
      notif_map[k] = [Math.round(Date.now() / 60000)];
      return true;
    }
    if (
      Date.now() / 60000 - notif_map[k][0] > 30 &&
      notif_map[k].length >= 10
    ) {
      notif_map[k].push(Math.round(Date.now() / 60000));
      notif_map[k].shift();
      return true;
    } else if (notif_map[k].length < 10) {
      notif_map[k].push(Math.round(Date.now() / 60000));
      return true;
    } else {
      return false;
    }
  };

  notificationExceed = () =>
    Alert.alert(
      'Notification Limit Exceeded',
      'You can only send 10 notifications every 30 minutes to each user!',
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      {cancelable: false},
    );

  sendUserNotification = async username => {
    Vibration.vibrate(50);
    const user_prof = await firestore()
      .collection('usernames')
      .doc(username)
      .get();
    var f_id = user_prof.data().uid;
    let currentData = await this.getProfileByUserID(this.state.uid);

    if (currentData.notificationsData) {
      var notificationsData = currentData.notificationsData;
    } else {
      var notificationsData = {};
    }
    if (!this.checkNotification(notificationsData, f_id)) {
      this.notificationExceed();
      return console.log('Exceeded Notifications');
    }

    let newFriendsList = currentData.friendsList;
    for (var item of newFriendsList) {
      if (Object.keys(item) == f_id) {
        item[f_id] = Date.now();
      }
    }
    await firestore()
      .collection('users')
      .doc(this.state.uid)
      .update({
        friendsList: newFriendsList,
        notificationsData: notificationsData,
      })
      .then(() => {
        console.log('Updated FriendsList');
      });

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
    if (QuerySnapshot) {
      let userData = QuerySnapshot;
      if (userData.exists) {
        this.setState({username: userData.data().username});
        this.setState({name: userData.data().name});
        this.setState({firendReq: userData.data().friendRequestsList});
        let friendsArray = userData.data().friendsList;
        friendsArray.sort(function(a, b) {
          return Object.values(b) - Object.values(a);
        });
        let friendsList = friendsArray.flatMap(x => Object.keys(x));
        this.setState({friendsList});
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
                onPress={() => this.props.navigation.navigate('Friends')}
                style={styles.topButton}>
                <Text style={styles.topButtonText}>Friends</Text>
                {this.state.firendReq.length ? (
                  <View style={styles.newIndicator} />
                ) : null}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.signOutUser}
                style={styles.topButton}>
                <Text style={styles.topButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          <Text style={styles.needAttention}>Give Me Attention</Text>
          <TouchableOpacity onPress={this.handlePickAvatar}>
            <Image
              source={{
                uri: this.state.avatar,
              }}
              style={[styles.dp, styles.dpLarge]}
            />
          </TouchableOpacity>
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
        <Text style={styles.msg}>Tap on user to send notification</Text>
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
    borderBottomLeftRadius: Dimensions.get('window').width,
    borderBottomRightRadius: Dimensions.get('window').width,
    backgroundColor: COLOURS.WHITE,
    width: '170%',
    alignItems: 'center',
    paddingBottom: 42,
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
  msg: {
    marginTop: 30,
    color: '#fff',
    fontSize: 12,
    opacity: 0.5,
    textTransform: 'uppercase',
    fontWeight: '900',
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
    backgroundColor: COLOURS.ROYAL_RED,
  },
});
