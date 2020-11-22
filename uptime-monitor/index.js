//dependencies

const server = require("./lib/server");
const workers = require("./lib/workers");
const cli = require("./lib/cli");

// declare the app
const app = {};

// init function
app.init = (cb) => {
  // start the server
  server.init();
  // start the workers
  workers.init();
  // start the CLI after the server
  setTimeout(() => {
    cli.init();
    cb();
  }, 50);
};

// self invoking only if required directly
if (require.main === module) {
  app.init(() => {});
}

// export the app
module.exports = app;
