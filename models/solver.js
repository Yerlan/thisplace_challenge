import API from '../api/api';
import { includes, subtract, add, divide, multiply, isInteger, range, find } from 'lodash';

/* Define search dictionary */
const dictionary = {
  maths: ["plus", "minus", "add", "subtract", "multiply", "times", "divide"],
  operations: ["last", "first"],
  actions: ["get", "post"]
}

/* Starting point. Here we start from making first post request with name. */
function start(globalResponse) {

  Promise.all([
    API.callURL({
      method: 'POST',
      url: '/hello',
      body: {
        name: 'Yerlan'
      }
    })
  ]).then(res => {

    parseData(res[0]);

  });

  function nextStep(params) {
    Promise.all([
      API.callURL({
        method: params.method,
        url: params.url,
        body: params.body || ''
      })
    ]).then(res => {

      parseData(res[0]);

    });
  }

  /* Last stage */
  function lastStep(params) {

    let text = params.replace(/\n/g, " ").replace("?", "");
    let textArray = text.split(" ");
    let nextURL = '';

    let firstNumValue;
    let secondNumValue;

    //Get next URL
    textArray.forEach(textelm => {
      if (textelm.match(/^\/.*/ig)) {
        nextURL = textelm;
      }
    });

    /* Get range */
    textArray.forEach(textelm => {
      if (parseInt(textelm) || textelm == '0') {

        if (!firstNumValue) {
          firstNumValue = textelm;
        } else {
          if (!secondNumValue) {
            secondNumValue = textelm;
          }
        }

      }
    });

    console.log('firstNumValue', firstNumValue);
    console.log('secondNumValue', secondNumValue);

    /* Get random number */
    const getRandomNum = (operator, target) => {

      /* Check if we're required to return greater or less number than the target number */
      if (operator && target) {

        let r = Math.floor(Math.random() * (secondNumValue - firstNumValue + 1) + firstNumValue);

        switch (operator) {
          case "greater":
            while (r < target) {
              r = Math.floor(Math.random() * (secondNumValue - firstNumValue + 1) + firstNumValue);
            }
            console.log('OK...My try is: ', r);

            return r;
            break;

          case "less":
            while (r > target) {
              r = Math.floor(Math.random() * (secondNumValue - firstNumValue + 1) + firstNumValue);
            }
            console.log('OK...My try is: ', r);

            return r;
            break;

          default:
            break;
        }

      }

      return Math.floor(Math.random() * (secondNumValue - firstNumValue + 1) + firstNumValue);

    }

    tryGuess(getRandomNum());

    function tryGuess(n) {

      /* Try guessing number */
      Promise.all([
        API.callURL({
          method: "POST",
          url: nextURL,
          body: {
            "answer": n
          }
        })
      ]).then(res => {

        console.log('res', res);


        let finalText = res[0].replace(/\n/g, " ").replace("?", "").replace("!", "");
        let finalTextArray = finalText.split(" ");

        /* Response */
        if (find(finalTextArray, (t) => {
          return t.toLowerCase() == "correct"
        })) {

          finalText.replace(/\n/g, " ").replace("?", "").split(" ").forEach(textelm => {
            if (textelm.match(/^\/.*/ig)) {
              globalResponse.json({
                response: "Challenge solved. See animated gif here: http://dev-challenge.thisplace.com" + textelm
              })
            }
          });

        } else if (finalText.match(/Unfortunately/ig)) {

          /* We've used all our attempts, try start all over again */
          start(globalResponse);

        } else {

          /* Incorrect number provided, try generate another number, more precisely. */
          finalTextArray.forEach(t => {

            if (t.toLowerCase() == "greater") {
              tryGuess(getRandomNum("greater", n));
            }

            if (t.toLowerCase() == "less") {
              tryGuess(getRandomNum("less", n));
            }

          });

        }

      });

    }

  }

  /* Parse incoming body data */
  function parseData(res) {

    // console.log('res', res);

    /* 
    Seems like we went to the last step,
    where we need to find a number in a range.
    */
    if (res.match(/(from .* to .*)/ig)) {
      lastStep(res);
      return
    }

    /* Replace unnecessary strings and new lines and split to array */
    let text = res.replace(/\n/g, " ").replace("?", "");
    let textArray = text.split(" ");

    /* Define empty vars */
    let nextURL = '';
    let nextMethod = 'GET';
    let nextBody;

    /* Perform search for Maths operations */
    let operatorFound = false;
    dictionary.maths.forEach(operator => {

      /* If there is math operator in text */
      if (includes(text.toLowerCase(), operator) && !operatorFound) {

        operatorFound = true;
        let firstNumValue;
        let secondNumValue;

        /* Go through text array and look for numerical values */
        textArray.forEach(textelm => {
          if (parseInt(textelm) || textelm == '0') {
            if (!firstNumValue) {
              firstNumValue = textelm;
            } else {
              secondNumValue = textelm;
            }
          }
        });

        /* Values found, now parse ints */
        firstNumValue = parseInt(firstNumValue);
        secondNumValue = parseInt(secondNumValue);

        console.log("Found maths question: ", operator, firstNumValue, secondNumValue);

        /* Do some maths */
        switch (operator.toLowerCase()) {
          case "add":
          case "plus":

            nextBody = {
              "answer": add(firstNumValue, secondNumValue)
            }
            break;

          case "subtract":
            nextBody = {
              "answer": subtract(secondNumValue, firstNumValue)
            }
            break;

          case "minus":
            nextBody = {
              "answer": subtract(firstNumValue, secondNumValue)
            }
            break;

          case "times":
          case "multiply":
            nextBody = {
              "answer": multiply(firstNumValue, secondNumValue)
            }
            break;

          case "divide":
            nextBody = {
              "answer": divide(firstNumValue, secondNumValue)
            }
            break;

          default:
            break;
        }

      }

    });

    /* Search for an operation, like 'first' or 'last' */
    let operationFound = false;
    dictionary.operations.forEach(operation => {
      if (includes(text.toLowerCase(), operation) && !operationFound) {

        let numValue;
        let targetString;

        /*

          In text array look for:
          1. Target word starting and ending with double quotes
          2. Numerical value

        */
        textArray.forEach(textelm => {

          if (textelm.match(/^".*"/ig)) {
            targetString = textelm.replace(/['"]+/g, '');
          }

          if (parseInt(textelm)) {
            if (!numValue) {
              numValue = parseInt(textelm);
            }
          }

        });

        /* Now get characters */
        let chars = '';
        if (numValue) {

          switch (operation.toLowerCase()) {
            case "first":
              for (let i = 0; i < numValue; i++) {
                chars += targetString.charAt(i);
              }
              break;

            case "last":
              chars = targetString.slice(-numValue);
              break;

            default:
              break;
          }

          if (targetString && numValue) {
            nextBody = {
              "answer": chars
            }
          }

        }

      }
    });

    /* Look for an actions, like get or post */
    let actionFound = false;
    dictionary.actions.forEach(action => {
      if (includes(text.toLowerCase(), action) && !actionFound) {

        actionFound = true;
        nextMethod = action.toUpperCase();

        textArray.forEach(textelm => {
          if (textelm.match(/^\/.*/ig)) {
            nextURL = textelm;
          }
        });

      }
    });

    /* If next url and next method are defined, safe to go to the next step. */
    if (nextURL && nextMethod) {


      if (nextMethod.toLowerCase() == "post") {
        console.log('---------');
        console.log('Ready to push the answers', nextBody);
        console.log('---------');
      }

      nextStep({
        method: nextMethod,
        url: nextURL,
        body: nextBody
      });
    }

  }

}

export default {
  start: start,
}