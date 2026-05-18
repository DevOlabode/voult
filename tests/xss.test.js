const request = require('supertest');
const app = require('../src/index');

describe('XSS Prevention', () => {
    test('Should sanitize email input', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: '<script>alert("xss")</script>@test.com',
                password: 'SecurePassword123!',
                username: 'testuser'
            });
        
        // Should either reject or sanitize
        expect(res.status).toBe(400);
    });
    
    test('Should escape user data in responses', async () => {
        const res = await request(app)
            .get('/api/user/me')
            .set('Authorization', `Bearer ${token}`);
        
        // Response should not contain unescaped HTML
        expect(res.body).not.toContain('<script>');
    });
});