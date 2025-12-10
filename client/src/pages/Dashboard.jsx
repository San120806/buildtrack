"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import { formatCurrency } from "../utils/currency"
import {
  FolderKanban,
  IndianRupee,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Clock,
  Camera,
  ClipboardList,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const StatCard = ({ title, value, subtitle, icon: Icon, color, link }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {link && (
        <Link
          to={link}
          className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mt-4 font-medium"
        >
          View details <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      )}
    </div>
  )
}

const Dashboard = () => {
  const { user, isContractor, isArchitect, isClient } = useAuth()
  const [stats, setStats] = useState(null)
  const [budgetData, setBudgetData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, budgetRes] = await Promise.all([api.get("/dashboard/stats"), api.get("/dashboard/budget-chart")])

      setStats(statsRes.data.data)
      setBudgetData(budgetRes.data.data)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your projects today.</p>
        </div>
        {isContractor && (
          <Link to="/reports/new" className="btn btn-primary inline-flex items-center">
            <ClipboardList className="w-5 h-5 mr-2" />
            New Daily Report
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={stats?.projects?.total || 0}
          subtitle={`${stats?.projects?.active || 0} active`}
          icon={FolderKanban}
          color="blue"
          link="/projects"
        />
        <StatCard
          title="Total Budget"
          value={formatCurrency(stats?.budget?.total || 0)}
          subtitle={`${stats?.budget?.percentUsed || 0}% utilized`}
          icon={IndianRupee}
          color="green"
        />
        <StatCard
          title="Pending Milestones"
          value={stats?.milestones?.pending || 0}
          subtitle={`${stats?.milestones?.awaitingApproval || 0} awaiting approval`}
          icon={CheckSquare}
          color="yellow"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats?.inventory?.lowStockAlerts || 0}
          subtitle="Items need attention"
          icon={AlertTriangle}
          color="red"
          link="/inventory"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Chart */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h2>
          {budgetData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} />
                  <YAxis tickFormatter={(value) => formatCurrency(value, { compact: true })} tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="estimated" name="Estimated" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No budget data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {stats?.recentActivity?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity._id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.project?.name}</p>
                    <p className="text-xs text-gray-500">
                      Report by {activity.submittedBy?.name} - {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>No recent activity</p>
            </div>
          )}
          {stats?.recentActivity?.length > 0 && (
            <Link
              to="/reports"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mt-4 font-medium"
            >
              View all reports <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>
      </div>

      {/* Role-specific sections */}
      {isContractor && stats?.roleStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card bg-blue-50 border-blue-100">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">My Reports</p>
                <p className="text-2xl font-bold text-blue-900">{stats.roleStats.myReports || 0}</p>
              </div>
            </div>
          </div>
          <div className="card bg-yellow-50 border-yellow-100">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pending Milestones</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.roleStats.pendingMilestones || 0}</p>
              </div>
            </div>
          </div>
          <div className="card bg-red-50 border-red-100">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-red-600 font-medium">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-red-900">{stats.roleStats.lowStockAlerts || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isArchitect && stats?.roleStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card bg-purple-50 border-purple-100">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Awaiting Your Approval</p>
                <p className="text-2xl font-bold text-purple-900">{stats.roleStats.awaitingApproval || 0}</p>
              </div>
            </div>
            <Link to="/projects" className="inline-flex items-center text-sm text-purple-600 mt-3 font-medium">
              Review now <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="card bg-green-50 border-green-100">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Approved This Month</p>
                <p className="text-2xl font-bold text-green-900">{stats.roleStats.approvedThisMonth || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/projects/new"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
          >
            <FolderKanban className="w-8 h-8 mx-auto text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">New Project</span>
          </Link>
          {isContractor && (
            <>
              <Link
                to="/reports/new"
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                <ClipboardList className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Daily Report</span>
              </Link>
              <Link
                to="/inventory"
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                <AlertTriangle className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Check Inventory</span>
              </Link>
            </>
          )}
          <Link to="/photos" className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
            <Camera className="w-8 h-8 mx-auto text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Photo Gallery</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
