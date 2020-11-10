// helpers for various task
const crypto = require("crypto");
const config = require("./config");
const https = require("https");
const querystring = require("querystring");

// helper containers
const helpers = {};

// create a sha256 hash
helpers.hash = (str) => {
  if (typeof str === "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

// parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (err) {
    return {};
  }
};

// create random string of alphanumeric characters, of a given length
helpers.createRandomStr = (strLength) => {
  strLength =
    typeof strLength === "number" && strLength > 0 ? strLength : false;
  if (strLength) {
    // define all possible character that could go in to string
    const possibleCharaters = "abcdefghijklmnopqrstuvwxyz0123456789";

    // start the final string
    let str = "";

    for (let i = 1; i <= strLength; i++) {
      const randomChar = possibleCharaters.charAt(
        Math.floor(Math.random() * possibleCharaters.length)
      );

      str += randomChar;
    }
    // return the string
    return str;
  } else {
    return false;
  }
};

// send sms via twilio
helpers.sendTwilioSms = (phone, msg, cb) => {
  // validate params
  phone =
    typeof phone === "string" && phone.trim().length === 10
      ? phone.trim()
      : false;
  msg =
    typeof msg === "string" &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (phone && msg) {
    // configure the request payload
    const payload = {
      To: `+63${phone}`,
      From: config.twilio.fromPhone,
      Body: msg,
    };
    const strPayload = querystring.stringify(payload);
    // config the request details
    const requestDetails = {
      protocol: "https:",
      hostname: "api.twilio.com",
      method: "POST",
      path: `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
      auth: `${config.twilio.accountSid}:${config.twilio.authToken}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(strPayload),
      },
    };

    // instantiate the request object
    const req = https.request(requestDetails, (res) => {
      // grab the status of the sent request
      const status = res.statusCode;

      // callback if the request went trough
      if (status === 200 || status === 201) {
        cb(false);
      } else {
        cb(`Status code returned was ${status}`);
      }
    });

    // bind to the error event so it doesn't get thrown
    req.on("error", (e) => {
      cb(e);
    });

    // add the payload
    req.write(strPayload);

    // end the request
    req.end();
  } else {
    cb("Given parameter were missing or invalid.");
  }
};

module.exports = helpers;
