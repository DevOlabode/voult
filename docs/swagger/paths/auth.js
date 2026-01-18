/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [End User Auth]
 *     summary: Register a new end user
 *     security:
 *       - ClientAuth: []
 *       - ClientId: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [End User Auth]
 *     summary: Login an end user
 *     security:
 *       - ClientAuth: []
 *       - ClientId: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [End User Auth]
 *     summary: Get current authenticated user
 *     security:
 *       - EndUserJWT: []
 *     responses:
 *       200:
 *         description: User profile
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [End User Auth]
 *     summary: Logout end user
 *     security:
 *       - EndUserJWT: []
 *     responses:
 *       200:
 *         description: Logged out
 */

