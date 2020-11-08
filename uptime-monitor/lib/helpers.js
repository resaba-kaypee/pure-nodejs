// helpers for various task
const crypto = require("crypto");
const config = require("./config");

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

module.exports = helpers;
