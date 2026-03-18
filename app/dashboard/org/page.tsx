'use client';

import { useEffect, useState } from 'react';
import { orgAPI } from '../../utils/api';
import { FiPlus, FiTrash2, FiUsers, FiGrid, FiChevronDown, FiChevronRight } from 'react-icons/fi';

export default function OrgPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [tab, setTab] = useState<'chart' | 'teams' | 'departments' | 'members'>('chart');
  const [orgChart, setOrgChart] = useState<any[]>([]);
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set());

  // Modals
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const [teamForm, setTeamForm] = useState({ name: '', description: '' });
  const [deptForm, setDeptForm] = useState({ name: '', team_id: '', description: '' });
  const [memberForm, setMemberForm] = useState({
    name: '', email: '', password: 'password123', role: 'employee',
    phone: '', team_id: '', department_id: '', manager_id: ''
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const [t, d, m, oc] = await Promise.all([
      orgAPI.getTeams(),
      orgAPI.getDepartments(),
      orgAPI.getMembers(),
      orgAPI.getOrgChart(),
    ]);
    setTeams(t.data);
    setDepartments(d.data);
    setMembers(m.data);
    setOrgChart(oc.data);
    setExpandedTeams(new Set(oc.data.map((t: any) => t.id)));
  };

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    await orgAPI.createTeam(teamForm);
    setShowTeamModal(false);
    setTeamForm({ name: '', description: '' });
    loadAll();
  };

  const createDept = async (e: React.FormEvent) => {
    e.preventDefault();
    await orgAPI.createDepartment({ ...deptForm, team_id: parseInt(deptForm.team_id) });
    setShowDeptModal(false);
    setDeptForm({ name: '', team_id: '', description: '' });
    loadAll();
  };

  const createMember = async (e: React.FormEvent) => {
    e.preventDefault();
    await orgAPI.createMember(memberForm);
    setShowMemberModal(false);
    setMemberForm({ name: '', email: '', password: 'password123', role: 'employee', phone: '', team_id: '', department_id: '', manager_id: '' });
    loadAll();
  };

  const deleteMember = async (id: number) => {
    if (!confirm('Delete this member?')) return;
    await orgAPI.deleteMember(id);
    loadAll();
  };

  const toggleTeam = (id: number) => {
    const next = new Set(expandedTeams);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedTeams(next);
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    team_lead: 'bg-purple-100 text-purple-800',
    marketing_head: 'bg-blue-100 text-blue-800',
    crm: 'bg-pink-100 text-pink-800',
    developer: 'bg-green-100 text-green-800',
    smm: 'bg-yellow-100 text-yellow-800',
    employee: 'bg-gray-100 text-gray-800',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Organization</h1>
        <div className="flex gap-3">
          <button onClick={() => setShowTeamModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <FiPlus /> Add Team
          </button>
          <button onClick={() => setShowDeptModal(true)} className="btn-primary flex items-center gap-2 text-sm bg-purple-600 hover:bg-purple-700">
            <FiPlus /> Add Department
          </button>
          <button onClick={() => setShowMemberModal(true)} className="btn-primary flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700">
            <FiPlus /> Add Member
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b dark:border-gray-700">
        {(['chart', 'teams', 'departments', 'members'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
              tab === t ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >{t === 'chart' ? 'Org Chart' : t}</button>
        ))}
      </div>

      {/* Org Chart */}
      {tab === 'chart' && (
        <div className="space-y-4">
          {orgChart.map((team: any) => (
            <div key={team.id} className="card">
              <button onClick={() => toggleTeam(team.id)} className="flex items-center gap-3 w-full text-left">
                {expandedTeams.has(team.id) ? <FiChevronDown /> : <FiChevronRight />}
                <FiGrid className="text-blue-500" />
                <span className="text-lg font-bold">{team.name}</span>
                <span className="text-sm text-gray-500">({team.member_count} members)</span>
              </button>

              {expandedTeams.has(team.id) && (
                <div className="mt-4 ml-6 space-y-3">
                  {team.leads?.map((lead: any) => (
                    <div key={lead.id} className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <span className="text-blue-500">👑</span>
                      <span className="font-medium">{lead.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${roleColors[lead.role] || 'bg-gray-100'}`}>{lead.role}</span>
                    </div>
                  ))}

                  {team.departments?.map((dept: any) => (
                    <div key={dept.id} className="ml-4 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FiUsers className="text-purple-500" />
                        <span className="font-semibold text-purple-700 dark:text-purple-300">{dept.name}</span>
                        <span className="text-xs text-gray-500">({dept.member_count} members)</span>
                      </div>
                      {dept.leads?.map((lead: any) => (
                        <div key={lead.id} className="flex items-center gap-2 ml-4 p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded mb-1">
                          <span>👑</span>
                          <span className="text-sm font-medium">{lead.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${roleColors[lead.role] || 'bg-gray-100'}`}>{lead.role}</span>
                        </div>
                      ))}
                      {dept.members?.map((member: any) => (
                        <div key={member.id} className="flex items-center gap-2 ml-4 p-1.5 rounded mb-1">
                          <span>👤</span>
                          <span className="text-sm">{member.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${roleColors[member.role] || 'bg-gray-100'}`}>{member.role}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Teams Tab */}
      {tab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map(team => (
            <div key={team.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{team.name}</h3>
                  <p className="text-sm text-gray-500">{team.description}</p>
                  <p className="text-sm mt-2 text-blue-600">{team.member_count} members</p>
                </div>
                <button onClick={() => orgAPI.deleteTeam(team.id).then(loadAll)} className="text-red-500 hover:text-red-700">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Departments Tab */}
      {tab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(dept => (
            <div key={dept.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{dept.name}</h3>
                  <p className="text-sm text-blue-500">{dept.team_name}</p>
                  <p className="text-sm text-gray-500">{dept.description}</p>
                  <p className="text-sm mt-2 text-purple-600">{dept.member_count} members</p>
                </div>
                <button onClick={() => orgAPI.deleteDepartment(dept.id).then(loadAll)} className="text-red-500 hover:text-red-700">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div className="card">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                {['Name', 'Email', 'Role', 'Team', 'Department', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-sm">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3 font-medium">{member.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{member.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${roleColors[member.role] || 'bg-gray-100'}`}>{member.role}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{member.team_name || '-'}</td>
                  <td className="px-4 py-3 text-sm">{member.department_name || '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteMember(member.id)} className="text-red-500 hover:text-red-700"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Team Modal */}
      {showTeamModal && (
        <Modal title="Add Team" onClose={() => setShowTeamModal(false)}>
          <form onSubmit={createTeam} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Team Name</label>
              <input value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={teamForm.description} onChange={e => setTeamForm({ ...teamForm, description: e.target.value })} className="input h-20" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">Create Team</button>
              <button type="button" onClick={() => setShowTeamModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Department Modal */}
      {showDeptModal && (
        <Modal title="Add Department" onClose={() => setShowDeptModal(false)}>
          <form onSubmit={createDept} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Department Name</label>
              <input value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Team</label>
              <select value={deptForm.team_id} onChange={e => setDeptForm({ ...deptForm, team_id: e.target.value })} className="input" required>
                <option value="">Select Team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={deptForm.description} onChange={e => setDeptForm({ ...deptForm, description: e.target.value })} className="input h-20" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">Create Department</button>
              <button type="button" onClick={() => setShowDeptModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <Modal title="Add Member" onClose={() => setShowMemberModal(false)}>
          <form onSubmit={createMember} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input value={memberForm.password} onChange={e => setMemberForm({ ...memberForm, password: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input value={memberForm.phone} onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select value={memberForm.role} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })} className="input">
                  <option value="employee">Employee</option>
                  <option value="team_lead">Team Lead</option>
                  <option value="developer">Developer</option>
                  <option value="smm">Social Media</option>
                  <option value="crm">CRM</option>
                  <option value="marketing_head">Marketing Head</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Team</label>
                <select value={memberForm.team_id} onChange={e => setMemberForm({ ...memberForm, team_id: e.target.value })} className="input">
                  <option value="">Select Team</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select value={memberForm.department_id} onChange={e => setMemberForm({ ...memberForm, department_id: e.target.value })} className="input">
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.team_name})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reports To</label>
                <select value={memberForm.manager_id} onChange={e => setMemberForm({ ...memberForm, manager_id: e.target.value })} className="input">
                  <option value="">Select Manager</option>
                  {members.filter(m => ['team_lead', 'marketing_head', 'crm', 'admin'].includes(m.role)).map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">Add Member</button>
              <button type="button" onClick={() => setShowMemberModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}
