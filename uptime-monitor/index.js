// node dependencies
const http = require("http");
const url = require("url");

// the server should respond to all request with a string
const server = http.createServer((req, res) => {
  // get the url and parse it
  const parsedUrl = url.parse(req.url, true);

  // get the path
  const path = parsedUrl.pathname;
  // localhost:3000/ return ""
  // localhost:3000/foo return foo
  // localhost:3000/foo/bar return foo/bar
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  // get query string as an object
  const queryStringObj = parsedUrl.query;

  // get the method
  const method = req.method.toUpperCase();

  // send the response
  res.end("Hello world!\n");

  // log the request path
  console.log(
    `Request recieve on path:${trimmedPath} with method: ${method} and with these query string parameter: ${JSON.stringify(
      queryStringObj
    )}`
  );
  // console.log(
  //   "Request recieve on path: " +
  //     trimmedPath +
  //     "with method: " +
  //     method +
  //     "and with these query string parameter: " +
  //     queryStringObj
  // );
  console.log(queryStringObj);
});

// start the server and have it listen to port 3000
server.listen(3000, () => {
  console.log("💥 Listening on port 3000...");
});
