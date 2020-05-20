import { observable, action } from "mobx";
import { ProfileController } from "../../controllers/ProfileController";
import { UserStore } from "../../stores/UserStore";

export class HomeStore {
  @observable
  friendusername = "";

  @action
  handlefriendusernameChange = (username) => {
    this.friendusername = username;
  };

  @action
  handleAddFriend = () => {
    ProfileController.sendFriendRequestToUsername(this.friendusername);
  };

  @action
  GetFriendsList = () => {
    return UserStore.friendsList;
  };

  @action
  AcceptFriendRequest = () => {
    ProfileController.addFriend(this.friendusername);
  };
}
