import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {COLOURS} from '../config/colors';
import FastImage from 'react-native-fast-image';


export class RequestsCard extends React.Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    console.log('Hi');
  }

  render() {
    let positionStyles = null;
    return (
      <View style={[styles.container]}>
        <View style={styles.leftSide}>
          <FastImage source={{uri: this.props.userAvatar}} style={styles.image} />
          <Text style={[styles.name, styles.text]}>{this.props.username}</Text>
        </View>
        <View style={styles.rightSide}>
          <TouchableOpacity style={styles.btn} onPress={this.props.onFirst}>
            <Text style={[styles.btnText, styles.goodBtn]}>
              {this.props.firstLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={this.props.onSecond}>
            <Text style={[styles.btnText, styles.badBtn]}>
              {this.props.secondLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLOURS.WHITE,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 7.5,
    padding: 15,
    justifyContent: 'space-between',
    borderRadius: 10,
    shadowColor: '#000',
    shadowRadius: 2,
    shadowOpacity: 0.8,
    shadowOffset: {width: 0, height: 1},
    elevation: 5,
  },
  text: {
    fontSize: 18,
    lineHeight: 48,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: COLOURS.DODGER_BLUE,
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    height: 48,
    width: 48,
    marginRight: 20,
    borderRadius: 24,
  },
  rightSide: {
    flexDirection: 'row',
  },
  btn: {
    paddingHorizontal: 10,
  },
  btnText: {
    lineHeight: 48,
  },
  goodBtn: {
    color: '#1f1f1f',
  },
  badBtn: {
    color: 'red',
  },
});
