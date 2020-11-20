//dependencies

const server = require("./lib/server");
const workers = require("./lib/workers");
const cli = require("./lib/cli");
const exampleDebugProb = require("./lib/exampleDebuggingProblem");

// declare the app
const app = {};

// init function
app.init = () => {
  // start the server
  debugger;
  server.init();
  debugger;
  // start the workers
  debugger;
  workers.init();
  debugger;
  // start the CLI after the server
  debugger;
  setTimeout(() => {
    cli.init();
    debugger;
  }, 50);
  debugger;

  debugger;
  let foo = 1;
  console.log("Just assigned 1 to foo")
  debugger;

  foo++;
  console.log("Just assigned increnmented foo")
  debugger;

  foo = foo * foo;
  console.log("Just squared foo")
  debugger;

  foo = foo.toString();
  console.log("Just converted foo to string")
  debugger;

  // call the init script that will throw
  debugger;
  exampleDebugProb.init();
  console.log("Just called the library")
  debugger;
};

// execute
app.init();

// export the app
module.exports = app;
