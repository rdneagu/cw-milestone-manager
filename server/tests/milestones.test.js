/**
 * Jest testing unit: https://jestjs.io/docs/en/setup-teardown
 * @jest-environment node
 */

/* eslint-disable */

const supertest = require('supertest');
const { Op } = require('sequelize');

const jestExpress = require('./express.js');

let express;
let request; // Used to perform requests using supertest
let cookies; // Variable holding our cookies
let milestones;

async function authenticate(username, password) {
  const res = await request.post('/user/authenticate').send({ username, password });
  cookies = res.headers['set-cookie'].map(r => r.replace(/; path=\/;.*httponly/gi, '')).join('; ');
}

beforeAll(async () => {
  // Initialize the express server and the supertest library
  express = await jestExpress.init();
  request = supertest(express.app);
  // Import any custom libraries that are gonna be used within the unit test
  milestones = require('../lib/milestones.js');
});

afterAll(async (done) => {
  // Close the DB connection and the express server
  jestExpress.sequelize.sql.close();
  express.server.close(done);
});

describe('Get all coursework milestones', () => {
  it('returns an error if the user doesn\'t have read access', async () => {
    await authenticate('admin_3', '.test`');
    const res = await request.get('/milestone/list')
      .set('Cookie', cookies)
      .query({ coursework: 1 });
    expect(res.body.error._notification).toEqual('You have not been invited to view this coursework');
  });

  it('returns a list of items if coursework has milestones', async () => {
    await authenticate('admin_1', '%test%');
    const res = await request.get('/milestone/list')
      .set('Cookie', cookies)
      .query({ coursework: 1 });
    expect(res.body.result.length).toEqual(6);
  });

  it('returns an empty list if coursework has no milestones', async () => {
    const res = await request.get('/milestone/list')
      .set('Cookie', cookies)
      .query({ coursework: 2 });
    expect(res.body.result.length).toEqual(0);
  });

  it('throws a specific notification error if no params specified', async () => {
    const res = await request.get('/milestone/list')
      .set('Cookie', cookies)
      .query();
    expect(res.body.error._notification).toEqual('The coursework could not be found');
  });
});

describe('Get a coursework milestone', () => {
  it('returns an error if the user doesn\'t have read access', async () => {
    await authenticate('admin_3', '.test`');
    const res = await request.get('/milestone/get')
      .set('Cookie', cookies)
      .query({ coursework: 1, milestone: 2 });
    expect(res.body.error._notification).toEqual('You have not been invited to view this coursework');
  });

  it('returns the correct milestone', async () => {
    await authenticate('admin_1', '%test%');
    const res = await request.get('/milestone/get')
      .set('Cookie', cookies)
      .query({ coursework: 1, milestone: 1 });
    expect(res.body.result.id).toEqual(1);
  });

  it('throws a notification if milestone is invalid', async () => {
    const res = await request.get('/milestone/get')
      .set('Cookie', cookies)
      .query({ coursework: 1, milestone: 7 });
    expect(res.body.error._notification).toEqual('The milestone you\'re trying to access cannot be found');
  });

  it('throws a system error if no milestone specified', async () => {
    const res = await request.get('/milestone/get')
      .set('Cookie', cookies)
      .query({ coursework: 1 });
    expect(res.body.error._notification).toEqual('The milestone you\'re trying to access cannot be found');
  });
});

