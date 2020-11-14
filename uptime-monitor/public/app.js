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

// Bind the forms
app.bindForms = () => {
  document.querySelector("form").addEventListener("submit", (e) => {
    // Stop it from submitting
    e.preventDefault();
    const formId = e.target.id;
    const path = e.target.action;
    const method = e.target.method.toUpperCase();

    // Hide the error message (if it's currently shown due to a previous error)
    document.querySelector("#" + formId + " .formError").style.display =
      "hidden";

    // Turn the inputs into a payload
    const payload = {};
    const inputs = e.target.elements;
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].type !== "submit") {
        const valueOfElement =
          inputs[i].type === "checkbox" ? inputs[i].checked : inputs[i].value;
        payload[inputs[i].name] = valueOfElement;
      }
    }

    // Call the API
    app.client.request(undefined, path, method, undefined, payload, function (
      statusCode,
      responsePayload
    ) {
      // Display an error on the form if needed
      if (statusCode !== 200) {
        // Try to get the error from the api, or set a default error message
        const error =
          typeof responsePayload.Error === "string"
            ? responsePayload.Error
            : "An error has occured, please try again";

        // Set the formError field with the error text
        document.querySelector("#" + formId + " .formError").innerHTML = error;

        // Show (unhide) the form error field on the form
        document.querySelector("#" + formId + " .formError").style.display =
          "block";
      } else {
        // If successful, send to form response processor
        app.formResponseProcessor(formId, payload, responsePayload);
      }
    });
  });
};

// Form response processor
app.formResponseProcessor = (formId, requestPayload, responsePayload) => {
  var functionToCall = false;
  if (formId === "accountCreate") {
    // @TODO Do something here now that the account has been created successfully
  }
};

// Init (bootstrapping)
app.init = () => {
  // Bind all form submissions
  app.bindForms();
};

// Call the init processes after the window loads
window.onload = () => {
  app.init();
};
