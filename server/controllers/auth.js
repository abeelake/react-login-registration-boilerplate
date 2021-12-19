const User = require("../models/user");
const jwt = require("jsonwebtoken");

const expressJwt = require("express-jwt");

const _ = require("lodash");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// EMAIL VERIFICATION WORKFLOW

// first check if email already exists in database, send json error message if it exists
// email confirmation will be sent when user submits valid data
// if valid email was used, they will receive the token and confirm their email
// email will include user signup info encoded in json web token (jwt)
// the url link will be clicked, and the user will be sent to our client react app
// encoded jwt will be sent back to server, and user info will be saved to db

exports.signup = (req, res) => {
  const { name, email, password } = req.body;

  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: "Email is taken",
      });
    }
    // if email does not exist, generate token (embedded with name, email, password, JWT_ACCOUNT_ACTIVATION, expiresIn
    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: "10m" }
    );

    // create message data
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Account actication link`,
      html: `
            <h1>Please use the following link to activate your account</h1>
            <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
            <hr />
            <p>This email may contain sensitive information</p>
            <p>${process.env.CLIENT_URL}</p>
        `,
    };

    sgMail
      .send(emailData)
      .then((sent) => {
        console.log("signup email sent", sent);
        return res.json({
          message: `Email has been sent to ${email}. Follow the link to activate your account`,
        });
      })
      .catch((err) => {
        return res.json({
          error: err,
        });
      });
  });
};

exports.accountActivation = (req, res) => {
  const { token } = req.body;
  if (token) {
    jwt.verify(
      token,
      process.env.JWT_ACCOUNT_ACTIVATION,
      function (err, decodedToken) {
        if (err) {
          console.log("JWT VERIFY IN ACCOUNT ACTIVATION ERROR", err);
          return res.status(401).json({
            error: "Expired link. Singup again",
          });
        }

        const { name, email, password } = jwt.decode(token);
        // save user in db
        const user = new User({ name, email, password });
        user.save((err, user) => {
          if (err) {
            console.log("SAVE USER IN ACCOUNT ACTIVATIONE ERROR", err);
            return res.status(401).json({
              error: "Error saving user in database. Try signing up again",
            });
          }
          return res.json({
            message: "signup success, please sign in",
          });
        });
      }
    );
  }
};

// check if user is trying to signin but has not signed up yet
// check if password matches with hashed password in db
// if yes, generate token with expiry
// the token will be sent to client/react
// it will be used as jwt based authentication system
// allow user to access protected routes later if they have valid token
// so, jwt token is like a password with expity
// if signin is successful, we will send user info and valid token
// this token will send back to server from client/react to access protected routes later

exports.signin = (req, res) => {
  const { email, password } = req.body;
  // check if user exists
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exist. Please signup",
      });
    }

    // authenticate returns false (schema method created in User model)
    if (!user.authenticate(password)) {
      // wrong password
      return res.status(400).json({
        err: "Email/Password do not match",
      });
    }

    // generate token and send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    }); // send user id in token
    const { _id, name, email, role } = user;
    return res.json({
      token,
      user: { _id, name, email, role },
    });
  });
};

// middleware to ensure authenticated  user gets user info
// will be applied in user.js route
exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET, // token will be checked and userId will be avaiable as req.user._id
  algorithms: ["HS256"],
});

exports.adminMiddleware = (req, res, next) => {
  User.findById({ _id: req.user._id }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(400).json({
        error: "Admin resource. Access denied.",
      });
    }
    req.profile = user; // user info available as req.profile
    next();
  });
};

// forgotPassword will find user by email and
exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exist",
      });
    }
    // generate token and email it
    const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, {
      expiresIn: "10m",
    });

    // create message data
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Password reset link`,
      html: `
            <h1>Please use the following link to reset your password</h1>
            <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
            <hr />
            <p>This email may contain sensitive information</p>
            <p>${process.env.CLIENT_URL}</p>
        `,
    };

    // update reset password link in db
    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        return res.status(400).json({
          error: "Database connection error on user password forgot request",
        });
      } else {
        sgMail
          .send(emailData)
          .then((sent) => {
            console.log("signup email sent", sent);
            return res.json({
              message: `Email has been sent to ${email}. Follow the link to reset password`,
            });
          })
          .catch((err) => {
            return res.json({
              error: err,
            });
          });
      }
    });
  });
};

// resetPassword
exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;
  // if there is resetPasswordLink
  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD,
      function (err, decoded) {
        if (err) {
          return res.status(400).json({
            error: "Expired Link, try again",
          });
        }
        // look for user based on resetPasswordLink
        User.findOne({ resetPasswordLink }, (err, user) => {
          if (err || !user) {
            return res.status(400).json({
              error: "Something went wrong. Try later",
            });
          }

          // user found -- update user object in db with new password and empty resetPasswordLink
          const updatedFields = {
            password: newPassword,
            resetPasswordLink: "",
          };
          // lodash (_) will extend new fields to user document
          user = _.extend(user, updatedFields);
          user.save((err, result) => {
            if (err) {
              return res.status(400).json({
                error: "Error resetting user password",
              });
            }
            res.json({
              message: "Great, now user can login with new password",
            });
          });
        });
      }
    );
  }
};
