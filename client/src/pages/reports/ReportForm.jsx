"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  CloudLightning,
} from "lucide-react"

const ReportForm = () => {
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    project: "",
    date: new Date().toISOString().split("T")[0],
    weather: {
      condition: "sunny",
      temperature: "",
      notes: "",
    },
    workSummary: "",
    workersOnSite: 0,
    hoursWorked: 0,
    equipment: [],
    issues: [],
    notes: "",
  })

  const [newEquipment, setNewEquipment] = useState({ name: "", hoursUsed: "" })
  const [newIssue, setNewIssue] = useState({ description: "", severity: "low" })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects")
      setProjects(response.data.data)
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith("weather.")) {
      const weatherField = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        weather: { ...prev.weather, [weatherField]: value },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    setError("")
  }

  const handleAddEquipment = () => {
    if (newEquipment.name && newEquipment.hoursUsed) {
      setFormData((prev) => ({
        ...prev,
        equipment: [...prev.equipment, { ...newEquipment, hoursUsed: Number(newEquipment.hoursUsed) }],
      }))
      setNewEquipment({ name: "", hoursUsed: "" })
    }
  }

  const handleRemoveEquipment = (index) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index),
    }))
  }

  const handleAddIssue = () => {
    if (newIssue.description) {
      setFormData((prev) => ({
        ...prev,
        issues: [...prev.issues, { ...newIssue, resolved: false }],
      }))
      setNewIssue({ description: "", severity: "low" })
    }
  }

  const handleRemoveIssue = (index) => {
    setFormData((prev) => ({
      ...prev,
      issues: prev.issues.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      await api.post("/reports", formData)
      navigate("/app/reports")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create report")
    } finally {
      setSaving(false)
    }
  }

  const weatherOptions = [
    { value: "sunny", label: "Sunny", icon: Sun },
    { value: "cloudy", label: "Cloudy", icon: Cloud },
    { value: "rainy", label: "Rainy", icon: CloudRain },
    { value: "stormy", label: "Stormy", icon: CloudLightning },
    { value: "snowy", label: "Snowy", icon: CloudSnow },
    { value: "windy", label: "Windy", icon: Wind },
  ]

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/app/reports")} className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Daily Report</h1>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="project" className="label">
                Project *
              </label>
              <select
                id="project"
                name="project"
                value={formData.project}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="label">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>
        </div>

        {/* Weather */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weather Conditions</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Condition</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {weatherOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, weather: { ...prev.weather, condition: option.value } }))
                    }
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${
                      formData.weather.condition === option.value
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <option.icon
                      className={`w-6 h-6 ${formData.weather.condition === option.value ? "text-primary-600" : "text-gray-400"}`}
                    />
                    <span
                      className={`text-xs ${formData.weather.condition === option.value ? "text-primary-600 font-medium" : "text-gray-500"}`}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="weather.temperature" className="label">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  id="weather.temperature"
                  name="weather.temperature"
                  value={formData.weather.temperature}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., 72"
                />
              </div>
              <div>
                <label htmlFor="weather.notes" className="label">
                  Weather Notes
                </label>
                <input
                  type="text"
                  id="weather.notes"
                  name="weather.notes"
                  value={formData.weather.notes}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Light wind from the east"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Work Details */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Work Details</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="workSummary" className="label">
                Work Summary *
              </label>
              <textarea
                id="workSummary"
                name="workSummary"
                value={formData.workSummary}
                onChange={handleChange}
                className="input"
                rows={4}
                placeholder="Describe the work completed today..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="workersOnSite" className="label">
                  Workers On Site
                </label>
                <input
                  type="number"
                  id="workersOnSite"
                  name="workersOnSite"
                  value={formData.workersOnSite}
                  onChange={handleChange}
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="hoursWorked" className="label">
                  Hours Worked
                </label>
                <input
                  type="number"
                  id="hoursWorked"
                  name="hoursWorked"
                  value={formData.hoursWorked}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipment Used</h2>

          {formData.equipment.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.equipment.map((equip, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                >
                  {equip.name} ({equip.hoursUsed}h)
                  <button
                    type="button"
                    onClick={() => handleRemoveEquipment(index)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newEquipment.name}
              onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
              placeholder="Equipment name"
              className="input flex-1"
            />
            <input
              type="number"
              value={newEquipment.hoursUsed}
              onChange={(e) => setNewEquipment({ ...newEquipment, hoursUsed: e.target.value })}
              placeholder="Hours"
              className="input w-24"
              min="0"
              step="0.5"
            />
            <button type="button" onClick={handleAddEquipment} className="btn btn-secondary">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Issues */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Issues Reported</h2>

          {formData.issues.length > 0 && (
            <div className="space-y-2 mb-4">
              {formData.issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      issue.severity === "high"
                        ? "bg-red-100 text-red-700"
                        : issue.severity === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {issue.severity}
                  </span>
                  <p className="flex-1 text-sm text-gray-700">{issue.description}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveIssue(index)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newIssue.description}
              onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
              placeholder="Describe the issue..."
              className="input flex-1"
            />
            <select
              value={newIssue.severity}
              onChange={(e) => setNewIssue({ ...newIssue, severity: e.target.value })}
              className="input w-28"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button type="button" onClick={handleAddIssue} className="btn btn-secondary">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="input"
            rows={3}
            placeholder="Any additional notes or observations..."
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <button type="button" onClick={() => navigate("/app/reports")} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary flex items-center">
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReportForm
