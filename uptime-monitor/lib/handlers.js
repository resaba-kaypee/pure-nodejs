// request handlers
const { users } = require("./userHandlers");
const { tokens } = require("./tokenHandlers");

// sampler handler
const ping = (data, cb) => {
  // callback a http status code and payload object
  cb(200);
};

// not found
const notFound = (data, cb) => {
  cb(404);
};

module.exports = { ping, notFound, users, tokens };
