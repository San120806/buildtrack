"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"
import Badge from "../../components/ui/Badge"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import EmptyState from "../../components/ui/EmptyState"
import Modal from "../../components/ui/Modal"
import { CheckSquare, CheckCircle, Clock, XCircle, FlagIcon, Plus, Check, X, Loader2 } from "lucide-react"

const MilestonesList = () => {
  const { isContractor, isArchitect, isClient } = useAuth()

  const [milestones, setMilestones] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, completed, pending, awaiting-approval
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState(null)
  const [approvalComments, setApprovalComments] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const projectsRes = await api.get("/projects")
      const projectsData = projectsRes.data.data
      setProjects(projectsData)

      // Fetch milestones for all projects
      if (projectsData.length > 0) {
        const milestonesPromises = projectsData.map((project) =>
          api.get(`/milestones/project/${project._id}`).catch(() => ({ data: { data: [] } }))
        )
        const milestonesResults = await Promise.all(milestonesPromises)
        const allMilestones = milestonesResults.flatMap((res, index) => 
          (res.data.data || []).map(m => ({
            ...m,
            projectName: projectsData[index].name,
            projectId: projectsData[index]._id
          }))
        )
        setMilestones(allMilestones)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenApproval = (milestone) => {
    setSelectedMilestone(milestone)
    setApprovalComments("")
    setShowApprovalModal(true)
  }

  const handleApprove = async (status) => {
    if (!selectedMilestone) return

    setProcessing(true)
    try {
      await api.put(`/milestones/${selectedMilestone._id}/approve`, {
        status,
        comments: approvalComments,
      })

      // Refresh data
      await fetchData()
      setShowApprovalModal(false)
      setSelectedMilestone(null)
      setApprovalComments("")
    } catch (error) {
      console.error("Error approving milestone:", error)
      alert("Failed to approve milestone. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status) => {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "awaiting-approval":
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <CheckSquare className="w-5 h-5 text-gray-400" />
    }
  }

  const filteredMilestones = milestones.filter((m) => {
    if (filter === "all") return true
    if (filter === "completed") return m.status === "completed" || m.status === "approved"
    if (filter === "pending") return m.status === "pending" || m.status === "in-progress"
    if (filter === "awaiting-approval") return m.status === "awaiting-approval"
    return true
  })

  // Sort: pending approvals first for architects, then by date
  const sortedMilestones = [...filteredMilestones].sort((a, b) => {
    if (isArchitect) {
      if (a.status === "awaiting-approval" && b.status !== "awaiting-approval") return -1
      if (a.status !== "awaiting-approval" && b.status === "awaiting-approval") return 1
    }
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  // Auto-set filter to awaiting-approval for architects if they have pending approvals
  useEffect(() => {
    if (isArchitect && milestones.length > 0) {
      const pendingCount = milestones.filter((m) => m.status === "awaiting-approval").length
      if (pendingCount > 0 && filter === "all") {
        setFilter("awaiting-approval")
      }
    }
  }, [milestones, isArchitect])

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isArchitect ? "Milestone Approvals" : "Project Milestones"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isClient
              ? "Track completed milestones across all your projects"
              : isArchitect
                ? "Review and approve project milestones"
                : "View all project milestones"}
          </p>
        </div>
      </div>

      {/* Contractor Helper - How to Create Milestones */}
      {isContractor && milestones.length === 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Create Your First Milestone</h3>
              <p className="text-sm text-blue-700 mb-3">
                Milestones help track major project achievements. To create a milestone:
              </p>
              <ol className="text-sm text-blue-700 space-y-2 mb-4 list-decimal list-inside">
                <li>Go to <Link to="/app/projects" className="font-semibold underline">Projects</Link> page</li>
                <li>Click on a project to view its details</li>
                <li>Click on the "Milestones" tab</li>
                <li>Click the "+ Add Milestone" button</li>
                <li>Fill in milestone details and save</li>
              </ol>
              <div className="flex gap-3">
                <Link to="/app/projects" className="btn btn-primary btn-sm">
                  Go to Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{milestones.length}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {milestones.filter((m) => m.status === "completed" || m.status === "approved").length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
          </div>
        </div>
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {milestones.filter((m) => m.status === "awaiting-approval").length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600 opacity-50" />
          </div>
        </div>
        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {milestones.filter((m) => m.status === "in-progress").length}
              </p>
            </div>
            <FlagIcon className="w-8 h-8 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Milestones
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "completed"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "pending"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            In Progress
          </button>
          {(isArchitect || isContractor) && (
            <button
              onClick={() => setFilter("awaiting-approval")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "awaiting-approval"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Awaiting Approval
            </button>
          )}
        </div>
      </div>

      {/* Quick Create Section for Contractors */}
      {isContractor && projects.length > 0 && (
        <div className="card bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Create Milestones for Your Projects</h3>
              <p className="text-sm text-gray-600">
                Select a project below to create and manage its milestones
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.slice(0, 6).map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}/milestones`}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{project.name}</p>
                  <p className="text-xs text-gray-500">
                    {milestones.filter((m) => m.projectId === project._id).length} milestone(s)
                  </p>
                </div>
                <Plus className="w-5 h-5 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
          {projects.length > 6 && (
            <Link to="/app/projects" className="text-sm text-primary-600 hover:underline mt-3 inline-block">
              View all {projects.length} projects →
            </Link>
          )}
        </div>
      )}

      {/* Milestones List */}
      {sortedMilestones.length > 0 ? (
        <div className="space-y-4">
          {sortedMilestones.map((milestone) => (
            <div key={milestone._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="mt-1">{getStatusIcon(milestone.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                        <Badge variant={getStatusBadge(milestone.status)}>
                          {milestone.status?.replace("-", " ")}
                        </Badge>
                      </div>
                      <Link
                        to={`/app/projects/${milestone.projectId}`}
                        className="text-sm text-primary-600 hover:underline mt-1 inline-block"
                      >
                        {milestone.projectName}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      {isArchitect && milestone.status === "awaiting-approval" && (
                        <button
                          onClick={() => handleOpenApproval(milestone)}
                          className="btn btn-sm btn-primary flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Review
                        </button>
                      )}
                      <Link
                        to={`/app/projects/${milestone.projectId}/milestones`}
                        className="btn btn-sm btn-secondary"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>

                  {milestone.description && (
                    <p className="text-gray-600 mt-2 line-clamp-2">{milestone.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                    <span>Start: {new Date(milestone.startDate).toLocaleDateString()}</span>
                    <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                    <span>Progress: {milestone.progress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full transition-all"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Approval Info */}
                  {(milestone.status === "completed" || milestone.status === "approved") &&
                    milestone.approval?.approvedBy && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm text-green-900">
                              <span className="font-medium">Approved</span> by {milestone.approval.approvedBy.name}
                              {milestone.approval.approvedAt && (
                                <span className="text-green-700">
                                  {" "}
                                  on {new Date(milestone.approval.approvedAt).toLocaleDateString()}
                                </span>
                              )}
                            </p>
                            {milestone.approval.comments && (
                              <p className="text-sm text-green-800 mt-1">{milestone.approval.comments}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  {milestone.status === "rejected" && milestone.approval?.comments && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-red-900">
                            <span className="font-medium">Rejected</span> by {milestone.approval?.approvedBy?.name}
                          </p>
                          <p className="text-sm text-red-800 mt-1">{milestone.approval.comments}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={CheckSquare}
            title={filter === "all" ? "No milestones yet" : `No ${filter} milestones`}
            description={
              filter === "all"
                ? "Milestones will appear here once they are created for your projects"
                : `There are no ${filter} milestones at the moment`
            }
          />
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedMilestone && (
        <Modal onClose={() => setShowApprovalModal(false)} title="Review Milestone">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedMilestone.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedMilestone.projectName}</p>
            </div>

            {selectedMilestone.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                  {selectedMilestone.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <label className="block text-gray-500 mb-1">Start Date</label>
                <p className="font-medium">{new Date(selectedMilestone.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Due Date</label>
                <p className="font-medium">{new Date(selectedMilestone.dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Progress</label>
                <p className="font-medium">{selectedMilestone.progress}%</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Comments (Optional)
              </label>
              <textarea
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder="Add any comments about this milestone..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => handleApprove("approved")}
                disabled={processing}
                className="flex-1 btn btn-primary flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Approve
                  </>
                )}
              </button>
              <button
                onClick={() => handleApprove("rejected")}
                disabled={processing}
                className="flex-1 btn btn-secondary bg-red-50 text-red-700 hover:bg-red-100 border-red-200 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Reject
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default MilestonesList