describe('Milestone operations', () => {
  const coursework = 1;
  const data = {
    coursework,
    title: 'jest Milestone',
    startedDate: new Date(Date.now()),
    expectedDate: new Date(Date.now() + (86400 * 7 * 1000)),
  };
  let milestone = null;

  it('does not create a milestone if the user is not owner', async () => {
    await authenticate('admin_3', '.test`');
    const res = await request.post('/milestone/create')
      .set('Cookie', cookies)
      .send({ coursework });
    expect(res.body.error._notification).toEqual('You are not the owner of this coursework');
  });

  it('does not create a milestone if the dates are not in coursework range', async () => {
    await authenticate('admin_1', '%test%');
    const result1 = await request.post('/milestone/create')
      .set('Cookie', cookies)
      .send({
        ...data,
        startedDate: new Date(Date.now() - (86400 * 31 * 1000))
      });
    expect(result1.body.error.startedDate).toEqual(['The start date of the milestone cannot be earlier than the date the coursework has been created']);
    const result2 = await request.post('/milestone/create')
      .set('Cookie', cookies)
      .send({
        ...data,
        expectedDate: new Date(Date.now() + (86400 * 31 * 1000)),
      });
    expect(result2.body.error.expectedDate).toEqual(['The expected date of the milestone cannot be later than the expected date of the coursework']);
    data.expectedDate = new Date(Date.now() + (86400 * 14 * 1000));
    const result3 = await request.post('/milestone/create')
      .set('Cookie', cookies)
      .send({
        ...data,
        startedDate: new Date(Date.now() + (86400 * 14 * 1000)),
      });
    expect(result3.body.error.startedDate).toEqual(['The start date cannot be later than the expected date']);
  });
  
  it('creates a milestone', async () => {
    const res = await request.post('/milestone/create')
      .set('Cookie', cookies)
      .send(data);
    milestone = res.body.result.id;
    const result = await milestones.getMilestone({ coursework, milestone });
    expect(result).toBeTruthy();
  });

  it('does not edit a milestone if the user is not owner', async () => {
    await authenticate('admin_3', '.test`');
    const res = await request.post('/milestone/edit')
      .set('Cookie', cookies)
      .send({ coursework });
    expect(res.body.error._notification).toEqual('You are not the owner of this coursework');
  });

  it('edits a milestone', async () => {
    data.title = 'jest2 Milestone';
    await authenticate('admin_1', '%test%');
    await request.post('/milestone/edit')
      .set('Cookie', cookies)
      .send({
        ...data,
        milestone,
      });
    const result = await milestones.getMilestone({ coursework, milestone });
    expect(result.title).toEqual(data.title);
  });

  it('sets a milestone progress', async () => {
    await request.post('/milestone/changeProgress')
      .set('Cookie', cookies)
      .send({
        coursework,
        milestone,
        completed: true,
      });
    const result = await milestones.getMilestone({ coursework, milestone });
    expect(result.completedDate).toBeTruthy();
  });

  it('does not set the same progress twice', async () => {
    const res = await request.post('/milestone/changeProgress')
      .set('Cookie', cookies)
      .send({
        coursework,
        milestone,
        completed: true,
      });
    expect(res.body.error._notification).toEqual('The milestone is already marked as complete');
  });

  it('does not edit a completed milestone', async () => {
    const res = await request.post('/milestone/edit')
      .set('Cookie', cookies)
      .send({
        ...data,
        milestone,
      });
    expect(res.body.error._notification).toEqual('You cannot edit a completed milestone');
  });

  it('does not delete a milestone if the user is not owner', async () => {
    await authenticate('admin_3', '.test`');
    const res = await request.post('/milestone/delete')
      .set('Cookie', cookies)
      .send({ coursework });
    expect(res.body.error._notification).toEqual('You are not the owner of this coursework');
  });

  it('does not delete a milestone if the title does not match', async () => {
    await authenticate('admin_1', '%test%');
    const res = await request.post('/milestone/delete')
      .set('Cookie', cookies)
      .send({
        coursework,
        milestone,
        title: 'random title',
      });
    expect(res.body.error.title).toEqual(['You must enter the same title of the milestone you want to delete']);
  });

  it('deletes a milestone', async () => {
    await request.post('/milestone/delete')
      .set('Cookie', cookies)
      .send({
        coursework,
        milestone,
        title: data.title,
      });
    let error;
    try {
      await milestones.getMilestone({ coursework, milestone });
    } catch (e) {
      error = e;
    }
    expect(error._notification).toEqual('The milestone you\'re trying to access cannot be found');
  });
});
