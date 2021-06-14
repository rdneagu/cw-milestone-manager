# How to create new routes

### Create a routing file

The name of the routing file will be the route created. Example: If route is named `/coursework` the file should be named `coursework.js`

#### To enable the route you must have the following lines inside your routing file:
```javascript
// At the beginning
const express = require('express');
const router = express.Router();

/* Your routes
router.get/post('example', (req, res) => {
  // res.json({});
})
*/

// At the end
module.exports = router;
```

#### For consistency, every route should have an unassigned variable called error and result which are sent back to the requester in as a JS object;
```javascript
let error;
let result;

res.json({ result, error })
```

#### If the content of the function is asynchronous (e.g. database calls) you must specify so by using the `async` declaration in the callback and use `await` to call the helper function to force the flow to be respected by waiting for the function to complete
```javascript
async function doSomething() {
  const result = await User.findAll();
  // Waiting for the awaited function to complete
  return result;
}

router.get('example', async (req, res) => {
  const result = await doSomething(); // please note that doSomething function must be async as well
  // Waiting for the awaited function to complete
})
```

#### In order to trace thrown errors in the asynchronous functions, you must use `try { } catch (e) { }` syntax
```javascript
async function doSomething() {
  const result = await User.findAll();
  if (!result.length) {
    throw 'No users found';
  }
  return result;
}

router.get('example', async (req, res) => {
  let result;
  let error;
  try {
    result = await doSomething();
  } catch (e) {
    console.error(e) // Will print 'No users found'
  }
  res.json({ result, error })
  /* The above line will send a response to the requester in js object format:
  {
    result: ...result
    error: ...error
  }
  If doSomething() fails the result will be undefined, else error will be undefined */
})
```

### Import the route to your Express server

The route loader is automatically adding the routes to Express, if a route is wrongly formatted you will notice at runtime since it throws an error
