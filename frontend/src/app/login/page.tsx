// src/app/login/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '@/utils/loginSchema';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type LoginFormInputs = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema),
  });

  const router = useRouter();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', data, {
        withCredentials: true,
      });
      const { token, user, expiredAt } = res.data.data;

       localStorage.setItem('token', token);
       localStorage.setItem('user', JSON.stringify(user));
       localStorage.setItem('token_expiry', expiredAt);

        // Redirect ke halaman utama
        router.push('/users');
    } catch (err: unknown) {
      console.error('Login gagal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-950 p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Login</h2>
        <h3 className="text-2xl font-bold mb-6 text-center text-white">User Management App</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            {...register('username')}
            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            {...register('password')}
            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Login
        </button>
      </form>
    </div>
  );
}
