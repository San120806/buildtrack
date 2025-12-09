"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"
import Badge from "../../components/ui/Badge"
import Modal from "../../components/ui/Modal"
import EmptyState from "../../components/ui/EmptyState"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import { Package, Plus, Search, AlertTriangle, Edit, Trash2, Loader2, TrendingDown, TrendingUp } from "lucide-react"

const Inventory = () => {
  const { projectId } = useParams()
  const { isContractor } = useAuth()

  const [items, setItems] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedProject, setSelectedProject] = useState(projectId || "")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showLowStock, setShowLowStock] = useState(false)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showQuantityModal, setShowQuantityModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    category: "other",
    description: "",
    unit: "",
    quantity: 0,
    minQuantity: 0,
    unitCost: 0,
    location: "",
    supplier: { name: "", contact: "", email: "" },
  })

  const [quantityData, setQuantityData] = useState({
    quantity: 0,
    operation: "add",
  })

  useEffect(() => {
    if (!projectId) {
      fetchProjects()
    }
    if (selectedProject) {
      fetchInventory()
    } else {
      setLoading(false)
    }
  }, [selectedProject, selectedCategory, showLowStock, search])

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects")
      setProjects(response.data.data)
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    }
  }

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append("category", selectedCategory)
      if (showLowStock) params.append("lowStock", "true")
      if (search) params.append("search", search)

      const response = await api.get(`/inventory/project/${selectedProject}?${params.toString()}`)
      setItems(response.data.data)
    } catch (error) {
      console.error("Failed to fetch inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        description: item.description || "",
        unit: item.unit,
        quantity: item.quantity,
        minQuantity: item.minQuantity,
        unitCost: item.unitCost,
        location: item.location || "",
        supplier: item.supplier || { name: "", contact: "", email: "" },
      })
      setSelectedItem(item)
    } else {
      setFormData({
        name: "",
        category: "other",
        description: "",
        unit: "",
        quantity: 0,
        minQuantity: 0,
        unitCost: 0,
        location: "",
        supplier: { name: "", contact: "", email: "" },
      })
      setSelectedItem(null)
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const data = { ...formData, project: selectedProject }

      if (selectedItem) {
        await api.put(`/inventory/${selectedItem._id}`, data)
      } else {
        await api.post("/inventory", data)
      }

      fetchInventory()
      setShowModal(false)
    } catch (error) {
      console.error("Failed to save item:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return

    try {
      await api.delete(`/inventory/${id}`)
      setItems(items.filter((i) => i._id !== id))
    } catch (error) {
      console.error("Failed to delete item:", error)
    }
  }

  const handleOpenQuantityModal = (item) => {
    setSelectedItem(item)
    setQuantityData({ quantity: 0, operation: "add" })
    setShowQuantityModal(true)
  }

  const handleQuantityUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.put(`/inventory/${selectedItem._id}/quantity`, quantityData)
      fetchInventory()
      setShowQuantityModal(false)
    } catch (error) {
      console.error("Failed to update quantity:", error)
    } finally {
      setSaving(false)
    }
  }

  const categories = [
    { value: "", label: "All Categories" },
    { value: "concrete", label: "Concrete" },
    { value: "steel", label: "Steel" },
    { value: "wood", label: "Wood" },
    { value: "electrical", label: "Electrical" },
    { value: "plumbing", label: "Plumbing" },
    { value: "finishing", label: "Finishing" },
    { value: "tools", label: "Tools" },
    { value: "safety", label: "Safety" },
    { value: "other", label: "Other" },
  ]

  const getCategoryBadge = (category) => {
    const variants = {
      concrete: "default",
      steel: "info",
      wood: "warning",
      electrical: "danger",
      plumbing: "info",
      finishing: "purple",
      tools: "default",
      safety: "warning",
      other: "default",
    }
    return variants[category] || "default"
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">Manage materials and equipment</p>
        </div>
        {isContractor && selectedProject && (
          <button onClick={() => handleOpenModal()} className="btn btn-primary inline-flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add Item
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <label className="label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items..."
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input">
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">&nbsp;</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="rounded text-primary-600"
              />
              <span className="text-sm text-gray-700">Low Stock Only</span>
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            </label>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <LoadingSpinner size="lg" className="h-64" />
      ) : !selectedProject ? (
        <div className="card">
          <EmptyState icon={Package} title="Select a project" description="Choose a project to view its inventory" />
        </div>
      ) : items.length > 0 ? (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item._id} className={item.isLowStock ? "bg-yellow-50" : ""}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.isLowStock && <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.location && <p className="text-sm text-gray-500">{item.location}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getCategoryBadge(item.category)}>{item.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${item.isLowStock ? "text-yellow-700" : "text-gray-900"}`}>
                          {item.quantity} {item.unit}
                        </span>
                        {isContractor && (
                          <button
                            onClick={() => handleOpenQuantityModal(item)}
                            className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {item.isLowStock && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Min: {item.minQuantity} {item.unit}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{formatCurrency(item.unitCost)}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(item.totalValue)}</td>
                    <td className="px-6 py-4 text-right">
                      {isContractor && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={Package}
            title="No inventory items"
            description={search || selectedCategory ? "Try adjusting your filters" : "Add items to track inventory"}
            action={
              isContractor && !search && !selectedCategory ? (
                <button onClick={() => handleOpenModal()} className="btn btn-primary inline-flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add First Item
                </button>
              ) : null
            }
          />
        </div>
      )}

      {/* Item Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedItem ? "Edit Item" : "Add New Item"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Item Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                {categories.slice(1).map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="label">Unit *</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="input"
                placeholder="e.g., pcs, kg"
                required
              />
            </div>
            <div>
              <label className="label">Quantity *</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="input"
                min="0"
                required
              />
            </div>
            <div>
              <label className="label">Min Quantity</label>
              <input
                type="number"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                className="input"
                min="0"
              />
            </div>
            <div>
              <label className="label">Unit Cost ($)</label>
              <input
                type="number"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                className="input"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="label">Storage Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input"
              placeholder="e.g., Warehouse A, Shelf B3"
            />
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
                "Save Item"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quantity Update Modal */}
      <Modal isOpen={showQuantityModal} onClose={() => setShowQuantityModal(false)} title="Update Quantity" size="sm">
        <form onSubmit={handleQuantityUpdate} className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">{selectedItem?.name}</p>
            <p className="text-sm text-gray-500">
              Current: {selectedItem?.quantity} {selectedItem?.unit}
            </p>
          </div>

          <div>
            <label className="label">Operation</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="operation"
                  value="add"
                  checked={quantityData.operation === "add"}
                  onChange={(e) => setQuantityData({ ...quantityData, operation: e.target.value })}
                  className="text-primary-600"
                />
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>Add Stock</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="operation"
                  value="subtract"
                  checked={quantityData.operation === "subtract"}
                  onChange={(e) => setQuantityData({ ...quantityData, operation: e.target.value })}
                  className="text-primary-600"
                />
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span>Use Stock</span>
              </label>
            </div>
          </div>

          <div>
            <label className="label">Quantity</label>
            <input
              type="number"
              value={quantityData.quantity}
              onChange={(e) => setQuantityData({ ...quantityData, quantity: Number(e.target.value) })}
              className="input"
              min="0"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowQuantityModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary flex items-center">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Quantity"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Inventory
