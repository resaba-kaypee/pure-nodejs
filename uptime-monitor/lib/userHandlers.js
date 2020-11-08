// dependencies
const _data = require("./data");
const helpers = require("./helpers");

// define handler
const handlers = {};

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
handlers._users.get = (data, cb) => {
  // check the phone if valid
  const parsedObj = helpers.parseJsonToObject(data.queryStringObj);
  const phone =
    typeof parsedObj.phone === "string" && parsedObj.phone.trim().length === 10
      ? parsedObj.phone.trim()
      : false;

  if (phone) {
    // get the token from the headers
    const token =
      typeof data.headers.token === "string" ? data.headers.token : false;

    // verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
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
        cb(403, {
          Error: "Missing required token in header / token is invalid.",
        });
      }
    });
  } else {
    cb(400, { Error: "Missing required field." });
  }
};

// users - put
// required data: phone
// optional data: firstName, lastName, password (at least one must be specified)
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
      // get the token from the headers
      const token =
        typeof data.headers.token === "string" ? data.headers.token : false;
      // verify that the given token is valid for the phone number
      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
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
          cb(403, {
            Error: "Missing required token in header / token is invalid.",
          });
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
// @TODO - delete any other files associated with the user
handlers._users.delete = (data, cb) => {
  // check the phone if valid
  const parsedObj = helpers.parseJsonToObject(data.queryStringObj);
  const phone =
    typeof parsedObj.phone === "string" && parsedObj.phone.trim().length === 10
      ? parsedObj.phone.trim()
      : false;

  if (phone) {
    // get the token from the headers
    const token =
      typeof data.headers.token === "string" ? data.headers.token : false;
    // verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
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
        cb(403, {
          Error: "Missing required token in header / token is invalid.",
        });
      }
    });
  } else {
    cb(400, { Error: "Missing required field." });
  }
};

module.exports = handlers;
