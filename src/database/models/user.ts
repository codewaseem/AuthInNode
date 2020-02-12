import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
};

declare interface IUser extends mongoose.Document {
  hashed_password: any;
  password: any;
  _password: any;
  name: string;
  email: string;
  role: string;
  resetPasswordLink: string;
}

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
