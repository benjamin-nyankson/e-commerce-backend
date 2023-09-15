const nodeMailer = require("nodemailer");

const createTransporter = (email, pass) =>
  nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: pass,
    },
  });

module.exports = createTransporter;
