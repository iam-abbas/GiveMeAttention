import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
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

  getFirendsList = async () => {
    const uid = this.state.uid;
    const userData = await firestore()
      .collection('users')
      .doc(uid)
      .get();
    this.setState({friendsList: userData.data().friendsList});
    let people = {};
    for (var item of this.state.friendsList) {
      let data = await this.getProfileByUserID(item);
      people[item] = data;
    }
    this.setState({people});
  };

  async componentDidMount() {
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
      for (var fid in this.state.people) {
        key++;
        let friend = this.state.people[fid];
        var tempItem = (
          <View key={key}>
            <LeaderboardCard
              profilePicture="https://i.imgur.com/2D7TdPl.jpg"
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
    console.log(this.state.people[0]);
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}>
        <View style={styles.banner}>
          <Text style={styles.needAttention}>top attention givers!</Text>
          <View style={styles.topThree}>
            {this.state.friendsList[1] ? (
              <Image
                source={{
                  uri: 'https://i.imgur.com/2D7TdPl.jpg',
                }}
                style={[styles.dp, styles.dpSecondPlace]}
              />
            ) : null}
            {this.state.friendsList[0] ? (
              <Image
                source={{
                  uri: 'https://i.imgur.com/2D7TdPl.jpg',
                }}
                style={[styles.dp, styles.dpLarge, styles.dpFirstPlace]}
              />
            ) : null}
            {this.state.friendsList[2] ? (
              <Image
                source={{
                  uri: 'https://i.imgur.com/2D7TdPl.jpg',
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
