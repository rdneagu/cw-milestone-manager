const express = require('express');
const users = require('../lib/users.js');

const router = express.Router();

/**
 * POST /user/register
 */
router.post('/register', async (req, res) => {
  let error;
  let result;
  try {
    result = await users.register(req.body);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * POST /user/authenticate
 */
router.post('/authenticate', async (req, res) => {
  let error;
  let result;
  try {
    result = await users.authenticate(req.session, req.body);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * GET /user/deauthenticate
 */
router.get('/deauthenticate', async (req, res) => {
  let error;
  let result;
  try {
    result = await users.deauthenticate(req.session);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * GET /user/session
 */
router.get('/session', async (req, res) => {
  let error;
  let result;
  req.session.touch();
  try {
    result = await users.session(req.session.user);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * POST /user/recover
 */
router.post('/recover', async (req, res) => {
  let error;
  let result;
  try {
    result = await users.recover(req.body);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

module.exports = router;
