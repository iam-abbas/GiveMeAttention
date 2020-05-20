import * as React from "react";
import { StyleSheet, Text, TouchableHighlight } from "react-native";
import { COLOURS } from "../config/colors";

export class Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonClicked: false
    }
  }
  render() {
    const { label, onPress, lightButton } = this.props;
    return (
      <TouchableHighlight 
        style={[
          styles.container, 
          this.state.buttonClicked ? styles.clickedContainer : null,
          lightButton ? styles.lightButton : null
        ]}
        underlayColor={COLOURS.WHITE}
        onShowUnderlay={() => this.setState({buttonClicked: true})}
        onHideUnderlay={() => this.setState({buttonClicked: false})}
        onPress={onPress}
      >
        <Text style={[
          styles.text, 
          this.state.buttonClicked ? styles.clicked : null,
          lightButton ? styles.lightButtonText : null 
        ]}>
          {label}
        </Text>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    marginTop: 12,
    paddingVertical: 15,
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: COLOURS.DODGER_BLUE_LIGHTER,
  },
  clickedContainer: {
    borderColor: COLOURS.WHITE
  },
  text: {
    textAlign: "center",
    lineHeight: 30,
    fontSize: 16,
    color: COLOURS.WHITE
  },
  clicked: {
    color: COLOURS.DODGER_BLUE
  },
  lightButton: {
    backgroundColor: COLOURS.WHITE,
    borderColor: COLOURS.WHITE,
  },
  lightButtonText: {
    color: COLOURS.DODGER_BLUE,
  }
});