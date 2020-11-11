/*
Server-related task
*/

// node dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const fs = require("fs");
const { StringDecoder } = require("string_decoder");
const { httpPort, httpsPort, envName } = require("./config");
const { notFound, ping, users, tokens, checks } = require("./handlers");
const helpers = require("./helpers");
const path = require("path");

// instatiate the server object
const server = {};

// Test twilio trial accounts can only send to verified number
// helpers.sendTwilioSms("9053730081", "TEsting!", (err) => {
//   console.log(`This was the error: ${err}`);
// });

// instantiate "http" server
server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req, res);
});

// instantiate "https" server
server.httpsServerOption = {
  cert: fs.readFileSync(path.join(__dirname, "/../https/cert.pem")),
  key: fs.readFileSync(path.join(__dirname, "../https/key.pem")),
};

server.httpsServer = https.createServer(
  server.httpsServerOption,
  (req, res) => {
    server.unifiedServer(req, res);
  }
);

// all the server logic for both thre http and https server
server.unifiedServer = (req, res) => {
  // get the url and parse it
  const parsedUrl = url.parse(req.url, true);

  // get the path
  const path = parsedUrl.pathname;
  // localhost:3000/ return ""
  // localhost:3000/foo return foo
  // localhost:3000/foo/bar return foo/bar
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  // get query string as an object
  const queryStringObj = JSON.stringify(parsedUrl.query);

  // get headers as an object
  const headers = req.headers;

  // get the method
  const method = req.method.toLowerCase();

  // get payload if there is any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  // stream data that is coming in bit by bit
  req.on("data", (data) => {
    buffer += decoder.write(data);
  });

  req.on("end", () => {
    buffer += decoder.end();

    // choose the handler this request should go to
    const chosenHandler =
      typeof server.router[trimmedPath] !== "undefined"
        ? server.router[trimmedPath]
        : notFound;

    const data = {
      trimmedPath: trimmedPath,
      queryStringObj: queryStringObj,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer),
    };

    // route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      // use the status code callback by the handler, or default to 200
      statusCode = typeof statusCode === "number" ? statusCode : 200;

      // use the payload callback by the handler, or default to an empty  object
      payload = typeof payload === "object" ? payload : {};

      // convert the payload to a string
      const payloadString = JSON.stringify(payload);

      // return a response to client
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log(`Returning this response: ${statusCode} ${payloadString}`);
    });
  });
};

// define a request router
server.router = {
  ping: ping,
  users: users,
  tokens: tokens,
  checks: checks,
};

// init script
server.init = () => {
  // start the "http" server
  server.httpServer.listen(httpPort, () => {
    console.log(`💥 Listening on port ${httpPort} in ${envName} mode...`);
  });

  // start the https server
  server.httpsServer.listen(httpsPort, () => {
    console.log(`💥 Listening on port ${httpsPort} in ${envName} mode...`);
  });
};

// export the server
module.exports = server;
