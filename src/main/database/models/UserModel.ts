import mongoose from "mongoose";
import bcrypt from "bcrypt";
// eslint-disable-next-line no-unused-vars
import { LoginStrategy } from "../../../app/constants";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      min: 2,
      max: 24,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      min: 5,
      max: 32,
      lowercase: true,
    },
    loginStrategy: {
      type: String,
    },
    hashed_password: {
      type: String,
      required: true,
      select: false,
    },
    salt: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      default: "subscriber",
    },
    resetPasswordLink: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.virtual("password").set(function(this: any, password: string) {
  this.hashed_password = this.encryptPassword(password);
});

UserSchema.methods = {
  encryptPassword: function(password: string) {
    this.salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, this.salt);
  },
  isAuthenticated: function(password: string) {
    return bcrypt.compareSync(password, this.hashed_password);
  },
};

declare interface IUser extends mongoose.Document {
  hashed_password?: string;
  id: string;
  name: string;
  email: string;
  loginStrategy: LoginStrategy;
  role?: string;
  resetPasswordLink?: string;
  isAuthenticated(password: string): boolean;
}

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
