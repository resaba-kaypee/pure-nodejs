// handler for token

// dependencies
const { performance, PerformanceObserver } = require("perf_hooks");
const util = require("util");
const debug = util.debuglog("performance");
const _data = require("./data");
const helpers = require("./helpers");

const perfObserver = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    debug("\x1b[33m%s\x1b[0m", `${entry.name}: ${entry.duration}`);
  });
});

perfObserver.observe({ entryTypes: ["measure"], buffer: true });

// const define handler container
const handlers = {};

// handlers
handlers.tokens = (data, cb) => {
  const acceptableMethods = ["get", "post", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, cb);
  } else {
    cb(405);
  }
};

// token container
handlers._tokens = {};

// tokens - post
// required data: phone, password
// optional: none
handlers._tokens.post = (data, cb) => {
  performance.mark("entered function");
  const phone =
    typeof data.payload.phone === "string" &&
    data.payload.phone.trim().length === 10
      ? data.payload.phone.trim()
      : false;

  const password =
    typeof data.payload.password === "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  performance.mark("inputs validated");
  if (phone && password) {
    // look up user that match phone
    _data.read("users", phone, (err, userData) => {
      performance.mark("beginning user lookup");
      if (!err && userData) {
        performance.mark("user lookup complete");

        // hashed the sent password to compare
        performance.mark("begin hashing password");
        const hashedPassword = helpers.hash(password);
        performance.mark("password hashing complete");

        if (hashedPassword === userData.hashedPassword) {
          // create token with random name. set expiration day to 1 hour

          performance.mark("creating data for token");
          const tokenId = helpers.createRandomStr(20);
          const expires = Date.now() + 1000 * 60 * 60;

          const tokenObj = {
            phone: phone,
            id: tokenId,
            expires: expires,
          };

          // store new token
          performance.mark("begin storing token");
          _data.create("tokens", tokenId, tokenObj, (err) => {
            performance.mark("storing token complete");

            // ===>>> begin gather all measurement
            performance.measure(
              "Beginning to end",
              "entered function",
              "storing token complete"
            );
            performance.measure(
              "Validating user inputs",
              "entered function",
              "inputs validated"
            );
            performance.measure(
              "User lookup",
              "beginning user lookup",
              "user lookup complete"
            );
            performance.measure(
              "Password hashing",
              "begin hashing password",
              "password hashing complete"
            );
            performance.measure(
              "Token data creation",
              "creating data for token",
              "begin storing token"
            );
            performance.measure(
              "Token storing",
              "begin storing token",
              "storing token complete"
            );
            // ===>>> end gather all measurement

            if (!err) {
              cb(200, tokenObj);
            } else {
              cb(500, { Error: "Cound not create new token." });
            }
          });
        } else {
          cb(400, { Error: "Password did not match." });
        }
      } else {
        cb(400, { Error: "Could not find the user." });
      }
    });
  } else {
    cb(400, { Error: "Missing required field(s)." });
  }
};

// tokens - get
// required data: id
// optional data: none
handlers._tokens.get = (data, cb) => {
  // check the id if valid
  const parsedObj = helpers.parseJsonToObject(data.queryStringObj);
  const id =
    typeof parsedObj.id === "string" && parsedObj.id.trim().length === 20
      ? parsedObj.id.trim()
      : false;

  if (id) {
    // look up token
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        cb(200, tokenData);
      } else {
        console.log(err);
        cb(404);
      }
    });
  } else {
    cb(400, { Error: "Missing required field." });
  }
};

// tokens - put
// required data: id, extent
// optional data: none
handlers._tokens.put = (data, cb) => {
  // extend token expiry data
  const id =
    typeof data.payload.id === "string" && data.payload.id.trim().length === 20
      ? data.payload.id.trim()
      : false;
  const extend =
    typeof data.payload.extend === "boolean" && data.payload.extend === true
      ? true
      : false;
  if (id && extend) {
    // look up the token
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        // check token if is not already expired
        if (tokenData.expires > Date.now()) {
          // set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          // store the new updates
          _data.update("tokens", id, tokenData, (err) => {
            if (!err) {
              cb(200);
            } else {
              cb(500, { Error: "Could not update the token." });
            }
          });
        } else {
          cb(400, { Error: "Token already expired." });
        }
      } else {
        cb(400, { Error: "Token does not exist." });
      }
    });
  } else {
    cb(400, { Error: "Missing required fields / fields are invalid." });
  }
};

// tokens - delete
// require data: id
// optional data: none
handlers._tokens.delete = (data, cb) => {
  // check the id if valid
  const parsedObj = helpers.parseJsonToObject(data.queryStringObj);
  const id =
    typeof parsedObj.id === "string" && parsedObj.id.trim().length === 20
      ? parsedObj.id.trim()
      : false;

  if (id) {
    // look up user
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        _data.delete("tokens", id, (err) => {
          if (!err) {
            cb(200);
          } else {
            cb(500, { Error: "Could not delete token." });
          }
        });
      } else {
        cb(400, { Error: "Could not find token." });
      }
    });
  } else {
    cb(400, { Error: "Missing required field." });
  }
};

// verify the given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, cb) => {
  // look up the token
  _data.read("tokens", id, (err, tokenData) => {
    if (!err && tokenData) {
      // check if token if not expire for the given user
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        cb(true);
      } else {
        cb(false);
      }
    } else {
      cb(false);
    }
  });
};

module.exports = handlers;
