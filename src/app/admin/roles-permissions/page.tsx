'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Check, Lock } from 'lucide-react';

export default function AdminRolesPermissionsPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  async function fetchRoles() {
    setLoading(true);
    try {
      const token = localStorage.getItem('loveridge_token');
      const res = await fetch('/api/admin/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRoles(data.roles || []);
      setAllPermissions(data.allPermissions || []);
    } catch (err) {
      console.error('Failed to load roles matrix:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRoles();
  }, []);

  async function handleCreateRole(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('loveridge_token');

    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDesc,
          permissionKeys: selectedPerms,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create role.');

      setModalOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
      setSelectedPerms([]);
      fetchRoles();
    } catch (err: any) {
      alert(err.message);
    }
  }

  function togglePerm(key: string) {
    if (selectedPerms.includes(key)) {
      setSelectedPerms(selectedPerms.filter((k) => k !== key));
    } else {
      setSelectedPerms([...selectedPerms, key]);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Role-Based Access Control (RBAC) Matrix</h1>
          <p className="text-xs text-slate-400">
            Define system roles, permission mapping, and create custom access roles dynamically.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Build Custom Role
        </button>
      </div>

      {/* Role Permission Matrix Card */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active System Roles</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-10 text-center text-slate-500">Loading roles...</div>
          ) : (
            roles.map((r) => {
              const rolePermKeys = r.permissions?.map((p: any) => p.permission.key) || [];
              return (
                <div key={r.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-amber-400">{r.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {r._count?.users || 0} Users Assigned
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{r.description}</p>

                  <div className="pt-3 border-t border-slate-900 flex flex-wrap gap-1.5">
                    {r.name === 'Super Admin' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        ★ FULL SYSTEM UNRESTRICTED PERMISSIONS
                      </span>
                    ) : (
                      rolePermKeys.map((key: string) => (
                        <span
                          key={key}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700"
                        >
                          {key}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Custom Role Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel max-w-xl w-full rounded-2xl border border-slate-800 p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Create Custom System Role</h3>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Senior Regional Inspector"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Describe scope of responsibilities..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-amber-400">
                  Check Allowed Permissions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 max-h-56 overflow-y-auto">
                  {allPermissions.map((p) => {
                    const checked = selectedPerms.includes(p.key);
                    return (
                      <div
                        key={p.key}
                        onClick={() => togglePerm(p.key)}
                        className={`p-2 rounded-lg cursor-pointer text-xs border transition flex items-center justify-between ${
                          checked
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        <span className="font-mono">{p.key}</span>
                        {checked && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button type="submit" className="gradient-btn flex-1 py-2.5 rounded-xl text-xs font-bold">
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
