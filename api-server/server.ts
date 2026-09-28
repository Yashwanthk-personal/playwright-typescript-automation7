import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.dev' });

const app = express();
const PORT = process.env.API_SERVER_PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-12345';

// Middleware
app.use(express.json());

// Test users database (in-memory)
const testUsers = [
  {
    id: 1,
    email: 'testuser@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
  },
  {
    id: 2,
    email: 'demo@demowebshop.com',
    password: 'demo',
    firstName: 'Demo',
    lastName: 'User',
  },
];

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  accessToken?: string;
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * POST /api/auth/login
 * Login endpoint
 */
app.post('/api/auth/login', (req: Request, res: Response<LoginResponse>) => {
  const { email, password } = req.body as LoginRequest;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required',
      errors: {
        email: !email ? ['Email is required'] : [],
        password: !password ? ['Password is required'] : [],
      },
    });
  }

  // Find user
  const user = testUsers.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials',
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Success response
  res.status(200).json({
    token,
    accessToken: token,
    userId: user.id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });
});

/**
 * POST /api/auth/logout
 * Logout endpoint (no-op in demo)
 */
app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * POST /api/auth/register
 * Register endpoint
 */
app.post('/api/auth/register', (req: Request, res: Response<LoginResponse>) => {
  const { email, password, firstName, lastName } = req.body as any;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required',
      errors: {
        email: !email ? ['Email is required'] : [],
        password: !password ? ['Password is required'] : [],
      },
    });
  }

  // Check if user exists
  if (testUsers.find((u) => u.email === email)) {
    return res.status(409).json({
      error: 'Email already exists',
    });
  }

  // Create new user (mock)
  const newUser = {
    id: testUsers.length + 1,
    email,
    password,
    firstName: firstName || '',
    lastName: lastName || '',
  };

  testUsers.push(newUser);

  // Generate token
  const token = jwt.sign(
    {
      userId: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    token,
    accessToken: token,
    userId: newUser.id.toString(),
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
  });
});

/**
 * GET /api/auth/verify
 * Verify token endpoint
 */
app.get('/api/auth/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ valid: true, token: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh token endpoint
 */
app.post('/api/auth/refresh', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const newToken = jwt.sign(
      {
        userId: decoded.userId,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ token: newToken, accessToken: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

/**
 * Health check
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'API Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ API Server running on http://localhost:${PORT}`);
  console.log(`📝 Test with: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`🔐 JWT Secret: ${JWT_SECRET}`);
  console.log(`\nTest Credentials:`);
  console.log(`  Email: ${testUsers[0].email}`);
  console.log(`  Password: ${testUsers[0].password}`);
});
