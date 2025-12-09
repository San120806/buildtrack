"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"
import Badge from "../../components/ui/Badge"
import Modal from "../../components/ui/Modal"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import EmptyState from "../../components/ui/EmptyState"
import { ArrowLeft, Plus, CheckSquare, Clock, CheckCircle, XCircle, Edit, Trash2, Send, Loader2 } from "lucide-react"

const Milestones = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { isContractor, isArchitect } = useAuth()

  const [milestones, setMilestones] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    dueDate: "",
    status: "pending",
    progress: 0,
  })

  const [approvalData, setApprovalData] = useState({
    status: "approved",
    comments: "",
  })

  useEffect(() => {
    fetchData()
  }, [projectId])

  const fetchData = async () => {
    try {
      const [projectRes, milestonesRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/milestones/project/${projectId}`),
      ])
      setProject(projectRes.data.data)
      setMilestones(milestonesRes.data.data)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      navigate("/projects")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (milestone = null) => {
    if (milestone) {
      setFormData({
        title: milestone.title,
        description: milestone.description || "",
        startDate: new Date(milestone.startDate).toISOString().split("T")[0],
        dueDate: new Date(milestone.dueDate).toISOString().split("T")[0],
        status: milestone.status,
        progress: milestone.progress,
      })
      setSelectedMilestone(milestone)
    } else {
      setFormData({
        title: "",
        description: "",
        startDate: "",
        dueDate: "",
        status: "pending",
        progress: 0,
      })
      setSelectedMilestone(null)
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const data = { ...formData, project: projectId }

      if (selectedMilestone) {
        await api.put(`/milestones/${selectedMilestone._id}`, data)
      } else {
        await api.post("/milestones", data)
      }

      fetchData()
      setShowModal(false)
    } catch (error) {
      console.error("Failed to save milestone:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this milestone?")) return

    try {
      await api.delete(`/milestones/${id}`)
      setMilestones(milestones.filter((m) => m._id !== id))
    } catch (error) {
      console.error("Failed to delete milestone:", error)
    }
  }

  const handleSubmitForApproval = async (id) => {
    try {
      await api.put(`/milestones/${id}/submit`)
      fetchData()
    } catch (error) {
      console.error("Failed to submit for approval:", error)
    }
  }

  const handleOpenApproval = (milestone) => {
    setSelectedMilestone(milestone)
    setApprovalData({ status: "approved", comments: "" })
    setShowApprovalModal(true)
  }

  const handleApproval = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.put(`/milestones/${selectedMilestone._id}/approve`, approvalData)
      fetchData()
      setShowApprovalModal(false)
    } catch (error) {
      console.error("Failed to approve milestone:", error)
    } finally {
      setSaving(false)
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

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Project
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Milestones</h1>
          <p className="text-gray-600 mt-1">{project?.name}</p>
        </div>
        {(isContractor || isArchitect) && (
          <button onClick={() => handleOpenModal()} className="btn btn-primary inline-flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add Milestone
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
            <Loader2 className="w-8 h-8 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Milestones List */}
      {milestones.length > 0 ? (
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div key={milestone._id} className="card">
              <div className="flex items-start gap-4">
                <div className="mt-1">{getStatusIcon(milestone.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                      <Badge variant={getStatusBadge(milestone.status)} className="mt-1">
                        {milestone.status?.replace("-", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {isContractor && milestone.status === "in-progress" && milestone.progress === 100 && (
                        <button
                          onClick={() => handleSubmitForApproval(milestone._id)}
                          className="btn btn-sm btn-secondary inline-flex items-center"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Submit for Approval
                        </button>
                      )}
                      {(isContractor || isArchitect) && milestone.status === "in-progress" && milestone.progress < 100 && (
                        <span className="text-sm text-gray-500 italic">Complete 100% to submit</span>
                      )}
                      {isArchitect && milestone.status === "awaiting-approval" && (
                        <button
                          onClick={() => handleOpenApproval(milestone)}
                          className="btn btn-sm btn-primary inline-flex items-center"
                        >
                          <CheckSquare className="w-4 h-4 mr-1" />
                          Review
                        </button>
                      )}
                      {(isContractor || isArchitect) && milestone.status !== "completed" && milestone.status !== "approved" && (
                        <>
                          <button
                            onClick={() => handleOpenModal(milestone)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="Edit milestone"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(milestone._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete milestone"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {milestone.description && <p className="text-gray-600 mt-2">{milestone.description}</p>}

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
                  {milestone.approval?.status !== "pending" && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium">
                          {milestone.approval?.status === "approved" ? "Approved" : "Rejected"}
                        </span>{" "}
                        by {milestone.approval?.approvedBy?.name}
                        {milestone.approval?.approvedAt && (
                          <span className="text-gray-500">
                            {" "}
                            on {new Date(milestone.approval.approvedAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                      {milestone.approval?.comments && (
                        <p className="text-sm text-gray-600 mt-1">{milestone.approval.comments}</p>
                      )}
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
            title="No milestones yet"
            description="Create milestones to track project progress"
            action={
              (isContractor || isArchitect) ? (
                <button onClick={() => handleOpenModal()} className="btn btn-primary inline-flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Milestone
                </button>
              ) : null
            }
          />
        </div>
      )}

      {/* Milestone Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedMilestone ? "Edit Milestone" : "New Milestone"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="label">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="label">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label htmlFor="dueDate" className="label">
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="label">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>
            <div>
              <label htmlFor="progress" className="label">
                Progress (%)
              </label>
              <input
                type="number"
                id="progress"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                className="input"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary flex items-center">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Milestone"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Approval Modal */}
      <Modal isOpen={showApprovalModal} onClose={() => setShowApprovalModal(false)} title="Review Milestone" size="md">
        <form onSubmit={handleApproval} className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{selectedMilestone?.title}</h4>
            {selectedMilestone?.description && (
              <p className="text-sm text-gray-600 mt-1">{selectedMilestone.description}</p>
            )}
          </div>

          <div>
            <label className="label">Decision</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="approved"
                  checked={approvalData.status === "approved"}
                  onChange={(e) => setApprovalData({ ...approvalData, status: e.target.value })}
                  className="text-primary-600"
                />
                <span className="text-green-600 font-medium">Approve</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="rejected"
                  checked={approvalData.status === "rejected"}
                  onChange={(e) => setApprovalData({ ...approvalData, status: e.target.value })}
                  className="text-primary-600"
                />
                <span className="text-red-600 font-medium">Reject</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="comments" className="label">
              Comments
            </label>
            <textarea
              id="comments"
              value={approvalData.comments}
              onChange={(e) => setApprovalData({ ...approvalData, comments: e.target.value })}
              className="input"
              rows={3}
              placeholder="Add any comments or feedback..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowApprovalModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary flex items-center">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Milestones
