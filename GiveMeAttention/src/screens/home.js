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

  async componentDidMount() {
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
        <View style={styles.banner}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => console.log(1)}
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
          <Text style={styles.username}>Abbas XYZ</Text>
          <TouchableOpacity onPress={this.signOutUser}>
            <Text>Log Out</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <View style={styles.headerButtonContainer}>
            <Button
              style={styles.headerButton}
              label="Add BFFs"
              onPress={() => this.props.navigation.navigate("AddFriend")}
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
        <View style={styles.contacts}>
          {this.state.friendsList.map((fid, key) => {
            let friend = this.state.friendData[fid];
            return (
              <ContactCard
                key={key}
                imageURL="https://i.imgur.com/2D7TdPl.jpg"
                name={friend.username}
                onPress={() => {
                  console.log(friend.username);
                }}
                style={styles.contact}
              />
            );
          })}
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
