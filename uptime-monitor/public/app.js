/*
 * Frontend Logic for application
 *
 */

const app = {};

app.config = {
  sessionToken: false,
};

// ajax client for the restful api
app.client = {};

// interface for making api call
app.client.request = (headers, path, method, queryStringObj, payload, cb) => {
  // set default headers
  headers = typeof headers === "object" && headers !== null ? headers : {};
  path = typeof path === "string" ? path : "/";
  method =
    typeof method === "string" &&
    ["POST", "GET", "PUT", "DELETE"].indexOf(method) > -1
      ? method.toUpperCase()
      : "GET";
  queryStringObj =
    typeof queryStringObj === "object" && queryStringObj !== null
      ? queryStringObj
      : {};
  payload = typeof payload === "object" && payload !== null ? payload : {};
  cb = typeof cb === "function" ? cb : false;

  // for each query string parameter sent, add it to the path
  const requestUrl = path + "?";
  let counter = 0;

  for (let queryKey in queryStringObj) {
    if (queryStringObj.hasOwnProperty(queryKey)) {
      counter++;

      // if atleast one query string param has been already added preprend new ones with an ampersand(&)
      if (counter > 1) {
        requestUrl += "&";
      }

      // add the key and the value
      requestUrl += queryKey + "=" + queryStringObj[queryKey];
    }
  }

  // form the http request as a JSON type
  const xhr = new XMLHttpRequest();

  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-Type", "application/json");

  // for each header sent, add it to the request
  for (let headerKey in headers) {
    if (headers.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey]);
    }
  }
  // if the is current token set, add that as header
  if (app.config.sessionToken) {
    xhr.setRequestHeader("token", app.config.sessionToken.id);
  }

  // when the request comeback, handle the response
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      const statusCode = xhr.status;
      const responseReturned = xhr.responseText;

      // callback if requested
      if (cb) {
        try {
          const parsedResponse = JSON.parse(responseReturned);
          cb(statusCode, parsedResponse);
        } catch (err) {
          console.log({ onreadystatechange: err });
          cb(statusCode, false);
        }
      }
    }
  };

  // send the payload as JSON
  const payloadStr = JSON.stringify(payload);

  xhr.send(payloadStr);
};

console.log("Hello Console World!!");
