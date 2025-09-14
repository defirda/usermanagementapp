'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: string;
};

type UserDetail = {
  id: number;
  name: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export default function DetailUserModal({ userId, isOpen, onClose, currentUserRole }: Props) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const token = localStorage.getItem('token');
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUser(res.data.data);
      } catch (err) {
        console.error('Gagal ambil detail user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [userId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Detail Pengguna</h2>
        {loading || !user ? (
          <p className="text-gray-400">Memuat data...</p>
        ) : (
          <div className="space-y-2">
            <p><span className="text-gray-400">Nama:</span> {user.name}</p>
            <p><span className="text-gray-400">Username:</span> @{user.username}</p>
            <p><span className="text-gray-400">Role:</span> {user.role}</p>
            <p><span className="text-gray-400">Dibuat:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
            <p><span className="text-gray-400">Diupdate:</span> {new Date(user.updatedAt).toLocaleDateString()}</p>

            {currentUserRole === 'admin' && (
              <button
                onClick={() => alert('Fitur edit belum dibuat')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                Ubah Data
              </button>
            )}
          </div>
        )}
        <button onClick={onClose} className="mt-6 text-sm text-gray-400 hover:underline">
          Tutup
        </button>
      </div>
    </div>
  );
}
