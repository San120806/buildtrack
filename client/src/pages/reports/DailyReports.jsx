"use client"

import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"
import Badge from "../../components/ui/Badge"
import EmptyState from "../../components/ui/EmptyState"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import {
  Plus,
  ClipboardList,
  Calendar,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  CloudLightning,
  Users,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

const DailyReports = () => {
  const { projectId } = useParams()
  const { isContractor } = useAuth()

  const [reports, setReports] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState(projectId || "")
  const [expandedReport, setExpandedReport] = useState(null)
  const [dateRange, setDateRange] = useState({ start: "", end: "" })

  useEffect(() => {
    if (!projectId) {
      fetchProjects()
    }
    if (selectedProject) {
      fetchReports()
    } else {
      setLoading(false)
    }
  }, [selectedProject, dateRange])

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects")
      setProjects(response.data?.data || [])
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    }
  }

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateRange.start) params.append("startDate", dateRange.start)
      if (dateRange.end) params.append("endDate", dateRange.end)

      const response = await api.get(`/reports/project/${selectedProject}?${params.toString()}`)
      setReports(response.data?.data || [])
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (condition) => {
    const icons = {
      sunny: <Sun className="w-5 h-5 text-yellow-500" />,
      cloudy: <Cloud className="w-5 h-5 text-gray-500" />,
      rainy: <CloudRain className="w-5 h-5 text-blue-500" />,
      stormy: <CloudLightning className="w-5 h-5 text-purple-500" />,
      snowy: <CloudSnow className="w-5 h-5 text-blue-300" />,
      windy: <Wind className="w-5 h-5 text-gray-400" />,
    }
    return icons[condition] || <Sun className="w-5 h-5 text-yellow-500" />
  }

  const getSeverityBadge = (severity) => {
    const variants = {
      low: "default",
      medium: "warning",
      high: "danger",
    }
    return variants[severity] || "default"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Reports</h1>
          <p className="text-gray-600 mt-1">Track daily progress and site activities</p>
        </div>
        {isContractor && (
          <Link to="/app/reports/new" className="btn btn-primary inline-flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            New Report
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {!projectId && (
            <div>
              <label className="label">Project</label>
              <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="input">
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <LoadingSpinner size="lg" className="h-64" />
      ) : !selectedProject ? (
        <div className="card">
          <EmptyState
            icon={ClipboardList}
            title="Select a project"
            description="Choose a project to view its daily reports"
          />
        </div>
      ) : reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report._id} className="card">
              {/* Report Header */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedReport(expandedReport === report._id ? null : report._id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {new Date(report.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    <p className="text-sm text-gray-500">Submitted by {report.submittedBy?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      {getWeatherIcon(report.weather?.condition)}
                      <span className="capitalize">{report.weather?.condition}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{report.workersOnSite} workers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{report.hoursWorked}h</span>
                    </div>
                  </div>
                  {expandedReport === report._id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedReport === report._id && (
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-6">
                  {/* Weather & Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        {getWeatherIcon(report.weather?.condition)}
                        <span className="text-sm text-gray-600">Weather</span>
                      </div>
                      <p className="font-medium text-gray-900 capitalize">{report.weather?.condition}</p>
                      {report.weather?.temperature && (
                        <p className="text-sm text-gray-500">{report.weather.temperature}°F</p>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-600">Workers</span>
                      </div>
                      <p className="font-medium text-gray-900">{report.workersOnSite}</p>
                      <p className="text-sm text-gray-500">on site</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-600">Hours</span>
                      </div>
                      <p className="font-medium text-gray-900">{report.hoursWorked}</p>
                      <p className="text-sm text-gray-500">worked</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm text-gray-600">Issues</span>
                      </div>
                      <p className="font-medium text-gray-900">{report.issues?.length || 0}</p>
                      <p className="text-sm text-gray-500">reported</p>
                    </div>
                  </div>

                  {/* Work Summary */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Work Summary</h4>
                    <p className="text-gray-600">{report.workSummary}</p>
                  </div>

                  {/* Equipment Used */}
                  {report.equipment?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Equipment Used</h4>
                      <div className="flex flex-wrap gap-2">
                        {report.equipment.map((equip, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                            {equip.name} ({equip.hoursUsed}h)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Issues */}
                  {report.issues?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Issues Reported</h4>
                      <div className="space-y-2">
                        {report.issues.map((issue, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Badge variant={getSeverityBadge(issue.severity)}>{issue.severity}</Badge>
                            <div className="flex-1">
                              <p className="text-gray-700">{issue.description}</p>
                              {issue.resolved && (
                                <span className="text-sm text-green-600 mt-1 inline-block">Resolved</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {report.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                      <p className="text-gray-600">{report.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={ClipboardList}
            title="No reports found"
            description={
              dateRange.start || dateRange.end
                ? "Try adjusting your date filters"
                : "No daily reports have been submitted yet"
            }
            action={
              isContractor ? (
                <Link to="/app/reports/new" className="btn btn-primary inline-flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Report
                </Link>
              ) : null
            }
          />
        </div>
      )}
    </div>
  )
}

export default DailyReports
