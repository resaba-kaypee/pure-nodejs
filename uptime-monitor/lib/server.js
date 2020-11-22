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
const {
  notFound,
  ping,
  users,
  tokens,
  checks,
  exampleError,
} = require("./handlers");
const {
  index,
  accountCreate,
  accountEdit,
  accountDeleted,
  sessionCreate,
  sessionDeleted,
  checksList,
  checksCreate,
  checksEdit,
  public,
  favicon,
} = require("./viewHandlers");
const helpers = require("./helpers");
const path = require("path");
const util = require("util");
const debug = util.debuglog("server");

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
  key: fs.readFileSync(path.join(__dirname, "/../https/key.pem")),
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
    let chosenHandler =
      typeof server.router[trimmedPath] !== "undefined"
        ? server.router[trimmedPath]
        : notFound;

    // if the request is within the public directory, use the public handler instead
    chosenHandler =
      trimmedPath.indexOf("public/") > -1 ? public : chosenHandler;

    const data = {
      trimmedPath: trimmedPath,
      queryStringObj: queryStringObj,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer),
    };

    // route the request to the handler specified in the router
    try {
      chosenHandler(data, (statusCode, payload, contentType) => {
        server.processHandlerResponse(
          res,
          method,
          trimmedPath,
          statusCode,
          payload,
          contentType
        );
      });
    } catch (err) {
      debug(err);
      server.processHandlerResponse(
        res,
        method,
        trimmedPath,
        500,
        { Error: "An unknown error has occured." },
        "json"
      );
    }
  });
};

server.processHandlerResponse = (
  res,
  method,
  trimmedPath,
  statusCode,
  payload,
  contentType
) => {
  // determine the type of response (fallback to JSON)
  contentType = typeof contentType === "string" ? contentType : "json";

  // use the status code callback by the handler, or default to 200
  statusCode = typeof statusCode === "number" ? statusCode : 200;

  // convert the payload to a string
  let payloadString = "";

  if (contentType === "json") {
    res.setHeader("Content-Type", "application/json");
    // use the payload callback by the handler, or default to an empty  object
    payload = typeof payload === "object" ? payload : {};
    payloadString = JSON.stringify(payload);
  }

  if (contentType === "html") {
    res.setHeader("Content-Type", "text/html");
    payloadString = typeof payload === "string" ? payload : "";
  }

  if (contentType === "favicon") {
    res.setHeader("Content-Type", "image/x-icon");
    payloadString = typeof payload !== "undefined" ? payload : "";
  }
  if (contentType === "css") {
    res.setHeader("Content-Type", "text/css");
    payloadString = typeof payload !== "undefined" ? payload : "";
  }
  if (contentType === "png") {
    res.setHeader("Content-Type", "image/png");
    payloadString = typeof payload !== "undefined" ? payload : "";
  }
  if (contentType === "jpg") {
    res.setHeader("Content-Type", "image/jpeg");
    payloadString = typeof payload !== "undefined" ? payload : "";
  }

  if (contentType === "plain") {
    res.setHeader("Content-Type", "text/plain");
    payloadString = typeof payload !== "undefined" ? payload : "";
  }

  // return the response parts that are content specific

  // return the response parts that are common to all content types
  res.writeHead(statusCode);
  res.end(payloadString);

  // if the response is 200 print, green otherwise print red
  if (statusCode === 200) {
    debug(
      "\x1b[32m%s\x1b[0m",
      `${method.toUpperCase()} /${trimmedPath} ${statusCode}`
    );
  } else {
    debug(
      "\x1b[31m%s\x1b[0m",
      `${method.toUpperCase()} /${trimmedPath} ${statusCode}`
    );
  }
};

// define a request router
server.router = {
  "": index,
  "account/create": accountCreate,
  "account/edit": accountEdit,
  "account/deleted": accountDeleted,
  "session/create": sessionCreate,
  "session/deleted": sessionDeleted,
  "checks/all": checksList,
  "checks/create": checksCreate,
  "checks/edit": checksEdit,
  "api/users": users,
  "api/tokens": tokens,
  "api/checks": checks,
  "favicon.ico": favicon,
  "example/error": exampleError,
  public: public,
  ping: ping,
};

// init script
server.init = () => {
  // start the "http" server
  server.httpServer.listen(httpPort, () => {
    console.log(
      "\x1b[35m%s\x1b[0m",
      `The HTTP server is running on port ${httpPort}...`
    );
  });

  // start the https server
  server.httpsServer.listen(httpsPort, () => {
    console.log(
      "\x1b[36m%s\x1b[0m",
      `The HTTPS server is running on port ${httpsPort}...`
    );
  });
};

// export the server
module.exports = server;
