import React from "react";
import { StyleSheet, Text, Image, Dimensions, TouchableOpacity } from "react-native";
import { COLOURS } from "../config/colors";

export class ContactCard extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        style={styles.container}
      >
        <Image source={{uri: this.props.imageURL}} style={styles.image} />
        <Text style={styles.text}>{this.props.name}</Text>
      </TouchableOpacity>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width * 0.4,
    alignItems: "center",
    marginVertical: 15,
    marginHorizontal: 15
  },
  image: {
    width: Dimensions.get('window').width * 0.4,
    height: Dimensions.get('window').width * 0.4,
    borderRadius: Dimensions.get('window').width * 0.4
  },
  text: {
    fontSize: 22,
    color: COLOURS.WHITE,
    fontWeight: "bold",
    paddingTop: 10
  }
});