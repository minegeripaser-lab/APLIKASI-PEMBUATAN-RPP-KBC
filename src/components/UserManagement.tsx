import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  KeyRound, 
  Edit3, 
  Trash2, 
  Eye, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  RefreshCw,
  X,
  Clock,
  Mail,
  User as UserIcon,
  Shield,
  Activity
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { User, UserRole, UserStatus, UserStats } from '../types/index.ts';

interface UserManagementProps {
  currentUser: User;
}

export const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [resetModalUser, setResetModalUser] = useState<User | null>(null);
  const [tempPasswordResult, setTempPasswordResult] = useState<{ username: string; pass: string } | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null);

  // Add Form state
  const [addForm, setAddForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'GUEST' as UserRole,
    status: 'AKTIF' as UserStatus,
  });

  // Edit Form state
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    email: '',
    role: 'GUEST' as UserRole,
    status: 'AKTIF' as UserStatus,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch users & stats
  const loadData = async () => {
    try {
      setLoading(true);
      const [userList, userStats] = await Promise.all([
        api.getUsers(),
        api.getUserStats(),
      ]);
      setUsers(userList);
      setStats(userStats);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal memuat data pengguna.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (roleFilter !== 'ALL' && user.role !== roleFilter) return false;
      if (statusFilter !== 'ALL' && user.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          user.name.toLowerCase().includes(q) ||
          user.username.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, search]);

  // Handle Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (addForm.password !== addForm.confirmPassword) {
      setFormError('Konfirmasi password tidak sesuai.');
      return;
    }

    try {
      await api.createUser(addForm);
      showNotice('success', `Pengguna ${addForm.username} berhasil ditambahkan.`);
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'GUEST',
        status: 'AKTIF',
      });
      loadData();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  // Handle Open Edit
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setFormError(null);
  };

  // Handle Submit Edit
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError(null);

    try {
      await api.updateUser(editingUser.id, editForm);
      showNotice('success', `Data pengguna ${editForm.username} berhasil diperbarui.`);
      setEditingUser(null);
      loadData();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  // Handle Toggle Status (Aktif / Nonaktif)
  const handleToggleStatus = async (user: User) => {
    try {
      const res = await api.toggleUserStatus(user.id);
      showNotice(
        'success',
        `Status ${user.username} berhasil diubah menjadi ${res.data.status}.`
      );
      loadData();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async () => {
    if (!resetModalUser) return;
    try {
      const res = await api.resetPassword(resetModalUser.id);
      setTempPasswordResult({
        username: res.username,
        pass: res.temporaryPassword,
      });
      setResetModalUser(null);
      showNotice('success', `Password untuk ${res.username} berhasil direset.`);
    } catch (err: any) {
      showNotice('error', err.message);
      setResetModalUser(null);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteUser = async (permanent: boolean) => {
    if (!deleteModalUser) return;

    if (!permanent) {
      // Just deactivate
      await handleToggleStatus(deleteModalUser);
      setDeleteModalUser(null);
      return;
    }

    try {
      await api.deleteUser(deleteModalUser.id);
      showNotice('success', `Pengguna ${deleteModalUser.username} berhasil dihapus.`);
      setDeleteModalUser(null);
      loadData();
    } catch (err: any) {
      showNotice('error', err.message);
      setDeleteModalUser(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                MANAJEMEN PENGGUNA
              </h1>
              <p className="text-xs text-slate-500">
                Role-Based Access Control (RBAC) · SUPER_ADMIN & GUEST · MIN 1 Paser
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            title="Muat Ulang"
            className="p-2 text-slate-600 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ TAMBAH PENGGUNA</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-lg border flex items-center justify-between text-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CC. DASHBOARD STATISTIK MANAJEMEN PENGGUNA */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Pengguna</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">{stats.totalUsers}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase block">Pengguna Aktif</span>
            <span className="text-xl font-bold text-emerald-700 mt-0.5 block">{stats.activeUsers}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Nonaktif</span>
            <span className="text-xl font-bold text-slate-600 mt-0.5 block">{stats.inactiveUsers}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-purple-700 uppercase block">Super Admin</span>
            <span className="text-xl font-bold text-purple-700 mt-0.5 block">{stats.totalSuperAdmin}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-sky-700 uppercase block">Total Guest</span>
            <span className="text-xl font-bold text-sky-700 mt-0.5 block">{stats.totalGuest}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Login Hari Ini</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">{stats.loginToday}</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-amber-700 uppercase block">RPP Dibuat Hari Ini</span>
            <span className="text-xl font-bold text-amber-700 mt-0.5 block">{stats.rppCreatedToday}</span>
          </div>
        </div>
      )}

      {/* BS. DAFTAR PENGGUNA: Search, Filter, Tabel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama / username / email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <div>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value as 'ALL' | UserRole)}
                className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">Semua Role</option>
                <option value="SUPER_ADMIN">Role: SUPER_ADMIN</option>
                <option value="GUEST">Role: GUEST</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'ALL' | UserStatus)}
                className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">Semua Status</option>
                <option value="AKTIF">Status: AKTIF</option>
                <option value="NONAKTIF">Status: NONAKTIF</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabel Pengguna */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Terakhir Login</th>
                <th className="py-3 px-3">Dibuat</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada pengguna yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const isCurrent = user.id === currentUser.id;
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        user.status === 'NONAKTIF' ? 'bg-slate-50/40 opacity-75' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center text-xs text-slate-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-normal text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              Anda
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">
                        @{user.username}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {user.email}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-xs font-semibold ${
                            user.role === 'SUPER_ADMIN'
                              ? 'text-purple-700'
                              : 'text-sky-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-xs font-semibold flex items-center gap-1 ${
                            user.status === 'AKTIF'
                              ? 'text-emerald-700'
                              : 'text-rose-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === 'AKTIF' ? 'bg-emerald-600' : 'bg-rose-500'
                            }`}
                          />
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-500">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* [Detail] */}
                          <button
                            type="button"
                            onClick={() => setDetailUser(user)}
                            title="Detail Pengguna"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* [Edit] */}
                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            title="Edit Profil Pengguna"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* [Reset Password] */}
                          <button
                            type="button"
                            onClick={() => setResetModalUser(user)}
                            title="Reset Password Pengguna"
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* [Aktif/Nonaktif] */}
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(user)}
                              title={user.status === 'AKTIF' ? 'Nonaktifkan Pengguna' : 'Aktifkan Pengguna'}
                              className={`p-1.5 rounded transition-colors ${
                                user.status === 'AKTIF'
                                  ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                  : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                              }`}
                            >
                              {user.status === 'AKTIF' ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* [Hapus] */}
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => setDeleteModalUser(user)}
                              title="Hapus Pengguna"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BU. TAMBAH PENGGUNA MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-bold text-base">Tambah Pengguna Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Contoh: Siti Rahmah, S.Pd.I."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.username}
                    onChange={e => setAddForm({ ...addForm, username: e.target.value })}
                    placeholder="Contoh: sitirahmah"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="nama@min1paser.sch.id"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={addForm.password}
                    onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Konfirmasi Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={addForm.confirmPassword}
                    onChange={e => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                    placeholder="Ulangi password"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addForm.role}
                    onChange={e => setAddForm({ ...addForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  >
                    <option value="GUEST">GUEST (Guru/Tamu)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addForm.status}
                    onChange={e => setAddForm({ ...addForm, status: e.target.value as UserStatus })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BW. EDIT PENGGUNA MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Edit Pengguna: {editingUser.username}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={e => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  >
                    <option value="GUEST">GUEST (Guru/Tamu)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value as UserStatus })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <Lock className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong>Kata sandi tidak ditampilkan untuk alasan keamanan.</strong>
                  <p className="mt-0.5 text-slate-600">
                    Gunakan tombol <strong>Reset Password</strong> jika ingin memberikan kata sandi baru kepada pengguna ini.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BX. RESET PASSWORD CONFIRMATION MODAL */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 mb-1">
              Reset password pengguna?
            </h3>
            <p className="text-xs text-center text-slate-600 mb-6">
              Sistem akan membuat kata sandi sementara yang aman untuk akun{' '}
              <strong className="text-slate-900 font-semibold">{resetModalUser.name}</strong> (@{resetModalUser.username}).
              Password lama tidak akan ditampilkan.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEMPORARY PASSWORD DISPLAY MODAL */}
      {tempPasswordResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 mb-1">
              Password Berhasil Direset!
            </h3>
            <p className="text-xs text-center text-slate-600 mb-4">
              Salin password sementara berikut dan berikan kepada pengguna{' '}
              <strong>@{tempPasswordResult.username}</strong>:
            </p>

            <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between mb-4">
              <span className="font-mono text-base font-bold text-emerald-800">
                {tempPasswordResult.pass}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(tempPasswordResult.pass)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center mb-5">
              Simpan dan catat kata sandi ini sekarang. Password ini tidak dapat ditampilkan kembali setelah modal ditutup.
            </p>

            <button
              type="button"
              onClick={() => setTempPasswordResult(null)}
              className="w-full px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-black rounded-lg transition-colors"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      )}

      {/* BZ. HAPUS PENGGUNA MODAL */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 mb-1">
              Hapus pengguna?
            </h3>
            <p className="text-xs text-center text-slate-600 mb-4">
              Perhatian: data pengguna mungkin memiliki dokumen RPP terkait di sistem.
            </p>

            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 mb-6">
              <p className="font-semibold">Aturan Kebijakan:</p>
              <p className="mt-0.5">
                Jika pengguna memiliki dokumen RPP, penghapusan permanen tidak diperbolehkan demi integritas arsip madrasah. Disarankan untuk menonaktifkan pengguna saja.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleDeleteUser(false)}
                className="w-full px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Nonaktifkan Saja (Direkomendasikan)
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(true)}
                className="w-full px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Hapus Permanen
              </button>
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="w-full px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-base text-slate-900">Profil Pengguna</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">User ID</span>
                <span className="font-mono text-slate-800">{detailUser.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Nama Lengkap</span>
                <span className="font-semibold text-slate-900">{detailUser.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Username</span>
                <span className="font-mono text-slate-800">@{detailUser.username}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Email</span>
                <span className="text-slate-800">{detailUser.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Role</span>
                <span className="font-bold text-emerald-700">{detailUser.role}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Status</span>
                <span className={detailUser.status === 'AKTIF' ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>
                  {detailUser.status}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Terakhir Login</span>
                <span className="text-slate-800">
                  {detailUser.lastLogin ? new Date(detailUser.lastLogin).toLocaleString('id-ID') : 'Belum pernah login'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tanggal Dibuat</span>
                <span className="text-slate-800">{new Date(detailUser.createdAt).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
