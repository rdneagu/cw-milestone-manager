const express = require('express');
const courseworks = require('../lib/courseworks.js');
const permissions = require('../lib/permissions.js');

const router = express.Router();

/**
 * GET /coursework/list
 */
router.get('/list', async (req, res) => {
  let error;
  let result;
  try {
    result = await courseworks.getCourseworks({ user: req.session.user }, req.query);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * GET /coursework/get
 */
router.get('/get', async (req, res) => {
  let error;
  let result;
  try {
    await permissions.hasCourseworkReadOnlyPermission(req.session.user, req.query.coursework, req.query.shared);
    result = await courseworks.getCoursework(req.query);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * POST /coursework/create
 */
router.post('/create', async (req, res) => {
  let error;
  let result;
  try {
    await permissions.hasPrivileges(req.session.user);
    result = await courseworks.createCoursework(req.session.user, req.body);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * POST /coursework/edit
 */
router.post('/edit', async (req, res) => {
  let error;
  let result;
  try {
    await permissions.hasCourseworkWritePermission(req.session.user, req.body.coursework);
    result = await courseworks.editCoursework(req.body);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * POST /coursework/delete
 */
router.post('/delete', async (req, res) => {
  let error;
  let result;
  try {
    await permissions.hasCourseworkWritePermission(req.session.user, req.body.coursework);
    result = await courseworks.deleteCoursework(req.body);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * POST /coursework/changePrivacy
 */
router.post('/changePrivacy', async (req, res) => {
  let error;
  let result;
  try {
    await permissions.hasCourseworkWritePermission(req.session.user, req.body.coursework);
    result = await courseworks.changePrivacy(req.body);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * POST /coursework/changeProgress
 */
router.post('/changeProgress', async (req, res) => {
  let error;
  let result;
  try {
    await permissions.hasCourseworkWritePermission(req.session.user, req.body.coursework);
    result = await courseworks.changeProgress(req.body);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * POST /coursework/changeShared
 */
router.post('/changeShared', async (req, res) => {
  let error;
  let result;
  try {
    await permissions.hasCourseworkWritePermission(req.session.user, req.body.coursework);
    result = await courseworks.changeShared(req.body);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * POST /coursework/addParticipant
 */
router.post('/addParticipant', async (req, res) => {
  let error;
  let result;
  try {
    await permissions.hasCourseworkWritePermission(req.session.user, req.body.coursework);
    result = await courseworks.addParticipant(req.body);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * POST /coursework/editParticipant
 */
router.post('/editParticipant', async (req, res) => {
  let error;
  let result;
  try {
    await permissions.hasCourseworkWritePermission(req.session.user, req.body.coursework);
    result = await courseworks.editParticipant(req.body);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * POST /coursework/deleteParticipant
 */
router.post('/deleteParticipant', async (req, res) => {
  let error;
  let result;
  try {
    await permissions.hasCourseworkWritePermission(req.session.user, req.body.coursework);
    result = await courseworks.deleteParticipant(req.body);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

module.exports = router;
