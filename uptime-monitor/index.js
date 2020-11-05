// node dependencies
const http = require("http");
const url = require("url");
const { StringDecoder } = require("string_decoder");

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
    // send the response
    res.end("Hello world!\n");
    console.log(buffer);
  });
});

// start the server and have it listen to port 3000
server.listen(3000, () => {
  console.log("💥 Listening on port 3000...");
});
