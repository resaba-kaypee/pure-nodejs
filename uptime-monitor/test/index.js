/**
 * Test runner
 */

// override the NODE_ENV for testing
process.env.NODE_ENV = "testing";

// application logic for test runner
_app = {};

// container for test
_app.tests = {};

// add on the unit test
_app.tests.unit = require("./unit");
_app.tests.api = require("./api");

// to count all test
_app.countTests = () => {
  let counter = 0;
  for (let key in _app.tests) {
    if (_app.tests.hasOwnProperty(key)) {
      const subTests = _app.tests[key];
      for (let testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          counter++;
        }
      }
    }
  }
  return counter;
};

// run all the test, collecting the errors and successes
_app.runTests = () => {
  const limit = _app.countTests();
  let errors = [];
  let successes = 0;
  let counter = 0;

  for (let key in _app.tests) {
    if (_app.tests.hasOwnProperty(key)) {
      let subTests = _app.tests[key];
      for (let testName in subTests) {
        if (subTests.hasOwnProperty(testName)) {
          // encapsulate all test specific variables without overriding each variab  unit = {}les (closure)
          (() => {
            let tmpTestName = testName;
            let testValue = subTests[testName];
            // call the test
            try {
              testValue(() => {
                // if it calls back without throwing, then it succeeded, so log it in green
                console.log("\x1b[32m%s\x1b[0m", tmpTestName);
                counter++;
                successes++;
                if (counter === limit) {
                  _app.produceReport(limit, successes, errors);
                }
              });
            } catch (err) {
              // if it throws then it failed, so capture the error thrown and log it in red
              errors.push({
                name: testName,
                error: err,
              });
              console.log("\x1b[31m%s\x1b[0m", tmpTestName);
              counter++;
              if (counter === limit) {
                _app.produceReport(limit, successes, errors);
              }
            }
          })();
        }
      }
    }
  }
};

// produce a test outcome report

_app.produceReport = (limit, successes, errors) => {
  console.log("");
  console.log("--------------BEGIN TEST REPORT--------------");
  console.log("");
  console.log(`Total tests: ${limit}`);
  console.log(`Successes: ${successes}`);
  console.log(`Fails: ${errors.length}`);
  console.log("");

  // if there are errors print them in detail
  if (errors.length > 0) {
    console.log("--------------BEGIN ERROR DETAILS--------------");
    console.log("");
    errors.forEach((testError) => {
      console.log("\x1b[31m%s\x1b[0m", testError.name);
      console.log(testError.error);
      console.log("");
    });

    console.log("");
    console.log("--------------END ERROR DETAILS--------------");
  }

  console.log("");
  console.log("--------------END TEST REPORT--------------");
  process.exit(0);
};

_app.runTests();
