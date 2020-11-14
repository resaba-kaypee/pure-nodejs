// HTML handlers

const helpers = require("./helpers");

const handlers = {};

// index handlers
handlers.index = (data, cb) => {
  // reject any request that isn't GET
  if (data.method === "get") {
    // prepare data for interpolation
    const templateData = {
      "head.title": "Uptime Monitoring - Made Simple",
      "head.description":
        "We offer free, simple uptime monitoring for HTTP/HTTPS sites all kinds. When your site goes down, we'll send you a text to let you know",
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

// favicon
handlers.favicon = (data, cb) => {
  // reject any request that isn't GET
  if (data.method === "get") {
    // read in the favicon data
    helpers.getStaticAsset("favicon.ico", (err, data) => {
      if (!err && data) {
        cb(200, data, "favicon");
      } else {
        cb(500);
      }
    });
  } else {
    cb(405);
  }
};

// public assets
handlers.public = (data, cb) => {
  // reject any request that isn't GET
  if (data.method === "get") {
    // get the file name being requested
    const trimmedAssetName = data.trimmedPath.replace("public/", "").trim();
    if (trimmedAssetName.length > 0) {
      // read in the asset's data
      helpers.getStaticAsset(trimmedAssetName, (err, data) => {
        if (!err && data) {
          // determine the content type (default to text)
          let contentType = "plain";

          if (trimmedAssetName.indexOf(".css") > -1) {
            contentType = "css";
          }
          if (trimmedAssetName.indexOf(".png") > -1) {
            contentType = "png";
          }
          if (trimmedAssetName.indexOf(".jpg") > -1) {
            contentType = "jpg";
          }
          if (trimmedAssetName.indexOf(".ico") > -1) {
            contentType = "favicon";
          }

          // callback the data
          cb(200, data, contentType);
        } else {
          cb(404);
        }
      });
    } else {
      cb(404);
    }
  } else {
    cb(405);
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
