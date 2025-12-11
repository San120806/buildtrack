"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import api from "../../services/api"
import EmptyState from "../../components/ui/EmptyState"
import LoadingSpinner from "../../components/ui/LoadingSpinner"
import Modal from "../../components/ui/Modal"
import Badge from "../../components/ui/Badge"
import { Camera, Upload, X, Filter, Loader2, ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react"

const PhotoGallery = () => {
  const { projectId } = useParams()
  const { isContractor } = useAuth()
  const fileInputRef = useRef(null)

  const [photos, setPhotos] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedProject, setSelectedProject] = useState(projectId || "")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFiles, setUploadFiles] = useState([])
  const [uploadData, setUploadData] = useState({
    category: "general",
    caption: "",
  })

  useEffect(() => {
    if (!projectId) {
      fetchProjects()
    }
    if (selectedProject) {
      fetchPhotos()
    } else {
      setLoading(false)
    }
  }, [selectedProject, selectedCategory])

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects")
      setProjects(response.data?.data || [])
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    }
  }

  const fetchPhotos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append("category", selectedCategory)

      const response = await api.get(`/photos/project/${selectedProject}?${params.toString()}`)
      setPhotos(response.data?.data || [])
    } catch (error) {
      console.error("Failed to fetch photos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setUploadFiles(files)
    if (files.length > 0) {
      setShowUploadModal(true)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadFiles.length || !selectedProject) return

    setUploading(true)

    try {
      const formData = new FormData()
      uploadFiles.forEach((file) => {
        formData.append("photos", file)
      })
      formData.append("project", selectedProject)
      formData.append("category", uploadData.category)
      formData.append("caption", uploadData.caption)

      await api.post("/photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      fetchPhotos()
      setShowUploadModal(false)
      setUploadFiles([])
      setUploadData({ category: "general", caption: "" })
    } catch (error) {
      console.error("Failed to upload photos:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return

    try {
      await api.delete(`/photos/${id}`)
      setPhotos(photos.filter((p) => p._id !== id))
      setSelectedPhoto(null)
    } catch (error) {
      console.error("Failed to delete photo:", error)
    }
  }

  const getCategoryBadge = (category) => {
    const variants = {
      progress: "info",
      issue: "danger",
      milestone: "success",
      safety: "warning",
      general: "default",
    }
    return variants[category] || "default"
  }

  const navigatePhoto = (direction) => {
    const currentIndex = photos.findIndex((p) => p._id === selectedPhoto._id)
    let newIndex

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1
    } else {
      newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0
    }

    setSelectedPhoto(photos[newIndex])
  }

  const categories = [
    { value: "", label: "All Categories" },
    { value: "progress", label: "Progress" },
    { value: "issue", label: "Issues" },
    { value: "milestone", label: "Milestones" },
    { value: "safety", label: "Safety" },
    { value: "general", label: "General" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photo Gallery</h1>
          <p className="text-gray-600 mt-1">View and manage site photos</p>
        </div>
        {isContractor && selectedProject && (
          <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary inline-flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload Photos
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          multiple
          className="hidden"
        />
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <label className="label">Category</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input pl-10"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <LoadingSpinner size="lg" className="h-64" />
      ) : !selectedProject ? (
        <div className="card">
          <EmptyState icon={Camera} title="Select a project" description="Choose a project to view its photos" />
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div
              key={photo._id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={`https://picsum.photos/300/300?random=${photo._id}&query=construction`}
                alt={photo.caption || "Site photo"}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <Badge variant={getCategoryBadge(photo.category)} className="text-xs">
                  {photo.category}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={Camera}
            title="No photos yet"
            description="Upload photos to document site progress"
            action={
              isContractor ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary inline-flex items-center"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload First Photo
                </button>
              ) : null
            }
          />
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Photos" size="md">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {uploadFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setUploadFiles(uploadFiles.filter((_, i) => i !== index))}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="label">Category</label>
            <select
              value={uploadData.category}
              onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
              className="input"
            >
              {categories.slice(1).map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Caption</label>
            <input
              type="text"
              value={uploadData.caption}
              onChange={(e) => setUploadData({ ...uploadData, caption: e.target.value })}
              className="input"
              placeholder="Add a caption..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowUploadModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !uploadFiles.length}
              className="btn btn-primary flex items-center"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {uploadFiles.length} Photo{uploadFiles.length > 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
          >
            <X className="w-8 h-8" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={() => navigatePhoto("prev")}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white bg-black/50 rounded-full"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={() => navigatePhoto("next")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white bg-black/50 rounded-full"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="max-w-5xl max-h-[90vh] flex flex-col">
            <img
              src={`http://localhost:5000${selectedPhoto.path}`}
              alt={selectedPhoto.caption || "Site photo"}
              className="max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-4 flex items-center justify-between text-white">
              <div>
                <Badge variant={getCategoryBadge(selectedPhoto.category)}>{selectedPhoto.category}</Badge>
                {selectedPhoto.caption && <p className="mt-2 text-white/80">{selectedPhoto.caption}</p>}
                <p className="text-sm text-white/60 mt-1">
                  {new Date(selectedPhoto.takenAt).toLocaleDateString()} by {selectedPhoto.uploadedBy?.name}
                </p>
              </div>
              {isContractor && (
                <div className="flex items-center gap-2">
                  <a
                    href={`http://localhost:5000${selectedPhoto.path}`}
                    download
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => handleDelete(selectedPhoto._id)}
                    className="p-2 text-white/70 hover:text-red-400 hover:bg-white/10 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoGallery
