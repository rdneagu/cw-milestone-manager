const express = require('express');
const milestones = require('../lib/milestones.js');
const permissions = require('../lib/permissions.js');

const router = express.Router();

/**
 * GET /milestone/list
 */
router.get('/list', async (req, res) => {
  let error;
  let result;
  try {
    await permissions.hasCourseworkReadOnlyPermission(req.session.user, req.query.coursework, req.query.shared);
    result = await milestones.getAllMilestones(req.query);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * GET /milestone/get
 */
router.get('/get', async (req, res) => {
  let error;
  let result;
  try {
    await permissions.hasCourseworkReadOnlyPermission(req.session.user, req.query.coursework, req.query.shared);
    result = await milestones.getMilestone(req.query);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * POST /milestone/create
 */
router.post('/create', async (req, res) => {
  let error;
  let result;
  try {
    await permissions.hasCourseworkWritePermission(req.session.user, req.body.coursework);
    result = await milestones.createMilestone(req.body);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * POST /milestone/edit
 */
router.post('/edit', async (req, res) => {
  let error;
  let result;
  try {
    await permissions.hasCourseworkWritePermission(req.session.user, req.body.coursework);
    result = await milestones.editMilestone(req.body);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * POST /milestone/delete
 */
router.post('/delete', async (req, res) => {
  let error;
  let result;
  try {
    await permissions.hasCourseworkWritePermission(req.session.user, req.body.coursework);
    result = await milestones.deleteMilestone(req.body);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

/**
 * POST /milestone/changeProgress
 */
router.post('/changeProgress', async (req, res) => {
  let error;
  let result;
  try {
    await permissions.hasCourseworkWritePermission(req.session.user, req.body.coursework);
    result = await milestones.changeProgress(req.body);
  } catch (e) {
    error = e;
  }
  res.json({ result, error });
});

module.exports = router;
