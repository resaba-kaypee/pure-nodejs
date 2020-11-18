/**
 * CLI related task
 */

// dependencies
const readline = require("readline");
const util = require("util");
const debug = util.debuglog("cli");
const events = require("events");

class _events extends events {}
const e = new _events();

// instantiate the CLI object
const cli = {};

// input handlers
e.on("man", () => {
  cli.responders.help();
});

e.on("help", () => {
  cli.responders.help();
});

e.on("exit", () => {
  cli.responders.exit();
});

e.on("stats", () => {
  cli.responders.stats();
});

e.on("list users", () => {
  cli.responders.listUsers();
});

e.on("more user info", (str) => {
  cli.responders.moreUserInfo(str);
});

e.on("list checks", (str) => {
  cli.responders.listChecks(str);
});

e.on("more checks info", (str) => {
  cli.responders.moreChecksInfo(str);
});

e.on("list logs", () => {
  cli.responders.listLogs();
});

e.on("more log info", (str) => {
  cli.responders.moreLogInfo(str);
});

// cli responders obj
cli.responders = {};

// help/man
cli.responders.help = () => {
  console.log("You asked for help.");
};

// exit
cli.responders.exit = () => {
  console.log("You asked for exit.");
};

// stats
cli.responders.stats = () => {
  console.log("You asked for stats.");
};

// list user
cli.responders.listUsers = () => {
  console.log("You asked for list users.");
};

// more user info
cli.responders.moreUserInfo = (str) => {
  console.log("You asked for more user info.", str);
};

// list checks
cli.responders.listChecks = (str) => {
  console.log("You asked to list checks.", str);
};

// more checks
cli.responders.moreChecksInfo = (str) => {
  console.log("You asked for more check info.", str);
};

// list logs
cli.responders.listLogs = () => {
  console.log("You asked for logs.");
};

// more log info
cli.responders.moreLogInfo = (str) => {
  console.log("You asked for more log info.", str);
};

// input processesor
cli.processInput = (str) => {
  str = typeof str === "string" && str.trim().length > 0 ? str.trim() : false;

  // only process the input if the user actually wrote something
  if (str) {
    // codify the unique strings that identify the unique questions allowed to be asked
    const uniqueInputs = [
      "man",
      "help",
      "exit",
      "stats",
      "list users",
      "more user info",
      "list checks",
      "more checks info",
      "list logs",
      "more log info",
    ];

    // go through the possible inputs, emit an event when a match is found
    let matchFound = false;
    let counter = 0;
    uniqueInputs.some((input) => {
      if (str.toLowerCase().indexOf(input) > -1) {
        matchFound = true;
        // emit an event matching the unique input, and include the full string given
        e.emit(input, str);
        return true;
      }
    });

    // if no match is found, tell the user to try again
    if (!matchFound) {
      console.log("Command not found: try --help/man");
    }
  }
};

// init script
cli.init = () => {
  console.log("\x1b[32m%s\x1b[0m", `The cli is running`);

  // start the interface
  const _interface = readline.createInterface({
    input: process.stdin,
    outut: process.stdout,
    prompt: "",
  });

  // create initial prompt
  _interface.prompt();

  // handle each line separately
  _interface.on("line", (line) => {
    // send to the input processesor
    cli.processInput(line);
    // re-initialize the prompt
    _interface.prompt();
  });

  // if the user stops the CLI, kill the associated process
  _interface.on("close", () => {
    process.exit(0);
  });
};

module.exports = cli;
