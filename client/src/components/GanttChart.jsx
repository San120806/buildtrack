"use client"

import { useMemo } from "react"
import { format, differenceInDays, addDays, startOfMonth, endOfMonth } from "date-fns"

const GanttChart = ({ projectId, milestones, project }) => {
  const chartData = useMemo(() => {
    if (!project || !milestones?.length) return null

    const projectStart = new Date(project.startDate)
    const projectEnd = new Date(project.endDate)
    const totalDays = differenceInDays(projectEnd, projectStart) + 1

    // Generate month headers
    const months = []
    let currentDate = startOfMonth(projectStart)
    while (currentDate <= endOfMonth(projectEnd)) {
      const monthEnd = endOfMonth(currentDate)
      const visibleStart = currentDate < projectStart ? projectStart : currentDate
      const visibleEnd = monthEnd > projectEnd ? projectEnd : monthEnd
      const startOffset = differenceInDays(visibleStart, projectStart)
      const duration = differenceInDays(visibleEnd, visibleStart) + 1

      months.push({
        name: format(currentDate, "MMM yyyy"),
        startOffset,
        duration,
        width: (duration / totalDays) * 100,
      })

      currentDate = addDays(monthEnd, 1)
    }

    // Process milestones
    const items = milestones.map((milestone) => {
      const start = new Date(milestone.startDate)
      const end = new Date(milestone.dueDate)
      const startOffset = Math.max(0, differenceInDays(start, projectStart))
      const duration = differenceInDays(end, start) + 1

      return {
        id: milestone._id,
        title: milestone.title,
        startOffset,
        duration,
        progress: milestone.progress || 0,
        status: milestone.status,
        left: (startOffset / totalDays) * 100,
        width: (duration / totalDays) * 100,
      }
    })

    // Add project bar
    const projectBar = {
      id: "project",
      title: project.name,
      startOffset: 0,
      duration: totalDays,
      progress: project.progress || 0,
      status: project.status,
      left: 0,
      width: 100,
      isProject: true,
    }

    return {
      totalDays,
      months,
      items: [projectBar, ...items],
      projectStart,
      projectEnd,
    }
  }, [project, milestones])

  if (!chartData) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No timeline data available</p>
      </div>
    )
  }

  const getStatusColor = (status, isProject = false) => {
    if (isProject) return "bg-primary-500"
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-blue-500"
      case "awaiting-approval":
        return "bg-yellow-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  const getProgressColor = (status, isProject = false) => {
    if (isProject) return "bg-primary-700"
    switch (status) {
      case "completed":
        return "bg-green-700"
      case "in-progress":
        return "bg-blue-700"
      case "awaiting-approval":
        return "bg-yellow-700"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Month Headers */}
        <div className="flex border-b border-gray-200 mb-2">
          <div className="w-48 flex-shrink-0 px-2 py-2">
            <span className="text-sm font-medium text-gray-500">Task</span>
          </div>
          <div className="flex-1 flex">
            {chartData.months.map((month, index) => (
              <div
                key={index}
                className="text-center text-sm font-medium text-gray-600 py-2 border-l border-gray-100"
                style={{ width: `${month.width}%` }}
              >
                {month.name}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Rows */}
        <div className="space-y-2">
          {chartData.items.map((item) => (
            <div key={item.id} className="flex items-center">
              {/* Task Name */}
              <div className="w-48 flex-shrink-0 px-2">
                <span
                  className={`text-sm truncate block ${item.isProject ? "font-semibold text-gray-900" : "text-gray-700"}`}
                >
                  {item.title}
                </span>
              </div>

              {/* Bar Container */}
              <div className="flex-1 relative h-8 bg-gray-50 rounded">
                {/* Grid lines */}
                {chartData.months.map((month, index) => (
                  <div
                    key={index}
                    className="absolute top-0 bottom-0 border-l border-gray-100"
                    style={{ left: `${chartData.months.slice(0, index).reduce((sum, m) => sum + m.width, 0)}%` }}
                  />
                ))}

                {/* Task Bar */}
                <div
                  className={`absolute top-1 bottom-1 rounded ${getStatusColor(item.status, item.isProject)} opacity-40`}
                  style={{ left: `${item.left}%`, width: `${item.width}%` }}
                />

                {/* Progress Bar */}
                <div
                  className={`absolute top-1 bottom-1 rounded-l ${item.progress === 100 ? "rounded-r" : ""} ${getProgressColor(item.status, item.isProject)}`}
                  style={{
                    left: `${item.left}%`,
                    width: `${(item.width * item.progress) / 100}%`,
                  }}
                />

                {/* Progress Label */}
                {item.width > 5 && (
                  <div
                    className="absolute top-1 bottom-1 flex items-center justify-center text-xs text-white font-medium"
                    style={{ left: `${item.left}%`, width: `${item.width}%` }}
                  >
                    {item.progress}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-500">Status:</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-400" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-sm text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span className="text-sm text-gray-600">Awaiting Approval</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-sm text-gray-600">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GanttChart
