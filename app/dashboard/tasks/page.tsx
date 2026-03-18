'use client';

import { useEffect, useState } from 'react';
import { taskAPI, clientAPI, orgAPI } from '../../utils/api';
import { useAuth } from '../../utils/AuthContext';
import { FiPlus, FiMessageSquare, FiActivity, FiTrash2 } from 'react-icons/fi';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [view, setView] = useState<'kanban' | 'list'>('list');

  const [formData, setFormData] = useState({
    title: '', description: '', department: 'general',
    assigned_to: '', team_id: '', department_id: '',
    client_id: '', priority: 'medium', due_date: '',
  });

  const isLeadOrAdmin = ['admin', 'team_lead', 'marketing_head', 'crm'].includes(user?.role || '');

  useEffect(() => {
    loadTasks();
    clientAPI.getAll().then(r => setClients(r.data)).catch(() => {});
    orgAPI.getTeams().then(r => setTeams(r.data)).catch(() => {});
    orgAPI.getDepartments().then(r => setDepartments(r.data)).catch(() => {});
    orgAPI.getMembers().then(r => setMembers(r.data)).catch(() => {});
  }, []);

  const loadTasks = async () => {
    const params: any = {};
    if (filterStatus) params.status = filterStatus;
    if (filterTeam) params.team_id = filterTeam;
    const res = await taskAPI.getAll(params);
    setTasks(res.data);
  };

  useEffect(() => { loadTasks(); }, [filterStatus, filterTeam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await taskAPI.create(formData);
      setShowModal(false);
      setFormData({ title: '', description: '', department: 'general', assigned_to: '', team_id: '', department_id: '', client_id: '', priority: 'medium', due_date: '' });
      loadTasks();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create task');
    }
  };

  const updateStatus = async (taskId: number, status: string) => {
    await taskAPI.update(taskId, { status });
    loadTasks();
    if (selectedTask?.id === taskId) {
      const res = await taskAPI.getById(taskId);
      setSelectedTask(res.data);
    }
  };

  const openTask = async (task: any) => {
    const res = await taskAPI.getById(task.id);
    setSelectedTask(res.data);
  };

  const submitComment = async () => {
    if (!comment.trim() || !selectedTask) return;
    await taskAPI.addComment(selectedTask.id, comment);
    setComment('');
    const res = await taskAPI.getById(selectedTask.id);
    setSelectedTask(res.data);
  };

  const deleteTask = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    await taskAPI.delete(id);
    loadTasks();
    if (selectedTask?.id === id) setSelectedTask(null);
  };

  const filteredMembers = formData.team_id
    ? members.filter(m => String(m.team_id) === formData.team_id || String(m.department_id) === formData.department_id)
    : members;

  const filteredDepts = formData.team_id
    ? departments.filter(d => String(d.team_id) === formData.team_id)
    : departments;

  const statuses = ['pending', 'in_progress', 'review', 'completed'];

  return (
    <div className="flex gap-6 h-full">
      {/* Main Panel */}
      <div className={`flex-1 ${selectedTask ? 'max-w-[60%]' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Tasks</h1>
          <div className="flex gap-3 items-center">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input py-2 text-sm">
              <option value="">All Status</option>
              {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} className="input py-2 text-sm">
              <option value="">All Teams</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 gap-1">
              {(['list', 'kanban'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded text-sm capitalize ${view === v ? 'bg-primary text-white' : ''}`}
                >{v}</button>
              ))}
            </div>
            {isLeadOrAdmin && (
              <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                <FiPlus /> New Task
              </button>
            )}
          </div>
        </div>

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className="grid grid-cols-4 gap-4">
            {statuses.map(status => (
              <div key={status} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full ${status === 'pending' ? 'bg-gray-500' : status === 'in_progress' ? 'bg-blue-500' : status === 'review' ? 'bg-purple-500' : 'bg-green-500'}`} />
                  <h3 className="font-semibold text-sm capitalize">{status.replace('_', ' ')}</h3>
                  <span className="text-xs text-gray-500">({tasks.filter(t => t.status === status).length})</span>
                </div>
                <div className="space-y-2">
                  {tasks.filter(t => t.status === status).map(task => (
                    <div key={task.id} onClick={() => openTask(task)}
                      className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow cursor-pointer hover:shadow-md transition">
                      <p className="font-medium text-sm mb-1">{task.title}</p>
                      <p className="text-xs text-gray-500 mb-2">{task.team_name || task.department_name || '-'}</p>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                        <span className="text-xs text-gray-400">{task.due_date || 'No date'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="card">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  {['Title', 'Assigned To', 'Team', 'Dept', 'Priority', 'Status', 'Due', ''].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-sm">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => openTask(task)}>
                    <td className="px-3 py-3">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-gray-400">by {task.assigned_by_name}</p>
                    </td>
                    <td className="px-3 py-3 text-sm">{task.assigned_name || <span className="text-gray-400">Unassigned</span>}</td>
                    <td className="px-3 py-3 text-sm">{task.team_name || '-'}</td>
                    <td className="px-3 py-3 text-sm">{task.department_name || '-'}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                    </td>
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      <select value={task.status}
                        onChange={e => updateStatus(task.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded border-0 cursor-pointer ${STATUS_COLORS[task.status]}`}
                      >
                        {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500">{task.due_date || '-'}</td>
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      {user?.role === 'admin' && (
                        <button onClick={() => deleteTask(task.id)} className="text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button>
                      )}
                    </td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No tasks found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <div className="w-[40%] card h-fit sticky top-0 overflow-y-auto max-h-screen">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">{selectedTask.title}</h2>
            <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div><p className="text-gray-500">Status</p>
              <select value={selectedTask.status} onChange={e => updateStatus(selectedTask.id, e.target.value)}
                className={`text-xs px-2 py-1 rounded mt-1 ${STATUS_COLORS[selectedTask.status]}`}>
                {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div><p className="text-gray-500">Priority</p>
              <span className={`text-xs px-2 py-1 rounded mt-1 inline-block ${PRIORITY_COLORS[selectedTask.priority]}`}>{selectedTask.priority}</span>
            </div>
            <div><p className="text-gray-500">Assigned To</p><p className="font-medium">{selectedTask.assigned_name || 'Unassigned'}</p></div>
            <div><p className="text-gray-500">Assigned By</p><p className="font-medium">{selectedTask.assigned_by_name || '-'}</p></div>
            <div><p className="text-gray-500">Team</p><p className="font-medium">{selectedTask.team_name || '-'}</p></div>
            <div><p className="text-gray-500">Department</p><p className="font-medium">{selectedTask.department_name || '-'}</p></div>
            <div><p className="text-gray-500">Due Date</p><p className="font-medium">{selectedTask.due_date || 'No date'}</p></div>
            <div><p className="text-gray-500">Client</p><p className="font-medium">{selectedTask.company_name || '-'}</p></div>
          </div>

          {selectedTask.description && (
            <div className="mb-4">
              <p className="text-gray-500 text-sm mb-1">Description</p>
              <p className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">{selectedTask.description}</p>
            </div>
          )}

          {/* Comments */}
          <div className="mb-4">
            <h3 className="font-semibold flex items-center gap-2 mb-3"><FiMessageSquare /> Comments ({selectedTask.comments?.length || 0})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
              {selectedTask.comments?.map((c: any) => (
                <div key={c.id} className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm">
                  <p className="font-medium text-xs text-primary mb-1">{c.user_name}</p>
                  <p>{c.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Add a comment..." className="input flex-1 py-2 text-sm"
                onKeyPress={e => e.key === 'Enter' && submitComment()} />
              <button onClick={submitComment} className="btn-primary px-3 py-2 text-sm">Post</button>
            </div>
          </div>

          {/* Activity Log */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-3"><FiActivity /> Activity</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedTask.activity?.map((a: any) => (
                <div key={a.id} className="text-xs text-gray-500 flex gap-2">
                  <span className="text-primary font-medium">{a.user_name}</span>
                  <span>{a.action}</span>
                  {a.new_value && <span className="text-gray-400">— {a.new_value}</span>}
                  <span className="ml-auto">{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task Title *</label>
                <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input h-20" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Team</label>
                  <select value={formData.team_id} onChange={e => setFormData({ ...formData, team_id: e.target.value, department_id: '', assigned_to: '' })} className="input">
                    <option value="">Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <select value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })} className="input">
                    <option value="">Select Department</option>
                    {filteredDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assign To</label>
                  <select value={formData.assigned_to} onChange={e => setFormData({ ...formData, assigned_to: e.target.value })} className="input">
                    <option value="">Unassigned</option>
                    {filteredMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Client</label>
                  <select value={formData.client_id} onChange={e => setFormData({ ...formData, client_id: e.target.value })} className="input">
                    <option value="">No Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="input">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className="input" />
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">Create Task</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
