import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

export default class RegisterScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      username: '',
      email: '',
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
      if (this.state.username.length >= 5) {
        this.handleSignUp();
      } else {
        this.setState({
          errorMessage: 'Username too short. (min lenght: 5)',
        });
      }
    } else {
      this.setState({errorMessage: 'Username alerdy exists'});
    }
  }

  createUser = (uname, mailid, pname, userid) => {
    console.log('Creating User...');
    firestore()
      .collection('users')
      .doc(userid)
      .set({
        username: uname,
        name: pname,
        email: mailid,
        fcmtoken: this.state.fcm_token,
        friendsList: [],
        friendRequestsList: [],
      })
      .then(() => {
        console.log('User created');
      });
    firestore()
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
      .then(userCredentials => {
        this.createUser(
          this.state.username,
          this.state.email,
          this.state.name,
          auth().currentUser.uid,
        );
        userCredentials.user.updateProfile({
          displayName: this.state.name,
        });
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
        <Text style={styles.greetingTop}>{`Welcome,`}</Text>
        <Text style={styles.greeting}>{`Sign up to get started.`}</Text>

        <View style={styles.errorMessage}>
          {this.state.errorMessage && (
            <Text style={styles.error}>{this.state.errorMessage}</Text>
          )}
        </View>

        <View style={styles.form}>
          <View>
            <Text style={styles.inputTitle}>Full Name</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              onChangeText={name => this.setState({name})}
              value={this.state.name}
            />
          </View>
          <View style={{marginTop: 32}}>
            <Text style={styles.inputTitle}>Username</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              onChangeText={username => {
                this.setState({username});
                this.checkUniqueUsername(username);
              }}
              value={this.state.username}
            />
            <Text>This user: {String(this.state.userExists)}</Text>
          </View>

          <View style={{marginTop: 32}}>
            <Text style={styles.inputTitle}>Email Address</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              onChangeText={email => this.setState({email})}
              value={this.state.email}
            />
          </View>

          <View style={{marginTop: 32}}>
            <Text style={styles.inputTitle}>Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
              onChangeText={password => this.setState({password})}
              value={this.state.password}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={this.validateForm}>
          <Text style={{color: '#FFF', fontWeight: '500'}}>Sign up</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{alignSelf: 'center', marginTop: 32}}>
          <Text
            style={{color: '#414959', fontSize: 13}}
            onPress={() => this.props.navigation.navigate('Login')}>
            Already have an account?{' '}
            <Text style={{fontWeight: '500', color: '#FEA02F'}}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  greetingTop: {
    fontSize: 24,
    fontWeight: '600',
    paddingLeft: 30,
  },
  greeting: {
    marginTop: 12,
    fontSize: 24,
    color: '#FEA02F',
    fontWeight: '600',
    paddingLeft: 30,
  },
  errorMessage: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  error: {
    color: '#E9446A',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  form: {
    marginBottom: 48,
    marginHorizontal: 30,
  },
  inputTitle: {
    color: '#8A8F9E',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  input: {
    borderBottomColor: '#8A8F9E',
    borderBottomWidth: StyleSheet.hairlineWidth,
    height: 40,
    fontSize: 15,
    color: '#161F3D',
  },
  button: {
    marginHorizontal: 30,
    backgroundColor: '#FEA02F',
    borderRadius: 4,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
