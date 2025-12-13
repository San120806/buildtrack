import { LayoutDashboard } from "lucide-react"

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 justify-center mb-4">
            <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">BuildTrack</h1>
          </div>
          <p className="text-primary-200 mt-1">Construction Project Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">{children}</div>
      </div>
    </div>
  )
}

export default AuthLayout
