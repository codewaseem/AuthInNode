require("dotenv").config();
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SEND_GRID_API_KEY || "");

const DefaultMessageObject = {
  to: "codewaseem@gmail.com",
  from: "alphawaseem@gmail.com",
};

export default class EMailer {
  static send(subject: string, text: string, html?: string) {
    sgMail.send({ ...DefaultMessageObject, subject, text, html });
  }
}
