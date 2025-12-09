"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"
import Badge from "../../components/ui/Badge"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import GanttChart from "../../components/GanttChart"
import {
  ArrowLeft,
  Edit,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  ClipboardList,
  Camera,
  Package,
  TrendingUp,
  CheckSquare,
} from "lucide-react"

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isContractor, isArchitect } = useAuth()
  const [project, setProject] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchProjectData()
  }, [id])

  const fetchProjectData = async () => {
    try {
      const [projectRes, milestonesRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/milestones/project/${id}`),
      ])
      setProject(projectRes.data.data)
      setMilestones(milestonesRes.data.data)
    } catch (error) {
      console.error("Failed to fetch project:", error)
      navigate("/projects")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      planning: "info",
      "in-progress": "warning",
      "on-hold": "default",
      completed: "success",
      cancelled: "danger",
    }
    return variants[status] || "default"
  }

  const getMilestoneStatusBadge = (status) => {
    const variants = {
      pending: "default",
      "in-progress": "info",
      "awaiting-approval": "warning",
      approved: "success",
      rejected: "danger",
      completed: "success",
    }
    return variants[status] || "default"
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  if (!project) {
    return null
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Timeline" },
    { id: "milestones", label: "Milestones" },
    { id: "budget", label: "Budget" },
  ]

  const budgetVariance = (project.budget?.estimated || 0) - (project.budget?.actual || 0)
  const budgetPercentUsed = project.budget?.estimated
    ? Math.round((project.budget?.actual / project.budget?.estimated) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button onClick={() => navigate("/projects")} className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Projects
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <Badge variant={getStatusBadge(project.status)}>
              {project.status?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Badge>
          </div>
          {project.description && <p className="text-gray-600 mt-2 max-w-2xl">{project.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {(isContractor || isArchitect) && (
            <Link to={`/projects/${id}/edit`} className="btn btn-secondary inline-flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              Edit Project
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-xl font-bold text-gray-900">{project.progress || 0}%</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Budget</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(project.budget?.estimated)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CheckSquare className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Milestones</p>
              <p className="text-xl font-bold text-gray-900">{milestones.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Days Left</p>
              <p className="text-xl font-bold text-gray-900">
                {Math.max(0, Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24)))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium text-gray-900">{new Date(project.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium text-gray-900">{new Date(project.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                {project.location?.address && (
                  <div className="flex items-start gap-3 sm:col-span-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">
                        {project.location.address}
                        {project.location.city && `, ${project.location.city}`}
                        {project.location.state && `, ${project.location.state}`}
                        {project.location.zipCode && ` ${project.location.zipCode}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress</h2>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Overall Completion</span>
                  <span className="font-semibold text-gray-900">{project.progress || 0}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full transition-all"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Progress Breakdown */}
              {project.progressBreakdown && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-700">Progress Breakdown</h3>
                  
                  {/* Milestones Progress */}
                  {project.progressBreakdown.milestones?.total > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">Milestones</span>
                        <span className="text-sm text-blue-700">
                          {project.progressBreakdown.milestones.approved} / {project.progressBreakdown.milestones.total} approved
                        </span>
                      </div>
                      <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{
                            width: `${
                              (project.progressBreakdown.milestones.approved /
                                project.progressBreakdown.milestones.total) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <div className="flex gap-3 mt-2 text-xs text-blue-700">
                        <span>✓ {project.progressBreakdown.milestones.approved} Approved</span>
                        <span>⚡ {project.progressBreakdown.milestones.inProgress} In Progress</span>
                        <span>⏳ {project.progressBreakdown.milestones.pending} Pending</span>
                      </div>
                    </div>
                  )}

                  {/* Daily Reports */}
                  {project.progressBreakdown.dailyReports && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-900">Daily Reports</span>
                        <span className="text-sm text-green-700">
                          {project.progressBreakdown.dailyReports.total} total
                        </span>
                      </div>
                      <div className="flex gap-2 text-xs text-green-700">
                        <span>📋 {project.progressBreakdown.dailyReports.total} reports submitted</span>
                        <span>•</span>
                        <span>🕒 {project.progressBreakdown.dailyReports.thisWeek} this week</span>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {(!project.progressBreakdown.milestones || project.progressBreakdown.milestones.total === 0) &&
                    (!project.progressBreakdown.dailyReports || project.progressBreakdown.dailyReports.total === 0) && (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No milestones or reports yet</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Progress will be calculated based on approved milestones and daily reports
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Team & Quick Links */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Team</h2>
              <div className="space-y-4">
                {project.client && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="font-medium text-gray-900">{project.client.name}</p>
                    </div>
                  </div>
                )}
                {project.contractor && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contractor</p>
                      <p className="font-medium text-gray-900">{project.contractor.name}</p>
                    </div>
                  </div>
                )}
                {project.architect && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Architect</p>
                      <p className="font-medium text-gray-900">{project.architect.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link
                  to={`/projects/${id}/milestones`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <CheckSquare className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Milestones</span>
                </Link>
                <Link
                  to={`/projects/${id}/reports`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <ClipboardList className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Daily Reports</span>
                </Link>
                <Link to={`/projects/${id}/photos`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <Camera className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Photo Gallery</span>
                </Link>
                <Link
                  to={`/projects/${id}/inventory`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <Package className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Inventory</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h2>
          <GanttChart projectId={id} milestones={milestones} project={project} />
        </div>
      )}

      {activeTab === "milestones" && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Milestones</h2>
            {isContractor && (
              <Link to={`/projects/${id}/milestones`} className="btn btn-primary btn-sm">
                Manage Milestones
              </Link>
            )}
          </div>
          {milestones.length > 0 ? (
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div key={milestone._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        milestone.status === "completed"
                          ? "bg-green-500"
                          : milestone.status === "in-progress"
                            ? "bg-blue-500"
                            : "bg-gray-300"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{milestone.title}</p>
                      <p className="text-sm text-gray-500">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">{milestone.progress}%</p>
                    </div>
                    <Badge variant={getMilestoneStatusBadge(milestone.status)}>
                      {milestone.status?.replace("-", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No milestones created yet</p>
          )}
        </div>
      )}

      {activeTab === "budget" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Estimated Budget</span>
                <span className="font-semibold text-gray-900">{formatCurrency(project.budget?.estimated)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Actual Spent</span>
                <span className="font-semibold text-gray-900">{formatCurrency(project.budget?.actual)}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600">Variance</span>
                <span className={`font-semibold ${budgetVariance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {budgetVariance >= 0 ? "+" : ""}
                  {formatCurrency(budgetVariance)}
                </span>
              </div>
            </div>

            {/* Budget Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Budget Utilization</span>
                <span className={`font-medium ${budgetPercentUsed > 100 ? "text-red-600" : "text-gray-900"}`}>
                  {budgetPercentUsed}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${budgetPercentUsed > 100 ? "bg-red-500" : budgetPercentUsed > 80 ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min(budgetPercentUsed, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Budget Breakdown */}
          {project.budget?.breakdown?.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Breakdown</h2>
              <div className="space-y-3">
                {project.budget.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-gray-600">{item.category}</span>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(item.actual)}</p>
                      <p className="text-xs text-gray-500">of {formatCurrency(item.estimated)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectDetail
