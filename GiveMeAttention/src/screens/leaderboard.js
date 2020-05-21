import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {Button} from '../common/Button';
import {FormTextInput} from '../common/FormTextInput';
import {COLOURS} from '../config/colors';
import {LeaderboardCard} from '../common/LeaderboardCard';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default class LeaderboardScreen extends React.Component {
  state = {
    uid: auth().currentUser.uid,
    friendsList: [],
    people: null,
  };

  getProfileByUserID = async userid => {
    const user = await firestore()
      .collection('users')
      .doc(userid)
      .get();
    return user.data();
  };

  getFirendsList = async QuerySnapshot => {
    console.log('Getting friends');
    if (QuerySnapshot) {
      let userData = QuerySnapshot;
      this.setState({friendsList: userData.data().friendsList});
      let people = {};
      people[this.state.uid] = await this.getProfileByUserID(this.state.uid);
      console.log(people);
      for (var item of this.state.friendsList) {
        let data = await this.getProfileByUserID(item);
        people[item] = data;
      }
      console.log(Array(people));
      people = Object.keys(people)
        .sort(function(a, b) {
          return people[a].points.toString().localeCompare(people[b].points);
        })
        .map(function(k) {
          return people[k];
        });
      this.setState({people});
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
    this.getFirendsList();
  }

  renderFriends = () => {
    if (this.state.people === null) {
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
      var key = 0;
      var output = [];
      for (var friend of this.state.people) {
        key++;
        var tempItem = (
          <View key={key}>
            <LeaderboardCard
              profilePicture={friend.avatar}
              username={friend.username}
              score={friend.points}
              rank={key}
              style={styles.leaderboardEntry}
            />
          </View>
        );
        output[key] = tempItem;
      }
      return output;
    }
  };

  render() {
    if (this.state.people === null) {
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
            <Text style={styles.needAttention}>top attention givers!</Text>
          </SafeAreaView>
          <View style={styles.topThree}>
            {Object.keys(this.state.people)[1] ? (
              <Image
                source={{
                  uri: this.state.people[1]['avatar'],
                }}
                style={[styles.dp, styles.dpSecondPlace]}
              />
            ) : null}
            {Object.keys(this.state.people)[0] ? (
              <Image
                source={{
                  uri: this.state.people[0]['avatar'],
                }}
                style={[styles.dp, styles.dpLarge, styles.dpFirstPlace]}
              />
            ) : null}
            {Object.keys(this.state.people)[2] ? (
              <Image
                source={{
                  uri: this.state.people[2]['avatar'],
                }}
                style={[styles.dp, styles.dpThirdPlace]}
              />
            ) : null}
          </View>
        </View>
        <View style={styles.leaderboard}>{this.renderFriends()}</View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: COLOURS.LIGHT_SILVER,
  },
  containerContent: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  banner: {
    borderBottomLeftRadius: Dimensions.get('window').width * 2,
    borderBottomRightRadius: Dimensions.get('window').width * 2,
    backgroundColor: COLOURS.DODGER_BLUE,
    width: '170%',
    alignItems: 'center',
    height: Dimensions.get('window').height * 0.425,
  },
  needAttention: {
    color: COLOURS.WHITE,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 36,
    letterSpacing: 2,
    marginTop: 80,
  },
  topThree: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 30,
  },
  dp: {
    width: Dimensions.get('window').width * 0.225,
    height: Dimensions.get('window').width * 0.225,
    borderRadius: Dimensions.get('window').width * 0.225,
    margin: 10,
    borderWidth: 5,
  },
  dpLarge: {
    width: Dimensions.get('window').width * 0.3,
    height: Dimensions.get('window').width * 0.3,
    borderRadius: Dimensions.get('window').width * 0.15,
  },
  dpFirstPlace: {
    borderColor: COLOURS.GOLDEN,
  },
  dpSecondPlace: {
    borderColor: COLOURS.PURPLE,
  },
  dpThirdPlace: {
    borderColor: COLOURS.CYAN,
  },
  leaderboard: {
    width: '100%',
    marginVertical: 20,
  },
  leaderboardEntry: {
    width: '90%',
  },
});
