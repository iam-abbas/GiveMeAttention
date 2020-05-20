import * as React from 'react';
import {StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import {Button} from '../common/Button';
import {FormTextInput} from '../common/FormTextInput';
import {COLOURS} from '../config/colors';
import auth from '@react-native-firebase/auth';

export default class LoginScreen extends React.Component {
  state = {
    email: '',
    password: '',
    errorMessage: null,
  };

  handleLogin = () => {
    const {email, password} = this.state;

    auth()
      .signInWithEmailAndPassword(email, password)
      .catch(error => this.setState({errorMessage: error.message}));
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.heading}>Login.</Text>
          <FormTextInput
            value={this.state.email}
            onChangeText={email => this.setState({email})}
            returnKeyType="done"
            label={'Email'}
          />
          <FormTextInput
            value={this.state.password}
            secureTextEntry={true}
            returnKeyType="done"
            onChangeText={password => this.setState({password})}
            label={'Password'}
          />
          <View style={styles.actionButton}>
            <Button label={'Login'} onPress={this.handleLogin} />
          </View>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('Register')}>
            <Text style={styles.gotoRegister}>
              Need an account? Click here to register.
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
    backgroundColor: COLOURS.DODGER_BLUE,
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    width: '80%',
  },
  actionButton: {
    marginTop: 40,
  },
  heading: {
    color: COLOURS.WHITE,
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  gotoRegister: {
    color: COLOURS.DODGER_BLUE_LIGHTER,
    marginVertical: 20,
    textAlign: 'center',
  },
});
