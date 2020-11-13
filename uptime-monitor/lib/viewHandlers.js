// HTML handlers

const helpers = require("./helpers");

const handlers = {};

// index handlers
handlers.index = (data, cb) => {
  // reject any request that isn't GET
  if (data.method === "get") {
    // prepare data for interpolation
    const templateData = {
      "head.title": "This is the title",
      "head.description": "This is the description",
      "body.title": "Hello templated world!",
      "body.class": "index",
    };

    // read in a template as a string
    helpers.getTemplate("index", templateData, (err, str) => {
      if (!err && str) {
        // add the universal header and footer
        helpers.addUniversalTemplate(str, templateData, (err, str) => {
          if (!err && str) {
            cb(200, str, "html");
          } else {
            cb(500, undefined, "html");
          }
        });
      } else {
        cb(500, undefined, "html");
      }
    });
  } else {
    cb(405, undefined, "html");
  }
};

handlers.accountCreate = () => {};
handlers.accountEdit = () => {};
handlers.accountDeleted = () => {};
handlers.sessionCreate = () => {};
handlers.sessionDeleted = () => {};
handlers.checksList = () => {};
handlers.checksCreate = () => {};
handlers.checksEdit = () => {};

module.exports = handlers;
