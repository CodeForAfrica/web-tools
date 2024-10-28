import fetch from 'isomorphic-fetch';

/**
 * Helper to stich together any defined params into a string suitable for url arg submission
 */
export function generateParamStr(params) {
  const cleanedParams = {};
  Object.keys(params).forEach((key) => {
    if ({}.hasOwnProperty.call(params, key)) {
      const value = params[key];
      if ((value !== null) && (value !== undefined)) {
        let valueStr = value;
        if (value instanceof Array) {
          valueStr = value.join(',');
        }
        cleanedParams[key] = valueStr;
      }
    }
  });
  const paramStr = Object.keys(cleanedParams).map(key => `${key}=${encodeURIComponent(cleanedParams[key])}`).join('&');
  return paramStr;
}

/**
 * Helper to create a promise that calls the API on the server. Pass in the endpoint url, with params
 * encoded on it already, and this will return a promise to call it with the appropriate headers and
 * such.  It also parses the json response for you.
 */
export function createApiPromise(url, params, httpMethod = 'get', headers) {
  let fullUrl = url;
  if ((params !== undefined) && (params !== null)) {
    fullUrl = `${url}?${generateParamStr(params)}`;
  }

  const fetchOptions = {
    method: httpMethod,
    credentials: 'include',
  };

  if (headers) {
    fetchOptions.headers = {
      ...headers,
    };
  }

  return fetch(fullUrl, fetchOptions).then(
    response => response.json()
  );
}

export function objectToFormData(obj) {
  const formData = new FormData();
  if (obj !== undefined) {
    Object.keys(obj).forEach((key) => {
      if ({}.hasOwnProperty.call(obj, key)) {
        formData.append(key, obj[key]);
      }
    });
  }
  return formData;
}

/**
 * Helper to create a promise that calls the API on the server with some POST'd data. Pass in the endpoint url,
 * and a data object to encode and POST, and this will return a promise to call it with the appropriate headers
 * and such.  It also parses the json response for you.
 * TODO: rename this to createFormBasedApiPromise or something... cause it could be a POST or a PUT or whatever
 */
export function createPostingApiPromise(url, params, httpMethod = 'post') {
  const formData = objectToFormData(params);
  return fetch(url, {
    method: httpMethod,
    credentials: 'include',
    body: formData,
  }).then(
    response => response.json()
  );
}

/**
 * Filter the params for a list of acceptableKeys
 */
export function acceptParams(params, acceptableKeys) {
  if ((params === undefined) || (params === null)) {
    return '';
  }
  const accepted = {};
  Object.keys(params).forEach((key) => {
    if (acceptableKeys.includes(key)) {
      const valueToSend = (params[key] === undefined) ? null : params[key];
      accepted[key] = valueToSend;
    }
  });
  return accepted;
}

export function downloadViaFormPost(url, data) {
  // make a form with all the info we want to submit
  const form = document.createElement('form');
  form.setAttribute('method', 'post');
  form.setAttribute('action', url);
  Object.keys(data).forEach((key) => {
    if ({}.hasOwnProperty.call(data, key)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = data[key];
      form.appendChild(input);
    }
  });
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
