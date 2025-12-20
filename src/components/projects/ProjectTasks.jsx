import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, CheckCircle2, Circle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ProjectTasks({ project, currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "medium",
    due_date: ""
  });
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['projectTasks', project.id],
    queryFn: () => base44.entities.ProjectTask.filter({ project_id: project.id }, '-created_date'),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data) => {
      const task = await base44.entities.ProjectTask.create(data);
      
      // Notify assigned user
      if (data.assigned_to && data.assigned_to !== currentUser.email) {
        await base44.functions.invoke('sendNotification', {
          recipientEmail: data.assigned_to,
          type: 'new_message',
          title: 'New Task Assigned',
          message: `You've been assigned a task in ${project.name}: ${data.title}`,
          link: `/ProjectDetail?projectId=${project.id}`
        });
      }
      
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      setFormData({ title: "", description: "", assigned_to: "", priority: "medium", due_date: "" });
      setShowForm(false);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProjectTask.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createTaskMutation.mutate({
      ...formData,
      project_id: project.id,
      created_by: currentUser.email,
      status: "todo"
    });
  };

  const toggleTaskStatus = (task) => {
    const newStatus = task.status === "completed" ? "todo" : "completed";
    updateTaskMutation.mutate({ id: task.id, data: { status: newStatus } });
  };

  const projectMembers = [
    { email: project.owner_email, name: allUsers.find(u => u.email === project.owner_email)?.full_name },
    ...(project.collaborators || []).map(email => ({
      email,
      name: allUsers.find(u => u.email === email)?.full_name
    }))
  ];

  const priorityColors = {
    low: '#3B82F6',
    medium: '#FBB13C',
    high: '#EF4444'
  };

  return (
    <div className="space-y-6">
      {/* Add Task Button */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full rounded-xl gap-2"
          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#fff' }}
        >
          <Plus className="w-5 h-5" />
          Add Task
        </Button>
      )}

      {/* Create Task Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl space-y-4">
          <div>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title"
              className="glass-input"
              style={{ color: '#E5EDFF' }}
            />
          </div>
          <div>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Task description"
              className="glass-input h-20"
              style={{ color: '#E5EDFF' }}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Select value={formData.assigned_to} onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}>
              <SelectTrigger className="glass-input" style={{ color: '#E5EDFF' }}>
                <SelectValue placeholder="Assign to..." />
              </SelectTrigger>
              <SelectContent>
                {projectMembers.map(member => (
                  <SelectItem key={member.email} value={member.email}>
                    {member.name || member.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger className="glass-input" style={{ color: '#E5EDFF' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="glass-input"
              style={{ color: '#E5EDFF' }}
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#B6C4E0' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="flex-1"
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1F3A8A 100%)', color: '#fff' }}
            >
              Create Task
            </Button>
          </div>
        </form>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="glass-card p-12 rounded-2xl text-center" style={{ color: '#7A8BA6' }}>
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tasks yet</p>
          </div>
        ) : (
          tasks.map((task) => {
            const assignedUser = allUsers.find(u => u.email === task.assigned_to);
            return (
              <div
                key={task.id}
                className="glass-card p-4 rounded-xl"
                style={{
                  opacity: task.status === "completed" ? 0.7 : 1,
                  borderLeft: `4px solid ${priorityColors[task.priority]}`
                }}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaskStatus(task)}
                    className="mt-1"
                  >
                    {task.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5" style={{ color: '#22C55E' }} />
                    ) : (
                      <Circle className="w-5 h-5" style={{ color: '#7A8BA6' }} />
                    )}
                  </button>
                  <div className="flex-1">
                    <h4
                      className="font-semibold mb-1"
                      style={{
                        color: '#E5EDFF',
                        textDecoration: task.status === "completed" ? 'line-through' : 'none'
                      }}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm mb-2" style={{ color: '#B6C4E0' }}>
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs" style={{ color: '#7A8BA6' }}>
                      {assignedUser && (
                        <span>Assigned to: {assignedUser.full_name}</span>
                      )}
                      <span className="px-2 py-1 rounded" style={{ background: `${priorityColors[task.priority]}20`, color: priorityColors[task.priority] }}>
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}