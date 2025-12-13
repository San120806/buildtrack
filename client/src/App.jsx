"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"

// Landing Page
import LandingPage from "./pages/LandingPage"

// Layouts
import MainLayout from "./layouts/MainLayout"
import AuthLayout from "./layouts/AuthLayout"

// Auth Pages
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"

// Main Pages
import Dashboard from "./pages/Dashboard"
import Projects from "./pages/projects/Projects"
import ProjectDetail from "./pages/projects/ProjectDetail"
import ProjectForm from "./pages/projects/ProjectForm"
import Milestones from "./pages/milestones/Milestones"
import MilestonesList from "./pages/milestones/MilestonesList"
import ArchitectMilestones from "./pages/milestones/ArchitectMilestones"
import DailyReports from "./pages/reports/DailyReports"
import ReportForm from "./pages/reports/ReportForm"
import Inventory from "./pages/inventory/Inventory"
import PhotoGallery from "./pages/photos/PhotoGallery"
import Profile from "./pages/Profile"

import ContractorDashboard from "./pages/dashboards/ContractorDashboard"
import ArchitectDashboard from "./pages/dashboards/ArchitectDashboard"
import ClientDashboard from "./pages/dashboards/ClientDashboard"

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />
  }

  return children
}

// Public Route Component (redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/app/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      {/* Landing Page - Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthLayout>
              <Login />
            </AuthLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <AuthLayout>
              <Register />
            </AuthLayout>
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        <Route
          path="contractor"
          element={
            <ProtectedRoute roles={["contractor"]}>
              <ContractorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="architect"
          element={
            <ProtectedRoute roles={["architect"]}>
              <ArchitectDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="client"
          element={
            <ProtectedRoute roles={["client"]}>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />

        {/* Projects */}
        <Route path="projects" element={<Projects />} />
        <Route path="projects/new" element={<ProjectForm />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="projects/:id/edit" element={<ProjectForm />} />

        {/* Milestones */}
        <Route path="milestones" element={<MilestonesList />} />
        <Route
          path="milestones/architect"
          element={
            <ProtectedRoute roles={["architect"]}>
              <ArchitectMilestones />
            </ProtectedRoute>
          }
        />
        <Route path="projects/:projectId/milestones" element={<Milestones />} />

        {/* Daily Reports */}
        <Route path="reports" element={<DailyReports />} />
        <Route path="reports/new" element={<ReportForm />} />
        <Route path="projects/:projectId/reports" element={<DailyReports />} />

        {/* Inventory */}
        <Route path="inventory" element={<Inventory />} />
        <Route path="projects/:projectId/inventory" element={<Inventory />} />

        {/* Photos */}
        <Route path="photos" element={<PhotoGallery />} />
        <Route path="projects/:projectId/photos" element={<PhotoGallery />} />

        {/* Profile */}
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Catch all - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
