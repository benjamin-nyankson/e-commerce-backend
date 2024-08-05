const database = require("../Database/MongoDB");
const User = require("../Modules/user");
const createTransport = require("../Email/Transporter");
const mailOptions = require("../Email/MailOptions");
const localStorage = require("localStorage");
const hashPassword = require("../helpers/hashPassword");
const bcrypt = require("bcrypt");
const token = require("../token/jwt");
const ObjectID = require("mongodb").ObjectId;

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

    if (confirmPass !== password) {
      return res.status(302).send("Passwords do not match");
    }

    const user = new User({
      fname,
      lname,
      email,
      contact,
      password: await hashPassword(password),
      confirmPass: await hashPassword(confirmPass),
      otp,
      country,
      isVerified,
      role,
      isAdmin,
    });

    const checkuser = await database.usersCollection.findOne({ email: email });

    if (checkuser !== null) {
      return res.status(409).send("Email already exists");
    }

    await database.usersCollection.insertOne(user);

    const emailOptions = mailOptions(
      process.env.GMAIL,
      email,
      "Email Verification",
      `<p>Your verification code is ${otp}</p>`
    );

    // Wait for the email to be sent before responding
    transport.sendMail(emailOptions, (err, info) => {
      if (err) {
        console.log("Error:", err);
        // If email fails, send a response with an error
        return res.status(500).send("Internal Server Error");
      } else {
        console.log("Email sent:", info.response);
        // Send success response after email is sent
        res.status(201).json({ message: "Data stored successfully" });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.confirm = async (req, res) => {
  const { code, email } = req.body;
  console.log({ code, email });
  try {
    const userOtp = await database.usersCollection.findOne({ email });
    const emailOptions = mailOptions(
      process.env.GMAIL,
      userOtp?.email,
      "Email Verification",
      `<p>Your email has been confirmed successfully </p>`
    );
    if (!email) {
      res.status(301).send("Email is required");
    }
    if (userOtp === null) {
      res.status(500).send("No info found");
    } else {
      if (userOtp.isVerified) {
        res.status(301).send("Email already confirmed");
        return false;
      }

      if (code !== userOtp.otp) {
        res.status(500).send("Invalid verification code");
        return false;
      }
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

  try {
    // Find user by email
    const loginCredentials = await database.usersCollection.findOne({ email });

    const data = {
      fname: loginCredentials.fname,
      lname: loginCredentials.lname,
      email: loginCredentials.email,
      country: loginCredentials.country,
      role: loginCredentials.role,
      isVerified: loginCredentials.isVerified,
      isAdmin: loginCredentials.isAdmin,
      _id: loginCredentials._id,
    };
    // Check if user exists
    if (!loginCredentials) {
      return res.status(404).send("Email does not exist");
    }

    // Check if user is verified
    if (!loginCredentials.isVerified) {
      return res.status(401).send("Please verify your email");
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, loginCredentials.password);

    if (!isMatch) {
      return res.status(409).send("Wrong credentials");
    }

    // Successful login
    await database.usersCollection.updateOne(
      { _id: loginCredentials._id },
      { $set: { token: await token.encodeData(data) } }
    );

    const accessToken = await token.encodeData(data);
    const refreshToken = await token.encodeData(
      { userId: loginCredentials._id, email: loginCredentials.email },
      "7d",
      "refresh"
    );

    await token.storeRefreshToken(loginCredentials._id, refreshToken);

    res
      .status(200)
      .json({ message: "Login success", data: { accessToken, refreshToken } });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Login failed");
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
        {
          $set: {
            password: hashPassword(password),
            confirmPass: hashPassword(confirmPass),
          },
        }
      );
      res.status(201).json({ mesage: "Password changed successfully" });
      localStorage.removeItem("email");
    }
  } catch (error) {}
};

module.exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  console.log(refreshToken);
  try {
    // Validate the refresh token
    const decoded = await token.validateRefreshToken(refreshToken);

    // Fetch user from the database using decoded userId (or email)
    const user = await database.usersCollection.findOne({
      _id: new ObjectID(decoded.userId),
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Generate new access token
    const newAccessToken = await token.encodeData({
      userId: user._id,
      email: user.email,
    });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(401).send("Invalid or expired refresh token");
  }
};

module.exports.protectedRoute = async (req, res) => {
  const userToken = req.headers.authorization?.split(" ")[1];
  if (!userToken) {
    return res.status(401).send("Access token required");
  }

  try {
    await token.verifyToken(userToken);
    // Proceed with handling the request
    res.status(200).json({ message: "Request successful" });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).send("Access token expired");
    }
    res.status(401).send("Invalid token");
  }
};
