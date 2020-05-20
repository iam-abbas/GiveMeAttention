import * as React from 'react';
import {View, ScrollView, StyleSheet, Dimensions, Text} from 'react-native';
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
      if (friends_profile.data().friendsList.includes(auth().currentUser.uid)) {
        return this.setState({message: 'This user is already your friend'});
      }
      firestore()
        .collection('users')
        .doc(uid)
        .update(
          'friendRequestsList',
          firestore.FieldValue.arrayUnion(auth().currentUser.uid),
        )
        .then(() => {
          this.setState({message: 'Succesffuly sent friend request'});
        });
    } else {
      this.setState({message: 'Username does not exists.'});
    }
  };

  render() {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}>
        <View style={styles.banner}>
          <Text style={styles.bannerHeading}>Add Friend</Text>
        </View>
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
          <Button label="Add Friend" onPress={this.addFriend} />
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
