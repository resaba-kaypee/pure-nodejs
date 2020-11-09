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
};

// production env
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashingSecret: "SS:gdf09gD8sd9GDf783s3df",
  maxChecks: 5,
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
