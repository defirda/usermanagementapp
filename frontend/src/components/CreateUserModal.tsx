'use client';

import { useState } from 'react';
import axios from 'axios';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateUserModal({ isOpen, onClose }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirm_password: '',
    role: 'user',
  });
  const [creating, setCreating] = useState(false);

  const handleCreateUser = async () => {
    const token = localStorage.getItem('token');
    setCreating(true);
    try {
      const res = await axios.post('http://localhost:3000/api/users', formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      alert(res.data.message || 'User berhasil dibuat');
      onClose();
    } catch (err) {
      console.error('Gagal membuat user:', err);
      alert('Gagal membuat user. Cek input dan coba lagi.');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Tambah Pengguna</h2>
        <div className="space-y-3">
          <input type="text" placeholder="Nama" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600" />
          <input type="text" placeholder="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600" />
          <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600" />
          <input type="password" placeholder="Konfirmasi Password" value={formData.confirm_password} onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })} className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600" />
          <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600">
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </select>
          <button onClick={handleCreateUser} disabled={creating} className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
            {creating ? 'Membuat...' : 'Submit'}
          </button>
          <button onClick={onClose} className="text-sm text-gray-400 hover:underline mt-2">Batal</button>
        </div>
      </div>
    </div>
  );
}
