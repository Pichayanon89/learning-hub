const request = require('supertest');
const app = require('../src/app');

describe('Admin Auth', () => {
  it('returns a signed admin token for the configured password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'test-admin-password' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('expiresAt');
    expect(res.body.token).not.toContain('test-admin-password');
  });

  it('rejects media writes without an admin token', async () => {
    const res = await request(app)
      .post('/api/media')
      .send({ title: 'Blocked item' });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('success', false);
  });
});
