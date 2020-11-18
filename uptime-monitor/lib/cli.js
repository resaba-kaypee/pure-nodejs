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
  const commands = {
    exit: "Kill the cli and the rest of application",
    man: "Show this help page",
    help: "alias of 'man' command",
    stats:
      "Get statistics on the underlying operating system and resource utilization.",
    "list users":
      "Show a list of all registered (undeleted) users in the system.",
    "more user info --{userId}": "Show details of a specific user.",
    "list checks --up --down":
      "Show a list of all the active checks is the system, including their state. The --up and --down flags are optional.",
    "more checks info --{checkId}": "Show details of specified check.",
    "list logs":
      "Show the list of all the log files available to be read (compressed) and (uncompressed)",
    "more log info --{fileName}": "Show details of specified log file.",
  };

  // show a header for the help page as wide as the screen
  cli.horizontalLine();
  cli.centered("CLI MANUAL");
  cli.horizontalLine();
  cli.verticalSpace(2);

  // show each command, followed by its explanation, in white and yellow respectively
  for (let key in commands) {
    if (commands.hasOwnProperty(key)) {
      const value = commands[key];
      let line = `\x1b[33m${key}\x1b[0m`;
      const padding = 60 - line.length;
      for (let i = 0; i < padding; i++) {
        line += " ";
      }
      line += value;
      console.log(line);
      cli.verticalSpace();
    }
  }

  cli.verticalSpace(1);

  //end with another horizontal line
  cli.horizontalLine();
};

// create a vertical
cli.verticalSpace = (lines) => {
  lines = typeof line === "number" && lines > 0 ? lines : 1;

  for (let i = 0; i < lines; i++) {
    console.log("");
  }
};

// create a horizontal line across screen
cli.horizontalLine = () => {
  // get the available screen size
  const width = process.stdout.columns;

  let line = "";
  for (let i = 0; i < width; i++) {
    line += "-";
  }
  console.log(line);
};

// create centered text on the screen
cli.centered = (str) => {
  str = typeof str === "string" && str.trim().length > 0 ? str.trim() : false;
  // get the available screen size
  const width = process.stdout.columns;
  // calculate the left padding should be
  const leftPadding = Math.floor((width - str.length) / 2);
  // put in the left padded spaces before the string itself
  let line = "";
  for (let i = 0; i < leftPadding; i++) {
    line += " ";
  }
  line += str;
  console.log(line);
};

// exit
cli.responders.exit = () => {
  process.exit(0);
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
