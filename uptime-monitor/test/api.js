/**
 * This is API test
 */

// dependencies
const app = require("../index");
const http = require("http");
const config = require("../lib/config");
const assert = require("assert");

// holder for the test
const api = {};

// helpers
const helpers = {};
helpers.makeGetRequest = (path, cb) => {
  // configure the request
  const requestDetails = {
    protocol: "http:",
    hostname: "localhost",
    port: config.httpPort,
    method: "GET",
    path: path,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // send the request
  const req = http.request(requestDetails, (res) => {
    cb(res);
  });

  req.end();
};

// the main init function should be able to run withoun throwing
api["app.init should start without throwing"] = (done) => {
  assert.doesNotThrow(() => {
    app.init((err) => {
      done();
    });
  }, TypeError);
};

// make a request to /ping
api["/ping should respond to GET with 200"] = (done) => {
  helpers.makeGetRequest("/ping", (res) => {
    assert.strictEqual(res.statusCode, 200);
    done();
  });
};

// make a request to /api/users
api["/api/users should respond to GET with 400"] = (done) => {
  helpers.makeGetRequest("/api/users", (res) => {
    assert.strictEqual(res.statusCode, 400);
    done();
  });
};

// make a request to a random path
api["A random path should GET with 404"] = (done) => {
  helpers.makeGetRequest("/this/path/shoudlnt/exist", (res) => {
    assert.strictEqual(res.statusCode, 404);
    done();
  });
};

module.exports = api;
