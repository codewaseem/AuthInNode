// eslint-disable-next-line no-unused-vars
import { UserDBGateway, SignUpData, User } from "../interfaces";

export default class UserGateway implements UserDBGateway {
  addUser(data: SignUpData): Promise<User> {
    console.log(data);
    return Promise.resolve({} as User);
  }
}
