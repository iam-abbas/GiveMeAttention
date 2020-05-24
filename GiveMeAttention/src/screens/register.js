import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  Platform,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
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
    showTerms: false,
    showPrivacy: false,
    };
    this.validateForm = this.validateForm.bind(this);
  }

  requestUserPermission = async () => {
    const settings = await messaging().requestPermission();
    if (settings) {
      console.log('Permission settings:', settings);
    }
  };

  checkUniqueUsername = () => {
    var uname = this.state.username;
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
      if (this.state.username.length < 3) {
        return (
          <Text style={styles.usernameError}>
            Usernames must be at least 3 characters long
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

  changeUsernameToLowercase = (input) => {
  var temp = input.toLowerCase()
  this.setState({username: temp})
}

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


  renderTermsServices = () => {
    return (
      <Modal animationType="slide" visible={this.state.showTerms}>
        <View style={{padding: 30}}>
          <Text
            style={{
              color: '#1f1f1f',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
            Terms of Service
          </Text>
          <ScrollView style={{marginTop: 20, marginBottom: 50}}>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              1. By accessing our app, GiveMeAttention, you are agreeing to be
              bound by these terms of service, all applicable laws and
              regulations, and agree that you are responsible for compliance
              with any applicable local laws. If you do not agree with any of
              these terms, you are prohibited from using or accessing
              GiveMeAttention. The materials contained in GiveMeAttention are
              protected by applicable copyright and trademark law.
            </Text>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              2. Use License Permission is granted to temporarily download one
              copy of GiveMeAttention per device for personal, non-commercial
              transitory viewing only. This is the grant of a license, not a
              transfer of title, and under this license you may not: modify or
              copy the materials; use the materials for any commercial purpose,
              or for any public display (commercial or non-commercial); attempt
              to decompile or reverse engineer any software contained in
              GiveMeAttention; remove any copyright or other proprietary
              notations from the materials; or transfer the materials to another
              person or "mirror" the materials on any other server.
            </Text>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              3.This license shall automatically terminate if you violate any of
              these restrictions and may be terminated by GiveMeAttention at any
              time. Upon terminating your viewing of these materials or upon the
              termination of this license, you must destroy any downloaded
              materials in your possession whether in electronic or printed
              format.
            </Text>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              4.The materials within GiveMeAttention are provided on an 'as is'
              basis. GiveMeAttention makes no warranties, expressed or implied,
              and hereby disclaims and negates all other warranties including,
              without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or
              non-infringement of intellectual property or other violation of
              rights.
            </Text>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              5. Further, GiveMeAttention does not warrant or make any
              representations concerning the accuracy, likely results, or
              reliability of the use of the materials on its website or
              otherwise relating to such materials or on any sites linked to
              GiveMeAttention.
            </Text>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              6. In no event shall GiveMeAttention or its suppliers be liable
              for any damages (including, without limitation, damages for loss
              of data or profit, or due to business interruption) arising out of
              the use or inability to use GiveMeAttention, even if
              GiveMeAttention or a GiveMeAttention authorized representative has
              been notified orally or in writing of the possibility of such
              damage. Because some jurisdictions do not allow limitations on
              implied warranties, or limitations of liability for consequential
              or incidental damages, these limitations may not apply to you.
            </Text>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              7. The materials appearing in GiveMeAttention could include
              technical, typographical, or photographic errors. GiveMeAttention
              does not warrant that any of the materials on GiveMeAttention are
              accurate, complete or current. GiveMeAttention may make changes to
              the materials contained in GiveMeAttention at any time without
              notice. However GiveMeAttention does not make any commitment to
              update the materials.
            </Text>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              8. GiveMeAttention has not reviewed all of the sites linked to its
              app and is not responsible for the contents of any such linked
              site. The inclusion of any link does not imply endorsement by
              GiveMeAttention of the site. Use of any such linked website is at
              the user's own risk.
            </Text>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              9.GiveMeAttention may revise these terms of service for its app at
              any time without notice. By using GiveMeAttention you are agreeing
              to be bound by the then current version of these terms of service.
            </Text>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              10. These terms and conditions are governed by and construed in
              accordance with the laws of Ontario, Canada and you irrevocably
              submit to the exclusive jurisdiction of the courts in that State
              or location.
            </Text>
          </ScrollView>
          <View
            style={{
              padding: 20,
              alignSelf: 'center',
              position: 'absolute',
              bottom: 0,
              justifyContent: 'center',
            }}>
            <TouchableOpacity onPress={() => this.setState({showTerms: false})}>
              <Text
                style={{
                  backgroundColor: COLOURS.DODGER_BLUE,
                  paddingHorizontal: 60,
                  borderRadius: 50,
                  paddingVertical: 15,
                  color: '#fff',
                  marginBottom: 5,
                }}>
                I Agree
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  renderPrivacy() {
    return (
      <Modal animationType="slide" visible={this.state.showPrivacy}>
        <View style={{padding: 30}}>
          <Text
            style={{
              color: '#1f1f1f',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
            Privacy Policy
          </Text>
          <ScrollView style={{marginTop: 20, marginBottom: 50}}>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              Your privacy is important to us. It is GiveMeAttention's policy to
              respect your privacy regarding any information we may collect from
              you through our app, GiveMeAttention.
            </Text>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              We only ask for personal information when we truly need it to
              provide a service to you. We collect it by fair and lawful means,
              with your knowledge and consent. We also let you know why we’re
              collecting it and how it will be used.
            </Text>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              We only retain collected information for as long as necessary to
              provide you with your requested service. What data we store, we’ll
              protect within commercially acceptable means to prevent loss and
              theft, as well as unauthorized access, disclosure, copying, use or
              modification.
            </Text>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              We don’t share any personally identifying information publicly or
              with third-parties, except when required to by law.
            </Text>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              Our app may link to external sites that are not operated by us.
              Please be aware that we have no control over the content and
              practices of these sites, and cannot accept responsibility or
              liability for their respective privacy policies.
            </Text>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              You are free to refuse our request for your personal information,
              with the understanding that we may be unable to provide you with
              some of your desired services.
            </Text>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              Your continued use of our app will be regarded as acceptance of
              our practices around privacy and personal information. If you have
              any questions about how we handle user data and personal
              information, feel free to contact us.
            </Text>
            <Text
              style={{
                marginBottom: 12,
                textAlign: 'justify',
                fontSize: 12,
                color: '#666666',
              }}>
              This policy is effective as of 23 May 2020.
            </Text>
          </ScrollView>
          <View
            style={{
              padding: 20,
              alignSelf: 'center',
              position: 'absolute',
              bottom: 0,
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              onPress={() => this.setState({showPrivacy: false})}>
              <Text
                style={{
                  backgroundColor: COLOURS.DODGER_BLUE,
                  paddingHorizontal: 60,
                  borderRadius: 50,
                  paddingVertical: 15,
                  color: '#fff',
                  marginBottom: 5,
                }}>
                I Understand
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.form} contentContainerStyle={styles.formContainter}>
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
              this.changeUsernameToLowercase(username);
              this.checkUniqueUsername();
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
        </ScrollView>
        <View
          style={{
            flexDirection: 'row',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            paddingVertical: 15,
            paddingHorizontal: 5,
            backgroundColor: COLOURS.DODGER_BLUE,
          }}>
          <Text style={styles.TOS}>
            By tapping Register, you acknowledge that you have read the{' '}
          </Text>
          <TouchableOpacity onPress={() => this.setState({showPrivacy: true})}>
            <Text style={[styles.TOS, styles.link]}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.TOS}> and agree to the </Text>
          <TouchableOpacity onPress={() => this.setState({showTerms: true})}>
            <Text style={[styles.TOS, styles.link]}>Terms of Services.</Text>
          </TouchableOpacity>
        </View>
        {this.renderTermsServices()}
        {this.renderPrivacy()}
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
    width: '100%',
    paddingHorizontal: Dimensions.get('window').width * 0.1,
    paddingTop: Dimensions.get('window').height * 0.1
  },
  formContainer: {
    justifyContent: 'center',
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
    TOS: {
    color: '#fff',
    opacity: 0.6,
    fontSize: 12,
  },
  link: {
    fontWeight: 'bold',
  },
});
