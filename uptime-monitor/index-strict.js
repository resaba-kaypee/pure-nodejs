//dependencies

const server = require("./lib/server");
const workers = require("./lib/workers");
const cli = require("./lib/cli");

// declare the app
const app = {};

foo = "bar";

console.log(foo);

// init function
app.init = () => {
  // start the server
  server.init();
  // start the workers
  workers.init();
  // start the CLI after the server
  setTimeout(() => {
    cli.init();
  }, 50);
};

// execute
app.init();

// export the app
module.exports = app;
