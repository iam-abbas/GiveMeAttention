import React from "react";
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity
} from "react-native";
import { Button } from "../../common/Button";
import { FormTextInput } from "../../common/FormTextInput";
import { HomeStore } from "./state";
import { UserStore } from "../../stores/UserStore";
import { COLOURS } from "../../config/colors";
import { ContactCard } from "../../common/ContactCard";
import { observer } from "mobx-react";
import { Logger } from "../../logging/Logger";
import { ProfileActionController } from "../../controllers/ProfileActionController";
import { ProfileController } from "../../controllers/ProfileController";

@observer
export class HomePage extends React.Component {
  state = new HomeStore();

  render() {
    console.log(this.state.friendsList);
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
      >
        <View style={styles.banner}>
          <View style={styles.topBar}>
            <TouchableOpacity 
              onPress={() => this.props.navigation.navigate('Requests')}
              style={styles.topButton}
            >
              <Text style={styles.topButtonText}>Friend Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => this.props.navigation.navigate('AddFriend')}
              style={styles.topButton}
            >
              <Text style={styles.topButtonText}>Add Friend</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.needAttention}>give me attention!</Text>
          <Image
            source={{
              uri: UserStore.userAvatar,
            }}
            style={[styles.dp, styles.dpLarge]}
          />
          <Text style={styles.username}>{UserStore.username}</Text>
        </View>
        <View style={styles.header}>
          <View style={styles.headerButtonContainer}>
            <Button
              style={styles.headerButton}
              label="Add BFFs"
              onPress={() => console.log("add friend")}
            />
          </View>
          <View style={styles.headerButtonContainer}>
            <Button
              style={styles.headerButton}
              label="Leaderboard"
              lightButton={true}
              onPress={() => this.props.navigation.navigate("Leaderboard")}
            />
          </View>
        </View>
        <View style={styles.contacts}>
          {UserStore.friendsList
            ? UserStore.friendsList.map((friend) => {
                return (
                  <ContactCard
                    imageURL={friend.pictureURL}
                    name={friend.username}
                    onPress={() => {
                      Logger.log(
                        `Pressed ${friend.username}. Initiating push notification.`
                      );
                      ProfileActionController.pingFriend(friend.username);
                    }}
                    style={styles.contact}
                  />
                );
              })
            : null}
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: COLOURS.DODGER_BLUE,
  },
  containerContent: {
    justifyContent: "flex-start",
    alignItems: "center",
  },
  banner: {
    height: Dimensions.get("window").height * 0.475,
    borderBottomLeftRadius: Dimensions.get("window").width,
    borderBottomRightRadius: Dimensions.get("window").width,
    backgroundColor: COLOURS.WHITE,
    width: "170%",
    alignItems: "center",
  },
  needAttention: {
    color: COLOURS.DODGER_BLUE,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 36,
    letterSpacing: 2,
    marginTop: 40,
  },
  topBar: {
    flexDirection: 'row',
    width: Dimensions.get('window').width,
    justifyContent: 'space-between'
  },
  topButton: {
    padding: 15
  },
  topButtonText: {
    color: COLOURS.DODGER_BLUE,
    fontWeight: 'bold'
  },
  dp: {
    width: Dimensions.get("window").width * 0.4,
    height: Dimensions.get("window").width * 0.4,
    borderRadius: Dimensions.get("window").width * 0.2,
  },
  dpLarge: {
    marginTop: 30,
  },
  username: {
    color: COLOURS.DODGER_BLUE,
    fontWeight: "bold",
    marginTop: 25,
    fontSize: 25,
    letterSpacing: 1,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  headerButtonContainer: {
    width: "40%",
    marginHorizontal: 10,
    marginTop: 20,
  },
  contacts: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 30,
  },
});
