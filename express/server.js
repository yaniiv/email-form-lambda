"use strict";
const express = require("express");
const path = require("path");
const serverless = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const router = express.Router();
router.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<h1>Hello from Express.js!</h1>");
  res.end();
});
router.get("/another", (req, res) => res.json({ route: req.originalUrl }));
router.post("/", (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use("/.netlify/functions/server", router); // path must route to lambda

app.post("/api/v1", (req, res) => {
  console.warn("ROUTE:", "/api/v1");
  var data = req.body;

  var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    auth: {
      user: "USERNAME",
      pass: "PASSWORD"
    }
  });

  var mailOptions = {
    from: "data.email",
    to: "ENTER_YOUR_EMAIL",
    subject: "ENTER_YOUR_SUBJECT",
    html: `<p>$</p>
          <p>$</p>
          <p>}</p>`
  };

  smtpTransport.sendMail(mailOptions, (error, response) => {
    if (error) {
      res.send(error);
    } else {
      res.send("Success");
    }
    smtpTransport.close();
  });
});

app.post("/api/ethereal", (req, res) => {
  console.warn("ROUTE:", "/api/ethereal");
  nodemailer.createTestAccount((err, account) => {
    if (err) {
      console.error("Failed to create a testing account. " + err.message);
      return process.exit(1);
    }

    console.log("Credentials obtained, sending message...");

    console.warn("account", account);
    // create reusable transporter object using the default SMTP transport
    let smtpTransport = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });

    var mailOptions = {
      from: "data.email",
      to: "s@gmail.com",
      subject: "ENTER_YOUR_SUBJECT",
      html: `<p>gehereal</p>
          <p/p>
          <p</p>`
    };

    smtpTransport.sendMail(mailOptions, (error, response) => {
      if (err) {
        console.log("Error occurred. " + err.message);
        return process.exit(1);
      }

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(response));
      smtpTransport.close();
    });
  });

  app.use("/", (req, res) => {
    console.log("/ hit");
    res.sendFile(path.join(__dirname, "../index.html"));
  });
});

module.exports = app;
module.exports.handler = serverless(app);
