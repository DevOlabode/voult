// tests/csrf.test.js
const request = require('supertest');
const app = require('../src/index');

describe('CSRF Protection', () => {
    test('Should reject POST without CSRF token', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'test@test.com', password: 'password' });
        
        expect(res.status).toBe(403);
        expect(res.body.message).toContain('CSRF');
    });
});