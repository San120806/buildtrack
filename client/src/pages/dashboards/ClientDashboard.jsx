"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  CheckCircleIcon,
  ClockIcon,
  FlagIcon,
} from "@heroicons/react/24/outline"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import api from "../../services/api"
import { formatCurrency } from "../../utils/currency"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import Badge from "../../components/ui/Badge"

const COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#8B5CF6"]

export default function ClientDashboard() {
  const [stats, setStats] = useState(null)
  const [projects, setProjects] = useState([])
  const [recentPhotos, setRecentPhotos] = useState([])
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, projectsRes, photosRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/projects"),
        api.get("/photos?limit=6"),
      ])

      setStats(statsRes.data.data)
      setProjects(projectsRes.data.data)
      setRecentPhotos(photosRes.data.data)

      // Fetch milestones for all projects
      if (projectsRes.data.data.length > 0) {
        const milestonesPromises = projectsRes.data.data.map((project) =>
          api.get(`/milestones/project/${project._id}`).catch(() => ({ data: { data: [] } }))
        )
        const milestonesResults = await Promise.all(milestonesPromises)
        const allMilestones = milestonesResults.flatMap((res) => res.data.data || [])
        setMilestones(allMilestones)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  // Calculate overall progress across all projects
  const avgProgress =
    projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0

  // Budget data for chart
  const budgetData = projects.map((p) => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + "..." : p.name,
    budget: p.budget?.total || 0,
    spent: p.budget?.spent || 0,
  }))

  // Status distribution for pie chart
  const statusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Projects Overview</h1>
        <span className="text-sm text-gray-500">Welcome to your client portal</span>
      </div>

      {/* Overall Progress Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-6 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold opacity-90">Overall Progress</h2>
            <p className="text-4xl font-bold mt-1">{avgProgress}%</p>
            <p className="text-sm opacity-80 mt-1">
              Across {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 relative">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-white/20"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-white"
                  strokeWidth="10"
                  strokeDasharray={`${avgProgress * 2.51} 251`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Projects</p>
              <p className="text-xl font-bold text-gray-900">{projects.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-bold text-gray-900">
                {projects.filter((p) => p.status === "completed").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <ClockIcon className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-xl font-bold text-gray-900">
                {projects.filter((p) => p.status === "in-progress").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(projects.reduce((sum, p) => sum + (p.budget?.total || 0), 0), { compact: true })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Chart */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Budget vs Spent</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="budget" name="Budget" fill="#3B82F6" />
              <Bar dataKey="spent" name="Spent" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Project Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">No project data available</div>
          )}
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">My Projects</h2>
          <Link to="/app/projects" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {projects.length === 0 ? (
            <p className="p-8 text-gray-500 text-center">No projects assigned to you yet.</p>
          ) : (
            projects.slice(0, 5).map((project) => (
              <Link
                key={project._id}
                to={`/app/projects/${project._id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <Badge
                        variant={
                          project.status === "completed"
                            ? "success"
                            : project.status === "in-progress"
                              ? "warning"
                              : project.status === "on-hold"
                                ? "error"
                                : "default"
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{project.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{project.progress}%</p>
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Milestones Achieved */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlagIcon className="h-5 w-5 text-green-600" />
            <h2 className="font-semibold text-gray-900">Milestones Achieved</h2>
          </div>
          <Link to="/app/milestones" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        {milestones.length === 0 ? (
          <p className="p-8 text-gray-500 text-center">No milestones achieved yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {milestones
              .filter((m) => m.status === "completed" || m.status === "approved")
              .slice(0, 5)
              .map((milestone) => (
                <div key={milestone._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                          <Badge variant="success" className="mt-1">
                            Completed
                          </Badge>
                        </div>
                        <div className="text-right text-sm text-gray-500 whitespace-nowrap">
                          {milestone.completedDate && (
                            <span>{new Date(milestone.completedDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{milestone.description}</p>
                      )}
                      {milestone.approval?.approvedBy && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span>Approved by {milestone.approval.approvedBy.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            {milestones.filter((m) => m.status === "completed" || m.status === "approved").length === 0 && (
              <p className="p-8 text-gray-500 text-center">No milestones completed yet. Stay tuned for updates!</p>
            )}
          </div>
        )}
      </div>

      {/* Recent Photos */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Site Photos</h2>
          <Link to="/app/photos" className="text-sm text-primary hover:underline">
            View Gallery
          </Link>
        </div>
        {recentPhotos.length === 0 ? (
          <p className="p-8 text-gray-500 text-center">No site photos uploaded yet.</p>
        ) : (
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentPhotos.map((photo) => (
              <div key={photo._id} className="relative group">
                <img
                  src={`https://picsum.photos/150/120?random=${photo._id}&query=construction`}
                  alt={photo.caption || "Site photo"}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <PhotoIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

