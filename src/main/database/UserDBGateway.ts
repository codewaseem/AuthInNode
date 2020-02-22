// eslint-disable-next-line no-unused-vars
import { UserDBGateway, SignUpData, User } from "../../app/interfaces";
import UserModel from "./models/UserModel";
import {
  UserAlreadyExists,
  FailedToUpdatePassword,
} from "../../constants/strings";

export default class UserGateway implements UserDBGateway {
  async updatePassword(id: string, newPassword: string): Promise<User> {
    try {
      let user = await UserModel.findById(id);
      if (!user) throw FailedToUpdatePassword;
      user.password = newPassword;
      let updatedUser = await user.save();
      return updatedUser.toJSON();
    } catch (e) {
      throw FailedToUpdatePassword;
    }
  }
  async getUserByEmailAndPassword(
    email: string,
    password: string
  ): Promise<User | null> {
    try {
      let user = await UserModel.findOne({ email }).select("+hashed_password");
      if (!user) return Promise.resolve(null);
      else {
        if (user.isAuthenticated(password)) {
          return Promise.resolve(user.toJSON());
        } else return Promise.resolve(null);
      }
    } catch (e) {
      return Promise.resolve(null);
    }
  }
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await UserModel.findOne({ email });
    } catch (e) {
      return Promise.resolve(null);
    }
  }
  async getUserById(id: string): Promise<User | null> {
    try {
      let user = await UserModel.findById(id);
      if (user) return user.toJSON();
      return null;
    } catch (e) {
      return Promise.resolve(null);
    }
  }
  async addUser(data: SignUpData): Promise<User> {
    try {
      let user = new UserModel(data);
      await user.save();
      return user.toJSON();
    } catch (e) {
      throw UserAlreadyExists;
    }
  }
}
