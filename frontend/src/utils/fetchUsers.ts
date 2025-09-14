import axios from 'axios';

type Params = {
  token: string;
  role: string;
  page?: number;
  limit?: number;
  q?: string;
  roleFilter?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
};

export const fetchUsers = async ({
  token,
  role,
  page = 1,
  limit = 10,
  q = '',
  roleFilter = '',
  sortBy = 'createdAt',
  sortDir = 'desc',
}: Params) => {
  try {
    const res = await axios.get('http://localhost:3000/api/users', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q,
        role: roleFilter,
        sortBy,
        sortDir,
        page,
        limit,
      },
      withCredentials: true,
    });

    const { data: responseData } = res.data;
    const data = role === 'admin' ? responseData.data : [responseData.data.find((u: any) => u.role === role)];
    return {
      users: data,
      totalPages: responseData.metadata.totalPage || 1,
    };
  } catch (err) {
    console.error('Gagal fetch users:', err);
    return { users: [], totalPages: 1 };
  }
};
