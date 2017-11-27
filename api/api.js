import fetch from 'node-fetch';

const callURL = (params) => {

  if (params && params.method) {

    return fetch('http://dev-challenge.thisplace.com' + params.url, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: params.method,
      body: params.body ? JSON.stringify(params.body) : ''
    }).then((res) => {
      return res.text();
    }).then((r) => {
      return r;
    });
  } else {
    return {
      'error': 'Not enough data'
    }
  }

}

export default {
  callURL: callURL,
}