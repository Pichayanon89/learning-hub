const request = require('supertest');
const app = require('../src/app');

describe('User API Endpoints', () => {
  it('should return user details for id 1', async () => {
    const res = await request(app).get('/users/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('name', 'user 01');
    expect(res.body).toHaveProperty('email', 'user1@xx.com');
  });

  it('should return 404 for user id 2', async () => {
    const res = await request(app).get('/users/2');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'User id=2 not found in system');
  });

  it('should return 500 for user id 3', async () => {
    const res = await request(app).get('/users/3');
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('message', 'System error');
  });
});
