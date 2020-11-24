// dependencies
const _url = require("url");
const dns = require("dns");
const _data = require("./data");
const helpers = require("./helpers");
const config = require("../lib/config");
const { _tokens } = require("./tokenHandlers");

// define handler conatainer
const handlers = {};

// handlers
handlers.checks = (data, cb) => {
  const acceptableMethods = ["get", "post", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, cb);
  } else {
    cb(405);
  }
};

// token container
handlers._checks = {};

// checks - post
// required data: protocol, method, url, successCodes, timeoutSeconds
// optional data: none
handlers._checks.post = (data, cb) => {
  const protocol =
    typeof data.payload.protocol === "string" &&
    ["https", "http"].indexOf(data.payload.protocol) > -1
      ? data.payload.protocol
      : false;

  const url =
    typeof data.payload.url === "string" && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;

  const method =
    typeof data.payload.method === "string" &&
    ["get", "post", "put", "delete"].indexOf(data.payload.method) > -1
      ? data.payload.method
      : false;

  const successCodes =
    typeof data.payload.successCodes === "object" &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0
      ? data.payload.successCodes
      : false;

  const timeoutSeconds =
    typeof data.payload.timeoutSeconds === "number" &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds >= 1 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;

  if ((protocol, url, method, successCodes, timeoutSeconds)) {
    // get token from the header
    const token =
      typeof data.headers.token === "string" ? data.headers.token : false;

    // look up the user by reading the token
    _data.read("tokens", token, (err, tokenData) => {
      if (!err && tokenData) {
        const userPhone = tokenData.phone;

        // look up the user data
        _data.read("users", userPhone, (err, userData) => {
          if (!err && userData) {
            // use current user checks object or initialize if there is none
            const checks =
              typeof userData.checks === "object" &&
              userData.checks instanceof Array
                ? userData.checks
                : [];

            // verify that the user has less than the number of max-checks-per user
            if (checks.length < config.maxChecks) {
              // verify that the URL given has DNS entries (and therfore can resolve)
              const parsedUrl = _url.parse(`${protocol}://${url}`, true);
              const hostName =
                typeof parsedUrl.hostname === "string" &&
                parsedUrl.hostname.length > 0
                  ? parsedUrl.hostname
                  : false;

              dns.resolve(hostName, (err, records) => {
                if (!err && records) {
                  // create random id for checks
                  const checkId = helpers.createRandomStr(20);

                  // create the user object and include the users phone
                  const checkObj = {
                    id: checkId,
                    userPhone: userPhone,
                    protocol: protocol,
                    url: url,
                    method: method,
                    successCodes: successCodes,
                    timeoutSeconds: timeoutSeconds,
                  };

                  // store the object
                  _data.create("checks", checkId, checkObj, (err) => {
                    if (!err) {
                      // add the check id to the user's object
                      userData.checks = checks;
                      userData.checks.push(checkId);

                      // save the new user data
                      _data.update("users", userPhone, userData, (err) => {
                        if (!err) {
                          // return the data about the new check
                          cb(200, checkObj);
                        } else {
                          cb(500, {
                            Error:
                              "Could not update the user with the new check.",
                          });
                        }
                      });
                    } else {
                      cb(500, err, { Error: "Could not create new check." });
                    }
                  });
                } else {
                  cb(400, {
                    Error:
                      "The hostname of the URL entered did not resolve to any DNS entries",
                  });
                }
              });
            } else {
              cb(400, {
                Error: `The user already has the number of maximum checks (${config.maxChecks}).`,
              });
            }
          } else {
            cb(403, err);
          }
        });
      } else {
        cb(403, err);
      }
    });
  } else {
    cb(400, { Error: "Missing required missing / inputs are invalid." });
  }
};

// checks - get
// required data: id
// optional data: none
handlers._checks.get = (data, cb) => {
  // check the id if valid
  const parsedObj = helpers.parseJsonToObject(data.queryStringObj);
  const id =
    typeof parsedObj.id === "string" && parsedObj.id.trim().length === 20
      ? parsedObj.id.trim()
      : false;

  if (id) {
    // look up the check
    _data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        // get the token from the headers
        const token =
          typeof data.headers.token === "string" ? data.headers.token : false;

        // verify that the given token is valid  and belongs to the user who created the check
        _tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            // return the check data
            cb(200, checkData);
          } else {
            cb(403);
          }
        });
      } else {
        cb(404);
      }
    });
  } else {
    cb(400, { Error: "Missing required field." });
  }
};

