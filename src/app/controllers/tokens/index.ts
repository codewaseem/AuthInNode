require("dotenv").config();
import jwt from "jsonwebtoken";
let secret = process.env.JWT_SECRET || "";

export default class TokenController {
  static generateToken(
    payload: { [key: string]: any },
    options: { expiresIn: "15m" }
  ) {
    return jwt.sign(payload, secret, options);
  }

  static verify(token: string): string | object {
    return jwt.verify(token, secret);
  }
}
