// import mongoose from "mongoose";
// import bcrypt from "bcrypt";

// const UserScheme = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       trim: true,
//       required: true,
//       min: 2,
//       max: 32,
//     },
//     email: {
//       type: String,
//       trim: true,
//       required: true,
//       min: 5,
//       max: 32,
//       lowercase: true,
//     },
//     hashed_password: {
//       type: String,
//       required: true,
//     },
//     salt: String,
//     role: {
//       type: String,
//       default: "subscriber",
//     },
//     resetPasswordLink: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// UserScheme.virtual("password")
//   .set(function(password) {
//     this._password = password;
//     this.salt = this.makeSalt();
//     this.hashed_password = this.encryptPassword();
//   })
//   .get(function() {
//     return this._password;
//   });

// UserScheme.methods = {
//   encryptPassword: function(password) {
//     if (!password) return "";

//   },
// };
