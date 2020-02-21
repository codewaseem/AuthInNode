require("dotenv").config();
import sgMail from "@sendgrid/mail";
import config from "../../config";
// eslint-disable-next-line no-unused-vars
import { AuthMailer } from "../../app/interfaces";

sgMail.setApiKey(process.env.SEND_GRID_API_KEY || "");

class EMailer implements AuthMailer {
  sendPasswordResetLink(to: string, token: string): Promise<any> {
    return this.send(
      to,
      "Password reset request link",
      `
      Click the following link to reset your account password
      ${config.SITE_URL}/auth/reset-password/${token}
    `
    );
  }
  sendSignUpConfirmation(to: string, token: string) {
    return this.send(
      to,
      "Confirm your email to activate your account",
      `
      Click the following link to activate your account
      ${config.SITE_URL}/auth/activate/${token}
    `
    );
  }
  send(to: string, subject: string, text: string, html?: string) {
    return sgMail.send({
      from: "alphawaseem@gmail.com",
      to,
      subject,
      text,
      html,
    });
  }
}

export default new EMailer();
