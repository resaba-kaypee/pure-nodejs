// Library for storing and rotating logs

// dependencies
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// container for the module
const lib = {};

// Base directory of logs folder
lib.baseDir = path.join(__dirname, "/../.logs/");

lib.append = (file, str, cb) => {
  // open the file for appending
  fs.open(lib.baseDir + file + ".log", "a", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // append to the file and close it
      fs.appendFile(fileDescriptor, str + "\n", (err) => {
        if (!err) {
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              cb(false);
            } else {
              cb("Error closing file that was being appended.");
            }
          });
        } else {
          cb("Error appending to file.");
        }
      });
    } else {
      console.log("from lib.append:", err);
      cb("Could not open file for appending");
    }
  });
};

lib.list = (includeCompressLogs, cb) => {
  fs.readdir(lib.baseDir, (err, data) => {
    if (!err && data && data.length > 0) {
      const trimmedFileNames = [];
      data.forEach((fileName) => {
        // add the .log files
        if (fileName.indexOf(".log") > -1) {
          trimmedFileNames.push(fileName.replace(".log", ""));
        }

        // add .gz files
        if (fileName.indexOf(".gz.b64") > -1 && includeCompressLogs) {
          trimmedFileNames.push(fileName.replace(".gz.b64", ""));
        }
      });

      cb(false, trimmedFileNames);
    } else {
      cb(err, data);
    }
  });
};

// compress the contents of one .log file into a .gz.b64 file within the same directory
lib.compress = (logId, newFileId, cb) => {
  const sourceFile = logId + ".log";
  const destFile = newFileId + ".gz.b64";

  // read the source file
  fs.readFile(lib.baseDir + sourceFile, "utf8", (err, inputStr) => {
    if (!err && inputStr) {
      // compress the data using gzip
      zlib.gzip(inputStr, (err, buffer) => {
        if (!err && buffer) {
          // send the data to the destination file
          fs.open(`${lib.baseDir}${destFile}`, "wx", (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
              // write to the destination file
              fs.writeFile(fileDescriptor, buffer.toString("base64"), (err) => {
                if (!err) {
                  // close the file destination
                  fs.close(fileDescriptor, (err) => {
                    if (!err) {
                      cb(false);
                    } else {
                      cb(err);
                    }
                  });
                } else {
                  cb(err);
                }
              });
            } else {
              cb(err);
            }
          });
        } else {
          cb(err);
        }
      });
    } else {
      cb(err);
    }
  });
};

// decompress the contents of .gz.b64 file into a string variable
lib.decompress = (fileId, cb) => {
  const fileName = fileId + ".gz.b64";

  fs.readFile(lib.baseDir + fileName, "utf8", (err, str) => {
    if (!err && str) {
      // inflate the data
      const inputBuffer = Buffer.from(str, "base64");
      zlib.unzip(inputBuffer, (err, outputBuffer) => {
        if (!err && outputBuffer) {
          const str = outputBuffer.toString();
          cb(false, str);
        } else {
          cb(err);
        }
      });
    } else {
      cb(err);
    }
  });
};

// truncate a log file
lib.truncate = (logId, cb) => {
  fs.truncate(lib.baseDir + logId + ".log", 0, (err) => {
    if (!err) {
      cb(false);
    } else {
      cb(err);
    }
  });
};

module.exports = lib;
