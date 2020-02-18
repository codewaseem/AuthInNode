require("dotenv").config();
import sgMail from "@sendgrid/mail";
import config from "../../../config";

sgMail.setApiKey(process.env.SEND_GRID_API_KEY || "");

export default class EMailer {
  static sendSignUpConfirmation(to: string, token: string) {
    return EMailer.send(
      to,
      "Confirm your email to activate your account",
      `
      Click the following link to activate your account
      ${config.SITE_URL}/auth/activate/${token}
    `
    );
  }
  static send(to: string, subject: string, text: string, html?: string) {
    return sgMail.send({
      from: "alphawaseem@gmail.com",
      to,
      subject,
      text,
      html,
    });
  }
}
