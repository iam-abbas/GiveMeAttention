import * as React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Modal,
  Block,
  ScrollView,
} from 'react-native';
import {Button} from '../common/Button';
import {FormTextInput} from '../common/FormTextInput';
import {COLOURS} from '../config/colors';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

export default class LoginScreen extends React.Component {
  state = {
    email: '',
    password: '',
    errorMessage: null,
    fcm_token: null,
    showTerms: false,
    showPrivacy: false,
  };

  handleLogin = async () => {
    const {email, password} = this.state;
    if (email == '' || password == '') {
      return this.setState({errorMessage: 'Please enter the login details.'});
    }
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(async () => {
        if (this.state.fcm_token != null) {
          await firestore()
            .collection('users')
            .doc(auth().currentUser.uid)
            .update({
              fcmtoken: this.state.fcm_token,
            })
            .then(() => {
              console.log('User token updated');
            });
        }
      })
      .catch(error => {
        console.log(error);
        this.setState({errorMessage: error.message});
      });
  };

  requestUserPermission = async () => {
    const settings = await messaging().requestPermission();
    if (settings) {
      console.log('Permission settings:', settings);
    }
  };

  async componentDidMount() {
    await this.requestUserPermission();
    await messaging()
      .getToken()
      .then(fcm_token => {
        return this.setState({fcm_token});
      });
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
        <View style={styles.form}>
          <Text style={styles.heading}>Login.</Text>
          <Text style={{marginTop: 10, color: '#ff8787'}}>
            {this.state.errorMessage}
          </Text>
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
        <View
          style={{
            flexDirection: 'row',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 15,
            marginHorizontal: 5,
          }}>
          <Text style={styles.TOS}>
            By tapping Login, you acknowledge that you have read the{' '}
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
  TOS: {
    color: '#fff',
    opacity: 0.6,
    fontSize: 12,
  },
  link: {
    fontWeight: 'bold',
  },
});
