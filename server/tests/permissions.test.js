/**
 * Jest testing unit: https://jestjs.io/docs/en/setup-teardown
 * @jest-environment node
 */

/* eslint-disable */

const jestExpress = require('./express.js');
const { Op } = require('sequelize');

let express;
let permissions;

beforeAll(async () => {
  // Initialize the express server and the supertest library
  express = await jestExpress.init();
  // Import any custom libraries that are gonna be used within the unit test
  permissions = require('../lib/permissions.js');
});

afterAll(async (done) => {
  // Close the DB connection and the express server
  jestExpress.sequelize.sql.close();
  express.server.close(done);
});

describe('Get read only permission for courseworks', () => {
  it('returns true when the user has permission', async () => {
    const res = await permissions.hasCourseworkReadOnlyPermission(4, 1);
    expect(res).toEqual(true);
  });

  it('returns true when the coursework is not private', async () => {
    const res = await permissions.hasCourseworkReadOnlyPermission(5, 1);
    expect(res).toEqual(true);
  });

  it('returns a notification error if user not a participant and coursework is private', async () => {
    let error;
    try {
      await permissions.hasCourseworkReadOnlyPermission(6, 1);
    } catch (e) {
      error = e;
    }
    expect(error._notification).toEqual('You have not been invited to view this coursework');
  });
});

describe('Get write permission for courseworks', () => {
  it('returns true when the user has permission', async () => {
    const res = await permissions.hasCourseworkWritePermission(1, 1);
    expect(res).toEqual(true);
  });

  it('returns a system error if coursework is invalid', async () => {
    let error;
    try {
      await permissions.hasCourseworkWritePermission(1, 1512);
    } catch (e) {
      error = e;
    }
    expect(error._system).toEqual('System called hasCourseworkWritePermission with an invalid coursework');
  });
  
  it('returns a notification error if user not the owner', async () => {
    let error;
    try {
      await permissions.hasCourseworkWritePermission(5, 1);
    } catch (e) {
      error = e;
    }
    expect(error._notification).toEqual('You are not the owner of this coursework');
  });
});
