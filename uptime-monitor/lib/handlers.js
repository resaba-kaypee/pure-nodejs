// request handlers

// dependencies
const _data = require("./data");
const helpers = require("./helpers");

// define handler
const handlers = {};

// ==================>>> users handler
handlers.users = (data, cb) => {
  const acceptableMethods = ["get", "post", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, cb);
  } else {
    cb(405);
  }
};

// container for users submethods
handlers._users = {};

// users - post
// required data: firstName, lastName, phone, password, tosAgreement
// optional data: none
handlers._users.post = (data, cb) => {
  // check all fields are filled out
  const firstName =
    typeof data.payload.firstName === "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;

  const lastName =
    typeof data.payload.lastName === "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;

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

  const tosAgreement =
    typeof data.payload.tosAgreement === "boolean" &&
    data.payload.tosAgreement === true
      ? true
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure the user does not already exist
    _data.read("users", phone, (err, data) => {
      // the error is expected and will return 'no such file or directory'
      // it means the user has not been created yet
      if (err) {
        // hash the password
        const hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          // create user obj
          const userObj = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            hashedPassword: hashedPassword,
            tosAgreement: true,
          };

          // store the user
          _data.create("users", phone, userObj, (err) => {
            if (!err) {
              cb(200);
            } else {
              console.log(err);
              cb(500, { Error: "Could not create the new user" });
            }
          });
        } else {
          cb(500, { Error: "Could not hash the user's password" });
        }
      } else {
        // user already exist
        cb(400, { Error: "User with that phone number already exist" });
      }
    });
  } else {
    cb(400, { Error: "Missing required fields" });
  }
};

// users - get
// required data: phone
// optional data: none
// @TODO - only let an authenticated user access their own object
handlers._users.get = (data, cb) => {
  // check the phone if valid
  const parsedObj = helpers.parseJsonToObject(data.queryStringObj);
  const phone =
    typeof parsedObj.phone === "string" && parsedObj.phone.trim().length === 10
      ? parsedObj.phone.trim()
      : false;

  if (phone) {
    // look up user
    _data.read("users", phone, (err, userData) => {
      if (!err && userData) {
        // remove the hashed password from the user object before returning
        delete userData.hashedPassword;
        cb(200, userData);
      } else {
        console.log(err);
        cb(404);
      }
    });
  } else {
    cb(400, { Error: "Missing required field." });
  }
};

// users - put
// required data: phone
// optional data: firstName, lastName, password (at least one must be specified)
// @TODO - only let an authenticated user access their own object
handlers._users.put = (data, cb) => {
  // check for required field
  const phone =
    typeof data.payload.phone === "string" &&
    data.payload.phone.trim().length === 10
      ? data.payload.phone.trim()
      : false;

  // check for optional field
  const firstName =
    typeof data.payload.firstName === "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;

  const lastName =
    typeof data.payload.lastName === "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;

  const password =
    typeof data.payload.password === "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  // error if the phone is invalid
  if (phone) {
    // error if nothing is sent to update
    if (firstName || lastName || password) {
      // look up user
      _data.read("users", phone, (err, userData) => {
        if (!err && userData) {
          // update user
          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            userData.lastName = lastName;
          }
          if (password) {
            userData.hashedPassword = helpers.hash(password);
          }

          // store the new updates
          _data.update("users", phone, userData, (err) => {
            if (!err) {
              cb(200);
            } else {
              console.log(err);
              cb(400, { Error: "Failed to update user" });
            }
          });
        } else {
          console.log(err);
          cb(400, { Error: "User does not exist." });
        }
      });
    } else {
      cb(400, { Error: "Missing field to update." });
    }
  } else {
    cb(400, { Error: "Missing required fields." });
  }
};

// users - delete
// required data: phone
// optional data: none
// @TODO - only let an authenticated user access their own object
// @TODO - delete any other files associated with the user
handlers._users.delete = (data, cb) => {
  // check the phone if valid
  const parsedObj = helpers.parseJsonToObject(data.queryStringObj);
  const phone =
    typeof parsedObj.phone === "string" && parsedObj.phone.trim().length === 10
      ? parsedObj.phone.trim()
      : false;

  if (phone) {
    // look up user
    _data.read("users", phone, (err, userData) => {
      if (!err && userData) {
        _data.delete("users", phone, (err) => {
          if (!err) {
            cb(200);
          } else {
            cb(500, { Error: "Could not delete user." });
          }
        });
      } else {
        cb(400, { Error: "Could not find user." });
      }
    });
  } else {
    cb(400, { Error: "Missing required field." });
  }
};

// ==================>>> token handlers
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

  if (phone && password) {
    // look up user that match phone
    _data.read("users", phone, (err, userData) => {
      if (!err && userData) {
        // hashed the sent password to compare
        const hashedPassword = helpers.hash(password);

        if (hashedPassword === userData.hashedPassword) {
          // create token with random name. set expiration day to 1 hour
          const tokenId = helpers.createRandomStr(20);
          const expires = Date.now() + 1000 * 60 * 60;

          const tokenObj = {
            phone: phone,
            id: tokenId,
            expires: expires,
          };

          // store new token
          _data.create("tokens", tokenId, tokenObj, (err) => {
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

// sampler handler
handlers.ping = (data, cb) => {
  // callback a http status code and payload object
  cb(200);
};

// not found
handlers.notFound = (data, cb) => {
  cb(404);
};

module.exports = handlers;
