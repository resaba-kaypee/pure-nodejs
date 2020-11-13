// Library for storing and editing data

// dependencies
const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");

// container for the module (to be exported)
const lib = {};

// base directory of the data folder
lib.baseDir = path.join(__dirname, "/../.data");

// write data to a file
lib.create = (dir, file, data, cb) => {
  // open the file for write
  fs.open(`${lib.baseDir}/${dir}/${file}.json`, "wx", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // convert to string
      const stringData = JSON.stringify(data);

      // write to file
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if (!err) {
          fs.close(fileDescriptor, (err) => {
            if (!err) {
              cb(false);
            } else {
              cb("Error closing new file.");
            }
          });
        } else {
          cb("Error writing new file.");
        }
      });
    } else {
      console.log(err);
      cb("Could not create new file, it may already exist.");
    }
  });
};

// read the file
lib.read = (dir, file, cb) => {
  fs.readFile(`${lib.baseDir}/${dir}/${file}.json`, "utf8", (err, data) => {
    cb(err, helpers.parseJsonToObject(data));
  });
};

// update existing data
lib.update = (dir, file, data, cb) => {
  // open the file for writing
  fs.open(`${lib.baseDir}/${dir}/${file}.json`, "r+", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data);

      // truncate the file before writing
      fs.ftruncate(fileDescriptor, (err) => {
        if (!err) {
          // write file
          fs.writeFile(fileDescriptor, stringData, (err) => {
            if (!err) {
              fs.close(fileDescriptor, (err) => {
                if (!err) {
                  cb(false);
                } else {
                  cb("Error closing new file.");
                }
              });
            } else {
              cb("Error writing to file.");
            }
          });
        } else {
          cb("Error truncating file.");
        }
      });
    } else {
      cb("Could not open the file for updating, it may not exist yet.");
    }
  });
};

// delete the file
lib.delete = (dir, file, cb) => {
  // unlink the file
  fs.unlink(`${lib.baseDir}/${dir}/${file}.json`, (err) => {
    if (!err) {
      cb(false);
    } else {
      cb("Error deleting the file.");
    }
  });
};

// list all the items in a directory
lib.list = (dir, cb) => {
  fs.readdir(`${lib.baseDir}/${dir}/`, (err, data) => {
    if (!err && data && data.length > 0) {
      const trimmedFileNames = [];
      data.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace(".json", ""));
      });
      cb(false, trimmedFileNames);
    } else {
      cb(err, data);
    }
  });
};

// export the module
module.exports = lib;
