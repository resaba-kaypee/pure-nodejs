/*
Worker-related task 
*/

// node dependencies
const fs = require("fs");
const http = require("http");
const https = require("https");
const url = require("url");
const _data = require("./data");
const helpers = require("./helpers");
const _logs = require("./logs");
const path = require("path");
const util = require("util");
const debug = util.debuglog("workers");

// instanstiate worker
const workers = {};

// look up all checks get their data send to validator
workers.gatherAllChecks = () => {
  // get all the checks
  _data.list("checks", (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach((check) => {
        // read in the check data
        _data.read("checks", check, (err, originalCheckData) => {
          if (!err && originalCheckData) {
            // pass it to the check validator
            workers.validateCheckData(originalCheckData);
          } else {
            debug("Error reading one of the check's data: ", err);
          }
        });
      });
    } else {
      debug("Error: Could not find any checks to process");
    }
  });
};

// sanity checki the check data
workers.validateCheckData = (originalCheckData) => {
  originalCheckData =
    typeof originalCheckData === "object" && originalCheckData !== null
      ? originalCheckData
      : {};
  originalCheckData.id =
    typeof originalCheckData.id === "string" &&
    originalCheckData.id.trim().length === 20
      ? originalCheckData.id.trim()
      : false;
  originalCheckData.userPhone =
    typeof originalCheckData.userPhone === "string" &&
    originalCheckData.userPhone.trim().length === 10
      ? originalCheckData.userPhone.trim()
      : false;
  originalCheckData.protocol =
    typeof originalCheckData.protocol === "string" &&
    ["http", "https"].indexOf(originalCheckData.protocol) > -1
      ? originalCheckData.protocol
      : false;
  originalCheckData.url =
    typeof originalCheckData.url === "string" &&
    originalCheckData.url.trim().length > 0
      ? originalCheckData.url.trim()
      : false;
  originalCheckData.method =
    typeof originalCheckData.method === "string" &&
    ["post", "get", "put", "delete"].indexOf(originalCheckData.method) > -1
      ? originalCheckData.method
      : false;
  originalCheckData.successCodes =
    typeof originalCheckData.successCodes === "object" &&
    originalCheckData.successCodes instanceof Array &&
    originalCheckData.successCodes.length > 0
      ? originalCheckData.successCodes
      : false;
  originalCheckData.timeoutSeconds =
    typeof originalCheckData.timeoutSeconds === "number" &&
    originalCheckData.timeoutSeconds % 1 === 0 &&
    originalCheckData.timeoutSeconds >= 1 &&
    originalCheckData.timeoutSeconds <= 5
      ? originalCheckData.timeoutSeconds
      : false;
  // Set the keys that may not be set (if the workers have never seen this check before)
  originalCheckData.state =
    typeof originalCheckData.state === "string" &&
    ["up", "down"].indexOf(originalCheckData.state) > -1
      ? originalCheckData.state
      : "down";
  originalCheckData.lastChecked =
    typeof originalCheckData.lastChecked === "number" &&
    originalCheckData.lastChecked > 0
      ? originalCheckData.lastChecked
      : false;

  // if all the check pass, pass the data along to the next step in the process
  if (
    originalCheckData.id &&
    originalCheckData.userPhone &&
    originalCheckData.protocol &&
    originalCheckData.url &&
    originalCheckData.method &&
    originalCheckData.successCodes &&
    originalCheckData.timeoutSeconds
  ) {
    workers.performCheck(originalCheckData);
  } else {
    debug("Error: One of the checks is not properly formatted. Skipping it.");
  }
};