// checks - put
// required data: id
// optional data: protocol, url, method, successCodes, timeoutSeconds (one must be sent)
handlers._checks.put = (data, cb) => {
  // check for the required field
  const id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;

  // Check for optional fields
  const protocol =
    typeof data.payload.protocol == "string" &&
    ["https", "http"].indexOf(data.payload.protocol) > -1
      ? data.payload.protocol
      : false;
  const url =
    typeof data.payload.url == "string" && data.payload.url.trim().length > 0
      ? data.payload.url.trim()
      : false;
  const method =
    typeof data.payload.method == "string" &&
    ["post", "get", "put", "delete"].indexOf(data.payload.method) > -1
      ? data.payload.method
      : false;
  const successCodes =
    typeof data.payload.successCodes == "object" &&
    data.payload.successCodes instanceof Array &&
    data.payload.successCodes.length > 0
      ? data.payload.successCodes
      : false;
  const timeoutSeconds =
    typeof data.payload.timeoutSeconds == "number" &&
    data.payload.timeoutSeconds % 1 === 0 &&
    data.payload.timeoutSeconds >= 1 &&
    data.payload.timeoutSeconds <= 5
      ? data.payload.timeoutSeconds
      : false;

  if (id) {
    // check to make sure one or more optional fields has sent
    if (protocol || url || method || successCodes || timeoutSeconds) {
      // look up checks
      _data.read("checks", id, (err, checkData) => {
        if (!err && checkData) {
          // get the token from the headers
          const token =
            typeof data.headers.token === "string" ? data.headers.token : false;

          // verify that the given token is valid  and belongs to the user who created the check
          _tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
            if (tokenIsValid) {
              // update the check where necessary
              // Update check data where necessary
              if (protocol) {
                checkData.protocol = protocol;
              }
              if (url) {
                checkData.url = url;
              }
              if (method) {
                checkData.method = method;
              }
              if (successCodes) {
                checkData.successCodes = successCodes;
              }
              if (timeoutSeconds) {
                checkData.timeoutSeconds = timeoutSeconds;
              }

              // store the new updates
              _data.update("checks", id, checkData, (err) => {
                if (!err) {
                  cb(200);
                } else {
                  cb(500, { Error: "Could not update the check." });
                }
              });
            } else {
              cb(403);
            }
          });
        } else {
          cb(400, { Error: "Check id did not exist." });
        }
      });
    } else {
      cb(400, { Error: "Missing fields to update." });
    }
  } else {
    cb(400, { Error: "Missing required fields." });
  }
};

// checks - delete
// required data: id
// optional data: none
handlers._checks.delete = (data, cb) => {
  // check the id if valid
  const parsedObj = helpers.parseJsonToObject(data.queryStringObj);
  const id =
    typeof parsedObj.id === "string" && parsedObj.id.trim().length === 20
      ? parsedObj.id.trim()
      : false;
  if (id) {
    // look up the check
    _data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        // get the token from the headers
        const token =
          typeof data.headers.token === "string" ? data.headers.token : false;
        // verify that the given token is valid for the phone number
        _tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            // delete the check data
            _data.delete("checks", id, (err) => {
              if (!err) {
                // look up user
                _data.read("users", checkData.userPhone, (err, userData) => {
                  if (!err) {
                    const checks =
                      typeof userData.checks === "object" &&
                      userData.checks instanceof Array
                        ? userData.checks
                        : [];

                    // remove the delete check from their list of checks
                    const checkPosition = checks.indexOf(id);
                    if (checkPosition > -1) {
                      checks.splice(checkPosition, 1);

                      // re-save the user's data
                      userData.checks = checks;
                      _data.update(
                        "users",
                        checkData.userPhone,
                        userData,
                        (err) => {
                          if (!err) {
                            cb(200);
                          } else {
                            cb(500, {
                              Error:
                                "Could not update user the after deleting a check.",
                            });
                          }
                        }
                      );
                    } else {
                      cb(500, {
                        Error: `Could not find the check on the user's object, so could not delete it.`,
                      });
                    }
                  } else {
                    cb(500, {
                      Error: "Could not find user who created the check.",
                    });
                  }
                });
              } else {
                cb(500, { Error: "Could not delete the check data." });
              }
            });
          } else {
            cb(403);
          }
        });
      } else {
        cb(400, { Error: "The specified id doest not exist." });
      }
    });
  } else {
    cb(400, { Error: "Missing required field." });
  }
};

module.exports = handlers;
