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

export default class RequestsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: auth().currentUser.uid,
      friendRequestsList: [],
      friendData: null,
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
    firestore()
      .collection('users')
      .doc(this.state.uid)
      .update('friendsList', firestore.FieldValue.arrayUnion(userid))
      .then(() => {
        console.log('Added to current user friendlist');
      });
    firestore()
      .collection('users')
      .doc(userid)
      .update('friendsList', firestore.FieldValue.arrayUnion(this.state.uid))
      .then(() => {
        console.log('Added to users friendlist');
      });
    let newFL = this.state.friendRequestsList;
    newFL.splice(newFL.indexOf(userid), 1);
    this.setState({friendRequestsList: newFL});
    let friends = this.state.friendData;
    delete friends[userid];
    this.setState({friendData: friends});
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
    this.setState({friendRequestsList: newFL});
    let friends = this.state.friendData;
    delete friends[userid];
    this.setState({friendData: friends});
  };

  getFirendsList = async () => {
    const uid = this.state.uid;
    const userData = await firestore()
      .collection('users')
      .doc(uid)
      .get();
    console.log(userData.data().friendRequestsList);
    this.setState({friendRequestsList: userData.data().friendRequestsList});
    let friendData = {};
    for (var item of this.state.friendRequestsList) {
      let data = await this.getProfileByUserID(item);
      friendData[item] = data;
    }
    this.setState({friendData});
  };

  async componentDidMount() {
    this.getFirendsList();
  }

  render() {
    if (this.state.friendData === null) {
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
        <SafeAreaView>
          <View style={styles.banner}>
            <Text style={styles.bannerHeading}>Friend Requests</Text>
          </View>
        </SafeAreaView>
        <View style={styles.requests}>
          {this.state.friendRequestsList.length ? (
            this.state.friendRequestsList.map((fid, key) => {
              let friend = this.state.friendData[fid];
              return (
                <RequestsCard
                  key={key}
                  userAvatar={friend.avatar}
                  username={friend.username}
                  onConfirm={() => this.confirmFriend(fid)}
                  onIgnore={() => this.ignoreFriend(fid)}
                />
              );
            })
          ) : (
            <View style={styles.noFriends}>
              <Text style={styles.noFriendsText}>
                You do not have friends :(
              </Text>
            </View>
          )}
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
  requests: {
    width: '100%',
    marginTop: 20,
  },
  noFriends: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFriendsText: {
    color: '#fff',
    paddingTop: 40,
    fontWeight: '600',
    fontSize: 18,
  },
});
