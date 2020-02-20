import AuthInteractor from "../app/controllers/auth";
import UserGateway from "./database/UserDBGateway";
import EMailer from "./mail";

export const authInteractor = new AuthInteractor({
  userDbGateway: new UserGateway(),
  authMailer: EMailer,
});
