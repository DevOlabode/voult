// jest.setup.js
// Mock node-fetch using manual mock
jest.mock('node-fetch');

// Suppress dotenv logging during tests
jest.spyOn(console, 'log').mockImplementation(() => {});


