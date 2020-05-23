import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import ImagePicker from 'react-native-image-picker';
import {check, PERMISSIONS, request} from 'react-native-permissions';
import {Button} from '../common/Button';
import {FormTextInput} from '../common/FormTextInput';
import {COLOURS} from '../config/colors';
//import Ionicons from 'react-native-ionicons';
import storage from '@react-native-firebase/storage';

export default class RegisterScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      username: '',
      email: '',
      avatar: 'https://i.imgur.com/wA1GJTg.png',
      password: '',
      fcm_token: null,
      errorMessage: null,
      userExists: false,
    };
    this.validateForm = this.validateForm.bind(this);
  }

  requestUserPermission = async () => {
    const settings = await messaging().requestPermission();
    if (settings) {
      console.log('Permission settings:', settings);
    }
  };

  checkUniqueUsername = uname => {
    firestore()
      .collection('usernames')
      .doc(uname)
      .get()
      .then(documentSnapshot => {
        return this.setState({userExists: documentSnapshot.exists});
      });
  };

  handleUniqueUsername = () => {
    if (this.state.username.length) {
      if (this.state.username.length < 5) {
        return (
          <Text style={styles.usernameError}>
            Usernames must be at least 5 characters long
          </Text>
        );
      } else if (this.state.userExists) {
        return (
          <Text style={styles.usernameError}>
            {this.state.username} is already taken.
          </Text>
        );
      } else {
        return (
          <Text style={styles.usernameSuccess}>
            {this.state.username} is available!
          </Text>
        );
      }
    }
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
        const source = {uri: response.uri};
        this.setState({avatar: response.uri});
      }
    });
  };

  async validateForm() {
    console.log('Validation');
    if (
      this.state.name.length < 1 ||
      this.state.email.length < 1 ||
      this.state.password.length < 1
    ) {
      this.setState({
        errorMessage: 'Please complete all the fields.',
      });
    } else if (!this.state.userExists) {
      if (this.state.username.length >= 3) {
        this.handleSignUp();
      } else {
        this.setState({
          errorMessage: 'Username too short. (min length: 3)',
        });
      }
    } else {
      this.setState({errorMessage: 'Username alerdy exists'});
    }
  }

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
        snapshot => {},
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

  createUser = async (uname, mailid, pname, avatar, userid) => {
    console.log('Creating User...');
    let avt = await this.uploadPhoto(userid, avatar);
    await firestore()
      .collection('users')
      .doc(userid)
      .set({
        username: uname,
        name: pname,
        email: mailid,
        fcmtoken: this.state.fcm_token,
        points: 0,
        avatar: avt,
        friendsList: [],
        friendRequestsList: [],
      })
      .then(() => {
        console.log('User created');
      });
    await firestore()
      .collection('usernames')
      .doc(uname)
      .set({
        uid: userid,
      })
      .then(() => {
        console.log('Usename registered!');
      });
  };

  handleSignUp = () => {
    auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        this.createUser(
          this.state.username,
          this.state.email,
          this.state.name,
          this.state.avatar,
          auth().currentUser.uid,
        );
        return console.log('Hi');
      })
      .catch(error => this.setState({errorMessage: error.message}));
  };

  async componentDidMount() {
    messaging()
      .getToken()
      .then(fcm_token => {
        return this.setState({fcm_token});
      });
    this.requestUserPermission();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.heading}>Register.</Text>
          <TouchableOpacity
            style={styles.avatar}
            onPress={this.handlePickAvatar}>
            <Image
              source={{uri: this.state.avatar}}
              style={styles.avatarPlaceholder}
            />

          </TouchableOpacity>
          <FormTextInput
            value={this.state.name}
            onChangeText={name => {
              this.setState({name});
            }}
            returnKeyType="done"
            label={'Full Name'}
          />
          <FormTextInput
            value={this.state.email}
            onChangeText={email => this.setState({email})}
            returnKeyType="done"
            label={'Email'}
          />
          <FormTextInput
            value={this.state.username}
            onChangeText={username => {
              this.setState({username});
              this.checkUniqueUsername(username);
            }}
            returnKeyType="done"
            label={'Username'}
          />
          {this.handleUniqueUsername()}
          <FormTextInput
            value={this.state.password}
            secureTextEntry={true}
            returnKeyType="done"
            onChangeText={password => this.setState({password})}
            label={'Password'}
          />
          <View style={styles.actionButton}>
            <Button label={'Register'} onPress={this.validateForm} />
          </View>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('Login')}>
            <Text style={styles.gotoLogin}>
              Already have an account? Click here to login.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: COLOURS.DODGER_BLUE,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    width: '80%',
  },
  heading: {
    color: COLOURS.WHITE,
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionButton: {
    marginTop: 40,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E1E2E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  gotoLogin: {
    color: COLOURS.DODGER_BLUE_LIGHTER,
    marginVertical: 20,
    textAlign: 'center',
  },
  usernameError: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffb3b3',
  },
  usernameSuccess: {
    fontSize: 12,
    fontWeight: '500',
    color: '#b3ffbe',
  },
});
