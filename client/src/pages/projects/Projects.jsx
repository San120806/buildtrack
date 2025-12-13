"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"
import { formatCurrency } from "../../utils/currency"
import Badge from "../../components/ui/Badge"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import {
  Plus,
  Search,
  Filter,
  FolderKanban,
  MapPin,
  Calendar,
  Users,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"

const Projects = () => {
  const { isContractor, isArchitect } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [openMenu, setOpenMenu] = useState(null)

  useEffect(() => {
    fetchProjects()
  }, [search, statusFilter])

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (statusFilter) params.append("status", statusFilter)

      const response = await api.get(`/projects?${params.toString()}`)
      setProjects(response.data?.data || [])
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return

    try {
      await api.delete(`/projects/${id}`)
      setProjects(projects.filter((p) => p._id !== id))
    } catch (error) {
      console.error("Failed to delete project:", error)
    }
    setOpenMenu(null)
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

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage and track your construction projects</p>
        </div>
        {(isContractor || isArchitect) && (
          <Link to="/app/projects/new" className="btn btn-primary inline-flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input pl-10 pr-8 min-w-[180px]"
            >
              <option value="">All Statuses</option>
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="card hover:shadow-md transition-shadow border border-gray-100 hover:border-gray-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <Link to={`/projects/${project._id}`} className="block">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 truncate">
                      {project.name}
                    </h3>
                  </Link>
                  <Badge variant={getStatusBadge(project.status)} className="mt-2">
                    {project.status?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === project._id ? null : project._id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {openMenu === project._id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        <Link
                          to={`/app/projects/${project._id}`}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Link>
                        {(isContractor || isArchitect) && (
                          <>
                            <Link
                              to={`/app/projects/${project._id}/edit`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(project._id)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {project.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>}

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-gray-900">{project.progress || 0}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full transition-all"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm">
                {project.location?.city && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {project.location.city}
                      {project.location.state && `, ${project.location.state}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(project.startDate).toLocaleDateString()} -{" "}
                    {new Date(project.endDate).toLocaleDateString()}
                  </span>
                </div>
                {project.contractor && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{project.contractor.name}</span>
                  </div>
                )}
              </div>

              {/* Budget */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Budget</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(project.budget?.estimated)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={FolderKanban}
            title="No projects found"
            description={
              search || statusFilter ? "Try adjusting your filters" : "Create your first project to get started"
            }
            action={
              (isContractor || isArchitect) && !search && !statusFilter ? (
                <Link to="/app/projects/new" className="btn btn-primary inline-flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  New Project
                </Link>
              ) : null
            }
          />
        </div>
      )}
    </div>
  )
}

export default Projects
