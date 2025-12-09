# BuildTrack - Construction Project Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing construction projects, tracking milestones, daily reports, inventory, and site photos.

## Features

- **Role-Based Access Control**: Contractor, Architect, and Client roles with specific permissions
- **Project Management**: Create, track, and manage construction projects
- **Gantt Chart**: Visual project timeline and milestone tracking
- **Daily Reports**: Contractors can log daily site activities and progress
- **Milestone Approvals**: Architects can review and approve project milestones
- **Inventory Management**: Track materials and get low-stock alerts
- **Photo Gallery**: Upload and organize site photos by project
- **Budget Tracking**: Monitor budget vs actual spending with charts
- **Client Portal**: Read-only access for clients to view project progress

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- Multer for file uploads

### Frontend
- React 18 with Vite
- React Router v6
- Tailwind CSS
- Recharts for data visualization
- Axios for API calls

## Prerequisites

- Node.js 18+ installed
- MongoDB installed locally (or MongoDB Atlas connection string)
- npm or yarn package manager

## Installation

### 1. Clone and Navigate

\`\`\`bash
cd buildtrack
\`\`\`

### 2. Install Dependencies

\`\`\`bash
# Install root dependencies
npm install

# Install all dependencies (server + client)
npm run install-all
\`\`\`

### 3. Configure Environment Variables

\`\`\`bash
# Copy the example env file
cp server/.env.example server/.env

# Edit the .env file with your settings
\`\`\`

**Required Environment Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/buildtrack |
| JWT_SECRET | Secret key for JWT tokens | (change this!) |
| JWT_EXPIRE | Token expiration time | 30d |
| CLIENT_URL | Frontend URL for CORS | http://localhost:5173 |

### 4. Start MongoDB

Make sure MongoDB is running locally:

\`\`\`bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu
sudo systemctl start mongod

# On Windows
net start MongoDB
\`\`\`

### 5. Run the Application

\`\`\`bash
# Development mode (runs both server and client)
npm run dev

# Or run separately:
npm run server   # Backend only (port 5000)
npm run client   # Frontend only (port 5173)
\`\`\`

### 6. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Milestones
- `GET /api/milestones` - List milestones
- `POST /api/milestones` - Create milestone
- `PUT /api/milestones/:id/approve` - Approve/reject milestone (Architect only)

### Daily Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Create report (Contractor only)
- `GET /api/reports/:id` - Get report details

### Inventory
- `GET /api/inventory` - List inventory items
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id/quantity` - Update quantity

### Photos
- `GET /api/photos` - List photos
- `POST /api/photos` - Upload photo
- `DELETE /api/photos/:id` - Delete photo

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## User Roles

### Contractor
- Create and manage daily reports
- Upload site photos
- Manage inventory
- View assigned projects

### Architect
- Review and approve milestones
- View all project details
- Access daily reports

### Client
- View project progress (read-only)
- View budget status
- Access photo gallery

## Project Structure

\`\`\`
buildtrack/
├── server/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   └── authController.js  # Auth logic
│   ├── middleware/
│   │   └── auth.js            # JWT & role middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Milestone.js
│   │   ├── DailyReport.js
│   │   ├── Inventory.js
│   │   └── Photo.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── milestones.js
│   │   ├── reports.js
│   │   ├── inventory.js
│   │   ├── photos.js
│   │   └── dashboard.js
│   ├── uploads/               # Uploaded files
│   ├── utils/
│   │   └── helpers.js
│   └── server.js              # Express app entry
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # Reusable UI components
│   │   │   └── GanttChart.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── dashboards/
│   │   │   ├── projects/
│   │   │   ├── reports/
│   │   │   ├── inventory/
│   │   │   ├── milestones/
│   │   │   └── photos/
│   │   ├── services/
│   │   │   └── api.js         # Axios instance
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── package.json               # Root package with scripts
└── README.md
\`\`\`

## Development

### Adding New Features

1. Create the model in `server/models/`
2. Create the route in `server/routes/`
3. Add the route to `server/server.js`
4. Create frontend components in `client/src/`
5. Add routes in `client/src/App.jsx`

### Database Seeding

You can create a seed script to populate the database with test data:

\`\`\`bash
node server/seed.js
\`\`\`

## Production Deployment

1. Build the client:
\`\`\`bash
npm run build
\`\`\`

2. Set environment variables for production
3. Use a process manager like PM2:
\`\`\`bash
pm2 start server/server.js --name buildtrack
\`\`\`

## License

MIT License - feel free to use this project for learning or commercial purposes.
