// HTML handlers

const helpers = require("./helpers");

const handlers = {};

const readTemplate = (htmlTemplate, templateData, cb) => {
  helpers.getTemplate(htmlTemplate, templateData, (err, str) => {
    if (!err && str) {
      // add the universal header and footer
      helpers.addUniversalTemplate(str, templateData, (err, str) => {
        if (!err && str) {
          cb(200, str, "html");
        } else {
          console.log(err);
          cb(500, undefined, "html");
        }
      });
    } else {
      console.log(err);
      cb(500, undefined, "html");
    }
  });
};

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
    readTemplate(templateData["body.class"], templateData, cb);
  } else {
    cb(405, undefined, "html");
  }
};

// Create account
handlers.accountCreate = (data, cb) => {
  // reject any request that isn't GET
  if (data.method === "get") {
    // prepare data for interpolation
    const templateData = {
      "head.title": "Uptime Monitoring - Made Simple",
      "head.description": "Sign up is easy and only takes a few seconds.",
      "body.class": "accountCreate",
    };

    // read in a template as a string
    readTemplate(templateData["body.class"], templateData, cb);
  } else {
    cb(405, undefined, "html");
  }
};

// Create session
handlers.sessionCreate = (data, cb) => {
  // reject any request that isn't GET
  if (data.method === "get") {
    // prepare data for interpolation
    const templateData = {
      "head.title": "Log in to your account.",
      "head.description":
        "Please enter your phone number and password to access your account.",
      "body.class": "sessionCreate",
    };

    // read in a template as a string
    readTemplate(templateData["body.class"], templateData, cb);
  } else {
    cb(405, undefined, "html");
  }
};

// session deleted
handlers.sessionDeleted = (data, cb) => {
  // reject any request that isn't GET
  if (data.method === "get") {
    // prepare data for interpolation
    const templateData = {
      "head.title": "Logged Out",
      "head.description": "You have been logged out of your account.",
      "body.class": "sessionDeleted",
    };
    // read in a template as a string
    readTemplate(templateData["body.class"], templateData, cb);
  } else {
    cb(405, undefined, "html");
  }
};

// Edit account
handlers.accountEdit = (data, cb) => {
  // reject any request that isn't GET
  if (data.method === "get") {
    // prepare data for interpolation
    const templateData = {
      "head.title": "Account Settings",
      "body.class": "accountEdit",
    };

    // read in a template as a string
    readTemplate(templateData["body.class"], templateData, cb);
  } else {
    cb(405, undefined, "html");
  }
};

// account has been deleted
handlers.accountDeleted = (data, cb) => {
  // reject any request that isn't GET
  if (data.method === "get") {
    // prepare data for interpolation
    const templateData = {
      "head.title": "Account Deleted",
      "head.description": "Your account has been deleted.",
      "body.class": "accountDeleted",
    };

    // read in a template as a string
    readTemplate(templateData["body.class"], templateData, cb);
  } else {
    cb(405, undefined, "html");
  }
};

// create a new check
handlers.checksCreate = (data, cb) => {
  // reject any request that isn't GET
  if (data.method === "get") {
    // prepare data for interpolation
    const templateData = {
      "head.title": "Create a new check",
      "body.class": "checksCreate",
    };

    // read in a template as a string
    readTemplate(templateData["body.class"], templateData, cb);
  } else {
    cb(405, undefined, "html");
  }
};

// view all checks
handlers.checksList = (data, cb) => {
  // reject any request that isn't GET
  if (data.method === "get") {
    // prepare data for interpolation
    const templateData = {
      "head.title": "Dashboard",
      "body.class": "checksList",
    };

    // read in a template as a string
    readTemplate(templateData["body.class"], templateData, cb);
  } else {
    cb(405, undefined, "html");
  }
};

// edit checks
handlers.checksEdit = (data, cb) => {
  // reject any request that isn't GET
  if (data.method === "get") {
    // prepare data for interpolation
    const templateData = {
      "head.title": "Check Details",
      "body.class": "checksEdit",
    };

    // read in a template as a string
    readTemplate(templateData["body.class"], templateData, cb);
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

module.exports = handlers;