// perform the check, send the originalCheck data and the outcome of the check process to the next step in the process
workers.performCheck = (originalCheckData) => {
  // perform the initial check
  const checkOutcome = {
    error: false,
    responseCode: false,
  };

  // mark that the outcome has not been sent yet
  let outcomeSent = false;

  // parse the host name and the path out of the original check data
  const parsedUrl = url.parse(
    `${originalCheckData.protocol}://${originalCheckData.url}`,
    true
  );
  const hostName = parsedUrl.hostname;
  const path = parsedUrl.path;

  // construct request details
  const requestDetails = {
    protocol: `${originalCheckData.protocol}:`,
    hostname: hostName,
    method: originalCheckData.method.toUpperCase(),
    path: path,
    timeout: originalCheckData.timeoutSeconds * 1000,
  };

  // instatiate the request object (using eighter the http or https module)
  const _moduleToUse = originalCheckData.protocol === "http" ? http : https;
  const req = _moduleToUse.request(requestDetails, (res) => {
    const status = res.statusCode;

    // update the checkOutCome and pass the data along
    checkOutcome.responseCode = status;

    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // bind to the error event so it doesn't get thrown
  req.on("error", (e) => {
    // update the checkOutCome and pass the data along
    checkOutcome.error = {
      error: true,
      value: e,
    };

    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // bind to the timeout event so it doesn't get thrown
  req.on("timeout", (timeout) => {
    // update the checkOutCome and pass the data along
    checkOutcome.error = {
      error: true,
      value: timeout,
    };

    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // end the request
  req.end();
};

// process the check outcome, update the check data as needed, trigger an alert to user if needed
// special logic for accomodating a check that has never been tested before (dont alert)
workers.processCheckOutcome = (originalCheckData, checkOutcome) => {
  // decide if the check is considered up or down
  const state =
    !checkOutcome.error &&
    checkOutcome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1
      ? "up"
      : "down";

  // decide if the alert is warrant
  const alertWarranted =
    originalCheckData.lastChecked && originalCheckData.state !== state
      ? true
      : false;

  // log the outcome
  const timeOfCheck = Date.now();

  workers.log(
    originalCheckData,
    checkOutcome,
    alertWarranted,
    state,
    timeOfCheck
  );

  // update the check data
  const newCheckData = originalCheckData;
  newCheckData.state = state;
  newCheckData.lastChecked = timeOfCheck;

  // ==>> check if online
  // console.log(checkOutcome, state, alertWarranted);

  // save the updates
  _data.update("checks", newCheckData.id, newCheckData, (err) => {
    if (!err) {
      // send the new check data to the next phase in the process
      if (alertWarranted) {
        workers.alertUserToStatusChange(newCheckData);
      } else {
        debug("Check outcome has not change, no alert needed.");
      }
    } else {
      debug("Error trying to save updates to one of the checks.");
    }
  });
};

// alert user as to a change in their check status
workers.alertUserToStatusChange = ({ method, protocol, url, state }) => {
  const msg = `Alert: Your check for ${method.toUpperCase()} ${protocol}://${url} is currently ${state}`;

  /*
  => use only if online
  helpers.sendTwilioSms(newCheckData.userPhone, msg, (err) => {
    if (!err) {
      debug(
        "Success: User was alerted to a status change in their checks, via sms",
        msg
      );
    } else {
      debug(
        "Error: Could not send sms alert to user who had a state change in their check",
        err
      );
    }
  });
  */

  debug(
    "Success: User was alerted to a status change in their checks, via sms",
    msg
  );
};

workers.log = (
  originalCheckData,
  checkOutcome,
  alertWarranted,
  state,
  timeOfCheck
) => {
  // form the log data
  const logData = {
    check: originalCheckData,
    outcome: checkOutcome,
    state: state,
    alert: alertWarranted,
    time: timeOfCheck,
  };

  // convert data to a string
  const logString = JSON.stringify(logData);

  // determine the name of the log file
  const logFileName = originalCheckData.id;

  // append the log string to the file
  _logs.append(logFileName, logString, (err) => {
    if (!err) {
      debug("Logging to file succeeded.");
    } else {
      debug("Logging to file failed.");
    }
  });
};

// timer to execute the worker process per minute
workers.loop = () => {
  setInterval(() => {
    workers.gatherAllChecks();
  }, 1000 * 60); // 1 minute
};

// rotate (compress) the log files
workers.rotateLogs = () => {
  _logs.list(false, (err, logs) => {
    // list all the (non-compressed) log files
    if (!err && logs && logs.length > 0) {
      logs.forEach((logName) => {
        // compress data to a diffent file
        const logId = logName.replace(".log", "");
        const newFileId = `${logId}-${Date.now()}`;

        _logs.compress(logId, newFileId, (err) => {
          if (!err) {
            // truncate the log
            _logs.truncate(logId, (err) => {
              if (!err) {
                debug("Success truncating log file.");
              } else {
                debug("Error truncating log file.");
              }
            });
          } else {
            debug("Error compressing the log files.", err);
          }
        });
      });
    } else {
      debug("Error: Could not find any logs to rotate.");
    }
  });
};

// timer to execute the log-rotation process once per day
workers.logRotationLoop = () => {
  setInterval(() => {
    workers.rotateLogs();
  }, 1000 * 60 * 60 * 24); // 24 hrs
};

// init workers
workers.init = () => {
  // send to console in yellow (33m), red (31m), green (32m), blue(34m)
  console.log("\x1b[33m%s\x1b[0m", "Background workers are running.");
  // executes all the checks immediately
  workers.gatherAllChecks();
  // call the loop so the checks will execute later on
  workers.loop();
  // compress all the logs immediately
  workers.rotateLogs();
  // call the compression loop so logs will be compress later on
  workers.logRotationLoop();
};

module.exports = workers;
