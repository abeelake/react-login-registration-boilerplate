const mongoose = require("mongoose");
// crypto will has passwords
const crypto = require("crypto");

// user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      max: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    salt: String, // strength of password hashing
    role: {
      type: String,
      default: "subscriber",
    },
    resetPasswordLink: {
      // this token will go to user when they forget password
      data: String,
      default: "",
    },
  },
  { timestamps: true }
);

// virtual
// take password, hash it and save to db
userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password; // temp variable _password
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password); // store to hashed_password
  })
  .get(function () {
    return this._password;
  });

// Schema methods
userSchema.methods = {
  // compare plain passward to hashed password
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },
};

module.exports = mongoose.model("User", userSchema);
