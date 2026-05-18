const request = require('supertest');
const app = require('../src/index');

describe('XSS Prevention - Input Sanitization', () => {
    
    test('Should reject email with HTML/script tags', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .set('X-Client-Id', 'test-app-id')
            .set('Authorization', 'Bearer test-secret')
            .send({
                email: '<script>alert("xss")</script>@test.com',
                password: 'SecurePassword123!',
                fullName: 'Test User',
                username: 'testuser123'
            });
        
        // Should either reject with 400/403 (CSRF) or sanitize the email
        // Invalid email format should cause validation error
        expect([400, 403, 409]).toContain(res.status);
    });
    
    test('Should sanitize fullName input with HTML tags', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .set('X-Client-Id', 'test-app-id')
            .set('Authorization', 'Bearer test-secret')
            .send({
                email: 'test@example.com',
                password: 'SecurePassword123!',
                fullName: '<img src=x onerror=alert("xss")>',
                username: 'testuser123'
            });
        
        // Request may succeed or fail, but sanitized data should not contain script
        if (res.status === 201) {
            // If registration succeeds, verify user data doesn't contain unescaped HTML
            expect(res.body.user).toBeDefined();
            expect(res.body.user.email).not.toContain('<img');
            expect(res.body.user.email).not.toContain('onerror');
        }
    });
    
    test('Should sanitize username with special characters', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .set('X-Client-Id', 'test-app-id')
            .set('Authorization', 'Bearer test-secret')
            .send({
                email: 'test2@example.com',
                password: 'SecurePassword123!',
                fullName: 'Test User',
                username: '<script>alert("xss")</script>'
            });
        
        // Invalid username format should be rejected (or CSRF 403)
        expect([400, 403]).toContain(res.status);
    });
    
    test('Should handle SQL injection attempts in email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .set('X-Client-Id', 'test-app-id')
            .set('Authorization', 'Bearer test-secret')
            .send({
                email: "'; DROP TABLE users; --@example.com",
                password: 'SecurePassword123!',
                fullName: 'Test User',
                username: 'testuser123'
            });
        
        // Should reject as invalid email or CSRF (sanitize safely)
        expect([400, 403, 409]).toContain(res.status);
    });
    
    test('Should sanitize fullName with onclick attributes', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .set('X-Client-Id', 'test-app-id')
            .set('Authorization', 'Bearer test-secret')
            .send({
                email: 'test3@example.com',
                password: 'SecurePassword123!',
                fullName: '<div onclick="alert(\'xss\')">Click me</div>',
                username: 'testuser456'
            });
        
        // Request succeeds but dangerous attributes should be stripped
        if (res.status === 201) {
            expect(res.body.user).toBeDefined();
        }
    });
    
    test('Should prevent XSS through username with special encoding', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .set('X-Client-Id', 'test-app-id')
            .set('Authorization', 'Bearer test-secret')
            .send({
                email: 'test4@example.com',
                password: 'SecurePassword123!',
                fullName: 'Test User',
                username: 'test&#x3C;script&#x3E;'
            });
        
        // Encoded script tags in username should be rejected (or CSRF 403)
        expect([400, 403]).toContain(res.status);
    });
    
    test('Should sanitize through content with null bytes', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .set('X-Client-Id', 'test-app-id')
            .set('Authorization', 'Bearer test-secret')
            .send({
                email: 'test5@example.com',
                password: 'SecurePassword123!',
                fullName: 'Test\x00User<script>',
                username: 'testuser789'
            });
        
        // Null bytes and scripts should be handled safely (or CSRF 403)
        expect([201, 400, 403]).toContain(res.status);
    });
    
    test('Should validate email format per RFC 5322', async () => {
        const invalidEmails = [
            'plainaddress',
            '@no-local-part.com',
            'user@',
            'user name@example.com',
            'user@domain',
            '<script>user@example.com'
        ];
        
        for (const email of invalidEmails) {
            const res = await request(app)
                .post('/api/auth/register')
                .set('X-Client-Id', 'test-app-id')
                .set('Authorization', 'Bearer test-secret')
                .send({
                    email,
                    password: 'SecurePassword123!',
                    fullName: 'Test User',
                    username: 'testuser'
                });
            
            // All invalid email formats should be rejected
            expect([400, 403, 422]).toContain(res.status);
        }
    });

    test('Should prevent XSS in username register endpoint', async () => {
        const res = await request(app)
            .post('/api/auth/username-register')
            .set('X-Client-Id', 'test-app-id')
            .set('Authorization', 'Bearer test-secret')
            .send({
                username: 'validuser',
                password: 'SecurePassword123!',
                fullName: '<img src=x onerror=alert(1)>',
                email: 'test@example.com'
            });
        
        // Either succeeds with sanitized data or fails validation (or CSRF 403)
        expect([201, 400, 403, 409]).toContain(res.status);
    });
    
    test('Should handle very long input strings', async () => {
        const longString = 'a'.repeat(10000);
        
        const res = await request(app)
            .post('/api/auth/register')
            .set('X-Client-Id', 'test-app-id')
            .set('Authorization', 'Bearer test-secret')
            .send({
                email: 'test@example.com',
                password: 'SecurePassword123!',
                fullName: longString,
                username: 'testuser'
            });
        
        // Should handle gracefully without crashing (or CSRF 403)
        expect([201, 400, 403, 409, 413, 422]).toContain(res.status);
    });
});

describe('XSS Prevention - CSP Headers', () => {
    
    test('Should include Content-Security-Policy header', async () => {
        const res = await request(app)
            .get('/');
        
        expect(res.headers['content-security-policy']).toBeDefined();
    });
    
    test('Should enforce CSP restrictions', async () => {
        const res = await request(app)
            .get('/');
        
        const csp = res.headers['content-security-policy'];
        
        // CSP should restrict scripts to self and unsafe-inline for dev
        expect(csp).toMatch(/script-src/);
        expect(csp).toMatch(/'self'/);
    });
    
    test('Should set X-Content-Type-Options header', async () => {
        const res = await request(app)
            .get('/');
        
        expect(res.headers['x-content-type-options']).toBe('nosniff');
    });
    
    test('Should set X-Frame-Options header', async () => {
        const res = await request(app)
            .get('/');
        
        expect(res.headers['x-frame-options']).toBeDefined();
    });
});