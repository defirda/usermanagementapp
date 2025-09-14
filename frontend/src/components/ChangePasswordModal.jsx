'use client';

import { useState } from 'react';
import axios from 'axios';

export default function ChangePasswordModal({ userId, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await axios.put(`http://localhost:3000/api/users/${userId}/password`, formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      alert(res.data.message || 'Password berhasil diubah');
      onClose();
    } catch (err) {
      console.error('Gagal ubah password:', err);
      alert('Gagal ubah password. Cek input dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Ubah Password</h2>
        <div className="space-y-3">
          <input
            type="password"
            placeholder="Password baru"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600"
          />
          <input
            type="password"
            placeholder="Konfirmasi password"
            value={formData.confirm_password}
            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600"
          />
          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            {loading ? 'Mengubah...' : 'Ubah Password'}
          </button>
          <button onClick={onClose} className="text-sm text-gray-400 hover:underline mt-2">Batal</button>
        </div>
      </div>
    </div>
  );
}
