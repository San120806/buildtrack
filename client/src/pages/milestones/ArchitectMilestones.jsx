"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"
import Badge from "../../components/ui/Badge"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import EmptyState from "../../components/ui/EmptyState"
import Modal from "../../components/ui/Modal"
import { CheckSquare, CheckCircle, Clock, XCircle, AlertCircle, Check, X, Loader2, Calendar, TrendingUp } from "lucide-react"

const ArchitectMilestones = () => {
  const { isArchitect } = useAuth()

  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending") // pending, ongoing, completed
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchMilestones()
  }, [])

  const fetchMilestones = async () => {
    try {
      setLoading(true)
      const projectsRes = await api.get("/projects")
      const projectsData = projectsRes.data.data

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
      console.error("Failed to fetch milestones:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenReview = (milestone) => {
    setSelectedMilestone(milestone)
    setReviewNotes("")
    setShowReviewModal(true)
  }

  const handleReview = async (decision) => {
    if (!selectedMilestone) return

    try {
      setProcessing(true)
      await api.put(`/milestones/${selectedMilestone._id}/approve`, {
        status: decision,
        comments: reviewNotes,
      })

      // Update local state
      setMilestones((prev) =>
        prev.map((m) =>
          m._id === selectedMilestone._id
            ? { ...m, status: decision === "approved" ? "completed" : "rejected", approval: { comments: reviewNotes } }
            : m
        )
      )

      setShowReviewModal(false)
      setSelectedMilestone(null)
      setReviewNotes("")

      // Refresh data to get updated approval details
      await fetchMilestones()
    } catch (error) {
      console.error("Failed to review milestone:", error)
      alert("Failed to submit review. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  // Filter milestones based on active tab
  const filteredMilestones = milestones.filter((m) => {
    if (activeTab === "pending") {
      return m.status === "awaiting-approval"
    } else if (activeTab === "ongoing") {
      return m.status === "approved" || m.status === "in-progress"
    } else if (activeTab === "completed") {
      return m.status === "completed"
    }
    return false
  })

  // Get counts for each tab
  const pendingCount = milestones.filter((m) => m.status === "awaiting-approval").length
  const ongoingCount = milestones.filter(
    (m) => m.status === "approved" || m.status === "in-progress"
  ).length
  const completedCount = milestones.filter((m) => m.status === "completed").length

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "approved":
        return <CheckSquare className="w-5 h-5 text-blue-600" />
      case "awaiting-approval":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case "in-progress":
        return <Clock className="w-5 h-5 text-blue-600" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return "success"
      case "approved":
        return "primary"
      case "awaiting-approval":
        return "warning"
      case "in-progress":
        return "info"
      case "rejected":
        return "danger"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Milestones Review</h1>
        <p className="text-gray-600 mt-2">Review and approve milestones submitted by contractors</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{pendingCount}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Ongoing</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{ongoingCount}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{completedCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("pending")}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              ${
                activeTab === "pending"
                  ? "border-yellow-500 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Pending Approval
            {pendingCount > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs font-semibold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("ongoing")}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              ${
                activeTab === "ongoing"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Ongoing
            {ongoingCount > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-xs font-semibold">
                {ongoingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
              ${
                activeTab === "completed"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Completed
            {completedCount > 0 && (
              <span className="ml-2 bg-green-100 text-green-800 py-0.5 px-2 rounded-full text-xs font-semibold">
                {completedCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Milestones List */}
      {filteredMilestones.length > 0 ? (
        <div className="space-y-4">
          {filteredMilestones.map((milestone) => (
            <div key={milestone._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="mt-1">{getStatusIcon(milestone.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                        <Badge variant={getStatusBadge(milestone.status)}>
                          {milestone.status?.replace("-", " ")}
                        </Badge>
                      </div>
                      <Link
                        to={`/projects/${milestone.projectId}`}
                        className="text-sm text-primary-600 hover:underline mt-1 inline-block"
                      >
                        {milestone.projectName}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeTab === "pending" && (
                        <button
                          onClick={() => handleOpenReview(milestone)}
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
                    <p className="text-gray-600 mt-3 line-clamp-2">{milestone.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Progress: {milestone.progress}%</span>
                    </div>
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
                            <span className="font-medium">Rejected</span>
                            {milestone.approval?.approvedBy?.name && ` by ${milestone.approval.approvedBy.name}`}
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
            title={
              activeTab === "pending"
                ? "No pending approvals"
                : activeTab === "ongoing"
                ? "No ongoing milestones"
                : "No completed milestones"
            }
            description={
              activeTab === "pending"
                ? "There are no milestones awaiting your approval at the moment"
                : activeTab === "ongoing"
                ? "There are no approved milestones in progress"
                : "There are no completed milestones yet"
            }
          />
        </div>
      )}

      {/* Review Modal */}
      {selectedMilestone && (
        <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Review Milestone">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedMilestone.title}</h3>
              <Link
                to={`/projects/${selectedMilestone.projectId}`}
                className="text-sm text-primary-600 hover:underline mt-1 inline-block"
              >
                {selectedMilestone.projectName}
              </Link>
            </div>

            {selectedMilestone.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {selectedMilestone.description}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <div className="flex items-center gap-2 text-sm text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {new Date(selectedMilestone.startDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <div className="flex items-center gap-2 text-sm text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {new Date(selectedMilestone.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Progress</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Completion</span>
                  <span className="font-semibold text-gray-900">{selectedMilestone.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full transition-all"
                    style={{ width: `${selectedMilestone.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Notes <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any comments or feedback about this milestone..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your notes will be visible to the contractor and client
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => handleReview("approved")}
                disabled={processing}
                className="flex-1 btn btn-primary bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Approve Milestone
                  </>
                )}
              </button>
              <button
                onClick={() => handleReview("rejected")}
                disabled={processing}
                className="flex-1 btn bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    Reject Milestone
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

export default ArchitectMilestones
