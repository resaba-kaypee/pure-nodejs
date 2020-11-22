// create and export configuration variables

// container for all the environments
const environments = {};

// staging (default) env
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging",
  hashingSecret: "SS:gdf09gD8sd9GDf783s3df",
  maxChecks: 5,
  twilio: {
    accountSid: "AC3b02dcfe4f71a4cb06f88aff61174908",
    authToken: "2713bfd392a410aeaf0885d14b2b428f",
    fromPhone: "+12056795175",
  },
  templateGlobals: {
    appName: "UptimeChecker",
    companyName: "NotARealCompany, Inc.",
    yearCreated: "2020",
    baseUrl: "http://localhost:3000/",
  },
};

// testing env
environments.testing = {
  httpPort: 4000,
  httpsPort: 4001,
  envName: "testing",
  hashingSecret: "SS:gdf09gD8sd9GDf783s3df",
  maxChecks: 5,
  twilio: {
    accountSid: "AC3b02dcfe4f71a4cb06f88aff61174908",
    authToken: "2713bfd392a410aeaf0885d14b2b428f",
    fromPhone: "+12056795175",
  },
  templateGlobals: {
    appName: "UptimeChecker",
    companyName: "NotARealCompany, Inc.",
    yearCreated: "2020",
    baseUrl: "http://localhost:4000/",
  },
};

// production env
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashingSecret: "SS:gdf09gD8sd9GDf783s3df",
  maxChecks: 5,
  twilio: {
    accountSid: "",
    authToken: "",
    fromPhone: "",
  },
  templateGlobals: {
    appName: "UptimeChecker",
    companyName: "NotARealCompany, Inc.",
    yearCreated: "2020",
    baseUrl: "http://localhost:5000/",
  },
};

// determine which env was passed as a command-line argument
const currentEnvironment =
  typeof process.env.NODE_ENV === "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";

// check if the env is specified, if not default to staging
const environmentToExport =
  typeof environments[currentEnvironment] === "object"
    ? environments[currentEnvironment]
    : environments.staging;

module.exports = environmentToExport;
