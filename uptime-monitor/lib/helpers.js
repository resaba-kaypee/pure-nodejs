// helpers for various task
const crypto = require("crypto");
const config = require("./config");
const https = require("https");
const querystring = require("querystring");
const path = require("path");
const fs = require("fs");

// helper containers
const helpers = {};

// a sample for testinf that simply return a number
helpers.getANnumber = () => {
  return 1;
};

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

// get the string content of a template
helpers.getTemplate = (templateName, data, cb) => {
  templateName =
    typeof templateName === "string" && templateName.length > 0
      ? templateName
      : false;
  data = typeof data === "object" && data !== null ? data : {};

  if (templateName) {
    const templatesDir = path.join(__dirname, "/../templates/");
    fs.readFile(`${templatesDir}${templateName}.html`, "utf8", (err, str) => {
      if (!err && str && str.length > 0) {
        // do the interpolation on the string
        const finalStr = helpers.interpolate(str, data);
        cb(false, finalStr);
      } else {
        cb("No template can be found.");
      }
    });
  } else {
    cb("A valid template name was not specified");
  }
};

// add the universal header and footer to a string, and pass provided data obj to header and footer for interpolation
helpers.addUniversalTemplate = (str, data, cb) => {
  str = typeof str === "string" && str.length > 0 ? str : "";
  data = typeof data === "object" && data !== null ? data : {};

  // get the header
  helpers.getTemplate("_header", data, (err, headerStr) => {
    if (!err && headerStr) {
      // get the footer
      helpers.getTemplate("_footer", data, (err, footerStr) => {
        if (!err && footerStr) {
          // add them all together
          const fullStr = headerStr + str + footerStr;
          cb(false, fullStr);
        } else {
          cb("Could not find the footer template.");
        }
      });
    } else {
      cb("Could not find the header template.");
    }
  });
};

// take a given string and a data object and find/replace all the keys within it
helpers.interpolate = (str, data) => {
  str = typeof str === "string" && str.length > 0 ? str : "";
  data = typeof data === "object" && data !== null ? data : {};

  // add the templateGlobals to the data object, prepending their key name with "globals"
  for (let keyName in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(keyName)) {
      data["global." + keyName] = config.templateGlobals[keyName];
    }
  }

  // for each kay in the object, insert its value into the string at the corresponding obj
  for (let key in data) {
    if (data.hasOwnProperty(key) && typeof data[key] === "string") {
      const replace = data[key];
      const find = `{${key}}`;
      str = str.replace(find, replace);
    }
  }

  return str;
};

// get the contents of a static (public) asset
helpers.getStaticAsset = (fileName, cb) => {
  fileName =
    typeof fileName === "string" && fileName.length > 0 ? fileName : false;

  if (fileName) {
    const publicDir = path.join(__dirname, "/../public/");
    fs.readFile(publicDir + fileName, (err, data) => {
      if (!err && data) {
        cb(false, data);
      } else {
        cb("No file could be found.");
      }
    });
  } else {
    cb("A valid file name was not specified.");
  }
};

module.exports = helpers;
