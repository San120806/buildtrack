"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../services/api"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import { ArrowLeft, Save, Loader2, AlertCircle, Plus, X } from "lucide-react"

const ProjectForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning",
    priority: "medium",
    startDate: "",
    endDate: "",
    client: "",
    contractor: "",
    architect: "",
    location: {
      address: "",
      city: "",
      state: "",
      pinCode: "",
    },
    budget: {
      estimated: 0,
      actual: 0,
      breakdown: [],
    },
    tags: [],
  })

  const [users, setUsers] = useState({ clients: [], contractors: [], architects: [] })
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEditing)
  const [error, setError] = useState("")
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    fetchUsers()
    if (isEditing) {
      fetchProject()
    }
  }, [id])

  const fetchUsers = async () => {
    try {
      const [clientsRes, contractorsRes, architectsRes] = await Promise.all([
        api.get("/users/role/client"),
        api.get("/users/role/contractor"),
        api.get("/users/role/architect"),
      ])
      setUsers({
        clients: clientsRes.data.data,
        contractors: contractorsRes.data.data,
        architects: architectsRes.data.data,
      })
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`)
      const project = response.data.data
      setFormData({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "planning",
        priority: project.priority || "medium",
        startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
        endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
        client: project.client?._id || "",
        contractor: project.contractor?._id || "",
        architect: project.architect?._id || "",
        location: project.location || { address: "", city: "", state: "", pinCode: "" },
        budget: project.budget || { estimated: 0, actual: 0, breakdown: [] },
        tags: project.tags || [],
      })
    } catch (error) {
      console.error("Failed to fetch project:", error)
      navigate("/projects")
    } finally {
      setFetchLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [locationField]: value },
      }))
    } else if (name.startsWith("budget.")) {
      const budgetField = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        budget: { ...prev.budget, [budgetField]: Number(value) },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    setError("")
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isEditing) {
        await api.put(`/projects/${id}`, formData)
      } else {
        await api.post("/projects", formData)
      }
      navigate("/projects")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save project")
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/projects")} className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isEditing ? "Edit Project" : "New Project"}</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="label">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="label">
                  Status
                </label>
                <select id="status" name="status" value={formData.status} onChange={handleChange} className="input">
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="label">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="label">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="endDate" className="label">
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Assignment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="client" className="label">
                Client *
              </label>
              <select
                id="client"
                name="client"
                value={formData.client}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select Client</option>
                {users.clients.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="contractor" className="label">
                Contractor
              </label>
              <select
                id="contractor"
                name="contractor"
                value={formData.contractor}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Contractor</option>
                {users.contractors.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="architect" className="label">
                Architect
              </label>
              <select
                id="architect"
                name="architect"
                value={formData.architect}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Architect</option>
                {users.architects.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="location.address" className="label">
                Address
              </label>
              <input
                type="text"
                id="location.address"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label htmlFor="location.city" className="label">
                  City
                </label>
                <input
                  type="text"
                  id="location.city"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="location.state" className="label">
                  State
                </label>
                <input
                  type="text"
                  id="location.state"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="location.pinCode" className="label">
                  PIN Code
                </label>
                <input
                  type="text"
                  id="location.pinCode"
                  name="location.pinCode"
                  value={formData.location.pinCode}
                  onChange={handleChange}
                  className="input"
                  maxLength="6"
                  placeholder="e.g., 400001"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="budget.estimated" className="label">
                Estimated Budget (₹)
              </label>
              <input
                type="number"
                id="budget.estimated"
                name="budget.estimated"
                value={formData.budget.estimated}
                onChange={handleChange}
                className="input"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="budget.actual" className="label">
                Actual Spent (₹)
              </label>
              <input
                type="number"
                id="budget.actual"
                name="budget.actual"
                value={formData.budget.actual}
                onChange={handleChange}
                className="input"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
              >
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-primary-900">
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              className="input flex-1"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
            />
            <button type="button" onClick={handleAddTag} className="btn btn-secondary">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <button type="button" onClick={() => navigate("/projects")} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary flex items-center">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {isEditing ? "Update Project" : "Create Project"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProjectForm
