// src/utils/logout.ts
import axios from 'axios';

export const logout = async (): Promise<boolean> => {
  const token = localStorage.getItem('token');

    // localStorage.removeItem('token');
    //   localStorage.removeItem('user');
    //   localStorage.removeItem('token_expiry');
    //   return true;
  try {
    const res = await axios.post(
      'http://localhost:3000/api/auth/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true, // penting agar cookie dikirim
      }
    );

    // Validasi respons sukses
    if (res.status === 200) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_expiry');
      return true;
    } else {
      console.warn('Logout gagal: status tidak 200');
      return false;
    }
  } catch (err: unknown) {
    console.error('Logout error');
    return false;
  }
};
