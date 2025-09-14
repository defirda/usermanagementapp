'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { logout } from '@/utils/logout';
import DetailUserModal from '@/components/DetailUserModal';
import CreateUserModal from '@/components/CreateUserModal';
import EditUserModal from '@/components/EditUserModal';
import ChangePasswordModal from '@/components/ChangePasswordModal';

type User = {
  id: number;
  username: string;
  name: string;
  role: string;
  createdAt: string;
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // hanlde update user
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);

    const openEditModal = (id: number) => {
    setEditingUserId(id);
    setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
    setEditingUserId(null);
    setIsEditModalOpen(false);
    };

    // handle update password
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordUserId, setPasswordUserId] = useState(null);

    const openPasswordModal = (id : number) => {
    setPasswordUserId(id);
    setIsPasswordModalOpen(true);
    };

    const closePasswordModal = () => {
    setPasswordUserId(null);
    setIsPasswordModalOpen(false);
    };

    // handle delete
    const handleDeleteUser = async (id : number) => {
        const token = localStorage.getItem('token');
        const konfirmasi = confirm('Yakin ingin menghapus user ini?');
        if (!konfirmasi) return;

        try {
            await axios.delete(`http://localhost:3000/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
            });
            alert('User berhasil dihapus');
        } catch (err) {
            console.error('Gagal hapus user:', err);
            alert('Gagal menghapus user. Coba lagi nanti.');
        }
    };



  const handleLogout = async () => {
    const success = await logout();
    if (success) router.push('/login');
    else alert('Logout gagal. Silakan coba lagi.');
  };

  const openDetailModal = (id: number) => {
    setSelectedUserId(id);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedUserId(null);
    setIsDetailModalOpen(false);
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const handleExportCSV = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:3000/api/users/export/csv', {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: search, role: roleFilter, sortBy, sortDir, page, limit },
        responseType: 'blob',
        withCredentials: true,
      });

      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Gagal export CSV:', err);
      alert('Export gagal. Silakan coba lagi.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setCurrentUser(parsedUser);

    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/users', {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: search, role: roleFilter, sortBy, sortDir, page, limit },
          withCredentials: true,
        });

        const { data: responseData } = res.data;
        const data = parsedUser.role === 'admin' ? responseData.data : [parsedUser];
        setUsers(data);
        setTotalPages(responseData.metadata.totalPage || 1);
      } catch (err) {
        console.error('Gagal mengambil data user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [search, roleFilter, sortBy, sortDir, page, limit, router]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, sortBy, sortDir]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Dashboard Pengguna</h1>
        <div className="flex flex-col items-end gap-2">
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
            Logout
          </button>
          {currentUser?.role === 'admin' && (
            <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
              Create User
            </button>
          )}
          <button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
            Export CSV
          </button>
          {currentUser && (
            <p className="text-sm text-gray-300">
              Login sebagai: <span className="font-semibold text-white">@{currentUser.username}</span> ({currentUser.role})
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <input type="text" placeholder="Cari nama atau username..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600">
          <option value="">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="editor">Editor</option>
        </select>
        <div className="flex gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full">
            <option value="username">Sort by Username</option>
            <option value="name">Sort by Name</option>
            <option value="role">Sort by Role</option>
            <option value="createdAt">Sort by Created Date</option>
            <option value="updatedAt">Sort by Updated Date</option>
          </select>
          <select value={sortDir} onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')} className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full">
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Memuat data...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-gray-800 text-white">
            <thead className="bg-gray-700 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Dibuat</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-700 transition">
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">@{user.username}</td>
                  <td className="px-4 py-3 capitalize">{user.role}</td>
                  <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">

                    <td className="px-4 py-3 space-x-2">
                    <button onClick={() => openDetailModal(user.id)} className="text-blue-400 hover:underline text-sm">
                        Detail
                    </button>
                   {currentUser?.role === 'admin' && (
                    <>
                        <button onClick={() => openEditModal(user.id)} className="text-yellow-400 hover:underline text-sm">
                        Edit
                        </button>
                        <button onClick={() => openPasswordModal(user.id)} className="text-red-400 hover:underline text-sm">
                        Ubah Password
                        </button>
                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:underline text-sm">
                        Delete
                        </button>
                    </>
                    )}

                    {currentUser?.id === user.id && currentUser?.role !== 'admin' && (
                        <button onClick={() => openPasswordModal(user.id)} className="text-red-400 hover:underline text-sm">
                        Ganti Password
                        </button>
                    )}
                    </td>

                    {isEditModalOpen && editingUserId && (
                    <EditUserModal
                        userId={editingUserId}
                        isOpen={isEditModalOpen}
                        onClose={closeEditModal}
                    />
                    )}
                    {isPasswordModalOpen && passwordUserId && (
                    <ChangePasswordModal
                        userId={passwordUserId}
                        isOpen={isPasswordModalOpen}
                        onClose={closePasswordModal}
                    />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination & Limit Control */}
      <div className="mt-6 flex flex-wrap gap-4 items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>Halaman {page} dari {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
        >
          Next
        </button>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={page}
          onChange={(e) => setPage(Number(e.target.value))}
          className="px-3 py-2 w-20 bg-gray-800 text-white border border-gray-600 rounded"
        />
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded"
        >
          <option value={5}>5 / halaman</option>
          <option value={10}>10 / halaman</option>
          <option value={25}>25 / halaman</option>
          <option value={50}>50 / halaman</option>
        </select>
      </div>

      {/* Modal Detail User */}
      {selectedUserId && isDetailModalOpen && (
        <DetailUserModal
          userId={selectedUserId}
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
          currentUserRole={currentUser?.role || ''}
        />
      )}

      {/* Modal Create User */}
      {isCreateModalOpen && (
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
        />
      )}
    </div>
  );
}

              
