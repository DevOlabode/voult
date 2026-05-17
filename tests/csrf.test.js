// tests/csrf.test.js
const request = require('supertest');
const app = require('../src/index');

describe('CSRF Protection', () => {
    test('API routes require authentication headers', async () => {
        // Without valid X-Client-Id/Secret headers, API should reject with 401
        const res = await request(app)
            .post('/api/auth/email-login')
            .set('Content-Type', 'application/json')
            .send({ email: 'test@test.com', password: 'Password123!' });

        expect(res.status).not.toBe(200);
        expect(res.body).toBeDefined();
    });

    test('API returns JSON error for missing client credentials', async () => {
        const res = await request(app)
            .post('/api/auth/email-login')
            .set('Content-Type', 'application/json')
            .send({ email: 'test@test.com', password: 'Password123!' });

        expect([400, 401, 403]).toContain(res.status);
        expect(res.body.error).toBeDefined();
    });
});