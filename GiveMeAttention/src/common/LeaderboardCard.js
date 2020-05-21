import React from "react";
import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import { COLOURS } from "../config/colors";

export class LeaderboardCard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let positionStyles = null;
    if(this.props.rank === 0) positionStyles = styles.firstPlace;
    else if(this.props.rank === 1) positionStyles = styles.secondPlace;
    else if(this.props.rank == 2) positionStyles = styles.thirdPlace;
    return (
      <View style={[
        styles.container,
        positionStyles
      ]}>
        <View style={styles.leftSide}>
          <Image source={{uri: this.props.profilePicture}} style={styles.image} />
          <Text style={[styles.name, styles.text, positionStyles]}>{this.props.username}</Text>
        </View>
        <Text style={[styles.score, styles.text, positionStyles]}>{this.props.score}</Text>
      </View>
    );
  }
};

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
    shadowOffset: { width: 0, height: 1 },
    elevation: 5
  },
  text: {
    fontSize: 18,
    lineHeight: 48,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  image: {
    height: 48,
    width: 48,
    marginRight: 20,
    borderRadius: 24
  },
  firstPlace: {
    backgroundColor: COLOURS.GOLDEN,
    color: COLOURS.WHITE
  },
  secondPlace: {
    backgroundColor: COLOURS.PURPLE,
    color: COLOURS.WHITE
  },
  thirdPlace: {
    backgroundColor: COLOURS.CYAN,
    color: COLOURS.WHITE
  }
});