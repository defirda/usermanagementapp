'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
};

export default function EditUserModal({ userId, isOpen, onClose }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const token = localStorage.getItem('token');
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const { name, username, role } = res.data.data;
        setFormData({ name, username, role });
      } catch (err) {
        console.error('Gagal ambil data user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, isOpen]);

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    setUpdating(true);
    try {
      const res = await axios.put(`http://localhost:3000/api/users/${userId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      alert(res.data.message || 'User berhasil diupdate');
      onClose();
    } catch (err) {
      console.error('Gagal update user:', err);
      alert('Update gagal. Cek input dan coba lagi.');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Edit Pengguna</h2>
        {loading ? (
          <p className="text-gray-400">Memuat data...</p>
        ) : (
          <div className="space-y-3">
            <input type="text" placeholder="Nama" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600" />
            <input type="text" placeholder="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600" />
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600">
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
            <button onClick={handleUpdate} disabled={updating} className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
              {updating ? 'Mengupdate...' : 'Update'}
            </button>
            <button onClick={onClose} className="text-sm text-gray-400 hover:underline mt-2">Batal</button>
          </div>
        )}
      </div>
    </div>
  );
}
