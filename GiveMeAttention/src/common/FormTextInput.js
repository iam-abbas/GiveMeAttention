import * as React from "react";
import { StyleSheet, View, TextInputProps } from "react-native";
import { COLOURS } from "../config/colors";
import { TextField } from "react-native-material-textfield";

export class FormTextInput extends React.Component {
  render() {
    const { style, ...otherProps } = this.props;
    return (
      <View style={styles.container}>
        <TextField
          selectionColor={COLOURS.DODGER_BLUE}
          style={styles.textInput}
          autoCapitalize="none"
          tintColor={COLOURS.ALMOST_WHITE}
          baseColor={COLOURS.DODGER_BLUE_LIGHTER}
          placeholderTextColor={COLOURS.LIGHT_SILVER}
          {...otherProps}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textInput: {
    color: COLOURS.WHITE,
    fontSize: 13
  },
});