/**
 * This is unit test
 */

const _helpers = require("../lib/helpers");
const assert = require("assert");
const logs = require("../lib/logs");
const exampleDebuggingProblem = require("../lib/exampleDebuggingProblem");
const example = require("../lib/exampleDebuggingProblem");

// holder for this test
const unit = {};

// example test
// assert that getANumber function is returning a number
unit["helpers.getANumber should return a number"] = (done) => {
  const val = _helpers.getANnumber();
  assert.strictEqual(typeof val, "number");
  done();
};

// assert that getANumber function is returning a 1
unit["helpers.getANumber should return 1"] = (done) => {
  const val = _helpers.getANnumber();
  assert.strictEqual(val, 1);
  done();
};

// assert that getANumber function is returning a 2
unit["helpers.getANumber should return 2"] = (done) => {
  const val = _helpers.getANnumber();
  assert.strictEqual(val, 2);
  done();
};

// logs test
// logs.list should callback and array and false error
unit["logs.list should callback a false error and array of log names"] = (
  done
) => {
  logs.list(true, (err, logFileNames) => {
    assert.strictEqual(err, false);
    assert.ok(logFileNames instanceof Array);
    assert.ok(logFileNames.length > 1);
    done();
  });
};

// logs.truncate should not throw if the logId doesn't exist
unit[
  "logs.truncate should not throw if the logId is not exist. It should callback an error instead"
] = (done) => {
  assert.doesNotThrow(() => {
    logs.truncate("I do not exist", (err) => {
      assert.ok(err);
      done();
    });
  }, TypeError);
};

// exampleDebuggingProblem should not throw (but it does)
unit["exampleDebuggingProblem.init should not throw when called"] = (done) => {
  assert.doesNotThrow(() => {
    exampleDebuggingProblem.init();
    done();
  }, TypeError);
};

module.exports = unit;
