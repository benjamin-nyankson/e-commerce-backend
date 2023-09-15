const database = require("../Database/MongoDB");
const User = require("../Modules/user");
const createTransport = require("../Email/Transporter");
const mailOptions = require("../Email/MailOptions");
var localStorage = require("localStorage");


const transport = createTransport(process.env.GMAIL, process.env.GMAIL_PASS);
module.exports.signup = async (req, res) => {
  try {
    const {
      fname,
      lname,
      email,
      contact,
      password,
      confirmPass,
      otp,
      country,
      isVerified,
      role,
      isAdmin,
    } = req.body;

    const user = new User({
      fname,
      lname,
      email,
      contact,
      password,
      confirmPass,
      otp,
      country,
      isVerified,
      role,
      isAdmin,
    });

    const emailOptions = mailOptions(
      process.env.GMAIL,
      email,
      "Email Verification",
      `<p>Your verification code is ${otp}</p>`
    );

    const checkuser = await database.usersCollection.findOne({ email: email });

    if (checkuser === null) {
      database.usersCollection.insertOne(user);
    } else {
      res.status(409).send("Email already exists");
    }

    transport.sendMail(emailOptions, (err, info) => {
      if (err) {
        console.log("Error:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    });
    res.status(201).json({ message: "Data stored successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.confirm = async (req, res) => {
  const { code } = req.body;
  try {
    const userOtp = await database.usersCollection.findOne({ otp: code });
    // console.log(code);
    const emailOptions = mailOptions(
      process.env.GMAIL,
      userOtp?.email,
      "Email Verification",
      `<p>Your email has been confirmed successfully </p>`
    );
    if (userOtp === null) {
      res.status(500).send("Internal Server Error");
    } else {
      await database.usersCollection.updateOne(
        { _id: userOtp._id },
        { $set: { otp: "", isVerified: true } }
      );
      transport.sendMail(emailOptions, (err, info) => {
        if (err) {
          console.log("Error:", err);
        } else {
          console.log("Email sent:", info.response);
        }
      });
      res.status(201).json({ mesage: "Otp confirmed successfully" });
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  const loginCredentials = await database.usersCollection.findOne({
    email: email,
  });

  if (loginCredentials === null) {
    res.status(404).send(`Email does not exist`);
  } else if (password !== loginCredentials.password) {
    res.status(409).send("Wrong Credentials");
  } else if (loginCredentials.isVerified === false) {
    res.status(401).send("verify email");
  } else if (password === loginCredentials.password) {
    res.status(200).json({ mesage: "Login success", data: loginCredentials });
  } else {
    res.status(500).json({ mesage: "Login failed" });
    // res.json(loginCredentials);
  }
};

module.exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await database.usersCollection.findOne({ email: email });
  if (user === null) {
    res.status(404).send(`Email not found`);
  } else if (user) {
    res.status(200).json({ mesage: "Email found" });
    localStorage.setItem("email", JSON.stringify(user.email));
  }
};

module.exports.resetPassword = async (req, res) => {
  const { password, confirmPass } = req.body;

  const email = JSON.parse(localStorage.getItem("email"));
  try {
    const user = await database.usersCollection.findOne({ email: email });

    if (user === null) {
      res.status(404).send(`Request for a password reset first`);
    } else {
      database.usersCollection.updateOne(
        { _id: user._id },
        { $set: { password: password, confirmPass: confirmPass } }
      );
      res.status(201).json({ mesage: "Password changed successfully" });
      localStorage.removeItem("email");
    }
  } catch (error) {}
};
