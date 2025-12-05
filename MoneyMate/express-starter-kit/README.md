# Express Starter Kit 🚀

A production-ready Node.js Express starter template with a well-organized project structure. Ready for GitHub upload and Render deployment without any modifications!

## ✨ Features

- **Well-Organized Structure** - Clean MVC-like architecture
- **Environment Variables** - dotenv configuration with example file
- **CORS Enabled** - Cross-origin requests supported
- **Error Handling** - Centralized error handling middleware
- **Request Logging** - Color-coded console logging
- **Health Check** - Built-in health check endpoint for monitoring
- **API Ready** - Sample REST API endpoints included
- **Deployment Ready** - Configured for Render, Replit, and Docker
- **Docker Support** - Production-ready Dockerfile with multi-stage build

## 📁 Project Structure

```
express-starter-kit/
├── src/
│   ├── routes/          # Route definitions
│   │   ├── index.js     # Main routes
│   │   └── api.js       # API routes
│   ├── controllers/     # Request handlers
│   │   ├── homeController.js
│   │   └── apiController.js
│   ├── middleware/      # Custom middleware
│   │   ├── logger.js
│   │   └── errorHandler.js
│   └── config/          # Configuration files
│       └── app.js
├── public/              # Static files
│   └── index.html
├── views/               # View templates (if using SSR)
├── index.js             # Application entry point
├── package.json         # Dependencies and scripts
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore rules
├── render.yaml          # Render deployment config
├── Dockerfile           # Docker container config
├── .dockerignore        # Docker ignore rules
├── .replit              # Replit configuration
├── replit.nix           # Replit Nix packages
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Local Development

1. **Clone or Download the Project**
   ```bash
   git clone https://github.com/YOUR_USERNAME/express-starter-kit.git
   cd express-starter-kit
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot reload |

## 🔗 API Endpoints

### Main Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server status message |
| GET | `/health` | Health check (for monitoring) |
| GET | `/info` | Server information |

### API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api` | API welcome message |
| GET | `/api/status` | API status and uptime |
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |

## 📤 Deploy to GitHub

1. **Create a New Repository on GitHub**
   - Go to [github.com/new](https://github.com/new)
   - Name your repository
   - Keep it public or private
   - Click "Create repository"

2. **Initialize Git and Push**
   ```bash
   # Initialize git (if not already done)
   git init
   
   # Add all files
   git add .
   
   # Commit changes
   git commit -m "Initial commit: Express Starter Kit"
   
   # Add remote origin
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

## 🌐 Deploy to Render

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub** (see above)

2. **Connect to Render**
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` and configure automatically

3. **Deploy**
   - Click "Apply" to create your service
   - Wait for deployment to complete
   - Your app will be live at `https://your-app.onrender.com`

### Option 2: Manual Setup

1. **Go to Render Dashboard**
   - Click "New" → "Web Service"

2. **Connect Repository**
   - Connect your GitHub account
   - Select your repository

3. **Configure Service**
   - **Name**: express-starter-kit
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Add Environment Variables**
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render assigns this automatically)

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

## 🐳 Deploy with Docker

### Build and Run Locally

1. **Build the Docker image**
   ```bash
   docker build -t express-starter-kit .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 -e NODE_ENV=production express-starter-kit
   ```

3. **Open in browser**
   ```
   http://localhost:3000
   ```

### With Environment Variables

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e CORS_ORIGIN=https://yourfrontend.com \
  express-starter-kit
```

### Using Docker Compose (Optional)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
```

Then run:
```bash
docker-compose up -d
```

### Deploy to Container Platforms

The Dockerfile is compatible with:
- **Docker Hub** - Push and pull from any server
- **AWS ECS/Fargate** - Serverless container hosting
- **Google Cloud Run** - Fully managed containers
- **Azure Container Apps** - Microsoft's container platform
- **Railway** - Simple container deployments
- **Fly.io** - Deploy containers globally

### Docker Image Features

- **Multi-stage build** - Optimized image size (~150MB)
- **Non-root user** - Enhanced security
- **Health check** - Built-in container health monitoring
- **Alpine base** - Minimal, secure Linux base

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `CORS_ORIGIN` | Allowed CORS origins | `*` |
| `LOG_LEVEL` | Logging level | `info` |
| `LOGGING_ENABLED` | Enable request logging | `true` |

### Setting Environment Variables

#### Local Development
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

#### On Render
1. Go to your service dashboard
2. Click "Environment" tab
3. Add your environment variables
4. Render will automatically redeploy

## 🛠️ Customization

### Adding New Routes

1. Create a controller in `src/controllers/`
2. Create a route file in `src/routes/`
3. Import and use the route in `index.js`

### Adding Middleware

1. Create middleware in `src/middleware/`
2. Import and use in `index.js` or specific routes

### Adding a Database

1. Install database driver (e.g., `npm install pg mongoose`)
2. Add configuration in `src/config/`
3. Create database connection module
4. Update environment variables

## 📝 License

MIT License - feel free to use this template for any project!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Happy Coding!** 🎉
