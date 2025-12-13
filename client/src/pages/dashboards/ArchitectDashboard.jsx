"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  ClipboardDocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  ChartBarIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline"
import api from "../../services/api"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import Badge from "../../components/ui/Badge"
import Modal from "../../components/ui/Modal"

export default function ArchitectDashboard() {
  const [stats, setStats] = useState(null)
  const [pendingMilestones, setPendingMilestones] = useState([])
  const [recentApprovals, setRecentApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMilestone, setSelectedMilestone] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsRes = await api.get("/dashboard/stats")
      setStats(statsRes.data?.data || {})

      // Fetch pending milestones
      const pendingRes = await api.get("/milestones/status/pending-approval")
      setPendingMilestones(pendingRes.data?.data || [])

      // Fetch recent approvals from all projects
      const projectsRes = await api.get("/projects")
      const projects = projectsRes.data?.data || []

      if (projects.length > 0) {
        const milestonesPromises = projects.map((project) =>
          api
            .get(`/milestones/project/${project._id}`)
            .catch(() => ({ data: { data: [] } }))
        )

        const milestonesResults = await Promise.all(milestonesPromises)

        const allMilestones = milestonesResults
          .flatMap((res) => res.data?.data || [])
          .filter(
            (m) => m.status === "completed" || m.status === "approved"
          )
          .sort(
            (a, b) =>
              new Date(b.approval?.approvedAt || b.updatedAt) -
              new Date(a.approval?.approvedAt || a.updatedAt)
          )
          .slice(0, 5)

        setRecentApprovals(allMilestones)
      } else {
        setRecentApprovals([])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (milestone) => {
    setSelectedMilestone(milestone)
    setReviewNotes("")
    setShowReviewModal(true)
  }

  const submitReview = async (status) => {
    if (!selectedMilestone) return

    setProcessing(true)
    try {
      await api.put(`/milestones/${selectedMilestone._id}/approve`, {
        status,
        comments: reviewNotes,
      })

      // Refresh data
      await fetchDashboardData()
      setShowReviewModal(false)
      setSelectedMilestone(null)
      setReviewNotes("")
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Failed to submit review. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Architect Dashboard</h1>
        <span className="text-sm text-gray-500">
          {pendingMilestones.length} pending approvals
        </span>
      </div>

      {/* Pending Approvals Alert */}
      {pendingMilestones.length > 0 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
          <div className="flex items-center gap-3">
            <ClockIcon className="h-8 w-8 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-800">
                {pendingMilestones.length} Milestone
                {pendingMilestones.length > 1 ? "s" : ""} Awaiting Review
              </h3>
              <p className="text-sm text-amber-600">
                Review and approve milestone completions to keep projects on track
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Active Projects</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.activeProjects || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Pending Reviews</p>
          <p className="text-2xl font-bold text-amber-600">
            {pendingMilestones.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Approved This Month</p>
          <p className="text-2xl font-bold text-green-600">
            {stats?.approvedThisMonth || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Milestones</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.totalMilestones || 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/app/milestones/architect"
          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all"
        >
          <div className="p-3 bg-amber-100 rounded-lg">
            <ClipboardDocumentCheckIcon className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Review Milestones</h3>
            <p className="text-sm text-gray-500">Approve completions</p>
          </div>
        </Link>

        <Link
          to="/app/projects"
          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all"
        >
          <div className="p-3 bg-blue-100 rounded-lg">
            <DocumentMagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">View Projects</h3>
            <p className="text-sm text-gray-500">Monitor progress</p>
          </div>
        </Link>

        <Link
          to="/app/reports"
          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all"
        >
          <div className="p-3 bg-green-100 rounded-lg">
            <ChartBarIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Daily Reports</h3>
            <p className="text-sm text-gray-500">Review site updates</p>
          </div>
        </Link>
      </div>

      {/* Pending Milestones for Review */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Pending Milestone Reviews</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {pendingMilestones.length === 0 ? (
            <p className="p-8 text-gray-500 text-center">
              No milestones pending review. Great job staying on top of approvals!
            </p>
          ) : (
            pendingMilestones.map((milestone) => (
              <div key={milestone._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">
                        {milestone.title}
                      </h3>
                      <Badge variant="warning">Awaiting Approval</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {milestone.project?.name || "Unknown Project"}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {milestone.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>
                        Due:{" "}
                        {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                      <span>Progress: {milestone.progress}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleReview(milestone)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Approvals */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Approvals</h2>
          <Link
            to="/app/milestones?status=approved"
            className="text-sm text-primary hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentApprovals.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">No recent approvals</p>
          ) : (
            recentApprovals.map((milestone) => (
              <div key={milestone._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {milestone.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {milestone.project?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-500">
                      {new Date(
                        milestone.approval?.approvedAt || milestone.updatedAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Review Milestone"
      >
        {selectedMilestone && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">
                {selectedMilestone.title}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedMilestone.project?.name}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                {selectedMilestone.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Due Date:</span>
                <p className="font-medium">
                  {new Date(
                    selectedMilestone.dueDate
                  ).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Progress:</span>
                <p className="font-medium">
                  {selectedMilestone.progress}%
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Notes
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Add notes about your decision..."
              />
            </div>

            {/* Buttons in one row */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => submitReview("approved")}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <CheckIcon className="h-5 w-5" />
                {processing ? "Processing..." : "Approve"}
              </button>

              <button
                onClick={() => submitReview("rejected")}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
                {processing ? "Processing..." : "Reject"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
