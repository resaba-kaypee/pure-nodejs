// node dependencies
const http = require("http");
const url = require("url");

// the server should respond to all request with a string
const server = http.createServer((req, res) => {
  // send the response
  res.end("Hello world!\n");
});

// start the server and have it listen to port 3000
server.listen(3000, () => {
  console.log("💥 Listening on port 3000...");
});
