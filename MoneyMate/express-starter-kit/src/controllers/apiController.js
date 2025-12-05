/**
 * API Controller
 * 
 * Handles API-specific requests.
 * Contains sample endpoints demonstrating common API patterns.
 */

// Sample in-memory data store (replace with database in production)
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'user' },
];

// Track server start time for uptime calculation
const serverStartTime = Date.now();

/**
 * GET /api
 * API welcome message
 */
exports.welcome = (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Express Starter Kit API',
    version: 'v1',
    documentation: '/api/docs',
    endpoints: {
      status: 'GET /api/status',
      users: 'GET /api/users',
      userById: 'GET /api/users/:id',
      createUser: 'POST /api/users',
    },
  });
};

/**
 * GET /api/status
 * Returns API status and server uptime
 */
exports.status = (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
  const hours = Math.floor(uptimeSeconds / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;

  res.status(200).json({
    status: 'online',
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    uptimeSeconds,
    timestamp: new Date().toISOString(),
    requestCount: req.app.locals.requestCount || 0,
  });
};

/**
 * GET /api/users
 * Returns all users (sample endpoint)
 */
exports.getUsers = (req, res) => {
  // Support pagination via query parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedUsers = users.slice(startIndex, endIndex);

  res.status(200).json({
    success: true,
    count: paginatedUsers.length,
    total: users.length,
    page,
    totalPages: Math.ceil(users.length / limit),
    data: paginatedUsers,
  });
};

/**
 * GET /api/users/:id
 * Returns a specific user by ID
 */
exports.getUserById = (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      message: `No user exists with ID: ${userId}`,
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};

/**
 * POST /api/users
 * Creates a new user (simulated - data not persisted)
 */
exports.createUser = (req, res) => {
  const { name, email, role } = req.body;

  // Basic validation
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Name and email are required fields',
    });
  }

  // Check for duplicate email
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'Conflict',
      message: 'A user with this email already exists',
    });
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    name,
    email,
    role: role || 'user',
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser,
  });
};
