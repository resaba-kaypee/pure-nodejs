//dependencies
const cluster = require("cluster");
const os = require("os");
const server = require("./lib/server");
const workers = require("./lib/workers");
const cli = require("./lib/cli");

// declare the app
const app = {};

// init function
app.init = (cb) => {
  // if were on the master thread, start the background workers and the CLI
  if (cluster.isMaster) {
    // start the workers
    workers.init();
    // start the CLI after the server
    setTimeout(() => {
      cli.init();
      cb();
    }, 50);

    for (let i = 0; i < os.cpus().length; i++) {
      cluster.fork();
    }
  } else {
    // if not is cluster master, start the server
    server.init();
  }
};

// self invoking only if required directly
if (require.main === module) {
  app.init(() => {});
}

// export the app
module.exports = app;
