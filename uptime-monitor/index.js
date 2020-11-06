// node dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const fs = require("fs");
const { StringDecoder } = require("string_decoder");
const { httpPort, httpsPort, envName } = require("./config");

// instantiate "http" server
const httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});

// start the "http" server
httpServer.listen(httpPort, () => {
  console.log(`💥 Listening on port ${httpPort} in ${envName} mode...`);
});

// instantiate "https" server
const httpsServerOption = {
  cert: fs.readFileSync("./https/cert.pem"),
  key: fs.readFileSync("./https/key.pem"),
};
const httpsServer = https.createServer(httpsServerOption, (req, res) => {
  unifiedServer(req, res);
});

// start the https server
httpsServer.listen(httpsPort, () => {
  console.log(`💥 Listening on port ${httpsPort} in ${envName} mode...`);
});

// all the server logic for both thre http and https server
const unifiedServer = (req, res) => {
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
  const method = req.method.toUpperCase();

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
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    const data = {
      trimmedPath: trimmedPath,
      queryStringObj: queryStringObj,
      method: method,
      headers: headers,
      payload: buffer,
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

// Define handler
const handlers = {};

// sampler handler
handlers.sample = (data, cb) => {
  // callback a http status code and payload object
  cb(406, { name: "handler sample" });
};

// not found
handlers.notFound = (data, cb) => {
  cb(404);
};

// define a request router
const router = {
  sample: handlers.sample,
};
