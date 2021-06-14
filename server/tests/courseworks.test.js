/**
 * Jest testing unit: https://jestjs.io/docs/en/setup-teardown
 * @jest-environment node
 */

/* eslint-disable */

const supertest = require('supertest');
const jestExpress = require('./express.js');

let express;
let request; // Used to perform requests using supertest
let cookies; // Variable holding our cookies
let courseworks;

async function authenticate(username, password) {
  const res = await request.post('/user/authenticate').send({ username, password });
  cookies = res.headers['set-cookie'].map(r => r.replace(/; path=\/;.*httponly/gi, '')).join('; ');
}

beforeAll(async () => {
  // Initialize the express server and the supertest library
  express = await jestExpress.init();
  request = supertest(express.app);
  // Import any custom libraries that are gonna be used within the unit test
  courseworks = require('../lib/courseworks.js');
});

afterAll(async (done) => {
  // Close the DB connection and the express server
  jestExpress.sequelize.sql.close();
  express.server.close(done);
});

describe('Coursework operations', () => {
  let coursework;
  let shared;
  let sharedToken;
  const create = {
    title: 'jest Coursework',
    module: 'jest',
    expectedDate: new Date(Date.now() + (86400 * 7 * 1000)),
  };

  it('does not create a coursework if not authenticated', async () => {
    const res = await request.post('/coursework/create')
      .send({ ...create });
    expect(res.body.error._notification).toEqual('You must be authenticated to perform this operation');
  });

  it('does not create a coursework if expected date is earlier than now', async () => {
    await authenticate('admin_3', '.test`');
    const res = await request.post('/coursework/create')
      .set('Cookie', cookies)
      .send({
        ...create,
        expectedDate: new Date(Date.now() - (86400 * 7 * 1000)),
      });
    expect(res.body.error.expectedDate).toEqual(['The expected date of the coursework cannot be earlier than the current date']);
  });

  it('creates a new coursework', async () => {
    await authenticate('admin_3', '.test`');
    const res = await request.post('/coursework/create')
      .set('Cookie', cookies)
      .send({ ...create });
    coursework = res.body.result[0].id;
    sharedToken = res.body.result[0].sharedToken;
    shared = res.body.result[0].shared;
    const found = await courseworks.getCoursework({ coursework });
    expect(found[0].id).toEqual(coursework);
  });

  const newTitle = 'jest2 Coursework';

  it('does not edit the coursework if not the owner', async () => {
    await authenticate('admin_1', '%test%');
    const res = await request.post('/coursework/edit')
      .set('Cookie', cookies)
      .send({
        coursework,
        ...create,
        title: newTitle,
      });
    expect(res.body.error._notification).toEqual('You are not the owner of this coursework');
  });

  it('does not edit the coursework if nothing is changed', async () => {
    await authenticate('admin_3', '.test`');
    const res = await request.post('/coursework/edit')
      .set('Cookie', cookies)
      .send({
        coursework,
        ...create,
      });
    expect(res.body.error._notification).toEqual('No changes have been made to the coursework');
  });

  it('edits the coursework', async () => {
    await authenticate('admin_3', '.test`');
    const res = await request.post('/coursework/edit')
      .set('Cookie', cookies)
      .send({
        coursework,
        ...create,
        title: newTitle,
      });
    expect(res.body.result.title).toEqual(newTitle);
  });

  it('changes the coursework progress', async () => {
    await authenticate('admin_3', '.test`');
    const res = await request.post('/coursework/changeProgress')
      .set('Cookie', cookies)
      .send({
        coursework,
        completed: true,
      });
    const found = await courseworks.getCoursework({ coursework });
    expect(found[0].completedDate).toBeTruthy();
  });

  it('does not edit the coursework if marked as completed', async () => {
    await authenticate('admin_3', '.test`');
    const res = await request.post('/coursework/edit')
      .set('Cookie', cookies)
      .send({
        coursework,
        ...create,
        title: newTitle,
      });
    expect(res.body.error._notification).toEqual('You cannot edit a completed coursework');
  });

  it('does not change the progress if it\'s the same', async () => {
    await authenticate('admin_3', '.test`');
    const res = await request.post('/coursework/changeProgress')
      .set('Cookie', cookies)
      .send({
        coursework,
        completed: true,
      });
    expect(res.body.error._notification).toEqual('The coursework is already marked as complete');
  });

  it('changes the coursework privacy', async () => {
    await authenticate('admin_3', '.test`');
    await request.post('/coursework/changePrivacy')
      .set('Cookie', cookies)
      .send({
        coursework,
        privacy: true,
      });
    const found = await courseworks.getCoursework({ coursework });
    expect(found[0].privacy).toBeTruthy();
  });

  it('does not change the privacy if it\'s the same', async () => {
    await authenticate('admin_3', '.test`');
    const res = await request.post('/coursework/changePrivacy')
      .set('Cookie', cookies)
      .send({
        coursework,
        privacy: true,
      });
    expect(res.body.error._notification).toEqual('The coursework is already private');
  });

  it('does not allow users to visit a private coursework', async () => {
    await authenticate('user_1', '.test`');
    const res = await request.get('/coursework/get')
      .set('Cookie', cookies)
      .query({ coursework });
    expect(res.body.error._notification).toEqual('You have not been invited to view this coursework');
  });

  it('allows users to visit a private coursework with a share link', async () => {
    await authenticate('user_1', '.test`');
    const res = await request.get('/coursework/get')
      .set('Cookie', cookies)
      .query({ coursework, shared: sharedToken });
    expect(res.body.result).toBeDefined();
  });

  it('changes the coursework shared token', async () => {
    await authenticate('admin_3', '.test`');
    const res = await request.post('/coursework/changeShared')
      .set('Cookie', cookies)
      .send({ coursework, change: true });
    expect(res.body.result.shared).not.toEqual(shared);
    expect(res.body.result.token).not.toEqual(sharedToken);
  });

  it('denies users to visit a private coursework with an invalid share link', async () => {
    await authenticate('user_1', '.test`');
    const res = await request.get('/coursework/get')
      .set('Cookie', cookies)
      .query({ coursework, shared: sharedToken });
    expect(res.body.error._notification).toEqual('You have not been invited to view this coursework');
  });

  it('invites a participant to the coursework', async () => {
    await authenticate('admin_3', '.test`');
    await request.post('/coursework/addParticipant')
      .set('Cookie', cookies)
      .send({ coursework, member: 'user_1', team: 'Jest' });
    const found = await courseworks.getParticipants(coursework, 4);
    expect(found.length).toBe(1);
  });

  it('edits a coursework participant', async () => {
    await authenticate('admin_3', '.test`');
    await request.post('/coursework/editParticipant')
      .set('Cookie', cookies)
      .send({ coursework, member: 4, team: 'Jest Unit Testing' });
    const found = await courseworks.getParticipants(coursework, 4);
    expect(found[0].team).toBe('Jest Unit Testing');
  });

  it('uninvites a participant from the coursework', async () => {
    await authenticate('admin_3', '.test`');
    await request.post('/coursework/deleteParticipant')
      .set('Cookie', cookies)
      .send({ coursework, member: 4, username: 'user_1' });
    const found = await courseworks.getParticipants(coursework, 4);
    expect(found.length).toBe(0);
  });

  it('deletes a coursework', async () => {
    await authenticate('admin_3', '.test`');
    await request.post('/coursework/delete')
      .set('Cookie', cookies)
      .send({ coursework, title: newTitle });
    const found = await courseworks.getCoursework({ coursework });
    expect(found[0].deleted).toBeTruthy();
  });
});
