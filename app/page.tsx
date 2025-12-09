import type React from "react"
import {
  Building2,
  Server,
  Database,
  Layout,
  Shield,
  BarChart3,
  Camera,
  ClipboardList,
  Users,
  Download,
  Terminal,
  FolderOpen,
} from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">BuildTrack</span>
          </div>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm rounded-full border border-amber-500/30">
            MERN Stack Project
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Construction Project Management System</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
          A full-stack MERN application for managing construction projects, tracking milestones, daily reports,
          inventory, and site photos.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
            <Server className="w-5 h-5 text-green-400" />
            <span className="text-slate-300">Node.js + Express</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
            <Database className="w-5 h-5 text-green-400" />
            <span className="text-slate-300">MongoDB</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
            <Layout className="w-5 h-5 text-blue-400" />
            <span className="text-slate-300">React + Vite</span>
          </div>
        </div>
      </section>

      {/* Note about running locally */}
      <section className="max-w-4xl mx-auto px-6 mb-12">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Download className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-2">Download Required</h3>
              <p className="text-slate-300">
                This is a traditional MERN stack project with a separate Express backend. To run the full application,
                download the project and run it locally with MongoDB.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Role-Based Access"
            description="Contractor, Architect, and Client roles with specific permissions and dashboards"
            color="blue"
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Budget Tracking"
            description="Monitor budget vs actual spending with interactive charts"
            color="green"
          />
          <FeatureCard
            icon={<ClipboardList className="w-6 h-6" />}
            title="Daily Reports"
            description="Contractors log daily site activities, weather, and progress"
            color="purple"
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Milestone Approvals"
            description="Architects review and approve project milestones"
            color="amber"
          />
          <FeatureCard
            icon={<Camera className="w-6 h-6" />}
            title="Photo Gallery"
            description="Upload and organize site photos by project"
            color="pink"
          />
          <FeatureCard
            icon={<Database className="w-6 h-6" />}
            title="Inventory Management"
            description="Track materials and receive low-stock alerts"
            color="cyan"
          />
        </div>
      </section>

      {/* Setup Instructions */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Quick Setup</h2>
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-slate-400" />
            <span className="text-slate-300 font-mono text-sm">Terminal</span>
          </div>
          <div className="p-6 font-mono text-sm space-y-4">
            <CodeBlock step="1" comment="Navigate to the buildtrack folder">
              cd buildtrack
            </CodeBlock>
            <CodeBlock step="2" comment="Install all dependencies">
              npm run install-all
            </CodeBlock>
            <CodeBlock step="3" comment="Configure environment variables">
              cp server/.env.example server/.env
            </CodeBlock>
            <CodeBlock step="4" comment="Start MongoDB locally">
              mongod
            </CodeBlock>
            <CodeBlock step="5" comment="Run the application">
              npm run dev
            </CodeBlock>
          </div>
        </div>
        <p className="text-center text-slate-400 mt-4">
          Frontend runs on <span className="text-blue-400">localhost:5173</span> | Backend API on{" "}
          <span className="text-green-400">localhost:5000</span>
        </p>
      </section>

      {/* Project Structure */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Project Structure</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-white">Backend (server/)</h3>
            </div>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-slate-600">├──</span> config/db.js
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-600">├──</span> models/ (6 Mongoose schemas)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-600">├──</span> routes/ (8 API route files)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-600">├──</span> middleware/auth.js
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-600">└──</span> server.js
              </li>
            </ul>
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Frontend (client/)</h3>
            </div>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-slate-600">├──</span> src/pages/ (All page components)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-600">├──</span> src/components/ (UI + GanttChart)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-600">├──</span> src/context/AuthContext.jsx
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-600">├──</span> src/services/api.js
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-600">└──</span> src/App.jsx
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-slate-500">
          <p>Download the project using the menu in the top right corner of the preview.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    purple: "bg-purple-500/20 text-purple-400",
    amber: "bg-amber-500/20 text-amber-400",
    pink: "bg-pink-500/20 text-pink-400",
    cyan: "bg-cyan-500/20 text-cyan-400",
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-colors">
      <div className={`inline-flex p-3 rounded-lg mb-4 ${colorClasses[color]}`}>{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  )
}

function CodeBlock({
  step,
  comment,
  children,
}: {
  step: string
  comment: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="text-slate-500 mb-1">
        # Step {step}: {comment}
      </p>
      <p className="text-green-400">{children}</p>
    </div>
  )
}
