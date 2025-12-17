# BuildTrack - Construction Management System

**BuildTrack** is a complete operating system for modern construction project management. It streamlines collaboration between contractors, architects, and clients by providing real-time project tracking, milestone approvals, inventory management, and centralized communication—all in one unified platform.

---

## 🎯 Problem Statement

Construction projects face critical coordination challenges that lead to delays, cost overruns, and miscommunication:

- **Fragmented Communication**: Endless email chains for milestone approvals and project updates create confusion and delays
- **No Centralized System**: Teams use scattered tools (Excel, WhatsApp, email) for tracking progress, budgets, and timelines
- **Material Management Crisis**: Site stoppages occur frequently due to inventory shortages and poor material tracking
- **Zero Transparency**: Clients have no real-time visibility into project status, budget utilization, or progress
- **Manual, Time-Consuming Processes**: Daily reporting and approval workflows waste 10+ hours per week of admin time
- **Poor Coordination**: Architects (who approve work) and contractors (who execute work) struggle to stay aligned

**The Result?** Projects run over budget by 20-30%, timelines slip by weeks, and stakeholder trust erodes.

---

## ✨ Our Solution

BuildTrack transforms construction chaos into streamlined efficiency with a unified platform that brings all stakeholders together.

### 🏗️ Core Features

#### 1. **Real-Time Project Dashboard**
- Live progress tracking with completion percentages
- Budget vs actual spend visualization with charts
- Active project monitoring with key statistics
- At-a-glance view of milestones, inventory, and reports

#### 2. **Role-Based Access Control**
- **👷 Contractors**: Create milestones directly, submit daily reports, manage inventory, upload site photos
- **👨‍💼 Architects**: Review and approve/reject milestones with detailed feedback, monitor compliance
- **👤 Clients**: View-only dashboard access for complete transparency without workflow disruption

#### 3. **Milestone Management System**
- **Direct Creation**: Contractors create milestones in 3 clicks (no navigation through multiple pages)
- **Visual Approval Workflow**: Architects see pending approvals prominently, approve/reject with comments
- **Progress Tracking**: Visual progress bars (0-100%) with real-time updates
- **Status Management**: pending → in-progress → awaiting-approval → approved/rejected
- **History & Audit Trail**: Complete record of all milestone changes and approvals

#### 4. **Inventory Control**
- Live inventory tracking across all projects
- Automated low-stock alerts to prevent material shortages
- Consumption tracking with date-wise logs
- Supplier information and reorder levels

#### 5. **Visual Documentation**
- Photo gallery organized by project and category
- Daily progress photo uploads with captions
- Before/after comparisons for milestone verification
- Mobile-friendly photo capture

#### 6. **Daily Reporting**
- Contractors log daily work activities
- Worker count and materials used tracking
- Issue reporting and resolution tracking
- Activity timeline for complete project history

#### 7. **Centralized Communication**
- Single source of truth for all project data
- In-app approval workflows (eliminates email chains)
- Real-time notifications for important updates
- Comment threads on milestones and reports

---

### Frontend
├── React 18.2.0 # UI library with hooks
├── React Router 6.21.1 # Client-side routing
├── Vite 5.0.8 # Lightning-fast build tool
├── TailwindCSS 3.4.0 # Utility-first CSS
├── Framer Motion 12.23.26 # Smooth animations
├── Axios 1.6.2 # HTTP client
└── Lucide React # Beautiful icons

### Backend
├── Node.js # JavaScript runtime
├── Express.js # Web framework
├── MongoDB # NoSQL database
├── Mongoose # MongoDB ODM
├── JWT # Token-based auth
├── bcryptjs # Password hashing
├── Multer # File uploads
├── Helmet # Security headers
└── Morgan # Request logging

## Deployment
├── Render # Hosting (Frontend + Backend)
├── MongoDB Atlas # Cloud database

Access Application
Frontend: http://localhost:5173
Backend API: http://localhost:5000/api
Landing Page: http://localhost:5173/
Login: http://localhost:5173/login
Dashboard: http://localhost:5173/app/dashboard
