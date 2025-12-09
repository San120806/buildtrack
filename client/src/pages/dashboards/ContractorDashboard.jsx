"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  ClipboardDocumentListIcon,
  CameraIcon,
  CubeIcon,
  PlusIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FlagIcon,
} from "@heroicons/react/24/outline"
import api from "../../services/api"
import LoadingSpinner from "../../components/ui/LoadingSpinner"

export default function ContractorDashboard() {
  const [stats, setStats] = useState(null)
  const [todayReport, setTodayReport] = useState(null)
  const [recentReports, setRecentReports] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, reportsRes, inventoryRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/reports?limit=5"),
        api.get("/inventory?lowStock=true"),
      ])

      setStats(statsRes.data.data)
      setRecentReports(reportsRes.data.data)
      setLowStockItems(inventoryRes.data.data)

      // Check if today's report exists
      const today = new Date().toISOString().split("T")[0]
      const todayRep = reportsRes.data.data.find((r) => new Date(r.date).toISOString().split("T")[0] === today)
      setTodayReport(todayRep)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contractor Dashboard</h1>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Today's Report Status */}
      <div
        className={`p-4 rounded-lg border-2 ${
          todayReport ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {todayReport ? (
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            ) : (
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
            )}
            <div>
              <h3 className={`font-semibold ${todayReport ? "text-green-800" : "text-yellow-800"}`}>
                {todayReport ? "Today's Report Submitted" : "Today's Report Pending"}
              </h3>
              <p className={`text-sm ${todayReport ? "text-green-600" : "text-yellow-600"}`}>
                {todayReport
                  ? `Submitted at ${new Date(todayReport.createdAt).toLocaleTimeString()}`
                  : "Don't forget to submit your daily site report"}
              </p>
            </div>
          </div>
          {!todayReport && (
            <Link
              to="/reports/new"
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Submit Report
            </Link>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          to="/reports/new"
          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all"
        >
          <div className="p-3 bg-blue-100 rounded-lg">
            <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">New Daily Report</h3>
            <p className="text-sm text-gray-500">Log site activities</p>
          </div>
        </Link>

        <Link
          to="/milestones"
          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all"
        >
          <div className="p-3 bg-green-100 rounded-lg">
            <FlagIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Manage Milestones</h3>
            <p className="text-sm text-gray-500">Track project milestones</p>
          </div>
        </Link>

        <Link
          to="/photos"
          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all"
        >
          <div className="p-3 bg-purple-100 rounded-lg">
            <CameraIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Upload Photos</h3>
            <p className="text-sm text-gray-500">Document site progress</p>
          </div>
        </Link>

        <Link
          to="/inventory"
          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all"
        >
          <div className="p-3 bg-orange-100 rounded-lg">
            <CubeIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Update Inventory</h3>
            <p className="text-sm text-gray-500">Track materials usage</p>
          </div>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Active Projects</p>
          <p className="text-2xl font-bold text-gray-900">{stats?.activeProjects || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Reports This Week</p>
          <p className="text-2xl font-bold text-gray-900">{stats?.reportsThisWeek || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Pending Milestones</p>
          <p className="text-2xl font-bold text-gray-900">{stats?.pendingMilestones || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Low Stock Items</p>
          <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Reports</h2>
            <Link to="/reports" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentReports.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No reports yet</p>
            ) : (
              recentReports.map((report) => (
                <div key={report._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{report.project?.name || "Unknown Project"}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{report.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4" />
                      {new Date(report.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Low Stock Alerts</h2>
            <Link to="/inventory" className="text-sm text-primary hover:underline">
              Manage Inventory
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {lowStockItems.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No low stock items</p>
            ) : (
              lowStockItems.slice(0, 5).map((item) => (
                <div key={item._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-600 font-semibold">
                        {item.quantity} {item.unit}
                      </p>
                      <p className="text-xs text-gray-500">Min: {item.minimumStock}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
