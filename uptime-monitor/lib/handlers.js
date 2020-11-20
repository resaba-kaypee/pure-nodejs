// request handlers
const { users } = require("./userHandlers");
const { tokens } = require("./tokenHandlers");
const { checks } = require("./checkHandlers");

// sampler handler
const ping = (data, cb) => {
  // callback a http status code and payload object
  cb(200);
};

// not found
const notFound = (data, cb) => {
  cb(404);
};

// example error
const exampleError = (data, cb) => {
  const err = new Error("Example error");
  throw err;
};

module.exports = { ping, notFound, users, tokens, checks, exampleError };
