import * as React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {COLOURS} from '../config/colors';
import {RequestsCard} from '../common/RequestCard';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

function friendSearch(arr, val) {
  for (var i = 0; i < arr.length; i++)
    if (Object.keys(arr[i]) == val) return arr[i];
  return false;
}

export default class RequestsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: auth().currentUser.uid,
      friendRequestsList: [],
      friendRequestsData: null,
      friendsList: [],
      friendsData: null,
    };
  }

  getProfileByUserID = async userid => {
    const user = await firestore()
      .collection('users')
      .doc(userid)
      .get();
    return user.data();
  };

  confirmFriend = async userid => {
    firestore()
      .collection('users')
      .doc(this.state.uid)
      .update('friendRequestsList', firestore.FieldValue.arrayRemove(userid))
      .then(() => {
        console.log('Removed from friend list');
      });
    let friendRequestsData = {};
    friendRequestsData[userid] = 0;
    firestore()
      .collection('users')
      .doc(this.state.uid)
      .update(
        'friendsList',
        firestore.FieldValue.arrayUnion(friendRequestsData),
      )
      .then(() => {
        console.log('Added to current user friendlist');
      });
    let currentData = {};
    currentData[this.state.uid] = 0;
    firestore()
      .collection('users')
      .doc(userid)
      .update('friendsList', firestore.FieldValue.arrayUnion(currentData))
      .then(() => {
        console.log('Added to users friendlist');
      });
  };

  ignoreFriend = async userid => {
    firestore()
      .collection('users')
      .doc(this.state.uid)
      .update('friendRequestsList', firestore.FieldValue.arrayRemove(userid))
      .then(() => {
        console.log('Removed from friend list');
      });

    let newFL = this.state.friendRequestsList;
    newFL.splice(newFL.indexOf(userid), 1);
    let newFirendsList = this.state.friendsList;
    newFirendsList.push(userid);
    this.setState({friendRequestsList: newFL});
  };

  getProfileByUserID = async userid => {
    const user = await firestore()
      .collection('users')
      .doc(userid)
      .get();
    return user.data();
  };

  UnfriendUser = async fid => {
    let userData = await this.getProfileByUserID(fid);
    let userItem = friendSearch(userData.friendsList, this.state.uid);
    await firestore()
      .collection('users')
      .doc(fid)
      .update('friendsList', firestore.FieldValue.arrayRemove(userItem))
      .then(() => {
        console.log('Removed from user friend list');
      });
    let friendData = await this.getProfileByUserID(this.state.uid);
    let friendItem = friendSearch(friendData.friendsList, fid);
    await firestore()
      .collection('users')
      .doc(this.state.uid)
      .update('friendsList', firestore.FieldValue.arrayRemove(friendItem))
      .then(() => {
        console.log('Removed from friend`s friend list');
      });
  };

  BlockUser = fid => {
    this.UnfriendUser(fid);
    firestore()
      .collection('users')
      .doc(this.state.uid)
      .update('BlockList', firestore.FieldValue.arrayUnion(fid))
      .then(() => {
        console.log('Blocked user');
      });
  };

  getFirendsList = async QuerySnapshot => {
    console.log('Loading data..');
    if (QuerySnapshot) {
      const uid = this.state.uid;
      let userData = QuerySnapshot;
      this.setState({friendRequestsList: userData.data().friendRequestsList});
      let friendRequestsData = {};
      for (var item of this.state.friendRequestsList) {
        let data = await this.getProfileByUserID(item);
        friendRequestsData[item] = data;
      }
      this.setState({friendRequestsData});
      let friendsArray = userData.data().friendsList;
      let friendsList = friendsArray.flatMap(x => Object.keys(x));
      this.setState({friendsList});
      let friendsData = {};
      for (var item of this.state.friendsList) {
        let data = await this.getProfileByUserID(item);
        friendsData[item] = data;
      }
      this.setState({friendsData});
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
      .onSnapshot(this.getFirendsList, this.onError);
  }

  renderFriends = () => {
    console.log('Getting friends component');

    if (this.state.friendsData === null) {
      return (
        <View
          style={{
            marginTop: 50,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color={'#fff'} />
        </View>
      );
    } else {
      return (
        <View style={styles.requests}>
          {this.state.friendsList.length ? (
            this.state.friendsList.map((fid, key) => {
              let friend = this.state.friendsData[fid];
              if (friend) {
                console.log(friend);
                return (
                  <RequestsCard
                    key={key}
                    userAvatar={friend.avatar}
                    username={friend.username}
                    firstLabel="Unfriend"
                    secondLabel="Block"
                    onFirst={() => this.UnfriendUser(fid)}
                    onSecond={() => this.BlockUser(fid)}
                  />
                );
              }
            })
          ) : (
            <View style={styles.noFriends}>
              <Text style={styles.noFriendsText}>
                You do not have any friends.
              </Text>
            </View>
          )}
        </View>
      );
    }
  };

  renderFriendRequests = () => {
    console.log('Getting friend requests component');
    if (this.state.friendRequestsData === null) {
      return (
        <View
          style={{
            marginTop: 50,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color={'#fff'} />
        </View>
      );
    } else {
      return (
        <View style={styles.requests}>
          {this.state.friendRequestsList.length ? (
            this.state.friendRequestsList.map((fid, key) => {
              let friendData = this.state.friendRequestsData[fid];
              if (friendData) {
                return (
                  <RequestsCard
                    key={key}
                    userAvatar={friendData.avatar}
                    username={friendData.username}
                    firstLabel="Confirm"
                    secondLabel="Ignore"
                    onFirst={() => this.confirmFriend(fid)}
                    onSecond={() => this.ignoreFriend(fid)}
                  />
                );
              }
            })
          ) : (
            <View style={styles.noFriends}>
              <Text style={styles.noFriendsText}>
                You do not have any pending friend request.
              </Text>
            </View>
          )}
        </View>
      );
    }
  };
  render() {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}>
        <SafeAreaView>
          <View style={styles.banner}>
            <Text style={styles.bannerHeading}>Friends</Text>
          </View>
        </SafeAreaView>
        <Text style={styles.subTitle}>Friend Requests</Text>
        {this.renderFriendRequests()}
        <Text style={styles.subTitle}>Your Friends</Text>
        {this.renderFriends()}
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
  requests: {
    width: '100%',
    marginTop: 20,
  },
  subTitle: {
    marginTop: 30,
    textAlign: 'left',
    alignItems: 'flex-start',
    padding: 5,
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  noFriends: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFriendsText: {
    color: '#fff',
    opacity: 0.7,
    fontWeight: '600',
    fontSize: 16,
  },
});
