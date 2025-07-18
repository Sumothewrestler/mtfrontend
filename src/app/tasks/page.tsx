'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Calendar, CheckCircle, Circle, Edit, Trash2, X, Tag as TagIcon } from 'lucide-react'
import { useDarkMode } from '@/contexts/DarkModeContext'

interface TaskTag {
  id: number
  name: string
  created_at: string
  updated_at: string
}

interface Task {
  id: number
  task_name: string
  status: 'Pending' | 'Done'
  due_date: string
  task_tag?: number
  task_tag_name?: string
  created_at: string
  completion_date: string | null
}

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Partial<Task>) => void
  task?: Task
  isEditing?: boolean
}

function TaskModal({ isOpen, onClose, onSubmit, task, isEditing = false }: TaskModalProps) {
  const { isDarkMode } = useDarkMode()
  const [taskTags, setTaskTags] = useState<TaskTag[]>([])
  const [showNewTagForm, setShowNewTagForm] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [formData, setFormData] = useState({
    task_name: '',
    due_date: '',
    task_tag: undefined as number | undefined,
    status: 'Pending' as 'Pending' | 'Done'
  })

  useEffect(() => {
    if (isOpen) {
      fetchTaskTags()
    }
  }, [isOpen])

  useEffect(() => {
    if (task && isEditing) {
      setFormData({
        task_name: task.task_name,
        due_date: task.due_date,
        task_tag: task.task_tag,
        status: task.status
      })
    } else {
      setFormData({
        task_name: '',
        due_date: '',
        task_tag: undefined,
        status: 'Pending'
      })
    }
  }, [task, isEditing, isOpen])

  const fetchTaskTags = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}task-tags/`)
      if (response.ok) {
        const data = await response.json()
        setTaskTags(data)
      }
    } catch (error) {
      console.error('Error fetching task tags:', error)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}task-tags/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName.trim() })
      })
      
      if (response.ok) {
        const newTag = await response.json()
        setTaskTags([...taskTags, newTag])
        setFormData({ ...formData, task_tag: newTag.id })
        setNewTagName('')
        setShowNewTagForm(false)
      }
    } catch (error) {
      console.error('Error creating tag:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Task Name</label>
            <input
              type="text"
              value={formData.task_name}
              onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
              className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              placeholder="Enter task name"
              required
            />
          </div>

          {/* Task Tags Section */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center">
              <TagIcon size={16} className="mr-1" />
              Task Tag (Optional)
            </label>
            
            {/* Tag Navigation */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {/* No Tag Option */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, task_tag: undefined })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.task_tag === undefined
                      ? 'bg-gray-500 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  No Tag
                </button>

                {/* Existing Tags */}
                {taskTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, task_tag: tag.id })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.task_tag === tag.id
                        ? 'bg-blue-600 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}

                {/* Add New Tag Button */}
                <button
                  type="button"
                  onClick={() => setShowNewTagForm(!showNewTagForm)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showNewTagForm
                      ? 'bg-green-600 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-dashed border-gray-500'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-dashed border-gray-400'
                  } flex items-center`}
                >
                  <Plus size={14} className="mr-1" />
                  Add New
                </button>
              </div>

              {/* New Tag Creation Form */}
              {showNewTagForm && (
                <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="Enter tag name"
                      className={`flex-1 px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} text-sm`}
                    />
                    <button
                      type="button"
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim()}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewTagForm(false)
                        setNewTagName('')
                      }}
                      className={`px-3 py-2 rounded text-sm ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              required
            />
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Pending' | 'Done' })}
                className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              >
                <option value="Pending">Pending</option>
                <option value="Done">Done</option>
              </select>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-lg border ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const { isDarkMode } = useDarkMode()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    due_date: ''
  })

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}tasks/`
      const params = new URLSearchParams()
      
      if (filters.search) params.append('search', filters.search)
      if (filters.status !== 'All') params.append('status', filters.status)
      if (filters.due_date) params.append('due_date', filters.due_date)
      
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tasks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })
      if (!response.ok) throw new Error('Failed to create task')
      await fetchTasks()
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!editingTask) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tasks/${editingTask.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })
      if (!response.ok) throw new Error('Failed to update task')
      await fetchTasks()
      setEditingTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tasks/${taskId}/`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete task')
      await fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleToggleStatus = async (taskId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}tasks/${taskId}/toggle-status/`, {
        method: 'PATCH'
      })
      if (!response.ok) throw new Error('Failed to toggle task status')
      await fetchTasks()
    } catch (error) {
      console.error('Error toggling task status:', error)
    }
  }

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'Done') return 'text-green-600'
    const today = new Date().toISOString().split('T')[0]
    if (dueDate < today) return 'text-red-600'
    if (dueDate === today) return 'text-orange-600'
    return 'text-blue-600'
  }

  const getStatusBgColor = (status: string, dueDate: string) => {
    if (status === 'Done') return 'bg-green-100'
    const today = new Date().toISOString().split('T')[0]
    if (dueDate < today) return 'bg-red-100'
    if (dueDate === today) return 'bg-orange-100'
    return 'bg-blue-100'
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Task Management</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={20} />
            <span>Add Task</span>
          </button>
        </div>

        {/* Filters */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className={`px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
            </select>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={filters.due_date}
                onChange={(e) => setFilters({ ...filters, due_date: e.target.value })}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
          {loading ? (
            <div className="p-8 text-center">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No tasks found. Create your first task to get started!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <div key={task.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <button
                        onClick={() => handleToggleStatus(task.id)}
                        className={`${getStatusColor(task.status, task.due_date)} hover:scale-110 transition-transform`}
                      >
                        {task.status === 'Done' ? <CheckCircle size={24} /> : <Circle size={24} />}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className={`text-lg font-semibold ${task.status === 'Done' ? 'line-through opacity-60' : ''}`}>
                            {task.task_name}
                          </h3>
                          {task.task_tag_name && (
                            <span className={`px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800`}>
                              {task.task_tag_name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBgColor(task.status, task.due_date)} ${getStatusColor(task.status, task.due_date)}`}>
                            {task.status}
                            {task.status === 'Pending' && task.due_date < new Date().toISOString().split('T')[0] && ' (Overdue)'}
                            {task.status === 'Pending' && task.due_date === new Date().toISOString().split('T')[0] && ' (Due Today)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingTask(task)
                          setIsModalOpen(true)
                        }}
                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className={`p-2 rounded-lg text-red-600 ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-red-50'}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask || undefined}
        isEditing={!!editingTask}
      />
    </div>
  )
}